export const exportTrustScanPdf = async (element, fileName) => {
  if (!element) {
    throw new Error("Report content is unavailable");
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);

  const canvas = await html2canvas(element, {
    backgroundColor: "#f8fafc",
    scale: 2,
    useCORS: true
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(fileName);
};
