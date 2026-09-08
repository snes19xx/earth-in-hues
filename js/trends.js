const TRENDS_SOURCE = "data/earth_hues_trends.json";
const ROW_HEIGHT = 26;
const SENSORS = ["terra", "aqua"];

function panelWidth(node, fallback = 760) {
  const measured = node.getBoundingClientRect().width;
  return measured > 40 ? measured : fallback;
}

function frame(container, width, height) {
  return d3
    .select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("font-family", '"Computer Modern", serif');
}

function buildSensorCheck(data) {
  const container = document.getElementById("viz-sensor-check");
  if (!container) return;
  container.innerHTML = "";

  const rows = Object.entries(data.agreement)
    .map(([name, entry]) => ({
      name,
      ...entry,
      clearsFloor:
        data.control_adjusted.terra[name].above_floor &&
        data.control_adjusted.aqua[name].above_floor,
    }))
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  const margin = { top: 32, right: 132, bottom: 58, left: 158 };
  const width = panelWidth(container);
  const height = rows.length * ROW_HEIGHT + margin.top + margin.bottom;
  const inner = width - margin.left - margin.right;

  const floor = Math.abs(data.trends.terra[data.control_category].slope_per_decade);
  const extent = d3.extent(rows.flatMap((r) => [r.terra, r.aqua]));
  const x = d3
    .scaleLinear()
    .domain([Math.min(extent[0], -floor * 2) - 0.1, Math.max(extent[1], floor * 2) + 0.1])
    .range([0, inner]);
  const y = d3
    .scaleBand()
    .domain(rows.map((r) => r.name))
    .range([0, rows.length * ROW_HEIGHT])
    .paddingInner(0.35);

  const svg = frame(container, width, height);
  const plot = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  plot
    .append("rect")
    .attr("x", x(-floor * 2))
    .attr("width", x(floor * 2) - x(-floor * 2))
    .attr("y", -6)
    .attr("height", rows.length * ROW_HEIGHT + 6)
    .attr("fill", "#000")
    .attr("opacity", 0.06);

  plot
    .append("line")
    .attr("x1", x(0))
    .attr("x2", x(0))
    .attr("y1", -6)
    .attr("y2", rows.length * ROW_HEIGHT)
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  const axis = d3.axisBottom(x).ticks(7).tickSize(4);
  plot
    .append("g")
    .attr("transform", `translate(0,${rows.length * ROW_HEIGHT + 4})`)
    .call(axis)
    .call((g) => g.selectAll("text").attr("font-size", 12))
    .call((g) => g.select(".domain").attr("stroke-width", 1));

  plot
    .append("text")
    .attr("x", inner / 2)
    .attr("y", rows.length * ROW_HEIGHT + 48)
    .attr("text-anchor", "middle")
    .attr("font-size", 13)
    .attr("font-style", "italic")
    .text("lightness trend, L* per decade");

  const row = plot
    .selectAll("g.row")
    .data(rows)
    .join("g")
    .attr("class", "row")
    .attr("transform", (d) => `translate(0,${y(d.name) + y.bandwidth() / 2})`);

  row
    .append("line")
    .attr("x1", (d) => x(d.terra))
    .attr("x2", (d) => x(d.aqua))
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  row
    .append("circle")
    .attr("cx", (d) => x(d.terra))
    .attr("r", 4.2)
    .attr("fill", "#000");

  row
    .append("circle")
    .attr("cx", (d) => x(d.aqua))
    .attr("r", 4.2)
    .attr("fill", "var(--paper)")
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  row
    .append("text")
    .attr("x", -8)
    .attr("dy", "0.32em")
    .attr("text-anchor", "end")
    .attr("font-size", 13)
    .attr("font-weight", (d) => (d.clearsFloor ? "bold" : "normal"))
    .text((d) => d.name);

  row
    .append("text")
    .attr("x", inner + 8)
    .attr("dy", "0.32em")
    .attr("font-size", 12)
    .attr("font-weight", (d) => (d.exceeds_control ? "bold" : "normal"))
    .text(
      (d) =>
        `${d.difference >= 0 ? "+" : ""}${d.difference.toFixed(3)}${d.exceeds_control ? " †" : ""}`,
    );

  const key = svg.append("g").attr("transform", `translate(${margin.left},16)`);
  key.append("circle").attr("r", 4.2).attr("fill", "#000");
  key.append("text").attr("x", 10).attr("dy", "0.32em").attr("font-size", 12).text("Terra");
  key
    .append("circle")
    .attr("cx", 66)
    .attr("r", 4.2)
    .attr("fill", "var(--paper)")
    .attr("stroke", "#000");
  key.append("text").attr("x", 76).attr("dy", "0.32em").attr("font-size", 12).text("Aqua");
  key
    .append("text")
    .attr("x", inner + 8)
    .attr("dy", "0.32em")
    .attr("font-size", 12)
    .attr("font-style", "italic")
    .text("difference");
}

function buildAnnualPanels(data) {
  const container = document.getElementById("viz-annual");
  if (!container) return;
  container.innerHTML = "";

  const names = Object.keys(data.trends.terra);
  const columns = 2;
  const width = panelWidth(container);
  const cell = { w: width / columns, h: 118 };
  const margin = { top: 22, right: 12, bottom: 22, left: 40 };
  const rows = Math.ceil(names.length / columns);

  const svg = frame(container, width, rows * cell.h + 10);

  names.forEach((name, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const panel = svg
      .append("g")
      .attr("transform", `translate(${column * cell.w},${row * cell.h})`);

    const series = SENSORS.map((sensor) => ({
      sensor,
      points: Object.entries(data.annual[sensor][name] || {})
        .map(([year, entry]) => ({ year: +year, value: entry.lightness }))
        .sort((a, b) => a.year - b.year),
    })).filter((s) => s.points.length > 1);

    if (!series.length) return;

    const all = series.flatMap((s) => s.points);
    const x = d3
      .scaleLinear()
      .domain(d3.extent(all, (d) => d.year))
      .range([margin.left, cell.w - margin.right]);
    const y = d3
      .scaleLinear()
      .domain(d3.extent(all, (d) => d.value))
      .nice(3)
      .range([cell.h - margin.bottom, margin.top]);

    panel
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(3).tickSize(3))
      .call((g) => g.selectAll("text").attr("font-size", 12))
      .call((g) => g.select(".domain").attr("stroke-width", 0.9));

    panel
      .append("g")
      .attr("transform", `translate(0,${cell.h - margin.bottom})`)
      .call(d3.axisBottom(x).tickValues([2005, 2015, 2024]).tickFormat(d3.format("d")).tickSize(3))
      .call((g) => g.selectAll("text").attr("font-size", 12))
      .call((g) => g.select(".domain").attr("stroke-width", 0.9));

    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.value));

    series.forEach((s) => {
      panel
        .append("path")
        .datum(s.points)
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", 0.9)
        .attr("stroke-dasharray", s.sensor === "aqua" ? "3,2" : null)
        .attr("d", line);
    });

    const stat = data.control_adjusted.terra[name];
    panel
      .append("text")
      .attr("x", margin.left)
      .attr("y", 13)
      .attr("font-size", 12.5)
      .attr("font-weight", stat && stat.above_floor ? "bold" : "normal")
      .text(name);
  });
}

function buildTrends() {
  const holder = document.getElementById("viz-sensor-check");
  if (!holder) return;

  fetch(TRENDS_SOURCE)
    .then((response) => response.json())
    .then((data) => {
      buildSensorCheck(data);
      buildAnnualPanels(data);
      window.addEventListener("resize", () => {
        buildSensorCheck(data);
        buildAnnualPanels(data);
      });
    })
    .catch((error) => {
      holder.textContent = `${error.message}. Serve the page over HTTP, not from a file path.`;
    });
}
