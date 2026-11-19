const App = { currentPage: "dashboard", selectedRowId: null, selectedType: null, editingId: null, currentFormType: null, searchTerm: "" };
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
function fmt(n) { if (n === undefined || n === null || n === "") return "0"; const numVal = Number(n); return isNaN(numVal) ? n : numVal.toLocaleString("fr-FR"); }
function num(v) { const n = Number(v); return isNaN(n) ? 0 : n; }
function calcTotalCulte(r) { return num(r.culteMembres) + num(r.culteSymp) + num(r.culteNV); }

document.addEventListener("DOMContentLoaded", () => {
  Store.load();
  updatePeriodeLabel();
  bindNavigation();
  bindActions();
  bindPrintOptions();
  renderAll();
  goToPage("dashboard");
});

function updatePeriodeLabel() { $("#moisAnnee").textContent = `${Store.data.periode.mois} ${Store.data.periode.annee}`; }

function bindNavigation() {
  $("#btnMenu").addEventListener("click", openMenu);
  $("#btnCloseMenu").addEventListener("click", closeMenu);
  $("#overlay").addEventListener("click", closeMenu);
  $$(".nav-link").forEach(a => { a.addEventListener("click", (e) => { e.preventDefault(); goToPage(a.dataset.page); closeMenu(); }); });
}
function openMenu() { $("#sidebar").classList.add("open"); $("#overlay").classList.add("show"); }
function closeMenu() { $("#sidebar").classList.remove("open"); $("#overlay").classList.remove("show"); }
function goToPage(page) {
  App.currentPage = page;
  $$(".page").forEach(p => p.classList.remove("active"));
  const el = $("#page-" + page);
  if (el) el.classList.add("active");
  $$(".nav-link").forEach(a => a.classList.toggle("active", a.dataset.page === page));
  renderAll();
}

function bindActions() {
  $("#searchInput").addEventListener("input", (e) => { App.searchTerm = e.target.value.toLowerCase(); renderAll(); });
  $("#btnNouveau").addEventListener("click", () => openFormForCurrentPage(null));
  $("#btnModifier").addEventListener("click", () => { if (!App.selectedRowId) return alert("Sélectionnez une ligne."); openFormForCurrentPage(App.selectedRowId); });
  $("#btnSupprimer").addEventListener("click", () => { if (!App.selectedRowId) return alert("Sélectionnez une ligne."); if (!confirm("Supprimer ?")) return; Store.remove(App.selectedType, App.selectedRowId); clearSelection(); renderAll(); });
  $("#btnArchiver").addEventListener("click", () => { if (!App.selectedRowId) return alert("Sélectionnez une ligne."); if (!confirm("Archiver ?")) return; Store.archive(App.selectedType, App.selectedRowId); clearSelection(); renderAll(); });
  $("#btnCloseModal").addEventListener("click", closeModal);
  $("#btnCancel").addEventListener("click", closeModal);
  $("#btnSave").addEventListener("click", saveForm);
}
function clearSelection() { App.selectedRowId = null; App.selectedType = null; }

function renderAll() {
  renderDashboard(); renderTable("numerique"); renderTable("diffusion"); renderTable("diffusionSuite");
  renderSynthese(); renderRapportGlobal(); renderRapportDetaille(); renderArchives();
}

function renderDashboard() {
  const numRows = Store.data.numerique, diff = Store.data.diffusion;
  const totalBaptises = numRows.reduce((s, r) => s + num(r.baptises), 0);
  const totalActifs = numRows.reduce((s, r) => s + num(r.actifs), 0);
  const culteMembresNum = numRows.reduce((s, r) => s + num(r.culteMembres), 0);
  const culteMembresDiff = diff.reduce((s, r) => s + num(r.culteMembres), 0);
  const culteSympNum = numRows.reduce((s, r) => s + num(r.culteSymp), 0);
  const culteSympDiff = diff.reduce((s, r) => s + num(r.culteSymp), 0);
  const culteNVNum = numRows.reduce((s, r) => s + num(r.culteNV), 0);
  const culteNVDiff = diff.reduce((s, r) => s + num(r.culteNV), 0);
  const totalCulte = culteMembresNum + culteMembresDiff + culteSympNum + culteSympDiff + culteNVNum + culteNVDiff;
  const totalJohrei = numRows.reduce((s, r) => s + num(r.johrei), 0);
  const totalFleurs = numRows.reduce((s, r) => s + num(r.fleursDistrib), 0) + diff.reduce((s, r) => s + num(r.fleursDistrib), 0);

  const kpis = [
    { label: "Membres Baptisés (Num)", value: totalBaptises }, { label: "Membres Actifs (Num)", value: totalActifs },
    { label: "Culte — Membres", value: culteMembresNum + culteMembresDiff }, { label: "Culte — Sympathisants", value: culteSympNum + culteSympDiff },
    { label: "Culte — Nouveaux Venus", value: culteNVNum + culteNVDiff }, { label: "TOTAL CULTE MENSUEL", value: totalCulte },
    { label: "Pratiques Johrei", value: totalJohrei }, { label: "Fleurs Distribuées", value: totalFleurs }
  ];

  $("#kpiGrid").innerHTML = kpis.map(k => `<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value">${fmt(k.value)}</div></div>`).join("");

  const byProv = {};
  PROVINCES.forEach(p => byProv[p] = { numM: 0, numS: 0, numNV: 0, diffM: 0, diffS: 0, diffNV: 0 });
  numRows.forEach(r => { if (!byProv[r.province]) return; byProv[r.province].numM += num(r.culteMembres); byProv[r.province].numS += num(r.culteSymp); byProv[r.province].numNV += num(r.culteNV); });
  diff.forEach(r => { if (!byProv[r.province]) return; byProv[r.province].diffM += num(r.culteMembres); byProv[r.province].diffS += num(r.culteSymp); byProv[r.province].diffNV += num(r.culteNV); });

  let rows = "";
  PROVINCES.forEach(p => {
    const v = byProv[p], totalNum = v.numM + v.numS + v.numNV, totalDiff = v.diffM + v.diffS + v.diffNV;
    if (totalNum + totalDiff === 0) return;
    rows += `<tr><td>${p}</td><td class="num">${fmt(v.numM)}</td><td class="num">${fmt(v.numS)}</td><td class="num">${fmt(v.numNV)}</td><td class="num"><strong>${fmt(totalNum)}</strong></td><td class="num">${fmt(v.diffM)}</td><td class="num">${fmt(v.diffS)}</td><td class="num">${fmt(v.diffNV)}</td><td class="num"><strong>${fmt(totalDiff)}</strong></td></tr>`;
  });

  if (!rows) rows = `<tr><td colspan="9" style="text-align:center;">Aucune donnée pour le moment.</td></tr>`;

  $("#provinceSummary").innerHTML = `
    <div class="synth-section">
      <h3>Synthèse par Province — Culte Mensuel</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th rowspan="2">Province</th><th colspan="4">Numérique</th><th colspan="4">Diffusion</th></tr>
          <tr><th>Membres</th><th>Symp.</th><th>NV</th><th>Total</th><th>Membres</th><th>Symp.</th><th>NV</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function renderTable(type) {
  const data = Store.getByType(type), search = App.searchTerm;
  const filtered = data.filter(r => !search || Object.values(r).some(v => String(v).toLowerCase().includes(search)));
  const containerId = type === "numerique" ? "tableNumerique" : type === "diffusion" ? "tableDiffusion" : "tableDiffusionSuite";
  const table = $("#" + containerId); if (!table) return;

  let cols = type === "numerique" ? [
      { key: "province", label: "Province" }, { key: "typeEntite", label: "Type" }, { key: "denomination", label: "Dénomination" },
      { key: "responsable", label: "Responsable" }, { key: "baptises", label: "Baptisés", num: true }, { key: "actifs", label: "Actifs", num: true },
      { key: "culteMembres", label: "Culte M", num: true }, { key: "culteSymp", label: "Culte S", num: true }, { key: "culteNV", label: "Culte NV", num: true },
      { key: "totalCulte", label: "Total Culte", num: true, bold: true },
      { key: "johrei", label: "Johrei", num: true }, { key: "fleursDistrib", label: "Fleurs", num: true }
    ] : type === "diffusion" ? [
      { key: "province", label: "Province" }, { key: "denomination", label: "Dénomination" }, { key: "responsable", label: "Responsable" },
      { key: "membresActifs", label: "Actifs", num: true }, { key: "sympathisants", label: "Symp.", num: true }, { key: "culteMembres", label: "Culte M", num: true },
      { key: "culteSymp", label: "Culte S", num: true }, { key: "culteNV", label: "Culte NV", num: true },
      { key: "totalCulte", label: "Total Culte", num: true, bold: true },
      { key: "fleursDistrib", label: "Fleurs", num: true }
    ] : [
      { key: "province", label: "Province" }, { key: "denomination", label: "Dénomination" }, { key: "responsable", label: "Responsable" },
      { key: "campagnesNettoyage", label: "Nettoyages", num: true }, { key: "fleursDistrib", label: "Fleurs", num: true }, { key: "coursFleurs", label: "Cours", num: true }, { key: "themes", label: "Thèmes" }
    ];

  table.innerHTML = `
    <thead><tr><th>#</th>${cols.map(c => `<th>${c.label}</th>`).join("")}</tr></thead>
    <tbody>
      ${filtered.length === 0 ? `<tr><td colspan="${cols.length + 1}" style="text-align:center;padding:20px;">Aucune donnée.</td></tr>` : ""}
      ${filtered.map((r, i) => {
        const valFor = (c) => c.key === "totalCulte" ? calcTotalCulte(r) : r[c.key];
        return `
        <tr data-id="${r.id}" data-type="${type}" class="${r.id === App.selectedRowId ? 'selected' : ''}">
          <td>${i + 1}</td>${cols.map(c => {
            const v = valFor(c);
            const txt = c.num ? fmt(v) : (v || '—');
            return `<td class="${c.num ? 'num' : ''}">${c.bold ? `<strong>${txt}</strong>` : txt}</td>`;
          }).join("")}
        </tr>`;
      }).join("")}
    </tbody>`;

  $$("tbody tr[data-id]", table).forEach(tr => {
    tr.addEventListener("click", () => {
      const id = tr.dataset.id;
      if (App.selectedRowId === id) { clearSelection(); } else { App.selectedRowId = id; App.selectedType = type; }
      $$("tbody tr", table).forEach(t => t.classList.remove("selected"));
      if (App.selectedRowId) tr.classList.add("selected");
    });
  });
}

function renderSynthese() {
  const numRows = Store.data.numerique, diff = Store.data.diffusion;
  const sumNum = (k) => numRows.reduce((s, r) => s + num(r[k]), 0);
  const sumDiff = (k) => diff.reduce((s, r) => s + num(r[k]), 0);

  if (numRows.length === 0 && diff.length === 0) {
     $("#syntheseContent").innerHTML = `<div class="report-block"><p style="text-align:center;padding:20px;">Aucune donnée saisie pour le moment.</p></div>`;
     return;
  }

  const totalMembres = sumNum("culteMembres") + sumDiff("culteMembres");
  const totalSymp = sumNum("culteSymp") + sumDiff("culteSymp");
  const totalNV = sumNum("culteNV") + sumDiff("culteNV");
  const totalCulte = totalMembres + totalSymp + totalNV;
  const confirmations = sumDiff("confGoshintai") + sumDiff("confOhikari") + sumDiff("confReinit") + sumDiff("confShoku") + sumDiff("confKannon");

  $("#syntheseContent").innerHTML = `
    <div class="synth-section"><h3>1. Indicateurs Clés (KPI)</h3><div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Source</th><th>Membres</th><th>Sympathisants</th><th>NV</th><th>Total</th></tr></thead>
      <tbody>
        <tr><td>Diffusion — Culte Mensuel</td><td class="num">${fmt(sumDiff("culteMembres"))}</td><td class="num">${fmt(sumDiff("culteSymp"))}</td><td class="num">${fmt(sumDiff("culteNV"))}</td><td class="num">${fmt(sumDiff("culteMembres")+sumDiff("culteSymp")+sumDiff("culteNV"))}</td></tr>
        <tr><td>Numérique — Culte Mensuel</td><td class="num">${fmt(sumNum("culteMembres"))}</td><td class="num">${fmt(sumNum("culteSymp"))}</td><td class="num">${fmt(sumNum("culteNV"))}</td><td class="num">${fmt(sumNum("culteMembres")+sumNum("culteSymp")+sumNum("culteNV"))}</td></tr>
        <tr class="row-subtotal"><td>TOTAL CONSOLIDÉ</td><td class="num">${fmt(totalMembres)}</td><td class="num">${fmt(totalSymp)}</td><td class="num">${fmt(totalNV)}</td><td class="num">${fmt(totalCulte)}</td></tr>
      </tbody></table></div></div>
    <div class="synth-section"><h3>2. Bilan National</h3><div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Rubrique</th><th>Total National</th></tr></thead><tbody>
        <tr><td>Membres Baptisés</td><td class="num">${fmt(sumNum("baptises"))}</td></tr>
        <tr><td>Membres Actifs</td><td class="num">${fmt(sumNum("actifs")+sumDiff("membresActifs"))}</td></tr>
        <tr><td>Pratiques Johrei</td><td class="num">${fmt(sumNum("johrei"))}</td></tr>
        <tr><td>Fleurs Distribuées</td><td class="num">${fmt(sumNum("fleursDistrib")+sumDiff("fleursDistrib"))}</td></tr>
        <tr><td>Confirmations</td><td class="num">${fmt(confirmations)}</td></tr>
      </tbody></table></div></div>`;
}

function renderRapportGlobal() {
  let html = "";
  [{type:"numerique",title:"💻 Numérique"},{type:"diffusion",title:"📻 Diffusion"},{type:"diffusionSuite",title:"📋 Diffusion Suite"}].forEach(s => {
    const rows = Store.getByType(s.type), fields = SCHEMAS[s.type].fields;
    html += `<div class="report-block"><h3>${s.title}</h3><div class="table-wrapper"><table class="data-table"><thead><tr>${fields.map(f => `<th>${f.label}</th>`).join("")}</tr></thead><tbody>
      ${rows.length === 0 ? `<tr><td colspan="${fields.length}" style="text-align:center;">Aucune donnée</td></tr>` : ""}
      ${rows.map(r => `<tr>${fields.map(f => {
        const val = f.key === "totalCulte" ? calcTotalCulte(r) : r[f.key];
        const txt = f.type === "number" ? fmt(val) : (val || '—');
        return `<td class="${f.type === 'number' ? 'num' : ''}">${f.computed ? `<strong>${txt}</strong>` : txt}</td>`;
      }).join("")}</tr>`).join("")}
    </tbody></table></div></div>`;
  });
  $("#rapportGlobal").innerHTML = html;
}

function renderRapportDetaille() {
  const all = [...Store.data.numerique.map(r => ({...r, _src:"numerique"})),...Store.data.diffusion.map(r => ({...r, _src:"diffusion"})),...Store.data.diffusionSuite.map(r => ({...r, _src:"diffusionSuite"}))].filter(r => !App.searchTerm || Object.values(r).some(v => String(v).toLowerCase().includes(App.searchTerm)));

  if (all.length === 0) { $("#rapportDetaille").innerHTML = `<div class="report-block"><p style="text-align:center;">Aucune donnée.</p></div>`; return; }

  let html = "";
  all.forEach(r => {
    const schema = SCHEMAS[r._src];
    html += `<div class="report-block"><h3>${schema.title} — ${r.denomination || "(sans nom)"} <small>(${r.province || '—'})</small></h3><div class="table-wrapper"><table class="data-table"><tbody>
      ${schema.fields.filter(f => f.computed || (r[f.key] !== undefined && r[f.key] !== "")).map(f => {
        const val = f.key === "totalCulte" ? calcTotalCulte(r) : r[f.key];
        const txt = f.type === 'number' ? fmt(val) : val;
        return `<tr><th style="width:40%;background:#f1f5f9;color:#334155;">${f.label}</th><td>${f.computed ? `<strong>${txt}</strong>` : txt}</td></tr>`;
      }).join("")}
    </tbody></table></div></div>`;
  });
  $("#rapportDetaille").innerHTML = html;
}

function renderArchives() {
  const arch = Store.data.archives;
  if (arch.length === 0) { $("#archivesList").innerHTML = `<div class="report-block"><p style="text-align:center;">Aucune archive.</p></div>`; return; }
  let html = `<div class="report-block"><h3>🗄️ Archives</h3><div class="table-wrapper"><table class="data-table"><thead><tr><th>Source</th><th>Dénomination</th><th>Province</th><th>Date</th></tr></thead><tbody>`;
  arch.forEach(r => { html += `<tr><td>${r.originalType}</td><td>${r.denomination || '—'}</td><td>${r.province || '—'}</td><td>${new Date(r.archivedAt).toLocaleString('fr-FR')}</td></tr>`; });
  $("#archivesList").innerHTML = html + `</tbody></table></div></div>`;
}

function openFormForCurrentPage(editId) {
  const map = { numerique: "numerique", diffusion: "diffusion", "diffusion-suite": "diffusionSuite" };
  const type = map[App.currentPage];
  if (!type) return alert("Ouvrez d'abord la page Numérique, Diffusion ou Diffusion Suite.");
  openForm(type, editId);
}

function openForm(type, editId) {
  App.currentFormType = type; App.editingId = editId;
  const schema = SCHEMAS[type], record = editId ? Store.getByType(type).find(r => r.id === editId) || {} : {};
  $("#modalTitle").textContent = (editId ? "✏️ Modifier — " : "＋ Nouveau — ") + schema.title;

  const groups = {};
  schema.fields.forEach(f => { const g = f.group || "Général"; if (!groups[g]) groups[g] = []; groups[g].push(f); });

  let html = "";
  Object.keys(groups).forEach(g => {
    html += `<h4 style="margin:12px 0 8px;color:#1e3a8a;font-size:14px !important;border-bottom:1px solid #cbd5e1;padding-bottom:4px;">${g}</h4>`;
    groups[g].forEach(f => {
      const val = f.key === "totalCulte" ? calcTotalCulte(record) : (record[f.key] !== undefined ? record[f.key] : "");
      html += `<div class="form-group"><label>${f.label}${f.required ? " *" : ""}</label>`;
      if (f.type === "select") html += `<select id="fld_${f.key}">${f.options.map(o => `<option value="${o}" ${val === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
      else if (f.type === "textarea") html += `<textarea id="fld_${f.key}" rows="2">${val}</textarea>`;
      else if (f.computed) html += `<input type="number" id="fld_${f.key}" value="${val}" readonly style="background:#e2e8f0;font-weight:700;color:#1e3a8a;">`;
      else html += `<input type="${f.type}" id="fld_${f.key}" value="${val}">`;
      html += `</div>`;
    });
  });
  $("#modalBody").innerHTML = html;

  // Mise à jour automatique en direct du total Culte Mensuel
  const updateCulteTotal = () => {
    const totalEl = $("#fld_totalCulte");
    if (!totalEl) return;
    const m = num($("#fld_culteMembres")?.value);
    const s = num($("#fld_culteSymp")?.value);
    const nv = num($("#fld_culteNV")?.value);
    totalEl.value = m + s + nv;
  };
  ["culteMembres", "culteSymp", "culteNV"].forEach(k => {
    const el = $("#fld_" + k);
    if (el) el.addEventListener("input", updateCulteTotal);
  });
  updateCulteTotal();

  $("#modal").classList.add("show");
}

function closeModal() { $("#modal").classList.remove("show"); App.editingId = null; App.currentFormType = null; }

function saveForm() {
  const type = App.currentFormType, schema = SCHEMAS[type], data = {};
  let valid = true;
  schema.fields.forEach(f => {
    const el = $("#fld_" + f.key); if (!el) return;
    let v = el.value.trim(); if (f.type === "number") v = v === "" ? 0 : Number(v);
    if (f.required && (v === "" || v === undefined)) { valid = false; el.style.borderColor = "red"; } else { el.style.borderColor = ""; }
    data[f.key] = v;
  });
  if (!valid) return alert("Remplissez les champs obligatoires (*).");
  if (type === "numerique" || type === "diffusion") {
    data.totalCulte = calcTotalCulte(data);
  }
  if (App.editingId) Store.update(type, App.editingId, data); else Store.add(type, data);
  closeModal(); renderAll(); alert("✅ Enregistré.");
}

function bindPrintOptions() {
  const fontSel = $("#fontSelect"), sizeSel = $("#fontSize");
  function apply() {
    document.body.style.fontFamily = `'${fontSel.value}', sans-serif`;
    $$(".page").forEach(p => p.style.fontSize = sizeSel.value + "px");
  }
  fontSel.addEventListener("change", apply); sizeSel.addEventListener("change", apply); apply();
}

