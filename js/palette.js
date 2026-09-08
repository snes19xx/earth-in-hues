const PALETTE_FORMATS = {
  hex: {
    label: "HEX",
    cell: (hex) => hex,
    row: (name, values) => values.join(", "),
  },
  rgb: {
    label: "RGB",
    cell: (hex) => {
      const { r, g, b } = colorMath.hexToRgb(hex);
      return `rgb(${r}, ${g}, ${b})`;
    },
    row: (name, values) => values.join(", "),
  },
  css: {
    label: "CSS",
    cell: (hex, category, month) => `--earth-${slugify(category)}-${month}: ${hex};`,
    row: (name, values) => values.join("\n"),
  },
  lab: {
    label: "Lab",
    cell: (hex) => {
      const { L, a, b } = colorMath.hexToLab(hex);
      return `lab(${L.toFixed(1)} ${a.toFixed(1)} ${b.toFixed(1)})`;
    },
    row: (name, values) => values.join(", "),
  },
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function buildPalette(records) {
  const root = document.getElementById("palette-gallery");
  if (!root) return;

  const status = root.querySelector(".palette-status");
  const grid = root.querySelector(".palette-grid");
  const buttons = Array.from(root.querySelectorAll(".palette-formats button"));
  let format = "hex";

  function draw() {
    const spec = PALETTE_FORMATS[format];
    grid.innerHTML = "";

    const head = document.createElement("div");
    head.className = "palette-row palette-head";
    head.appendChild(document.createElement("span"));
    monthLabels.forEach((label) => {
      const cell = document.createElement("span");
      cell.textContent = label;
      head.appendChild(cell);
    });
    head.appendChild(document.createElement("span"));
    grid.appendChild(head);

    categories.forEach((category) => {
      const line = document.createElement("div");
      line.className = "palette-row";

      const name = document.createElement("button");
      name.type = "button";
      name.className = "palette-name";
      name.textContent = category;
      name.title = `Copy the whole year as ${spec.label}`;
      const values = records.map((record) =>
        spec.cell(record[category], category, record.month),
      );
      name.addEventListener("click", () => copyText(spec.row(category, values), status));
      line.appendChild(name);

      records.forEach((record, index) => {
        const hex = record[category];
        const swatch = document.createElement("button");
        swatch.type = "button";
        swatch.className = "palette-swatch";
        swatch.style.background = hex;
        swatch.title = `${category}, ${monthLabels[index]} — ${hex}`;
        swatch.setAttribute("aria-label", `${category} ${monthLabels[index]} ${hex}`);
        swatch.addEventListener("click", () =>
          copyText(spec.cell(hex, category, record.month), status),
        );
        line.appendChild(swatch);
      });

      const annual = document.createElement("span");
      annual.className = "palette-hex";
      annual.textContent = records[0][category];
      line.appendChild(annual);

      grid.appendChild(line);
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      format = button.dataset.format;
      buttons.forEach((other) =>
        other.setAttribute("aria-pressed", String(other === button)),
      );
      draw();
    });
  });

  root.querySelectorAll("[data-copy-all]").forEach((button) => {
    button.addEventListener("click", () => {
      const spec = PALETTE_FORMATS[button.dataset.copyAll];
      const lines = categories.flatMap((category) =>
        records.map((record) => spec.cell(record[category], category, record.month)),
      );
      copyText(lines.join(button.dataset.copyAll === "css" ? "\n" : ", "), status);
    });
  });

  draw();
}
