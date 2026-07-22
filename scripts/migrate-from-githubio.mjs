/**
 * 将 d:\\githubio\\legacy\\src\\data 中有价值的 JS 数据转为 my-blog Markdown。
 * 用法: node scripts/migrate-from-githubio.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LEGACY = "D:/githubio/legacy/src/data";
const DOCS = path.join(ROOT, "docs");

function loadExport(file, exportName) {
  const raw = fs.readFileSync(path.join(LEGACY, file), "utf8");
  const code = raw
    .replace(/export\s+const\s+(\w+)\s*=/g, "globalThis.__exp_$1 =")
    .replace(/export\s+\{[^}]+\};?/g, "");
  const ctx = { globalThis: {} };
  vm.createContext(ctx);
  vm.runInContext(code + `\n;globalThis.result = globalThis.__exp_${exportName};`, ctx);
  return ctx.globalThis.result;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function write(rel, content) {
  const full = path.join(DOCS, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content.trim() + "\n", "utf8");
  console.log("write", rel);
}

function mdTable(headers, rows) {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map(r => `| ${r.map(c => String(c ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return [head, sep, ...body].join("\n");
}

// --- 教育 ---
function migrateEducation() {
  const world = loadExport("universities.js", "worldUniversities");
  const cities985 = loadExport("985Universities.js", "cities985");
  const uni211 = loadExport("universities211.js", "cities211");

  write(
    "education/index.md",
    `# 教育 · 名校

整理自本地资料库：世界名校速览、中国 985 / 211 分布，方便查阅与旅行/升学规划联动。

- [世界名校 TOP](world-universities.md)
- [985 大学（按城市）](985.md)
- [211 大学](211.md)
`
  );

  const worldRows = (Array.isArray(world) ? world : [])
    .slice(0, 20)
    .map(u => [
      u.ranking ?? "",
      u.name ?? "",
      u.nameEn ?? "",
      u.country ?? "",
      (u.introduction || "").slice(0, 80) + ((u.introduction || "").length > 80 ? "…" : ""),
    ]);
  write(
    "education/world-universities.md",
    `# 世界名校速览

基于资料库中的 QS 相关整理（供个人查阅，排名以官方为准）。

${mdTable(["排名", "中文名", "英文名", "国家/地区", "简介"], worldRows)}
`
  );

  const cities = Object.keys(cities985 || {}).sort();
  let body985 = `# 985 大学（按城市）

共涉及 **${cities.length}** 个城市。\n\n`;
  for (const city of cities) {
    const list = cities985[city] || [];
    body985 += `## ${city}\n\n`;
    body985 +=
      mdTable(
        ["校名", "类型", "全国参考排名", "建校"],
        list.map(u => [u.name, u.type || "", u.ranking ?? "", u.established ?? ""])
      ) + "\n\n";
  }
  write("education/985.md", body985);

  if (uni211) {
    if (Array.isArray(uni211)) {
      write(
        "education/211.md",
        `# 211 大学\n\n${mdTable(
          ["校名", "城市/备注"],
          uni211.slice(0, 200).map(u => [u.name || u, u.city || u.location || ""])
        )}\n`
      );
    } else if (typeof uni211 === "object") {
      let md = `# 211 大学（按城市）\n\n`;
      for (const city of Object.keys(uni211).sort()) {
        const list = uni211[city] || [];
        md += `## ${city}\n\n`;
        md +=
          mdTable(
            ["校名", "类型"],
            list.map(u => [typeof u === "string" ? u : u.name, u.type || ""])
          ) + "\n\n";
      }
      write("education/211.md", md);
    }
  } else {
    write("education/211.md", `# 211 大学\n\n数据文件结构待补全，可从 legacy 资料库继续导入。\n`);
  }
}

// --- 旅行 ---
function migrateTravel() {
  const a5 = loadExport("attractions5A.js", "attractions5A");
  let museums, food, culture, ethnic;
  try {
    museums = loadExport("museums.js", "museums");
  } catch {
    museums = null;
  }
  try {
    food = loadExport("cityFood.js", "cityFoods");
  } catch {
    food = null;
  }
  try {
    culture = loadExport("cityCulture.js", "cityCulture");
  } catch {
    culture = null;
  }
  try {
    ethnic = loadExport("ethnicGroups.js", "ethnicGroups");
  } catch {
    ethnic = null;
  }

  write(
    "travel/index.md",
    `# 旅行 · 出行

个人整理的国内出行资料：5A 景区、博物馆、美食与人文。可与行程笔记互相引用。

- [5A 景区](attractions-5a.md)
- [博物馆](museums.md)
- [城市美食](city-food.md)
- [人文风俗](city-culture.md)
- [民族概览](ethnic-groups.md)
`
  );

  const cities = Object.keys(a5 || {}).sort();
  let md5 = `# 全国 5A 景区（按城市）\n\n覆盖 **${cities.length}** 个城市条目。\n\n`;
  for (const city of cities) {
    const list = a5[city] || [];
    md5 += `## ${city}\n\n`;
    md5 +=
      mdTable(
        ["景区", "类型", "门票", "简介"],
        list.map(a => [
          a.name,
          a.type || "",
          a.price || (a.isFree ? "免费" : ""),
          (a.description || "").slice(0, 60),
        ])
      ) + "\n\n";
  }
  write("travel/attractions-5a.md", md5);

  if (museums && typeof museums === "object") {
    let md = `# 博物馆精选\n\n`;
    const keys = Object.keys(museums).sort().slice(0, 40);
    for (const city of keys) {
      const list = Array.isArray(museums[city]) ? museums[city] : [museums[city]];
      md += `## ${city}\n\n`;
      md +=
        mdTable(
          ["名称", "门票/开放", "备注"],
          list.slice(0, 30).map(m => [
            m.name || m.title || "",
            m.ticket || m.price || m.openTime || "",
            (m.description || m.intro || "").slice(0, 50),
          ])
        ) + "\n\n";
    }
    write("travel/museums.md", md);
  } else {
    write("travel/museums.md", `# 博物馆精选\n\n待补充。\n`);
  }

  if (food && typeof food === "object") {
    let md = `# 城市美食\n\n`;
    for (const city of Object.keys(food).sort().slice(0, 40)) {
      const items = food[city];
      const list = Array.isArray(items) ? items : items?.foods || [];
      md += `## ${city}\n\n`;
      md +=
        mdTable(
          ["美食/餐厅", "说明"],
          list.slice(0, 20).map(f => [
            typeof f === "string" ? f : f.name || f.dish || "",
            typeof f === "string" ? "" : (f.description || f.note || "").slice(0, 60),
          ])
        ) + "\n\n";
    }
    write("travel/city-food.md", md);
  } else {
    write("travel/city-food.md", `# 城市美食\n\n待补充。\n`);
  }

  if (culture && typeof culture === "object") {
    let md = `# 城市人文风俗\n\n`;
    for (const city of Object.keys(culture).sort().slice(0, 40)) {
      const c = culture[city];
      const cul = c?.culture || c;
      md += `## ${city}\n\n`;
      if (c?.nickname) md += `> 别称：${c.nickname}\n\n`;
      if (typeof cul === "string") {
        md += cul + "\n\n";
      } else if (cul) {
        if (cul.overview) md += `${cul.overview}\n\n`;
        if (Array.isArray(cul.characteristics)) {
          md += `**文化特点**\n\n${cul.characteristics.map(x => `- ${x}`).join("\n")}\n\n`;
        }
        if (Array.isArray(cul.customs)) {
          md += `**风俗习惯**\n\n${cul.customs.map(x => `- ${x}`).join("\n")}\n\n`;
        }
        if (Array.isArray(cul.interestingFacts)) {
          md += `**有趣知识**\n\n${cul.interestingFacts.map(x => `- ${x}`).join("\n")}\n\n`;
        }
        if (cul.bestTime) md += `**最佳季节**：${cul.bestTime}\n\n`;
        if (cul.tips) md += `**小贴士**：${cul.tips}\n\n`;
      }
    }
    write("travel/city-culture.md", md);
  } else {
    write("travel/city-culture.md", `# 城市人文风俗\n\n待补充。\n`);
  }

  if (Array.isArray(ethnic)) {
    write(
      "travel/ethnic-groups.md",
      `# 民族概览\n\n${mdTable(
        ["民族", "简介"],
        ethnic.slice(0, 60).map(e => [
          e.name || e.ethnicity || "",
          (e.description || e.intro || "").slice(0, 80),
        ])
      )}\n`
    );
  } else if (ethnic && typeof ethnic === "object") {
    write(
      "travel/ethnic-groups.md",
      `# 民族概览\n\n${mdTable(
        ["民族", "简介"],
        Object.entries(ethnic)
          .slice(0, 60)
          .map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 80) : (v.description || "").slice(0, 80)])
      )}\n`
    );
  } else {
    write("travel/ethnic-groups.md", `# 民族概览\n\n待补充。\n`);
  }
}

function writeHomeAndAbout() {
  write(
    "index.md",
    `# 渡娘的空间

个人知识库与博客：**教育 · 旅行 · 技术 · 生活**。

线上入口：[https://duniang818.github.io/](https://duniang818.github.io/)  
本地工程：\`D:\\\\my-blog\`（\`mkdocs serve\` 预览）

## 内容分区

| 分区 | 说明 |
| --- | --- |
| [教育 · 名校](education/index.md) | 世界名校、985 / 211 查阅 |
| [旅行 · 出行](travel/index.md) | 5A、博物馆、美食与人文 |
| [技术笔记](tech/index.md) | MkDocs、Obsidian、数据分析等 |
| [生活随笔](life/index.md) | 生活、汽车、Todo 与博文 |

## 最近想法

在 \`docs/blog/posts/\` 写新文章，或直接改各分区 Markdown。推送到 GitHub 后自动发布到根域名。
`
  );

  write(
    "about.md",
    `# 关于

本站由 **MkDocs Material** 构建，托管于 GitHub Pages。

- 仓库：[\`duniang818/duniang818.github.io\`](https://github.com/duniang818/duniang818.github.io)
- 教育/旅行条目：自原 React 资料站 \`legacy\` 迁移整理
- 技术与生活笔记：延续原 Obsidian / MkDocs 写作习惯

写作原则：本地 Markdown 为唯一源，本地预览通过后推送上线。
`
  );

  // tech index linking existing tools/analysis
  write(
    "tech/index.md",
    `# 技术笔记

- [工具索引](../tools/tools-index.md)
- [MkDocs 搭建](../tools/如何利用Mkdocs+Material+GithubPages搭建个人博客.md)
- [配置 MkDocs](../tools/配置mkdocs.md)
- [Obsidian](../tools/obsidian.md)
- [分析索引](../analysis/analysis-index.md)
- [Superset 源码部署](../analysis/0%20Xset%204.0.0在Windows上源码部署.md)
`
  );

  write(
    "life/index.md",
    `# 生活随笔

- [生活索引](life-index.md)（若存在旧页）
- [汽车](../car/car-index.md)
- [Todo](../todos/todos-index.md)
- [博客索引](../blog/blog-index.md)
- [文章列表](../blog/posts/index.md)
`
  );
}

function main() {
  if (!fs.existsSync(LEGACY)) {
    console.error("找不到 legacy 数据目录:", LEGACY);
    process.exit(1);
  }
  migrateEducation();
  migrateTravel();
  writeHomeAndAbout();
  console.log("迁移完成");
}

main();
