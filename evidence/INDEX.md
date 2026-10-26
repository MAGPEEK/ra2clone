# REA evidence index (generated)

Generated 2026-10-26 from the raw REA output in `evidence/ra2-gamemd/` (rea-agents 6.8.0, Ghidra 12.1.4 provider).
Regenerate the table with `node evidence/tools/index-evidence.mjs` and the cross-check with
`node evidence/tools/crosscheck.mjs --out evidence/tools/crosscheck-report.md`.
This file complements `evidence/README.md` (hand-written index with "what it shows" notes); the README is left as is.

> Do not commit `ra2-gamemd/` to the ra2clone repo. `fn-*.json` and `*.snapshot` contain decompiled
> code and analysis of `gamemd.exe` (see "Do not" in `.github/copilot-instructions.md`). Cite evidence_ids in specs instead.

## ra2-gamemd — `gamemd.exe` (T-022)

Target: `C:\Program Files\EA Games\Command and Conquer Red Alert II\gamemd.exe`
SHA-256 `ddeb66a552040d3a6a660e7d8228a6dbeef3a14a9413239f0ec42d7078c86d48`

JSON files are unmodified CLI output; `rea_progress` lines (none present in the current files) are filtered before parsing.
Address column: the address passed to `function` / `xrefs`; the procedure column shows the containing function Ghidra resolved and its body range.

| File | Operation | Address / parameters | evidence_id | Procedure (body range) | Callers | Callees |
|---|---|---|---|---|---|---|
| `fn-0x4891ce.json` | analyze_function | 0x4891ce | ev_78c91595642b41ed94693cf94a2d5eb12841be7ea93939326dfc1e6899aef988 | FUN_00489180 (0x489180-0x48926c) | 3 | 1 |
| `fn-0x4b1150.json` | analyze_function | 0x4b1150 | ev_82818cd00999a883d38000b429421800ebf5841f70e8c52d6ff3bdebf2110f55 | FUN_004b0f20 (0x4b0f20-0x4b2607) | 0 | 19 |
| `fn-0x4b1f64.json` | analyze_function | 0x4b1f64 | ev_7bf7fc12fab5194682ce5da0ace375cfbc379b515ff0d6110294e021b61c3210 | FUN_004b0f20 (0x4b0f20-0x4b2607) | 0 | 19 |
| `fn-0x4b3df0.json` | analyze_function | 0x4b3df0 | ev_2ad203770828541ce9e60a327a1e7acd8c84b5a61b82793804e30628f44ecbc7 | FUN_004b2630 (0x4b2630-0x4b4766) | 1 | 30 |
| `fn-0x4db1b6.json` | analyze_function | 0x4db1b6 | ev_d12530ffa6271545062969ddf26320632fb24563966c3e208dfe11913ef56a57 | FUN_004db1a0 (0x4db1a0-0x4db245) | 1 | 3 |
| `fn-0x50c079.json` | analyze_function | 0x50c079 | ev_f7a0385389155dc4130105a5cc2225b56ebb514b45c1929c7b6ff0ba57844612 | FUN_0050c050 (0x50c050-0x50c09b) | 1 | 0 |
| `fn-0x511c2c.json` | analyze_function | 0x511c2c | ev_27162a68542bf6ac5d71db554490899d36f6fcaab1dc2d9b2b52926bed1ab2d5 | FUN_00511850 (0x511850-0x512164) | 0 | 28 |
| `fn-0x5f540f.json` | analyze_function | 0x5f540f | ev_a91f9ada2905c3d95e95496e730ddb22a8d27650df51b21041b1cc496cce5830 | FUN_005f5390 (0x5f5390-0x5f584c) | 1 | 5 |
| `fn-0x662933.json` | analyze_function | 0x662933 | ev_4af5eae01ca7599958a94c6e69b809f91a6fda88d03480bc0e179b63faf0f084 | FUN_006622c0 (0x6622c0-0x66300e) | 0 | 19 |
| `fn-0x67441f.json` | analyze_function | 0x67441f | ev_ebf0a4ba301b8e9abe80b65862f7b58993b28234894d26c0dcd97e0ae9248b69 | FUN_006743d0 (0x6743d0-0x6744f1) | 1 | 3 |
| `fn-0x6a077f.json` | analyze_function | 0x6a077f | ev_8217e49c6122fd541036e0c3705828fa1ee0b63cc3243bb349465c91f0446007 | FUN_006a05f0 (0x6a05f0-0x6a1c58) | 0 | 18 |
| `fn-0x6fdb80.json` | analyze_function | 0x6fdb80 | ev_8f9129a4c6e9d8d3d0c1abf885d56bf805db70a869bf26828614360e6c65e159 | FUN_006fdb80 (0x6fdb80-0x6fdd41) | 1 | 5 |
| `fn-0x71464c.json` | analyze_function | 0x71464c | ev_a607860c134d8d4c41b8a119d8809d1a7564cde8fae4596e621996c2d0f4e442 | FUN_00712170 (0x712170-0x716140) | 0 | 79 |
| `fn-0x7722f5.json` | analyze_function | 0x7722f5 | error: invalid_request | No procedure exists at the requested address: 0x7722f5 |  |  |
| `fn-0x7e5264.json` | analyze_function | 0x7e5264 | error: invalid_request | No procedure exists at the requested address: 0x7e5264 |  |  |
| `inspect-artifact.json` | inspect_artifact | integrity_policy=fail, input_path=C:\Program Files\EA Games\Command and Conquer Red Alert I... | ev_a30b2b64830956e5b76792041c8a121b426bdc920b6df2f17be4d0f343adddc0 |  |  |  |
| `inspect-byte-entropy.json` | inspect_byte_entropy | path=C:\Program Files\EA Games\Command and Conquer Red Alert I..., block_size=4096, offset=0 | ev_c7ea0c0c105e964044ac73cbc05d3c49f7963cc60d76c2290d22dd7ac0f68798 |  |  |  |
| `inspect-pe-certificates.json` | inspect_pe_certificates | path=C:\Program Files\EA Games\Command and Conquer Red Alert I..., max_file_bytes=67108864, max_entries=8 | ev_c324f0d2e98a9ced2ecb9c6acb1fae18aa0dfd464f456e6d82733dcb02673a9e |  |  |  |
| `inspect-pe-imports.json` | inspect_pe_imports | path=C:\Program Files\EA Games\Command and Conquer Red Alert I..., max_file_bytes=67108864, max_dlls=256, max_functions=8192 | ev_e068037a9babe39e5d818b78317f43df59a50b6b8f771420a7358acf22f52c4f |  |  |  |
| `inspect-pe-resources.json` | inspect_pe_resources | path=C:\Program Files\EA Games\Command and Conquer Red Alert I..., max_file_bytes=67108864, max_entries=16384 | ev_1fc663217f60150e7de3d36ac27bac6573e5a47a32f1038f136a183c5406f230 |  |  |  |
| `xrefs-0x825338.json` | xrefs | 0x825338 | ev_55fcfe2b8c9765208a804c57caac475d90ce9183f6c7837ec87606e161be7017 | 1 result(s) |  |  |
| `xrefs-0x82534c.json` | xrefs | 0x82534c | ev_02e1f5ea5319b997847c27f9395bda029b3def3571bbef46463717b06a55f010 | 1 result(s) |  |  |
| `xrefs-0x82535c.json` | xrefs | 0x82535c | ev_2b6cb9491d9735b1402f085c0c74d053d4b87e16984bed71bcd3a9de583141c4 | 1 result(s) |  |  |
| `xrefs-speed.json` | xrefs | 0x81d9cc | ev_245d8c967e3b8fc714eacb1eaa28021d453a3c0124fb0510d6e7f5d8bb344d2b | 4 result(s) |  |  |

Non-JSON files in the same folder:

| File | Kind | Size (bytes) | evidence_id | Note |
|---|---|---|---|---|
| `inspect-desktop-application.md` | `inspect-desktop-application <game folder>` (markdown) | 35,513 | ev_742030dba4af483b9d78e18dcefc76f96fabf8aa912fb9cb7711834d0dab0ff8 | Inventory of the whole install folder |
| `gamemd.snapshot` | REA analysis snapshot | 18,331,475 | n/a | Pass with `--snapshot` to later runs |
| `gamemd-2.snapshot` | REA analysis snapshot | 1,416,848 | n/a | |
| `gamemd-3.snapshot` | REA analysis snapshot | 152,917 | n/a | |
| `gamemd-4.snapshot` | REA analysis snapshot | 3,967,784 | n/a | |
| `gamemd-5.snapshot` | REA analysis snapshot | 3,967,784 | n/a | Same size as `gamemd-4.snapshot` |
| `gamemd-6.snapshot` | REA analysis snapshot | 4,594,810 | n/a | |

Not REA evidence (direct byte reads, recorded in the spec as UNVERIFIED rows #5, #6, #15-#19): the strings at
0x81d9c0..0x81d9dc and 0x825338..0x82535c, the crate-name pointer table at 0x7e5248..0x7e5284, the weapon-key
sequence around 0x7722f5, `mov eax,[eax+0x678]` at 0x70EFEC (Phobos's TechnoClass_GetMaxSpeed hook, 0x70EFE0),
the RulesClass ReadINI stores at 0x66EEFC / 0x66F25B / 0x66F2A9 / 0x66B37F (VeteranSpeed, TrackedDownhill,
WheeledDownhill, ConditionYellow), the Ship-locomotor 0.75 multiply at 0x6A343F / 0x6A344F, the vtables at
0x7E22A4 / 0x7F5C70 / 0x7EB058 (slots +0x84 / +0x38C / +0x538), the F2I prologue at 0x7C5F00, the infantry prone
constant at 0x521D94, the PE header/sections, and the Authenticode signer (PowerShell `Get-AuthenticodeSignature`).

## References (names only, never proof of behaviour)

Shallow git clones used only to suggest names for offsets and functions. They are not evidence of `gamemd.exe` behaviour.

| Folder | HEAD commit |
|---|---|
| `yrpp-src/` | f14642c8652bacdbc6b84833cedd006d1148a800 |
| `phobos-src/` | a1ca6661615335947aa0eed2875148af75e339b2 |

`yrpp/` (7 loose YRpp headers, not a git clone) is an older hand copy of the same kind of reference material.

## Cross-check (spec `docs/specs/T-022-movement-speed.md` vs `ra2-gamemd/*.json`)

Full report: `evidence/tools/crosscheck-report.md`.

- JSON files: 24 (successful: 22, failed: 2: `fn-0x7722f5.json`, `fn-0x7e5264.json`, both `invalid_request` "No procedure exists at the requested address")
- Distinct evidence_ids in files: 22; cited in the spec (full form): 14
- Cited in spec but missing from files: **0**
- Truncated ids in spec prose (`ev_xxxxxxxx...`) that match no known id: 0
- Present in files but not cited in the spec: 8
  - `fn-0x4b1f64.json` ev_7bf7fc12... (second run of FUN_004b0f20, same body as the cited `fn-0x4b1150.json`)
  - `fn-0x5f540f.json` ev_a91f9ada... (FUN_005f5390, caller of the "irrelevant" FUN_00489180)
  - `fn-0x6fdb80.json` ev_8f9129a4... (FUN_006fdb80, not mentioned in the spec)
  - `inspect-artifact.json`, `inspect-byte-entropy.json`, `inspect-pe-certificates.json`, `inspect-pe-imports.json`, `inspect-pe-resources.json` (binary-identity runs; the spec records the SHA-256 but does not cite these ids)
- Note: `evidence/README.md` lists `inspect-pe-*` / `inspect-byte-entropy` ids as "see file"; the ids are in the table above.

## notes-example — Electron notes app (rea.tools example)

Unchanged; see `evidence/README.md`.
