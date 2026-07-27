#!/usr/bin/env node
/**
 * 构建首页文章索引 + 日历热力图日聚合
 * - 无 frontmatter 时从正文 H1 / 路径 / mtime 推断
 * - 标签不全时按栏目归纳，必要时归「其他」
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");
const OUT = path.join(DOCS, "javascripts", "posts-index.json");
const OUT_PREVIEW = path.join(DOCS, "javascripts", "posts-index-preview.json");
const OUT_CAL = path.join(DOCS, "javascripts", "calendar-index.json");

const NAV_TAGS = ["博客", "教育", "旅行", "技术", "生活", "飞博虾", "其他"];

const DIR_TO_NAV = {
  "blog/posts": "博客",
  blog: "博客",
  education: "教育",
  travel: "旅行",
  tech: "技术",
  tools: "技术",
  analysis: "技术",
  life: "生活",
  car: "生活",
  todos: "生活",
  feiboxia: "飞博虾",
  gitfork: "技术",
};

/** 文件名 / 路径关键词 → 补充标签 */
const KEYWORD_TAGS = [
  [/985/, "985"],
  [/211/, "211"],
  [/university|universit|名校|大学/, "大学"],
  [/museum|博物/, "博物馆"],
  [/5a|景区|attractions/, "景区"],
  [/food|美食/, "美食"],
  [/culture|风俗|人文/, "人文"],
  [/ethnic|民族/, "民族"],
  [/feishu|飞书/, "飞书"],
  [/feiboxia|飞博虾/, "飞博虾"],
  [/github|pages|mkdocs/, "建站"],
  [/obsidian/, "Obsidian"],
  [/giscus|评论/, "评论"],
  [/debian|windows|docker|部署/, "部署"],
  [/analytics|不蒜子|阅读量|pv\b/, "统计"],
  [/welcome|公告/, "公告"],
];

const SKIP_DIRS = new Set(["private", "javascripts", "stylesheets", "calendar", "assets"]);
const SKIP_FILES = new Set([
  "index.md",
  "about.md",
  "blog-index.md",
  "gitfork-index.md",
  "todos-index.md",
  "tools-index.md",
  "analysis-index.md",
  "life-index.md",
  "car-index.md",
]);

function parseFrontmatter(text) {
  if (!text.startsWith("---")) return { meta: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end < 0) return { meta: {}, body: text };
  const raw = text.slice(4, end).trim();
  const body = text.slice(end + 4);
  const meta = {};
  let listKey = null;
  for (const line of raw.split("\n")) {
    const ln = line.replace(/\r$/, "");
    if (/^\s*-\s+/.test(ln) && listKey) {
      meta[listKey] = meta[listKey] || [];
      meta[listKey].push(ln.replace(/^\s*-\s+/, "").trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    const m = ln.match(/^([a-zA-Z0-9_ ]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim();
    if (val === "") {
      listKey = key;
      meta[key] = [];
    } else if (val.startsWith("[") && val.endsWith("]")) {
      listKey = null;
      meta[key] = val
        .slice(1, -1)
        .split(",")
        .map(s => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      listKey = null;
      meta[key] = val.replace(/^["']|["']$/g, "");
    }
  }
  return { meta, body };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function normalizeDate(meta, fullPath) {
  const candidates = [
    meta.date,
    meta["creation date"],
    meta.created,
    meta["date.created"],
  ];
  for (const c of candidates) {
    if (!c) continue;
    const s = String(c).trim();
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    const m2 = s.match(/^(\d{4})[\/.](\d{1,2})[\/.](\d{1,2})/);
    if (m2) {
      return `${m2[1]}-${pad2(m2[2])}-${pad2(m2[3])}`;
    }
  }
  const mtime = fs.statSync(fullPath).mtime;
  return `${mtime.getFullYear()}-${pad2(mtime.getMonth() + 1)}-${pad2(mtime.getDate())}`;
}

function titleFromBody(body, fallback) {
  const m = String(body).match(/^#\s+(.+)$/m);
  if (m) {
    return m[1].replace(/[#`]/g, "").trim().slice(0, 120);
  }
  return fallback;
}

function looksLikeFilename(title) {
  if (!title) return true;
  if (/^[a-z0-9._-]+$/i.test(title)) return true;
  if (title.includes(".") && !/[\u4e00-\u9fff]/.test(title)) return true;
  return false;
}

function countTasks(meta, body) {
  const fmTotal = Number(meta.tasks_total || meta.tasksTotal || 0);
  const fmDone = Number(meta.tasks_done || meta.tasksDone || 0);
  if (fmTotal > 0) {
    return {
      tasksTotal: fmTotal,
      tasksDone: Math.min(Math.max(0, fmDone), fmTotal),
    };
  }

  let total = 0;
  let done = 0;
  for (const line of String(body).split("\n")) {
    if (/^\s*[-*]\s+\[[xX]\]/.test(line)) {
      total += 1;
      done += 1;
    } else if (/^\s*[-*]\s+\[[\s]\]/.test(line)) {
      total += 1;
    }
  }
  if (total === 0) return { tasksTotal: 1, tasksDone: 1 };
  return { tasksTotal: total, tasksDone: done };
}

function inferNav(rel, meta) {
  if (meta.nav && NAV_TAGS.includes(meta.nav)) return meta.nav;
  const dir = path.dirname(rel).replace(/\\/g, "/");
  if (DIR_TO_NAV[dir]) return DIR_TO_NAV[dir];
  const top = dir.split("/")[0];
  if (DIR_TO_NAV[top]) return DIR_TO_NAV[top];
  return "其他";
}

function inferExtraTags(rel, title, body) {
  const hay = `${rel} ${title} ${String(body).slice(0, 800)}`.toLowerCase();
  const tags = [];
  for (const [re, tag] of KEYWORD_TAGS) {
    if (re.test(hay) || re.test(rel) || re.test(title)) tags.push(tag);
  }
  return tags;
}

function normalizeTags(nav, meta, rel, title, body) {
  const raw = Array.isArray(meta.tags)
    ? meta.tags
    : meta.tags
      ? [String(meta.tags)]
      : [];
  const cleaned = raw.map(t => String(t).trim()).filter(Boolean);
  const extras = inferExtraTags(rel, title, body);
  const merged = [nav, ...cleaned, ...extras].filter(t => t && t !== "其他");
  const uniq = [...new Set(merged)];
  // 除导航标签外没有任何实质标签 → 仅保留栏目；栏目已是「其他」则保持
  if (uniq.length === 0) return [nav || "其他"];
  return uniq;
}

function excerpt(meta, body) {
  if (meta.description) return String(meta.description);
  const plain = body
    .replace(/^#+\s+.+$/m, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[#>*`_~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain;
}

function thumb(meta, body, rel) {
  if (meta.image) return String(meta.image);
  const m = body.match(/!\[[^\]]*]\(([^)]+)\)/);
  if (!m) return "";
  let u = m[1].trim().replace(/^["']|["']$/g, "");
  if (u.startsWith("http")) return u;
  if (u.includes("<") || u.includes("{")) return "";
  const dir = path.dirname(rel).replace(/\\/g, "/");
  return `${dir}/${u}`.replace(/\/+/g, "/");
}

function walk(dir, base = "", out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full, rel, out);
    } else if (name.endsWith(".md") && !SKIP_FILES.has(name)) {
      out.push(rel.replace(/\\/g, "/"));
    }
  }
  return out;
}

function isoWeekKey(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  const week1 = new Date(d.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${pad2(week)}`;
}

function buildCalendar(posts) {
  const days = {};
  for (const p of posts) {
    if (!p.date) continue;
    if (!days[p.date]) {
      days[p.date] = {
        date: p.date,
        count: 0,
        tasksTotal: 0,
        tasksDone: 0,
        posts: [],
      };
    }
    const day = days[p.date];
    day.count += 1;
    day.tasksTotal += p.tasksTotal || 0;
    day.tasksDone += p.tasksDone || 0;
    day.posts.push({
      title: p.title,
      url: p.url,
      path: p.path,
      nav: p.nav,
      tags: p.tags,
      excerpt: p.excerpt,
      thumb: p.thumb,
      tasksTotal: p.tasksTotal,
      tasksDone: p.tasksDone,
      completion: p.completion,
    });
  }

  for (const d of Object.values(days)) {
    d.completion = d.tasksTotal
      ? Math.round((d.tasksDone / d.tasksTotal) * 100)
      : 0;
    d.intensity = d.tasksTotal || d.count;
  }

  const dates = Object.keys(days).sort();
  const now = new Date();
  const thisYear = now.getFullYear();
  let rangeStart = dates[0] || `${thisYear}-01-01`;
  let rangeEnd = dates[dates.length - 1] || `${thisYear}-12-31`;
  const y0 = Number(rangeStart.slice(0, 4));
  const y1 = Math.max(Number(rangeEnd.slice(0, 4)), thisYear);
  rangeStart = `${y0}-01-01`;
  rangeEnd = `${y1}-12-31`;

  const archives = {};
  for (const d of Object.values(days)) {
    const y = d.date.slice(0, 4);
    const ym = d.date.slice(0, 7);
    const q = `${y}-Q${Math.ceil(Number(d.date.slice(5, 7)) / 3)}`;
    const w = isoWeekKey(d.date);
    archives[y] = archives[y] || {
      year: y,
      months: {},
      quarters: {},
      weeks: {},
      days: 0,
      intensity: 0,
      posts: 0,
    };
    archives[y].days += 1;
    archives[y].intensity += d.intensity;
    archives[y].posts += d.count;
    archives[y].months[ym] = archives[y].months[ym] || { intensity: 0, posts: 0 };
    archives[y].months[ym].intensity += d.intensity;
    archives[y].months[ym].posts += d.count;
    archives[y].quarters[q] = (archives[y].quarters[q] || 0) + d.intensity;
    archives[y].weeks[w] = (archives[y].weeks[w] || 0) + d.intensity;
  }

  return {
    generatedAt: new Date().toISOString(),
    rangeStart,
    rangeEnd,
    maxIntensity: Math.max(1, ...Object.values(days).map(d => d.intensity), 1),
    days,
    archives,
  };
}

const posts = [];
const warnings = [];

for (const rel of walk(DOCS)) {
  const full = path.join(DOCS, rel);
  const text = fs.readFileSync(full, "utf8");
  const { meta, body } = parseFrontmatter(text);
  if (String(meta.draft || "").toLowerCase() === "true") continue;
  if (String(meta.visibility || "public").toLowerCase() === "private") continue;

  const nav = inferNav(rel, meta);
  const basename = path.basename(rel, ".md");
  let title = meta.title || titleFromBody(body, basename);
  if (looksLikeFilename(title)) {
    const h1 = titleFromBody(body, "");
    if (h1) title = h1;
  }

  const tags = normalizeTags(nav, meta, rel, title, body);
  const date = normalizeDate(meta, full);
  const { tasksTotal, tasksDone } = countTasks(meta, body);
  const slugPath = rel.replace(/\.md$/, "");

  if (!meta.title || !meta.date || !meta.tags) {
    warnings.push({
      path: rel,
      missing: [
        !meta.title && "title",
        !meta.date && "date",
        !meta.tags && "tags",
        !meta.nav && "nav",
      ].filter(Boolean),
      inferred: { title, date, nav, tags },
    });
  }

  posts.push({
    title,
    url: `/${slugPath}/`,
    path: `docs/${rel}`,
    date,
    nav,
    tags,
    excerpt: excerpt(meta, body),
    thumb: thumb(meta, body, rel),
    tasksTotal,
    tasksDone,
    completion: tasksTotal ? Math.round((tasksDone / tasksTotal) * 100) : 0,
  });
}

posts.sort((a, b) => {
  const dc = String(b.date).localeCompare(String(a.date));
  if (dc) return dc;
  return String(a.title).localeCompare(String(b.title), "zh");
});

const navTagsPresent = NAV_TAGS.filter(t => posts.some(p => p.nav === t));
const calendar = buildCalendar(posts);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const payload = {
  generatedAt: new Date().toISOString(),
  navTags: navTagsPresent.length ? navTagsPresent : NAV_TAGS.filter(t => t !== "飞博虾"),
  posts,
  warnings,
};
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf8");
fs.writeFileSync(
  OUT_PREVIEW,
  JSON.stringify(
    {
      generatedAt: payload.generatedAt,
      navTags: payload.navTags,
      total: posts.length,
      posts: posts.slice(0, 6),
    },
    null,
    2
  ),
  "utf8"
);
fs.writeFileSync(OUT_CAL, JSON.stringify(calendar, null, 2), "utf8");

const byNav = {};
for (const p of posts) byNav[p.nav] = (byNav[p.nav] || 0) + 1;
console.log(
  `✓ posts-index · ${posts.length} 篇 · calendar ${Object.keys(calendar.days).length} 天`
);
console.log("  栏目:", Object.entries(byNav).map(([k, v]) => `${k}:${v}`).join(" · "));
if (warnings.length) {
  console.log(`  ⚠ ${warnings.length} 篇缺 frontmatter（已推断，可用 scripts/normalize-post-meta.mjs 写回）`);
}
