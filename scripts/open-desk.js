import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../author-desk.html");
const url = `file:///${file.replace(/\\/g, "/")}`;
spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
console.log("已打开作者发布台:", file);
