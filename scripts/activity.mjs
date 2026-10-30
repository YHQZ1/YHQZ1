import { mkdirSync, writeFileSync } from "node:fs";

const USERNAME = "YHQZ1";
const API = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;

const FONT = "Raleway, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const CELL = 13;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT = 20;
const TOP = 62;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const THEMES = {
  dark: {
    bg: "#0a0a0a",
    border: "#1f1f1f",
    text: "#f5f5f5",
    muted: "#8a8a8a",
    levels: ["#151515", "#1d3a68", "#2f5fa8", "#5b8fe0", "#8ab4f8"],
  },
  light: {
    bg: "#fafafa",
    border: "#e5e5e5",
    text: "#1a1a1a",
    muted: "#666666",
    levels: ["#ececec", "#cddffb", "#93b9f7", "#5b9af3", "#2a6fe0"],
  },
};

async function loadContributions() {
  const response = await fetch(API);
  if (!response.ok) throw new Error(`contributions API returned ${response.status}`);
  const data = await response.json();
  return { days: data.contributions, total: data.total.lastYear };
}

function lastYearDays(days) {
  const end = new Date(`${days[days.length - 1].date}T00:00:00Z`);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const window = days.filter((day) => new Date(`${day.date}T00:00:00Z`) >= start);
  return { window, start };
}

function activitySvg(theme, days, total) {
  const { window, start } = lastYearDays(days);
  const weeks = Math.ceil(
    (new Date(`${window[window.length - 1].date}T00:00:00Z`) - start) / 86400000 / 7
  ) + 1;
  const width = LEFT * 2 + weeks * STEP - GAP;
  const height = TOP + 7 * STEP + 56;

  const cells = [];
  const monthLabels = [];
  let lastMonth = -1;

  for (const day of window) {
    const date = new Date(`${day.date}T00:00:00Z`);
    const week = Math.floor((date - start) / 86400000 / 7);
    const weekday = date.getUTCDay();
    const x = LEFT + week * STEP;
    const y = TOP + weekday * STEP;
    cells.push(
      `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="3" fill="${theme.levels[day.level]}"/>`
    );
    if (weekday === 0 && date.getUTCMonth() !== lastMonth && date.getUTCDate() <= 7) {
      lastMonth = date.getUTCMonth();
      monthLabels.push(
        `<text x="${x}" y="${TOP - 10}" font-size="11" fill="${theme.muted}" font-family="${FONT}">${MONTHS[lastMonth]}</text>`
      );
    }
  }

  const legendY = TOP + 7 * STEP + 22;
  const legendRight = width - LEFT;
  const legend = theme.levels
    .map(
      (color, i) =>
        `<rect x="${legendRight - (theme.levels.length - i) * STEP - 34}" y="${legendY - 11}" width="${CELL}" height="${CELL}" rx="3" fill="${color}"/>`
    )
    .join("");

  const activeDays = window.filter((day) => day.count > 0).length;
  const best = Math.max(...window.map((day) => day.count));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${total} contributions on GitHub in the last year">
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="16" fill="${theme.bg}" stroke="${theme.border}"/>
<text x="${LEFT}" y="32" font-size="20" font-weight="300" fill="${theme.text}" font-family="${FONT}">${total.toLocaleString("en-US")} contributions in the last year</text>
<text x="${width - LEFT}" y="32" font-size="12" fill="${theme.muted}" text-anchor="end" font-family="${FONT}">${activeDays} active days · best day ${best}</text>
${monthLabels.join("")}
${cells.join("")}
<text x="${legendRight - theme.levels.length * STEP - 34 - 8}" y="${legendY}" font-size="11" fill="${theme.muted}" text-anchor="end" font-family="${FONT}">Less</text>
${legend}
<text x="${legendRight - 28}" y="${legendY}" font-size="11" fill="${theme.muted}" font-family="${FONT}">More</text>
</svg>
`;
}

const { days, total } = await loadContributions();
mkdirSync("assets", { recursive: true });
for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(`assets/activity-${name}.svg`, activitySvg(theme, days, total));
}
console.log(`wrote activity graphs for ${total} contributions`);
