import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const THEMES = {
  dark: {
    isDark: true,
    bg: "#0a0a0a",
    border: "#1f1f1f",
    ring: "#2a2a2a",
    text: "#f5f5f5",
    muted: "#8a8a8a",
    accent: "#8ab4f8",
  },
  light: {
    isDark: false,
    bg: "#fafafa",
    border: "#e5e5e5",
    ring: "#d4d4d4",
    text: "#1a1a1a",
    muted: "#666666",
    accent: "#4285f4",
  },
};

const CARD = {
  bg: "#0a0a0a",
  border: "#1c1c1c",
  text: "#f5f5f5",
  muted: "#8a8a8a",
};

const RADIUS = 4;

const INTRO_LINES = [
  "I'm a CSE undergrad at Symbiosis Institute of Technology, Pune, but my stack doesn't know that.",
  "I build backend systems the way they're supposed to be built. Then I benchmark them.",
];

const LABELS = [
  { slug: "selected", text: "SELECTED WORK" },
  { slug: "stack", text: "STACK" },
];

const LINKS = ["Portfolio", "LinkedIn", "X", "LeetCode"];
const LINK_SIZE = 13.5;

const FONT = "Raleway, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const LOGO = readFileSync("assets/logo.png").toString("base64");
const ICONS = JSON.parse(readFileSync("scripts/icons.json", "utf8"));

const PROJECTS = [
  {
    slug: "kprobe",
    title: "kprobe",
    description: "Kernel-level flight recorder.",
    accent: "#F0980A",
  },
  {
    slug: "esx",
    title: "ESX",
    description: "Stock exchange, from scratch.",
    accent: "#00A0E0",
  },
  {
    slug: "provenance",
    title: "Provenance",
    description: "Plastic EPR compliance.",
    accent: "#4A9B58",
  },
  {
    slug: "hatch",
    title: "Hatch",
    description: "Deploys into your AWS account.",
    accent: "#C4B5FD",
  },
];

const TAGLINE = "If it can fail, I've already thought about how.";
const TAGLINE_WIDTH = 324;
const BANNER_HEIGHT = 164;

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;");

const LATENCY = {
  cols: 52,
  rows: 26,
  stride: 4,
  cell: 3,
  x: 558,
  y: 24,
  separator: 775,
  histogramX: 783,
  histogramWidth: 44,
  sloRow: 7,
  seconds: 24,
  incidents: [
    { from: 10, to: 19 },
    { from: 30, to: 38 },
  ],
  timeouts: [
    [8, 0],
    [22, 1],
    [26, 0],
    [40, 0],
    [47, 1],
    [50, 0],
  ],
};

function seeded(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function incident(c) {
  const hit = LATENCY.incidents.find((e) => c >= e.from && c <= e.to);
  return hit ? Math.sin((Math.PI * (c - hit.from + 0.5)) / (hit.to - hit.from + 1)) : 0;
}

function latencyModes(c) {
  const k = incident(c);
  return [
    { weight: 1.0, mean: 22.2 + 0.4 * Math.sin((4 * Math.PI * c) / LATENCY.cols), spread: 1.0 },
    { weight: 0.5 + 0.25 * k, mean: 16.5 + 0.7 * Math.sin((2 * Math.PI * c) / LATENCY.cols + 1) - 4 * k, spread: 1.4 },
    { weight: 0.03 + 0.3 * k, mean: 12.5 - 7 * k, spread: 2.0 + 0.8 * k },
  ];
}

function density(c, r) {
  return latencyModes(c).reduce((sum, m) => sum + m.weight * Math.exp(-((r - m.mean) ** 2) / (2 * m.spread ** 2)), 0);
}

function percentileRows(column) {
  const total = column.reduce((a, b) => a + b, 0);
  let cumulative = 0;
  let p50 = null;
  let p99 = null;
  for (let r = column.length - 1; r >= 0; r--) {
    cumulative += column[r] / total;
    if (p50 === null && cumulative >= 0.5) p50 = r;
    if (p99 === null && cumulative >= 0.99) p99 = r;
  }
  return { p50, p99 };
}

function percentiles(c) {
  return percentileRows(Array.from({ length: LATENCY.rows }, (_, r) => density(c, r)));
}

function latencyVisual(t) {
  const rand = seeded(5);
  const { cols, rows, stride, cell, x: x0, y: y0, sloRow } = LATENCY;
  const colX = (c) => x0 + c * stride;
  const rowY = (r) => y0 + r * stride;
  const span = cols * stride;
  const square = (x, y) => `M${x} ${y}h${cell}v${cell}h-${cell}z`;
  const dust = new Map();
  const bands = [];
  const marks = Array.from({ length: cols }, (_, c) => percentiles(c));
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const d = density(c, r);
      if (d > 0.78) {
        bands.push(square(colX(c), rowY(r)));
        continue;
      }
      const level = Math.min(0.85, d * (0.55 + rand() * 0.7));
      const opacity = Math.round((0.05 + level * (t.isDark ? 0.62 : 0.45)) * 12) / 12;
      if (!dust.has(opacity)) dust.set(opacity, []);
      dust.get(opacity).push(square(colX(c), rowY(r)));
    }
  }
  const tape = [...dust.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([opacity, shapes]) => `<path d="${shapes.join("")}" fill="${t.muted}" fill-opacity="${opacity}"/>`);
  tape.push(`<path d="${bands.join("")}" fill="${t.text}" fill-opacity="${t.isDark ? 0.85 : 0.8}"/>`);
  const trace = [];
  for (let c = 0; c < cols; c++) {
    ["p50", "p99"].forEach((key) => {
      const row = marks[c][key];
      const previous = marks[(c + cols - 1) % cols][key];
      const joined = [row];
      for (let r = Math.min(row, previous) + 1; r < Math.max(row, previous); r++) joined.push(r);
      joined.forEach((r) => trace.push(square(colX(c), rowY(r))));
    });
  }
  tape.push(`<path d="${trace.join("")}" fill="${t.accent}"/>`);
  const breaches = marks.map((m, c) => (m.p99 <= sloRow && c % 3 === 0 ? c : -1)).filter((c) => c >= 0);
  breaches.forEach((c) => {
    tape.push(`<circle cx="${colX(c) + cell / 2}" cy="${rowY(Math.max(0, marks[c].p99 - 2)) + cell / 2}" r="1.9" fill="${t.text}"/>`);
  });
  LATENCY.timeouts.forEach(([c, r]) => {
    tape.push(`<circle cx="${colX(c) + cell / 2}" cy="${rowY(r) + cell / 2}" r="1.5" fill="${t.text}" fill-opacity="0.9"/>`);
  });
  const bottom = rowY(rows - 1) + cell;
  const sloY = rowY(sloRow) + cell / 2;
  const profile = Array.from({ length: rows }, (_, r) => {
    let sum = 0;
    for (let c = 0; c < cols; c++) sum += density(c, r);
    return sum / cols;
  });
  const overall = percentileRows(profile);
  const peak = Math.max(...profile);
  const out = [
    `<defs>
<g id="tape">${tape.join("")}</g>
<clipPath id="view"><rect x="${x0 - 1}" y="${y0 - 8}" width="${span - stride + cell + 2}" height="${bottom - y0 + 16}"/></clipPath>
</defs>`,
    `<g clip-path="url(#view)"><g><animateTransform attributeName="transform" type="translate" from="0 0" to="-${span} 0" dur="${LATENCY.seconds}s" repeatCount="indefinite"/><use href="#tape"/><use href="#tape" x="${span}"/></g></g>`,
    `<line x1="${x0}" y1="${sloY}" x2="${LATENCY.separator - 6}" y2="${sloY}" stroke="${t.accent}" stroke-opacity="0.65" stroke-width="1" stroke-dasharray="2 3"/>`,
    `<line x1="${LATENCY.separator}" y1="${y0 - 2}" x2="${LATENCY.separator}" y2="${bottom + 2}" stroke="${t.ring}" stroke-width="1"/>`,
  ];
  [overall.p50, overall.p99].forEach((r) => {
    out.push(`<path d="M${LATENCY.separator - 5} ${rowY(r) - 1} L${LATENCY.separator} ${rowY(r) + cell / 2} L${LATENCY.separator - 5} ${rowY(r) + cell + 1} Z" fill="${t.accent}"/>`);
  });
  profile.forEach((value, r) => {
    const share = value / peak;
    const best = r === overall.p50 || r === overall.p99;
    const width = Math.max(2, Math.round(share * LATENCY.histogramWidth));
    const fill = best ? t.accent : share > 0.8 ? t.text : t.muted;
    const opacity = best ? 1 : share > 0.8 ? 0.85 : 0.55;
    const pulse = best ? '><animate attributeName="opacity" values="1;0.35;1" dur="1.8s" repeatCount="indefinite"/></rect>' : "/>";
    out.push(`<rect x="${LATENCY.histogramX}" y="${rowY(r)}" width="${width}" height="${cell}" rx="0.5" fill="${fill}" fill-opacity="${opacity}"${pulse}`);
  });
  const captionY = bottom + 14;
  [
    [x0, "LATENCY"],
    [LATENCY.histogramX, "P50 P99"],
  ].forEach(([x, label]) => {
    out.push(`<text x="${x}" y="${captionY}" font-size="8" fill="${t.muted}" fill-opacity="0.85" letter-spacing="2" font-family="${MONO}">${label}</text>`);
  });
  out.push(`<text x="${x0 + 2}" y="${sloY - 3}" font-size="7" fill="${t.accent}" fill-opacity="0.9" letter-spacing="1.5" font-family="${MONO}">SLO</text>`);
  return out.join("\n");
}

function bannerSvg(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="${BANNER_HEIGHT}" viewBox="0 0 880 ${BANNER_HEIGHT}" role="img" aria-label="Uttkarsh Ruparel. ${escapeXml(TAGLINE)}">
<defs>
<clipPath id="reveal"><rect x="172" y="96" width="${TAGLINE_WIDTH + 4}" height="28"><animate attributeName="width" from="0" to="${TAGLINE_WIDTH + 4}" dur="2.4s" begin="0s" fill="freeze"/></rect></clipPath>
</defs>
<rect x="0.5" y="0.5" width="879" height="${BANNER_HEIGHT - 1}" rx="${RADIUS}" fill="${t.bg}" stroke="${t.border}"/>
<circle cx="96" cy="82" r="49.5" fill="none" stroke="${t.ring}"/>
<image href="data:image/png;base64,${LOGO}" x="48" y="34" width="96" height="96"/>
<text x="172" y="80" font-size="46" font-weight="200" fill="${t.text}" font-family="${FONT}" letter-spacing="-1">Uttkarsh Ruparel</text>
<g clip-path="url(#reveal)"><text x="172" y="114" font-size="18" font-weight="300" fill="${t.muted}" font-family="${FONT}" textLength="${TAGLINE_WIDTH}" lengthAdjust="spacing">${escapeXml(TAGLINE)}</text></g>
<rect x="${172 + TAGLINE_WIDTH}" y="97" width="2" height="20" rx="1" fill="${t.accent}"><animate attributeName="x" from="172" to="${172 + TAGLINE_WIDTH}" dur="2.4s" begin="0s" fill="freeze"/><animate attributeName="opacity" values="1;0;1" dur="1s" begin="2.4s" repeatCount="indefinite"/></rect>
${latencyVisual(t)}
</svg>
`;
}

const MARK = { x: 18, y: 18, size: 36 };

const hatchMark = ({ x, y, size }) => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="6 4 52 52" fill="none" stroke-linecap="round" stroke-linejoin="round">
<g transform="translate(32 32) scale(.9) translate(-32 -31)" stroke-width="2.4">
<path d="M13 29l9.5 5L32 29l9.5 5L51 29v7l-9.5 5L32 36l-9.5 5L13 36Z" fill="#c4b5fd" stroke="#c4b5fd"/>
<path d="M13 36l9.5 5L32 36l9.5 5L51 36v8L32 55 13 44ZM32 40v15" stroke="#ffffff"/>
<path d="M13 29V15L32 4l19 11v14l-9.5 5L32 29l-9.5 5ZM13 15l19 11 19-11M32 4v22" stroke="#ffffff"/>
</g>
</svg>`;

function logoMark(project) {
  if (project.slug === "hatch") return hatchMark(MARK);
  const { x, y, size } = MARK;
  const data = readFileSync(`assets/logos/${project.slug}.png`).toString("base64");
  const image = `<image href="data:image/png;base64,${data}" x="${x}" y="${y}" width="${size}" height="${size}"/>`;
  if (project.slug !== "esx") return image;
  return `<clipPath id="mark"><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${RADIUS}"/></clipPath>
<g clip-path="url(#mark)">${image}</g>`;
}

function cardSvg(project) {
  const { accent } = project;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="112" viewBox="0 0 200 112" role="img" aria-label="${escapeXml(project.title)}. ${escapeXml(project.description)}">
<rect x="0.5" y="0.5" width="199" height="111" rx="${RADIUS}" fill="${CARD.bg}" stroke="${CARD.border}"/>
${logoMark(project)}
<path d="M168 18 L178 18 L178 28 M178 18 L166 30" stroke="${accent}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<text x="18" y="82" font-size="18" font-weight="300" fill="${CARD.text}" font-family="${FONT}">${escapeXml(project.title)}</text>
<text x="18" y="98" font-size="10.5" fill="${CARD.muted}" font-family="${FONT}">${escapeXml(project.description)}</text>
</svg>
`;
}

const linkWidth = (label) => Math.ceil(label.length * LINK_SIZE * 0.56);

function linkSvg(t, label) {
  const textLength = linkWidth(label);
  const width = textLength + 22;
  const arrowX = textLength + 8;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="30" viewBox="0 0 ${width} 30" role="img" aria-label="${escapeXml(label)}">
<text x="0" y="17" font-size="${LINK_SIZE}" fill="${t.text}" font-family="${FONT}" textLength="${textLength}" lengthAdjust="spacing">${escapeXml(label)}</text>
<path d="M${arrowX} 15 L${arrowX + 9} 6 M${arrowX + 2} 6 L${arrowX + 9} 6 L${arrowX + 9} 13" stroke="${t.accent}" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<line x1="0" y1="26.5" x2="${width}" y2="26.5" stroke="${t.ring}" stroke-width="1"/>
<line x1="0" y1="26.5" x2="22" y2="26.5" stroke="${t.accent}" stroke-width="1.5"/>
</svg>
`;
}

function introSvg(t) {
  const lines = INTRO_LINES.map(
    (line, i) =>
      `<text x="440" y="${24 + i * 26}" font-size="16" font-weight="300" fill="${t.text}" fill-opacity="0.8" text-anchor="middle" font-family="${FONT}">${escapeXml(line)}</text>`
  ).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="64" viewBox="0 0 880 64" role="img" aria-label="${escapeXml(INTRO_LINES.join(" "))}">
${lines}
</svg>
`;
}

function labelSvg(t, { text }) {
  const labelLength = Math.ceil(text.length * 9.6);
  const gap = 20;
  const lineEnd = 440 - labelLength / 2 - gap;
  const lineStart = 440 + labelLength / 2 + gap;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="28" viewBox="0 0 880 28" role="img" aria-label="${escapeXml(text.toLowerCase())}">
<line x1="0" y1="14.5" x2="${lineEnd}" y2="14.5" stroke="${t.ring}" stroke-width="1"/>
<line x1="${lineStart}" y1="14.5" x2="880" y2="14.5" stroke="${t.ring}" stroke-width="1"/>
<text x="440" y="18" font-size="11" fill="${t.muted}" text-anchor="middle" font-family="${MONO}" textLength="${labelLength}" lengthAdjust="spacing">${escapeXml(text)}</text>
</svg>
`;
}

function luminance(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function stackSvg(t) {
  const size = 28;
  const height = 72;
  const margin = 48;
  const gap = (880 - margin * 2 - ICONS.reduce((sum, icon) => sum + icon.vw, 0)) / (ICONS.length - 1);
  let cursor = margin;
  const positions = ICONS.map((icon) => {
    const x = cursor - icon.dx;
    cursor += icon.vw + gap;
    return x;
  });
  const lift = (fill) => (t.isDark && luminance(fill) < 70 ? "#f5f5f5" : fill);
  const icons = ICONS.map((icon, i) => {
    const x = positions[i];
    const y = (height - size) / 2;
    if (icon.svg) {
      const data = readFileSync(`assets/stack/${icon.svg}.svg`).toString("base64");
      const box = icon.box ?? size;
      const inset = (box - size) / 2;
      return `<image href="data:image/svg+xml;base64,${data}" x="${(x - inset).toFixed(1)}" y="${y - inset}" width="${box}" height="${box}"/>`;
    }
    if (icon.png) {
      const data = readFileSync(`assets/stack/${icon.png}.png`).toString("base64");
      return `<image href="data:image/png;base64,${data}" x="${x.toFixed(1)}" y="${y}" width="${size}" height="${size}"/>`;
    }
    const [minX, minY, boxWidth] = icon.viewBox.split(" ").map(Number);
    const scale = size / boxWidth;
    const shapes = icon.shapes
      .map((shape) => `<path d="${shape.d}" fill="${t.isDark && shape.darkFill ? shape.darkFill : lift(shape.fill)}"/>`)
      .join("");
    return `<g transform="translate(${(x - minX * scale).toFixed(1)} ${(y - minY * scale).toFixed(1)}) scale(${scale.toFixed(4)})">${shapes}</g>`;
  }).join("\n");
  const names = ICONS.map((icon) => icon.name).join(", ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="${height}" viewBox="0 0 880 ${height}" role="img" aria-label="${escapeXml(names)}">
<rect x="0.5" y="0.5" width="879" height="${height - 1}" rx="${RADIUS}" fill="${t.bg}" stroke="${t.border}"/>
${icons}
</svg>
`;
}

mkdirSync("assets", { recursive: true });

for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(`assets/banner-live-${name}.svg`, bannerSvg(theme));
  writeFileSync(`assets/bio-${name}.svg`, introSvg(theme));
  writeFileSync(`assets/stack-set-${name}.svg`, stackSvg(theme));
  for (const label of LABELS) {
    writeFileSync(`assets/divider-${label.slug}-${name}.svg`, labelSvg(theme, label));
  }
  for (const label of LINKS) {
    writeFileSync(`assets/link-${label.toLowerCase()}-${name}.svg`, linkSvg(theme, label));
  }
}
PROJECTS.forEach((project) => {
  writeFileSync(`assets/work-${project.slug}.svg`, cardSvg(project));
});

console.log("assets written");
