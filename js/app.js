const App = {
  currentPage: "dashboard",
  selectedRowId: null,
  selectedType: null,
  editingId: null,
  currentFormType: null,
  viewOnlyMode: false,
  searchTerm: "",
  selectedProvince: "Kasaï-Central",
  syntheseProvinceFilter: "ALL",
  archiveYearFilter: "ALL",
  archiveMonthFilter: "ALL"
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
function fmt(n) { if (n === undefined || n === null || n === "") return "0"; const numVal = Number(n); return isNaN(numVal) ? n : numVal.toLocaleString("fr-FR"); }
function num(v) { const n = Number(v); return isNaN(n) ? 0 : n; }
function calcTotalCulte(r) { return num(r.culteMembres) + num(r.culteSymp) + num(r.culteNV); }
function normStr(v) { return String(v || "").trim().toLowerCase(); }

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
      renderAll();
    });
  }

  if (inpAnnee) {
    inpAnnee.addEventListener("change", () => {
      const val = Number(inpAnnee.value);
      if (!isNaN(val) && val >= 2000 && val <= 2100) {
        Store.data.periode.annee = val;
        Store.save();
        updatePeriodeLabel();
        renderAll();
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
      renderAll();
    });
  }
}

function updateNetStatus() {
  const el = $("#netStatus");
  if (!el) return;
  const online = navigator.onLine;
  el.textContent = online ? "● En ligne (PWA prête)" : "● Hors connexion (Mode local)";
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

function deleteRecordById(type, id) {
  if (!type || !id) return;
  if (!confirm("Supprimer définitivement cet élément ?")) return;
  Store.remove(type, id);
  if (App.selectedRowId === id) clearSelection();
  renderAll();
}

function archiveRecordById(type, id) {
  if (!type || !id) return;
  if (!confirm("Archiver cet élément dans la bibliothèque ?")) return;
  Store.archive(type, id);
  if (App.selectedRowId === id) clearSelection();
  renderAll();
}

function rowActionButtonsHtml(type, id) {
  return `
    <td style="white-space:nowrap;text-align:center;">
      <button type="button" class="btn btn-eye btn-view-record" data-type="${type}" data-id="${id}" title="Aperçu">👁️</button>
      <button type="button" class="btn btn-info btn-edit-record" data-type="${type}" data-id="${id}" style="padding:4px 7px;font-size:11px;" title="Modifier">✏️</button>
      <button type="button" class="btn btn-warning btn-arch-record" data-type="${type}" data-id="${id}" style="padding:4px 7px;font-size:11px;" title="Archiver">📦</button>
      <button type="button" class="btn btn-danger btn-del-record" data-type="${type}" data-id="${id}" style="padding:4px 7px;font-size:11px;" title="Supprimer">🗑️</button>
    </td>`;
}

function bindRowActionButtons(container) {
  if (!container) return;
  $$(".btn-view-record", container).forEach(btn => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      openEyeModal(btn.dataset.type, btn.dataset.id);
    });
  });
  $$(".btn-edit-record", container).forEach(btn => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      openForm(btn.dataset.type, btn.dataset.id);
    });
  });
  $$(".btn-arch-record", container).forEach(btn => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      archiveRecordById(btn.dataset.type, btn.dataset.id);
    });
  });
  $$(".btn-del-record", container).forEach(btn => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      deleteRecordById(btn.dataset.type, btn.dataset.id);
    });
  });
}

function duplicateSelectedRecord() {
  if (!App.selectedRowId || !App.selectedType) {
    return alert("Sélectionnez d'abord une ligne à dupliquer.");
  }
  const list = Store.getByType(App.selectedType);
  const original = list.find(r => r.id === App.selectedRowId);
  if (!original) return alert("Élément introuvable.");

  const resetNumbers = confirm(
    `Dupliquer "${original.denomination || "cet élément"}" pour ${Store.data.periode.mois} ${Store.data.periode.annee} ?\n\n` +
    `• Cliquez sur OK pour garder les effectifs de base et remettre les fréquences du culte à 0.\n` +
    `• Cliquez sur Annuler pour annuler la duplication.`
  );
  if (!resetNumbers) return;

  const clone = Object.assign({}, original);
  delete clone.id;
  clone.dateRapport = Store.data.periode.dateReference || new Date().toISOString().slice(0, 10);
  clone.periodeMois = Store.data.periode.mois;
  clone.periodeAnnee = Store.data.periode.annee;

  if (App.selectedType === "numerique" || App.selectedType === "diffusion") {
    clone.culteMembres = 0;
    clone.culteSymp = 0;
    clone.culteNV = 0;
    clone.totalCulte = 0;
  }

  const created = Store.add(App.selectedType, clone);
  App.selectedRowId = created.id;
  App.selectedType = App.selectedType;
  renderAll();
  openForm(App.selectedType, created.id);
}

function exportCSVForCurrentView() {
  const typeMap = {
    entites: "entites",
    numerique: "numerique",
    diffusion: "diffusion",
    "diffusion-suite": "diffusionSuite"
  };
  const targetType = typeMap[App.currentPage] || "numerique";
  const schema = SCHEMAS[targetType];
  const rows = (Store.getByType(targetType) || []).filter(r =>
    !App.searchTerm || Object.values(r).some(v => String(v).toLowerCase().includes(App.searchTerm))
  );

  if (!rows.length) {
    return alert(`Aucune donnée à exporter pour "${schema.title}".`);
  }

  const escapeCsv = (val) => {
    const s = String(val === undefined || val === null ? "" : val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const headers = schema.fields.map(f => escapeCsv(f.label));
  const lines = [headers.join(";")];

  rows.forEach(r => {
    const line = schema.fields.map(f => {
      const val = f.key === "totalCulte" ? calcTotalCulte(r) : r[f.key];
      return escapeCsv(val);
    });
    lines.push(line.join(";"));
  });

  const csvContent = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const mois = String(Store.data.periode?.mois || "periode").toLowerCase().replace(/\s+/g, "-");
  const annee = Store.data.periode?.annee || "";
  a.href = url;
  a.download = `emm-rdc-${targetType}-${mois}-${annee}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
  $("#btnModifier").addEventListener("click", () => { if (!App.selectedRowId) return alert("Sélectionnez une ligne."); openForm(App.selectedType || "numerique", App.selectedRowId); });
  const btnDup = $("#btnDupliquer");
  if (btnDup) btnDup.addEventListener("click", duplicateSelectedRecord);
  $("#btnSupprimer").addEventListener("click", () => { if (!App.selectedRowId) return alert("Sélectionnez une ligne."); deleteRecordById(App.selectedType, App.selectedRowId); });
  $("#btnArchiver").addEventListener("click", () => { if (!App.selectedRowId) return alert("Sélectionnez une ligne."); archiveRecordById(App.selectedType, App.selectedRowId); });

  const actionBar = $(".action-bar");
  if (actionBar && !$("#btnExportCSV")) {
    const btnCsv = document.createElement("button");
    btnCsv.type = "button";
    btnCsv.id = "btnExportCSV";
    btnCsv.className = "btn btn-info";
    btnCsv.textContent = "📊 CSV";
    btnCsv.title = "Exporter le tableau actif au format CSV (Excel)";
    btnCsv.addEventListener("click", exportCSVForCurrentView);
    const btnPdf = $("#btnPDF");
    if (btnPdf) actionBar.insertBefore(btnCsv, btnPdf);
    else actionBar.appendChild(btnCsv);
  }

  $("#btnCloseModal").addEventListener("click", closeModal);
  $("#btnCancel").addEventListener("click", closeModal);
  $("#btnSave").addEventListener("click", saveForm);
}
function clearSelection() { App.selectedRowId = null; App.selectedType = null; }

function renderAll() {
  renderDashboard();
  renderEntitesPage();
  renderGraphiques();
  renderTable("numerique");
  renderTable("diffusion");
  renderTable("diffusionSuite");
  renderSynthese();
  renderRapportGlobal();
  renderRapportDetaille();
  renderArchives();
  renderStorageFooterNote();
}

function renderStorageFooterNote() {
  const footer = $(".sidebar-footer");
  if (!footer) return;
  let note = $("#storageSummaryNote", footer);
  if (!note) {
    note = document.createElement("small");
    note.id = "storageSummaryNote";
    note.style.color = "#94a3b8";
    footer.insertBefore(note, footer.lastElementChild);
  }
  const entCount = (Store.data.entites || []).length;
  const repCount = (Store.data.numerique || []).length + (Store.data.diffusion || []).length + (Store.data.diffusionSuite || []).length;
  const archCount = (Store.data.archives || []).length;
  note.textContent = `${entCount} entité(s) • ${repCount} rapport(s) • ${archCount} archive(s)`;
}

function renderEntitesPage() {
  const container = $("#entitesContent");
  if (!container) return;

  const prov = App.selectedProvince || "Kasaï-Central";
  const allEntites = Store.data.entites || [];
  const provEntites = allEntites.filter(e => e.province === prov && (!App.searchTerm || Object.values(e).some(v => String(v).toLowerCase().includes(App.searchTerm))));

  const pillsHtml = PROVINCES.map(p => {
    const count = allEntites.filter(e => e.province === p).length;
    return `<button type="button" class="prov-pill ${p === prov ? "active" : ""}" data-prov="${p}">${p}${count > 0 ? ` (${count})` : ""}</button>`;
  }).join("");

  const rowsHtml = provEntites.length === 0
    ? `<tr><td colspan="7" style="text-align:center;padding:20px;">Aucune entité enregistrée pour <strong>${prov}</strong>. Cliquez sur <strong>＋ Enregistrer une entité</strong> pour commencer.</td></tr>`
    : provEntites.map((e, idx) => `
      <tr data-id="${e.id}" data-type="entites" class="${e.id === App.selectedRowId ? 'selected' : ''}">
        <td>${idx + 1}</td>
        <td><strong>${e.denomination || '—'}</strong></td>
        <td>${e.typeEntite || '—'}</td>
        <td>${e.responsable || '—'}</td>
        <td>${e.telephone || '—'}</td>
        <td>${e.observations || '—'}</td>
        ${rowActionButtonsHtml("entites", e.id)}
      </tr>`).join("");

  container.innerHTML = `
    <div class="report-block">
      <h3>1. Choisissez la Province (ex. Kasaï-Central)</h3>
      <div class="province-pills" id="entiteProvPills">${pillsHtml}</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;">
        <div>
          <strong>Province active :</strong> ${prov} — <strong>${provEntites.length}</strong> entité(s) répertoriée(s)
        </div>
        <button type="button" class="btn btn-success" id="btnAddEntiteProv">＋ Enregistrer une entité (${prov})</button>
      </div>
    </div>

    <div class="report-block">
      <h3>2. Entités enregistrées — ${prov} (dans l'ordre d'enregistrement)</h3>
      <div class="table-wrapper">
        <table class="data-table" id="tableEntitesProv">
          <thead>
            <tr>
              <th>#</th>
              <th>Dénomination</th>
              <th>Type d'entité</th>
              <th>Responsable</th>
              <th>Téléphone</th>
              <th>Observations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>`;

  $$(".prov-pill", container).forEach(btn => {
    btn.addEventListener("click", () => {
      App.selectedProvince = btn.dataset.prov;
      clearSelection();
      renderEntitesPage();
    });
  });

  const btnAdd = $("#btnAddEntiteProv");
  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      openForm("entites", null, { province: prov });
    });
  }

  const tbl = $("#tableEntitesProv");
  if (tbl) {
    $$("tbody tr[data-id]", tbl).forEach(tr => {
      tr.addEventListener("click", (ev) => {
        if (ev.target.closest("button")) return;
        const id = tr.dataset.id;
        if (App.selectedRowId === id) { clearSelection(); } else { App.selectedRowId = id; App.selectedType = "entites"; }
        $$("tbody tr", tbl).forEach(t => t.classList.remove("selected"));
        if (App.selectedRowId) tr.classList.add("selected");
      });
    });
    bindRowActionButtons(tbl);
  }
}

function openEyeModal(type, id) {
  const record = (Store.getByType(type) || []).find(r => r.id === id);
  if (!record) return;
  const schema = SCHEMAS[type];
  App.viewOnlyMode = true;
  $("#modalTitle").textContent = `👁️ Aperçu Détaillé — ${record.denomination || schema.title}`;

  let html = "";
  schema.fields.forEach(f => {
    const val = f.key === "totalCulte" ? calcTotalCulte(record) : (record[f.key] !== undefined && record[f.key] !== "" ? record[f.key] : "—");
    const displayVal = f.type === "number" && val !== "—" ? fmt(val) : val;
    html += `
      <div class="form-group">
        <label>${f.label}</label>
        <input type="text" value="${String(displayVal).replace(/"/g, "&quot;")}" readonly style="background:#f8fafc;font-weight:${f.computed ? "700" : "500"};color:#0f172a;">
      </div>`;
  });

  $("#modalBody").innerHTML = html;
  $("#btnSave").style.display = "none";
  $("#modal").classList.add("show");
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
  const numRows = Store.data.numerique, diff = Store.data.diffusion, entites = Store.data.entites || [];
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
    { label: "Entités Répertoriées", value: entites.length },
    { label: "Membres Baptisés (Num)", value: totalBaptises },
    { label: "Membres Actifs (Num)", value: totalActifs },
    { label: "Culte — Membres", value: culteMembresNum + culteMembresDiff },
    { label: "Culte — Sympathisants", value: culteSympNum + culteSympDiff },
    { label: "Culte — Nouveaux Venus", value: culteNVNum + culteNVDiff },
    { label: "TOTAL CULTE MENSUEL", value: totalCulte },
    { label: "Pratiques Johrei", value: totalJohrei },
    { label: "Fleurs Distribuées", value: totalFleurs }
  ];

  $("#kpiGrid").innerHTML = kpis.map(k => `<div class="kpi-card"><div class="kpi-label">${k.label}</div><div class="kpi-value">${fmt(k.value)}</div></div>`).join("");

  const byProv = {};
  PROVINCES.forEach(p => byProv[p] = { entCount: 0, numM: 0, numS: 0, numNV: 0, diffM: 0, diffS: 0, diffNV: 0 });
  entites.forEach(e => { if (byProv[e.province]) byProv[e.province].entCount += 1; });
  numRows.forEach(r => { if (!byProv[r.province]) return; byProv[r.province].numM += num(r.culteMembres); byProv[r.province].numS += num(r.culteSymp); byProv[r.province].numNV += num(r.culteNV); });
  diff.forEach(r => { if (!byProv[r.province]) return; byProv[r.province].diffM += num(r.culteMembres); byProv[r.province].diffS += num(r.culteSymp); byProv[r.province].diffNV += num(r.culteNV); });

  let rows = "";
  PROVINCES.forEach(p => {
    const v = byProv[p], totalNum = v.numM + v.numS + v.numNV, totalDiff = v.diffM + v.diffS + v.diffNV;
    if (totalNum + totalDiff === 0 && v.entCount === 0) return;
    rows += `<tr><td>${p}</td><td class="num">${fmt(v.entCount)}</td><td class="num">${fmt(v.numM)}</td><td class="num">${fmt(v.numS)}</td><td class="num">${fmt(v.numNV)}</td><td class="num"><strong>${fmt(totalNum)}</strong></td><td class="num">${fmt(v.diffM)}</td><td class="num">${fmt(v.diffS)}</td><td class="num">${fmt(v.diffNV)}</td><td class="num"><strong>${fmt(totalDiff)}</strong></td></tr>`;
  });

  if (!rows) rows = `<tr><td colspan="10" style="text-align:center;">Aucune donnée pour le moment.</td></tr>`;

  $("#provinceSummary").innerHTML = `
    <div class="synth-section">
      <h3>Synthèse par Province — Entités & Culte Mensuel</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead><tr><th rowspan="2">Province</th><th rowspan="2">Entités</th><th colspan="4">Numérique</th><th colspan="4">Diffusion</th></tr>
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
    <thead><tr><th>#</th>${cols.map(c => `<th>${c.label}</th>`).join("")}<th>Actions</th></tr></thead>
    <tbody>
      ${filtered.length === 0 ? `<tr><td colspan="${cols.length + 2}" style="text-align:center;padding:20px;">Aucune donnée (${filtered.length} entrée).</td></tr>` : ""}
      ${filtered.map((r, i) => {
        const valFor = (c) => c.key === "totalCulte" ? calcTotalCulte(r) : r[c.key];
        return `
        <tr data-id="${r.id}" data-type="${type}" class="${r.id === App.selectedRowId ? 'selected' : ''}">
          <td>${i + 1}</td>${cols.map(c => {
            const v = valFor(c);
            const txt = c.num ? fmt(v) : (v || '—');
            return `<td class="${c.num ? 'num' : ''}">${c.bold ? `<strong>${txt}</strong>` : txt}</td>`;
          }).join("")}
          ${rowActionButtonsHtml(type, r.id)}
        </tr>`;
      }).join("")}
    </tbody>`;

  $$("tbody tr[data-id]", table).forEach(tr => {
    tr.addEventListener("click", (ev) => {
      if (ev.target.closest("button")) return;
      const id = tr.dataset.id;
      if (App.selectedRowId === id) { clearSelection(); } else { App.selectedRowId = id; App.selectedType = type; }
      $$("tbody tr", table).forEach(t => t.classList.remove("selected"));
      if (App.selectedRowId) tr.classList.add("selected");
    });
  });

  bindRowActionButtons(table);
}

function renderSynthese() {
  const periodeMois = Store.data.periode?.mois || "";
  const periodeAnnee = String(Store.data.periode?.annee || "");
  const provFilter = App.syntheseProvinceFilter || "ALL";

  const matchesPeriode = (r) => {
    const mMatch = !periodeMois || !r.periodeMois || String(r.periodeMois).toUpperCase() === String(periodeMois).toUpperCase();
    const yMatch = !periodeAnnee || !r.periodeAnnee || String(r.periodeAnnee) === periodeAnnee;
    return mMatch && yMatch;
  };

  const matchesProv = (r) => provFilter === "ALL" || r.province === provFilter;

  const numRows = (Store.data.numerique || []).filter(r => matchesPeriode(r) && matchesProv(r));
  const diff = (Store.data.diffusion || []).filter(r => matchesPeriode(r) && matchesProv(r));
  const suite = (Store.data.diffusionSuite || []).filter(r => matchesPeriode(r) && matchesProv(r));
  const entites = (Store.data.entites || []).filter(matchesProv);

  const sumNum = (k) => numRows.reduce((s, r) => s + num(r[k]), 0);
  const sumDiff = (k) => diff.reduce((s, r) => s + num(r[k]), 0);

  const provincesToCheck = provFilter === "ALL" ? PROVINCES : [provFilter];
  const completudeRows = provincesToCheck.map(p => {
    const provEntites = (Store.data.entites || []).filter(e => e.province === p);
    const totalEnt = provEntites.length;

    const reportedNames = new Set(
      [
        ...(Store.data.numerique || []).filter(r => r.province === p && matchesPeriode(r)),
        ...(Store.data.diffusion || []).filter(r => r.province === p && matchesPeriode(r)),
        ...(Store.data.diffusionSuite || []).filter(r => r.province === p && matchesPeriode(r))
      ]
        .map(r => normStr(r.denomination))
        .filter(Boolean)
    );

    const submittedCount = totalEnt > 0
      ? provEntites.filter(e => reportedNames.has(normStr(e.denomination))).length
      : reportedNames.size;

    const rate = totalEnt > 0 ? Math.round((submittedCount / totalEnt) * 100) : (submittedCount > 0 ? 100 : 0);
    const statusLabel = totalEnt === 0
      ? (submittedCount > 0 ? `${submittedCount} rapport(s) (0 entité répertoriée)` : "Aucune entité répertoriée")
      : (submittedCount >= totalEnt ? "✅ Complet" : submittedCount > 0 ? "🟡 En cours" : "🔴 En attente");

    return { province: p, totalEnt, submittedCount, rate, statusLabel };
  }).filter(item => item.totalEnt > 0 || item.submittedCount > 0 || provFilter !== "ALL");

  const completudeHtml = `
    <div class="synth-section">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;">
        <h3 style="margin:0;">📌 Complétude des Rapports par Province (${periodeMois} ${periodeAnnee})</h3>
        <label style="font-size:13px;font-weight:600;">Province :
          <select id="syntheseProvSelect" style="padding:5px 8px;border:1px solid #cbd5e1;border-radius:6px;">
            <option value="ALL" ${provFilter === "ALL" ? "selected" : ""}>Toutes les provinces</option>
            ${PROVINCES.map(p => `<option value="${p}" ${provFilter === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Province</th>
              <th>Entités Répertoriées</th>
              <th>Rapports Soumis</th>
              <th>Taux</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            ${completudeRows.length === 0
              ? `<tr><td colspan="5" style="text-align:center;padding:16px;">Aucune entité ni rapport enregistré pour cette sélection.</td></tr>`
              : completudeRows.map(c => `
                <tr>
                  <td><strong>${c.province}</strong></td>
                  <td class="num">${fmt(c.totalEnt)}</td>
                  <td class="num"><strong>${fmt(c.submittedCount)}</strong></td>
                  <td class="num">${c.rate}%</td>
                  <td>${c.statusLabel}</td>
                </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;

  if (numRows.length === 0 && diff.length === 0 && suite.length === 0 && entites.length === 0) {
    $("#syntheseContent").innerHTML = completudeHtml + `<div class="report-block"><p style="text-align:center;padding:20px;">Aucune donnée saisie pour le moment.</p></div>`;
    const sel = $("#syntheseProvSelect");
    if (sel) sel.addEventListener("change", () => { App.syntheseProvinceFilter = sel.value; renderSynthese(); });
    return;
  }

  const totalMembres = sumNum("culteMembres") + sumDiff("culteMembres");
  const totalSymp = sumNum("culteSymp") + sumDiff("culteSymp");
  const totalNV = sumNum("culteNV") + sumDiff("culteNV");
  const totalCulte = totalMembres + totalSymp + totalNV;
  const confirmations = sumDiff("confGoshintai") + sumDiff("confOhikari") + sumDiff("confReinit") + sumDiff("confShoku") + sumDiff("confKannon");

  $("#syntheseContent").innerHTML = completudeHtml + `
    <div class="synth-section"><h3>1. Indicateurs Clés (KPI)</h3><div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Source</th><th>Membres</th><th>Sympathisants</th><th>NV</th><th>Total</th></tr></thead>
      <tbody>
        <tr><td>Diffusion — Culte Mensuel</td><td class="num">${fmt(sumDiff("culteMembres"))}</td><td class="num">${fmt(sumDiff("culteSymp"))}</td><td class="num">${fmt(sumDiff("culteNV"))}</td><td class="num">${fmt(sumDiff("culteMembres")+sumDiff("culteSymp")+sumDiff("culteNV"))}</td></tr>
        <tr><td>Numérique — Culte Mensuel</td><td class="num">${fmt(sumNum("culteMembres"))}</td><td class="num">${fmt(sumNum("culteSymp"))}</td><td class="num">${fmt(sumNum("culteNV"))}</td><td class="num">${fmt(sumNum("culteMembres")+sumNum("culteSymp")+sumNum("culteNV"))}</td></tr>
        <tr class="row-subtotal"><td>TOTAL CONSOLIDÉ</td><td class="num">${fmt(totalMembres)}</td><td class="num">${fmt(totalSymp)}</td><td class="num">${fmt(totalNV)}</td><td class="num">${fmt(totalCulte)}</td></tr>
      </tbody></table></div></div>
    <div class="synth-section"><h3>2. Bilan National</h3><div class="table-wrapper"><table class="data-table">
      <thead><tr><th>Rubrique</th><th>Total National</th></tr></thead><tbody>
        <tr><td>Entités Répertoriées</td><td class="num">${fmt(entites.length)}</td></tr>
        <tr><td>Membres Baptisés</td><td class="num">${fmt(sumNum("baptises"))}</td></tr>
        <tr><td>Membres Actifs</td><td class="num">${fmt(sumNum("actifs")+sumDiff("membresActifs"))}</td></tr>
        <tr><td>Pratiques Johrei</td><td class="num">${fmt(sumNum("johrei"))}</td></tr>
        <tr><td>Fleurs Distribuées</td><td class="num">${fmt(sumNum("fleursDistrib")+sumDiff("fleursDistrib"))}</td></tr>
        <tr><td>Confirmations</td><td class="num">${fmt(confirmations)}</td></tr>
      </tbody></table></div></div>`;

  const sel = $("#syntheseProvSelect");
  if (sel) sel.addEventListener("change", () => { App.syntheseProvinceFilter = sel.value; renderSynthese(); });
}

function renderRapportGlobal() {
  const matchSearch = (r) => !App.searchTerm || Object.values(r).some(v => String(v).toLowerCase().includes(App.searchTerm));
  const allEntites = (Store.data.entites || []).filter(matchSearch);
  const allReports = [
    ...(Store.data.numerique || []).filter(matchSearch).map(r => ({ ...r, _type: "numerique", _label: "Numérique" })),
    ...(Store.data.diffusion || []).filter(matchSearch).map(r => ({ ...r, _type: "diffusion", _label: "Diffusion" })),
    ...(Store.data.diffusionSuite || []).filter(matchSearch).map(r => ({ ...r, _type: "diffusionSuite", _label: "Diffusion Suite" }))
  ];

  let html = "";

  PROVINCES.forEach(prov => {
    const provEntites = allEntites.filter(e => e.province === prov);
    const provReports = allReports.filter(r => r.province === prov);
    if (provEntites.length === 0 && provReports.length === 0) return;

    const entitesListHtml = provEntites.length === 0
      ? `<p style="color:#64748b;font-size:13px;margin:4px 0 12px;">Aucune entité enregistrée pour ${prov}.</p>`
      : `
        <div class="table-wrapper" style="margin-bottom:12px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Dénomination</th>
                <th>Type d'entité</th>
                <th>Responsable</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${provEntites.map((e, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${e.denomination || "—"}</strong></td>
                  <td>${e.typeEntite || "—"}</td>
                  <td>${e.responsable || "—"}</td>
                  <td>${e.telephone || "—"}</td>
                  ${rowActionButtonsHtml("entites", e.id)}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>`;

    const reportsListHtml = provReports.length === 0
      ? `<p style="color:#64748b;font-size:13px;margin:4px 0 0;">Aucun rapport enregistré pour ${prov}.</p>`
      : `
        <div class="table-wrapper" style="margin-bottom:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Rapport</th>
                <th>Entité</th>
                <th>Type</th>
                <th>Responsable</th>
                <th>Total Culte</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${provReports.map((r, idx) => {
                const tot = (r._type === "numerique" || r._type === "diffusion") ? fmt(calcTotalCulte(r)) : "—";
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${r._label}</td>
                    <td><strong>${r.denomination || "—"}</strong></td>
                    <td>${r.typeEntite || "—"}</td>
                    <td>${r.responsable || "—"}</td>
                    <td class="num"><strong>${tot}</strong></td>
                    <td>${r.dateRapport || "—"}</td>
                    ${rowActionButtonsHtml(r._type, r.id)}
                  </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>`;

    html += `
      <div class="report-block">
        <h3>📍 Province : ${prov} (${provEntites.length} entité(s) • ${provReports.length} rapport(s))</h3>
        <div style="font-weight:700;color:#15803d;font-size:13px;margin-bottom:6px;">Entités enregistrées (${prov})</div>
        ${entitesListHtml}
        <div style="font-weight:700;color:#1e3a8a;font-size:13px;margin-bottom:6px;">Rapports de la province (${prov})</div>
        ${reportsListHtml}
      </div>`;
  });

  if (!html) {
    html = `<div class="report-block"><p style="text-align:center;">Aucune donnée enregistrée pour le moment.</p></div>`;
  }

  $("#rapportGlobal").innerHTML = html;
  bindRowActionButtons($("#rapportGlobal"));
}

function renderRapportDetaille() {
  const all = [
    ...(Store.data.entites || []).map(r => ({ ...r, _src: "entites" })),
    ...(Store.data.numerique || []).map(r => ({ ...r, _src: "numerique" })),
    ...(Store.data.diffusion || []).map(r => ({ ...r, _src: "diffusion" })),
    ...(Store.data.diffusionSuite || []).map(r => ({ ...r, _src: "diffusionSuite" }))
  ].filter(r => !App.searchTerm || Object.values(r).some(v => String(v).toLowerCase().includes(App.searchTerm)));

  if (all.length === 0) {
    $("#rapportDetaille").innerHTML = `<div class="report-block"><p style="text-align:center;">Aucune donnée.</p></div>`;
    return;
  }

  let html = "";
  PROVINCES.forEach(prov => {
    const provItems = all.filter(r => r.province === prov);
    if (!provItems.length) return;

    const cardsHtml = provItems.map(r => {
      const schema = SCHEMAS[r._src];
      return `
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin-bottom:10px;background:#f8fafc;">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
            <strong style="color:#0f172a;">${r.denomination || "(sans nom)"} <span style="font-weight:500;color:#475569;">(${schema.title} • ${r.typeEntite || "—"})</span></strong>
            <div style="white-space:nowrap;">
              <button type="button" class="btn btn-eye btn-view-record" data-type="${r._src}" data-id="${r.id}" title="Aperçu">👁️</button>
              <button type="button" class="btn btn-info btn-edit-record" data-type="${r._src}" data-id="${r.id}" style="padding:4px 7px;font-size:11px;" title="Modifier">✏️</button>
              <button type="button" class="btn btn-warning btn-arch-record" data-type="${r._src}" data-id="${r.id}" style="padding:4px 7px;font-size:11px;" title="Archiver">📦</button>
              <button type="button" class="btn btn-danger btn-del-record" data-type="${r._src}" data-id="${r.id}" style="padding:4px 7px;font-size:11px;" title="Supprimer">🗑️</button>
            </div>
          </div>
          <div class="table-wrapper" style="margin-bottom:0;">
            <table class="data-table">
              <tbody>
                ${schema.fields.filter(f => f.computed || (r[f.key] !== undefined && r[f.key] !== "")).map(f => {
                  const val = f.key === "totalCulte" ? calcTotalCulte(r) : r[f.key];
                  const txt = f.type === 'number' ? fmt(val) : val;
                  return `<tr><th style="width:40%;background:#ffffff;color:#334155;">${f.label}</th><td>${f.computed ? `<strong>${txt}</strong>` : txt}</td></tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>`;
    }).join("");

    html += `
      <div class="report-block">
        <h3>📍 ${prov} (${provItems.length})</h3>
        ${cardsHtml}
      </div>`;
  });

  $("#rapportDetaille").innerHTML = html;
  bindRowActionButtons($("#rapportDetaille"));
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
        periode: Object.assign({ mois: "NOVEMBRE", annee: 2026, dateReference: "2026-11-20" }, importedData.periode || {}),
        entites: Array.isArray(importedData.entites) ? importedData.entites : [],
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

function restoreArchivedItem(indexInArchives) {
  const arch = Store.data.archives || [];
  const item = arch[indexInArchives];
  if (!item) return;
  const targetType = item.originalType && Store.data[item.originalType] ? item.originalType : "numerique";
  const restored = Object.assign({}, item);
  delete restored.archivedAt;
  delete restored.originalType;
  delete restored.archiveAnnee;
  delete restored.archiveMois;
  Store.data[targetType].push(restored);
  Store.data.archives.splice(indexInArchives, 1);
  Store.save();
  renderAll();
  alert("✅ Élément restauré.");
}

function deleteArchivedItem(indexInArchives) {
  const arch = Store.data.archives || [];
  if (!arch[indexInArchives]) return;
  if (!confirm("Supprimer définitivement cette archive ?")) return;
  Store.data.archives.splice(indexInArchives, 1);
  Store.save();
  renderAll();
}

function renderArchives() {
  const archAll = Store.data.archives || [];
  const years = Array.from(new Set(archAll.map(r => String(r.archiveAnnee || new Date(r.archivedAt).getFullYear())))).sort((a, b) => b.localeCompare(a));
  const months = Array.from(new Set(archAll.map(r => String(r.archiveMois || MOIS_LISTE[new Date(r.archivedAt).getMonth()] || "").toUpperCase()).filter(Boolean)));

  const filteredArch = archAll
    .map((r, realIdx) => ({ r, realIdx }))
    .filter(({ r }) => {
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
      <p style="margin:6px 0 12px;color:#475569;font-size:13px;">Pensez à exporter régulièrement une copie <strong>.json</strong> pour sécuriser vos données locales avant toute mise à jour ou changement d'appareil.</p>
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
    const tree = {};
    filteredArch.forEach(entry => {
      const r = entry.r;
      const y = String(r.archiveAnnee || new Date(r.archivedAt).getFullYear());
      const m = String(r.archiveMois || MOIS_LISTE[new Date(r.archivedAt).getMonth()] || "AUTRE").toUpperCase();
      if (!tree[y]) tree[y] = {};
      if (!tree[y][m]) tree[y][m] = [];
      tree[y][m].push(entry);
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${docs.map(({ r, realIdx }) => `
                    <tr>
                      <td>${r.originalType || '—'}</td>
                      <td>${r.typeEntite || '—'}</td>
                      <td><strong>${r.denomination || '—'}</strong></td>
                      <td>${r.province || '—'}</td>
                      <td>${r.dateReference || r.dateRapport || '—'}</td>
                      <td>${r.archivedAt ? new Date(r.archivedAt).toLocaleString('fr-FR') : '—'}</td>
                      <td style="white-space:nowrap;">
                        <button type="button" class="btn btn-success btn-restore-arch" data-idx="${realIdx}" style="padding:4px 7px;font-size:11px;" title="Restaurer">♻️</button>
                        <button type="button" class="btn btn-danger btn-del-arch" data-idx="${realIdx}" style="padding:4px 7px;font-size:11px;" title="Supprimer">✕</button>
                      </td>
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

  $$(".btn-restore-arch", $("#archivesList")).forEach(btn => {
    btn.addEventListener("click", () => restoreArchivedItem(Number(btn.dataset.idx)));
  });
  $$(".btn-del-arch", $("#archivesList")).forEach(btn => {
    btn.addEventListener("click", () => deleteArchivedItem(Number(btn.dataset.idx)));
  });
}

function openFormForCurrentPage(editId) {
  const map = {
    entites: "entites",
    numerique: "numerique",
    diffusion: "diffusion",
    "diffusion-suite": "diffusionSuite"
  };
  const type = map[App.currentPage];
  if (!type) return alert("Ouvrez Répertoire Entités, Numérique, Diffusion ou Diffusion Suite.");
  const prefill = type === "entites" ? { province: App.selectedProvince || "Kasaï-Central" } : {};
  openForm(type, editId, prefill);
}

function findDuplicateEntity(provVal, denomVal, excludeId) {
  const target = normStr(denomVal);
  if (!provVal || !target) return null;
  return (Store.data.entites || []).find(e =>
    e.id !== excludeId &&
    e.province === provVal &&
    normStr(e.denomination) === target
  ) || null;
}

function openForm(type, editId, prefill = {}) {
  App.currentFormType = type;
  App.editingId = editId;
  App.viewOnlyMode = false;
  $("#btnSave").style.display = "inline-flex";

  const schema = SCHEMAS[type];
  const existing = editId ? Store.getByType(type).find(r => r.id === editId) || {} : {};
  const record = Object.assign({}, prefill, existing);
  $("#modalTitle").textContent = (editId ? "✏️ Modifier — " : "＋ Nouveau — ") + schema.title;

  const groups = {};
  schema.fields.forEach(f => { const g = f.group || "Général"; if (!groups[g]) groups[g] = []; groups[g].push(f); });

  let html = "";

  if (type !== "entites" && !editId && (Store.data.entites || []).length > 0) {
    html += `
      <div class="form-group" style="grid-column: 1 / -1; background:#f0fdf4; padding:10px; border-radius:8px; border:1px solid #bbf7d0;">
        <label for="quickSelectEntite">⚡ Choisir une entité déjà enregistrée (pré-remplissage auto)</label>
        <select id="quickSelectEntite">
          <option value="">-- Saisie manuelle ou choisir une entité --</option>
          ${Store.data.entites.map(e => `<option value="${e.id}">${e.province} — ${e.denomination} (${e.typeEntite || "—"})</option>`).join("")}
        </select>
      </div>`;
  }

  Object.keys(groups).forEach(g => {
    html += `<h4 style="margin:12px 0 8px;color:#1e3a8a;font-size:14px !important;border-bottom:1px solid #cbd5e1;padding-bottom:4px;grid-column:1 / -1;">${g}</h4>`;
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

  html += `<div id="formHintBox" style="grid-column:1 / -1;font-size:12px;color:#b45309;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:8px;display:none;"></div>`;
  $("#modalBody").innerHTML = html;

  const quickSel = $("#quickSelectEntite");
  if (quickSel) {
    quickSel.addEventListener("change", () => {
      const ent = (Store.data.entites || []).find(e => e.id === quickSel.value);
      if (!ent) return;
      if ($("#fld_province") && ent.province) $("#fld_province").value = ent.province;
      if ($("#fld_typeEntite") && ent.typeEntite) $("#fld_typeEntite").value = ent.typeEntite;
      if ($("#fld_denomination") && ent.denomination) $("#fld_denomination").value = ent.denomination;
      if ($("#fld_responsable") && ent.responsable) $("#fld_responsable").value = ent.responsable;
      refreshFormHint();
    });
  }

  const refreshFormHint = () => {
    const hint = $("#formHintBox");
    if (!hint) return;
    const msgs = [];

    if (type === "entites") {
      const provVal = $("#fld_province")?.value || "";
      const rawDenom = $("#fld_denomination")?.value || "";
      const dup = findDuplicateEntity(provVal, rawDenom, App.editingId);
      if (dup) {
        msgs.push(`⚠️ Doublon détecté : "${rawDenom.trim()}" est déjà enregistré dans la province ${provVal}.`);
      }
    } else if (type === "numerique") {
      const actifsVal = num($("#fld_actifs")?.value);
      const culteMembresVal = num($("#fld_culteMembres")?.value);
      if (actifsVal > 0 && culteMembresVal > actifsVal) {
        msgs.push(`⚠️ Culte Membres (${culteMembresVal}) dépasse les Membres Actifs (${actifsVal}). Vérifiez la saisie.`);
      }
    }

    if (msgs.length) {
      hint.innerHTML = msgs.join("<br>");
      hint.style.display = "block";
    } else {
      hint.style.display = "none";
    }
  };

  const updateCulteTotal = () => {
    const totalEl = $("#fld_totalCulte");
    if (!totalEl) return;
    const m = num($("#fld_culteMembres")?.value);
    const s = num($("#fld_culteSymp")?.value);
    const nv = num($("#fld_culteNV")?.value);
    totalEl.value = m + s + nv;
    refreshFormHint();
  };

  ["culteMembres", "culteSymp", "culteNV"].forEach(k => {
    const el = $("#fld_" + k);
    if (el) el.addEventListener("input", updateCulteTotal);
  });
  ["province", "denomination", "actifs"].forEach(k => {
    const el = $("#fld_" + k);
    if (el) {
      el.addEventListener("input", refreshFormHint);
      el.addEventListener("change", refreshFormHint);
    }
  });
  updateCulteTotal();
  refreshFormHint();

  $("#modal").classList.add("show");
}

function closeModal() {
  $("#modal").classList.remove("show");
  $("#btnSave").style.display = "inline-flex";
  App.viewOnlyMode = false;
  App.editingId = null;
  App.currentFormType = null;
}

function saveForm() {
  if (App.viewOnlyMode) return closeModal();
  const type = App.currentFormType, schema = SCHEMAS[type], data = {};
  let valid = true;
  let hasNegative = false;
  schema.fields.forEach(f => {
    const el = $("#fld_" + f.key); if (!el) return;
    let v = el.value.trim();
    if (f.type === "number") {
      v = v === "" ? 0 : Number(v);
      if (v < 0) hasNegative = true;
    }
    if (f.required && (v === "" || v === undefined)) { valid = false; el.style.borderColor = "red"; } else { el.style.borderColor = ""; }
    data[f.key] = v;
  });
  if (!valid) return alert("Remplissez les champs obligatoires (*).");
  if (hasNegative) return alert("Les valeurs numériques ne peuvent pas être négatives.");

  if (type === "entites") {
    const dup = findDuplicateEntity(data.province, data.denomination, App.editingId);
    if (dup) {
      alert(`⚠️ Attention : l'entité "${data.denomination}" existe déjà dans la province ${data.province}.`);
      const proceed = confirm("Voulez-vous quand même enregistrer ce nom une deuxième fois dans cette province ?");
      if (!proceed) return;
    }
  }

  if (type === "numerique" || type === "diffusion") {
    data.totalCulte = calcTotalCulte(data);
  }
  if (type !== "entites") {
    data.periodeMois = Store.data.periode.mois;
    data.periodeAnnee = Store.data.periode.annee;
  } else if (data.province) {
    App.selectedProvince = data.province;
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
