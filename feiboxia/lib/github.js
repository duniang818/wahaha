/**
 * 将 Markdown 提交到用户的 GitHub Pages / MkDocs 仓库
 */
export async function commitFileToGithub({
  token,
  repo,
  branch = "main",
  path: filePath,
  content,
  message,
}) {
  if (!token) throw new Error("未配置 GitHub Token");
  if (!repo || !repo.includes("/")) {
    throw new Error("GitHub 仓库格式应为 owner/repo");
  }

  const api = `https://api.github.com/repos/${repo}/contents/${encodeURI(filePath).replace(/%2F/g, "/")}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "feiboxia",
  };

  let sha;
  const getRes = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers });
  if (getRes.status === 200) {
    const cur = await getRes.json();
    sha = cur.sha;
  } else if (getRes.status !== 404) {
    const t = await getRes.text();
    throw new Error(`读取 GitHub 文件失败: ${getRes.status} ${t.slice(0, 300)}`);
  }

  const body = {
    message: message || `docs: 飞博虾发布 ${filePath}`,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(api, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await putRes.text();
  if (!putRes.ok) {
    throw new Error(`写入 GitHub 失败: ${putRes.status} ${text.slice(0, 400)}`);
  }
  let json = {};
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return {
    path: filePath,
    htmlUrl: json?.content?.html_url || `https://github.com/${repo}/blob/${branch}/${filePath}`,
    commitSha: json?.commit?.sha,
  };
}

/**
 * 本机模式：直接写 docs/ 并用 git 提交推送（作者自己的博客）
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./tenant.js";

export function writeLocalAndMaybePush({ rel, content, title, push = true }) {
  const outPath = path.join(ROOT, "docs", rel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, "utf8");

  const result = { path: `docs/${rel}`, pushed: false };
  if (!push) return result;

  const add = spawnSync("git", ["add", path.join("docs", rel), "sync/feishu-map.json"], {
    cwd: ROOT,
    shell: process.platform === "win32",
    encoding: "utf8",
  });
  spawnSync(
    "git",
    ["commit", "-m", `docs: 飞博虾发布《${title || rel}》`],
    { cwd: ROOT, shell: process.platform === "win32", encoding: "utf8" }
  );
  const pushR = spawnSync("git", ["push", "origin", "HEAD"], {
    cwd: ROOT,
    shell: process.platform === "win32",
    encoding: "utf8",
    stdio: "inherit",
  });
  result.pushed = pushR.status === 0;
  result.addStatus = add.status;
  return result;
}
