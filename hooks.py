"""MkDocs hooks：构建前生成文章索引；修复导航/目录/飞书标题"""
import re
import subprocess
from pathlib import Path


def on_startup(command, dirty, **kwargs):
    root = Path(__file__).resolve().parent
    script = root / "scripts" / "build-posts-index.mjs"
    if script.exists():
        subprocess.run(["node", str(script)], cwd=root, check=False)


def on_page_markdown(markdown, *, page, config, files, **kwargs):
    """Blog 插件或 frontmatter 可能 hide 导航/目录，统一恢复。"""
    hide = page.meta.get("hide", [])
    if isinstance(hide, list):
        page.meta["hide"] = [h for h in hide if h not in ("navigation", "toc")]

    src = page.file.src_uri.replace("\\", "/")
    if not src.endswith(".md"):
        return markdown

    # 去掉飞书残留的 title/readonly 块，避免干扰 TOC
    body = markdown
    body = re.sub(r"^<title>.*?</title>\s*", "", body, count=1, flags=re.I | re.M)
    body = re.sub(r"<readonly-block[^>]*>.*?</readonly-block>", "", body, flags=re.I | re.S)
    body = re.sub(r"^目录\s*$", "", body, flags=re.M)

    # 多个一级标题会导致 Material TOC 为空：保留首个 #，其余降为 ##
    lines = body.split("\n")
    in_fm = False
    fm_done = False
    h1_seen = False
    out = []
    for line in lines:
        if not fm_done and line.strip() == "---":
            in_fm = not in_fm
            fm_done = fm_done or (not in_fm and len(out) > 0)
            out.append(line)
            continue
        if not fm_done:
            out.append(line)
            continue
        m = re.match(r"^(#{1,6})\s+(.+)$", line)
        if m and len(m.group(1)) == 1:
            if h1_seen:
                out.append("## " + m.group(2))
                continue
            h1_seen = True
        out.append(line)
    return "\n".join(out)
