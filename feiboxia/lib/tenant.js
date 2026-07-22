/**
 * 飞博虾 — 租户配置（本机 JSON，上架后可换数据库）
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");
export const FEIBOXIA_DIR = path.resolve(__dirname, "..");
export const DATA_DIR = path.join(FEIBOXIA_DIR, "data");
export const TENANTS_FILE = path.join(DATA_DIR, "tenants.json");

export function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TENANTS_FILE)) {
    fs.writeFileSync(TENANTS_FILE, "{}\n", "utf8");
  }
}

export function loadTenants() {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(TENANTS_FILE, "utf8"));
  } catch {
    return {};
  }
}

export function saveTenants(map) {
  ensureDataDir();
  fs.writeFileSync(TENANTS_FILE, JSON.stringify(map, null, 2), "utf8");
}

export function getTenant(tenantId) {
  const all = loadTenants();
  return all[tenantId] || null;
}

export function upsertTenant(tenantId, partial) {
  const all = loadTenants();
  const prev = all[tenantId] || {
    tenantId,
    createdAt: new Date().toISOString(),
    webhookSecret: crypto.randomBytes(24).toString("hex"),
  };
  const next = {
    ...prev,
    ...partial,
    tenantId,
    updatedAt: new Date().toISOString(),
    webhookSecret: partial.webhookSecret || prev.webhookSecret,
  };
  all[tenantId] = next;
  saveTenants(all);
  return next;
}

export function defaultTenantId() {
  return process.env.FEIBOXIA_TENANT_ID || "default";
}

export function loadLocalCms() {
  const p = path.join(ROOT, "sync/feishu-cms.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

export function publicBaseUrl() {
  return (
    process.env.FEIBOXIA_PUBLIC_URL ||
    `http://127.0.0.1:${process.env.FEIBOXIA_PORT || 8787}`
  ).replace(/\/$/, "");
}
