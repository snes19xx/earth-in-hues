const MAP_RASTER = "data/raster/categories_half.png";
const MAP_LEGEND = "data/raster/categories.json";
const MAP_VIEWS = "data/earth_hues_space.json";
const MAP_CLOUDS = "data/raster/clouds.png";
const MAP_CLOUD_META = "data/raster/clouds.json";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`could not load ${src}`));
    image.src = src;
  });
}

function readIndices(image) {
  const scratch = document.createElement("canvas");
  scratch.width = image.width;
  scratch.height = image.height;
  const context = scratch.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);

  const pixels = context.getImageData(0, 0, image.width, image.height).data;
  const category = new Uint8Array(image.width * image.height);
  const mountain = new Uint8Array(image.width * image.height);
  for (let i = 0, p = 0; i < category.length; i++, p += 4) {
    category[i] = pixels[p];
    mountain[i] = pixels[p + 1] > 127 ? 1 : 0;
  }
  return { category, mountain, width: image.width, height: image.height };
}

function paletteFor(views, categories, month, view) {
  const colors = views.records[month].views[view];
  const table = new Uint8Array(256 * 3).fill(240);
  categories.forEach((name, index) => {
    const entry = colors[name];
    if (!entry) return;
    const value = parseInt(entry.hex.slice(1), 16);
    table[index * 3] = (value >> 16) & 255;
    table[index * 3 + 1] = (value >> 8) & 255;
    table[index * 3 + 2] = value & 255;
  });
  return table;
}

function toLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function toChannel(linear) {
  const v = linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
}

function cloudTable(views, categories, month, albedo, levels) {
  const colors = views.records[month].views.atmosphere;
  const table = new Uint8Array(categories.length * levels * 3);
  categories.forEach((name, index) => {
    const entry = colors[name];
    if (!entry) return;
    const value = parseInt(entry.hex.slice(1), 16);
    const base = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(toLinear);
    for (let level = 0; level < levels; level++) {
      const fraction = level / (levels - 1);
      const at = (index * levels + level) * 3;
      for (let c = 0; c < 3; c++) {
        table[at + c] = toChannel(fraction * albedo + (1 - fraction) * base[c]);
      }
    }
  });
  return table;
}

function readCloudAtlas(image, meta, width, height) {
  const scratch = document.createElement("canvas");
  scratch.width = image.width;
  scratch.height = image.height;
  const context = scratch.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, image.width, image.height).data;

  // nearest-neighbour onto the category grid, cloud fields are smooth enough
  const levels = meta.seasons.map((_, season) => {
    const field = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      const sourceY = season * meta.height + Math.min(meta.height - 1, Math.floor((y / height) * meta.height));
      for (let x = 0; x < width; x++) {
        const sourceX = Math.min(meta.width - 1, Math.floor((x / width) * meta.width));
        const value = pixels[(sourceY * image.width + sourceX) * 4];
        field[y * width + x] = Math.min(meta.levels - 1, Math.round(value / meta.step));
      }
    }
    return field;
  });
  return { levels };
}

function buildMap() {
  const figure = document.getElementById("viz-map");
  if (!figure) return;

  const canvas = figure.querySelector("canvas");
  const slider = figure.querySelector('input[type="range"]');
  const monthLabel = figure.querySelector(".map-month");
  const readout = figure.querySelector(".map-readout");
  const legend = figure.querySelector(".map-legend");
  const buttons = Array.from(figure.querySelectorAll(".map-views button"));
  const status = figure.querySelector(".map-status");
  const context = canvas.getContext("2d");

  let state = { month: 0, view: "atmosphere" };
  let pinned = null;
  let raster = null;
  let clouds = null;
  let cloudMeta = null;
  let legendData = null;
  let views = null;

  function render() {
    const image = context.createImageData(raster.width, raster.height);
    const out = image.data;

    if (state.view === "space" && clouds) {
      const levels = cloudMeta.levels;
      const table = cloudTable(views, legendData.categories, state.month, cloudMeta.albedo, levels);
      const season = cloudMeta.month_to_season[state.month];
      const field = clouds.levels[season];
      for (let i = 0, p = 0; i < raster.category.length; i++, p += 4) {
        const at = (raster.category[i] * levels + field[i]) * 3;
        out[p] = table[at];
        out[p + 1] = table[at + 1];
        out[p + 2] = table[at + 2];
        out[p + 3] = 255;
      }
    } else {
      const palette = paletteFor(views, legendData.categories, state.month, state.view);
      for (let i = 0, p = 0; i < raster.category.length; i++, p += 4) {
        const base = raster.category[i] * 3;
        out[p] = palette[base];
        out[p + 1] = palette[base + 1];
        out[p + 2] = palette[base + 2];
        out[p + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }



  function drawLegend() {
    const colors = views.records[state.month].views[state.view];
    legend.innerHTML = legendData.categories
      .map((name) => {
        const hex = colors[name] ? colors[name].hex : "#ffffff";
        return `<span><i class="map-swatch" style="background:${hex}"></i>${name}</span>`;
      })
      .join("");
  }

  function locate(event) {
    const bounds = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - bounds.left) / bounds.width) * raster.width);
    const y = Math.floor(((event.clientY - bounds.top) / bounds.height) * raster.height);
    if (x < 0 || y < 0 || x >= raster.width || y >= raster.height) return null;
    return { x, y };
  }

  function showReadout(spot) {
    const offset = spot.y * raster.width + spot.x;
    const name = legendData.categories[raster.category[offset]];
    if (!name) return;

    const entry = views.records[state.month].views[state.view][name];
    const longitude = (spot.x / raster.width) * 360 - 180;
    const latitude = 90 - (spot.y / raster.height) * 180;
    const place = `${Math.abs(latitude).toFixed(1)}&deg;${latitude >= 0 ? "N" : "S"} ` +
      `${Math.abs(longitude).toFixed(1)}&deg;${longitude >= 0 ? "E" : "W"}`;

    readout.innerHTML =
      `<i class="map-swatch" style="background:${entry.hex}"></i>` +
      `<span><b>${name}</b>${raster.mountain[offset] ? ", mountainous" : ""}, ` +
      `albedo ${entry.albedo.toFixed(3)}, ${place}</span>` +
      `<button type="button" class="map-copy" title="Copy this colour">${entry.hex}</button>` +
      (pinned ? '<button type="button" class="map-clear">clear</button>' : "");

    const copy = readout.querySelector(".map-copy");
    copy.addEventListener("click", () => copyText(entry.hex, status));
    const clear = readout.querySelector(".map-clear");
    if (clear) {
      clear.addEventListener("click", () => {
        pinned = null;
        readout.textContent = "";
        status.textContent = "";
      });
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      buttons.forEach((other) =>
        other.setAttribute("aria-pressed", String(other === button)),
      );
      render();
      drawLegend();
      if (pinned) showReadout(pinned);
    });
  });

  slider.addEventListener("input", () => {
    state.month = Number(slider.value);
    monthLabel.textContent = MONTH_NAMES[state.month];
    render();
    drawLegend();
    if (pinned) showReadout(pinned);
  });

  canvas.addEventListener("mousemove", (event) => {
    if (pinned) return;
    const spot = locate(event);
    if (spot) showReadout(spot);
  });

  canvas.addEventListener("mouseleave", () => {
    if (!pinned) readout.textContent = "";
  });

  canvas.addEventListener("click", (event) => {
    const spot = locate(event);
    if (!spot) return;
    pinned = spot;
    showReadout(spot);
  });

  Promise.all([
    loadImage(MAP_RASTER),
    fetch(MAP_LEGEND).then((r) => r.json()),
    fetch(MAP_VIEWS).then((r) => r.json()),
    loadImage(MAP_CLOUDS),
    fetch(MAP_CLOUD_META).then((r) => r.json()),
  ])
    .then(([image, legendJson, viewsJson, cloudImage, cloudJson]) => {
      raster = readIndices(image);
      legendData = legendJson;
      views = viewsJson;
      cloudMeta = cloudJson;
      clouds = readCloudAtlas(cloudImage, cloudJson, raster.width, raster.height);
      canvas.width = raster.width;
      canvas.height = raster.height;
      render();
      drawLegend();
    })
    .catch((error) => {
      readout.textContent = `${error.message}. Serve the page over HTTP, not from a file path.`;
    });
}
