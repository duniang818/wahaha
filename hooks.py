"""MkDocs hooks：构建前生成文章索引"""
import subprocess
from pathlib import Path


def on_startup(command, dirty, **kwargs):
    root = Path(__file__).resolve().parent
    script = root / "scripts" / "build-posts-index.mjs"
    if script.exists():
        subprocess.run(["node", str(script)], cwd=root, check=False)
