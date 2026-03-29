import { useState, useRef, useEffect } from "react";

const PRIORIDADES = {
  alta:  { label: "Alta",  color: "#e63946" },
  media: { label: "Média", color: "#f4a261" },
  baixa: { label: "Baixa", color: "#2a9d8f" },
};

const CATEGORIAS   = ["Pessoal", "Trabalho", "Estudos", "Saúde", "Outros"];
const FILTROS      = ["Todas", "Pendentes", "Concluídas"];
const MESES        = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const TAREFAS_INICIAIS = [
  { id: 1, texto: "Revisar relatório mensal", categoria: "Trabalho", prioridade: "alta",  concluida: false },
  { id: 2, texto: "Ler 30 minutos",           categoria: "Estudos",  prioridade: "media", concluida: false },
  { id: 3, texto: "Fazer compras",             categoria: "Pessoal",  prioridade: "baixa", concluida: true  },
];

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS_KEY = "tarefas_v1";

function carregarTarefas() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return TAREFAS_INICIAIS;
}

function guardarTarefas(tarefas) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(tarefas));
  } catch (_) {}
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function CheckIcon({ done }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke={done ? "#1a1a1a" : "#c8c8c8"} strokeWidth="1.5"
        fill={done ? "#1a1a1a" : "transparent"} style={{ transition: "all 0.2s" }} />
      {done && <polyline points="5,9 8,12 13,6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2.5 4h10M6 4V2.5h3V4M5.5 4v8h4V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon({ recording }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" fill={recording ? "#e63946" : "currentColor"} />
      <path d="M5 11a7 7 0 0 0 14 0" stroke={recording ? "#e63946" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <line x1="12" y1="18" x2="12" y2="22" stroke={recording ? "#e63946" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9"  y1="22" x2="15" y2="22" stroke={recording ? "#e63946" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function ChevronLeft()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function ChevronRight() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5"  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

// ── Calendar popup ────────────────────────────────────────────────────────────
function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

function CalendarioPopup({ dataSelecionada, onSelect, onClose }) {
  const ANO = dataSelecionada.getFullYear();
  const [mes, setMes] = useState(dataSelecionada.getMonth());
  const diasNoMes  = getDaysInMonth(ANO, mes);
  const primeiroDia = getFirstDayOfMonth(ANO, mes);
  const hoje = new Date();

  const cells = [];
  for (let i = 0; i < primeiroDia; i++) cells.push(null);
  for (let d = 1; d <= diasNoMes; d++) cells.push(d);

  const isSelected = (d) => d && dataSelecionada.getMonth() === mes && dataSelecionada.getDate() === d;
  const isHoje     = (d) => d && hoje.getMonth() === mes && hoje.getDate() === d && hoje.getFullYear() === ANO;

  return (
    <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, zIndex:100, background:"white", borderRadius:14, padding:16, border:"1px solid #e8e4dc", boxShadow:"0 8px 32px rgba(0,0,0,0.1)", width:284 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <button onClick={() => setMes(m => Math.max(0, m-1))} disabled={mes===0} style={{ padding:4, color:mes===0?"#ddd":"#555", cursor:mes===0?"default":"pointer" }}><ChevronLeft /></button>
        <span style={{ fontSize:13, fontWeight:600, color:"#1a1a1a" }}>{MESES[mes]} {ANO}</span>
        <button onClick={() => setMes(m => Math.min(11, m+1))} disabled={mes===11} style={{ padding:4, color:mes===11?"#ddd":"#555", cursor:mes===11?"default":"pointer" }}><ChevronRight /></button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
        {DIAS_SEMANA.map(d => <div key={d} style={{ textAlign:"center", fontSize:10, color:"#bbb", fontWeight:600, padding:"2px 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {cells.map((d, i) => (
          <button key={i} onClick={() => { if (d) { onSelect(new Date(ANO, mes, d)); onClose(); }}}
            style={{ padding:"6px 0", borderRadius:7, fontSize:12, fontWeight:isSelected(d)?600:400, background:isSelected(d)?"#1a1a1a":isHoje(d)?"#f0ede8":"transparent", color:isSelected(d)?"white":isHoje(d)?"#1a1a1a":d?"#444":"transparent", cursor:d?"pointer":"default", border:"none", transition:"background 0.15s" }}>
            {d || ""}
          </button>
        ))}
      </div>
      <div style={{ marginTop:12, borderTop:"1px solid #f0ece4", paddingTop:10 }}>
        <p style={{ margin:"0 0 6px", fontSize:10, color:"#bbb", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Ir para mês</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
          {MESES.map((m, i) => (
            <button key={i} onClick={() => setMes(i)} style={{ padding:"3px 7px", borderRadius:6, fontSize:10, fontWeight:500, background:mes===i?"#1a1a1a":"#f5f3ef", color:mes===i?"white":"#777", border:"none", cursor:"pointer" }}>
              {m.slice(0,3)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Tarefas() {
  const [tarefas, setTarefas]               = useState(carregarTarefas);
  const [texto, setTexto]                   = useState("");
  const [categoria, setCategoria]           = useState("Pessoal");
  const [prioridade, setPrioridade]         = useState("media");
  const [filtro, setFiltro]                 = useState("Todas");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [adicionando, setAdicionando]       = useState(false);
  const [gravando, setGravando]             = useState(false);
  const [transcrevendo, setTranscrevendo]   = useState(false);
  const [vozErro, setVozErro]               = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [guardado, setGuardado]             = useState(false);   // feedback visual

  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);
  const calendarRef    = useRef(null);

  // Persistir sempre que as tarefas mudam
  useEffect(() => {
    guardarTarefas(tarefas);
    setGuardado(true);
    const t = setTimeout(() => setGuardado(false), 1500);
    return () => clearTimeout(t);
  }, [tarefas]);

  useEffect(() => {
    if (adicionando && inputRef.current) inputRef.current.focus();
  }, [adicionando]);

  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setMostrarCalendario(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Voz ────────────────────────────────────────────────────────────────────
  const iniciarVoz = () => {
    setVozErro("");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVozErro("O seu navegador não suporta reconhecimento de voz."); return; }
    const r = new SR();
    r.lang = "pt-PT";
    r.continuous = false;
    r.interimResults = true;
    r.onstart  = () => { setGravando(true); setTranscrevendo(false); };
    r.onresult = (e) => { setTexto(Array.from(e.results).map(x => x[0].transcript).join("")); };
    r.onend    = () => { setGravando(false); setTranscrevendo(false); };
    r.onerror  = (e) => {
      setGravando(false); setTranscrevendo(false);
      if (e.error === "not-allowed") setVozErro("Acesso ao microfone negado.");
      else if (e.error !== "no-speech") setVozErro("Erro no reconhecimento de voz.");
    };
    recognitionRef.current = r;
    r.start();
  };

  const pararVoz  = () => { if (recognitionRef.current) { setTranscrevendo(true); recognitionRef.current.stop(); } };
  const toggleVoz = () => (gravando ? pararVoz() : iniciarVoz());

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const adicionar = () => {
    if (!texto.trim()) return;
    setTarefas(prev => [{ id: Date.now(), texto: texto.trim(), categoria, prioridade, concluida: false }, ...prev]);
    setTexto(""); setAdicionando(false); setVozErro(""); setGravando(false);
  };

  const toggleConcluida = (id) => setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t));
  const excluir         = (id) => setTarefas(prev => prev.filter(t => t.id !== id));

  // ── Filtros ────────────────────────────────────────────────────────────────
  const tarefasFiltradas = tarefas.filter(t => {
    const porStatus    = filtro === "Todas" ? true : filtro === "Pendentes" ? !t.concluida : t.concluida;
    const porCategoria = filtroCategoria === "Todas" ? true : t.categoria === filtroCategoria;
    return porStatus && porCategoria;
  });

  const pendentes     = tarefas.filter(t => !t.concluida).length;
  const dataFormatada = dataSelecionada.toLocaleDateString("pt-PT", { weekday:"long", day:"numeric", month:"long" });

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", minHeight:"100vh", background:"#f7f6f3", display:"flex", justifyContent:"center", padding:"48px 16px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        button { cursor: pointer; border: none; background: none; }
        input, select { font-family: inherit; }
        .tarefa-item { transition: opacity 0.2s; }
        .tarefa-item:hover .btn-excluir { opacity: 1 !important; }
        .btn-excluir { transition: opacity 0.15s, color 0.15s; }
        .btn-excluir:hover { color: #e63946 !important; }
        .filtro-btn { transition: background 0.15s, color 0.15s; }
        .btn-add:hover { background: #1a1a1a !important; color: white !important; }
        .btn-add { transition: background 0.2s, color 0.2s; }
        .mic-quick:hover { border-color: #1a1a1a !important; color: #1a1a1a !important; }
        select { appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:28px !important; }
        .data-btn:hover { background: #f0ede8 !important; }
        .data-btn { transition: background 0.15s; border-radius: 8px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .mic-pulse { animation: pulse 1s ease-in-out infinite; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        .guardado-badge { animation: fadeIn 0.2s ease; }
      `}</style>

      <div style={{ width:"100%", maxWidth:520 }}>

        {/* Header */}
        <div style={{ marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
            <div style={{ position:"relative" }} ref={calendarRef}>
              <button className="data-btn" onClick={() => setMostrarCalendario(v => !v)}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 8px 4px 0", background:"transparent", marginBottom:6 }}>
                <span style={{ fontSize:12, color:"#999", letterSpacing:"0.08em", textTransform:"uppercase" }}>{dataFormatada}</span>
                <span style={{ color:"#c0bbb2", lineHeight:0, marginTop:1 }}><CalendarIcon /></span>
              </button>
              <h1 style={{ margin:0, fontFamily:"'DM Serif Display',serif", fontSize:36, fontWeight:400, color:"#1a1a1a", lineHeight:1 }}>Tarefas</h1>
              {mostrarCalendario && (
                <CalendarioPopup dataSelecionada={dataSelecionada} onSelect={setDataSelecionada} onClose={() => setMostrarCalendario(false)} />
              )}
            </div>

            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ background:"#1a1a1a", color:"white", borderRadius:"50%", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:500, fontFamily:"'DM Serif Display',serif" }}>
                {pendentes}
              </div>
              {/* Badge "guardado" */}
              {guardado && (
                <span className="guardado-badge" style={{ fontSize:9, color:"#2a9d8f", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                  ✓ guardado
                </span>
              )}
            </div>
          </div>
          <p style={{ margin:"10px 0 0", fontSize:13, color:"#999" }}>
            {pendentes === 0 ? "Tudo em dia!" : `${pendentes} tarefa${pendentes > 1 ? "s" : ""} pendente${pendentes > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Filtros de status */}
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          {FILTROS.map(f => (
            <button key={f} className="filtro-btn" onClick={() => setFiltro(f)}
              style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:500, background:filtro===f?"#1a1a1a":"transparent", color:filtro===f?"white":"#888", border:`1px solid ${filtro===f?"#1a1a1a":"#e0e0e0"}` }}>
              {f}
            </button>
          ))}
        </div>

        {/* Filtro de categoria */}
        <div style={{ display:"flex", gap:6, marginBottom:28, flexWrap:"wrap" }}>
          {["Todas", ...CATEGORIAS].map(c => (
            <button key={c} className="filtro-btn" onClick={() => setFiltroCategoria(c)}
              style={{ padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:500, background:filtroCategoria===c?"#f0ede8":"transparent", color:filtroCategoria===c?"#1a1a1a":"#aaa", border:`1px solid ${filtroCategoria===c?"#d6d0c8":"#eee"}` }}>
              {c}
            </button>
          ))}
        </div>

        {/* Formulário nova tarefa */}
        {adicionando ? (
          <div style={{ background:"white", borderRadius:14, padding:18, marginBottom:16, border:`1.5px solid ${gravando?"#e63946":"#e8e4dc"}`, boxShadow:gravando?"0 0 0 3px rgba(230,57,70,0.07)":"0 2px 12px rgba(0,0,0,0.04)", transition:"border-color 0.25s,box-shadow 0.25s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <input ref={inputRef} value={texto} onChange={e => setTexto(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter") adicionar(); if (e.key==="Escape") { setAdicionando(false); setGravando(false); if (recognitionRef.current) recognitionRef.current.stop(); }}}
                placeholder={gravando?"A ouvir...":transcrevendo?"A transcrever...":"Descreva a tarefa..."}
                style={{ flex:1, border:"none", outline:"none", fontSize:15, color:"#1a1a1a", background:"transparent", padding:0 }} />
              <button onClick={toggleVoz} className={gravando?"mic-pulse":""} title={gravando?"Parar":"Gravar por voz"}
                style={{ flexShrink:0, width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:gravando?"#fff0f1":"#f5f3ef", color:gravando?"#e63946":"#888", border:`1.5px solid ${gravando?"#e63946":"#e8e4dc"}`, transition:"all 0.2s" }}>
                <MicIcon recording={gravando} />
              </button>
            </div>

            {(gravando || transcrevendo) && (
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12, padding:"7px 10px", borderRadius:8, background:gravando?"#fff5f5":"#f5f3ef" }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:gravando?"#e63946":"#f4a261", animation:gravando?"pulse 1s infinite":"none", flexShrink:0 }} />
                <span style={{ fontSize:11, color:gravando?"#e63946":"#999", fontWeight:500 }}>
                  {gravando?"A gravar... toque no microfone para parar":"A transcrever..."}
                </span>
              </div>
            )}

            {vozErro && <p style={{ margin:"0 0 10px", fontSize:12, color:"#e63946" }}>{vozErro}</p>}

            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}
                style={{ flex:1, padding:"7px 10px", borderRadius:8, border:"1px solid #e8e4dc", fontSize:12, color:"#555", background:"#faf9f7", cursor:"pointer" }}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={prioridade} onChange={e => setPrioridade(e.target.value)}
                style={{ flex:1, padding:"7px 10px", borderRadius:8, border:"1px solid #e8e4dc", fontSize:12, color:"#555", background:"#faf9f7", cursor:"pointer" }}>
                {Object.entries(PRIORIDADES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={adicionar} style={{ flex:1, padding:"9px", borderRadius:8, background:"#1a1a1a", color:"white", fontSize:13, fontWeight:500 }}>Adicionar</button>
              <button onClick={() => { setAdicionando(false); setGravando(false); setVozErro(""); if (recognitionRef.current) recognitionRef.current.stop(); }}
                style={{ padding:"9px 16px", borderRadius:8, background:"#f0ede8", color:"#888", fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            <button className="btn-add" onClick={() => setAdicionando(true)}
              style={{ flex:1, padding:"13px", borderRadius:12, border:"1.5px dashed #d0ccc4", background:"transparent", color:"#aaa", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <span style={{ fontSize:18, lineHeight:1, marginBottom:1 }}>+</span> Nova tarefa
            </button>
            <button className="mic-quick" onClick={() => { setAdicionando(true); setTimeout(iniciarVoz, 150); }} title="Nova tarefa por voz"
              style={{ width:52, borderRadius:12, border:"1.5px dashed #d0ccc4", background:"transparent", color:"#bbb", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
              <MicIcon recording={false} />
            </button>
          </div>
        )}

        {/* Lista */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {tarefasFiltradas.length === 0 && (
            <p style={{ textAlign:"center", color:"#bbb", fontSize:13, padding:"32px 0" }}>Nenhuma tarefa encontrada.</p>
          )}
          {tarefasFiltradas.map(t => (
            <div key={t.id} className="tarefa-item"
              style={{ background:"white", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, border:"1px solid #f0ece4", opacity:t.concluida?0.55:1 }}>
              <button onClick={() => toggleConcluida(t.id)} style={{ flexShrink:0, padding:0, lineHeight:0 }}><CheckIcon done={t.concluida} /></button>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:14, color:"#1a1a1a", fontWeight:450, textDecoration:t.concluida?"line-through":"none", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {t.texto}
                </p>
                <div style={{ display:"flex", gap:6, marginTop:5, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:"#999", background:"#f5f3ef", padding:"2px 7px", borderRadius:20, fontWeight:500 }}>{t.categoria}</span>
                  <span style={{ fontSize:10, color:PRIORIDADES[t.prioridade].color, background:`${PRIORIDADES[t.prioridade].color}18`, padding:"2px 7px", borderRadius:20, fontWeight:600 }}>{PRIORIDADES[t.prioridade].label}</span>
                </div>
              </div>
              <button className="btn-excluir" onClick={() => excluir(t.id)} style={{ color:"#ccc", opacity:0, padding:4, lineHeight:0, flexShrink:0 }}><TrashIcon /></button>
            </div>
          ))}
        </div>

        {tarefas.filter(t => t.concluida).length > 0 && (
          <button onClick={() => setTarefas(prev => prev.filter(t => !t.concluida))}
            style={{ marginTop:20, width:"100%", padding:"10px", borderRadius:10, background:"transparent", color:"#bbb", fontSize:12, border:"1px solid #eee", fontFamily:"inherit" }}>
            Limpar concluídas ({tarefas.filter(t => t.concluida).length})
          </button>
        )}

      </div>
    </div>
  );
}
