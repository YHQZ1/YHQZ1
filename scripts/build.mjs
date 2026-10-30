import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const THEMES = {
  dark: {
    bg: "#0a0a0a",
    border: "#1f1f1f",
    ring: "#2a2a2a",
    text: "#f5f5f5",
    muted: "#8a8a8a",
    accent: "#8ab4f8",
  },
  light: {
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

const FONT = "Raleway, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const LOGO = readFileSync("assets/logo.png").toString("base64");

const PROJECTS = [
  {
    title: "kprobe",
    description: "Kernel-level flight recorder. eBPF, causal graphs, replay.",
    accent: "#F0980A",
  },
  {
    title: "ESX",
    description: "A stock exchange from scratch. Eight Go services.",
    accent: "#00A0E0",
  },
  {
    title: "Provenance",
    description: "Plastic EPR compliance. OCR and RAG, human-reviewed.",
    accent: "#4A9B58",
  },
  {
    title: "Hatch",
    description: "Render-style deploys into your own AWS account.",
    accent: "#F5F5F5",
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

const GRAPH_NODES = [
  [744, 52],
  [796, 34],
  [836, 68],
  [768, 90],
  [820, 111],
  [752, 130],
];
const GRAPH_EDGES = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 3],
  [3, 4],
  [2, 4],
  [3, 5],
  [4, 5],
];
const GRAPH_ROUTES = [
  { nodes: [0, 1, 2, 4], duration: 4.6 },
  { nodes: [5, 3, 1], duration: 4 },
  { nodes: [0, 3, 4], duration: 3.4 },
];

function graphSvg(t) {
  const edges = GRAPH_EDGES.map(([a, b]) => {
    const [x1, y1] = GRAPH_NODES[a];
    const [x2, y2] = GRAPH_NODES[b];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.muted}" stroke-opacity="0.35" stroke-width="1"/>`;
  }).join("");

  const nodes = GRAPH_NODES.map(
    ([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="4.5" fill="${t.bg}" stroke="${t.muted}" stroke-opacity="0.7" stroke-width="1.25"/>`
  ).join("");

  const [pulseX, pulseY] = GRAPH_NODES[4];
  const pulse = `<circle cx="${pulseX}" cy="${pulseY}" r="4.5" fill="none" stroke="${t.accent}" stroke-width="1.25"><animate attributeName="r" from="4.5" to="18" dur="2.8s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" from="0.8" to="0" dur="2.8s" repeatCount="indefinite"/></circle><circle cx="${pulseX}" cy="${pulseY}" r="4.5" fill="${t.accent}"/>`;

  const packets = GRAPH_ROUTES.map(({ nodes: route, duration }) => {
    const path = route
      .map((n, i) => `${i === 0 ? "M" : "L"}${GRAPH_NODES[n][0]},${GRAPH_NODES[n][1]}`)
      .join(" ");
    return `<circle r="2.5" fill="${t.accent}"><animateMotion path="${path}" dur="${duration}s" repeatCount="indefinite"/></circle>`;
  }).join("");

  return `${edges}${nodes}${pulse}${packets}`;
}

function bannerSvg(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="${BANNER_HEIGHT}" viewBox="0 0 880 ${BANNER_HEIGHT}" role="img" aria-label="Uttkarsh Ruparel. ${escapeXml(TAGLINE)}">
<defs>
<clipPath id="reveal"><rect x="148" y="106" width="${TAGLINE_WIDTH + 4}" height="28"><animate attributeName="width" from="0" to="${TAGLINE_WIDTH + 4}" dur="2.4s" begin="0s" fill="freeze"/></rect></clipPath>
</defs>
<rect x="0.5" y="0.5" width="879" height="${BANNER_HEIGHT - 1}" rx="${RADIUS}" fill="${t.bg}" stroke="${t.border}"/>
<circle cx="92" cy="72" r="37" fill="none" stroke="${t.ring}"/>
<image href="data:image/png;base64,${LOGO}" x="56" y="36" width="72" height="72"/>
<text x="148" y="88" font-size="46" font-weight="200" fill="${t.text}" font-family="${FONT}" letter-spacing="-1">Uttkarsh Ruparel</text>
<g clip-path="url(#reveal)"><text x="148" y="124" font-size="18" font-weight="300" fill="${t.muted}" font-family="${FONT}" textLength="${TAGLINE_WIDTH}" lengthAdjust="spacing">${escapeXml(TAGLINE)}</text></g>
<rect x="${148 + TAGLINE_WIDTH}" y="107" width="2" height="20" rx="1" fill="${t.accent}"><animate attributeName="x" from="148" to="${148 + TAGLINE_WIDTH}" dur="2.4s" begin="0s" fill="freeze"/><animate attributeName="opacity" values="1;0;1" dur="1s" begin="2.4s" repeatCount="indefinite"/></rect>
${graphSvg(t)}
</svg>
`;
}

function cardSvg(project, index) {
  const { accent } = project;
  const number = String(index + 1).padStart(2, "0");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="96" viewBox="0 0 400 96" role="img" aria-label="${escapeXml(project.title)}. ${escapeXml(project.description)}">
<rect x="0.5" y="0.5" width="399" height="95" rx="${RADIUS}" fill="${CARD.bg}" stroke="${CARD.border}"/>
<text x="22" y="28" font-size="10" fill="${accent}" font-family="${MONO}" letter-spacing="2">${number}</text>
<text x="22" y="56" font-size="21" font-weight="300" fill="${CARD.text}" font-family="${FONT}">${escapeXml(project.title)}</text>
<path d="M360 22 L372 22 L372 34 M372 22 L358 36" stroke="${accent}" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<text x="22" y="77" font-size="12" fill="${CARD.muted}" font-family="${FONT}">${escapeXml(project.description)}</text>
</svg>
`;
}

mkdirSync("assets", { recursive: true });

for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(`assets/banner-${name}.svg`, bannerSvg(theme));
}
PROJECTS.forEach((project, index) => {
  writeFileSync(`assets/card-${project.title.toLowerCase()}.svg`, cardSvg(project, index));
});

console.log(`wrote 2 banners and ${PROJECTS.length} cards`);
