(function () {
  const ORIENTATION_STYLE_ID = "emmDynamicPrintPageStyle";
  const PRINT_PORTAL_ID = "emmPrintAllSectionsPortal";
  const DEFAULT_PRINT_STATE = {
    font: "Segoe UI",
    size: "14",
    orientation: "portrait",
    scope: "active"
  };

  function getCurrentPrintSettings() {
    const fontSel = document.getElementById("fontSelect");
    const sizeSel = document.getElementById("fontSize");
    const oriSel = document.getElementById("printOrientation");
    const scopeInp = document.getElementById("pdfOptScope");

    return {
      font: (fontSel && fontSel.value) || DEFAULT_PRINT_STATE.font,
      size: (sizeSel && sizeSel.value) || DEFAULT_PRINT_STATE.size,
      orientation: (oriSel && oriSel.value) || DEFAULT_PRINT_STATE.orientation,
      scope: (scopeInp && scopeInp.value) || DEFAULT_PRINT_STATE.scope
    };
  }

  function applyPageOrientationRule(orientation) {
    const safeOri = orientation === "landscape" ? "landscape" : "portrait";
    let styleEl = document.getElementById(ORIENTATION_STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = ORIENTATION_STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      @media print {
        @page { size: A4 ${safeOri}; margin: 10mm; }
        body.emm-print-full-mode .main-wrapper,
        body.emm-print-full-mode #modal,
        body.emm-print-full-mode #pwaUpdateBanner {
          display: none !important;
        }
        body.emm-print-full-mode #${PRINT_PORTAL_ID} {
          display: block !important;
        }
      }
      #${PRINT_PORTAL_ID} {
        display: none;
      }
      .emm-print-section-block {
        page-break-after: always;
        break-after: page;
        margin-bottom: 18px;
      }
      .emm-print-section-block:last-child {
        page-break-after: auto;
        break-after: auto;
      }
    `;
  }

  function applyFontAndSizeEverywhere(rootEl, font, size) {
    const familyRule = `'${font}', sans-serif`;
    const sizeNum = Number(size) || 14;
    const sizePx = `${sizeNum}px`;

    if (rootEl) {
      rootEl.style.fontFamily = familyRule;
      rootEl.style.fontSize = sizePx;

      const targets = rootEl.querySelectorAll(
        "section, article, div, p, span, strong, b, em, li, td, th, tr, table, h1, h2, h3, h4, h5, label"
      );
      targets.forEach((node) => {
        if (node.closest(".emm-no-scale")) return;
        node.style.fontFamily = familyRule;
        if (node.tagName === "H1") {
          node.style.fontSize = `${sizeNum + 8}px`;
        } else if (node.tagName === "H2") {
          node.style.fontSize = `${sizeNum + 6}px`;
        } else if (node.tagName === "H3") {
          node.style.fontSize = `${sizeNum + 4}px`;
        } else if (node.tagName === "H4") {
          node.style.fontSize = `${sizeNum + 2}px`;
        } else if (node.tagName === "SMALL") {
          node.style.fontSize = `${Math.max(10, sizeNum - 2)}px`;
        } else {
          node.style.fontSize = sizePx;
        }
      });
    }
  }

  function syncSettingsToApp(font, size, orientation) {
    const fontSel = document.getElementById("fontSelect");
    const sizeSel = document.getElementById("fontSize");
    const oriSel = document.getElementById("printOrientation");

    if (fontSel && font) fontSel.value = font;
    if (sizeSel && size) sizeSel.value = size;
    if (oriSel && orientation) oriSel.value = orientation;

    applyPageOrientationRule(orientation);

    if (typeof applyTypographySettings === "function") {
      applyTypographySettings();
    } else {
      document.body.style.fontFamily = `'${font}', sans-serif`;
      document.body.style.fontSize = `${size}px`;
    }
  }

  function cleanSectionForPrint(sectionEl, sectionTitle, font, size) {
    const block = document.createElement("div");
    block.className = "emm-print-section-block";

    const secHeading = document.createElement("div");
    secHeading.style.background = "#eff6ff";
    secHeading.style.borderLeft = "4px solid #1e3a8a";
    secHeading.style.padding = "6px 10px";
    secHeading.style.marginBottom = "10px";
    secHeading.style.fontWeight = "700";
    secHeading.style.color = "#1e3a8a";
    secHeading.textContent = sectionTitle;
    block.appendChild(secHeading);

    const clone = sectionEl.cloneNode(true);
    clone.classList.add("active");
    clone.style.display = "block";

    clone.querySelectorAll("button, input[type='file']").forEach((el) => el.remove());
    clone.querySelectorAll("select").forEach((sel) => {
      const span = document.createElement("strong");
      span.textContent = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : sel.value;
      sel.replaceWith(span);
    });
    clone.querySelectorAll("input, textarea").forEach((inp) => {
      const span = document.createElement("span");
      span.textContent = inp.value || "—";
      inp.replaceWith(span);
    });

    block.appendChild(clone);
    applyFontAndSizeEverywhere(block, font, size);
    return block;
  }

  function buildPrintableSheet(font, size, orientation, scope) {
    const p = (window.Store && Store.data && Store.data.periode) || {};
    const datePart = p.dateReference ? ` • ${p.dateReference}` : "";
    const periodeText = `${p.mois || ""} ${p.annee || ""}${datePart}`.trim();
    const oriLabel = orientation === "landscape" ? "Paysage" : "Portrait";
    const isFull = scope === "all";
    const scopeLabel = isFull ? "Rapport complet (toutes les sections)" : "Page active uniquement";

    const wrapper = document.createElement("div");
    wrapper.className = "emm-print-sheet";
    wrapper.style.color = "#0f172a";
    wrapper.style.background = "#ffffff";
    wrapper.style.padding = "14px";
    wrapper.style.boxSizing = "border-box";

    const header = document.createElement("div");
    header.className = "emm-no-scale";
    header.style.display = "flex";
    header.style.flexWrap = "wrap";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.borderBottom = "2px solid #1e3a8a";
    header.style.paddingBottom = "8px";
    header.style.marginBottom = "14px";
    header.style.gap = "10px";
    header.innerHTML = `
      <div>
        <div style="font-weight:800;color:#1e3a8a;font-size:18px;">EMM RD CONGO — Gestion Nationale</div>
        <div style="font-size:12.5px;color:#475569;">Période : <strong>${periodeText || "—"}</strong> • ${scopeLabel}</div>
      </div>
      <div style="text-align:right;font-size:12px;color:#475569;">
        <div>Orientation : <strong>${oriLabel}</strong></div>
        <div>Police : <strong>${font}</strong> • Taille : <strong>${size} px</strong></div>
      </div>`;
    wrapper.appendChild(header);

    if (isFull) {
      const sectionsSpec = [
        { id: "page-dashboard", title: "1. Tableau de Bord" },
        { id: "page-entites", title: "2. Répertoire des Entités" },
        { id: "page-numerique", title: "3. Rapports Numériques" },
        { id: "page-diffusion", title: "4. Rapports Diffusion" },
        { id: "page-diffusion-suite", title: "5. Rapports Diffusion — Suite" },
        { id: "page-synthese", title: "6. Synthèse Nationale" },
        { id: "page-rapport-global", title: "7. Rapport Global" },
        { id: "page-rapport-detaille", title: "8. Rapport Détaillé" },
        { id: "page-graphiques", title: "9. Graphiques" },
        { id: "page-archives", title: "10. Archives" }
      ];

      sectionsSpec.forEach((spec) => {
        const secEl = document.getElementById(spec.id);
        if (secEl) {
          wrapper.appendChild(cleanSectionForPrint(secEl, spec.title, font, size));
        }
      });
    } else {
      const activePage = document.querySelector(".page.active") || document.getElementById("page-dashboard");
      const activeTitle = activePage ? activePage.id.replace("page-", "").toUpperCase() : "PAGE ACTIVE";
      if (activePage) {
        wrapper.appendChild(cleanSectionForPrint(activePage, `Section : ${activeTitle}`, font, size));
      }
    }

    return wrapper;
  }

  function updatePreviewCanvas() {
    const previewBox = document.getElementById("pdfPreviewPaper");
    const fontInp = document.getElementById("pdfOptFont");
    const sizeInp = document.getElementById("pdfOptSize");
    const oriInp = document.getElementById("pdfOptOrientation");
    const scopeInp = document.getElementById("pdfOptScope");

    if (!previewBox || !fontInp || !sizeInp || !oriInp) return;

    const font = fontInp.value;
    const size = sizeInp.value;
    const orientation = oriInp.value;
    const scope = (scopeInp && scopeInp.value) || "active";

    syncSettingsToApp(font, size, orientation);

    previewBox.innerHTML = "";
    previewBox.style.margin = "0 auto";
    previewBox.style.background = "#ffffff";
    previewBox.style.boxShadow = "0 10px 28px rgba(15, 23, 42, 0.18)";
    previewBox.style.border = "1px solid #cbd5e1";
    previewBox.style.borderRadius = "6px";
    previewBox.style.overflowX = "auto";
    previewBox.style.transition = "all 0.2s ease";

    if (orientation === "landscape") {
      previewBox.style.width = "100%";
      previewBox.style.maxWidth = "920px";
      previewBox.style.minHeight = "440px";
    } else {
      previewBox.style.width = "100%";
      previewBox.style.maxWidth = "640px";
      previewBox.style.minHeight = "560px";
    }

    previewBox.appendChild(buildPrintableSheet(font, size, orientation, scope));
  }

  function prepareFullReportPortal(font, size, orientation, scope) {
    let portal = document.getElementById(PRINT_PORTAL_ID);
    if (!portal) {
      portal = document.createElement("div");
      portal.id = PRINT_PORTAL_ID;
      document.body.appendChild(portal);
    }
    portal.innerHTML = "";

    if (scope === "all") {
      portal.appendChild(buildPrintableSheet(font, size, orientation, "all"));
      document.body.classList.add("emm-print-full-mode");
    } else {
      document.body.classList.remove("emm-print-full-mode");
    }
  }

  function cleanupFullReportPortal() {
    document.body.classList.remove("emm-print-full-mode");
    const portal = document.getElementById(PRINT_PORTAL_ID);
    if (portal) portal.innerHTML = "";
  }

  function resetModalBoxLayout() {
    const modalCard = document.getElementById("modalCardBox");
    const modalFooter = document.getElementById("modalFooterBox");
    const btnSave = document.getElementById("btnSave");
    const btnCancel = document.getElementById("btnCancel");

    if (modalCard) {
      modalCard.style.maxWidth = "";
      modalCard.style.width = "";
    }
    if (modalFooter) {
      modalFooter.style.display = "flex";
    }
    if (btnSave) {
      btnSave.style.display = "inline-flex";
      btnSave.textContent = "💾 Enregistrer";
      btnSave.onclick = null;
    }
    if (btnCancel) {
      btnCancel.textContent = "Annuler";
      btnCancel.onclick = null;
    }
  }

  function openPrintPreviewModal() {
    if (typeof window.closeMenu === "function") {
      window.closeMenu();
    }

    if (typeof window.renderAll === "function") {
      window.renderAll();
    }

    const current = getCurrentPrintSettings();
    applyPageOrientationRule(current.orientation);

    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modalCard = document.getElementById("modalCardBox");
    const btnSave = document.getElementById("btnSave");
    const btnCancel = document.getElementById("btnCancel");

    if (!modal || !modalTitle || !modalBody) {
      window.print();
      return;
    }

    if (modalCard) {
      modalCard.style.maxWidth = "980px";
      modalCard.style.width = "96%";
    }

    modalTitle.textContent = "🖨️ Aperçu Avant Impression / Export PDF";

    const fontOptionsHtml = [
      "Segoe UI", "Arial", "Calibri", "Verdana", "Tahoma",
      "Trebuchet MS", "Roboto", "Times New Roman", "Georgia", "Courier New"
    ].map((f) => `<option value="${f}" ${current.font === f ? "selected" : ""}>${f}</option>`).join("");

    const sizeOptionsHtml = [11, 12, 13, 14, 15, 16, 18, 20, 22, 24]
      .map((s) => `<option value="${s}" ${String(current.size) === String(s) ? "selected" : ""}>${s} px</option>`).join("");

    modalBody.innerHTML = `
      <div style="grid-column:1 / -1;display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;background:#f1f5f9;padding:12px;border-radius:8px;border:1px solid #cbd5e1;margin-bottom:12px;">
        <div class="form-group" style="margin:0;min-width:155px;flex:1;">
          <label for="pdfOptFont">Police d'écriture</label>
          <select id="pdfOptFont">${fontOptionsHtml}</select>
        </div>
        <div class="form-group" style="margin:0;min-width:115px;flex:1;">
          <label for="pdfOptSize">Taille du texte</label>
          <select id="pdfOptSize">${sizeOptionsHtml}</select>
        </div>
        <div class="form-group" style="margin:0;min-width:145px;flex:1;">
          <label for="pdfOptOrientation">Orientation</label>
          <select id="pdfOptOrientation">
            <option value="portrait" ${current.orientation === "portrait" ? "selected" : ""}>📄 Portrait</option>
            <option value="landscape" ${current.orientation === "landscape" ? "selected" : ""}>🖼️ Paysage</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;min-width:195px;flex:1.2;">
          <label for="pdfOptScope">Contenu à imprimer</label>
          <select id="pdfOptScope">
            <option value="active" ${current.scope === "active" ? "selected" : ""}>📌 Page active uniquement</option>
            <option value="all" ${current.scope === "all" ? "selected" : ""}>📚 Rapport complet (toutes les sections)</option>
          </select>
        </div>
      </div>
      <div style="grid-column:1 / -1;background:#e2e8f0;padding:14px;border-radius:8px;max-height:62vh;overflow:auto;">
        <div id="pdfPreviewPaper"></div>
      </div>`;

    if (btnSave) {
      btnSave.style.display = "inline-flex";
      btnSave.textContent = "🖨️ Imprimer / Enregistrer PDF";
      btnSave.onclick = function (ev) {
        ev.preventDefault();
        const fVal = document.getElementById("pdfOptFont")?.value || current.font;
        const sVal = document.getElementById("pdfOptSize")?.value || current.size;
        const oVal = document.getElementById("pdfOptOrientation")?.value || current.orientation;
        const scVal = document.getElementById("pdfOptScope")?.value || "active";

        syncSettingsToApp(fVal, sVal, oVal);
        prepareFullReportPortal(fVal, sVal, oVal, scVal);
        closePrintPreviewModal();

        setTimeout(() => {
          window.print();
          setTimeout(cleanupFullReportPortal, 500);
        }, 120);
      };
    }

    if (btnCancel) {
      btnCancel.textContent = "Fermer l'aperçu";
      btnCancel.onclick = function (ev) {
        ev.preventDefault();
        cleanupFullReportPortal();
        closePrintPreviewModal();
      };
    }

    document.getElementById("pdfOptFont")?.addEventListener("change", updatePreviewCanvas);
    document.getElementById("pdfOptSize")?.addEventListener("change", updatePreviewCanvas);
    document.getElementById("pdfOptOrientation")?.addEventListener("change", updatePreviewCanvas);
    document.getElementById("pdfOptScope")?.addEventListener("change", updatePreviewCanvas);

    updatePreviewCanvas();
    modal.classList.add("show");
  }

  function closePrintPreviewModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.classList.remove("show");
    resetModalBoxLayout();
    if (typeof window.App === "object" && window.App) {
      window.App.viewOnlyMode = false;
      window.App.editingId = null;
      window.App.currentFormType = null;
    }
  }

  window.addEventListener("afterprint", cleanupFullReportPortal);

  document.addEventListener("DOMContentLoaded", () => {
    const initial = getCurrentPrintSettings();
    applyPageOrientationRule(initial.orientation);

    const oriSel = document.getElementById("printOrientation");
    if (oriSel) {
      oriSel.addEventListener("change", () => {
        applyPageOrientationRule(oriSel.value);
      });
    }

    const btnPdf = document.getElementById("btnPDF");
    if (btnPdf) {
      btnPdf.addEventListener("click", (e) => {
        e.preventDefault();
        openPrintPreviewModal();
      });
    }
  });
})();
