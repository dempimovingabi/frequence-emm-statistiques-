document.addEventListener("DOMContentLoaded", () => {
  const btnPDF = document.getElementById("btnPDF");
  if (btnPDF) {
    btnPDF.addEventListener("click", () => {
      window.print();
    });
  }
});
