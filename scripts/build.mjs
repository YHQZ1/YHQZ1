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
  "I'm a CS undergrad at SIT Pune, but my stack doesn't know that.",
  "I build backend systems the way they're supposed to be built. Then I benchmark them.",
];

const LABELS = [
  { slug: "selected", number: "01", text: "SELECTED WORK" },
  { slug: "stack", number: "02", text: "STACK" },
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

const FRACTAL_ROWS = 32;
const FRACTAL_COLS = FRACTAL_ROWS * 2 - 1;
const FRACTAL_CELL = 3;
const FRACTAL_STRIDE = 4;

function ruleNinety() {
  let row = Array(FRACTAL_COLS).fill(0);
  row[FRACTAL_ROWS - 1] = 1;
  const grid = [row];
  for (let r = 1; r < FRACTAL_ROWS; r++) {
    row = row.map((_, i) => (row[i - 1] || 0) ^ (row[i + 1] || 0));
    grid.push(row);
  }
  return grid;
}

function fractalVisual(t) {
  const width = FRACTAL_COLS * FRACTAL_STRIDE - (FRACTAL_STRIDE - FRACTAL_CELL);
  const x0 = 548 + (284 - width) / 2;
  const y0 = 82 - (FRACTAL_ROWS * FRACTAL_STRIDE - (FRACTAL_STRIDE - FRACTAL_CELL)) / 2;
  const cells = [];
  ruleNinety().forEach((row, r) => {
    row.forEach((alive, c) => {
      if (!alive) return;
      const top = r === 0;
      const x = x0 + c * FRACTAL_STRIDE;
      const y = y0 + r * FRACTAL_STRIDE;
      cells.push(
        `<rect x="${x}" y="${y}" width="${FRACTAL_CELL}" height="${FRACTAL_CELL}" rx="0.5" fill="${top ? t.accent : t.muted}" fill-opacity="${top ? 1 : t.isDark ? 0.55 : 0.45}"${top ? ">" + '<animate attributeName="opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite"/></rect>' : "/>"}`
      );
    });
  });
  return cells.join("");
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
${fractalVisual(t)}
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

function cardSvg(project, index) {
  const { accent } = project;
  const number = String(index + 1).padStart(2, "0");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="112" viewBox="0 0 200 112" role="img" aria-label="${escapeXml(project.title)}. ${escapeXml(project.description)}">
<rect x="0.5" y="0.5" width="199" height="111" rx="${RADIUS}" fill="${CARD.bg}" stroke="${CARD.border}"/>
${logoMark(project)}
<text x="66" y="40" font-size="10" fill="${accent}" font-family="${MONO}" letter-spacing="2">${number}</text>
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

function labelSvg(t, { number, text }) {
  const label = `${number}  ${text}`;
  const labelLength = Math.ceil(label.length * 9.6);
  const gap = 20;
  const lineEnd = 440 - labelLength / 2 - gap;
  const lineStart = 440 + labelLength / 2 + gap;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="28" viewBox="0 0 880 28" role="img" aria-label="${escapeXml(text.toLowerCase())}">
<line x1="0" y1="14.5" x2="${lineEnd}" y2="14.5" stroke="${t.ring}" stroke-width="1"/>
<line x1="${lineStart}" y1="14.5" x2="880" y2="14.5" stroke="${t.ring}" stroke-width="1"/>
<text x="440" y="18" font-size="11" fill="${t.muted}" text-anchor="middle" font-family="${MONO}" textLength="${labelLength}" lengthAdjust="spacing"><tspan fill="${t.accent}">${number}</tspan>  ${escapeXml(text)}</text>
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
  writeFileSync(`assets/banner-fractal-${name}.svg`, bannerSvg(theme));
  writeFileSync(`assets/intro-${name}.svg`, introSvg(theme));
  writeFileSync(`assets/stack-even-${name}.svg`, stackSvg(theme));
  for (const label of LABELS) {
    writeFileSync(`assets/label-${label.slug}-${name}.svg`, labelSvg(theme, label));
  }
  for (const label of LINKS) {
    writeFileSync(`assets/link-${label.toLowerCase()}-${name}.svg`, linkSvg(theme, label));
  }
}
PROJECTS.forEach((project, index) => {
  writeFileSync(`assets/row-${project.slug}.svg`, cardSvg(project, index));
});

console.log("assets written");
