const METHODS_SOURCE = "data/earth_hues_methods.json";
const STATS_SOURCE = "data/earth_hues_stats.json";
const EPIC_SOURCE = "data/earth_hues_epic.json";
const SPACE_SOURCE = "data/earth_hues_space.json";

const ESTIMATORS = [
  { key: "srgb_mean", label: "sRGB" },
  { key: "linear_mean", label: "linear" },
  { key: "lab_mean", label: "Lab" },
  { key: "median", label: "median" },
  { key: "dominant", label: "dominant" },
];

function plate(container, width, height) {
  d3.select(container).selectAll("*").remove();
  return d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("font-family", '"Computer Modern", serif');
}

function buildEstimators(records) {
  const container = document.getElementById("viz-estimators");
  if (!container) return;

  const month = records[0];
  const names = Object.keys(month.categories);
  const rows = names
    .map((name) => ({ name, ...month.categories[name] }))
    .sort((a, b) => b.gamma_shift - a.gamma_shift);

  const margin = { top: 46, right: 108, bottom: 20, left: 158 };
  const swatch = { w: 64, h: 24, gap: 5 };
  const rowStep = 29;
  const width = Math.max(container.getBoundingClientRect().width, 560);
  const height = rows.length * rowStep + margin.top + margin.bottom;
  const barWidth = width - margin.left - margin.right - ESTIMATORS.length * (swatch.w + swatch.gap);

  const svg = plate(container, width, height);
  const shift = d3
    .scaleLinear()
    .domain([0, d3.max(rows, (r) => r.gamma_shift)])
    .range([0, Math.max(barWidth - 46, 40)]);

  ESTIMATORS.forEach((estimator, column) => {
    svg
      .append("text")
      .attr("x", margin.left + column * (swatch.w + swatch.gap) + swatch.w / 2)
      .attr("y", margin.top - 24)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("font-style", estimator.key === "linear_mean" ? "normal" : "italic")
      .attr("font-weight", estimator.key === "linear_mean" ? "bold" : "normal")
      .text(estimator.label);
  });

  const barX = margin.left + ESTIMATORS.length * (swatch.w + swatch.gap) + 16;
  svg
    .append("text")
    .attr("x", barX)
    .attr("y", margin.top - 24)
    .attr("font-size", 12)
    .attr("font-style", "italic")
    .text("ΔE₀₀ sRGB→linear");

  const row = svg
    .selectAll("g.plate-row")
    .data(rows)
    .join("g")
    .attr("class", "plate-row")
    .attr("transform", (d, i) => `translate(0,${margin.top + i * rowStep})`);

  row
    .append("text")
    .attr("x", margin.left - 10)
    .attr("y", swatch.h / 2)
    .attr("dy", "0.32em")
    .attr("text-anchor", "end")
    .attr("font-size", 12)
    .text((d) => d.name);

  ESTIMATORS.forEach((estimator, column) => {
    row
      .append("rect")
      .attr("x", margin.left + column * (swatch.w + swatch.gap))
      .attr("width", swatch.w)
      .attr("height", swatch.h)
      .attr("fill", (d) => d[estimator.key])
      .attr("stroke", "#999")
      .attr("stroke-width", 0.8);
  });

  row
    .append("rect")
    .attr("x", barX)
    .attr("y", swatch.h / 2 - 4)
    .attr("width", (d) => shift(d.gamma_shift))
    .attr("height", 8)
    .attr("fill", "#000")
    .attr("opacity", 0.75);

  row
    .append("text")
    .attr("x", (d) => barX + shift(d.gamma_shift) + 6)
    .attr("y", swatch.h / 2)
    .attr("dy", "0.32em")
    .attr("font-size", 11.5)
    .text((d) => d.gamma_shift.toFixed(1));
}

function buildDistributions(stats) {
  const container = document.getElementById("viz-distribution");
  if (!container) return;

  const month = stats[0];
  const rows = Object.entries(month.categories)
    .filter(([, entry]) => entry.pixels)
    .map(([name, entry]) => ({ name, ...entry }))
    .sort((a, b) => a.dispersion - b.dispersion);

  const margin = { top: 44, right: 112, bottom: 42, left: 158 };
  const rowStep = 26;
  const width = Math.max(container.getBoundingClientRect().width, 560);
  const height = rows.length * rowStep + margin.top + margin.bottom;
  const inner = width - margin.left - margin.right;

  const svg = plate(container, width, height);
  const x = d3.scaleLinear().domain([0, 100]).range([0, inner]);

  const axis = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top + rows.length * rowStep})`)
    .call(d3.axisBottom(x).ticks(6).tickSize(4));
  axis.selectAll("text").attr("font-size", 11.5);
  axis.select(".domain").attr("stroke-width", 1);

  svg
    .append("text")
    .attr("x", margin.left + inner / 2)
    .attr("y", margin.top + rows.length * rowStep + 36)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("font-style", "italic")
    .text("lightness L*, 5th to 95th percentile");

  svg
    .append("text")
    .attr("x", margin.left + inner + 16)
    .attr("y", margin.top - 22)
    .attr("font-size", 12)
    .attr("font-style", "italic")
    .text("spread   area");

  const row = svg
    .selectAll("g.dist-row")
    .data(rows)
    .join("g")
    .attr("class", "dist-row")
    .attr("transform", (d, i) => `translate(${margin.left},${margin.top + i * rowStep})`);

  row
    .append("line")
    .attr("x1", (d) => x(d.lightness.p05))
    .attr("x2", (d) => x(d.lightness.p95))
    .attr("y1", rowStep / 2 - 3)
    .attr("y2", rowStep / 2 - 3)
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  row
    .append("rect")
    .attr("x", (d) => x(d.lightness.p25))
    .attr("width", (d) => Math.max(x(d.lightness.p75) - x(d.lightness.p25), 1.5))
    .attr("y", rowStep / 2 - 11)
    .attr("height", 16)
    .attr("fill", (d) => d.mean)
    .attr("stroke", "#000")
    .attr("stroke-width", 0.9);

  row
    .append("line")
    .attr("x1", (d) => x(d.lightness.p50))
    .attr("x2", (d) => x(d.lightness.p50))
    .attr("y1", rowStep / 2 - 11)
    .attr("y2", rowStep / 2 + 5)
    .attr("stroke", (d) => (d.lightness.p50 > 55 ? "#000" : "#fff"))
    .attr("stroke-width", 1.1);

  row
    .append("text")
    .attr("x", -10)
    .attr("y", rowStep / 2 - 3)
    .attr("dy", "0.32em")
    .attr("text-anchor", "end")
    .attr("font-size", 12)
    .text((d) => d.name);

  row
    .append("text")
    .attr("x", inner + 16)
    .attr("y", rowStep / 2 - 3)
    .attr("dy", "0.32em")
    .attr("font-size", 11.5)
    .text((d) => d.dispersion.toFixed(1));

  row
    .append("text")
    .attr("x", inner + 62)
    .attr("y", rowStep / 2 - 3)
    .attr("dy", "0.32em")
    .attr("font-size", 11.5)
    .text((d) => `${(d.area_fraction * 100).toFixed(2)}%`);
}

function chromaticity(reflectance) {
  const total = reflectance.reduce((a, b) => a + b, 0);
  return reflectance.map((v) => v / total);
}

function buildValidation(space, epic) {
  const container = document.getElementById("viz-validation");
  if (!container) return;

  const views = space.records[0].views;
  const fromHex = (hex) => {
    const { r, g, b } = colorMath.hexToRgb(hex);
    return chromaticity([r, g, b].map((v) => colorMath.toLinear(v / 255)));
  };

  const bars = [
    { label: "model, surface", value: fromHex(views.surface["Total Earth Mean"].hex), swatch: views.surface["Total Earth Mean"].hex },
    { label: "model, + atmosphere", value: fromHex(views.atmosphere["Total Earth Mean"].hex), swatch: views.atmosphere["Total Earth Mean"].hex },
    { label: "model, + clouds", value: fromHex(views.space["Total Earth Mean"].hex), swatch: views.space["Total Earth Mean"].hex },
    { label: "DSCOVR EPIC, observed", value: chromaticity(epic.mean.reflectance), swatch: epic.mean.hex },
  ].map((d) => ({ ...d, ratio: d.value[2] / d.value[0] }));

  const margin = { top: 40, right: 76, bottom: 44, left: 168 };
  const rowStep = 34;
  const width = Math.max(container.getBoundingClientRect().width, 560);
  const height = bars.length * rowStep + margin.top + margin.bottom;
  const inner = width - margin.left - margin.right;

  const svg = plate(container, width, height);
  const x = d3
    .scaleLinear()
    .domain([0.8, d3.max(bars, (d) => d.ratio) * 1.06])
    .range([0, inner]);

  svg
    .append("line")
    .attr("x1", margin.left + x(1))
    .attr("x2", margin.left + x(1))
    .attr("y1", margin.top - 10)
    .attr("y2", margin.top + bars.length * rowStep)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,2");

  svg
    .append("text")
    .attr("x", margin.left + x(1))
    .attr("y", margin.top - 16)
    .attr("text-anchor", "middle")
    .attr("font-size", 11.5)
    .attr("font-style", "italic")
    .text("neutral");

  const axis = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top + bars.length * rowStep})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(4));
  axis.selectAll("text").attr("font-size", 11.5);
  axis.select(".domain").attr("stroke-width", 1);

  svg
    .append("text")
    .attr("x", margin.left + inner / 2)
    .attr("y", margin.top + bars.length * rowStep + 38)
    .attr("text-anchor", "middle")
    .attr("font-size", 12)
    .attr("font-style", "italic")
    .text("blue / red chromaticity ratio");

  const row = svg
    .selectAll("g.val-row")
    .data(bars)
    .join("g")
    .attr("class", "val-row")
    .attr("transform", (d, i) => `translate(${margin.left},${margin.top + i * rowStep})`);

  row
    .append("rect")
    .attr("x", 0)
    .attr("width", (d) => Math.max(x(d.ratio), 1))
    .attr("y", 4)
    .attr("height", 15)
    .attr("fill", (d) => d.swatch)
    .attr("stroke", "#000")
    .attr("stroke-width", 0.9);

  row
    .append("text")
    .attr("x", -10)
    .attr("y", 11)
    .attr("dy", "0.32em")
    .attr("text-anchor", "end")
    .attr("font-size", 12)
    .attr("font-weight", (d) => (d.label.startsWith("DSCOVR") ? "bold" : "normal"))
    .text((d) => d.label);

  row
    .append("text")
    .attr("x", (d) => x(d.ratio) + 8)
    .attr("y", 11)
    .attr("dy", "0.32em")
    .attr("font-size", 11.5)
    .text((d) => d.ratio.toFixed(3));
}

function buildPlates() {
  const wanted = ["viz-estimators", "viz-distribution", "viz-validation"];
  if (!wanted.some((id) => document.getElementById(id))) return;

  Promise.all(
    [METHODS_SOURCE, STATS_SOURCE, SPACE_SOURCE, EPIC_SOURCE].map((source) =>
      fetch(source).then((response) => response.json()),
    ),
  )
    .then(([methods, stats, space, epic]) => {
      buildEstimators(methods);
      buildDistributions(stats);
      buildValidation(space, epic);
    })
    .catch(() => {
      wanted.forEach((id) => {
        const node = document.getElementById(id);
        if (node) node.textContent = "Serve the page over HTTP to load this figure.";
      });
    });
}
