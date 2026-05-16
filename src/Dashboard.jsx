import React, { useState, useRef, useEffect } from "react";
import {
  Users, Calendar, Archive, Settings, Search, Bell, ChevronDown,
  Activity, AlertTriangle, ShieldCheck, Flame, Maximize2,
  Send, Sparkles, FileSignature, Pill, FileDown, MoreHorizontal,
  Heart, Thermometer, TrendingUp, Clock, CheckCircle2,
  Stethoscope, Eye, EyeOff, ZoomIn, MessageSquare, Plus, Layers,
  LogOut, X, Image as ImageIcon, FlaskConical, FileText,
  Download, Printer, Trash2, ChevronRight, Check
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Area, AreaChart, CartesianGrid
} from "recharts";

const C = {
  bg:"#13131f", surface:"#1c1c2e", surfaceAlt:"#22223a",
  border:"#2d2d44", borderSoft:"#252538", primary:"#8b5cf6",
  primaryDim:"#7c3aed", accent:"#22d3ee", accentDim:"#0891b2",
  rose:"#f43f5e", amber:"#f59e0b", emerald:"#10b981",
  textHi:"#f4f4f5", textMid:"#a1a1aa", textLo:"#71717a",
};

const PATIENTS = [
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

/* ── PatientSidebar ─────────────────────────────────────── */
function PatientSidebar({active,setActive}) {
  const dot=s=>s==="critical"?"bg-rose-500":s==="monitor"?"bg-amber-400":"bg-emerald-400";
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
        {[{icon:Users,label:"Hastalar",badge:"24",a:true},{icon:Calendar,label:"Randevular",badge:"7"},
          {icon:Archive,label:"Arşiv"},{icon:Settings,label:"Ayarlar"}].map(({icon:Icon,label,badge,a})=>(
          <button key={label}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors"
                  style={a?{background:`linear-gradient(90deg,${C.primary}25,${C.primary}08)`,borderLeft:`2px solid ${C.primary}`,color:"white"}:{color:C.textMid}}
                  onMouseEnter={e=>!a&&(e.currentTarget.style.background=C.surfaceAlt)}
                  onMouseLeave={e=>!a&&(e.currentTarget.style.background="transparent")}>
            <Icon size={15} style={a?{color:C.primary}:{}}/>
            <span className="flex-1 text-left">{label}</span>
            {badge&&<span className="text-[10px] px-1.5 py-0.5 rounded tabular-nums"
                          style={{background:a?`${C.primary}33`:C.surfaceAlt,color:a?C.primary:C.textMid}}>{badge}</span>}
          </button>
        ))}
      </nav>
      <div className="p-3" style={{borderBottom:`1px solid ${C.border}`}}>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{color:C.textLo}}/>
          <input placeholder="Hasta ara…"
                 className="w-full rounded-lg pl-8 pr-2 py-2 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                 style={{background:C.bg,border:`1px solid ${C.border}`}}
                 onFocus={e=>(e.target.style.borderColor=C.primary+"66")}
                 onBlur={e=>(e.target.style.borderColor=C.border)}/>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{color:C.textLo}}>Bugünkü liste</span>
          <button style={{color:C.textLo}}><Plus size={12}/></button>
        </div>
        {PATIENTS.map(p=>{
          const sel=p.id===active.id;
          return (
            <button key={p.id} onClick={()=>setActive(p)}
                    className="w-full text-left px-2 py-2 rounded-lg flex items-center gap-2.5 transition-colors"
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
                <div className="text-[10.5px] truncate" style={{color:C.textLo}}>{p.id} · {p.lastVisit}</div>
              </div>
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
function Header({patient,activeTab,setActiveTab}) {
  const crit=patient.status==="critical";
  return (
    <header className="h-14 flex items-center px-5 gap-4" style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md flex items-center justify-center text-[11px] font-medium text-zinc-100"
             style={{background:C.surfaceAlt,border:`1px solid ${C.border}`}}>{patient.initials}</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-zinc-100">{patient.name}</span>
            <span className="text-[11px] font-mono" style={{color:C.textLo}}>{patient.id}</span>
          </div>
          <div className="text-[11px]" style={{color:C.textLo}}>
            {patient.age} yaş · {patient.sex==="K"?"Kadın":"Erkek"} · Son muayene: {patient.lastVisit}
          </div>
        </div>
      </div>
      <div className="h-6 w-px" style={{background:C.border}}/>
      <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-[11.5px] font-medium"
           style={crit?{background:`${C.rose}15`,border:`1px solid ${C.rose}40`,color:"#fda4af"}:{background:`${C.emerald}15`,border:`1px solid ${C.emerald}40`,color:"#6ee7b7"}}>
        {crit?<AlertTriangle size={13}/>:<ShieldCheck size={13}/>}
        <span>PUQ.ai · {crit?"Kritik":"Stabil"}</span>
        <span style={{color:C.textLo}}>|</span>
        <span style={{color:C.textMid}}>Risk: {crit?"0.82":"0.24"}</span>
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
function NovaVisionViewer() {
  const [heatmap,setHeatmap]=useState(false);
  const [overlay,setOverlay]=useState(true);
  return (
    <PanelShell icon={Eye} title="NovaVision Vizör" subtitle="DRM-0419 · 12.3 MP · 10x" tone="accent"
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
                   style={{background:C.accent}}>lesion_a · 6.9mm · conf 0.94</div>
              <div className="absolute -bottom-5 right-0 text-[10px] font-mono px-1.5 py-0.5 rounded text-zinc-900"
                   style={{background:C.amber}}>ABCDE: 0.71 ↑</div>
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
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{background:C.accent}}/>
          NovaVision · LIVE · 0.94 confidence
        </div>
      </div>
      <div className="grid grid-cols-4" style={{borderTop:`1px solid ${C.border}`}}>
        {[{label:"Çap",v:"6.9",u:"mm",trend:"+0.5",crit:false},{label:"Asimetri",v:"0.71",u:"",trend:"+18%",crit:true},
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
function MedicalHistory() {
  return (
    <PanelShell icon={Clock} title="Longitudinal Süreç" subtitle="9 ay"
                right={<button className="text-[11px] hover:text-zinc-200" style={{color:C.textMid}}>Tümünü gör →</button>}>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="relative">
          <div className="absolute left-[7px] top-1 bottom-1 w-px"
               style={{background:`linear-gradient(to bottom,${C.border},${C.primary}66)`}}/>
          {TIMELINE.map((item,idx)=>{
            const cur=item.state==="current";
            return (
              <div key={idx} className="relative pl-7 pb-4 last:pb-0">
                {cur
                  ?<span className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full flex items-center justify-center"
                          style={{background:`${C.primary}33`,boxShadow:`0 0 0 4px ${C.primary}15`}}>
                      <span className="h-[7px] w-[7px] rounded-full animate-pulse" style={{background:C.primary}}/>
                    </span>
                  :<span className="absolute left-[3px] top-1.5 h-[9px] w-[9px] rounded-full"
                          style={{background:C.border,boxShadow:`0 0 0 4px ${C.surface}`}}/>
                }
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] font-medium" style={{color:cur?"#c4b5fd":C.textHi}}>{item.title}</span>
                  <span className="text-[10.5px] font-mono whitespace-nowrap" style={{color:C.textLo}}>{item.date}</span>
                </div>
                <div className="text-[11.5px] mt-0.5" style={{color:C.textMid}}>{item.diagnosis}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{background:C.bg}}>
                    <div className="h-full rounded-full" style={{width:`${item.recovery}%`,background:cur?C.primary:C.textLo}}/>
                  </div>
                  <span className="text-[10px] tabular-nums w-9 text-right" style={{color:C.textLo}}>{item.recovery}%</span>
                </div>
              </div>
            );
          })}
        </div>
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

function VitalsPanel() {
  return (
    <PanelShell icon={Activity} title="Vital Bulgular & Büyüme"
                right={<span className="text-[10px] font-mono flex items-center gap-1" style={{color:C.emerald}}>
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{background:C.emerald}}/>canlı</span>}>
      <div className="grid grid-cols-3" style={{borderBottom:`1px solid ${C.border}`}}>
        <VitalTile icon={Heart}       label="Nabız" value="77"   unit="bpm" tone="rose"    spark={VITALS.map(v=>({x:v.t,y:v.hr}))}   first/>
        <VitalTile icon={Thermometer} label="Ateş"  value="37.0" unit="°C"  tone="amber"   spark={VITALS.map(v=>({x:v.t,y:v.temp}))}/>
        <VitalTile icon={TrendingUp}  label="O₂"    value="98"   unit="%"   tone="emerald" spark={VITALS.map(v=>({x:v.t,y:97+Math.random()}))}/>
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <div className="text-[10.5px] uppercase tracking-wider" style={{color:C.textLo}}>Lezyon büyümesi (mm)</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-[20px] font-semibold text-zinc-100 tabular-nums">6.9</span>
              <span className="text-[11px]" style={{color:C.rose}}>↑ 3.7mm / 9 ay</span>
            </div>
          </div>
          <div className="flex gap-1">
            {["3A","6A","1Y","Tümü"].map((p,i)=>(
              <button key={p} className="px-2 py-0.5 text-[10.5px] rounded"
                      style={i===1?{background:C.primary,color:"white"}:{border:`1px solid ${C.border}`,color:C.textMid}}>{p}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={LESION_GROWTH} margin={{top:4,right:4,left:-28,bottom:0}}>
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
                  dot={{r:2,fill:C.primary,strokeWidth:0}} activeDot={{r:4,fill:C.primary,stroke:C.bg,strokeWidth:2}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PanelShell>
  );
}

/* ── ChatPanel ───────────────────────────────────────────── */
function ChatPanel() {
  const [messages,setMessages]=useState(INITIAL_CHAT);
  const [input,setInput]=useState("");
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const send=()=>{
    if(!input.trim())return;
    setMessages(m=>[...m,{role:"doc",text:input,time:"şimdi"}]);
    setInput("");
    setTimeout(()=>{
      setMessages(m=>[...m,{role:"ai",text:"Anlaşıldı. Veritabanını taradım — bu profilde 24 saat içinde dermoskopi + ABCDE yeniden değerlendirme önerilen klinik path %71.",time:"şimdi"}]);
    },700);
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
        {messages.map((m,i)=>(
          <div key={i} className={`flex gap-2 ${m.role==="doc"?"flex-row-reverse":""}`}>
            <div className="h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-[10px]"
                 style={m.role==="ai"
                   ?{background:`linear-gradient(135deg,${C.primary}33,${C.accent}33)`,border:`1px solid ${C.primary}55`,color:"#c4b5fd"}
                   :{background:C.surfaceAlt,border:`1px solid ${C.border}`,color:C.textMid}}>
              {m.role==="ai"?<Sparkles size={11}/>:"DR"}
            </div>
            <div className={`max-w-[85%] ${m.role==="doc"?"items-end":""}`}>
              <div className="text-[12px] leading-relaxed rounded-lg px-2.5 py-2"
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
        <div ref={endRef}/>
      </div>
      <div className="p-3" style={{borderTop:`1px solid ${C.border}`}}>
        <div className="relative flex items-center gap-2 rounded-lg" style={{background:C.bg,border:`1px solid ${C.border}`}}>
          <MessageSquare size={13} className="ml-2.5" style={{color:C.textLo}}/>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
                 placeholder="Şikayet, soru veya komut yazın…"
                 className="flex-1 bg-transparent py-2 text-[12px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"/>
          <button onClick={send}
                  className="m-1 px-2.5 py-1 rounded-md text-white text-[11px] font-medium flex items-center gap-1"
                  style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`}}>
            <Send size={11}/>Gönder
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

/* ── Tabs ────────────────────────────────────────────────── */
function SummaryTab() {
  return (
    <div className="flex-1 grid grid-cols-12 gap-3 p-3 overflow-hidden">
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-3 overflow-y-auto min-h-0 pr-1">
        <NovaVisionViewer/>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 min-h-[280px]">
          <MedicalHistory/><VitalsPanel/>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 min-h-0 flex flex-col"><ChatPanel/></div>
    </div>
  );
}

function ImagesTab() {
  const [selected,setSelected]=useState(IMAGES[0]);
  const fc=f=>f==="critical"?C.rose:f==="monitor"?C.amber:C.emerald;
  const fl=f=>f==="critical"?"Kritik":f==="monitor"?"Takip":"Stabil";
  return (
    <div className="flex-1 p-3 overflow-hidden grid grid-cols-12 gap-3">
      <div className="col-span-12 lg:col-span-4 min-h-0">
        <PanelShell icon={ImageIcon} title="Görüntü Arşivi" subtitle={`${IMAGES.length} kayıt`}
                    right={<button className="text-[11px] px-2 py-1 rounded"
                                   style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`,color:"white"}}>+ Yeni</button>}>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {IMAGES.map(img=>{
              const sel=img.id===selected.id;
              return (
                <button key={img.id} onClick={()=>setSelected(img)}
                        className="w-full text-left rounded-lg p-2.5 flex items-center gap-3"
                        style={sel?{background:`linear-gradient(90deg,${C.primary}20,${C.primary}05)`,border:`1px solid ${C.primary}55`}:{background:C.bg,border:`1px solid ${C.border}`}}>
                  <div className="h-14 w-14 shrink-0 rounded-md relative"
                       style={{background:"radial-gradient(ellipse at 35% 50%,#c89378 0%,#6e4634 70%,#2a1814 100%)"}}>
                    <div className="absolute" style={{left:"30%",top:"30%",width:"40%",height:"40%",
                         background:"radial-gradient(ellipse at center,#1a0e08 0%,transparent 70%)",borderRadius:"50%"}}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px] font-medium text-zinc-100 truncate">{img.region}</span>
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded font-medium"
                            style={{background:`${fc(img.flag)}1a`,color:fc(img.flag),border:`1px solid ${fc(img.flag)}40`}}>{fl(img.flag)}</span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{color:C.textLo}}>{img.type}</div>
                    <div className="text-[9.5px] font-mono mt-0.5" style={{color:C.textLo}}>{img.date} · {img.id}</div>
                  </div>
                  <ChevronRight size={12} style={{color:C.textLo}}/>
                </button>
              );
            })}
          </div>
        </PanelShell>
      </div>
      <div className="col-span-12 lg:col-span-8 min-h-0 flex flex-col">
        <PanelShell icon={Eye} title={selected.region} subtitle={`${selected.type} · ${selected.id}`} tone="accent"
                    right={
                      <div className="flex gap-1.5">
                        <button className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px]"
                                style={{border:`1px solid ${C.border}`,color:C.textMid}}><Download size={11}/>İndir</button>
                        <button className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px]"
                                style={{border:`1px solid ${C.border}`,color:C.textMid}}><Printer size={11}/>Yazdır</button>
                      </div>
                    }>
          <div className="relative aspect-[16/9]"
               style={{background:"linear-gradient(135deg,#0e0e18 0%,#1a1a2e 50%,#0a0a14 100%)"}}>
            <div className="absolute inset-0 opacity-90"
                 style={{background:"radial-gradient(ellipse 70% 60% at 35% 50%,#c89378 0%,#a87158 35%,#6e4634 70%,#2a1814 100%)"}}/>
            <div className="absolute" style={{left:"40%",top:"35%",width:"20%",height:"30%",
                 background:"radial-gradient(ellipse at center,#1a0e08 0%,transparent 70%)",borderRadius:"50%"}}/>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10.5px] font-mono px-2.5 py-1 rounded"
                 style={{background:`${C.bg}cc`,border:`1px solid ${C.border}`,color:C.textMid}}>
              {selected.date} · conf {selected.conf}
            </div>
          </div>
          <div className="grid grid-cols-4" style={{borderTop:`1px solid ${C.border}`}}>
            {[{label:"Boyut",v:selected.size},{label:"Güven",v:selected.conf},{label:"Bölge",v:selected.region},{label:"Tip",v:selected.type}]
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

function LabTab() {
  const fc=f=>f==="high"?C.rose:f==="low"?C.amber:C.emerald;
  const fb=f=>f==="high"?`${C.rose}15`:f==="low"?`${C.amber}15`:`${C.emerald}10`;
  const fl=f=>f==="high"?"↑ YÜKSEK":f==="low"?"↓ DÜŞÜK":"✓ NORMAL";
  const hi=LAB_RESULTS.filter(l=>l.flag==="high").length;
  const lo=LAB_RESULTS.filter(l=>l.flag==="low").length;
  const ok=LAB_RESULTS.filter(l=>l.flag==="normal").length;
  return (
    <div className="flex-1 p-3 overflow-hidden flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Yüksek Değer" value={hi} total={LAB_RESULTS.length} color={C.rose}    icon={AlertTriangle}/>
        <SummaryCard label="Düşük Değer"  value={lo} total={LAB_RESULTS.length} color={C.amber}   icon={TrendingUp}/>
        <SummaryCard label="Normal"       value={ok} total={LAB_RESULTS.length} color={C.emerald} icon={CheckCircle2}/>
      </div>
      <PanelShell icon={FlaskConical} title="Laboratuvar Sonuçları" subtitle="Son tetkik · Bugün 09:15"
                  right={
                    <div className="flex gap-1.5">
                      <button className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px]"
                              style={{border:`1px solid ${C.border}`,color:C.textMid}}><Download size={11}/>PDF</button>
                      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-white"
                              style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDim})`}}><Plus size={11}/>Yeni Tetkik İste</button>
                    </div>
                  }>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-[12px]">
            <thead style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
              <tr style={{color:C.textLo}}>
                {["Tetkik","Sonuç","Birim","Referans","Trend","Durum"].map((h,i)=>(
                  <th key={h} className={`${i===0?"text-left":"text-right"} ${i===4?"!text-center":""} px-4 py-2.5 font-medium text-[10.5px] uppercase tracking-wider`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LAB_RESULTS.map((r,i)=>(
                <tr key={r.name} style={{borderBottom:i<LAB_RESULTS.length-1?`1px solid ${C.borderSoft}`:"none",background:r.flag!=="normal"?fb(r.flag):"transparent"}}>
                  <td className="px-4 py-2.5 text-zinc-100 font-medium">{r.name}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold" style={{color:r.flag==="normal"?C.textHi:fc(r.flag)}}>{r.value}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{color:C.textMid}}>{r.unit}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{color:C.textLo}}>{r.ref}</td>
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
      </PanelShell>
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
function ActionBar({patient,openPrescription}) {
  const crit=patient.status==="critical";
  return (
    <div className="h-14 shrink-0 px-5 flex items-center gap-3" style={{background:C.surface,borderTop:`1px solid ${C.border}`}}>
      <div className="flex items-center gap-1.5 text-[10.5px] mr-2" style={{color:C.textLo}}>
        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{background:crit?C.rose:C.emerald}}/>
        {crit?"Acil değerlendirme gerekli":"Rutin takip"}
      </div>
      <div className="flex-1"/>
      {[
        {icon:FileSignature,label:"Tanıyı Onayla",style:{border:`1px solid ${C.border}`,color:C.textMid,background:"transparent"}},
        {icon:Pill,label:"Reçete Oluştur",action:openPrescription,style:{background:`${C.primary}15`,border:`1px solid ${C.primary}50`,color:"#c4b5fd"}},
        {icon:FileDown,label:"PUQ.ai Raporu Dışa Aktar",style:{background:`linear-gradient(135deg,${C.accent}22,${C.accent}11)`,border:`1px solid ${C.accent}55`,color:"#67e8f9"}},
      ].map(({icon:Icon,label,style,action})=>(
        <button key={label} onClick={action}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-medium transition-all hover:opacity-90"
                style={style}>
          <Icon size={14}/>{label}
        </button>
      ))}
    </div>
  );
}

/* ── Dashboard (root) ────────────────────────────────────── */
export default function Dashboard() {
  const [activePatient,setActivePatient]=useState(PATIENTS[0]);
  const [activeTab,setActiveTab]=useState("Özet");
  const [prescriptions,setPrescriptions]=useState(INITIAL_PRESCRIPTIONS);
  const [showModal,setShowModal]=useState(false);
  const openModal=()=>{setShowModal(true);setActiveTab("Reçeteler");};
  const closeModal=()=>setShowModal(false);
  const savePrescription=rx=>setPrescriptions(p=>[rx,...p]);
  return (
    <div className="h-screen w-screen flex overflow-hidden font-sans" style={{background:C.bg,color:C.textHi}}>
      <PatientSidebar active={activePatient} setActive={p=>{setActivePatient(p);setActiveTab("Özet");}}/>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header patient={activePatient} activeTab={activeTab} setActiveTab={setActiveTab}/>
        <main className="flex-1 overflow-hidden flex flex-col min-h-0">
          {activeTab==="Özet"       && <SummaryTab/>}
          {activeTab==="Görüntüler" && <ImagesTab/>}
          {activeTab==="Lab"        && <LabTab/>}
          {activeTab==="Reçeteler"  && <PrescriptionsTab prescriptions={prescriptions} openModal={openModal}/>}
        </main>
        <ActionBar patient={activePatient} openPrescription={openModal}/>
      </div>
      {showModal&&<PrescriptionModal onClose={closeModal} onSave={savePrescription}/>}
    </div>
  );
}
