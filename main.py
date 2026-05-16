from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Literal
from supabase import create_client, Client
import asyncio
import httpx
import re
import os
from datetime import date
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL   = os.getenv("SUPABASE_URL")
SUPABASE_KEY   = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
NOVAVISION_URL = os.getenv("NOVAVISION_API_URL", "http://localhost:8001")
PUQAI_ENDPOINT = os.getenv("PUQAI_SYNC_ENDPOINT")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def parse_puqai_response(data: dict) -> str:
    """PUQ.ai'nin farklı yanıt formatlarını sağlam şekilde parse eder."""
    # Format 1: data["data"] string ve içinde "content": ... var
    if isinstance(data.get("data"), str):
        raw = data["data"]
        match = re.search(r'"content"\s*:\s*([\s\S]*?)\s*}?\s*$', raw)
        if match:
            extracted = match.group(1).strip().rstrip("}").strip()
            if extracted.startswith('"') and extracted.endswith('"'):
                extracted = extracted[1:-1]
            if extracted:
                return extracted
        if raw.strip():
            return raw.strip()

    # Format 2: data["data"] dict
    if isinstance(data.get("data"), dict):
        for key in ("content", "response", "output", "message", "text"):
            if data["data"].get(key):
                return str(data["data"][key])

    # Format 3: üst seviye alanlar
    for key in ("content", "response", "output", "message", "text", "result"):
        if data.get(key):
            return str(data[key])

    return f"BİLİNMEYEN FORMAT: {str(data)}"

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


class VitalsCreate(BaseModel):
    patient_id: str
    visit_id: str | None = None
    heart_rate: int | None = None
    temperature: float | None = None
    o2_saturation: int | None = None


class LesionMeasurementCreate(BaseModel):
    patient_id: str
    visit_id: str | None = None
    size_mm: float
    region: str | None = None


class LabResultCreate(BaseModel):
    patient_id: str
    visit_id: str | None = None
    test_name: str
    value: float
    unit: str | None = None
    ref_range: str | None = None
    flag: Literal["normal", "high", "low"] = "normal"
    trend: Literal["stable", "up", "down"] = "stable"


class AnalyzeRequest(BaseModel):
    patient_id: str
    image_url: str
    complaint: str | None = None
    visit_id: str | None = None


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    patient_id: str
    message: str
    history: list[ChatMessage] = []


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
    try:
        res = supabase.table("patients").select("*").eq("id", patient_id).single().execute()
        return res.data
    except Exception:
        raise HTTPException(404, "Patient not found")


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


# ── Appointments ──────────────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    patient_id: str
    appointment_date: str
    type: str = "Kontrol"
    notes: str | None = None
    status: str = "scheduled"


class AppointmentUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None


@app.get("/appointments")
def list_appointments():
    res = (
        supabase.table("appointments")
        .select("*, patients(full_name, gender)")
        .order("appointment_date", desc=False)
        .execute()
    )
    return res.data


@app.post("/appointments", status_code=201)
def create_appointment(body: AppointmentCreate):
    res = supabase.table("appointments").insert(body.model_dump(exclude_none=True)).execute()
    return res.data[0]


@app.patch("/appointments/{appointment_id}")
def update_appointment(appointment_id: str, body: AppointmentUpdate):
    data = body.model_dump(exclude_none=True)
    if not data:
        raise HTTPException(400, "No fields to update")
    res = supabase.table("appointments").update(data).eq("id", appointment_id).execute()
    return res.data[0]


# ── Archive ────────────────────────────────────────────────────────────────────

@app.get("/archive")
def get_archive():
    res = (
        supabase.table("analysis_results")
        .select("*, patients(id, full_name, gender, birth_date), ai_reports(report_text)")
        .order("analyzed_at", desc=True)
        .execute()
    )
    return res.data


# ── Vitals ────────────────────────────────────────────────────────────────────

@app.get("/patients/{patient_id}/vitals")
def list_vitals(patient_id: str):
    res = (
        supabase.table("vitals")
        .select("*")
        .eq("patient_id", patient_id)
        .order("recorded_at", desc=False)
        .execute()
    )
    return res.data


@app.post("/vitals", status_code=201)
def create_vital(body: VitalsCreate):
    res = supabase.table("vitals").insert(body.model_dump(exclude_none=True)).execute()
    return res.data[0]


# ── Lesion Measurements ────────────────────────────────────────────────────────

@app.get("/patients/{patient_id}/lesion-measurements")
def list_lesion_measurements(patient_id: str):
    res = (
        supabase.table("lesion_measurements")
        .select("*")
        .eq("patient_id", patient_id)
        .order("measured_at", desc=False)
        .execute()
    )
    return res.data


@app.post("/lesion-measurements", status_code=201)
def create_lesion_measurement(body: LesionMeasurementCreate):
    res = supabase.table("lesion_measurements").insert(body.model_dump(exclude_none=True)).execute()
    return res.data[0]


# ── Lab Results ───────────────────────────────────────────────────────────────

@app.get("/patients/{patient_id}/lab-results")
def list_lab_results(patient_id: str):
    res = (
        supabase.table("lab_results")
        .select("*")
        .eq("patient_id", patient_id)
        .order("recorded_at", desc=True)
        .execute()
    )
    return res.data


@app.post("/lab-results", status_code=201)
def create_lab_result(body: LabResultCreate):
    res = supabase.table("lab_results").insert(body.model_dump(exclude_none=True)).execute()
    return res.data[0]


# ── Yardımcı fonksiyonlar ─────────────────────────────────────────────────────

def calc_age(birth_date: str | None) -> str:
    if not birth_date:
        return "?"
    try:
        bd    = date.fromisoformat(birth_date[:10])
        today = date.today()
        age   = today.year - bd.year - ((today.month, today.day) < (bd.month, bd.day))
        return str(age)
    except Exception:
        return "?"


async def get_latest_disease(patient_id: str) -> str:
    """Hastanın en son analiz sonucundaki hastalık adını döner."""
    loop = asyncio.get_event_loop()
    res = await loop.run_in_executor(
        None,
        lambda: supabase.table("analysis_results")
            .select("disease_name")
            .eq("patient_id", patient_id)
            .order("analyzed_at", desc=True)
            .limit(1)
            .execute()
    )
    return res.data[0]["disease_name"] if res.data else "Bilinmiyor"


def build_puq_payload(patient_name: str, disease: str, message: str) -> dict:
    """PUQ.ai workflow'unun beklediği fields: patient_name, disease, message."""
    return {
        "patient_name": patient_name,
        "disease":      disease,
        "message":      message,
    }


# ── Analysis (NovaVision → Supabase → PUQ.ai) ────────────────────────────────

@app.post("/analyze")
async def analyze(body: AnalyzeRequest):
    # 1. Visit oluştur ya da mevcut kullan
    if body.visit_id:
        visit_id = body.visit_id
    else:
        visit_res = supabase.table("visits").insert({
            "patient_id": body.patient_id,
            "complaint":  body.complaint or "Görüntü analizi",
        }).execute()
        visit_id = visit_res.data[0]["id"]

    # 2. NovaVision YOLO — başarısızsa mock, is_mock bayrağı koy
    is_mock = False
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            nv_resp = await client.post(
                f"{NOVAVISION_URL}/predict",
                json={"image_url": body.image_url},
            )
            nv_resp.raise_for_status()
            nv_data = nv_resp.json()
        except Exception:
            nv_data  = {"disease": "Melanoma", "score": 0.87}
            is_mock  = True

    disease_name = nv_data.get("disease", "Unknown")
    confidence   = nv_data.get("score", 0.0)

    # 3. Analiz sonucunu kaydet
    ar = supabase.table("analysis_results").insert({
        "visit_id":     visit_id,
        "patient_id":   body.patient_id,
        "disease_name": disease_name,
        "confidence":   confidence,
        "image_url":    body.image_url,
        "raw_response": {**nv_data, "is_mock": is_mock},
    }).execute()
    analysis_id = ar.data[0]["id"]

    # 4. Hasta adını çek
    loop   = asyncio.get_event_loop()
    pt_res = await loop.run_in_executor(
        None, lambda: supabase.table("patients").select("full_name").eq("id", body.patient_id).single().execute()
    )
    patient_name = (pt_res.data or {}).get("full_name", "Bilinmiyor")

    # 5. Payload oluştur
    puq_payload = build_puq_payload(
        patient_name=patient_name,
        disease=disease_name,
        message=f"Yeni görüntü analizi tamamlandı. {disease_name} tespit edildi (%{round(confidence*100)} güven). Klinik bulgular ve öneriler için detaylı rapor hazırla.",
    )
    if is_mock:
        puq_payload["is_mock"] = True

    # 6. PUQ.ai raporu
    report_text = ""
    async with httpx.AsyncClient(timeout=60) as client:
        try:
            puq_resp = await client.post(
                PUQAI_ENDPOINT,
                json=puq_payload,
                headers={"Content-Type": "application/json"},
            )
            puq_resp.raise_for_status()
            report_text = parse_puqai_response(puq_resp.json())
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
        "is_mock":     is_mock,
    }


# ── Chat (PUQ.ai serbest soru) ────────────────────────────────────────────────

@app.post("/chat")
async def chat(body: ChatRequest):
    loop = asyncio.get_event_loop()
    pt_task      = loop.run_in_executor(
        None, lambda: supabase.table("patients").select("full_name").eq("id", body.patient_id).single().execute()
    )
    disease_task = get_latest_disease(body.patient_id)
    pt_res, disease = await asyncio.gather(pt_task, disease_task)

    patient_name = (pt_res.data or {}).get("full_name", "Bilinmiyor")
    puq_payload  = build_puq_payload(
        patient_name=patient_name,
        disease=disease,
        message=body.message,
    )

    async with httpx.AsyncClient(timeout=60) as client:
        try:
            puq_resp = await client.post(
                PUQAI_ENDPOINT,
                json=puq_payload,
                headers={"Content-Type": "application/json"},
            )
            puq_resp.raise_for_status()
            reply = parse_puqai_response(puq_resp.json())
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
