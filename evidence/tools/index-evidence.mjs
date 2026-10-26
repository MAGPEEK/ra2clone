#!/usr/bin/env node
// Builds a markdown table indexing every REA CLI JSON result in evidence/ra2-gamemd/.
// Usage: node evidence/tools/index-evidence.mjs [dir] [--json]
//   --json  print a JSON array of row objects instead of markdown (used by crosscheck.mjs)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const wantJson = args.includes("--json");
const dir = resolve(args.find((a) => !a.startsWith("--")) ?? join(here, "..", "ra2-gamemd"));

/** Strip REA progress lines (they precede the JSON document) and parse. */
export function parseReaJson(text) {
  const body = text
    .split(/\r?\n/)
    .filter((line) => !line.includes("rea_progress"))
    .join("\n")
    .trim();
  return JSON.parse(body);
}

function fmtRange(r) {
  if (!r || typeof r !== "object") return "";
  const start = r.start ?? r.min ?? r.from ?? r.begin;
  const end = r.end ?? r.max ?? r.to ?? r.last;
  if (start === undefined) return JSON.stringify(r);
  return end === undefined ? String(start) : `${start}-${end}`;
}

function describeParams(params) {
  if (!params || typeof params !== "object") return "";
  if (params.address) return String(params.address);
  if (params.procedure && Object.keys(params).length === 1) return String(params.procedure);
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    parts.push(`${k}=${s.length > 60 ? s.slice(0, 57) + "..." : s}`);
  }
  return parts.join(", ");
}

export function indexFile(path, name) {
  const row = { file: name, size: statSync(path).size };
  let doc;
  try {
    doc = parseReaJson(readFileSync(path, "utf8"));
  } catch (e) {
    return { ...row, status: "unparseable", error: e.message };
  }
  if (doc && doc.error !== undefined && !doc.evidence_id) {
    const issue = doc.details?.issues?.[0]?.message ?? doc.message ?? "";
    const op = doc.details?.operation ?? doc.recovery?.operation ?? "";
    // recover the address from the issue message when present
    const m = /requested address: (0x[0-9a-fA-F]+)/.exec(issue);
    return {
      ...row,
      status: "error",
      operation: op,
      params: m ? m[1] : "",
      code: doc.code ?? "unknown",
      message: issue,
    };
  }
  const out = {
    ...row,
    status: "ok",
    operation: doc.operation ?? "",
    params: describeParams(doc.parameters),
    evidence_id: doc.evidence_id ?? "",
  };
  const nr = doc.normalized_result;
  if (nr && typeof nr === "object" && !Array.isArray(nr) && nr.procedure) {
    const p = nr.procedure;
    out.procedure = p.name ?? "";
    const ranges = p.body?.ranges ?? [];
    out.range = Array.isArray(ranges) ? ranges.map(fmtRange).join(", ") : fmtRange(ranges);
    out.callers = Array.isArray(nr.callers) ? nr.callers.length : "";
    out.callees = Array.isArray(nr.callees) ? nr.callees.length : "";
  } else if (Array.isArray(nr)) {
    out.summary = `${nr.length} result(s)`;
  }
  return out;
}

export function indexDir(dir) {
  return readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".json"))
    .sort()
    .map((f) => indexFile(join(dir, f), f));
}

export function toMarkdown(rows) {
  const lines = [
    "| File | Operation | Address / parameters | evidence_id | Procedure (body range) | Callers | Callees |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const r of rows) {
    const id =
      r.status === "ok" ? r.evidence_id : r.status === "error" ? `error: ${r.code}` : `unparseable: ${r.error}`;
    const proc = r.procedure ? `${r.procedure} (${r.range})` : r.summary ?? (r.status === "error" ? r.message.split(";")[0] : "");
    lines.push(
      `| \`${r.file}\` | ${r.operation ?? ""} | ${r.params ?? ""} | ${id} | ${proc} | ${r.callers ?? ""} | ${r.callees ?? ""} |`,
    );
  }
  return lines.join("\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rows = indexDir(dir);
  if (wantJson) console.log(JSON.stringify(rows, null, 2));
  else console.log(toMarkdown(rows));
}
