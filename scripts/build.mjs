import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const THEMES = {
  dark: {
    bg: "#0a0a0a",
    card: "#0f0f0f",
    border: "#1f1f1f",
    ring: "#2a2a2a",
    text: "#f5f5f5",
    muted: "#8a8a8a",
    accent: "#8ab4f8",
  },
  light: {
    bg: "#fafafa",
    card: "#ffffff",
    border: "#e5e5e5",
    ring: "#d4d4d4",
    text: "#1a1a1a",
    muted: "#666666",
    accent: "#4285f4",
  },
};

const FONT = "Raleway, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const LOGO = readFileSync("assets/logo.png").toString("base64");

const PROJECTS = [
  {
    title: "kprobe",
    description:
      "Kernel-level flight recorder for production systems. eBPF probes, causal graphs and replay.",
    tags: ["Rust", "eBPF", "Go", "Neo4j"],
  },
  {
    title: "ESX",
    description:
      "A stock exchange from scratch: eight Go services from order intake to settlement.",
    tags: ["Go", "Kafka", "gRPC", "PostgreSQL"],
  },
  {
    title: "Provenance",
    description:
      "Plastic EPR compliance. OCR and RAG read the paperwork, a person reviews every line.",
    tags: ["Python", "Qdrant", "Kubernetes"],
  },
  {
    title: "Hatch",
    description:
      "Render-style deploys into your own AWS account, with cost guardrails. Being rebuilt.",
    tags: ["Go", "React", "AWS"],
  },
];

const TAGLINE = "If it can fail, I've already thought about how.";
const TAGLINE_WIDTH = 360;
const BANNER_PILLS = [
  "Pune, India",
  "SWE Intern at TraceLink",
  "Organizer at GDG on Campus",
];

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;");

function wrapText(text, maxChars) {
  const lines = [];
  let current = "";
  for (const word of text.split(" ")) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const textWidth = (text, size, factor) => Math.ceil(text.length * size * factor);

const GRAPH_NODES = [
  [616, 88],
  [704, 60],
  [792, 104],
  [654, 158],
  [746, 186],
  [822, 232],
  [674, 236],
];
const GRAPH_EDGES = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 3],
  [3, 4],
  [2, 4],
  [4, 5],
  [3, 6],
  [4, 6],
];
const GRAPH_ROUTES = [
  { nodes: [0, 1, 2, 4, 5], duration: 5.2 },
  { nodes: [6, 3, 1], duration: 4.4 },
  { nodes: [3, 4, 2], duration: 3.8 },
];

function graphSvg(t) {
  const edges = GRAPH_EDGES.map(([a, b]) => {
    const [x1, y1] = GRAPH_NODES[a];
    const [x2, y2] = GRAPH_NODES[b];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${t.muted}" stroke-opacity="0.35" stroke-width="1"/>`;
  }).join("");

  const nodes = GRAPH_NODES.map(
    ([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="5" fill="${t.bg}" stroke="${t.muted}" stroke-opacity="0.7" stroke-width="1.25"/>`
  ).join("");

  const [pulseX, pulseY] = GRAPH_NODES[4];
  const pulse = `<circle cx="${pulseX}" cy="${pulseY}" r="5" fill="none" stroke="${t.accent}" stroke-width="1.25"><animate attributeName="r" from="5" to="20" dur="2.8s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" from="0.8" to="0" dur="2.8s" repeatCount="indefinite"/></circle><circle cx="${pulseX}" cy="${pulseY}" r="5" fill="${t.accent}"/>`;

  const packets = GRAPH_ROUTES.map(({ nodes: route, duration }) => {
    const path = route
      .map((n, i) => `${i === 0 ? "M" : "L"}${GRAPH_NODES[n][0]},${GRAPH_NODES[n][1]}`)
      .join(" ");
    return `<circle r="2.75" fill="${t.accent}"><animateMotion path="${path}" dur="${duration}s" repeatCount="indefinite"/></circle>`;
  }).join("");

  return `${edges}${nodes}${pulse}${packets}`;
}

function bannerSvg(t) {
  let pillX = 56;
  const pills = BANNER_PILLS.map((label) => {
    const width = textWidth(label, 12, 0.58) + 40;
    const svg = `<rect x="${pillX + 0.5}" y="238.5" width="${width}" height="26" rx="13" fill="none" stroke="${t.border}"/><circle cx="${pillX + 14}" cy="251.5" r="3" fill="${t.accent}"/><text x="${pillX + 26}" y="255.5" font-size="12" fill="${t.muted}" font-family="${FONT}">${escapeXml(label)}</text>`;
    pillX += width + 10;
    return svg;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="288" viewBox="0 0 880 288" role="img" aria-label="Uttkarsh Ruparel. ${escapeXml(TAGLINE)}">
<defs>
<clipPath id="reveal"><rect x="56" y="192" width="${TAGLINE_WIDTH + 4}" height="34"><animate attributeName="width" from="0" to="${TAGLINE_WIDTH + 4}" dur="2.4s" begin="0s" fill="freeze"/></rect></clipPath>
</defs>
<rect x="0.5" y="0.5" width="879" height="287" rx="16" fill="${t.bg}" stroke="${t.border}"/>
<circle cx="84" cy="76" r="29" fill="none" stroke="${t.ring}"/>
<image href="data:image/png;base64,${LOGO}" x="56" y="48" width="56" height="56"/>
<text x="56" y="180" font-size="52" font-weight="200" fill="${t.text}" font-family="${FONT}" letter-spacing="-1">Uttkarsh Ruparel</text>
<g clip-path="url(#reveal)"><text x="56" y="216" font-size="20" font-weight="300" fill="${t.muted}" font-family="${FONT}" textLength="${TAGLINE_WIDTH}" lengthAdjust="spacing">${escapeXml(TAGLINE)}</text></g>
<rect x="${56 + TAGLINE_WIDTH}" y="198" width="2" height="22" rx="1" fill="${t.accent}"><animate attributeName="x" from="56" to="${56 + TAGLINE_WIDTH}" dur="2.4s" begin="0s" fill="freeze"/><animate attributeName="opacity" values="1;0;1" dur="1s" begin="2.4s" repeatCount="indefinite"/></rect>
${pills}
${graphSvg(t)}
</svg>
`;
}

function cardSvg(t, project, index) {
  const lines = wrapText(project.description, 56);
  const description = lines
    .map(
      (line, i) =>
        `<text x="28" y="${102 + i * 20}" font-size="13" fill="${t.muted}" font-family="${FONT}">${escapeXml(line)}</text>`
    )
    .join("");

  const tagY = 102 + lines.length * 20 + 12;
  let tagX = 28;
  const tags = project.tags
    .map((tag) => {
      const width = textWidth(tag, 11.5, 0.6) + 24;
      const svg = `<rect x="${tagX + 0.5}" y="${tagY + 0.5}" width="${width}" height="24" rx="12" fill="none" stroke="${t.border}"/><text x="${tagX + 0.5 + width / 2}" y="${tagY + 16.5}" font-size="11.5" fill="${t.muted}" text-anchor="middle" font-family="${FONT}">${escapeXml(tag)}</text>`;
      tagX += width + 8;
      return svg;
    })
    .join("");

  const height = tagY + 24 + 28;
  const number = String(index + 1).padStart(2, "0");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="${height}" viewBox="0 0 440 ${height}" role="img" aria-label="${escapeXml(project.title)}. ${escapeXml(project.description)}">
<rect x="0.5" y="0.5" width="439" height="${height - 1}" rx="12" fill="${t.card}" stroke="${t.border}"/>
<text x="28" y="40" font-size="11" fill="${t.accent}" font-family="${MONO}" letter-spacing="2">${number}</text>
<text x="28" y="72" font-size="24" font-weight="300" fill="${t.text}" font-family="${FONT}">${escapeXml(project.title)}</text>
<path d="M398 34 L412 34 L412 48 M412 34 L396 50" stroke="${t.muted}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
${description}
${tags}
</svg>
`;
}

mkdirSync("assets", { recursive: true });

for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(`assets/banner-${name}.svg`, bannerSvg(theme));
  PROJECTS.forEach((project, index) => {
    const slug = project.title.toLowerCase();
    writeFileSync(`assets/card-${slug}-${name}.svg`, cardSvg(theme, project, index));
  });
}

console.log(`wrote banner and ${PROJECTS.length} cards for ${Object.keys(THEMES).length} themes`);
