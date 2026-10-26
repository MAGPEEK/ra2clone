#!/usr/bin/env node
// Cross-checks evidence IDs cited in a spec against the REA JSON results in evidence/ra2-gamemd/.
// Usage: node evidence/tools/crosscheck.mjs [spec.md] [evidence-dir] [--out report.md]
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { indexDir } from "./index-evidence.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const positional = args.filter((a, i) => !a.startsWith("--") && i !== outIdx + 1);
const spec = resolve(positional[0] ?? join(here, "..", "..", "docs", "specs", "T-022-movement-speed.md"));
const dir = resolve(positional[1] ?? join(here, "..", "ra2-gamemd"));
const outPath = outIdx >= 0 ? resolve(args[outIdx + 1]) : null;

const ID_RE = /ev_[0-9a-f]{64}/g;

export function crosscheck(specPath, evidenceDir) {
  const specText = readFileSync(specPath, "utf8");
  const cited = new Map(); // id -> line numbers
  specText.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(ID_RE)) {
      if (!cited.has(m[0])) cited.set(m[0], []);
      cited.get(m[0]).push(i + 1);
    }
  });
  // truncated ids like ev_a607860c... in the prose
  const shortRefs = new Set([...specText.matchAll(/ev_([0-9a-f]{6,63})(?![0-9a-f])/g)].map((m) => m[1]));

  const rows = indexDir(evidenceDir);
  const inFiles = new Map(); // id -> [file]
  for (const r of rows) {
    if (r.status === "ok" && r.evidence_id) {
      if (!inFiles.has(r.evidence_id)) inFiles.set(r.evidence_id, []);
      inFiles.get(r.evidence_id).push(r.file);
    }
  }

  const missing = [...cited.keys()].filter((id) => !inFiles.has(id));
  const uncited = [...inFiles.keys()].filter((id) => !cited.has(id));
  const shortUnresolved = [...shortRefs].filter(
    (s) => ![...cited.keys(), ...inFiles.keys()].some((id) => id.startsWith("ev_" + s)),
  );
  const duplicates = [...inFiles.entries()].filter(([, files]) => files.length > 1);

  return { specPath, evidenceDir, rows, cited, inFiles, missing, uncited, shortUnresolved, duplicates };
}

export function report(r) {
  const ok = r.rows.filter((x) => x.status === "ok").length;
  const failed = r.rows.filter((x) => x.status === "error").length;
  const bad = r.rows.filter((x) => x.status === "unparseable").length;
  const L = [];
  L.push(`# Evidence cross-check: ${basename(r.specPath)} vs ${basename(r.evidenceDir)}/*.json`);
  L.push("");
  L.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`evidence/tools/crosscheck.mjs\`.`);
  L.push("");
  L.push("## Counts");
  L.push("");
  L.push(`- JSON files: ${r.rows.length} (successful: ${ok}, failed: ${failed}${bad ? `, unparseable: ${bad}` : ""})`);
  L.push(`- Distinct evidence_ids in files: ${r.inFiles.size}`);
  L.push(`- Distinct evidence_ids cited in spec (full 64-hex form): ${r.cited.size}`);
  L.push(`- Cited but not found in any file: ${r.missing.length}`);
  L.push(`- Present in files but not cited in spec: ${r.uncited.length}`);
  L.push("");
  L.push("## Cited in spec but not found in files");
  L.push("");
  if (!r.missing.length) L.push("None.");
  else for (const id of r.missing) L.push(`- ${id} (spec lines ${r.cited.get(id).join(", ")})`);
  L.push("");
  L.push("## Present in files but not cited in spec");
  L.push("");
  if (!r.uncited.length) L.push("None.");
  else for (const id of r.uncited) L.push(`- ${id} — \`${r.inFiles.get(id).join("`, `")}\``);
  L.push("");
  L.push("## Truncated ids in spec prose (ev_xxxxxxxx...) that match no known id");
  L.push("");
  if (!r.shortUnresolved.length) L.push("None.");
  else for (const s of r.shortUnresolved) L.push(`- ev_${s}...`);
  L.push("");
  L.push("## Same evidence_id in more than one file");
  L.push("");
  if (!r.duplicates.length) L.push("None.");
  else for (const [id, files] of r.duplicates) L.push(`- ${id} — \`${files.join("`, `")}\``);
  L.push("");
  L.push("## Failed runs (no evidence_id)");
  L.push("");
  if (!failed) L.push("None.");
  else for (const x of r.rows.filter((y) => y.status === "error")) L.push(`- \`${x.file}\` — ${x.code}: ${x.message.split(";")[0]}`);
  L.push("");
  L.push("## Cited ids and where they live");
  L.push("");
  L.push("| evidence_id | spec lines | file(s) |");
  L.push("|---|---|---|");
  for (const [id, lines] of r.cited) L.push(`| ${id} | ${lines.join(", ")} | ${(r.inFiles.get(id) ?? ["(missing)"]).map((f) => `\`${f}\``).join(", ")} |`);
  return L.join("\n") + "\n";
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = crosscheck(spec, dir);
  const text = report(r);
  if (outPath) {
    writeFileSync(outPath, text);
    console.log(`wrote ${outPath}`);
  }
  console.log(text);
  process.exitCode = r.missing.length ? 1 : 0;
}
