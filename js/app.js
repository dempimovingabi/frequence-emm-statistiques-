const App = {
  currentPage: "dashboard",
  selectedRowId: null,
  selectedType: null,
  editingId: null,
  currentFormType: null,
  searchTerm: "",
  archiveYearFilter: "ALL",
  archiveMonthFilter: "ALL"
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
function fmt(n) { if (n === undefined || n === null || n === "") return "0"; const numVal = Number(n); return isNaN(numVal) ? n : numVal.toLocaleString("fr-FR"); }
function num(v) { const n = Number(v); return isNaN(n) ? 0 : n; }
function calcTotalCulte(r) { return num(r.culteMembres) + num(r.culteSymp) + num(r.culteNV); }

document.addEventListener("DOMContentLoaded", () => {
  Store.load();
  syncPeriodeControls();
  updatePeriodeLabel();
  updateNetStatus();
  bindNavigation();
  bindPeriodeControls();
  bindActions();
  bindPrintOptions();
  renderAll();
  goToPage("dashboard");
});

function syncPeriodeControls() {
  const selMois = $("#selectMois");
  const inpAnnee = $("#inputAnnee");
  const inpDate = $("#inputDateRef");
  if (selMois) selMois.value = Store.data.periode.mois || "NOVEMBRE";
  if (inpAnnee) inpAnnee.value = Store.data.periode.annee || 2026;
  if (inpDate) inpDate.value = Store.data.periode.dateReference || "";
}

function updatePeriodeLabel() {
  const el = $("#moisAnnee");
  const p = Store.data.periode || {};
  const datePart = p.dateReference ? ` • ${p.dateReference}` : "";
  if (el) el.textContent = `${p.mois || ""} ${p.annee || ""}${datePart}`;

  const printMeta = $("#printMetaLine");
  if (printMeta) {
    printMeta.textContent = `Période : ${p.mois || ""} ${p.annee || ""} — Date de référence : ${p.dateReference || "—"}`;
  }
}

function bindPeriodeControls() {
  const selMois = $("#selectMois");
  const inpAnnee = $("#inputAnnee");
  const inpDate = $("#inputDateRef");

  if (selMois) {
    selMois.addEventListener("change", () => {
      Store.data.periode.mois = selMois.value;
      Store.save();
      updatePeriodeLabel();
    });
  }

  if (inpAnnee) {
    inpAnnee.addEventListener("change", () => {
      const val = Number(inpAnnee.value);
      if (!isNaN(val) && val >= 2000 && val <= 2100) {
        Store.data.periode.annee = val;
        Store.save();
        updatePeriodeLabel();
      }
    });
  }

  if (inpDate) {
    inpDate.addEventListener("change", () => {
      Store.data.periode.dateReference = inpDate.value;
      if (inpDate.value) {
        const d = new Date(inpDate.value + "T12:00:00");
        if (!isNaN(d.getTime())) {
          Store.data.periode.annee = d.getFullYear();
          Store.data.periode.mois = MOIS_LISTE[d.getMonth()];
          syncPeriodeControls();
        }
      }
      Store.save();
      updatePeriodeLabel();
    });
  }
}

function updateNetStatus() {
  const el = $("#netStatus");
  if (!el) return;
  const online = navigator.onLine;
  el.textContent = online ? "● En ligne (Hors-ligne prêt)" : "● Hors connexion (Mode local)";
  el.style.color = online ? "#4ade80" : "#fbbf24";
}

window.addEventListener("online", updateNetStatus);
window.addEventListener("offline", updateNetStatus);

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
  const btnClear = $("#btnClearSearch");
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      App.searchTerm = "";
      $("#searchInput").value = "";
      renderAll();
    });
  }
  $("#btnNouveau").addEventListener("click", () => openFormForCurrentPage(null));
  $("#btnModifier").addEventListener("click", () => { if (!App.selectedRowId) return alert("Sélectionnez une ligne."); openFormForCurrentPage(App.selectedRowId); });
  $("#btnSupprimer").addEventListener("click", () => { if (!App.selectedRowId) return alert("Sélectionnez une ligne."); if (!confirm("Supprimer ?")) return; Store.remove(App.selectedType, App.selectedRowId); clearSelection(); renderAll(); });
  $("#btnArchiver").addEventListener("click", () => { if (!App.selectedRowId) return alert("Sélectionnez une ligne."); if (!confirm("Archiver dans la bibliothèque ?")) return; Store.archive(App.selectedType, App.selectedRowId); clearSelection(); renderAll(); });
  $("#btnCloseModal").addEventListener("click", closeModal);
  $("#btnCancel").addEventListener("click", closeModal);
  $("#btnSave").addEventListener("click", saveForm);
}
function clearSelection() { App.selectedRowId = null; App.selectedType = null; }

function renderAll() {
  renderDashboard(); renderGraphiques(); renderTable("numerique"); renderTable("diffusion"); renderTable("diffusionSuite");
  renderSynthese(); renderRapportGlobal(); renderRapportDetaille(); renderArchives();
}

function renderGraphiques() {
  const container = $("#graphiquesContent");
  if (!container) return;

  const search = App.searchTerm;
  const items = [
    ...Store.data.numerique.map(r => ({
      label: `${r.denomination || "(Sans nom)"} — ${r.typeEntite || "—"} (${r.province || "—"}) [Numérique]`,
      m: num(r.culteMembres),
      s: num(r.culteSymp),
      nv: num(r.culteNV)
    })),
    ...Store.data.diffusion.map(r => ({
      label: `${r.denomination || "(Sans nom)"} — ${r.typeEntite || "—"} (${r.province || "—"}) [Diffusion]`,
      m: num(r.culteMembres),
      s: num(r.culteSymp),
      nv: num(r.culteNV)
    }))
  ].map(x => ({ ...x, total: x.m + x.s + x.nv }))
   .filter(x => !search || x.label.toLowerCase().includes(search))
   .sort((a, b) => b.total - a.total);

  const byProv = PROVINCES.map(p => {
    let m = 0, s = 0, nv = 0;
    Store.data.numerique.filter(r => r.province === p).forEach(r => { m += num(r.culteMembres); s += num(r.culteSymp); nv += num(r.culteNV); });
    Store.data.diffusion.filter(r => r.province === p).forEach(r => { m += num(r.culteMembres); s += num(r.culteSymp); nv += num(r.culteNV); });
    return { label: p, m, s, nv, total: m + s + nv };
  }).filter(x => x.total > 0 && (!search || x.label.toLowerCase().includes(search)))
    .sort((a, b) => b.total - a.total);

  const legendHtml = `
    <div class="chart-legend">
      <span class="legend-item"><span class="legend-dot" style="background:#15803d;"></span>Membres</span>
      <span class="legend-item"><span class="legend-dot" style="background:#2563eb;"></span>Sympathisants</span>
      <span class="legend-item"><span class="legend-dot" style="background:#d97706;"></span>Nouveaux Venus</span>
    </div>`;

  function buildBars(list, emptyMsg) {
    if (!list.length) return `<p style="text-align:center;color:#64748b;padding:12px;">${emptyMsg}</p>`;
    const maxVal = Math.max(...list.map(x => x.total), 1);
    return list.map(x => {
      const pctTotal = Math.round((x.total / maxVal) * 100);
      const mShare = x.total > 0 ? (x.m / x.total) * pctTotal : 0;
      const sShare = x.total > 0 ? (x.s / x.total) * pctTotal : 0;
      const nvShare = x.total > 0 ? (x.nv / x.total) * pctTotal : 0;
      return `
        <div class="bar-row">
          <div class="bar-row-header">
            <strong>${x.label}</strong>
            <span><strong>${fmt(x.total)}</strong></span>
          </div>
          <div class="bar-track">
            <div class="bar-seg-m" style="width:${mShare}%;"></div>
            <div class="bar-seg-s" style="width:${sShare}%;"></div>
            <div class="bar-seg-nv" style="width:${nvShare}%;"></div>
          </div>
          <div class="bar-meta">
            <span>Membres : <strong>${fmt(x.m)}</strong></span>
            <span>Symp. : <strong>${fmt(x.s)}</strong></span>
            <span>NV : <strong>${fmt(x.nv)}</strong></span>
          </div>
        </div>`;
    }).join("");
  }

  container.innerHTML = `
    <div class="report-block">
      <h3>Fréquences du Culte Mensuel par Province</h3>
      ${legendHtml}
      ${buildBars(byProv, "Aucune fréquence enregistrée par province pour le moment.")}
    </div>
    <div class="report-block">
      <h3>Évolution des Fréquences par Entité</h3>
      ${legendHtml}
      ${buildBars(items, "Aucune entité avec fréquences enregistrées pour le moment.")}
    </div>`;
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
      { key: "dateRapport", label: "Date" }, { key: "province", label: "Province" }, { key: "typeEntite", label: "Type d'entité" },
      { key: "denomination", label: "Dénomination" }, { key: "responsable", label: "Responsable" }, { key: "baptises", label: "Baptisés", num: true },
      { key: "actifs", label: "Actifs", num: true }, { key: "culteMembres", label: "Culte M", num: true }, { key: "culteSymp", label: "Culte S", num: true },
      { key: "culteNV", label: "Culte NV", num: true }, { key: "totalCulte", label: "Total Culte", num: true, bold: true },
      { key: "johrei", label: "Johrei", num: true }, { key: "fleursDistrib", label: "Fleurs", num: true }
    ] : type === "diffusion" ? [
      { key: "dateRapport", label: "Date" }, { key: "province", label: "Province" }, { key: "typeEntite", label: "Type d'entité" },
      { key: "denomination", label: "Dénomination" }, { key: "responsable", label: "Responsable" }, { key: "membresActifs", label: "Actifs", num: true },
      { key: "sympathisants", label: "Symp.", num: true }, { key: "culteMembres", label: "Culte M", num: true }, { key: "culteSymp", label: "Culte S", num: true },
      { key: "culteNV", label: "Culte NV", num: true }, { key: "totalCulte", label: "Total Culte", num: true, bold: true },
      { key: "fleursDistrib", label: "Fleurs", num: true }
    ] : [
      { key: "dateRapport", label: "Date" }, { key: "province", label: "Province" }, { key: "typeEntite", label: "Type d'entité" },
      { key: "denomination", label: "Dénomination" }, { key: "responsable", label: "Responsable" }, { key: "campagnesNettoyage", label: "Nettoyages", num: true },
      { key: "fleursDistrib", label: "Fleurs", num: true }, { key: "coursFleurs", label: "Cours", num: true }, { key: "themes", label: "Thèmes" }
    ];

  table.innerHTML = `
    <thead><tr><th>#</th>${cols.map(c => `<th>${c.label}</th>`).join("")}</tr></thead>
    <tbody>
      ${filtered.length === 0 ? `<tr><td colspan="${cols.length + 1}" style="text-align:center;padding:20px;">Aucune donnée (${filtered.length} entrée).</td></tr>` : ""}
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
    html += `<div class="report-block"><h3>${schema.title} — ${r.denomination || "(sans nom)"} <small>(${r.typeEntite || '—'} • ${r.province || '—'})</small></h3><div class="table-wrapper"><table class="data-table"><tbody>
      ${schema.fields.filter(f => f.computed || (r[f.key] !== undefined && r[f.key] !== "")).map(f => {
        const val = f.key === "totalCulte" ? calcTotalCulte(r) : r[f.key];
        const txt = f.type === 'number' ? fmt(val) : val;
        return `<tr><th style="width:40%;background:#f1f5f9;color:#334155;">${f.label}</th><td>${f.computed ? `<strong>${txt}</strong>` : txt}</td></tr>`;
      }).join("")}
    </tbody></table></div></div>`;
  });
  $("#rapportDetaille").innerHTML = html;
}

function exportBackupJSON() {
  const payload = {
    app: "EMM RD Congo — Gestion Nationale",
    exportedAt: new Date().toISOString(),
    data: Store.data
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const mois = String(Store.data.periode?.mois || "periode").toLowerCase().replace(/\s+/g, "-");
  const annee = Store.data.periode?.annee || "";
  a.href = url;
  a.download = `emm-rdc-sauvegarde-${mois}-${annee}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importBackupJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      const importedData = parsed && parsed.data ? parsed.data : parsed;
      if (!importedData || typeof importedData !== "object") {
        return alert("Fichier de sauvegarde invalide.");
      }
      if (!confirm("Remplacer les données actuelles par celles de cette sauvegarde ?")) return;
      Store.data = {
        periode: Object.assign({ mois: "NOVEMBRE", annee: 2026, dateReference: "2026-11-19" }, importedData.periode || {}),
        numerique: Array.isArray(importedData.numerique) ? importedData.numerique : [],
        diffusion: Array.isArray(importedData.diffusion) ? importedData.diffusion : [],
        diffusionSuite: Array.isArray(importedData.diffusionSuite) ? importedData.diffusionSuite : [],
        archives: Array.isArray(importedData.archives) ? importedData.archives : []
      };
      Store.save();
      syncPeriodeControls();
      updatePeriodeLabel();
      renderAll();
      alert("✅ Sauvegarde restaurée avec succès.");
    } catch (err) {
      alert("Impossible de lire le fichier JSON.");
    }
  };
  reader.readAsText(file);
}

function renderArchives() {
  const archAll = Store.data.archives || [];
  const years = Array.from(new Set(archAll.map(r => String(r.archiveAnnee || new Date(r.archivedAt).getFullYear())))).sort((a, b) => b.localeCompare(a));
  const months = Array.from(new Set(archAll.map(r => String(r.archiveMois || MOIS_LISTE[new Date(r.archivedAt).getMonth()] || "").toUpperCase()).filter(Boolean)));

  const filteredArch = archAll.filter(r => {
    const y = String(r.archiveAnnee || new Date(r.archivedAt).getFullYear());
    const m = String(r.archiveMois || MOIS_LISTE[new Date(r.archivedAt).getMonth()] || "").toUpperCase();
    const matchY = App.archiveYearFilter === "ALL" || y === App.archiveYearFilter;
    const matchM = App.archiveMonthFilter === "ALL" || m === App.archiveMonthFilter;
    const matchS = !App.searchTerm || Object.values(r).some(v => String(v).toLowerCase().includes(App.searchTerm));
    return matchY && matchM && matchS;
  });

  const backupBar = `
    <div class="report-block" style="margin-bottom:16px;">
      <h3>💾 Sauvegarde & Restauration des Données</h3>
      <p style="margin:6px 0 12px;color:#475569;font-size:13px;">Exportez vos données en fichier <strong>.json</strong> pour les archiver ou les transférer, et importez un fichier de sauvegarde pour les restaurer.</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px;">
        <button type="button" class="btn btn-primary" id="btnExportJSON">⬇️ Exporter (.json)</button>
        <label class="btn btn-info" style="cursor:pointer;margin:0;">
          ⬆️ Importer (.json)
          <input type="file" id="inputImportJSON" accept=".json,application/json" style="display:none;">
        </label>
      </div>
    </div>`;

  const filterBar = `
    <div class="report-block" style="margin-bottom:16px;">
      <h3>📚 Bibliothèque d'Archives (Classée par Année & Mois)</h3>
      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:8px;">
        <label style="font-size:13px;font-weight:600;">Année :
          <select id="archiveFilterYear" style="padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px;">
            <option value="ALL">Toutes les années</option>
            ${years.map(y => `<option value="${y}" ${App.archiveYearFilter === y ? "selected" : ""}>${y}</option>`).join("")}
          </select>
        </label>
        <label style="font-size:13px;font-weight:600;">Mois :
          <select id="archiveFilterMonth" style="padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px;">
            <option value="ALL">Tous les mois</option>
            ${months.map(m => `<option value="${m}" ${App.archiveMonthFilter === m ? "selected" : ""}>${m}</option>`).join("")}
          </select>
        </label>
      </div>
    </div>`;

  let libraryHtml = "";
  if (filteredArch.length === 0) {
    libraryHtml = `<div class="report-block"><p style="text-align:center;">Aucune archive dans cette sélection.</p></div>`;
  } else {
    // Regroupement en bibliothèque : Année -> Mois -> Documents
    const tree = {};
    filteredArch.forEach(r => {
      const y = String(r.archiveAnnee || new Date(r.archivedAt).getFullYear());
      const m = String(r.archiveMois || MOIS_LISTE[new Date(r.archivedAt).getMonth()] || "AUTRE").toUpperCase();
      if (!tree[y]) tree[y] = {};
      if (!tree[y][m]) tree[y][m] = [];
      tree[y][m].push(r);
    });

    Object.keys(tree).sort((a, b) => b.localeCompare(a)).forEach(year => {
      const monthsObj = tree[year];
      const monthBlocks = Object.keys(monthsObj).map(month => {
        const docs = monthsObj[month];
        return `
          <div style="margin:10px 0 14px;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
            <div style="font-weight:700;color:#15803d;margin-bottom:8px;">📁 ${month} ${year} (${docs.length})</div>
            <div class="table-wrapper" style="margin-bottom:0;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Type rapport</th>
                    <th>Type d'entité</th>
                    <th>Dénomination</th>
                    <th>Province</th>
                    <th>Date</th>
                    <th>Archivé le</th>
                  </tr>
                </thead>
                <tbody>
                  ${docs.map(r => `
                    <tr>
                      <td>${r.originalType || '—'}</td>
                      <td>${r.typeEntite || '—'}</td>
                      <td><strong>${r.denomination || '—'}</strong></td>
                      <td>${r.province || '—'}</td>
                      <td>${r.dateReference || r.dateRapport || '—'}</td>
                      <td>${r.archivedAt ? new Date(r.archivedAt).toLocaleString('fr-FR') : '—'}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>`;
      }).join("");

      libraryHtml += `
        <div class="report-block">
          <h3>🗂️ Année ${year}</h3>
          ${monthBlocks}
        </div>`;
    });
  }

  $("#archivesList").innerHTML = backupBar + filterBar + libraryHtml;

  const btnExp = $("#btnExportJSON");
  const inpImp = $("#inputImportJSON");
  const selY = $("#archiveFilterYear");
  const selM = $("#archiveFilterMonth");

  if (btnExp) btnExp.addEventListener("click", exportBackupJSON);
  if (inpImp) inpImp.addEventListener("change", (e) => {
    importBackupJSON(e.target.files[0]);
    e.target.value = "";
  });
  if (selY) selY.addEventListener("change", () => {
    App.archiveYearFilter = selY.value;
    renderArchives();
  });
  if (selM) selM.addEventListener("change", () => {
    App.archiveMonthFilter = selM.value;
    renderArchives();
  });
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
      let defaultVal = "";
      if (f.key === "dateRapport" && !editId && !record.dateRapport) {
        defaultVal = Store.data.periode.dateReference || "";
      }
      const val = f.key === "totalCulte"
        ? calcTotalCulte(record)
        : (record[f.key] !== undefined ? record[f.key] : defaultVal);
      html += `<div class="form-group"><label>${f.label}${f.required ? " *" : ""}</label>`;
      if (f.type === "select") html += `<select id="fld_${f.key}">${f.options.map(o => `<option value="${o}" ${val === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
      else if (f.type === "textarea") html += `<textarea id="fld_${f.key}" rows="2">${val}</textarea>`;
      else if (f.computed) html += `<input type="number" id="fld_${f.key}" value="${val}" readonly style="background:#e2e8f0;font-weight:700;color:#1e3a8a;">`;
      else html += `<input type="${f.type}" id="fld_${f.key}" value="${val}">`;
      html += `</div>`;
    });
  });
  $("#modalBody").innerHTML = html;

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
  data.periodeMois = Store.data.periode.mois;
  data.periodeAnnee = Store.data.periode.annee;
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
