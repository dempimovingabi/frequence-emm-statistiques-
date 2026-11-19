(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const btnPDF = document.getElementById("btnPDF");
    if (btnPDF) {
      btnPDF.addEventListener("click", () => {
        if (typeof updatePeriodeLabel === "function") {
          updatePeriodeLabel();
        }
        window.print();
      });
    }
  });
})();
