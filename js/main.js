const PALETTE_SOURCE = "data/earth_hues.json";

const CHARTS = {
  "viz-heatmap": buildHeatmap,
  "viz-signature": buildSignature,
  "viz-drift": buildDriftLines,
  "viz-wheels": buildColorWheels,
  "viz-rgb": buildRgbChannels,
  "viz-anomaly": buildAnomalyHeatmap,
};

function paletteStylesheet(records) {
  const lines = [":root {"];
  records.forEach((record) => {
    Object.entries(record).forEach(([category, hex]) => {
      if (category === "month") return;
      const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      lines.push(`  --earth-${slug}-${record.month}: ${hex};`);
    });
  });
  lines.push("}");
  return lines.join("\n") + "\n";
}

function attachPaletteDownload(records) {
  const link = document.getElementById("palette-css");
  if (!link) return;
  const blob = new Blob([paletteStylesheet(records)], { type: "text/css" });
  link.href = URL.createObjectURL(blob);
  link.download = "earth-hues.css";
}

function reportDataFailure(message) {
  document.querySelectorAll(".viz-container:empty").forEach((node) => {
    node.textContent = message;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTocHighlight();

  fetch(PALETTE_SOURCE)
    .then((response) => response.json())
    .then((records) => {
      setEarthHues(records);
      attachPaletteDownload(records);
      buildPalette(records);
      Object.entries(CHARTS).forEach(([id, build]) => registerViz(id, build));
      buildMap();
      buildTrends();
      buildPlates();
    })
    .catch((error) => {
      reportDataFailure(
        `${error.message}. Serve the page over HTTP, not from a file path.`,
      );
    });
});
