let earthHues = [];

function setEarthHues(records) {
  earthHues = records;
}

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

const colorMath = {
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
  toLinear(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  },
  hexToLab(hex) {
    const { r, g, b } = this.hexToRgb(hex);
    const [lr, lg, lb] = [r, g, b].map((v) => this.toLinear(v / 255));
    const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) / 0.95047;
    const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb;
    const z = (0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb) / 1.08883;
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : t / 0.128419 + 4 / 29);
    const [fx, fy, fz] = [x, y, z].map(f);
    return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
  },
};

function copyText(text, status) {
  const done = () => {
    status.textContent = text.length > 64 ? `Copied ${text.split("\n").length} values` : `Copied ${text}`;
    status.classList.add("is-live");
    clearTimeout(copyText.timer);
    copyText.timer = setTimeout(() => status.classList.remove("is-live"), 1400);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    return;
  }
  fallbackCopy(text, done);
}

function fallbackCopy(text, done) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  try {
    document.execCommand("copy");
    done();
  } finally {
    field.remove();
  }
}

const pendingCharts = new Map();

function buildWhenSeen(el) {
  const build = pendingCharts.get(el.id);
  if (!build) return;
  pendingCharts.delete(el.id);
  el.classList.add("visible");
  build();
}

function inView(el, slack = 80) {
  const box = el.getBoundingClientRect();
  return box.top < window.innerHeight + slack && box.bottom > -slack;
}

// an unbuilt container is zero-height, so any threshold above 0 never fires
const vizObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      vizObserver.unobserve(entry.target);
      buildWhenSeen(entry.target);
    });
  },
  { threshold: 0, rootMargin: "80px 0px" },
);

// the observer misses containers whose height comes only from CSS, so check on scroll too
function sweepPending() {
  if (!pendingCharts.size) return;
  Array.from(pendingCharts.keys()).forEach((id) => {
    const el = document.getElementById(id);
    if (el && inView(el)) {
      vizObserver.unobserve(el);
      buildWhenSeen(el);
    }
  });
  if (!pendingCharts.size) {
    window.removeEventListener("scroll", sweepPending);
    window.removeEventListener("resize", sweepPending);
  }
}

function registerViz(id, buildFn) {
  const el = document.getElementById(id);
  if (!el) return;
  pendingCharts.set(id, buildFn);
  vizObserver.observe(el);
  window.addEventListener("scroll", sweepPending, { passive: true });
  window.addEventListener("resize", sweepPending);
  sweepPending();
}

function initTocHighlight() {
  const links = Array.from(document.querySelectorAll(".toc a"));
  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((other) => other.classList.remove("active"));
      link.classList.add("active");
    });
  });
}
