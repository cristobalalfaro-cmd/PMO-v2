let RAW = [];
let FILTERED = [];
let PIE_CHART = null;

document.addEventListener("DOMContentLoaded", init);

async function init(){
  await guard();                       // Clave o modo share
  await loadData();                    // Carga datos
  buildFilters();                      // Llenado de selects
  readUrlFilters();                    // Preselección por URL (?cliente=&proyecto=)
  applyFiltersAndRender();             // Render general
  bindReset();                         // Botón limpiar
  bindRefresh();                       // Botón actualizar
  bindShare();                         // Copiar enlace compartido

  const chk = document.querySelector("#chk-include-finished");
  if (chk) chk.addEventListener("change", () => renderResumenEjecutivo());
}

/* ---------- ACCESO / SHARE ---------- */

async function guard(){
  const url = new URL(location.href);
  const share = url.searchParams.get("share");
  const email = (url.searchParams.get("email")||"").toLowerCase().trim();
  const cliente = url.searchParams.get("cliente");
  const proyecto = url.searchParams.get("proyecto");

  if (share === "1") {
    sessionStorage.setItem("pendingShareCheck","1");
    sessionStorage.setItem("shareEmail", email);
    sessionStorage.setItem("shareCliente", cliente||"");
    sessionStorage.setItem("shareProyecto", proyecto||"");
    sessionStorage.setItem("authOk","1");
    return;
  }

  if (sessionStorage.getItem("authOk")==="1") return;

  const modal = document.getElementById("access-modal");
  const input = document.getElementById("access-input");
  const btn = document.getElementById("access-btn");
  const msg = document.getElementById("access-msg");

  modal.style.display = "flex";
  input.value = "";
  input.focus();

  await new Promise(resolve => {
    const submit = () => {
      const val = input.value;
      if (val === "Tomi.2016") {
        sessionStorage.setItem("authOk","1");
        modal.style.display = "none";
        resolve();
      } else {
        msg.textContent = "Clave incorrecta.";
        input.select();
      }
    };
    btn.addEventListener("click", submit);
    input.addEventListener("keydown", (e)=>{ if(e.key==="Enter") submit(); });
  });
}

function validateShareAccessIfNeeded(){
  if (sessionStorage.getItem("pendingShareCheck") !== "1") return true;
  sessionStorage.removeItem("pendingShareCheck");

  const email = (sessionStorage.getItem("shareEmail")||"").toLowerCase().trim();
  const cliente = sessionStorage.getItem("shareCliente")||"";
  const proyecto = sessionStorage.getItem("shareProyecto")||"";

  const ok = RAW.some(r => {
    const em = (r.Email||"").toLowerCase().trim();
    return em && em === email
      && (!cliente || r.Cliente === cliente)
      && (!proyecto || r.Proyecto === proyecto);
  });

  if (!ok) {
    sessionStorage.removeItem("authOk");
    const modal = document.getElementById("access-modal");
    const msg = document.getElementById("access-msg");
    modal.style.display = "flex";
    msg.textContent = "Acceso por enlace compartido no autorizado para este correo/cliente/proyecto.";
    return false;
  }
  return true;
}

/* ---------- DATA ---------- */

async function loadData(force=false) {
  const url = DASHBOARD_CONFIG.csvUrl + (force ? ('&t=' + Date.now()) : '');
  const res = await fetch(url);
  const text = await res.text();
  const parsed = Papa.parse(text, {header: true, skipEmptyLines: true});
  RAW = parsed.data.map(row => ({
    ID: row[DASHBOARD_CONFIG.columns.id] ?? "",
    Tipo: row[DASHBOARD_CONFIG.columns.tipo] ?? "",
    Cliente: row[DASHBOARD_CONFIG.columns.cliente] ?? "",
    Proyecto: row[DASHBOARD_CONFIG.columns.proyecto] ?? "",
    Tareas: row[DASHBOARD_CONFIG.columns.tareas] ?? "",
    Deadline: row[DASHBOARD_CONFIG.columns.deadline] ?? "",
    Estatus: row[DASHBOARD_CONFIG.columns.estatus] ?? "",
    Owner: row[DASHBOARD_CONFIG.columns.owner] ?? "",
    Email: row[DASHBOARD_CONFIG.columns.email] ?? ""
  }));
  validateShareAccessIfNeeded();
}

function buildFilters(rebuild=false) {
  const tipoSel = document.querySelector("#f-tipo");
  const clienteSel = document.querySelector("#f-cliente");
  const proyectoSel = document.querySelector("#f-proyecto");
  const estatusSel = document.querySelector("#f-estatus");
  const ownerSel = document.querySelector("#f-owner");

  if (rebuild) {
    ["#f-tipo","#f-cliente","#f-proyecto","#f-estatus","#f-owner"].forEach(sel=>{
      const s=document.querySelector(sel); if (s) s.length=1;
    });
  }

  const tipos = uniqueSorted(RAW.map(r=>r.Tipo));
  for (const v of tipos) tipoSel.append(new Option(v, v));

  updateCascadingFilters();

  [tipoSel, clienteSel, proyectoSel, estatusSel, ownerSel].forEach(sel => {
    sel.addEventListener("change", () => {
      updateCascadingFilters();
      applyFiltersAndRender();
    });
  });
}

function updateCascadingFilters() {
  const tipoSel = document.querySelector("#f-tipo");
  const clienteSel = document.querySelector("#f-cliente");
  const proyectoSel = document.querySelector("#f-proyecto");
  const estatusSel = document.querySelector("#f-estatus");
  const ownerSel = document.querySelector("#f-owner");

  const selectedTipo = tipoSel.value;
  const selectedCliente = clienteSel.value;
  const selectedProyecto = proyectoSel.value;
  const selectedEstatus = estatusSel.value;

  let filtered = RAW;
  if (selectedTipo) filtered = filtered.filter(r => r.Tipo === selectedTipo);

  const clientes = uniqueSorted(filtered.map(r => r.Cliente));
  updateSelectOptions(clienteSel, clientes, selectedCliente);

  if (selectedCliente) filtered = filtered.filter(r => r.Cliente === selectedCliente);
  const proyectos = uniqueSorted(filtered.map(r => r.Proyecto));
  updateSelectOptions(proyectoSel, proyectos, selectedProyecto);

  if (selectedProyecto) filtered = filtered.filter(r => r.Proyecto === selectedProyecto);
  const estatuses = uniqueSorted(filtered.map(r => r.Estatus));
  updateSelectOptions(estatusSel, estatuses, selectedEstatus);

  if (selectedEstatus) filtered = filtered.filter(r => r.Estatus === selectedEstatus);
  const owners = uniqueSorted(filtered.map(r => r.Owner));
  updateSelectOptions(ownerSel, owners, ownerSel.value);
}

function updateSelectOptions(selectElement, options, selectedValue) {
  const currentValue = selectElement.value;
  selectElement.length = 1;
  
  for (const v of options) {
    selectElement.append(new Option(v, v));
  }
  
  if (selectedValue && options.includes(selectedValue)) {
    selectElement.value = selectedValue;
  } else if (currentValue && options.includes(currentValue)) {
    selectElement.value = currentValue;
  }
}

function readUrlFilters(){
  const url = new URL(location.href);
  const c = url.searchParams.get("cliente");
  const p = url.searchParams.get("proyecto");
  if (c) { const sel = document.querySelector("#f-cliente"); if (sel) sel.value = c; }
  if (p) { const sel = document.querySelector("#f-proyecto"); if (sel) sel.value = p; }
}

function getActiveFilters() {
  return {
    tipo: document.querySelector("#f-tipo").value || null,
    cliente: document.querySelector("#f-cliente").value || null,
    proyecto: document.querySelector("#f-proyecto").value || null,
    estatus: document.querySelector("#f-estatus").value || null,
    owner: document.querySelector("#f-owner").value || null
  };
}

function applyFiltersAndRender() {
  const f = getActiveFilters();
  FILTERED = RAW.filter(r => {
    return (!f.tipo || r.Tipo === f.tipo)
      && (!f.cliente || r.Cliente === f.cliente)
      && (!f.proyecto || r.Proyecto === f.proyecto)
      && (!f.estatus || r.Estatus === f.estatus)
      && (!f.owner || r.Owner === f.owner);
  });

  renderResumenEjecutivo();
  renderAperturaPorEstatus();
  renderPie();
}

function bindReset() {
  document.querySelector("#btn-reset").addEventListener("click", () => {
    ["#f-tipo","#f-cliente","#f-proyecto","#f-estatus","#f-owner"].forEach(sel => document.querySelector(sel).value = "");
    updateCascadingFilters();
    applyFiltersAndRender();
  });
}

function bindRefresh(){
  const btn = document.getElementById("btn-refresh");
  if (!btn) return;
  btn.addEventListener("click", async ()=>{
    btn.disabled = true; btn.textContent = "Actualizando...";
    try {
      await loadData(true);
      buildFilters(true);
      readUrlFilters();
      applyFiltersAndRender();
    } finally {
      btn.disabled = false; btn.textContent = "Actualizar";
    }
  });
}

function bindShare(){
  const btn = document.getElementById("btn-share");
  btn.addEventListener("click", async ()=>{
    const cliente = document.querySelector("#f-cliente").value || "";
    const proyecto = document.querySelector("#f-proyecto").value || "";
    if (!cliente || !proyecto) {
      alert("Selecciona Cliente y Proyecto para generar un enlace filtrado.");
      return;
    }
    const email = prompt("Correo autorizado (debe existir en la columna Email para ese Cliente/Proyecto):","");
    if (!email) return;
    const base = location.origin + location.pathname;
    const url = `${base}?cliente=${encodeURIComponent(cliente)}&proyecto=${encodeURIComponent(proyecto)}&share=1&email=${encodeURIComponent(email)}`;
    await copyToClipboard(url);
    alert("Enlace copiado al portapapeles.");
  });
}

/* ---------- APERTURA POR ESTATUS (accordion) ---------- */

function renderAperturaPorEstatus() {
  const container = document.querySelector("#apertura-estatus");
  container.innerHTML = "";

  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const in21 = new Date(today); in21.setDate(in21.getDate() + 21);

  const finalizados = [];
  const atrasados = [];
  const proximos = [];
  const futuros = [];

  for (const r of FILTERED) {
    const estatus = (r.Estatus || "").toLowerCase().trim();
    const esFinalizado = estatus === "finalizado";
    
    if (esFinalizado) {
      finalizados.push(r);
      continue;
    }
    
    const d = parseDate(r.Deadline);
    if (!d) continue;
    
    if (d <= yesterday) {
      atrasados.push(r);
    } else if (d >= today && d <= in21) {
      proximos.push(r);
    } else if (d > in21) {
      futuros.push(r);
    }
  }

  const groups = [
    {title: "Finalizados", data: finalizados},
    {title: "Atrasados", data: atrasados},
    {title: "Próximos vencimientos (≤ 21 días)", data: proximos},
    {title: "Actividades programadas para más de 3 semanas", data: futuros}
  ];

  for (const g of groups) {
    const list = g.data.slice().sort((a,b) => {
      const da = parseDate(a.Deadline); const db = parseDate(b.Deadline);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da - db;
    });

    const acc = document.createElement("details");
    acc.className = "accordion";
    if (g.title.startsWith("Atrasados") && list.length > 0) acc.open = true;

    const sum = document.createElement("summary");
    sum.textContent = `${g.title} · ${list.length}`;
    acc.appendChild(sum);

    const content = document.createElement("div");
    content.className = "content";

    if (list.length === 0) {
      content.innerHTML = '<div class="empty">No hay registros en esta categoría.</div>';
    } else {
      const table = document.createElement("table");
      table.className = "table-status";
      table.innerHTML = `
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Proyecto</th>
            <th>Tareas</th>
            <th>Deadline</th>
            <th>Owner</th>
            <th>Estatus</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector("tbody");
      for (const r of list) {
        const d = parseDate(r.Deadline);
        const tr = document.createElement("tr");

        const tdCliente = document.createElement("td");
        tdCliente.setAttribute("title", r.Cliente);
        tdCliente.textContent = r.Cliente || "-";

        const tdProyecto = document.createElement("td");
        tdProyecto.setAttribute("title", r.Proyecto);
        tdProyecto.textContent = r.Proyecto || "-";

        const tdTareas = document.createElement("td");
        tdTareas.setAttribute("title", r.Tareas);
        tdTareas.textContent = r.Tareas || "-";

        const tdDeadline = document.createElement("td");
        tdDeadline.textContent = d ? formatDateCL(d) : "-";

        const tdOwner = document.createElement("td");
        tdOwner.textContent = r.Owner || "-";

        const tdEstatus = document.createElement("td");
        tdEstatus.textContent = r.Estatus || "-";

        tr.appendChild(tdCliente);
        tr.appendChild(tdProyecto);
        tr.appendChild(tdTareas);
        tr.appendChild(tdDeadline);
        tr.appendChild(tdOwner);
        tr.appendChild(tdEstatus);
        tbody.appendChild(tr);
      }
      content.appendChild(table);
    }
    acc.appendChild(content);
    container.appendChild(acc);
  }
}

/* ---------- RESUMEN EJECUTIVO ---------- */

function getSummaryIncludeFinished(){
  const chk = document.querySelector('#chk-include-finished');
  return !!(chk && chk.checked);
}
function computeResumen() {
  const includeFinished = getSummaryIncludeFinished();
  
  // Calcular totales sobre el dataset completo filtrado para el porcentaje de cumplimiento
  let totalTareasFiltradas = FILTERED.length;
  let finalizadasTotal = 0;
  let iniciadasTotal = 0;
  let noIniciadasOnHoldTotal = 0;

  for (const r of FILTERED) {
    const estatus = (r.Estatus || "").toLowerCase().trim();
    if (estatus === "finalizado") finalizadasTotal += 1;
    if (estatus === "iniciado") iniciadasTotal += 1;
    if (estatus === "no iniciado" || estatus === "on hold") noIniciadasOnHoldTotal += 1;
  }

  // Si el usuario no quiere incluir finalizados, ajustar los contadores para los KPIs pequeños
  let totalTareas, iniciadasDisplay, noIniciadasOnHoldDisplay;
  if (includeFinished) {
    totalTareas = totalTareasFiltradas;
    iniciadasDisplay = iniciadasTotal;
    noIniciadasOnHoldDisplay = noIniciadasOnHoldTotal;
  } else {
    totalTareas = totalTareasFiltradas - finalizadasTotal;
    iniciadasDisplay = iniciadasTotal;
    noIniciadasOnHoldDisplay = noIniciadasOnHoldTotal;
  }

  // El porcentaje de cumplimiento siempre se calcula sobre el total filtrado
  const porcentajeCumplimiento = totalTareasFiltradas > 0 ? (finalizadasTotal / totalTareasFiltradas) : 0;

  return { 
    totalTareas, 
    finalizadasTotal: includeFinished ? finalizadasTotal : 0, 
    iniciadasTotal: iniciadasDisplay, 
    noIniciadasOnHoldTotal: noIniciadasOnHoldDisplay, 
    porcentajeCumplimiento 
  };
}

function renderResumenEjecutivo() {
  const k = computeResumen();
  const wrap = document.querySelector("#resumen-ejecutivo");
  if (!wrap) return;
  const fmt = (v) => (v == null ? "-" : (typeof v === "number" ? v.toLocaleString() : v));
  const pct = (v) => (v == null ? "-" : (v*100).toFixed(0) + "%");

  wrap.innerHTML = `
    <div class="kpi">
      <div class="kpi-label">Total Tareas</div>
      <div class="kpi-value">${fmt(k.totalTareas)}</div>
    </div>
    <div class="kpi kpi-large" style="grid-column: 3; grid-row: 1 / 3;">
      <div class="kpi-label-large">Porcentaje de Cumplimiento</div>
      <div class="kpi-value-large">${pct(k.porcentajeCumplimiento)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Total Tareas Finalizadas</div>
      <div class="kpi-value">${fmt(k.finalizadasTotal)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Total Tareas Iniciadas</div>
      <div class="kpi-value">${fmt(k.iniciadasTotal)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Total Tareas No Iniciadas / On Hold</div>
      <div class="kpi-value">${fmt(k.noIniciadasOnHoldTotal)}</div>
    </div>
  `;
}

/* ---------- REPORTE ---------- */

function renderPie() {
  if (window.Chart && window.ChartDataLabels) { Chart.register(ChartDataLabels); }
  const ctx = document.querySelector("#chart-estatus").getContext("2d");
  const counts = {};
  for (const r of FILTERED) {
    const k = r.Estatus || "Sin estatus";
    counts[k] = (counts[k] || 0) + 1;
  }
  const labels = Object.keys(counts);
  const data = Object.values(counts);

  if (PIE_CHART) PIE_CHART.destroy();
  PIE_CHART = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ["#00D1FF","#FF4D4D","#FFC300","#2ECC71","#9B59B6","#FF7F00","#1abc9c","#e67e22"]
      }]
    },
    options: {
      plugins: {
        legend: { position: "right", labels: { color: "#E6E8EB" } },
        tooltip: { enabled: true },
        datalabels: {
          formatter: (value, ctx) => {
            const arr = ctx.chart.data.datasets[0].data;
            const sum = arr.reduce((a,b)=>a+b, 0) || 1;
            const pct = (value / sum) * 100;
            return pct.toFixed(0) + "%";
          },
          color: "#ffffff",
          font: { weight: "bold" }
        }
      }
    }
  });
}