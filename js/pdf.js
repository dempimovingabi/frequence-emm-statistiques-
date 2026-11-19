document.addEventListener("DOMContentLoaded", () => {
  const btnPDF = document.getElementById("btnPDF");
  if (!btnPDF) return;

  btnPDF.addEventListener("click", () => {
    const font = document.getElementById("fontSelect").value;
    const size = document.getElementById("fontSize").value;

    const style = document.createElement("style");
    style.id = "dynamicPrintStyle";
    style.textContent = `
      @media print {
        body { font-family: '${font}', sans-serif !important; font-size: ${size}pt !important; }
        .data-table { font-size: ${Math.max(7, Number(size) - 2)}pt !important; }
        .page h2 { font-size: ${Number(size) + 4}pt !important; }
        .synth-section h3, .report-block h3 { font-size: ${Number(size) + 2}pt !important; }
        .kpi-value { font-size: ${Number(size) + 6}pt !important; }
      }
    `;
    const old = document.getElementById("dynamicPrintStyle");
    if (old) old.remove();
    document.head.appendChild(style);

    setTimeout(() => { window.print(); }, 150);
  });
});

