from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from supabase import create_client, Client
import httpx
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL   = os.getenv("SUPABASE_URL")
SUPABASE_KEY   = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
NOVAVISION_URL = os.getenv("NOVAVISION_API_URL", "http://localhost:8001")
PUQAI_ENDPOINT = os.getenv("PUQAI_SYNC_ENDPOINT")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="DermaPanel Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DIST = Path(__file__).parent / "dist"


# ── Models ────────────────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    tc_no: str
    full_name: str
    birth_date: str | None = None
    gender: str | None = None
    phone: str | None = None
    email: str | None = None


class VisitCreate(BaseModel):
    patient_id: str
    complaint: str | None = None
    notes: str | None = None
    doctor_id: str | None = None


class VisitUpdate(BaseModel):
    complaint: str | None = None
    notes: str | None = None


class PrescriptionCreate(BaseModel):
    patient_id: str
    diagnosis: str
    drugs: list
    status: str = "active"


class AnalyzeRequest(BaseModel):
    patient_id: str
    image_url: str
    complaint: str | None = None
    visit_id: str | None = None  # mevcut ziyarete bağla; yoksa otomatik oluşturulur


class ChatRequest(BaseModel):
    patient_id: str
    message: str


# ── Patients ──────────────────────────────────────────────────────────────────

@app.get("/patients")
def list_patients():
    res = supabase.table("patients").select("*").order("created_at", desc=True).execute()
    return res.data


@app.post("/patients", status_code=201)
def create_patient(body: PatientCreate):
    res = supabase.table("patients").insert(body.model_dump(exclude_none=True)).execute()
    return res.data[0]


@app.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    res = supabase.table("patients").select("*").eq("id", patient_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Patient not found")
    return res.data


@app.delete("/patients/{patient_id}", status_code=204)
def delete_patient(patient_id: str):
    supabase.table("patients").delete().eq("id", patient_id).execute()


# ── Visits ────────────────────────────────────────────────────────────────────

@app.get("/patients/{patient_id}/visits")
def list_visits(patient_id: str):
    res = (
        supabase.table("visits")
        .select("*, analysis_results(id, disease_name, confidence, analyzed_at)")
        .eq("patient_id", patient_id)
        .order("visit_date", desc=True)
        .execute()
    )
    return res.data


@app.post("/visits", status_code=201)
def create_visit(body: VisitCreate):
    res = supabase.table("visits").insert(body.model_dump(exclude_none=True)).execute()
    return res.data[0]


@app.patch("/visits/{visit_id}")
def update_visit(visit_id: str, body: VisitUpdate):
    data = body.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(400, "No fields to update")
    res = supabase.table("visits").update(data).eq("id", visit_id).execute()
    if not res.data:
        raise HTTPException(404, "Visit not found")
    return res.data[0]


# ── Prescriptions ─────────────────────────────────────────────────────────────

@app.get("/patients/{patient_id}/prescriptions")
def list_prescriptions(patient_id: str):
    res = supabase.table("prescriptions").select("*").eq("patient_id", patient_id).order("created_at", desc=True).execute()
    return res.data


@app.post("/prescriptions", status_code=201)
def create_prescription(body: PrescriptionCreate):
    res = supabase.table("prescriptions").insert({
        "patient_id": body.patient_id,
        "diagnosis":  body.diagnosis,
        "drugs":      body.drugs,
        "status":     body.status,
    }).execute()
    return res.data[0]


@app.patch("/prescriptions/{prescription_id}")
def update_prescription_status(prescription_id: str, status: str):
    res = supabase.table("prescriptions").update({"status": status}).eq("id", prescription_id).execute()
    return res.data[0]


# ── Analysis (NovaVision → Supabase → PUQ.ai) ────────────────────────────────

@app.post("/analyze")
async def analyze(body: AnalyzeRequest):
    # 1. Mevcut visit kullan ya da yeni oluştur
    if body.visit_id:
        visit_id = body.visit_id
    else:
        visit_res = supabase.table("visits").insert({
            "patient_id": body.patient_id,
            "complaint":  body.complaint or "Görüntü analizi",
        }).execute()
        visit_id = visit_res.data[0]["id"]

    # 2. NovaVision YOLO (mock fallback)
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            nv_resp = await client.post(
                f"{NOVAVISION_URL}/predict",
                json={"image_url": body.image_url},
            )
            nv_resp.raise_for_status()
            nv_data = nv_resp.json()
        except Exception:
            nv_data = {"disease": "Melanoma (mock)", "score": 0.87}

    disease_name = nv_data.get("disease", "Unknown")
    confidence   = nv_data.get("score", 0.0)

    # 3. Analiz sonucunu kaydet
    ar = supabase.table("analysis_results").insert({
        "visit_id":     visit_id,
        "patient_id":   body.patient_id,
        "disease_name": disease_name,
        "confidence":   confidence,
        "image_url":    body.image_url,
        "raw_response": nv_data,
    }).execute()
    analysis_id = ar.data[0]["id"]

    # 4. Hasta bilgisi
    pt = supabase.table("patients").select("*").eq("id", body.patient_id).single().execute()
    patient = pt.data or {}

    # 5. PUQ.ai raporu
    puq_payload = {
        "patient_id":   body.patient_id,
        "patient_name": patient.get("full_name", "Bilinmiyor"),
        "analysis_id":  analysis_id,
        "disease":      disease_name,
        "confidence":   confidence,
        "image_url":    body.image_url,
    }

    report_text = ""
    async with httpx.AsyncClient(timeout=60) as client:
        try:
            puq_resp = await client.post(PUQAI_ENDPOINT, params=puq_payload)
            puq_resp.raise_for_status()
            puq_data = puq_resp.json()
            report_text = (
                puq_data.get("content") or
                puq_data.get("response") or
                puq_data.get("output") or
                str(puq_data)
            )
        except Exception as e:
            report_text = f"PUQ.ai bağlantı hatası: {e}"

    if not report_text or report_text in ("null", "None", ""):
        report_text = "PUQ.ai rapor oluşturamadı."

    supabase.table("ai_reports").insert({
        "analysis_id": analysis_id,
        "patient_id":  body.patient_id,
        "report_text": report_text,
    }).execute()

    return {
        "analysis_id": analysis_id,
        "visit_id":    visit_id,
        "disease":     disease_name,
        "confidence":  confidence,
        "report":      report_text,
    }


# ── Chat (PUQ.ai serbest soru) ────────────────────────────────────────────────

@app.post("/chat")
async def chat(body: ChatRequest):
    # Hasta bilgisi
    pt = supabase.table("patients").select("*").eq("id", body.patient_id).single().execute()
    patient = pt.data or {}
    birth = patient.get("birth_date")
    age = ""
    if birth:
        from datetime import date
        try:
            by = int(birth[:4])
            age = f"{date.today().year - by} yaş, "
        except Exception:
            pass

    # Son 3 ziyaret notu
    visits_res = supabase.table("visits") \
        .select("complaint, notes, visit_date") \
        .eq("patient_id", body.patient_id) \
        .order("visit_date", desc=True) \
        .limit(3) \
        .execute()
    visits = visits_res.data or []

    # Son 3 analiz sonucu
    history_res = supabase.table("analysis_results") \
        .select("disease_name, confidence, analyzed_at") \
        .eq("patient_id", body.patient_id) \
        .order("analyzed_at", desc=True) \
        .limit(3) \
        .execute()
    analyses = history_res.data or []

    # Zengin bağlam oluştur
    context_lines = [
        f"HASTA: {patient.get('full_name', 'Bilinmiyor')} ({age}{patient.get('gender', '')})",
    ]

    if analyses:
        context_lines.append("\nANALİZ GEÇMİŞİ:")
        for a in analyses:
            conf = round((a.get("confidence") or 0) * 100)
            tarih = a["analyzed_at"][:10]
            context_lines.append(f"  - {tarih}: {a['disease_name']} (güven %{conf})")

    if visits:
        context_lines.append("\nZİYARET NOTLARI:")
        for v in visits:
            tarih = v["visit_date"][:10]
            complaint = v.get("complaint") or ""
            notes = v.get("notes") or ""
            context_lines.append(f"  - {tarih} | Şikayet: {complaint}")
            if notes:
                context_lines.append(f"    Bulgular: {notes}")

    context_lines.append(f"\nDOKTOR SORUSU: {body.message}")
    full_question = "\n".join(context_lines)

    latest = analyses[0] if analyses else None
    puq_payload = {
        "patient_id":   body.patient_id,
        "patient_name": patient.get("full_name", "Bilinmiyor"),
        "question":     full_question,
        "type":         "chat",
        "disease":      latest["disease_name"] if latest else "Bilinmiyor",
        "confidence":   latest["confidence"]   if latest else 0,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        try:
            puq_resp = await client.post(PUQAI_ENDPOINT, params=puq_payload)
            puq_resp.raise_for_status()
            puq_data = puq_resp.json()
            reply = (
                puq_data.get("content") or
                puq_data.get("response") or
                puq_data.get("output") or
                str(puq_data)
            )
        except Exception as e:
            reply = f"PUQ.ai bağlantı hatası: {e}"

    if not reply or reply in ("null", "None", ""):
        reply = "PUQ.ai yanıt oluşturamadı."

    return {"reply": reply}


# ── History ───────────────────────────────────────────────────────────────────

@app.get("/patients/{patient_id}/history")
def patient_history(patient_id: str):
    res = (
        supabase.table("analysis_results")
        .select("*, ai_reports(*)")
        .eq("patient_id", patient_id)
        .order("analyzed_at", desc=True)
        .execute()
    )
    return res.data


# ── Frontend (SPA) ─────────────────────────────────────────────────────────────

if DIST.exists():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        return FileResponse(DIST / "index.html")
