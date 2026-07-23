"""MkDocs hooks：构建前生成文章索引；博文页保留左侧导航"""
import subprocess
from pathlib import Path


def on_startup(command, dirty, **kwargs):
    root = Path(__file__).resolve().parent
    script = root / "scripts" / "build-posts-index.mjs"
    if script.exists():
        subprocess.run(["node", str(script)], cwd=root, check=False)


def on_page_markdown(markdown, *, page, config, files, **kwargs):
    """Blog 插件默认 hide: navigation，导致左侧栏空白；博文页恢复导航。"""
    src = page.file.src_uri.replace("\\", "/")
    if src.startswith("blog/posts/") and src.endswith(".md"):
        hide = page.meta.get("hide", [])
        if isinstance(hide, list) and "navigation" in hide:
            page.meta["hide"] = [h for h in hide if h != "navigation"]
    return markdown
