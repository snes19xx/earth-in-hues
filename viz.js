/* 
   Earth in Hues — viz.js
   D3 v7
 */

const earth_hues = [
  {
    month: "jan",
    Oceans: "#030614",
    "Fresh Water": "#818680",
    "Snow and Ice": "#eaedef",
    Deserts: "#aa916e",
    Forests: "#39432e",
    Grasslands: "#71705c",
    Shrublands: "#9e8d7b",
    Croplands: "#6a634b",
    Wetlands: "#969f98",
    "Urban Areas": "#4c492f",
    Mountains: "#827c69",
    "Total Land Mean": "#817c68",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#28292d",
  },
  {
    month: "feb",
    Oceans: "#030614",
    "Fresh Water": "#848983",
    "Snow and Ice": "#eaedef",
    Deserts: "#aa926e",
    Forests: "#3b4430",
    Grasslands: "#74735f",
    Shrublands: "#9e8d7b",
    Croplands: "#736c56",
    Wetlands: "#949c97",
    "Urban Areas": "#545037",
    Mountains: "#86806f",
    "Total Land Mean": "#837f6b",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#28292e",
  },
  {
    month: "mar",
    Oceans: "#030614",
    "Fresh Water": "#858a84",
    "Snow and Ice": "#eaedef",
    Deserts: "#ab9370",
    Forests: "#3c4430",
    Grasslands: "#76745f",
    Shrublands: "#9f8e7b",
    Croplands: "#777059",
    Wetlands: "#9ca199",
    "Urban Areas": "#575339",
    Mountains: "#87806d",
    "Total Land Mean": "#85806b",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#292a2e",
  },
  {
    month: "apr",
    Oceans: "#030614",
    "Fresh Water": "#858982",
    "Snow and Ice": "#eaedef",
    Deserts: "#ac9471",
    Forests: "#3a422c",
    Grasslands: "#726f58",
    Shrublands: "#a08e7a",
    Croplands: "#6c644a",
    Wetlands: "#9ea299",
    "Urban Areas": "#514e32",
    Mountains: "#827b66",
    "Total Land Mean": "#827d67",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#28292c",
  },
  {
    month: "may",
    Oceans: "#030614",
    "Fresh Water": "#81857d",
    "Snow and Ice": "#eaedef",
    Deserts: "#ad9471",
    Forests: "#323b23",
    Grasslands: "#68664d",
    Shrublands: "#9f8d79",
    Croplands: "#5c5436",
    Wetlands: "#9ca096",
    "Urban Areas": "#4c4c2d",
    Mountains: "#7d7660",
    "Total Land Mean": "#7c765f",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#26272a",
  },
  {
    month: "jun",
    Oceans: "#030614",
    "Fresh Water": "#7b8078",
    "Snow and Ice": "#eaedef",
    Deserts: "#ad9472",
    Forests: "#263016",
    Grasslands: "#5e5b42",
    Shrublands: "#9a8873",
    Croplands: "#565131",
    Wetlands: "#83877a",
    "Urban Areas": "#494b2b",
    Mountains: "#78715a",
    "Total Land Mean": "#746f57",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#242528",
  },
  {
    month: "jul",
    Oceans: "#030614",
    "Fresh Water": "#71766d",
    "Snow and Ice": "#eaecee",
    Deserts: "#ac9471",
    Forests: "#1d2a0e",
    Grasslands: "#4c4b2e",
    Shrublands: "#746148",
    Croplands: "#4f4f2d",
    Wetlands: "#393d28",
    "Urban Areas": "#464a29",
    Mountains: "#706a51",
    "Total Land Mean": "#676349",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#202124",
  },
  {
    month: "aug",
    Oceans: "#030614",
    "Fresh Water": "#6a7065",
    "Snow and Ice": "#e9ecee",
    Deserts: "#ab9270",
    Forests: "#1b290d",
    Grasslands: "#454527",
    Shrublands: "#5d4c2e",
    Croplands: "#484b27",
    Wetlands: "#272e15",
    "Urban Areas": "#444827",
    Mountains: "#6a654b",
    "Total Land Mean": "#605e42",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#1e2022",
  },
  {
    month: "sept",
    Oceans: "#030614",
    "Fresh Water": "#696f64",
    "Snow and Ice": "#e9ebed",
    Deserts: "#aa916e",
    Forests: "#1c290d",
    Grasslands: "#454426",
    Shrublands: "#5f4c2f",
    Croplands: "#464825",
    Wetlands: "#262b13",
    "Urban Areas": "#434626",
    Mountains: "#69634a",
    "Total Land Mean": "#605d41",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#1e1f21",
  },
  {
    month: "oct",
    Oceans: "#030614",
    "Fresh Water": "#6d7268",
    "Snow and Ice": "#e9ecee",
    Deserts: "#aa916e",
    Forests: "#1e290f",
    Grasslands: "#4d4a2e",
    Shrublands: "#786447",
    Croplands: "#484726",
    Wetlands: "#323522",
    "Urban Areas": "#434425",
    Mountains: "#6e674f",
    "Total Land Mean": "#666148",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#202123",
  },
  {
    month: "nov",
    Oceans: "#030614",
    "Fresh Water": "#757a72",
    "Snow and Ice": "#e9ecee",
    Deserts: "#ab916e",
    Forests: "#232d14",
    Grasslands: "#5a563d",
    Shrublands: "#978572",
    Croplands: "#4d4829",
    Wetlands: "#666c60",
    "Urban Areas": "#444326",
    Mountains: "#756d57",
    "Total Land Mean": "#706b54",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#232327",
  },
  {
    month: "dec",
    Oceans: "#030614",
    "Fresh Water": "#7c817a",
    "Snow and Ice": "#eaecef",
    Deserts: "#aa916e",
    Forests: "#2f3822",
    Grasslands: "#66634d",
    Shrublands: "#9e8d7a",
    Croplands: "#585135",
    Wetlands: "#8a928b",
    "Urban Areas": "#474529",
    Mountains: "#7b735f",
    "Total Land Mean": "#79745e",
    "Total Ocean Mean": "#030614",
    "Total Earth Mean": "#25262a",
  },
];

const categories = [
  "Oceans",
  "Fresh Water",
  "Snow and Ice",
  "Deserts",
  "Mountains",
  "Forests",
  "Grasslands",
  "Shrublands",
  "Croplands",
  "Wetlands",
  "Urban Areas",
  "Total Land Mean",
  "Total Ocean Mean",
  "Total Earth Mean",
];
const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sept",
  "oct",
  "nov",
  "dec",
];
const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/* helpers */
const helpers = {
  hexToRgb(h) {
    return {
      r: parseInt(h.slice(1, 3), 16),
      g: parseInt(h.slice(3, 5), 16),
      b: parseInt(h.slice(5, 7), 16),
    };
  },
  lum(h) {
    const { r, g, b } = this.hexToRgb(h);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  },
  contrastText(h) {
    return this.lum(h) > 0.38 ? "#00000066" : "#ffffff55";
  },
  hexToHsl(h) {
    let { r, g, b } = this.hexToRgb(h);
    r /= 255;
    g /= 255;
    b /= 255;
    const mx = Math.max(r, g, b),
      mn = Math.min(r, g, b);
    let hh = 0,
      s = 0,
      l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) hh = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (mx === g) hh = ((b - r) / d + 2) / 6;
      else hh = ((r - g) / d + 4) / 6;
    }
    return { h: hh * 360, s: s * 100, l: l * 100 };
  },
  boost(h, minL = 26) {
    const { h: hh, s, l } = this.hexToHsl(h);
    return l < minL ? `hsl(${hh},${Math.max(s, 18)}%,${minL}%)` : h;
  },
};

/* ── Scroll-triggered animation registry ── */
const pendingAnimations = new Map();

const vizObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add("visible");
        if (pendingAnimations.has(el.id)) {
          pendingAnimations.get(el.id)();
          pendingAnimations.delete(el.id);
        }
        vizObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.06 },
);

function registerViz(id, buildFn) {
  const el = document.getElementById(id);
  if (!el) return;
  pendingAnimations.set(id, buildFn);
  vizObserver.observe(el);
}

/* 
   CHART 1 — True Mean Earth Color
 */
function buildHeatmap() {
  const container = document.getElementById("viz-heatmap");
  const cW = 80,
    cH = 60,
    gap = 2;
  const m = { top: 90, right: 28, bottom: 20, left: 152 };
  const iW = months.length * cW;
  const iH = categories.length * cH;
  const W = iW + m.left + m.right;
  const H = iH + m.top + m.bottom;

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("background", "#f8f7f2")
    .style("font-family", "Georgia, serif");

  svg
    .append("line")
    .attr("x1", m.left)
    .attr("x2", m.left + iW)
    .attr("y1", 70)
    .attr("y2", 70)
    .attr("stroke", "#c8c4b8")
    .attr("stroke-width", 0.6);
  svg
    .append("text")
    .attr("x", m.left)
    .attr("y", 36)
    .attr("font-size", "22px")
    .attr("font-weight", "bold")
    .attr("letter-spacing", "4px")
    .attr("fill", "#111")
    .text("TRUE MEAN EARTH COLOR");
  svg
    .append("text")
    .attr("x", m.left)
    .attr("y", 52)
    .attr("font-size", "10px")
    .attr("fill", "#aaa")
    .attr("font-style", "italic")
    .text("Area-weighted Terra/MODIS global composites · hover for hex values");

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  months.forEach((mo, mi) => {
    const cx = mi * cW + cW / 2;
    g.append("text")
      .attr("x", cx)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("letter-spacing", "1.5px")
      .attr("fill", "#666")
      .attr("font-family", "system-ui")
      .text(monthLabels[mi].toUpperCase());
    g.append("line")
      .attr("x1", cx)
      .attr("x2", cx)
      .attr("y1", -12)
      .attr("y2", -5)
      .attr("stroke", "#bbb")
      .attr("stroke-width", 0.6);
  });

  categories.forEach((cat, ci) => {
    const isTotal = cat.startsWith("Total");
    const y = ci * cH;
    g.append("text")
      .attr("x", -12)
      .attr("y", y + cH / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", isTotal ? "9.5px" : "11.5px")
      .attr("fill", isTotal ? "#999" : "#222")
      .attr("font-style", isTotal ? "italic" : "normal")
      .attr("font-family", isTotal ? "system-ui" : "Georgia, serif")
      .text(cat);

    months.forEach((mo, mi) => {
      const entry = earth_hues.find((d) => d.month === mo);
      const color = entry?.[cat] ?? "#0a0a14";
      const cx = mi * cW;
      g.append("rect")
        .attr("x", cx + gap / 2)
        .attr("y", y + gap / 2)
        .attr("width", cW - gap)
        .attr("height", cH - gap)
        .attr("rx", 2)
        .attr("fill", color)
        .attr("opacity", 0)
        .transition()
        .delay(ci * 30 + mi * 8)
        .duration(350)
        .attr("opacity", 1);
      g.append("text")
        .attr("x", cx + cW / 2)
        .attr("y", y + cH / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-family", "'JetBrains Mono','Courier New',monospace")
        .attr("font-size", "10px")
        .attr("letter-spacing", "0.2px")
        .attr("fill", helpers.contrastText(color))
        .attr("opacity", 0)
        .text(color.toUpperCase())
        .transition()
        .delay(ci * 30 + mi * 8 + 200)
        .duration(200)
        .attr("opacity", 1);
      g.append("rect")
        .attr("x", cx + gap / 2)
        .attr("y", y + gap / 2)
        .attr("width", cW - gap)
        .attr("height", cH - gap)
        .attr("fill", "transparent")
        .attr("rx", 2)
        .append("title")
        .text(`${cat}  ·  ${monthLabels[mi]}\n${color.toUpperCase()}`);
    });
  });

  container.appendChild(svg.node());
}

/* 
   CHART 2 — Annual Color Signature
 */
function buildSignature() {
  const container = document.getElementById("viz-signature");
  const blockH = 90,
    blockGap = 30,
    annotH = 46;
  const m = { top: 88, right: 36, bottom: 40, left: 40 };
  const labelW = 82;
  const rows = ["Total Earth Mean", "Total Land Mean", "Total Ocean Mean"];
  const W = 1000;
  const blockW = (W - m.left - m.right - labelW) / months.length;
  const H = m.top + rows.length * (blockH + annotH + blockGap) + m.bottom;
  const BG = "#f8f6f0",
    INK = "#1a1918",
    SUB = "#9a9590",
    RULE = "#dedad4";

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("background", BG)
    .style("font-family", "Georgia,serif");
  svg
    .append("text")
    .attr("x", m.left + labelW)
    .attr("y", 32)
    .attr("fill", INK)
    .attr("font-size", "19px")
    .attr("font-weight", "bold")
    .attr("letter-spacing", "2.5px")
    .text("THE EARTH'S ANNUAL COLOR SIGNATURE");
  svg
    .append("text")
    .attr("x", m.left + labelW)
    .attr("y", 50)
    .attr("fill", SUB)
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text(
      "Area-weighted mean of Earth's three great systems · Terra/MODIS global composites",
    );
  svg
    .append("line")
    .attr("x1", m.left + labelW)
    .attr("x2", W - m.right)
    .attr("y1", 60)
    .attr("y2", 60)
    .attr("stroke", RULE)
    .attr("stroke-width", 0.8);

  months.forEach((mo, mi) => {
    const cx = m.left + labelW + mi * blockW + blockW / 2;
    svg
      .append("text")
      .attr("x", cx)
      .attr("y", 76)
      .attr("text-anchor", "middle")
      .attr("fill", SUB)
      .attr("font-size", "10px")
      .attr("font-family", "system-ui")
      .attr("letter-spacing", "1.2px")
      .text(monthLabels[mi].toUpperCase());
  });

  rows.forEach((rowCat, ri) => {
    const rowLabel = rowCat
      .replace("Total ", "")
      .replace(" Mean", "")
      .toUpperCase();
    const baseY = m.top + ri * (blockH + annotH + blockGap);
    svg
      .append("text")
      .attr(
        "transform",
        `translate(${m.left + labelW - 14},${baseY + blockH / 2}) rotate(-90)`,
      )
      .attr("text-anchor", "middle")
      .attr("fill", INK)
      .attr("font-size", "11px")
      .attr("font-family", "system-ui")
      .attr("font-weight", "600")
      .attr("letter-spacing", "2px")
      .text(rowLabel);

    months.forEach((mo, mi) => {
      const entry = earth_hues.find((d) => d.month === mo);
      const hex = entry?.[rowCat] ?? "#c8c4bc";
      const { r, g, b } = helpers.hexToRgb(hex);
      const cx = m.left + labelW + mi * blockW;
      const ay = baseY + blockH;
      const dH = helpers.boost(hex, 10);

      svg
        .append("rect")
        .attr("x", cx)
        .attr("y", baseY)
        .attr("width", blockW)
        .attr("height", blockH)
        .attr("fill", "#e0ddd8")
        .transition()
        .delay(ri * 100 + mi * 40)
        .duration(400)
        .attr("fill", hex);
      if (mi > 0)
        svg
          .append("line")
          .attr("x1", cx)
          .attr("x2", cx)
          .attr("y1", baseY)
          .attr("y2", baseY + blockH)
          .attr("stroke", BG)
          .attr("stroke-width", 0.6);
      svg
        .append("rect")
        .attr("x", cx + blockW / 2 - 5)
        .attr("y", ay + 6)
        .attr("width", 10)
        .attr("height", 5)
        .attr("fill", dH);
      svg
        .append("text")
        .attr("x", cx + blockW / 2)
        .attr("y", ay + 21)
        .attr("text-anchor", "middle")
        .attr("font-family", "'JetBrains Mono','Courier New',monospace")
        .attr("font-size", "9.5px")
        .attr("fill", "#6a6660")
        .text(hex.toUpperCase());
      svg
        .append("text")
        .attr("x", cx + blockW / 2)
        .attr("y", ay + 30)
        .attr("text-anchor", "middle")
        .attr("font-family", "'JetBrains Mono','Courier New',monospace")
        .attr("font-size", "6px")
        .attr("fill", "#aaa8a2")
        .text(`${r}·${g}·${b}`);
      svg
        .append("rect")
        .attr("x", cx)
        .attr("y", baseY)
        .attr("width", blockW)
        .attr("height", blockH)
        .attr("fill", "transparent")
        .style("cursor", "crosshair")
        .append("title")
        .text(
          `${rowCat}\n${monthLabels[mi]}\n${hex.toUpperCase()}\nR ${r}  G ${g}  B ${b}\nLuminance ${(helpers.lum(hex) * 100).toFixed(1)}%`,
        );
    });

    if (ri < rows.length - 1)
      svg
        .append("line")
        .attr("x1", m.left + labelW)
        .attr("x2", W - m.right)
        .attr("y1", baseY + blockH + annotH + blockGap / 2)
        .attr("y2", baseY + blockH + annotH + blockGap / 2)
        .attr("stroke", RULE)
        .attr("stroke-width", 0.7);
  });

  const footY = H - m.bottom + 10;
  svg
    .append("line")
    .attr("x1", m.left + labelW)
    .attr("x2", W - m.right)
    .attr("y1", footY)
    .attr("y2", footY)
    .attr("stroke", RULE)
    .attr("stroke-width", 0.6);
  svg
    .append("text")
    .attr("x", m.left + labelW)
    .attr("y", footY + 12)
    .attr("fill", "#c0bdb7")
    .attr("font-size", "8px")
    .attr("font-family", "system-ui")
    .text(
      "SOURCE: NASA Terra/MODIS MCD43C3 · GEBCO 2025 · MODIS MCD12C1 Land Cover",
    );

  container.appendChild(svg.node());
}

/* 
   CHART 3 — Seasonal Color Drift
 */
function buildDriftLines() {
  const container = document.getElementById("viz-drift");
  const W = 900,
    H = 480,
    m = { top: 64, right: 180, bottom: 44, left: 58 };
  const iW = W - m.left - m.right,
    iH = H - m.top - m.bottom;

  const visCats = categories.filter(
    (c) => c !== "Oceans" && !c.startsWith("Total"),
  );
  const colorMap = {
    "Fresh Water": "#2196f3",
    "Snow and Ice": "#879cae",
    Deserts: "#c8a84b",
    Mountains: "#4d3e39",
    Forests: "#2e7d32",
    Grasslands: "#6ab04c",
    Shrublands: "#9bb42b",
    Croplands: "#e67e22",
    Wetlands: "#00897b",
    "Urban Areas": "#c0392b",
  };

  const driftData = visCats.map((cat) => {
    const jan = earth_hues.find((d) => d.month === "jan");
    const { r: r0, g: g0, b: b0 } = helpers.hexToRgb(jan?.[cat] ?? "#000");
    const pts = months.map((mo, mi) => {
      const e = earth_hues.find((d) => d.month === mo);
      const { r, g, b } = helpers.hexToRgb(e?.[cat] ?? "#000");
      return {
        month: mo,
        mi,
        drift: Math.sqrt((r - r0) ** 2 + (g - g0) ** 2 + (b - b0) ** 2),
      };
    });
    return { cat, pts, color: colorMap[cat] ?? "#aaa" };
  });

  const xScale = d3.scalePoint().domain(months).range([0, iW]);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(driftData, (d) => d3.max(d.pts, (p) => p.drift)) * 1.06])
    .nice()
    .range([iH, 0]);
  const lineGen = d3
    .line()
    .x((d) => xScale(d.month))
    .y((d) => yScale(d.drift))
    .curve(d3.curveCatmullRom.alpha(0.5));

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("background", "#f8f7f2")
    .style("font-family", "Georgia,serif");
  svg
    .append("text")
    .attr("x", m.left)
    .attr("y", 20)
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("letter-spacing", "1px")
    .attr("fill", "#1a1918")
    .text("SEASONAL COLOR DRIFT FROM JANUARY");
  svg
    .append("text")
    .attr("x", m.left)
    .attr("y", 38)
    .attr("font-size", "10px")
    .attr("fill", "#aaa")
    .attr("font-style", "italic")
    .text(
      "Euclidean RGB distance of each month's mean colour from the January baseline",
    );

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  yScale.ticks(5).forEach((t) => {
    g.append("line")
      .attr("x1", 0)
      .attr("x2", iW)
      .attr("y1", yScale(t))
      .attr("y2", yScale(t))
      .attr("stroke", "#e8e5de")
      .attr("stroke-width", 0.6);
    g.append("text")
      .attr("x", -5)
      .attr("y", yScale(t))
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "9px")
      .attr("fill", "#ccc")
      .attr("font-family", "system-ui")
      .text(Math.round(t));
  });

  const animDur = 1800;
  driftData.forEach((d, di) => {
    const path = g
      .append("path")
      .datum(d.pts)
      .attr("d", lineGen)
      .attr("fill", "none")
      .attr("stroke", d.color)
      .attr("stroke-width", 1.8)
      .attr("opacity", 0.85);
    const len = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", `${len} ${len}`)
      .attr("stroke-dashoffset", len)
      .transition()
      .delay(di * 80)
      .duration(animDur)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
    d.pts.forEach((pt, i) => {
      const c = g
        .append("circle")
        .attr("cx", xScale(pt.month))
        .attr("cy", yScale(pt.drift))
        .attr("r", 3)
        .attr("fill", d.color)
        .attr("opacity", 0);
      c.append("title").text(
        `${d.cat}  ·  ${monthLabels[pt.mi]}\nΔ ${pt.drift.toFixed(1)} units`,
      );
      c.transition()
        .delay(di * 80 + (i / (d.pts.length - 1)) * animDur)
        .duration(260)
        .attr("opacity", 0.75);
    });
  });

  g.append("g")
    .attr("transform", `translate(0,${iH})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickSize(3)
        .tickFormat((_, i) => monthLabels[i]),
    )
    .call((ax) => ax.select(".domain").attr("stroke", "#ccc"))
    .call((ax) => ax.selectAll(".tick line").attr("stroke", "#ccc"))
    .selectAll("text")
    .attr("fill", "#999")
    .attr("font-size", "10px");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -iH / 2)
    .attr("y", -44)
    .attr("text-anchor", "middle")
    .attr("fill", "#ccc")
    .attr("font-size", "9px")
    .attr("font-family", "system-ui")
    .text("RGB Euclidean distance from January");

  // Legend
  const legX = iW + 16,
    ROW_H = 17;
  g.append("rect")
    .attr("x", legX - 8)
    .attr("y", -8)
    .attr("width", m.right - 24)
    .attr("height", driftData.length * ROW_H + 14)
    .attr("fill", "#f8f7f2")
    .attr("fill-opacity", 0.92)
    .attr("stroke", "#e4e0d8")
    .attr("stroke-width", 0.6)
    .attr("rx", 2);
  driftData.forEach((d, i) => {
    const py = -2 + i * ROW_H;
    g.append("line")
      .attr("x1", legX)
      .attr("x2", legX + 16)
      .attr("y1", py)
      .attr("y2", py)
      .attr("stroke", d.color)
      .attr("stroke-width", 1.8);
    g.append("circle")
      .attr("cx", legX + 8)
      .attr("cy", py)
      .attr("r", 2.5)
      .attr("fill", d.color);
    g.append("text")
      .attr("x", legX + 22)
      .attr("y", py + 0.5)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "9px")
      .attr("fill", "#333")
      .attr("font-family", "system-ui")
      .text(d.cat);
  });

  container.appendChild(svg.node());
}

/* 
   CHART 4 — Seasonal Color Wheels
 */
function buildColorWheels() {
  const container = document.getElementById("viz-wheels");
  const ecoCats = categories.filter((c) => !c.startsWith("Total"));
  const COLS = 4,
    ROWS = Math.ceil(ecoCats.length / COLS);
  const R = 74,
    gap = 40;
  const pad = { top: 70, right: 40, bottom: 54, left: 40 };
  const cW = pad.left + COLS * (R * 2 + gap) + pad.right;
  const cH = pad.top + ROWS * (R * 2 + gap) + pad.bottom;
  const radStep = (2 * Math.PI) / 12,
    initA = -Math.PI / 2,
    wDur = 100;

  const quarters = [
    {
      label: "Winter",
      hex: "#0055a454",
      start: initA - radStep,
      end: initA + 2 * radStep,
    },
    {
      label: "Spring",
      hex: "#ff00c33d",
      start: initA + 2 * radStep,
      end: initA + 5 * radStep,
    },
    {
      label: "Summer",
      hex: "#00793697",
      start: initA + 5 * radStep,
      end: initA + 8 * radStep,
    },
    {
      label: "Fall",
      hex: "#ff590057",
      start: initA + 8 * radStep,
      end: initA + 11 * radStep,
    },
  ];

  const wArc = d3
    .arc()
    .innerRadius(0)
    .outerRadius(R - 4)
    .padAngle(0.01)
    .padRadius(R);

  const rArc = d3
    .arc()
    .innerRadius(R - 4)
    .outerRadius(R);

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, cW, cH])
    .style("background", "#f8f7f2")
    .style("font-family", "'Times New Roman',Georgia,serif");

  svg
    .append("text")
    .attr("x", pad.left)
    .attr("y", 26)
    .attr("fill", "#2c3e50")
    .attr("font-size", "17px")
    .attr("font-weight", "bold")
    .attr("letter-spacing", "1px")
    .text("SEASONAL COLOR WHEELS");

  svg
    .append("text")
    .attr("x", pad.left)
    .attr("y", 44)
    .attr("fill", "#778899")
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text("Each biome · 12 months (Jan → Dec)  |  outer rim = season");

  ecoCats.forEach((eco, ci) => {
    const col = ci % COLS,
      row = Math.floor(ci / COLS);
    const xC = pad.left + col * (R * 2 + gap) + R;
    const yC = pad.top + row * (R * 2 + gap) + R;
    const wg = svg.append("g").attr("transform", `translate(${xC},${yC})`);

    months.forEach((mo, mi) => {
      const d = earth_hues.find((x) => x.month === mo);
      const hex = d?.[eco] || "#cccccc";
      const sA = initA + mi * radStep,
        eA = sA + radStep;
      const w = wg
        .append("path")
        .attr("fill", hex)
        .attr("stroke", "#f8f7f2")
        .attr("stroke-width", 0.5);

      w.transition()
        .delay(mi * wDur)
        .duration(wDur)
        .ease(d3.easeLinear)
        .attrTween("d", () => {
          const I = d3.interpolate(sA, eA);
          return (t) => wArc({ startAngle: sA, endAngle: I(t) });
        });

      w.append("title").text(`${eco}  ·  ${mo}\n${hex.toUpperCase()}`);
    });

    quarters.forEach((q, qi) => {
      const qp = wg
        .append("path")
        .attr("fill", q.hex)
        .attr("stroke", "#f8f7f2")
        .attr("stroke-width", 0.5);

      qp.transition()
        .delay(qi * 3 * wDur)
        .duration(3 * wDur)
        .ease(d3.easeLinear)
        .attrTween("d", () => {
          const I = d3.interpolate(q.start, q.end);
          return (t) => rArc({ startAngle: q.start, endAngle: I(t) });
        });

      qp.append("title").text(q.label);
    });

    wg.append("text")
      .attr("y", R + 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#2c3e50")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .text(eco);
  });

  const legX = cW - 280,
    legY = cH - 26;
  const lg = svg.append("g").attr("transform", `translate(${legX},${legY})`);

  quarters.forEach((q, i) => {
    const ix = i * 66;
    lg.append("rect")
      .attr("x", ix)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", q.hex)
      .attr("rx", 2);

    lg.append("text")
      .attr("x", ix + 14)
      .attr("y", 9)
      .attr("font-size", "10px")
      .attr("fill", "#778899")
      .attr("font-family", "system-ui")
      .text(q.label);
  });

  container.appendChild(svg.node());
}

/* 
   CHART 5 — RGB Channel Decomposition
 */
function buildRgbChannels() {
  const container = document.getElementById("viz-rgb");
  const COLS = 4,
    ROWS = Math.ceil(categories.length / COLS);
  const cW = 220,
    cH = 120,
    cp = { top: 26, right: 10, bottom: 26, left: 34 };
  const op = { top: 60, right: 20, bottom: 20, left: 20 };
  const W = COLS * cW + op.left + op.right,
    H = ROWS * cH + op.top + op.bottom;
  const iCW = cW - cp.left - cp.right,
    iCH = cH - cp.top - cp.bottom;
  const xS = d3.scalePoint().domain(months).range([0, iCW]);
  const yS = d3.scaleLinear().domain([0, 255]).range([iCH, 0]);
  const chs = [
    { key: "r", stroke: "#b94040" },
    { key: "g", stroke: "#4a7c59" },
    { key: "b", stroke: "#3a62a7" },
  ];
  const mkLine = (k) =>
    d3
      .line()
      .x((d) => xS(d.month))
      .y((d) => yS(d[k]))
      .curve(d3.curveCatmullRom.alpha(0.5));

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("background", "#faf9f6")
    .style("font-family", "Georgia,serif");
  svg
    .append("text")
    .attr("x", op.left)
    .attr("y", 22)
    .attr("font-size", "15px")
    .attr("font-weight", "bold")
    .attr("letter-spacing", "1.2px")
    .attr("fill", "#1a1a1a")
    .text("RGB CHANNEL DECOMPOSITION BY SURFACE TYPE");
  svg
    .append("text")
    .attr("x", op.left)
    .attr("y", 40)
    .attr("font-size", "9.5px")
    .attr("fill", "#888")
    .attr("font-style", "italic")
    .text(
      "Red, green, and blue channel intensity (0–255) across the annual cycle",
    );

  [
    { k: "r", l: "R", stroke: "#b94040" },
    { k: "g", l: "G", stroke: "#4a7c59" },
    { k: "b", l: "B", stroke: "#3a62a7" },
  ].forEach((ch, ci) => {
    const lx = W - 88 + ci * 26;
    svg
      .append("line")
      .attr("x1", lx)
      .attr("x2", lx + 14)
      .attr("y1", 36)
      .attr("y2", 36)
      .attr("stroke", ch.stroke)
      .attr("stroke-width", 2);
    svg
      .append("text")
      .attr("x", lx + 18)
      .attr("y", 40)
      .attr("font-size", "9px")
      .attr("fill", "#555")
      .attr("font-family", "system-ui")
      .text(ch.l);
  });

  categories.forEach((cat, ci) => {
    const col = ci % COLS,
      row = Math.floor(ci / COLS);
    const tx = op.left + col * cW + cp.left,
      ty = op.top + row * cH + cp.top;
    const data = months.map((mo) => {
      const e = earth_hues.find((d) => d.month === mo);
      const hex = e?.[cat] ?? "#000";
      return { month: mo, ...helpers.hexToRgb(hex) };
    });
    const g = svg.append("g").attr("transform", `translate(${tx},${ty})`);
    g.append("rect")
      .attr("x", -2)
      .attr("y", -2)
      .attr("width", iCW + 4)
      .attr("height", iCH + 4)
      .attr("fill", "#f0efe9")
      .attr("rx", 2);
    [64, 128, 192].forEach((v) =>
      g
        .append("line")
        .attr("x1", 0)
        .attr("x2", iCW)
        .attr("y1", yS(v))
        .attr("y2", yS(v))
        .attr("stroke", "#dddbd5")
        .attr("stroke-width", 0.7),
    );
    chs.forEach((ch) => {
      const path = g
        .append("path")
        .datum(data)
        .attr("d", mkLine(ch.key))
        .attr("fill", "none")
        .attr("stroke", ch.stroke)
        .attr("stroke-width", 1.6)
        .attr("opacity", 0.9);
      const len = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", `${len} ${len}`)
        .attr("stroke-dashoffset", len)
        .transition()
        .delay(ci * 40)
        .duration(1200)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    });
    g.append("text")
      .attr("x", 0)
      .attr("y", -9)
      .attr("font-size", "8.5px")
      .attr("fill", "#333")
      .attr("font-family", "system-ui")
      .attr("font-weight", "600")
      .attr("letter-spacing", "0.4px")
      .text(cat.toUpperCase());
    if (row === ROWS - 1 || categories.length - ci <= COLS) {
      ["jan", "jun", "dec"].forEach((mo) =>
        g
          .append("text")
          .attr("x", xS(mo))
          .attr("y", iCH + 14)
          .attr("text-anchor", "middle")
          .attr("font-size", "8px")
          .attr("fill", "#aaa")
          .attr("font-family", "system-ui")
          .text(monthLabels[months.indexOf(mo)]),
      );
    }
    if (col === 0) {
      [0, 128, 255].forEach((v) =>
        g
          .append("text")
          .attr("x", -5)
          .attr("y", yS(v))
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "7.5px")
          .attr("fill", "#bbb")
          .attr("font-family", "system-ui")
          .text(v),
      );
    }
  });

  container.appendChild(svg.node());
}

/* 
   CHART 6 — Seasonal Brightness Anomaly
 */
function buildAnomalyHeatmap() {
  const container = document.getElementById("viz-anomaly");
  const W = 1050,
    H = 610,
    m = { top: 82, right: 140, bottom: 36, left: 168 };
  const iW = W - m.left - m.right,
    iH = H - m.top - m.bottom;

  const anomalyRows = categories.map((cat) => {
    const lums = months.map((mo) => {
      const e = earth_hues.find((d) => d.month === mo);
      return helpers.lum(e?.[cat] ?? "#000");
    });
    const mean = d3.mean(lums);
    return {
      cat,
      pts: lums.map((l, mi) => ({
        month: months[mi],
        delta: l - mean,
        lum: l,
        mean,
      })),
    };
  });

  const allDeltas = anomalyRows.flatMap((d) => d.pts.map((p) => p.delta));
  const maxD = d3.max(allDeltas, Math.abs);
  const cScale = d3
    .scaleLinear()
    .domain([-maxD, 0, maxD])
    .range(["#1b4332", "#F2EDED", "#F53838"]);
  const xS = d3.scaleBand().domain(months).range([0, iW]).padding(0.04);
  const yS = d3.scaleBand().domain(categories).range([0, iH]).padding(0.07);

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("background", "#faf9f6")
    .style("font-family", "Georgia,serif");
  svg
    .append("text")
    .attr("x", m.left)
    .attr("y", 24)
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("letter-spacing", "1.2px")
    .attr("fill", "#1a1a1a")
    .text("SEASONAL BRIGHTNESS ANOMALY (Δ)");
  svg
    .append("text")
    .attr("x", m.left)
    .attr("y", 44)
    .attr("font-size", "10px")
    .attr("fill", "#888")
    .attr("font-style", "italic")
    .text(
      "Deviation of monthly luminance from each surface type's annual mean (× 100)",
    );

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  anomalyRows.forEach((d, di) => {
    d.pts.forEach((pt, pi) => {
      const x = xS(pt.month),
        y = yS(d.cat);
      const absd = Math.abs(pt.delta);
      const tc = absd > maxD * 0.38 ? "#ffffff" : "#333333";
      const cell = g
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", xS.bandwidth())
        .attr("height", yS.bandwidth())
        .attr("rx", 2)
        .attr("fill", "#F2EDED");
      cell
        .transition()
        .delay(di * 35 + pi * 8)
        .duration(380)
        .attr("fill", cScale(pt.delta));
      g.append("text")
        .attr("x", x + xS.bandwidth() / 2)
        .attr("y", y + yS.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "10px")
        .attr("font-family", "system-ui")
        .attr("font-weight", "500")
        .attr("fill", tc)
        .attr("opacity", 0)
        .text((pt.delta >= 0 ? "+" : "") + (pt.delta * 100).toFixed(1))
        .transition()
        .delay(di * 35 + pi * 8 + 280)
        .duration(180)
        .attr("opacity", 1);
    });
  });

  const sepY = yS("Total Land Mean") - 1.5;
  g.append("line")
    .attr("x1", -14)
    .attr("x2", iW)
    .attr("y1", sepY)
    .attr("y2", sepY)
    .attr("stroke", "#999")
    .attr("stroke-width", 0.8)
    .attr("stroke-dasharray", "5,3");

  g.append("g")
    .call(
      d3
        .axisTop(xS)
        .tickSize(0)
        .tickFormat((_, i) => monthLabels[i]),
    )
    .call((ax) => ax.select(".domain").remove())
    .selectAll("text")
    .style("font-size", "11px")
    .style("fill", "#555")
    .style("font-weight", "bold")
    .attr("dy", "-7px");
  g.append("g")
    .call(d3.axisLeft(yS).tickSize(0))
    .call((ax) => ax.select(".domain").remove())
    .selectAll("text")
    .style("font-size", "11px")
    .style("fill", "#333")
    .attr("dx", "-6px");

  // gradient legend
  const legH = Math.round(iH * 0.66),
    legX = iW + 34,
    legY = (iH - legH) / 2;
  const defs = svg.append("defs");
  const lGrad = defs
    .append("linearGradient")
    .attr("id", "ag")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");
  d3.range(0, 1.01, 0.04).forEach((t) =>
    lGrad
      .append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", cScale(maxD * (1 - 2 * t))),
  );
  g.append("rect")
    .attr("x", legX)
    .attr("y", legY)
    .attr("width", 13)
    .attr("height", legH)
    .attr("fill", "url(#ag)")
    .attr("rx", 3);
  [
    [legY, `+${(maxD * 100).toFixed(1)}%`, "Brighter"],
    [legY + legH, `−${(maxD * 100).toFixed(1)}%`, "Darker"],
  ].forEach(([y, val, desc]) => {
    g.append("text")
      .attr("x", legX + 18)
      .attr("y", y - 3)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "8.5px")
      .attr("fill", "#222")
      .attr("font-weight", "bold")
      .attr("font-family", "system-ui")
      .text(val);
    g.append("text")
      .attr("x", legX + 18)
      .attr("y", y + 7)
      .attr("dominant-baseline", "middle")
      .attr("font-size", "8px")
      .attr("fill", "#888")
      .attr("font-family", "system-ui")
      .text(desc);
    g.append("line")
      .attr("x1", legX + 13)
      .attr("x2", legX + 16)
      .attr("y1", y)
      .attr("y2", y)
      .attr("stroke", "#888")
      .attr("stroke-width", 1);
  });
  g.append("text")
    .attr("x", legX + 6)
    .attr("y", legY - 14)
    .attr("text-anchor", "middle")
    .attr("font-size", "8.5px")
    .attr("fill", "#666")
    .attr("font-weight", "bold")
    .attr("font-family", "system-ui")
    .text("Δ lum.");

  container.appendChild(svg.node());
}

/* 
   TOC Scroll Spy
 */
function initScrollSpy() {
  const pills = document.querySelectorAll(".toc-pill");
  const sections = Array.from(document.querySelectorAll("[id^='s']")).filter(
    (el) => el.tagName === "SECTION" || el.tagName === "DIV",
  );

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          pills.forEach((p) => p.classList.remove("active"));
          const active = document.querySelector(
            `.toc-pill[href="#${entry.target.id}"]`,
          );
          if (active) {
            active.classList.add("active");
            active.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "center",
            });
          }
        }
      });
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
  );

  sections.forEach((s) => spy.observe(s));
}

/* 
   Init
 */
document.addEventListener("DOMContentLoaded", () => {
  registerViz("viz-heatmap", buildHeatmap);
  registerViz("viz-signature", buildSignature);
  registerViz("viz-drift", buildDriftLines);
  registerViz("viz-wheels", buildColorWheels);
  registerViz("viz-rgb", buildRgbChannels);
  registerViz("viz-anomaly", buildAnomalyHeatmap);
  initScrollSpy();
});
