# REA evidence

Raw REA output collected on 2026-10-26 with rea-agents 6.8.0 (Ghidra 12.1.4 provider for native work).
Files are unmodified tool output, except that `rea_progress` lines are still included in some files.

> Do not commit `ra2-gamemd/` to the ra2clone repo. `fn-*.json` and `gamemd.snapshot` contain decompiled
> code and analysis of `gamemd.exe` (see "Do not" in `.github/copilot-instructions.md`). Cite evidence_ids in specs instead.

## ra2-gamemd — `gamemd.exe` (T-022)

Target: `C:\Program Files\EA Games\Command and Conquer Red Alert II\gamemd.exe`
SHA-256 `ddeb66a552040d3a6a660e7d8228a6dbeef3a14a9413239f0ec42d7078c86d48`

| File | REA command | evidence_id | What it shows |
|---|---|---|---|
| `xrefs-speed.json` | `xrefs 0x81d9cc --provider ghidra` | ev_245d8c967e3b8fc714eacb1eaa28021d453a3c0124fb0510d6e7f5d8bb344d2b | References to "Speed": 0x67441f, 0x71464c, 0x7722f5, 0x7e5264 |
| `fn-0x71464c.json` | `function 0x71464c --provider ghidra` | ev_a607860c134d8d4c41b8a119d8809d1a7564cde8fae4596e621996c2d0f4e442 | FUN_00712170: unit `Speed=` read, clamp, scale, store at +0x678 |
| `fn-0x67441f.json` | `function 0x67441f --provider ghidra` | ev_ebf0a4ba301b8e9abe80b65862f7b58993b28234894d26c0dcd97e0ae9248b69 | FUN_006743d0: `[JumpjetControls] Speed` into +0x410 |
| `fn-0x7722f5.json` | `function 0x7722f5 --provider ghidra` | none (error) | "No procedure exists at the requested address" |
| `fn-0x7e5264.json` | `function 0x7e5264 --provider ghidra` | none (error) | Same error; the address is data in .rdata |
| `inspect-artifact.json` | `inspect-artifact` | ev_a30b2b64830956e5b76792041c8a121b426bdc920b6df2f17be4d0f343adddc0 | PE inventory |
| `inspect-pe-imports.json` | `inspect-pe-imports` | see file | 15 import DLLs, imphash md5 2b93d0cf33d4449cc0b6a0db0a52a102 |
| `inspect-pe-resources.json` | `inspect-pe-resources` | see file | Resource directory |
| `inspect-pe-certificates.json` | `inspect-pe-certificates` | see file | Authenticode PKCS#7 structure (not cryptographically checked by REA) |
| `inspect-byte-entropy.json` | `inspect-byte-entropy` | see file | File entropy 6.82; high-entropy runs only near resources/signature |
| `inspect-desktop-application.md` | `inspect-desktop-application <game folder>` | ev_742030dba4af483b9d78e18dcefc76f96fabf8aa912fb9cb7711834d0dab0ff8 | Inventory of the whole install folder |
| `gamemd.snapshot` | `--snapshot` of the runs above | n/a | REA analysis snapshot; pass it with `--snapshot` to later runs |

Not REA evidence (direct byte reads, recorded in the spec as UNVERIFIED): the strings at 0x81d9c0..0x81d9dc and
0x825338..0x82535c, the crate-name pointer table at 0x7e5248..0x7e5284, the weapon-key sequence around 0x7722f5,
the PE header/sections, and the Authenticode signer (PowerShell `Get-AuthenticodeSignature`).

## notes-example — Electron notes app (rea.tools example)

Target: `example\notes-example` (from https://rea.tools/examples/notes-example.zip, sha256 9330AFF1...6EE5B)

| File | REA command | evidence_id | What it shows |
|---|---|---|---|
| `notes-evidence.json` | `analyze-javascript-application --detail summary` | parent ev_183910ec9a0a5f187c385532c1e64a288973ed80a04101822a94de525944eb70 | Application graph bundle |
| `analyze.out` | same, stdout | view ev_e130dca070a391781d63deed2e8e496e37b436faf7b750b0e5d5d51c32bbc79a | Summary view |
| `trace.out` | `trace-application-feature` seed "Export notes" | see file | No match (label lives only in HTML) |
| `trace2.out` | `trace-application-feature` seed "notes:export" | ev_267add10d26aa33e08c350e970c7d7982bf644eeadd5ade0c72bed5752c41b97 | Renderer → preload → IPC → main chain |
| `skilltest-evidence.json`, `skilltest-trace-1.json` | same, via the `rea-trace-feature` skill helper | same ids | Skill test run |
