/**
 * 发布失败 → 晚间 21:00（北京时间）自动重试队列
 */
import fs from "node:fs";
import path from "node:path";
import { extractDocToken } from "./feishu-doc.js";
import { ROOT } from "./tenant.js";

export const QUEUE_FILE = path.join(ROOT, "sync/publish-retry-queue.json");

const EVENING_HOUR = Number(process.env.FEIBOXIA_RETRY_HOUR || 21);

function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return { items: [] };
  try {
    const data = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf8"));
    return { items: Array.isArray(data.items) ? data.items : [] };
  } catch {
    return { items: [] };
  }
}

function saveQueue(data) {
  fs.mkdirSync(path.dirname(QUEUE_FILE), { recursive: true });
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2), "utf8");
}

function itemKey(payload) {
  return (
    payload.doc_token ||
    extractDocToken(payload.doc_url || "") ||
    `${payload.nav_dir}/${payload.slug}`
  );
}

/** 下一晚 21:00 北京时间 */
export function nextEveningRetry(from = new Date()) {
  const nowMs = from.getTime();
  const cstOffset = 8 * 60 * 60 * 1000;
  const cst = new Date(nowMs + cstOffset);
  const y = cst.getUTCFullYear();
  const m = cst.getUTCMonth();
  const d = cst.getUTCDate();
  let targetUtcMs = Date.UTC(y, m, d, EVENING_HOUR - 8, 0, 0, 0);
  if (targetUtcMs <= nowMs) {
    targetUtcMs += 24 * 60 * 60 * 1000;
  }
  return new Date(targetUtcMs);
}

function slimPayload(payload) {
  return {
    action: payload.action || "publish",
    title: payload.title,
    doc_url: payload.doc_url,
    doc_token: payload.doc_token,
    nav_dir: payload.nav_dir,
    slug: payload.slug,
    tags: payload.tags,
    platforms: payload.platforms || "blog",
    base_token: payload.base_token,
    table_id: payload.table_id,
  };
}

export function enqueueRetry(payload, { reason = "发布未成功", blogUrl = "" } = {}) {
  const key = itemKey(payload);
  if (!key) return null;

  const q = loadQueue();
  const retryAt = nextEveningRetry().toISOString();
  const existing = q.items.find(it => it.id === key && it.state !== "done");

  if (existing) {
    existing.payload = slimPayload(payload);
    existing.state = "pending_retry";
    existing.failReason = reason;
    existing.failedAt = new Date().toISOString();
    existing.retryAt = retryAt;
    existing.blogUrl = blogUrl || existing.blogUrl;
    existing.attempts = existing.attempts || 0;
  } else {
    q.items.push({
      id: key,
      payload: slimPayload(payload),
      title: payload.title || payload.slug || "",
      slug: payload.slug,
      navDir: payload.nav_dir,
      blogUrl,
      state: "pending_retry",
      failReason: reason,
      failedAt: new Date().toISOString(),
      retryAt,
      attempts: 0,
      lastNotifyAt: null,
    });
  }

  saveQueue(q);
  console.log(`✓ 已加入晚间重试队列，将于 ${retryAt} 重试 (${reason})`);
  return q.items.find(it => it.id === key);
}

export function completeRetry(payload) {
  const key = itemKey(payload);
  if (!key) return;
  const q = loadQueue();
  let changed = false;
  for (const it of q.items) {
    if (it.id === key && it.state !== "done") {
      it.state = "done";
      it.completedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) saveQueue(q);
}

export function listDueRetries(now = new Date()) {
  const q = loadQueue();
  const t = now.getTime();
  return q.items.filter(
    it => it.state === "pending_retry" && Date.parse(it.retryAt || 0) <= t
  );
}

export function markRetryAttempt(id, patch = {}) {
  const q = loadQueue();
  const it = q.items.find(x => x.id === id);
  if (!it) return null;
  Object.assign(it, patch);
  it.attempts = (it.attempts || 0) + 1;
  it.lastAttemptAt = new Date().toISOString();
  saveQueue(q);
  return it;
}

export function rescheduleRetry(id, reason) {
  const q = loadQueue();
  const it = q.items.find(x => x.id === id);
  if (!it) return null;
  it.state = "pending_retry";
  it.failReason = reason;
  it.retryAt = nextEveningRetry().toISOString();
  saveQueue(q);
  return it;
}

export function markRetryDone(id) {
  const q = loadQueue();
  const it = q.items.find(x => x.id === id);
  if (!it) return null;
  it.state = "done";
  it.completedAt = new Date().toISOString();
  saveQueue(q);
  return it;
}
