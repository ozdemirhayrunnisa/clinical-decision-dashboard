import React, { useState, useRef, useEffect } from "react";
import {
  Users, Calendar, Archive, Settings, Search, Bell, ChevronDown,
  Activity, AlertTriangle, ShieldCheck, Flame, Maximize2,
  Send, Sparkles, FileSignature, Pill, FileDown, MoreHorizontal,
  Heart, Thermometer, TrendingUp, Clock, CheckCircle2,
  Stethoscope, Eye, EyeOff, ZoomIn, MessageSquare, Plus, Layers,
  LogOut, X, Image as ImageIcon, FlaskConical, FileText,
  Download, Printer, Trash2, ChevronRight, Check, Loader2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Area, AreaChart, CartesianGrid
} from "recharts";

const API = "http://localhost:8000";

const C = {
  bg:"#13131f", surface:"#1c1c2e", surfaceAlt:"#22223a",
  border:"#2d2d44", borderSoft:"#252538", primary:"#8b5cf6",
  primaryDim:"#7c3aed", accent:"#22d3ee", accentDim:"#0891b2",
  rose:"#f43f5e", amber:"#f59e0b", emerald:"#10b981",
  textHi:"#f4f4f5", textMid:"#a1a1aa", textLo:"#71717a",
};

const PATIENTS_MOCK = [
  { id:"PT-2041", name:"M. Yıldız",  age:54, sex:"K", status:"critical", lastVisit:"Bugün",        initials:"MY" },
  { id:"PT-2039", name:"A. Demir",   age:38, sex:"E", status:"monitor",  lastVisit:"Dün",           initials:"AD" },
  { id:"PT-2033", name:"S. Kaya",    age:62, sex:"E", status:"stable",   lastVisit:"3 gün önce",    initials:"SK" },
  { id:"PT-2028", name:"E. Aksoy",   age:29, sex:"K", status:"stable",   lastVisit:"1 hafta önce",  initials:"EA" },
  { id:"PT-2019", name:"B. Çelik",   age:47, sex:"K", status:"monitor",  lastVisit:"2 hafta önce",  initials:"BÇ" },
  { id:"PT-2014", name:"K. Öztürk",  age:71, sex:"E", status:"stable",   lastVisit:"3 hafta önce",  initials:"KÖ" },
];

const TIMELINE = [
  { date:"12 Mar 2025", title:"İlk Konsültasyon",    diagnosis:"Atipik nevüs şüphesi",        recovery:0,  state:"past"    },
  { date:"04 Nis 2025", title:"Dermoskopi+Biyopsi",  diagnosis:"Melanositik lezyon (benign)", recovery:22, state:"past"    },
  { date:"18 May 2025", title:"Eksizyonel Çıkarım",  diagnosis:"Cerrahi sınır temiz",         recovery:58, state:"past"    },
  { date:"09 Tem 2025", title:"1. Kontrol",           diagnosis:"Yara iyileşmesi normal",     recovery:74, state:"past"    },
  { date:"14 Eki 2025", title:"3 Aylık Takip",        diagnosis:"Yeni odak — sol omuz",       recovery:81, state:"past"    },
  { date:"Bugün",       title:"Acil Değerlendirme",   diagnosis:"ABCDE skor artışı",          recovery:64, state:"current" },
];

const LESION_GROWTH = [
  {m:"Tem",size:3.2},{m:"Ağu",size:3.6},{m:"Eyl",size:4.1},
  {m:"Eki",size:4.4},{m:"Kas",size:5.0},{m:"Ara",size:5.6},
  {m:"Oca",size:6.1},{m:"Şub",size:6.4},{m:"Mar",size:6.9},
];

const VITALS = [
  {t:"08:00",hr:72,temp:36.6},{t:"10:00",hr:76,temp:36.7},
  {t:"12:00",hr:81,temp:37.0},{t:"14:00",hr:78,temp:37.1},
  {t:"16:00",hr:74,temp:36.9},{t:"Şimdi",hr:77,temp:37.0},
];

const INITIAL_CHAT = [
  { role:"ai",  text:"NovaVision son görüntüyü işledi. ABCDE asimetri skoru 0.71 → önceki muayeneye göre %18 artış. Geçmiş biyopsi benign olsa da büyüme hızı izlem gerektiriyor.", time:"14:02" },
  { role:"doc", text:"Yeni odakta kaşıntı + bant şeklinde renk değişimi var. Önceki lezyonla aynı bölge mi?", time:"14:03" },
  { role:"ai",  text:"Lokalizasyon farklı (sol omuz vs sol skapula). PUQ.ai veritabanında 1.842 benzer vaka — %63'ü displastik nevüs paterninde ilerlemiş. Dermoskopik 10x görüntü öneririm.", time:"14:03" },
];

const IMAGES = [
  {id:"IMG-2041-06",date:"Bugün 13:42",  region:"Sol omuz",    type:"Dermoskopi 10x",    size:"6.9mm",conf:0.94,flag:"critical"},
  {id:"IMG-2041-05",date:"14 Eki 2025",  region:"Sol omuz",    type:"Klinik foto",        size:"5.6mm",conf:0.91,flag:"monitor" },
  {id:"IMG-2041-04",date:"09 Tem 2025",  region:"Sol kol",     type:"Yara takip",         size:"—",    conf:0.88,flag:"stable"  },
  {id:"IMG-2041-03",date:"18 May 2025",  region:"Sol skapula", type:"Post-op",            size:"—",    conf:0.93,flag:"stable"  },
  {id:"IMG-2041-02",date:"04 Nis 2025",  region:"Sol skapula", type:"Dermoskopi 20x",     size:"4.2mm",conf:0.89,flag:"monitor" },
  {id:"IMG-2041-01",date:"12 Mar 2025",  region:"Sol skapula", type:"İlk değerlendirme",  size:"3.2mm",conf:0.86,flag:"stable"  },
];

const LAB_RESULTS = [
  {name:"Hemoglobin",  value:13.4,unit:"g/dL",   ref:"12.0–16.0",flag:"normal",trend:"stable"},
  {name:"Lökosit",     value:7.8, unit:"10³/µL", ref:"4.0–10.0", flag:"normal",trend:"stable"},
  {name:"Trombosit",   value:245, unit:"10³/µL", ref:"150–400",  flag:"normal",trend:"down"  },
  {name:"CRP",         value:8.2, unit:"mg/L",   ref:"< 5.0",    flag:"high",  trend:"up"    },
  {name:"Sedim (ESR)", value:22,  unit:"mm/h",   ref:"< 20",     flag:"high",  trend:"up"    },
  {name:"LDH",         value:198, unit:"U/L",    ref:"135–225",  flag:"normal",trend:"stable"},
  {name:"S-100B",      value:0.18,unit:"µg/L",   ref:"< 0.15",   flag:"high",  trend:"up"    },
  {name:"Vitamin D",   value:18,  unit:"ng/mL",  ref:"30–100",   flag:"low",   trend:"stable"},
  {name:"ALT",         value:24,  unit:"U/L",    ref:"< 40",     flag:"normal",trend:"stable"},
  {name:"Kreatinin",   value:0.9, unit:"mg/dL",  ref:"0.6–1.2",  flag:"normal",trend:"stable"},
];

const INITIAL_PRESCRIPTIONS = [
  {
    id:"RX-8814",date:"14 Eki 2025",status:"active",diagnosis:"Atopik dermatit alevlenme",
    drugs:[
      {name:"Mometazon furoat %0.1 krem",dose:"Günde 1x",      duration:"14 gün"},
      {name:"Setirizin 10mg tablet",      dose:"Akşam 1 tablet",duration:"10 gün"},
    ],
  },
  {
    id:"RX-8702",date:"09 Tem 2025",status:"completed",diagnosis:"Post-eksizyon profilaksi",
    drugs:[
      {name:"Sefuroksim aksetil 500mg",dose:"Günde 2x",    duration:"7 gün"},
      {name:"Paracetamol 500mg",       dose:"Gerektiğinde",duration:"5 gün"},
    ],
  },
];

const DRUG_SUGGESTIONS = [
  "Mometazon furoat %0.1 krem","Betametazon dipropiyonat krem","Takrolimus %0.1 pomad",
  "Setirizin 10mg tablet","Desloratadin 5mg tablet","Hidrokortizon %1 krem",
  "Klobetazol propionat %0.05","Sefuroksim aksetil 500mg","Doksisiklin 100mg kapsül","İzotretinoin 20mg kapsül",
];

function now() {
  return new Date().toLocaleTimeString("tr-TR", {hour:"2-digit", minute:"2-digit"});
}

function mapApiPatient(p) {
  const words = (p.full_name || "").split(" ");
  const initials = words.map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const age = p.birth_date
    ? new Date().getFullYear() - new Date(p.birth_date).getFullYear()
    : "?";
  return {
    id: p.id,
    dbId: p.id,
    name: p.full_name,
    age,
    sex: p.gender || "?",
    status: "stable",
    lastVisit: new Date(p.created_at).toLocaleDateString("tr-TR"),
    initials,
  };
}

/* ── Helpers ─────────────────────────────────────────────── */
function PanelShell({icon:Icon,title,subtitle,right,children,tone="primary"}) {
  const col=tone==="accent"?C.accent:C.primary;
  return (
    <section className="rounded-xl flex flex-col min-h-0 overflow-hidden"
             style={{background:C.surface,border:`1px solid ${C.border}`}}>
      <div className="px-4 py-2.5 flex items-center justify-between" style={{borderBottom:`1px solid ${C.border}`}}>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md flex items-center justify-center"
               style={{background:`${col}1a`,border:`1px solid ${col}40`}}>
            <Icon size={12} style={{color:col}}/>
          </div>
          <span className="text-[12.5px] font-semibold text-zinc-100">{title}</span>
          {subtitle && <span className="text-[10px]" style={{color:C.textLo}}>· {subtitle}</span>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function ToolBtn({icon:Icon,active,onClick,label,tone="primary"}) {
  const map={
    primary:{bg:`${C.primary}1f`,border:`${C.primary}66`,color:"#c4b5fd"},
    accent: {bg:`${C.accent}1f`, border:`${C.accent}66`, color:"#67e8f9"},
    rose:   {bg:`${C.rose}1f`,   border:`${C.rose}66`,   color:"#fda4af"},
  }[tone];
  return (
    <button onClick={onClick} title={label}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] transition-colors"
            style={active
              ?{background:map.bg,border:`1px solid ${map.border}`,color:map.color}
              :{background:"transparent",border:`1px solid ${C.border}`,color:C.textMid}}>
      <Icon size={12}/><span>{label}</span>
    </button>
  );
}

/* ── AddPatientModal ─────────────────────────────────────── */
function AddPatientModal({onClose, onSave}) {
  const [form, setForm] = useState({tc_no:"", full_name:"", birth_date:"", gender:"K", phone:""});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.tc_no.trim() || !form.full_name.trim()) { setError("TC No ve Ad Soyad zorunludur."); return; }
    if (!/^\d{11}$/.test(form.tc_no)) { setError("TC No 11 rakamdan oluşmalıdır."); return; }
    setSaving(true); setError("");
    try {
      const body = {tc_no: form.tc_no, full_name: form.full_name};
      if (form.birth_date) body.birth_date = form.birth_date;
      if (form.gender)     body.gender     = form.gender;
      if (form.phone)      body.phone      = form.phone;
      const res = await fetch(`${API}/patients`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Kayıt başarısız"); }
      onSave(await res.json());
    } catch(e) { setError(String(e.message)); }
    finally    { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
      <div className="w-[480px] rounded-2xl flex flex-col" style={{background:C.surface,border:`1px solid ${C.border}`}}>
        <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:`1px solid ${C.border}`}}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                 style={{background:`${C.primary}1a`,border:`1px solid ${C.primary}40`}}>
              <Users size={14} style={{color:C.primary}}/>
            </div>
            <span className="text-[15px] font-semibold text-zinc-100">Yeni Hasta Ekle</span>
          </div>
          <button onClick={onClose} style={{color:C.textMid}}><X size={16}/></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[
            {k:"tc_no",      label:"TC Kimlik No *",  ph:"12345678901", type:"text"},
            {k:"full_name",  label:"Ad Soyad *",      ph:"Örn: Ayşe Demir", type:"text"},
            {k:"birth_date", label:"Doğum Tarihi",    ph:"",            type:"date"},
            {k:"phone",      label:"Telefon",         ph:"05XX XXX XX XX", type:"tel"},
          ].map(({k,label,ph,type})=>(
            <div key={k}>
              <label className="text-[11px] uppercase tracking-wider block mb-1" style={{color:C.textLo}}>{label}</label>
              <input type={type} value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph}
                     className="w-full rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                     style={{background:C.bg,border:`1px solid ${C.border}`}}
                     onFocus={e=>(e.target.style.borderColor=C.primary+"66")}
                     onBlur={e=>(e.target.style.borderColor=C.border)}/>
            </div>
          ))}
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1" style={{color:C.textLo}}>Cinsiyet</label>
            <div className="flex gap-2">
              {["K","E"].map(g=>(
                <button key={g} onClick={()=>set("gender",g)}
                        className="px-4 py-1.5 rounded-lg text-[13px] transition-colors"
                        style={form.gender===g
                          ?{background:`${C.primary}33`,border:`1px solid ${C.primary}66`,color:"#c4b5fd"}
                          :{background:C.bg,border:`1px solid ${C.border}`,color:C.textMid}}>
                  {g==="K"?"Kadın":"Erkek"}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="text-[12px] px-3 py-2 rounded-lg" style={{background:`${C.rose}15`,border:`1px solid ${C.rose}40`,color:"#fda4af"}}>{error}</div>}
        </div>
        <div className="px-5 py-3 flex justify-end gap-2" style={{borderTop:`1px solid ${C.border}`}}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]"
                  style={{border:`1px solid ${C.border}`,color:C.textMid}}>İptal</button>
          <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 rounded-lg text-[13px] font-medium text-white flex items-center gap-1.5 disabled:opacity-50"
                  style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`,boxShadow:`0 4px 12px -4px ${C.primary}80`}}>
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── PatientSidebar ─────────────────────────────────────── */
function PatientSidebar({patients, active, setActive, onAddPatient, onDeletePatient, sidebarView, setSidebarView}) {
  const [search, setSearch] = useState("");
  const dot=s=>s==="critical"?"bg-rose-500":s==="monitor"?"bg-amber-400":"bg-emerald-400";
  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <aside className="w-72 shrink-0 flex flex-col" style={{background:C.surface,borderRight:`1px solid ${C.border}`}}>
      <div className="px-4 py-4 flex items-center gap-2.5" style={{borderBottom:`1px solid ${C.border}`}}>
        <div className="h-9 w-9 rounded-lg flex items-center justify-center"
             style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`,boxShadow:`0 8px 24px -8px ${C.primary}80`}}>
          <Layers size={18} className="text-white"/>
        </div>
        <span className="text-[16px] font-bold tracking-tight text-white">
          DERMA<span style={{color:C.primary}}>PANEL</span>
        </span>
      </div>
      <div className="px-4 py-3" style={{borderBottom:`1px solid ${C.border}`}}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center text-[12px] font-semibold text-white"
               style={{background:`linear-gradient(135deg,${C.primary}33,${C.primary}11)`,border:`1px solid ${C.primary}44`}}>DR</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-zinc-100 truncate">Dr. R. Ergün</div>
            <div className="text-[10.5px] text-zinc-500 truncate">Dermatoloji · Memorial</div>
          </div>
          <ChevronDown size={14} className="text-zinc-500"/>
        </div>
      </div>
      <nav className="px-2 py-3 space-y-0.5" style={{borderBottom:`1px solid ${C.border}`}}>
        {[{icon:Users,label:"Hastalar",view:"hastalar",badge:String(patients.length)},
          {icon:Calendar,label:"Randevular",view:"randevular",badge:"0"},
          {icon:Archive,label:"Arşiv",view:"arsiv"},
          {icon:Settings,label:"Ayarlar",view:"ayarlar"}].map(({icon:Icon,label,view,badge})=>{
          const a = sidebarView === view;
          return (
          <button key={label} onClick={()=>setSidebarView(view)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors"
                  style={a?{background:`linear-gradient(90deg,${C.primary}25,${C.primary}08)`,borderLeft:`2px solid ${C.primary}`,color:"white"}:{color:C.textMid}}
                  onMouseEnter={e=>!a&&(e.currentTarget.style.background=C.surfaceAlt)}
                  onMouseLeave={e=>!a&&(e.currentTarget.style.background="transparent")}>
            <Icon size={15} style={a?{color:C.primary}:{}}/>
            <span className="flex-1 text-left">{label}</span>
            {badge&&<span className="text-[10px] px-1.5 py-0.5 rounded tabular-nums"
                          style={{background:a?`${C.primary}33`:C.surfaceAlt,color:a?C.primary:C.textMid}}>{badge}</span>}
          </button>
        )})}
      </nav>
      <div className="p-3" style={{borderBottom:`1px solid ${C.border}`}}>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{color:C.textLo}}/>
          <input placeholder="Hasta ara…" value={search} onChange={e=>setSearch(e.target.value)}
                 className="w-full rounded-lg pl-8 pr-2 py-2 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                 style={{background:C.bg,border:`1px solid ${C.border}`}}
                 onFocus={e=>(e.target.style.borderColor=C.primary+"66")}
                 onBlur={e=>(e.target.style.borderColor=C.border)}/>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{color:C.textLo}}>Hasta listesi</span>
          <button onClick={onAddPatient} style={{color:C.textLo}} title="Yeni hasta ekle"><Plus size={12}/></button>
        </div>
        {filtered.map(p=>{
          const sel=p.id===active.id;
          return (
            <button key={p.id} onClick={()=>setActive(p)}
                    className="group w-full text-left px-2 py-2 rounded-lg flex items-center gap-2.5 transition-colors"
                    style={sel?{background:`linear-gradient(90deg,${C.primary}20,${C.primary}05)`,border:`1px solid ${C.primary}33`}:{border:"1px solid transparent"}}
                    onMouseEnter={e=>!sel&&(e.currentTarget.style.background=C.surfaceAlt)}
                    onMouseLeave={e=>!sel&&(e.currentTarget.style.background="transparent")}>
              <div className="relative">
                <div className="h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-medium text-zinc-200"
                     style={{background:C.surfaceAlt,border:`1px solid ${C.border}`}}>{p.initials}</div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ${dot(p.status)}`}
                      style={{boxShadow:`0 0 0 2px ${C.surface}`}}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-zinc-100 truncate">{p.name}</div>
                <div className="text-[10.5px] truncate" style={{color:C.textLo}}>
                  {p.dbId ? p.id.slice(0,8)+"…" : p.id} · {p.lastVisit}
                </div>
              </div>
              {p.dbId && sel && (
                <button onClick={e=>{e.stopPropagation(); onDeletePatient(p);}}
                        title="Hastayı sil"
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{color:C.rose}}>
                  <Trash2 size={11}/>
                </button>
              )}
            </button>
          );
        })}
      </div>
      <div className="px-3 py-2.5 text-[10px] flex items-center gap-1.5" style={{borderTop:`1px solid ${C.border}`,color:C.textLo}}>
        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{background:C.accent}}/>
        NovaVision v2.4 · PUQ.ai bağlı
      </div>
    </aside>
  );
}

/* ── Header ──────────────────────────────────────────────── */
function Header({patient,activeTab,setActiveTab,latestAnalysis}) {
  const conf = latestAnalysis ? latestAnalysis.confidence : null;
  const crit = conf !== null ? conf >= 0.7 : patient.status === "critical";
  const riskLabel = conf !== null ? conf.toFixed(2) : (crit ? "0.82" : "0.24");
  const disease = latestAnalysis?.disease_name || null;
  return (
    <header className="h-14 flex items-center px-5 gap-4" style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md flex items-center justify-center text-[11px] font-medium text-zinc-100"
             style={{background:C.surfaceAlt,border:`1px solid ${C.border}`}}>{patient.initials}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-zinc-100">{patient.name}</span>
            <span className="text-[11px] font-mono" style={{color:C.textLo}}>
              {patient.age} yaş · {patient.sex==="K"?"Kadın":patient.sex==="E"?"Erkek":patient.sex}
            </span>
          </div>
          <div className="text-[11px]" style={{color:C.textLo}}>Son muayene: {patient.lastVisit}</div>
        </div>
      </div>
      <div className="h-6 w-px" style={{background:C.border}}/>
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-[11.5px] font-medium"
           style={crit?{background:`${C.rose}15`,border:`1px solid ${C.rose}40`,color:"#fda4af"}:{background:`${C.emerald}15`,border:`1px solid ${C.emerald}40`,color:"#6ee7b7"}}>
        {crit?<AlertTriangle size={13}/>:<ShieldCheck size={13}/>}
        <span>{disease ? disease : (crit?"Kritik":"Stabil")}</span>
        <span style={{color:C.textLo}}>|</span>
        <span style={{color:C.textMid}}>Güven: {riskLabel}</span>
      </div>
      <div className="flex-1"/>
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{background:C.bg,border:`1px solid ${C.border}`}}>
        {["Özet","Görüntüler","Lab","Reçeteler"].map(t=>{
          const a=t===activeTab;
          return (
            <button key={t} onClick={()=>setActiveTab(t)}
                    className="px-3 py-1 rounded-md text-[12px] transition-colors"
                    style={a?{background:C.primary,color:"white"}:{color:C.textMid,background:"transparent"}}
                    onMouseEnter={e=>!a&&(e.target.style.color=C.textHi)}
                    onMouseLeave={e=>!a&&(e.target.style.color=C.textMid)}>{t}</button>
          );
        })}
      </div>
      <div className="h-6 w-px" style={{background:C.border}}/>
      <button className="hover:text-zinc-200 relative" style={{color:C.textMid}}>
        <Bell size={15}/>
        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full" style={{background:C.rose}}/>
      </button>
      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px]" style={{color:C.rose}}>
        <LogOut size={13}/>Çıkış
      </button>
    </header>
  );
}

/* ── NovaVisionViewer ────────────────────────────────────── */
function NovaVisionViewer({latestAnalysis}) {
  const [heatmap,setHeatmap]=useState(false);
  const [overlay,setOverlay]=useState(true);
  const disease = latestAnalysis?.disease_name || "—";
  const conf    = latestAnalysis ? latestAnalysis.confidence : null;
  const confPct = conf !== null ? Math.round(conf * 100) : null;
  const analyzedAt = latestAnalysis?.analyzed_at
    ? new Date(latestAnalysis.analyzed_at).toLocaleString("tr-TR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})
    : null;
  return (
    <PanelShell icon={Eye} title="NovaVision Vizör" subtitle={analyzedAt ? `Son analiz: ${analyzedAt}` : "Henüz analiz yok"} tone="accent"
                right={
                  <div className="flex items-center gap-1.5">
                    <ToolBtn icon={overlay?Eye:EyeOff} active={overlay} onClick={()=>setOverlay(!overlay)} label="Lezyon" tone="accent"/>
                    <ToolBtn icon={Flame} active={heatmap} onClick={()=>setHeatmap(!heatmap)} label="Isı Haritası" tone="rose"/>
                    <ToolBtn icon={ZoomIn} label="Yakınlaştır"/>
                    <ToolBtn icon={Maximize2} label="Tam ekran"/>
                  </div>
                }>
      <div className="relative aspect-[16/8] overflow-hidden"
           style={{background:"linear-gradient(135deg,#0e0e18 0%,#1a1a2e 50%,#0a0a14 100%)"}}>
        <div className="absolute inset-0 opacity-90"
             style={{background:"radial-gradient(ellipse 70% 60% at 35% 50%,#c89378 0%,#a87158 35%,#6e4634 70%,#2a1814 100%)"}}/>
        <div className="absolute" style={{left:"42%",top:"38%",width:"120px",height:"100px"}}>
          <div className="absolute inset-0 rounded-[55%_45%_60%_40%/50%_60%_40%_50%]"
               style={{background:"radial-gradient(ellipse at 40% 40%,#2b1610 0%,#1a0e08 40%,#0d0604 70%,transparent 100%)"}}/>
          {heatmap&&(
            <div className="absolute -inset-4 rounded-full mix-blend-screen animate-pulse"
                 style={{background:"radial-gradient(circle,rgba(244,63,94,0.55) 0%,rgba(251,146,60,0.35) 35%,rgba(250,204,21,0.2) 60%,transparent 80%)"}}/>
          )}
          {overlay&&(
            <>
              <svg className="absolute -inset-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)]" viewBox="0 0 140 120">
                <path d="M 70 10 Q 110 15, 125 50 Q 130 90, 95 108 Q 50 115, 20 90 Q 5 55, 25 25 Q 45 8, 70 10 Z"
                      fill="none" stroke={C.accent} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.95">
                  <animate attributeName="stroke-dashoffset" from="0" to="14" dur="1.5s" repeatCount="indefinite"/>
                </path>
              </svg>
              <div className="absolute -top-6 left-0 text-[10px] font-mono px-1.5 py-0.5 rounded text-zinc-900"
                   style={{background:C.accent}}>{confPct !== null ? `conf ${conf.toFixed(2)}` : "conf —"}</div>
              <div className="absolute -bottom-5 right-0 text-[10px] font-mono px-1.5 py-0.5 rounded text-zinc-900"
                   style={{background:C.amber}}>{disease}</div>
            </>
          )}
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
             style={{backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",backgroundSize:"32px 32px"}}/>
        {["top-3 left-3","top-3 right-3","bottom-3 left-3","bottom-3 right-3"].map(p=>(
          <div key={p} className={`absolute ${p} h-4 w-4`}>
            <div className="absolute inset-0" style={{borderTop:`1px solid ${C.accent}99`,borderLeft:`1px solid ${C.accent}99`}}/>
          </div>
        ))}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-2.5 py-1 rounded text-[10.5px] font-mono"
             style={{background:`${C.bg}cc`,border:`1px solid ${C.border}`,color:C.textMid}}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{background:latestAnalysis?C.accent:C.textLo}}/>
          {latestAnalysis ? `NovaVision · ${disease}` : "NovaVision · Analiz bekleniyor"}
        </div>
      </div>
      <div className="grid grid-cols-4" style={{borderTop:`1px solid ${C.border}`}}>
        {[{label:"Tanı",v: latestAnalysis ? disease.split(" ")[0] : "—",u:"",trend:"",crit:conf>=0.7},
          {label:"Güven",v: confPct !== null ? confPct : "—",u:confPct!==null?"%":"",trend:"",crit:conf>=0.7},
          {label:"Sınır düzensizliği",v:"0.62",u:"",trend:"+9%",crit:false},{label:"Renk varyans",v:"4",u:"/5",trend:"+1",crit:true}]
          .map((m,i)=>(
          <div key={m.label} className="px-4 py-2.5" style={{borderLeft:i>0?`1px solid ${C.border}`:"none"}}>
            <div className="text-[10px] uppercase tracking-wider" style={{color:C.textLo}}>{m.label}</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[17px] font-semibold text-zinc-100 tabular-nums">{m.v}</span>
              <span className="text-[10px]" style={{color:C.textLo}}>{m.u}</span>
              <span className="ml-auto text-[10px] tabular-nums font-medium" style={{color:m.crit?C.rose:C.amber}}>{m.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

/* ── MedicalHistory ──────────────────────────────────────── */
function MedicalHistory({visits, onVisitClick, onNewVisit, hasPatient}) {
  const subtitle = visits?.length ? `${visits.length} ziyaret` : "Kayıt yok";
  return (
    <PanelShell icon={Clock} title="Ziyaret Geçmişi" subtitle={subtitle}
                right={
                  hasPatient && (
                    <button onClick={onNewVisit}
                            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded"
                            style={{background:`${C.primary}1a`,border:`1px solid ${C.primary}40`,color:"#c4b5fd"}}>
                      <Plus size={11}/>Yeni
                    </button>
                  )
                }>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!visits?.length ? (
          <div className="text-[12px] text-center py-6 space-y-2" style={{color:C.textLo}}>
            <div>Henüz ziyaret kaydı yok.</div>
            {hasPatient && (
              <button onClick={onNewVisit}
                      className="text-[11px] px-3 py-1.5 rounded-lg"
                      style={{background:`${C.primary}1a`,border:`1px solid ${C.primary}40`,color:"#c4b5fd"}}>
                + Yeni Muayene Başlat
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[7px] top-1 bottom-1 w-px"
                 style={{background:`linear-gradient(to bottom,${C.border},${C.primary}66)`}}/>
            {visits.map((v, idx) => {
              const cur = idx === 0;
              const date = new Date(v.visit_date).toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"});
              const analysisCount = v.analysis_results?.length || 0;
              return (
                <button key={v.id} onClick={()=>onVisitClick(v)}
                        className="relative w-full text-left pl-7 pb-4 last:pb-0 group">
                  {cur
                    ? <span className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full flex items-center justify-center"
                             style={{background:`${C.primary}33`,boxShadow:`0 0 0 4px ${C.primary}15`}}>
                        <span className="h-[7px] w-[7px] rounded-full animate-pulse" style={{background:C.primary}}/>
                      </span>
                    : <span className="absolute left-[3px] top-1.5 h-[9px] w-[9px] rounded-full"
                             style={{background:C.border,boxShadow:`0 0 0 4px ${C.surface}`}}/>
                  }
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] font-medium group-hover:text-violet-300 transition-colors"
                          style={{color:cur?"#c4b5fd":C.textHi}}>
                      {v.complaint || "Muayene"}
                    </span>
                    <span className="text-[10.5px] font-mono whitespace-nowrap" style={{color:C.textLo}}>{date}</span>
                  </div>
                  {v.notes && (
                    <div className="text-[11px] mt-0.5 line-clamp-1" style={{color:C.textMid}}>{v.notes}</div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {analysisCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{background:`${C.accent}15`,color:"#67e8f9",border:`1px solid ${C.accent}30`}}>
                        {analysisCount} analiz
                      </span>
                    )}
                    <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{color:C.textLo}}>
                      Düzenle →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PanelShell>
  );
}

/* ── VitalsPanel ─────────────────────────────────────────── */
function VitalTile({icon:Icon,label,value,unit,tone,spark,first}) {
  const m={rose:{color:"#fda4af",stroke:C.rose},amber:{color:"#fcd34d",stroke:C.amber},emerald:{color:"#6ee7b7",stroke:C.emerald}}[tone];
  return (
    <div className="p-3" style={{borderLeft:!first?`1px solid ${C.border}`:"none"}}>
      <div className="flex items-center gap-1.5">
        <Icon size={11} style={{color:m.color}}/>
        <span className="text-[10px] uppercase tracking-wider" style={{color:C.textLo}}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-[18px] font-semibold text-zinc-100 tabular-nums">{value}</span>
        <span className="text-[10px]" style={{color:C.textLo}}>{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={28}>
        <LineChart data={spark}><Line type="monotone" dataKey="y" stroke={m.stroke} strokeWidth={1.4} dot={false}/></LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function VitalsPanel({vitals, lesionMeasurements, onAddVitals}) {
  const hasVitals = vitals && vitals.length > 0;
  const hasLesion = lesionMeasurements && lesionMeasurements.length > 0;

  const latest = hasVitals ? vitals[vitals.length - 1] : null;
  const hrSpark  = hasVitals ? vitals.map((v,i)=>({x:i, y:v.heart_rate    || 0})) : [];
  const tmpSpark = hasVitals ? vitals.map((v,i)=>({x:i, y:v.temperature   || 0})) : [];
  const o2Spark  = hasVitals ? vitals.map((v,i)=>({x:i, y:v.o2_saturation || 0})) : [];

  const lesionChart = hasLesion ? lesionMeasurements.map(m=>({
    m: new Date(m.measured_at).toLocaleDateString("tr-TR",{month:"short",day:"numeric"}),
    size: parseFloat(m.size_mm),
  })) : [];

  const lesionFirst = hasLesion ? parseFloat(lesionMeasurements[0].size_mm) : 0;
  const lesionLast  = hasLesion ? parseFloat(lesionMeasurements[lesionMeasurements.length-1].size_mm) : 0;
  const lesionDiff  = (lesionLast - lesionFirst).toFixed(1);

  const addBtn = (
    <button onClick={onAddVitals}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded"
            style={{background:`${C.primary}15`,border:`1px solid ${C.primary}40`,color:"#c4b5fd"}}>
      <Plus size={11}/>Ölçüm Ekle
    </button>
  );

  if (!hasVitals && !hasLesion) {
    return (
      <PanelShell icon={Activity} title="Vital Bulgular & Büyüme" right={addBtn}>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4" style={{color:C.textLo}}>
          <Activity size={28} style={{color:C.textLo}}/>
          <div className="text-center">
            <div className="text-[13px] font-medium text-zinc-400 mb-1">Ölçüm kaydı yok</div>
            <div className="text-[11px]">Bu hasta için henüz vital veya lezyon ölçümü girilmedi.</div>
          </div>
          <button onClick={onAddVitals}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-white"
                  style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`}}>
            İlk Ölçümü Ekle
          </button>
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell icon={Activity} title="Vital Bulgular & Büyüme" right={addBtn}>
      {hasVitals && (
        <div className="grid grid-cols-3" style={{borderBottom:`1px solid ${C.border}`}}>
          <VitalTile icon={Heart}       label="Nabız" value={String(latest.heart_rate    ?? "—")} unit="bpm" tone="rose"    spark={hrSpark}  first/>
          <VitalTile icon={Thermometer} label="Ateş"  value={String(latest.temperature   ?? "—")} unit="°C"  tone="amber"   spark={tmpSpark}/>
          <VitalTile icon={TrendingUp}  label="O₂"    value={String(latest.o2_saturation ?? "—")} unit="%"   tone="emerald" spark={o2Spark}/>
        </div>
      )}
      {hasLesion ? (
        <div className="p-4">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div className="text-[10.5px] uppercase tracking-wider" style={{color:C.textLo}}>Lezyon büyümesi (mm)</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-[20px] font-semibold text-zinc-100 tabular-nums">{lesionLast}</span>
                {lesionDiff > 0
                  ? <span className="text-[11px]" style={{color:C.rose}}>↑ {lesionDiff}mm</span>
                  : lesionDiff < 0
                    ? <span className="text-[11px]" style={{color:C.emerald}}>↓ {Math.abs(lesionDiff)}mm</span>
                    : <span className="text-[11px]" style={{color:C.textLo}}>→ değişim yok</span>}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={hasVitals ? 90 : 140}>
            <AreaChart data={lesionChart} margin={{top:4,right:4,left:-28,bottom:0}}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.primary} stopOpacity={0.5}/>
                  <stop offset="100%" stopColor={C.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={C.border} vertical={false}/>
              <XAxis dataKey="m" tick={{fill:C.textLo,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.textLo,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,fontSize:11,color:C.textHi}}/>
              <Area type="monotone" dataKey="size" stroke={C.primary} strokeWidth={2} fill="url(#growthGrad)"
                    dot={{r:3,fill:C.primary,strokeWidth:0}} activeDot={{r:4,fill:C.primary,stroke:C.bg,strokeWidth:2}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center p-4 text-[11px]" style={{color:C.textLo}}>
          Lezyon ölçümü henüz girilmedi.
        </div>
      )}
    </PanelShell>
  );
}

/* ── ChatPanel ───────────────────────────────────────────── */
function ChatPanel({messages, setMessages, analyzing, onSend, chatLoading}) {
  const [input,setInput]=useState("");
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages, chatLoading]);

  const send=()=>{
    if(!input.trim() || chatLoading) return;
    const msg = input.trim();
    setInput("");
    onSend(msg);
  };

  return (
    <PanelShell icon={Sparkles} title="PUQ.ai Karar Destek" subtitle="1.842 vaka indexlendi"
                right={<button style={{color:C.textMid}}><MoreHorizontal size={14}/></button>}>
      <div className="px-4 py-2 flex gap-1.5 flex-wrap" style={{borderBottom:`1px solid ${C.border}`}}>
        {["NovaVision son tarama","Geçmiş biyopsi","ABCDE skoru","Aile öyküsü"].map(c=>(
          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full"
                style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.textMid}}>{c}</span>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2" style={{color:C.textLo}}>
            <Sparkles size={24} style={{color:C.primary,opacity:0.5}}/>
            <div className="text-[12px] text-center">Hasta seçildi. Soru sormaya başlayabilirsiniz.</div>
          </div>
        )}
        {messages.map((m,i)=>(
          <div key={i} className={`flex gap-2 ${m.role==="doc"?"flex-row-reverse":""}`}>
            <div className="h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-[10px]"
                 style={m.role==="ai"
                   ?{background:`linear-gradient(135deg,${C.primary}33,${C.accent}33)`,border:`1px solid ${C.primary}55`,color:"#c4b5fd"}
                   :{background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.textMid}}>
              {m.role==="ai"?<Sparkles size={11}/>:"DR"}
            </div>
            <div className={`max-w-[85%] ${m.role==="doc"?"items-end":""}`}>
              <div className="text-[12px] leading-relaxed rounded-lg px-2.5 py-2 whitespace-pre-wrap"
                   style={m.role==="ai"
                     ?{background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.textHi}
                     :{background:`${C.primary}1a`,border:`1px solid ${C.primary}40`,color:"#e9d5ff"}}>
                {m.text}
              </div>
              <div className={`text-[9.5px] mt-0.5 ${m.role==="doc"?"text-right":""}`} style={{color:C.textLo}}>
                {m.role==="ai"?"PUQ.ai":"Sen"} · {m.time}
              </div>
            </div>
          </div>
        ))}
        {analyzing && (
          <div className="flex gap-2">
            <div className="h-6 w-6 shrink-0 rounded-md flex items-center justify-center"
                 style={{background:`linear-gradient(135deg,${C.primary}33,${C.accent}33)`,border:`1px solid ${C.primary}55`}}>
              <Loader2 size={11} className="animate-spin" style={{color:"#c4b5fd"}}/>
            </div>
            <div className="text-[12px] px-2.5 py-2 rounded-lg" style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.textLo}}>
              PUQ.ai analiz raporu hazırlanıyor…
            </div>
          </div>
        )}
        {chatLoading && (
          <div className="flex gap-2">
            <div className="h-6 w-6 shrink-0 rounded-md flex items-center justify-center"
                 style={{background:`linear-gradient(135deg,${C.primary}33,${C.accent}33)`,border:`1px solid ${C.primary}55`}}>
              <Loader2 size={11} className="animate-spin" style={{color:"#c4b5fd"}}/>
            </div>
            <div className="text-[12px] px-2.5 py-2 rounded-lg" style={{background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.textLo}}>
              PUQ.ai yanıt hazırlıyor…
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div className="p-3" style={{borderTop:`1px solid ${C.border}`}}>
        <div className="relative flex items-center gap-2 rounded-lg" style={{background:C.bg,border:`1px solid ${C.border}`}}>
          <MessageSquare size={13} className="ml-2.5" style={{color:C.textLo}}/>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                 placeholder="Soru veya not yazın… (Enter ile gönder)"
                 disabled={chatLoading}
                 className="flex-1 bg-transparent py-2 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"/>
          <button onClick={send} disabled={chatLoading || !input.trim()}
                  className="m-1 px-2.5 py-1 rounded-md text-white text-[11px] font-medium flex items-center gap-1 disabled:opacity-40"
                  style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`}}>
            {chatLoading ? <Loader2 size={11} className="animate-spin"/> : <Send size={11}/>}
            Gönder
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px]" style={{color:C.textLo}}>
          <Stethoscope size={10}/>
          <span>Yanıtlar klinik karar yerine geçmez. v3.1 · HIPAA & KVKK uyumlu.</span>
        </div>
      </div>
    </PanelShell>
  );
}

/* ── VitalsModal ─────────────────────────────────────────── */
function VitalsModal({patient, visits, onClose, onSaved}) {
  const [hr,  setHr]  = useState("");
  const [temp,setTemp]= useState("");
  const [o2,  setO2]  = useState("");
  const [szMm,setSzMm]= useState("");
  const [region,setRegion]= useState("");
  const [visitId, setVisitId] = useState(visits[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const inp = "w-full rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none";
  const focus = e => (e.target.style.borderColor = C.primary+"66");
  const blur  = e => (e.target.style.borderColor = C.border);

  const handleSave = async () => {
    if (!hr && !temp && !o2 && !szMm) { setError("En az bir değer giriniz."); return; }
    setSaving(true); setError("");
    try {
      const base = { patient_id: patient.dbId, visit_id: visitId || undefined };
      if (hr || temp || o2) {
        await fetch(`${API}/vitals`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            ...base,
            ...(hr   ? {heart_rate:    parseInt(hr)}    : {}),
            ...(temp  ? {temperature:   parseFloat(temp)}: {}),
            ...(o2    ? {o2_saturation: parseInt(o2)}    : {}),
          }),
        });
      }
      if (szMm) {
        await fetch(`${API}/lesion-measurements`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ ...base, size_mm: parseFloat(szMm), region: region || undefined }),
        });
      }
      onSaved();
    } catch(e) { setError(String(e.message)); }
    finally    { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
      <div className="w-[480px] rounded-2xl flex flex-col" style={{background:C.surface,border:`1px solid ${C.border}`}}>
        <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:`1px solid ${C.border}`}}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                 style={{background:`${C.primary}1a`,border:`1px solid ${C.primary}40`}}>
              <Activity size={14} style={{color:C.primary}}/>
            </div>
            <div>
              <div className="text-[15px] font-semibold text-zinc-100">Ölçüm Ekle</div>
              <div className="text-[11px]" style={{color:C.textLo}}>{patient.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{color:C.textMid}}><X size={16}/></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {visits.length > 0 && (
            <div>
              <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Muayene</label>
              <select value={visitId} onChange={e=>setVisitId(e.target.value)}
                      className={inp} style={{background:C.bg,border:`1px solid ${C.border}`}}>
                {visits.map(v=>(
                  <option key={v.id} value={v.id}>
                    {new Date(v.visit_date).toLocaleDateString("tr-TR")} — {v.complaint || "Muayene"}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Vital Bulgular</label>
            <div className="grid grid-cols-3 gap-2">
              {[["Nabız (bpm)", hr, setHr, "72"],["Ateş (°C)", temp, setTemp, "36.6"],["O₂ (%)", o2, setO2, "98"]].map(([lbl,val,set,ph])=>(
                <div key={lbl}>
                  <div className="text-[10px] mb-1" style={{color:C.textLo}}>{lbl}</div>
                  <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} type="number"
                         className={inp} style={{background:C.bg,border:`1px solid ${C.border}`}}
                         onFocus={focus} onBlur={blur}/>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Lezyon Ölçümü</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] mb-1" style={{color:C.textLo}}>Boyut (mm)</div>
                <input value={szMm} onChange={e=>setSzMm(e.target.value)} placeholder="6.5" type="number"
                       className={inp} style={{background:C.bg,border:`1px solid ${C.border}`}}
                       onFocus={focus} onBlur={blur}/>
              </div>
              <div>
                <div className="text-[10px] mb-1" style={{color:C.textLo}}>Bölge</div>
                <input value={region} onChange={e=>setRegion(e.target.value)} placeholder="Sol omuz"
                       className={inp} style={{background:C.bg,border:`1px solid ${C.border}`}}
                       onFocus={focus} onBlur={blur}/>
              </div>
            </div>
          </div>
          {error && <div className="text-[12px] px-3 py-2 rounded-lg" style={{background:`${C.rose}15`,color:"#fda4af",border:`1px solid ${C.rose}30`}}>{error}</div>}
        </div>
        <div className="px-5 py-3 flex justify-end gap-2" style={{borderTop:`1px solid ${C.border}`}}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]"
                  style={{border:`1px solid ${C.border}`,color:C.textMid}}>İptal</button>
          <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 rounded-lg text-[13px] font-medium text-white flex items-center gap-1.5 disabled:opacity-50"
                  style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`,boxShadow:`0 4px 12px -4px ${C.primary}80`}}>
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── NewAppointmentModal ─────────────────────────────────── */
function NewAppointmentModal({patients, onClose, onSaved}) {
  const [patientId, setPatientId] = useState(patients.filter(p=>p.dbId)[0]?.dbId || "");
  const [apptDate,  setApptDate]  = useState("");
  const [type,      setType]      = useState("Kontrol");
  const [notes,     setNotes]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const TYPES = ["Kontrol","Dermoskopi","Biyopsi","Eksizyonel","Akne Tedavisi","Saç Analizi","Diğer"];
  const inp   = "w-full rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none";
  const focus = e => (e.target.style.borderColor = C.accent+"66");
  const blur  = e => (e.target.style.borderColor = C.border);

  const handleSave = async () => {
    if (!patientId || !apptDate) { setError("Hasta ve tarih zorunludur."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/appointments`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ patient_id:patientId, appointment_date:apptDate, type, notes:notes||undefined }),
      });
      if (!res.ok) throw new Error("Kayıt başarısız");
      onSaved();
    } catch(e) { setError(e.message); }
    finally    { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
      <div className="w-[480px] rounded-2xl flex flex-col" style={{background:C.surface,border:`1px solid ${C.border}`}}>
        <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:`1px solid ${C.border}`}}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                 style={{background:`${C.accent}1a`,border:`1px solid ${C.accent}40`}}>
              <Calendar size={14} style={{color:C.accent}}/>
            </div>
            <span className="text-[15px] font-semibold text-zinc-100">Yeni Randevu</span>
          </div>
          <button onClick={onClose} style={{color:C.textMid}}><X size={16}/></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Hasta *</label>
            <select value={patientId} onChange={e=>setPatientId(e.target.value)}
                    className={inp} style={{background:C.bg,border:`1px solid ${C.border}`}}
                    onFocus={focus} onBlur={blur}>
              {patients.filter(p=>p.dbId).map(p=>(
                <option key={p.dbId} value={p.dbId}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Tarih & Saat *</label>
              <input type="datetime-local" value={apptDate} onChange={e=>setApptDate(e.target.value)}
                     className={inp} style={{background:C.bg,border:`1px solid ${C.border}`,colorScheme:"dark"}}
                     onFocus={focus} onBlur={blur}/>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Randevu Türü</label>
              <select value={type} onChange={e=>setType(e.target.value)}
                      className={inp} style={{background:C.bg,border:`1px solid ${C.border}`}}
                      onFocus={focus} onBlur={blur}>
                {TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Not</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
                      placeholder="Randevu hakkında not…"
                      className={`${inp} resize-none`} style={{background:C.bg,border:`1px solid ${C.border}`}}
                      onFocus={focus} onBlur={blur}/>
          </div>
          {error && <div className="text-[12px] px-3 py-2 rounded-lg" style={{background:`${C.rose}15`,color:"#fda4af",border:`1px solid ${C.rose}30`}}>{error}</div>}
        </div>
        <div className="px-5 py-3 flex justify-end gap-2" style={{borderTop:`1px solid ${C.border}`}}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]"
                  style={{border:`1px solid ${C.border}`,color:C.textMid}}>İptal</button>
          <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 rounded-lg text-[13px] font-medium text-white flex items-center gap-1.5 disabled:opacity-50"
                  style={{background:`linear-gradient(135deg,${C.accent},${C.accentDim})`,boxShadow:`0 4px 12px -4px ${C.accent}80`}}>
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
            {saving ? "Kaydediliyor…" : "Randevuyu Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── RandevularPage ──────────────────────────────────────── */
function RandevularPage({patients, onNavigateToPatient}) {
  const [appointments, setAppointments] = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [showModal,setShowModal] = useState(false);

  const load = () =>
    fetch(`${API}/appointments`).then(r=>r.json())
      .then(d=>{ setAppointments(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(()=>setLoading(false));

  useEffect(()=>{ load(); },[]);

  const statusLabel = s => s==="scheduled"?"Planlandı":s==="completed"?"Tamamlandı":"İptal";
  const statusStyle = s => s==="scheduled"
    ?{background:`${C.accent}15`,  color:"#67e8f9", border:`1px solid ${C.accent}30`}
    :s==="completed"
    ?{background:`${C.emerald}15`, color:"#6ee7b7", border:`1px solid ${C.emerald}30`}
    :{background:`${C.rose}15`,    color:"#fda4af", border:`1px solid ${C.rose}30`};

  const updateStatus = async (id, status) => {
    await fetch(`${API}/appointments/${id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({status}),
    });
    load();
  };

  const today        = new Date().toDateString();
  const todayCount   = appointments.filter(a=>new Date(a.appointment_date).toDateString()===today && a.status==="scheduled").length;
  const pendingCount = appointments.filter(a=>a.status==="scheduled").length;
  const doneCount    = appointments.filter(a=>a.status==="completed").length;

  const grouped = appointments.reduce((acc,a)=>{
    const d = new Date(a.appointment_date).toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    if (!acc[d]) acc[d]=[];
    acc[d].push(a);
    return acc;
  },{});

  return (
    <>
      <div className="h-14 shrink-0 flex items-center px-5 gap-4" style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md flex items-center justify-center"
               style={{background:`${C.accent}1a`,border:`1px solid ${C.accent}40`}}>
            <Calendar size={13} style={{color:C.accent}}/>
          </div>
          <span className="text-[14px] font-semibold text-zinc-100">Randevular</span>
        </div>
        <div className="flex items-center gap-4 ml-2">
          {[{label:"Bugün",value:todayCount,color:C.accent},{label:"Bekleyen",value:pendingCount,color:C.amber},{label:"Tamamlanan",value:doneCount,color:C.emerald}].map(s=>(
            <div key={s.label} className="flex items-center gap-1.5 text-[12px]">
              <span className="font-semibold tabular-nums" style={{color:s.color}}>{s.value}</span>
              <span style={{color:C.textLo}}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1"/>
        <button onClick={()=>setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white"
                style={{background:`linear-gradient(135deg,${C.accent},${C.accentDim})`,boxShadow:`0 4px 12px -4px ${C.accent}60`}}>
          <Plus size={13}/>Yeni Randevu
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin" style={{color:C.textLo}}/></div>
        ) : Object.keys(grouped).length===0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3" style={{color:C.textLo}}>
            <Calendar size={36}/>
            <div className="text-center">
              <div className="text-[14px] font-medium text-zinc-400 mb-1">Randevu yok</div>
              <div className="text-[12px]">Yeni randevu oluşturmak için "Yeni Randevu" butonuna tıklayın.</div>
            </div>
          </div>
        ) : Object.entries(grouped).map(([dateLabel,appts])=>(
          <div key={dateLabel}>
            <div className="text-[11px] uppercase tracking-wider font-medium mb-2 px-1" style={{color:C.textLo}}>{dateLabel}</div>
            <div className="space-y-2">
              {appts.map(a=>{
                const time     = new Date(a.appointment_date).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
                const name     = a.patients?.full_name || "Bilinmiyor";
                const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
                return (
                  <div key={a.id} className="flex items-center gap-4 px-4 py-3 rounded-xl"
                       style={{background:C.surface,border:`1px solid ${C.border}`}}>
                    <div className="text-[13px] font-mono font-semibold w-12 shrink-0 tabular-nums" style={{color:C.accent}}>{time}</div>
                    <div className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-medium text-zinc-200"
                         style={{background:C.surfaceAlt,border:`1px solid ${C.border}`}}>{initials}</div>
                    <div className="flex-1 min-w-0">
                      <button onClick={()=>onNavigateToPatient(a.patient_id)}
                              className="text-[13px] font-medium text-zinc-100 hover:text-violet-300 transition-colors text-left">
                        {name}
                      </button>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px]" style={{color:C.textMid}}>{a.type}</span>
                        {a.notes && <span className="text-[11px] truncate" style={{color:C.textLo}}>· {a.notes}</span>}
                      </div>
                    </div>
                    <span className="text-[10.5px] px-2 py-0.5 rounded font-medium shrink-0" style={statusStyle(a.status)}>
                      {statusLabel(a.status)}
                    </span>
                    {a.status==="scheduled" && (
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={()=>updateStatus(a.id,"completed")}
                                className="px-2.5 py-1 rounded text-[11px]"
                                style={{background:`${C.emerald}15`,color:"#6ee7b7",border:`1px solid ${C.emerald}30`}}>
                          Tamamlandı
                        </button>
                        <button onClick={()=>updateStatus(a.id,"cancelled")}
                                className="px-2.5 py-1 rounded text-[11px]"
                                style={{background:`${C.rose}10`,color:"#fda4af",border:`1px solid ${C.rose}25`}}>
                          İptal
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <NewAppointmentModal patients={patients} onClose={()=>setShowModal(false)} onSaved={()=>{ setShowModal(false); load(); }}/>
      )}
    </>
  );
}

/* ── ArsivPage ───────────────────────────────────────────── */
function ArsivPage({onNavigateToPatient}) {
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(()=>{
    fetch(`${API}/archive`).then(r=>r.json())
      .then(d=>{ setArchive(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(()=>setLoading(false));
  },[]);

  const filtered = archive.filter(a=>{
    const q = search.toLowerCase();
    return (a.patients?.full_name||"").toLowerCase().includes(q) || (a.disease_name||"").toLowerCase().includes(q);
  });

  const confColor = c => c>=0.8?C.rose:c>=0.6?C.amber:C.emerald;
  const confLabel = c => c>=0.8?"Yüksek Risk":c>=0.6?"Takip":"Stabil";

  return (
    <>
      <div className="h-14 shrink-0 flex items-center px-5 gap-4" style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md flex items-center justify-center"
               style={{background:`${C.amber}1a`,border:`1px solid ${C.amber}40`}}>
            <Archive size={13} style={{color:C.amber}}/>
          </div>
          <span className="text-[14px] font-semibold text-zinc-100">Arşiv</span>
          {!loading && <span className="text-[11px]" style={{color:C.textLo}}>{archive.length} analiz kaydı</span>}
        </div>
        <div className="flex-1"/>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{color:C.textLo}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
                 placeholder="Hasta adı veya tanı ara…"
                 className="pl-8 pr-4 py-1.5 rounded-lg text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none w-60"
                 style={{background:C.bg,border:`1px solid ${C.border}`}}
                 onFocus={e=>(e.target.style.borderColor=C.amber+"66")}
                 onBlur={e=>(e.target.style.borderColor=C.border)}/>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 size={20} className="animate-spin" style={{color:C.textLo}}/></div>
        ) : filtered.length===0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3" style={{color:C.textLo}}>
            <Archive size={36}/>
            <div className="text-[13px]">{search?"Arama sonucu bulunamadı.":"Arşiv boş."}</div>
          </div>
        ) : (
          <table className="w-full text-[12px]">
            <thead style={{background:C.surface,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:1}}>
              <tr style={{color:C.textLo}}>
                {["Hasta","Tanı","Risk","Güven","Tarih",""].map((h,i)=>(
                  <th key={i} className={`${i===0||i===5?"text-left":"text-center"} px-4 py-2.5 font-medium text-[10.5px] uppercase tracking-wider`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a,i)=>{
                const name     = a.patients?.full_name||"Bilinmiyor";
                const initials = name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
                const conf     = a.confidence||0;
                const date     = new Date(a.analyzed_at).toLocaleDateString("tr-TR",{day:"2-digit",month:"short",year:"numeric"});
                return (
                  <tr key={a.id} style={{borderBottom:`1px solid ${C.borderSoft}`,background:i%2===0?"transparent":`${C.surfaceAlt}55`}}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 shrink-0 rounded-md flex items-center justify-center text-[10px] font-medium text-zinc-200"
                             style={{background:C.surfaceAlt,border:`1px solid ${C.border}`}}>{initials}</div>
                        <button onClick={()=>onNavigateToPatient(a.patient_id)}
                                className="text-[12.5px] font-medium text-zinc-100 hover:text-violet-300 transition-colors text-left">
                          {name}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-200">{a.disease_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10.5px] px-2 py-0.5 rounded font-medium"
                            style={{background:`${confColor(conf)}15`,color:confColor(conf),border:`1px solid ${confColor(conf)}30`}}>
                        {confLabel(conf)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{background:C.surfaceAlt}}>
                          <div className="h-full rounded-full" style={{width:`${Math.round(conf*100)}%`,background:confColor(conf)}}/>
                        </div>
                        <span className="tabular-nums" style={{color:C.textMid}}>%{Math.round(conf*100)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-[11px]" style={{color:C.textLo}}>{date}</td>
                    <td className="px-4 py-3">
                      <button onClick={()=>onNavigateToPatient(a.patient_id)}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded ml-auto"
                              style={{background:`${C.primary}15`,color:"#c4b5fd",border:`1px solid ${C.primary}30`}}>
                        Hastaya Git<ChevronRight size={11}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

/* ── Placeholder sayfaları ───────────────────────────────── */
function ComingSoonPage({icon:Icon, title, description, color}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{color:C.textLo}}>
      <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
           style={{background:`${color}15`,border:`1px solid ${color}30`}}>
        <Icon size={28} style={{color}}/>
      </div>
      <div className="text-center">
        <div className="text-[16px] font-semibold text-zinc-300 mb-1">{title}</div>
        <div className="text-[13px]" style={{color:C.textLo}}>{description}</div>
      </div>
      <div className="px-4 py-2 rounded-lg text-[12px]"
           style={{background:C.surface,border:`1px solid ${C.border}`,color:C.textMid}}>
        Yakında eklenecek
      </div>
    </div>
  );
}

/* ── Tabs ────────────────────────────────────────────────── */
function SummaryTab({chatMessages, setMessages, analyzing, chatLoading, onSend, latestAnalysis, visits, onVisitClick, onNewVisit, hasPatient, vitals, lesionMeasurements, onAddVitals}) {
  return (
    <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-3 overflow-y-auto min-h-0 pr-1">
        <NovaVisionViewer latestAnalysis={latestAnalysis}/>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 min-h-[280px]">
          <MedicalHistory visits={visits} onVisitClick={onVisitClick} onNewVisit={onNewVisit} hasPatient={hasPatient}/>
          <VitalsPanel vitals={vitals} lesionMeasurements={lesionMeasurements} onAddVitals={onAddVitals}/>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 min-h-0 flex flex-col">
        <ChatPanel messages={chatMessages} setMessages={setMessages} analyzing={analyzing} chatLoading={chatLoading} onSend={onSend}/>
      </div>
    </div>
  );
}

function ImagesTab({analyses}) {
  const [selected,setSelected]=useState(null);
  const list = analyses || [];

  useEffect(() => { setSelected(list[0] || null); }, [list.length]);

  if (list.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{color:C.textLo}}>
        <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
             style={{background:`${C.accent}15`,border:`1px solid ${C.accent}30`}}>
          <ImageIcon size={28} style={{color:C.accent}}/>
        </div>
        <div className="text-center">
          <div className="text-[16px] font-semibold text-zinc-300 mb-1">Görüntü bulunamadı</div>
          <div className="text-[13px]">Bu hasta için henüz analiz görüntüsü kaydedilmedi.</div>
          <div className="text-[12px] mt-1" style={{color:C.textLo}}>Özet sekmesinden muayene başlatarak analiz ekleyebilirsiniz.</div>
        </div>
      </div>
    );
  }

  const sel = selected || list[0];
  const confPct = Math.round((sel.confidence || 0) * 100);
  const date = new Date(sel.analyzed_at).toLocaleString("tr-TR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});

  return (
    <div className="flex-1 p-3 overflow-hidden grid grid-cols-12 gap-3">
      <div className="col-span-12 lg:col-span-4 min-h-0">
        <PanelShell icon={ImageIcon} title="Görüntü Arşivi" subtitle={`${list.length} kayıt`}>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {list.map(img=>{
              const isSel = img.id === sel?.id;
              const d = new Date(img.analyzed_at).toLocaleDateString("tr-TR");
              return (
                <button key={img.id} onClick={()=>setSelected(img)}
                        className="w-full text-left rounded-lg p-2.5 flex items-center gap-3"
                        style={isSel?{background:`linear-gradient(90deg,${C.primary}20,${C.primary}05)`,border:`1px solid ${C.primary}55`}:{background:C.bg,border:`1px solid ${C.border}`}}>
                  <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden flex items-center justify-center"
                       style={{background:C.surfaceAlt,border:`1px solid ${C.border}`}}>
                    {img.image_url && img.image_url !== "https://example.com/dermoscopy.jpg"
                      ? <img src={img.image_url} alt="" className="h-full w-full object-cover"/>
                      : <ImageIcon size={20} style={{color:C.textLo}}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] font-medium text-zinc-100 truncate">{img.disease_name}</div>
                    <div className="text-[10px] mt-0.5" style={{color:C.textLo}}>Güven: %{Math.round((img.confidence||0)*100)}</div>
                    <div className="text-[9.5px] font-mono mt-0.5" style={{color:C.textLo}}>{d} · {img.id.slice(0,8)}</div>
                  </div>
                  <ChevronRight size={12} style={{color:C.textLo}}/>
                </button>
              );
            })}
          </div>
        </PanelShell>
      </div>
      <div className="col-span-12 lg:col-span-8 min-h-0 flex flex-col">
        <PanelShell icon={Eye} title={sel.disease_name} subtitle={`Analiz · ${sel.id.slice(0,8)}`} tone="accent"
                    right={
                      <div className="flex gap-1.5">
                        <button className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px]"
                                style={{border:`1px solid ${C.border}`,color:C.textMid}}><Download size={11}/>İndir</button>
                        <button className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px]"
                                style={{border:`1px solid ${C.border}`,color:C.textMid}}><Printer size={11}/>Yazdır</button>
                      </div>
                    }>
          <div className="relative aspect-[16/9] flex items-center justify-center overflow-hidden"
               style={{background:"linear-gradient(135deg,#0e0e18 0%,#1a1a2e 50%,#0a0a14 100%)"}}>
            {sel.image_url && sel.image_url !== "https://example.com/dermoscopy.jpg"
              ? <img src={sel.image_url} alt={sel.disease_name} className="w-full h-full object-contain"/>
              : <>
                  <div className="absolute inset-0 opacity-90"
                       style={{background:"radial-gradient(ellipse 70% 60% at 35% 50%,#c89378 0%,#a87158 35%,#6e4634 70%,#2a1814 100%)"}}/>
                  <div className="absolute" style={{left:"40%",top:"35%",width:"20%",height:"30%",
                       background:"radial-gradient(ellipse at center,#1a0e08 0%,transparent 70%)",borderRadius:"50%"}}/>
                </>}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10.5px] font-mono px-2.5 py-1 rounded"
                 style={{background:`${C.bg}cc`,border:`1px solid ${C.border}`,color:C.textMid}}>
              {date} · güven %{confPct}
            </div>
          </div>
          <div className="grid grid-cols-4" style={{borderTop:`1px solid ${C.border}`}}>
            {[{label:"Tanı",v:sel.disease_name},{label:"Güven",v:`%${confPct}`},{label:"Tarih",v:date.slice(0,10)},{label:"ID",v:sel.id.slice(0,8)}]
              .map((m,i)=>(
              <div key={m.label} className="px-4 py-2.5" style={{borderLeft:i>0?`1px solid ${C.border}`:"none"}}>
                <div className="text-[10px] uppercase tracking-wider" style={{color:C.textLo}}>{m.label}</div>
                <div className="text-[13px] font-medium text-zinc-100 mt-0.5 truncate">{m.v}</div>
              </div>
            ))}
          </div>
        </PanelShell>
      </div>
    </div>
  );
}

function SummaryCard({label,value,total,color,icon:Icon}) {
  return (
    <div className="rounded-xl p-4 flex items-center gap-3" style={{background:C.surface,border:`1px solid ${C.border}`}}>
      <div className="h-10 w-10 rounded-lg flex items-center justify-center"
           style={{background:`${color}15`,border:`1px solid ${color}40`}}><Icon size={18} style={{color}}/></div>
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-wider" style={{color:C.textLo}}>{label}</div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-[22px] font-bold tabular-nums" style={{color}}>{value}</span>
          <span className="text-[12px]" style={{color:C.textLo}}>/ {total}</span>
        </div>
      </div>
    </div>
  );
}

function LabTab({labResults, onAddLab}) {
  const fc=f=>f==="high"?C.rose:f==="low"?C.amber:C.emerald;
  const fb=f=>f==="high"?`${C.rose}15`:f==="low"?`${C.amber}15`:`${C.emerald}10`;
  const fl=f=>f==="high"?"↑ YÜKSEK":f==="low"?"↓ DÜŞÜK":"✓ NORMAL";
  const hi=(labResults||[]).filter(l=>l.flag==="high").length;
  const lo=(labResults||[]).filter(l=>l.flag==="low").length;
  const ok=(labResults||[]).filter(l=>l.flag==="normal").length;
  const subtitle = labResults?.length > 0
    ? `Son tetkik · ${new Date(labResults[0].recorded_at).toLocaleDateString("tr-TR")}`
    : "Henüz tetkik yok";
  return (
    <div className="flex-1 p-3 overflow-hidden flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Yüksek Değer" value={hi} total={labResults?.length||0} color={C.rose}    icon={AlertTriangle}/>
        <SummaryCard label="Düşük Değer"  value={lo} total={labResults?.length||0} color={C.amber}   icon={TrendingUp}/>
        <SummaryCard label="Normal"       value={ok} total={labResults?.length||0} color={C.emerald} icon={CheckCircle2}/>
      </div>
      <PanelShell icon={FlaskConical} title="Laboratuvar Sonuçları" subtitle={subtitle}
                  right={
                    <div className="flex gap-1.5">
                      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-white"
                              style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`}}
                              onClick={onAddLab}>
                        <Plus size={11}/>Tetkik Ekle
                      </button>
                    </div>
                  }>
        {!labResults || labResults.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
            <FlaskConical size={32} style={{color:C.textLo}}/>
            <div className="text-center">
              <div className="text-[13px] font-medium text-zinc-300 mb-1">Laboratuvar sonucu yok</div>
              <div className="text-[11px]" style={{color:C.textLo}}>Bu hasta için henüz tetkik kaydı eklenmemiş.</div>
            </div>
            <button onClick={onAddLab}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-white mt-1"
                    style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`}}>
              <Plus size={13}/>İlk Tetkiki Ekle
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
                <tr style={{color:C.textLo}}>
                  {["Tetkik","Tarih","Sonuç","Birim","Referans","Trend","Durum"].map((h,i)=>(
                    <th key={h} className={`${i===0?"text-left":"text-right"} ${i===5?"!text-center":""} px-4 py-2.5 font-medium text-[10.5px] uppercase tracking-wider`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labResults.map((r,i)=>(
                  <tr key={r.id} style={{borderBottom:i<labResults.length-1?`1px solid ${C.borderSoft}`:"none",background:r.flag!=="normal"?fb(r.flag):"transparent"}}>
                    <td className="px-4 py-2.5 text-zinc-100 font-medium">{r.test_name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[11px]" style={{color:C.textLo}}>{new Date(r.recorded_at).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold" style={{color:r.flag==="normal"?C.textHi:fc(r.flag)}}>{r.value}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums" style={{color:C.textMid}}>{r.unit||"—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums" style={{color:C.textLo}}>{r.ref_range||"—"}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span style={{color:r.trend==="up"?C.rose:r.trend==="down"?C.accent:C.textLo}}>
                        {r.trend==="up"?"↑":r.trend==="down"?"↓":"→"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{background:`${fc(r.flag)}1a`,color:fc(r.flag),border:`1px solid ${fc(r.flag)}40`}}>{fl(r.flag)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelShell>
    </div>
  );
}

/* ── LabModal ─────────────────────────────────────────────── */
const LAB_PRESETS = [
  {name:"Hemoglobin",  unit:"g/dL",   ref:"12.0–16.0"},
  {name:"Lökosit",     unit:"10³/µL", ref:"4.0–10.0"},
  {name:"Trombosit",   unit:"10³/µL", ref:"150–400"},
  {name:"CRP",         unit:"mg/L",   ref:"< 5.0"},
  {name:"Sedim (ESR)", unit:"mm/h",   ref:"< 20"},
  {name:"LDH",         unit:"U/L",    ref:"135–225"},
  {name:"S-100B",      unit:"µg/L",   ref:"< 0.15"},
  {name:"Vitamin D",   unit:"ng/mL",  ref:"30–100"},
  {name:"ALT",         unit:"U/L",    ref:"< 40"},
  {name:"AST",         unit:"U/L",    ref:"< 40"},
  {name:"Kreatinin",   unit:"mg/dL",  ref:"0.6–1.2"},
  {name:"Ferritin",    unit:"ng/mL",  ref:"12–150"},
  {name:"TSH",         unit:"mIU/L",  ref:"0.4–4.0"},
  {name:"HbA1c",       unit:"%",      ref:"< 5.7"},
  {name:"Diğer (manuel gir)", unit:"", ref:""},
];

function LabModal({patient, visits, onClose, onSaved}) {
  const [preset, setPreset]       = useState(LAB_PRESETS[0]);
  const [testName, setTestName]   = useState(LAB_PRESETS[0].name);
  const [value, setValue]         = useState("");
  const [unit, setUnit]           = useState(LAB_PRESETS[0].unit);
  const [refRange, setRefRange]   = useState(LAB_PRESETS[0].ref);
  const [flag, setFlag]           = useState("normal");
  const [trend, setTrend]         = useState("stable");
  const [visitId, setVisitId]     = useState("");
  const [saving, setSaving]       = useState(false);

  const handlePreset = (p) => {
    setPreset(p);
    if (p.name !== "Diğer (manuel gir)") setTestName(p.name);
    else setTestName("");
    setUnit(p.unit);
    setRefRange(p.ref);
  };

  const handleSave = async () => {
    if (!testName.trim() || !value) return;
    setSaving(true);
    try {
      await fetch(`${API}/lab-results`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          patient_id: patient.dbId,
          visit_id: visitId || undefined,
          test_name: testName.trim(),
          value: parseFloat(value),
          unit: unit.trim() || undefined,
          ref_range: refRange.trim() || undefined,
          flag,
          trend,
        }),
      });
      onSaved();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const inp = "w-full rounded-lg px-3 py-2 text-[12px] text-zinc-200 focus:outline-none";
  const inpStyle = {background:C.bg, border:`1px solid ${C.border}`};
  const lbl = "block text-[11px] font-medium mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.7)"}}>
      <div className="rounded-xl w-[480px] shadow-2xl flex flex-col" style={{background:C.surface,border:`1px solid ${C.border}`}}>
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:`1px solid ${C.border}`}}>
          <div className="flex items-center gap-2">
            <FlaskConical size={16} style={{color:C.primary}}/>
            <span className="text-[14px] font-semibold text-zinc-100">Tetkik Sonucu Ekle</span>
          </div>
          <button onClick={onClose} style={{color:C.textLo}}><X size={16}/></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className={lbl} style={{color:C.textMid}}>Tetkik Seç</label>
            <select className={inp} style={inpStyle} value={preset.name}
                    onChange={e=>handlePreset(LAB_PRESETS.find(p=>p.name===e.target.value)||LAB_PRESETS[0])}>
              {LAB_PRESETS.map(p=><option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          {preset.name === "Diğer (manuel gir)" && (
            <div>
              <label className={lbl} style={{color:C.textMid}}>Tetkik Adı</label>
              <input className={inp} style={inpStyle} placeholder="Tetkik adı" value={testName} onChange={e=>setTestName(e.target.value)}/>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={lbl} style={{color:C.textMid}}>Sonuç</label>
              <input type="number" className={inp} style={inpStyle} placeholder="0.0" value={value}
                     onChange={e=>setValue(e.target.value)}/>
            </div>
            <div>
              <label className={lbl} style={{color:C.textMid}}>Birim</label>
              <input className={inp} style={inpStyle} placeholder="g/dL" value={unit} onChange={e=>setUnit(e.target.value)}/>
            </div>
            <div>
              <label className={lbl} style={{color:C.textMid}}>Referans</label>
              <input className={inp} style={inpStyle} placeholder="12–16" value={refRange} onChange={e=>setRefRange(e.target.value)}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl} style={{color:C.textMid}}>Durum</label>
              <select className={inp} style={inpStyle} value={flag} onChange={e=>setFlag(e.target.value)}>
                <option value="normal">✓ Normal</option>
                <option value="high">↑ Yüksek</option>
                <option value="low">↓ Düşük</option>
              </select>
            </div>
            <div>
              <label className={lbl} style={{color:C.textMid}}>Trend</label>
              <select className={inp} style={inpStyle} value={trend} onChange={e=>setTrend(e.target.value)}>
                <option value="stable">→ Sabit</option>
                <option value="up">↑ Yükseliyor</option>
                <option value="down">↓ Düşüyor</option>
              </select>
            </div>
          </div>
          {visits && visits.length > 0 && (
            <div>
              <label className={lbl} style={{color:C.textMid}}>Ziyaret (opsiyonel)</label>
              <select className={inp} style={inpStyle} value={visitId} onChange={e=>setVisitId(e.target.value)}>
                <option value="">Ziyarete bağlama</option>
                {visits.map(v=>(
                  <option key={v.id} value={v.id}>
                    {new Date(v.visit_date).toLocaleDateString("tr-TR")} — {v.complaint||"Muayene"}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="px-5 py-4 flex justify-end gap-2" style={{borderTop:`1px solid ${C.border}`}}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[12px]"
                  style={{border:`1px solid ${C.border}`,color:C.textMid}}>İptal</button>
          <button onClick={handleSave} disabled={saving||!testName.trim()||!value}
                  className="px-4 py-2 rounded-lg text-[12px] font-medium text-white disabled:opacity-50"
                  style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`}}>
            {saving?"Kaydediliyor…":"Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── NewVisitModal ───────────────────────────────────────── */
function NewVisitModal({patient, onClose, onSave}) {
  const [complaint, setComplaint] = useState("");
  const [notes, setNotes]         = useState("");
  const [saving, setSaving]       = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/visits`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          patient_id: patient.dbId,
          complaint: complaint.trim() || "Rutin muayene",
          notes: notes.trim() || undefined,
        }),
      });
      const visit = await res.json();
      onSave(visit);
    } finally { setSaving(false); }
  };

  const inp = "w-full rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none";
  const focus = e => (e.target.style.borderColor = C.primary+"66");
  const blur  = e => (e.target.style.borderColor = C.border);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
      <div className="w-[500px] rounded-2xl flex flex-col" style={{background:C.surface,border:`1px solid ${C.border}`}}>
        <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:`1px solid ${C.border}`}}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                 style={{background:`${C.primary}1a`,border:`1px solid ${C.primary}40`}}>
              <Stethoscope size={14} style={{color:C.primary}}/>
            </div>
            <div>
              <div className="text-[15px] font-semibold text-zinc-100">Yeni Muayene</div>
              <div className="text-[11px]" style={{color:C.textLo}}>{patient.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{color:C.textMid}}><X size={16}/></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Şikayet *</label>
            <input value={complaint} onChange={e=>setComplaint(e.target.value)}
                   placeholder="Örn: Sol omuzda kaşıntılı leke, renk değişimi var"
                   className={inp} style={{background:C.bg,border:`1px solid ${C.border}`}}
                   onFocus={focus} onBlur={blur}/>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Muayene Bulguları</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                      placeholder="Fizik muayene bulguları, ABCDE skoru, ön tanı notları…"
                      rows={4}
                      className={`${inp} resize-none`}
                      style={{background:C.bg,border:`1px solid ${C.border}`}}
                      onFocus={focus} onBlur={blur}/>
          </div>
        </div>
        <div className="px-5 py-3 flex justify-end gap-2" style={{borderTop:`1px solid ${C.border}`}}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]"
                  style={{border:`1px solid ${C.border}`,color:C.textMid}}>İptal</button>
          <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 rounded-lg text-[13px] font-medium text-white flex items-center gap-1.5 disabled:opacity-50"
                  style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`,boxShadow:`0 4px 12px -4px ${C.primary}80`}}>
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
            {saving ? "Kaydediliyor…" : "Muayeneyi Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── VisitDetailModal ────────────────────────────────────── */
function VisitDetailModal({visit, patient, onClose, onAnalyze, onUpdated}) {
  const [complaint, setComplaint] = useState(visit.complaint || "");
  const [notes, setNotes]         = useState(visit.notes || "");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const visitDate = new Date(visit.visit_date).toLocaleString("tr-TR",{
    day:"2-digit", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit"
  });
  const analyses = visit.analysis_results || [];

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const res = await fetch(`${API}/visits/${visit.id}`, {
        method: "PATCH",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          complaint: complaint.trim() || undefined,
          notes:     notes.trim()     || undefined,
        }),
      });
      const updated = await res.json();
      onUpdated(updated);
      setSaved(true);
      setTimeout(()=>setSaved(false), 2000);
    } finally { setSaving(false); }
  };

  const inp = "w-full rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none";
  const focus = e => (e.target.style.borderColor = C.primary+"66");
  const blur  = e => (e.target.style.borderColor = C.border);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
      <div className="w-[560px] rounded-2xl flex flex-col max-h-[90vh]"
           style={{background:C.surface,border:`1px solid ${C.border}`}}>
        <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:`1px solid ${C.border}`}}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                 style={{background:`${C.primary}1a`,border:`1px solid ${C.primary}40`}}>
              <Clock size={14} style={{color:C.primary}}/>
            </div>
            <div>
              <div className="text-[15px] font-semibold text-zinc-100">Muayene Detayı</div>
              <div className="text-[11px]" style={{color:C.textLo}}>{visitDate} · {patient.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{color:C.textMid}}><X size={16}/></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Şikayet</label>
            <input value={complaint} onChange={e=>setComplaint(e.target.value)}
                   placeholder="Şikayet giriniz…"
                   className={inp} style={{background:C.bg,border:`1px solid ${C.border}`}}
                   onFocus={focus} onBlur={blur}/>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Muayene Bulguları / Notlar</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
                      placeholder="Fizik muayene bulguları, ABCDE skoru, ön tanı, follow-up planı…"
                      rows={5}
                      className={`${inp} resize-none`}
                      style={{background:C.bg,border:`1px solid ${C.border}`}}
                      onFocus={focus} onBlur={blur}/>
          </div>

          {analyses.length > 0 && (
            <div>
              <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Bu Ziyarete Bağlı Analizler</label>
              <div className="space-y-1.5">
                {analyses.map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                       style={{background:C.bg,border:`1px solid ${C.border}`}}>
                    <div className="h-2 w-2 rounded-full" style={{background:a.confidence>=0.7?C.rose:C.emerald}}/>
                    <span className="text-[12px] text-zinc-100 flex-1">{a.disease_name}</span>
                    <span className="text-[11px]" style={{color:C.textMid}}>Güven: {Math.round((a.confidence||0)*100)}%</span>
                    <span className="text-[10.5px] font-mono" style={{color:C.textLo}}>
                      {new Date(a.analyzed_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 flex items-center justify-between gap-2" style={{borderTop:`1px solid ${C.border}`}}>
          <button onClick={()=>{onAnalyze(visit); onClose();}}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-medium"
                  style={{background:`${C.accent}1a`,border:`1px solid ${C.accent}55`,color:"#67e8f9"}}>
            <Sparkles size={13}/>Bu Ziyarete Analiz Ekle
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]"
                    style={{border:`1px solid ${C.border}`,color:C.textMid}}>Kapat</button>
            <button onClick={handleSave} disabled={saving}
                    className="px-5 py-2 rounded-lg text-[13px] font-medium text-white flex items-center gap-1.5 disabled:opacity-50"
                    style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`,boxShadow:`0 4px 12px -4px ${C.primary}80`}}>
              {saving ? <Loader2 size={14} className="animate-spin"/> : saved ? <Check size={14}/> : <Check size={14}/>}
              {saving ? "Kaydediliyor…" : saved ? "Kaydedildi ✓" : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AnalyzeForVisitModal ────────────────────────────────── */
function AnalyzeForVisitModal({visit, patient, onClose, onSubmit}) {
  const [imageUrl, setImageUrl] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
      <div className="w-[440px] rounded-2xl flex flex-col" style={{background:C.surface,border:`1px solid ${C.border}`}}>
        <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:`1px solid ${C.border}`}}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                 style={{background:`${C.accent}1a`,border:`1px solid ${C.accent}40`}}>
              <Sparkles size={14} style={{color:C.accent}}/>
            </div>
            <div>
              <div className="text-[15px] font-semibold text-zinc-100">Analiz Ekle</div>
              <div className="text-[11px]" style={{color:C.textLo}}>{visit.complaint || "Muayene"} · {patient.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{color:C.textMid}}><X size={16}/></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Görsel URL <span style={{color:C.textLo}}>(opsiyonel)</span></label>
            <input value={imageUrl} onChange={e=>setImageUrl(e.target.value)}
                   placeholder="https://… (boş = mock görsel)"
                   className="w-full rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                   style={{background:C.bg,border:`1px solid ${C.border}`}}
                   onFocus={e=>(e.target.style.borderColor=C.accent+"66")}
                   onBlur={e=>(e.target.style.borderColor=C.border)}/>
          </div>
          <div className="text-[11px] px-3 py-2 rounded-lg" style={{background:`${C.accent}0d`,border:`1px solid ${C.accent}25`,color:C.textMid}}>
            NovaVision (mock) + PUQ.ai raporu bu ziyarete bağlı olarak kaydedilecek.
          </div>
        </div>
        <div className="px-5 py-3 flex justify-end gap-2" style={{borderTop:`1px solid ${C.border}`}}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]"
                  style={{border:`1px solid ${C.border}`,color:C.textMid}}>İptal</button>
          <button onClick={()=>onSubmit({image_url: imageUrl.trim() || "https://example.com/dermoscopy.jpg"})}
                  className="px-5 py-2 rounded-lg text-[13px] font-medium text-white flex items-center gap-1.5"
                  style={{background:`linear-gradient(135deg,${C.accent},${C.accentDim})`,boxShadow:`0 4px 12px -4px ${C.accent}80`}}>
            <Sparkles size={14}/>Analizi Başlat
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── PrescriptionModal ───────────────────────────────────── */
function PrescriptionModal({onClose,onSave}) {
  const [diagnosis,setDiagnosis]=useState("");
  const [drugs,setDrugs]=useState([{name:"",dose:"",duration:""}]);
  const [query,setQuery]=useState("");
  const [focusIdx,setFocusIdx]=useState(null);
  const suggestions=DRUG_SUGGESTIONS.filter(d=>query.length>1&&d.toLowerCase().includes(query.toLowerCase()));
  const addDrug=()=>setDrugs(d=>[...d,{name:"",dose:"",duration:""}]);
  const removeDrug=i=>setDrugs(d=>d.filter((_,idx)=>idx!==i));
  const updateDrug=(i,f,v)=>setDrugs(d=>d.map((item,idx)=>idx===i?{...item,[f]:v}:item));
  const handleSave=()=>{
    if(!diagnosis.trim())return;
    onSave({id:`RX-${Math.floor(8900+Math.random()*99)}`,date:"Bugün",status:"active",diagnosis,drugs:drugs.filter(d=>d.name)});
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}}>
      <div className="w-[560px] rounded-2xl flex flex-col max-h-[90vh]"
           style={{background:C.surface,border:`1px solid ${C.border}`}}>
        <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:`1px solid ${C.border}`}}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                 style={{background:`${C.primary}1a`,border:`1px solid ${C.primary}40`}}><Pill size={14} style={{color:C.primary}}/></div>
            <span className="text-[15px] font-semibold text-zinc-100">Yeni Reçete</span>
          </div>
          <button onClick={onClose} style={{color:C.textMid}}><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider block mb-1.5" style={{color:C.textLo}}>Tanı</label>
            <input value={diagnosis} onChange={e=>setDiagnosis(e.target.value)}
                   placeholder="Örn: Atopik dermatit alevlenme"
                   className="w-full rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                   style={{background:C.bg,border:`1px solid ${C.border}`}}
                   onFocus={e=>(e.target.style.borderColor=C.primary+"66")}
                   onBlur={e=>(e.target.style.borderColor=C.border)}/>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase tracking-wider" style={{color:C.textLo}}>İlaçlar</label>
              <button onClick={addDrug} className="text-[11px] flex items-center gap-1" style={{color:C.primary}}><Plus size={12}/>İlaç ekle</button>
            </div>
            <div className="space-y-2.5">
              {drugs.map((drug,i)=>(
                <div key={i} className="rounded-lg p-3 relative" style={{background:C.bg,border:`1px solid ${C.border}`}}>
                  {drugs.length>1&&<button onClick={()=>removeDrug(i)} className="absolute top-2 right-2" style={{color:C.rose}}><Trash2 size={12}/></button>}
                  <div className="relative mb-2">
                    <input value={drug.name}
                           onChange={e=>{updateDrug(i,"name",e.target.value);setQuery(e.target.value);setFocusIdx(i);}}
                           onBlur={()=>setTimeout(()=>setFocusIdx(null),150)}
                           placeholder="İlaç adı…"
                           className="w-full rounded-md px-2.5 py-1.5 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                           style={{background:C.surfaceAlt,border:`1px solid ${C.border}`}}/>
                    {focusIdx===i&&suggestions.length>0&&(
                      <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg overflow-hidden"
                           style={{background:C.surface,border:`1px solid ${C.border}`}}>
                        {suggestions.slice(0,5).map(s=>(
                          <button key={s} onMouseDown={()=>{updateDrug(i,"name",s);setQuery("");setFocusIdx(null);}}
                                  className="w-full text-left px-3 py-1.5 text-[12px] text-zinc-200 hover:bg-zinc-700/50">{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[["dose","Doz (örn: Günde 2x)"],["duration","Süre (örn: 7 gün)"]].map(([f,ph])=>(
                      <input key={f} value={drug[f]} onChange={e=>updateDrug(i,f,e.target.value)} placeholder={ph}
                             className="rounded-md px-2.5 py-1.5 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                             style={{background:C.surfaceAlt,border:`1px solid ${C.border}`}}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{background:`${C.amber}0d`,border:`1px solid ${C.amber}30`}}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{color:C.amber}}/>
              <p className="text-[11px] leading-relaxed" style={{color:"#fcd34d"}}>
                Reçete bilgileri klinik sorumluluğunuz altındadır. Doz ve etkileşim kontrolü yapınız.
              </p>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 flex justify-end gap-2" style={{borderTop:`1px solid ${C.border}`}}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]"
                  style={{border:`1px solid ${C.border}`,color:C.textMid}}>İptal</button>
          <button onClick={handleSave}
                  className="px-5 py-2 rounded-lg text-[13px] font-medium text-white flex items-center gap-1.5"
                  style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`,boxShadow:`0 4px 12px -4px ${C.primary}80`}}>
            <Check size={14}/>Reçeteyi Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── PrescriptionsTab ────────────────────────────────────── */
function PrescriptionsTab({prescriptions,openModal}) {
  return (
    <div className="flex-1 p-3 overflow-hidden flex flex-col gap-3">
      <PanelShell icon={FileText} title="Reçete Geçmişi" subtitle={`${prescriptions.length} reçete`}
                  right={
                    <button onClick={openModal}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-white"
                            style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`,boxShadow:`0 4px 12px -4px ${C.primary}80`}}>
                      <Plus size={13}/>Yeni Reçete Oluştur
                    </button>
                  }>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {prescriptions.map(rx=>(
            <div key={rx.id} className="rounded-lg p-4" style={{background:C.bg,border:`1px solid ${C.border}`}}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-zinc-100">{rx.diagnosis}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={rx.status==="active"?{background:`${C.emerald}1a`,color:C.emerald,border:`1px solid ${C.emerald}40`}:{background:C.surfaceAlt,color:C.textMid,border:`1px solid ${C.border}`}}>
                      {rx.status==="active"?"AKTİF":"TAMAMLANDI"}
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono mt-0.5" style={{color:C.textLo}}>{rx.id} · {rx.date}</div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded" style={{color:C.textMid}}><Download size={13}/></button>
                  <button className="p-1.5 rounded" style={{color:C.textMid}}><Printer size={13}/></button>
                </div>
              </div>
              <div className="space-y-2">
                {rx.drugs.map((d,i)=>(
                  <div key={i} className="flex items-center gap-3 text-[12px]">
                    <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{background:C.primary}}/>
                    <span className="font-medium text-zinc-200 flex-1">{d.name}</span>
                    <span style={{color:C.textMid}}>{d.dose}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded" style={{background:C.surfaceAlt,color:C.textLo}}>{d.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PanelShell>
    </div>
  );
}

/* ── ActionBar ───────────────────────────────────────────── */
function ActionBar({patient, openPrescription, onNewVisit, analyzing}) {
  const crit=patient.status==="critical";
  return (
    <div className="h-14 shrink-0 px-5 flex items-center gap-3" style={{background:C.surface,borderTop:`1px solid ${C.border}`}}>
      <div className="flex items-center gap-1.5 text-[10.5px] mr-2" style={{color:C.textLo}}>
        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{background:crit?C.rose:C.emerald}}/>
        {crit?"Acil değerlendirme gerekli":"Rutin takip"}
      </div>
      <div className="flex-1"/>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-medium transition-all hover:opacity-90"
              style={{border:`1px solid ${C.border}`,color:C.textMid,background:"transparent"}}>
        <FileSignature size={14}/>Tanıyı Onayla
      </button>
      <button onClick={openPrescription}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-medium transition-all hover:opacity-90"
              style={{background:`${C.primary}15`,border:`1px solid ${C.primary}50`,color:"#c4b5fd"}}>
        <Pill size={14}/>Reçete Oluştur
      </button>
      <button onClick={onNewVisit} disabled={analyzing || !patient.dbId}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{background:`linear-gradient(135deg,${C.primary}33,${C.primary}11)`,border:`1px solid ${C.primary}55`,color:"#c4b5fd"}}>
        {analyzing ? <Loader2 size={14} className="animate-spin"/> : <Stethoscope size={14}/>}
        {analyzing ? "Analiz Çalışıyor…" : "Yeni Muayene Başlat"}
      </button>
    </div>
  );
}

/* ── Dashboard (root) ────────────────────────────────────── */
export default function Dashboard() {
  const [patients, setPatients] = useState(PATIENTS_MOCK);
  const [activePatient, setActivePatient] = useState(PATIENTS_MOCK[0]);
  const [activeTab, setActiveTab] = useState("Özet");
  const [prescriptions, setPrescriptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);
  const [analyzing, setAnalyzing]   = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showNewVisit, setShowNewVisit]       = useState(false);
  const [selectedVisit, setSelectedVisit]     = useState(null);
  const [pendingVisitAnalysis, setPendingVisitAnalysis] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [visits, setVisits] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [lesionMeasurements, setLesionMeasurements] = useState([]);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [labResults, setLabResults] = useState([]);
  const [showLabModal, setShowLabModal] = useState(false);
  const [sidebarView, setSidebarView] = useState("hastalar");

  const loadPatients = () =>
    fetch(`${API}/patients`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapApiPatient);
          setPatients(mapped);
          return mapped;
        }
        return null;
      })
      .catch(() => null);

  useEffect(() => { loadPatients().then(mapped => { if (mapped) setActivePatient(mapped[0]); }); }, []);

  const loadVitalsData = (patientId) => {
    fetch(`${API}/patients/${patientId}/vitals`)
      .then(r => r.json())
      .then(d => setVitals(Array.isArray(d) ? d : []))
      .catch(() => setVitals([]));
    fetch(`${API}/patients/${patientId}/lesion-measurements`)
      .then(r => r.json())
      .then(d => setLesionMeasurements(Array.isArray(d) ? d : []))
      .catch(() => setLesionMeasurements([]));
  };

  const loadLabData = (patientId) => {
    fetch(`${API}/patients/${patientId}/lab-results`)
      .then(r => r.json())
      .then(d => setLabResults(Array.isArray(d) ? d : []))
      .catch(() => setLabResults([]));
  };

  useEffect(() => {
    if (!activePatient?.dbId) {
      setChatMessages([]);
      setLatestAnalysis(null);
      setVisits([]);
      setVitals([]);
      setLesionMeasurements([]);
      setLabResults([]);
      return;
    }
    fetch(`${API}/patients/${activePatient.dbId}/history`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setChatMessages([{role:"ai", text:`Merhaba. ${activePatient.name} için henüz analiz kaydı bulunmuyor. Yeni muayene başlatarak ilk analizi ekleyebilirsiniz.`, time:now()}]);
          setLatestAnalysis(null);
          return;
        }
        setLatestAnalysis(data[0]);
        const msgs = [];
        [...data].reverse().forEach(ar => {
          const t = new Date(ar.analyzed_at).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
          msgs.push({role:"doc", text:`Analiz: ${ar.disease_name} · Güven: %${Math.round((ar.confidence||0)*100)}`, time:t});
          (ar.ai_reports || []).forEach(rep => {
            if (rep.report_text) msgs.push({role:"ai", text: rep.report_text, time:t});
          });
        });
        if (msgs.length === 0) {
          msgs.push({role:"ai", text:`${activePatient.name} için analiz geçmişi yüklendi. Soru sormaya başlayabilirsiniz.`, time:now()});
        }
        setChatMessages(msgs);
      })
      .catch(() => { setChatMessages([]); setLatestAnalysis(null); });

    fetch(`${API}/patients/${activePatient.dbId}/visits`)
      .then(r => r.json())
      .then(data => setVisits(Array.isArray(data) ? data : []))
      .catch(() => setVisits([]));

    fetch(`${API}/patients/${activePatient.dbId}/prescriptions`)
      .then(r => r.json())
      .then(data => setPrescriptions(Array.isArray(data) ? data.map(rx => ({
        id: rx.id,
        date: new Date(rx.created_at).toLocaleDateString("tr-TR"),
        status: rx.status,
        diagnosis: rx.diagnosis,
        drugs: rx.drugs || [],
        _dbId: rx.id,
      })) : []))
      .catch(() => setPrescriptions([]));

    loadVitalsData(activePatient.dbId);
    loadLabData(activePatient.dbId);
  }, [activePatient?.dbId]);

  const analyze = async ({complaint, image_url, visit_id}) => {
    const patientId = activePatient.dbId;
    if (!patientId || analyzing) return;

    setAnalyzing(true);
    setActiveTab("Özet");
    setChatMessages(m => [...m, {
      role: "doc",
      text: `Analiz başlatıldı${complaint ? ` · ${complaint}` : ""}`,
      time: now()
    }]);

    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, image_url, complaint, visit_id })
      });
      const data = await res.json();
      const report = data.report && data.report !== "PUQ.ai rapor oluşturamadı."
        ? data.report
        : "Rapor oluşturulamadı. Lütfen tekrar deneyin.";
      setLatestAnalysis({ disease_name: data.disease, confidence: data.confidence, analyzed_at: new Date().toISOString() });
      fetch(`${API}/patients/${patientId}/visits`).then(r=>r.json()).then(d=>setVisits(Array.isArray(d)?d:[])).catch(()=>{});
      if (data.is_mock) {
        setChatMessages(m => [...m, {
          role: "ai",
          text: "⚠️ NovaVision modeline ulaşılamadı — bu sonuç demo verileriyle üretilmiştir, klinik karar için kullanmayın.",
          time: now()
        }]);
      }
      setChatMessages(m => [...m, { role: "ai", text: report, time: now() }]);
    } catch {
      setChatMessages(m => [...m, {
        role: "ai",
        text: "Backend bağlantısı kurulamadı. localhost:8000 çalışıyor mu kontrol edin.",
        time: now()
      }]);
    } finally {
      setAnalyzing(false);
    }
  };

  const sendChat = async (message) => {
    setChatMessages(m => [...m, {role:"doc", text:message, time:now()}]);
    if (!activePatient?.dbId) {
      setChatMessages(m => [...m, {role:"ai", text:"Lütfen önce gerçek bir hasta seçin.", time:now()}]);
      return;
    }
    setChatLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          patient_id: activePatient.dbId,
          message,
          history: chatMessages.slice(-10).map(m => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();
      setChatMessages(m => [...m, {role:"ai", text: data.reply || "Yanıt alınamadı.", time:now()}]);
    } catch {
      setChatMessages(m => [...m, {role:"ai", text:"PUQ.ai bağlantısı kurulamadı.", time:now()}]);
    } finally {
      setChatLoading(false);
    }
  };

  const openModal = () => { setShowModal(true); setActiveTab("Reçeteler"); };
  const closeModal = () => setShowModal(false);
  const savePrescription = async (rx) => {
    if (activePatient?.dbId) {
      try {
        const res = await fetch(`${API}/prescriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: activePatient.dbId,
            diagnosis:  rx.diagnosis,
            drugs:      rx.drugs,
            status:     rx.status || "active",
          }),
        });
        if (res.ok) {
          const saved = await res.json();
          setPrescriptions(p => [{
            id: saved.id, _dbId: saved.id,
            date: new Date(saved.created_at).toLocaleDateString("tr-TR"),
            status: saved.status, diagnosis: saved.diagnosis, drugs: saved.drugs || [],
          }, ...p]);
          return;
        }
      } catch {}
    }
    setPrescriptions(p => [rx, ...p]);
  };

  const navigateToPatient = (patientId) => {
    const found = patients.find(p => p.dbId === patientId);
    if (found) { setActivePatient(found); setActiveTab("Özet"); setSidebarView("hastalar"); }
  };

  const deletePatient = async (p) => {
    if (!window.confirm(`"${p.name}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    await fetch(`${API}/patients/${p.dbId}`, { method: "DELETE" });
    const mapped = await loadPatients();
    if (mapped && mapped.length > 0) setActivePatient(mapped[0]);
    else { setPatients(PATIENTS_MOCK); setActivePatient(PATIENTS_MOCK[0]); }
  };

  const handlePatientAdded = async (newPatient) => {
    setShowAddPatient(false);
    const mapped = await loadPatients();
    if (mapped) {
      const match = mapped.find(p => p.dbId === newPatient.id) || mapped[0];
      setActivePatient(match);
    }
    setActiveTab("Özet");
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden font-sans" style={{background:C.bg,color:C.textHi}}>
      <PatientSidebar patients={patients} active={activePatient}
                      onAddPatient={() => setShowAddPatient(true)}
                      onDeletePatient={deletePatient}
                      setActive={p => { setActivePatient(p); setActiveTab("Özet"); setSidebarView("hastalar"); }}
                      sidebarView={sidebarView} setSidebarView={setSidebarView}/>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {sidebarView !== "hastalar" ? (
          <>
            {sidebarView === "randevular" && <RandevularPage patients={patients} onNavigateToPatient={navigateToPatient}/>}
            {sidebarView === "arsiv"      && <ArsivPage onNavigateToPatient={navigateToPatient}/>}
            {sidebarView === "ayarlar"    && (
              <>
                <div className="h-14 flex items-center px-5" style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
                  <span className="text-[14px] font-semibold text-zinc-300">Ayarlar</span>
                </div>
                <main className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <ComingSoonPage icon={Settings} title="Ayarlar" description="Sistem ve kullanıcı tercihlerini yapılandırın." color={C.primary}/>
                </main>
              </>
            )}
          </>
        ) : (
          <>
            <Header patient={activePatient} activeTab={activeTab} setActiveTab={setActiveTab} latestAnalysis={latestAnalysis}/>
            <main className="flex-1 overflow-hidden flex flex-col min-h-0">
              {activeTab==="Özet"       && <SummaryTab chatMessages={chatMessages} setMessages={setChatMessages} analyzing={analyzing} chatLoading={chatLoading} onSend={sendChat} latestAnalysis={latestAnalysis} visits={visits} onVisitClick={setSelectedVisit} onNewVisit={()=>setShowNewVisit(true)} hasPatient={!!activePatient?.dbId} vitals={vitals} lesionMeasurements={lesionMeasurements} onAddVitals={()=>setShowVitalsModal(true)}/>}
              {activeTab==="Görüntüler" && <ImagesTab analyses={visits.flatMap(v => v.analysis_results || [])}/>}
              {activeTab==="Lab"        && <LabTab labResults={labResults} onAddLab={()=>setShowLabModal(true)}/>}
              {activeTab==="Reçeteler"  && <PrescriptionsTab prescriptions={prescriptions} openModal={openModal}/>}
            </main>
            <ActionBar patient={activePatient} openPrescription={openModal} onNewVisit={()=>setShowNewVisit(true)} analyzing={analyzing}/>
          </>
        )}
      </div>
      {showModal && <PrescriptionModal onClose={closeModal} onSave={savePrescription}/>}
      {showAddPatient && <AddPatientModal onClose={()=>setShowAddPatient(false)} onSave={handlePatientAdded}/>}
      {showNewVisit && (
        <NewVisitModal
          patient={activePatient}
          onClose={()=>setShowNewVisit(false)}
          onSave={visit => {
            setVisits(vs => [visit, ...vs]);
            setShowNewVisit(false);
            setSelectedVisit(visit);
          }}
        />
      )}
      {selectedVisit && (
        <VisitDetailModal
          visit={selectedVisit}
          patient={activePatient}
          onClose={()=>{ setSelectedVisit(null); setPendingVisitAnalysis(null); }}
          onAnalyze={visit => { setPendingVisitAnalysis(visit); }}
          onUpdated={updated => {
            setVisits(vs => vs.map(v => v.id === updated.id ? {...v, ...updated} : v));
            setSelectedVisit(s => ({...s, ...updated}));
          }}
        />
      )}
      {showVitalsModal && activePatient?.dbId && (
        <VitalsModal
          patient={activePatient}
          visits={visits}
          onClose={()=>setShowVitalsModal(false)}
          onSaved={()=>{ setShowVitalsModal(false); loadVitalsData(activePatient.dbId); }}
        />
      )}
      {showLabModal && activePatient?.dbId && (
        <LabModal
          patient={activePatient}
          visits={visits}
          onClose={()=>setShowLabModal(false)}
          onSaved={()=>{ setShowLabModal(false); loadLabData(activePatient.dbId); }}
        />
      )}
      {pendingVisitAnalysis && !selectedVisit && (
        <AnalyzeForVisitModal
          visit={pendingVisitAnalysis}
          patient={activePatient}
          onClose={()=>setPendingVisitAnalysis(null)}
          onSubmit={({image_url})=>{
            setPendingVisitAnalysis(null);
            analyze({
              complaint: pendingVisitAnalysis.complaint,
              image_url,
              visit_id: pendingVisitAnalysis.id,
            });
          }}
        />
      )}
    </div>
  );
}
