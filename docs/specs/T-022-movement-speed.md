# Spec: T-022 Movement speed

Status: DRAFT (REA-evidenced: `Speed=` parse, SpeedType index 1, the FUN_004db1a0 multiplier chain, F2I = truncation toward zero, the integer prone adjustment, the RulesClass key stores, all nine vtable pairs of row 18, the ground table loader, the Drive track-loop semantics, the Ship `Process` copy, the Fly and Jumpjet per-frame steps. Still open: the Fly ILocomotion slot +0x84 routine at 0x4ce4b0, FUN_004b4780 (track-point transform), the leptons-per-frame unit (AP-19 measurement pending), SpeedType indices 0 and 2-7, whether FUN_005283d0 scales `[Land]` values by 0.01, row 5 key context, T-021 frame rate)
Binary: gamemd.exe (Yuri's Revenge, PE timestamp 2001-10-31, version resource "1.11", EA App build), SHA-256: ddeb66a552040d3a6a660e7d8228a6dbeef3a14a9413239f0ec42d7078c86d48
Path analyzed: `C:\Program Files\EA Games\Command and Conquer Red Alert II\gamemd.exe` (differs from the path in `.github/copilot-instructions.md`)
Provider: Ghidra 12.1.4 via REA (rea-agents 6.8.0, CLI), dates: 2026-10-26 and 2026-10-27; REA MCP (`read_bytes`) for the data reads of 2026-10-27
Raw evidence: `evidence/ra2-gamemd/` (index in `evidence/README.md`). `fn-*.json` and `*.snapshot` stay local (gitignored, decompiled code); the `xrefs-*`, `bytes-*`, `search-*`, `fileoffset-*`, `decompile-*` and single-instruction `instr-*` JSON files are tracked; `instr-0x4b1f5c.json` (full listing of FUN_004b0f20) stays local like the `fn-*.json` dumps.
References used for names only: YRpp and Phobos (`evidence/yrpp-src`, `evidence/phobos-src`, shallow clones of 2026-10-26)

## Goal
Describe how the `Speed=` key from `rules.ini` is turned into per-tick movement of a unit.

## Summary of the chain
1. `TechnoTypeClass::ReadINI` (FUN_00712170) reads `Speed=` (0..100) and stores it at TechnoTypeClass+0x678 scaled to 0..255; it reads `SpeedType=` as a string and stores the index of the matching entry of an 8-pointer table at 0x81da58 at +0x67C (index 1 = "Track", ev_bcb31614...).
2. The routine at 0x70EFE0 (vtable +0x38C of the Aircraft/Unit/Infantry vtables; Phobos name `TechnoClass_GetMaxSpeed`, YRpp name `GetDefaultSpeed`, both REFERENCE-SUGGESTED) returns the dword at +0x678 of the object that vtable +0x84 returns, or 0 if that call returns null (ev_6deeab10...).
3. `FootClass::GetMovementSpeed` (FUN_004db1a0) multiplies it by the owner country's `Speed*Mult`, by `FootClass::SpeedMultiplier`,
   by `[General] VeteranSpeed` when FUN_0070d0d0(0) returns 1 (ability flag byte 0 of the type's +0x29C / +0x2AE tables, gated by the +0x150 predicates; "Faster" per YRpp, REFERENCE-SUGGESTED), and by `FootClass::SpeedPercentage`; each product is truncated toward zero by FUN_007c5f00; vehicles carrying a flag get half.
   `AircraftClass` and `UnitClass` use this directly as `GetCurrentSpeed` (vtable +0x538); `InfantryClass` (FUN_00521d80) wraps it and, when this+0x6DB (Crawling, REFERENCE-SUGGESTED) is set, returns `v - trunc(v/3)` if Type+0xEBD (Crawls, REFERENCE-SUGGESTED) is set, else `v + trunc(v/2)` (integer arithmetic, no FPU).
4. `DriveLocomotionClass::WhileMoving` (FUN_004b0f20) adds `GetCurrentSpeed()` to an accumulator each frame and, while the accumulator holds more than 7, deducts 7 per track point and moves the object to the next point of the current track table entry (DAT_007e7a28 / DAT_007e7b28); the remainder is kept for the next frame. The distance of one step is the difference between consecutive track points, not a fixed 7 leptons.
   `DriveLocomotionClass::Process` (FUN_004b2630) computes the `SpeedPercentage` coefficient (ground table DAT_0089ea40 by SpeedType and land row, up/downhill factors, 0.75 when `this[+0x6c] / GetType()[+0xa0]` (health percentage per YRpp) is `<= ConditionYellow`) that step 3 multiplies in. The Ship `Process` (FUN_006a1c80) has the identical block.
5. The Fly (FUN_004cd600) and Jumpjet (FUN_0054d0f0) locomotors do not call FUN_004db1a0 and do not read Type+0x678 or vtable +0x38C; they move by `F2I(coord +/- trig(angle) * speed)` where the Jumpjet `speed` is its own double at +0x70 (ev_9a13d9d4...) and the Fly `speed` comes from the ILocomotion slot +0x84 routine, not decompiled (ev_e8f8f023...).

## Evidence
| # | Address | What | REA tool | evidence_id | Status |
|---|---|---|---|---|---|
| 1 | 0x81d9cc | String "Speed" (neighbors "Firepower" 0x81d9c0, "Armor" 0x81d9d4) | xrefs / function | ev_a607860c134d8d4c41b8a119d8809d1a7564cde8fae4596e621996c2d0f4e442 | VERIFIED (tool output) |
| 2 | 0x81d9cc | References: 0x67441f, 0x71464c, 0x7722f5, 0x7e5264 | xrefs | ev_245d8c967e3b8fc714eacb1eaa28021d453a3c0124fb0510d6e7f5d8bb344d2b | VERIFIED (tool output) |
| 3 | 0x71464c in FUN_00712170 (0x712170-0x716140) | Unit-type `Speed=` read, clamp, scale, store at this+0x678 | function | ev_a607860c134d8d4c41b8a119d8809d1a7564cde8fae4596e621996c2d0f4e442 | VERIFIED (tool output) |
| 3b | FUN_00476fc0 (0x476fc0-0x47701e), called at 0x7121e0 in FUN_00712170 with key "SpeedType" (0x844504), result stored at +0x67C (0x7121e5) | `SpeedType=` reader: FUN_00528a10 fills a 128-byte buffer; if it returns 0 the existing +0x67C value (3rd argument) is returned, else FUN_0048dff0(buffer) | function | ev_f6c772b6768acbe88672deb0541cf136c179e979777068c218f64a00d13e9f35 (call site: ev_a607860c134d8d4c41b8a119d8809d1a7564cde8fae4596e621996c2d0f4e442) | VERIFIED (tool output) |
| 3c | FUN_0048dff0 (0x48dff0-0x48e028) | String-to-index: loops over 8 pointers at 0x81da58..0x81da74 calling FUN_007c8d20(entry, string), returns the first index with result 0, else -1; index 1 = `PTR_s_Track_0081da5c` -> "Track" (0x81dbcc); other entries not visible in the output | function | ev_bcb316147b322b39b3d9449cd8fa52d559a1b1fc701fbbe02b776e12319cecab | VERIFIED (tool output) for index 1; indices 0, 2-7 UNVERIFIED |
| 4 | 0x67441f in FUN_006743d0 | `[JumpjetControls] Speed` into this+0x410 (RulesClass::Read_JumpjetControls per YRpp); consumer: not FUN_0054d0f0 (no RulesClass read there, ev_9a13d9d4...); reference-suggested chain Rules+0x410 -> TechnoType JumpjetSpeed -> JumpjetLocomotionClass+0x20 (Phobos Ext/Rules/Body.cpp:1348, Ext/Unit/Hooks.Jumpjet.cpp:486/498), REA consumer still open | function | ev_ebf0a4ba301b8e9abe80b65862f7b58993b28234894d26c0dcd97e0ae9248b69 | VERIFIED (tool output) |
| 5 | 0x7722f5 | `PUSH 0x81d9cc` (bytes 68 cc d9 81 00, DATA reference to "Speed"); not inside any Ghidra function (`function`/`instructions` at 0x7722f5 and at the Phobos hook 0x7729B0 both report "No procedure exists"). Weapon `Speed=` read between Damage/ROF keys and the store offset: UNVERIFIED (byte read); Phobos places the hook `WeaponTypeClass_LoadFromINI` at 0x7729B0 (REFERENCE-SUGGESTED) | inspect-native-instruction | ev_3c503f2196464753a9d8841dfda54c38650075f37b63b7e644b6afab6097a889 | VERIFIED (tool output) for the instruction; key sequence / store UNVERIFIED |
| 6 | 0x7e5264 | Pointer to "Speed" (listed as referrer of 0x81d9cc, ev_245d8c96...); data reference only: `xrefs 0x7e5264` returns no reference. Crate power-up name table = YRpp `Powerups::Effects` at 0x7E523C, index 10 (REFERENCE-SUGGESTED) | xrefs | ev_93a4d1a59c9bfe8975491c150e4fe2541e7ed60d08abb00301e2df28a09bfef8 (+ ev_245d8c967e3b8fc714eacb1eaa28021d453a3c0124fb0510d6e7f5d8bb344d2b) | VERIFIED (tool output) |
| 7 | 0x82534c / 0x82535c / 0x825338 | "SpeedUnitsMult" / "SpeedInfantryMult" / "SpeedAircraftMult", each referenced once: 0x511c2c / 0x511c0d / 0x511c4b | xrefs (3 runs) | ev_02e1f5ea5319b997847c27f9395bda029b3def3571bbef46463717b06a55f010 / ev_2b6cb9491d9735b1402f085c0c74d053d4b87e16984bed71bcd3a9de583141c4 / ev_55fcfe2b8c9765208a804c57caac475d90ce9183f6c7837ec87606e161be7017 | VERIFIED (tool output) |
| 8 | FUN_00511850 (0x511850-0x512164) | Country loader: reads the three Speed*Mult keys (and Armor*/Cost*/BuildTime*Mult) into floats at +0x128/+0x12C/+0x130 | function | ev_27162a68542bf6ac5d71db554490899d36f6fcaab1dc2d9b2b52926bed1ab2d5 | VERIFIED (tool output) |
| 9 | FUN_0050c050 (0x50c050-0x50c09b) | Selector: WhatAmI()==3 -> Type+0x130, ==16 -> +0x128, ==40 -> +0x12C, else 1.0; single caller FUN_004db1a0 | function | ev_f7a0385389155dc4130105a5cc2225b56ebb514b45c1929c7b6ff0ba57844612 | VERIFIED (tool output) |
| 10 | FUN_004db1a0 (0x4db1a0-0x4db245) | Movement speed formula (see Rule B); callees FUN_0050c050, FUN_0070d0d0, FUN_007c5f00; caller FUN_00521d80 | function | ev_d12530ffa6271545062969ddf26320632fb24563966c3e208dfe11913ef56a57 | VERIFIED (tool output) |
| 11 | FUN_004b0f20 (0x4b0f20-0x4b2607) | Drive per-frame stepping with accumulator at this+0x4C and coefficient at this+0x50; track loop 0x4b158f-0x4b1f56 (entry test 0x4b1510, exit 0x4b1f5c) | function (2 runs) / instructions | ev_82818cd00999a883d38000b429421800ebf5841f70e8c52d6ff3bdebf2110f55 / ev_7bf7fc12fab5194682ce5da0ace375cfbc379b515ff0d6110294e021b61c3210 / ev_e24c89287b26153aaf977a13594beace34a14dfe8df9698a21438f62e7180dc8 | VERIFIED (tool output) |
| 11b | 0x7E7A28 | Track table, 16-byte entries: +0 pointer to point list, +4 / +0xC indices compared with TrackIndex, +8 point count; readers 0x4b0b35, 0x4b1546, 0x4b1ca7, 0x4b22e2. First 128 bytes: 8 units whose first word is an address in 0x7e6258..0x7e6f00 followed by (-1, 0, -1) or a small triple such as (0x25, 0xc, 0x16) | xrefs + read_bytes | ev_19b22c8e16061c46cc337e67c9174096a1b6a6ca0ca69d82a5d47a09e6f23155 / ev_732a3cbc208c9531fbf11d2a266fe696b81d3601a3f2b3d6b4d03bbcf9deb5f4 | VERIFIED (tool output) |
| 11c | 0x7E7B28 | Track selector table, 12-byte entries indexed by TrackNumber: signed byte +0 (or +1 when this+0x60 != 0) = index into 0x7E7A28, byte +4 facing bits, byte +8 bit 3 flag; readers 0x4b0b22, 0x4b151f, 0x4b153a, 0x4b1b78, 0x4b1b83, 0x4b22d9, 0x4b4023, 0x4b4b2c, 0x4b4b3b, 0x4b4ba9, 0x4b4bb0. First 128 bytes: 12-byte units with a middle word stepping 0x0, 0x20, ..., 0xe0 | xrefs + read_bytes | ev_5d2ddddfbade2c80b1e801a25fa2a0eec19f2acb67099eb508659e53a0883d52 / ev_24c499783dcfb87328bb0389e65e1cd864c524a9af0adfda3109d00884e86cf6 | VERIFIED (tool output) |
| 12 | FUN_006622c0 (0x6622c0-0x66300e) | Rocket locomotor: CurrentSpeed capped at Type+0x678 (as double) | function | ev_4af5eae01ca7599958a94c6e69b809f91a6fda88d03480bc0e179b63faf0f084 | VERIFIED (tool output) |
| 13 | FUN_006a05f0 (0x6a05f0-0x6a1c58) | Ship locomotor: slowdown `Type+0x678 * Type+0x300` when within Type+0x2F8 | function | ev_8217e49c6122fd541036e0c3705828fa1ee0b63cc3243bb349465c91f0446007 | VERIFIED (tool output) |
| 14 | FUN_00489180 (0x489180-0x48926c) | Multiplies by WarheadType+0x12C: MapClass::GetTotalDamage per YRpp. NOT speed; recorded to close a false lead | function | ev_78c91595642b41ed94693cf94a2d5eb12841be7ea93939326dfc1e6899aef988 | VERIFIED (tool output), irrelevant |
| 15 | 0x70EFE0-0x70EFF5 (no Ghidra function; 8 single-instruction decodes) | `MOV EAX,[ECX]; CALL [EAX+0x84]; TEST EAX,EAX; JZ 0x70EFF3; MOV EAX,[EAX+0x678]; RET; XOR EAX,EAX; RET` - the routine Phobos hooks as TechnoClass_GetMaxSpeed: returns +0x678 of the object vtable slot +0x84 returns, or 0 when that call returns null. Data references from 0x7E2630 / 0x7F5FFC / 0x7EB3E4 = Aircraft/Unit/Infantry vtable +0x38C (plus 0x7E4248 / 0x7E9020 / 0x7F4CEC, not identified); file offset 0x30efe0 | inspect-native-instruction (x8) + xrefs + address-to-file-offset; `function`, `instructions` and `decompile --file-offset` all report "no procedure" at this address | ev_6deeab1046b5c4ed4af5a40a06e06746486423f035a6067e92b7c223287206e4 (0x70EFEC load), ev_b41714b131b2b7bc4d17252ede4a3eaad3bd8d7c4090366d8bad45ff15958392 (0x70EFE0 + reference kinds), ev_d3f7d56d571a2ec5aeab0fca38da29462e1f1d1dde2a82e0dd4eba07c607e269 (0x70EFE2 call +0x84), ev_8c39641075f39f71c8e07e73b649168ce728a44055e7ec1f99ac5036664a2128 (xrefs), ev_5c8e3083fb884e5774e3a590a4bd3d30a0345bedada0417682f54c337bee1e49 (file offset); remaining decodes ev_1e8a9f4dca747da9847d26b9ef987b45ef41c2d5483c1af3af729a126309d0ce, ev_dffad71b29e7e054081c4bb5635b10d7a590114836f03e149d7d51fe62f3d74c, ev_40f300a4a8746855b0c72e0e910353475441fc72d64020e36569af254da53a8a, ev_4690f8379b6af4d828ccb32b42245d28839c6b4efc2956e5440b11f2395b4d60, ev_c54dbca84087ac3c4026e534f288d5eaf1c9ac4225903dc0676881ab4bf2a1b4 | VERIFIED (tool output) |
| 16 | 0x66EEFC / 0x66F25B / 0x66F2A9 in FUN_0066d530 (0x66d530-0x671e98); 0x66B37F in FUN_006691e0 (0x6691e0-0x66b8ff) | RulesClass stores after `CALL 0x005283d0`: +0x678 "VeteranSpeed" (0x83c9b4), +0x770 "TrackedDownhill" (0x83c89c), +0x780 "WheeledDownhill" (0x83c87c), section pointer `PTR_s_General_007f0c9c`; +0x1700 "ConditionYellow" (0x83a370), section pointer `PTR_s_AudioVisual_007f0c7c`; all `FSTP double ptr` | function (2 runs) | ev_2772022c93b2c19e906fded4d1be05172c67979986372008e57cc64adc1bec48 / ev_22a314265c52606bc186043543877d91fa3da11f9e4a9306f311f9f1b77874c0 | VERIFIED (tool output) |
| 16b | 0x66F234 / 0x66F282 in FUN_0066d530 | RulesClass stores: +0x768 "TrackedUphill" (0x83c8ac), +0x778 "WheeledUphill" (0x83c88c), `[General]`, `FSTP double ptr` after `CALL 0x005283d0` | function | ev_2772022c93b2c19e906fded4d1be05172c67979986372008e57cc64adc1bec48 | VERIFIED (tool output) |
| 17 | FUN_004b2630 (0x4b2630-0x4b4766) | Drive `Process`: speed coefficient from ground table, up/downhill factors, 0.75 below ConditionYellow, stored at +0x50 / SetSpeedPercentage (call sites and operators: row 17e) | function | ev_2ad203770828541ce9e60a327a1e7acd8c84b5a61b82793804e30628f44ecbc7 | VERIFIED (tool output) |
| 17a | FUN_005f5c60 (0x5f5c60-0x5f5c7f) | `this[+0x6c]` / `GetType()[+0xa0]` as double on x87; the ConditionYellow comparand | function | ev_62e78e5252e6cddff837a5ae8d740d55c392b5be225d2a21baefb7ab14d81c6d | VERIFIED (tool output) |
| 17b | FUN_006a1c80 (0x6a1c80-0x6a3d95), 0x6A343F / 0x6A344F | Ship `Process` (name REFERENCE-SUGGESTED, Phobos hook 0x6A343F): same block as Drive 0x4b3c84-0x4b3e27: ground-table read `FLD float ptr [EDX*4 + 0x89ea40]` at 0x6a32f2, `CALL 0x005f5c60` 0x6a3423, `FCOMP [Rules+0x1700]` 0x6a342e, `FMUL qword ptr [0x7E7FC0]` (0.75) at 0x6a343f, `FSTP [this+0x50]` at 0x6a344f, else vtable +0x544 at 0x6a3470 | function | ev_37ea75fb7220468fda6c807378a9098f4df7eb30a1522f4d3f28470308cd5e6a | VERIFIED (tool output) |
| 17c | FUN_00578080 (0x578080-0x5780f8) | coordinate -> cell (`>> 8`, `y * 0x200 + x`, DAT_0087f924) -> FUN_0047b3a0 result | function | ev_0c254678c6b2ea9eeb70e5c1d86dfd9b2cb36c82b2d43103327253ba9e78c7dd | VERIFIED (tool output) |
| 17d | FUN_0047b3a0 (0x47b3a0-0x47bb5a) | cell floor height: `F2I(cell[+0x11b] * DAT_0089e7c0 + c)` + ramp term when `cell[+0x11c] != 0` | function | ev_4932a5d2340faec97e79b524555e20a5bb031e789f704e820d8eca7a249cda9c | VERIFIED (tool output) |
| 17e | 0x4b3cec / 0x4b3d1a / 0x4b3d21 / 0x4b3d6a / 0x4b3ddf | Drive `Process`: call 1 = looked-up cell coordinate, call 2 = `LinkedTo+0x9c`; uphill when call 1 > call 2, downhill when <; ConditionYellow test is `<=` | function (assembly of row 17) | ev_2ad203770828541ce9e60a327a1e7acd8c84b5a61b82793804e30628f44ecbc7 | VERIFIED (tool output) |
| 18 | 0x7E22A4 / 0x7F5C70 / 0x7EB058 | Vtables (AircraftClass / UnitClass / InfantryClass per YRpp `AbsVTable`, names REFERENCE-SUGGESTED): slot +0x538 -> 0x4DB1A0 / 0x4DB1A0 / 0x521D80 (xrefs to 0x4db1a0: 0x7e27dc = 0x7E22A4+0x538, 0x7f61a8 = 0x7F5C70+0x538, plus code ref 0x521d83 and 0x7e91cc; xref to 0x521d80: 0x7eb590 = 0x7EB058+0x538, the only reference to that function); slot +0x84 -> 0x6F3270 (xrefs: 0x7e2328 / 0x7f5cf4 / 0x7eb0dc = base+0x84, plus 0x7e3f40 / 0x7e8d18 / 0x7f49e4); slot +0x38C -> 0x70EFE0 (xrefs: 0x7e2630 / 0x7f5ffc / 0x7eb3e4 = base+0x38C, plus 0x7e4248 / 0x7e9020 / 0x7f4cec; all six kind DATA per ev_b41714b1...). Extra references = base+slot for 0x7E3EBC (BuildingClass per YRpp) and the unnamed bases 0x7E8C94 / 0x7F4960. xrefs lists do not expose reference kinds (tool limitation) | xrefs (0x4db1a0, 0x6f3270, 0x70efe0, 0x521d80) + inspect-native-instruction 0x70efe0 | ev_3038fc4f05894b1ba94de99388c563e37ef8f68671523dcc96b04f19990132d9 / ev_e03b859e594994112786502db398a9ed788bc79c039b556a4da8157ad8d55569 / ev_8c39641075f39f71c8e07e73b649168ce728a44055e7ec1f99ac5036664a2128 / ev_3e3a547987cdedecf729c694bc429dfa471c7067f3cef8d44dc21fc8cc75961a / ev_b41714b131b2b7bc4d17252ede4a3eaad3bd8d7c4090366d8bad45ff15958392 | VERIFIED (tool output) for all nine (vtable, slot) pairs; slot names REFERENCE-SUGGESTED |
| 19 | FUN_007c5f00 (0x7c5f00-0x7c5f3c) | F2I: `FNSTCW`, compare with `DAT_00822d80` (= 0x0E7F: RC=11 truncate toward zero, PC=10 53-bit), `FLDCW` from `DAT_00822d80` when different, `FISTP qword`; returns 64-bit EDX:EAX (callers use EAX); caller's control word not restored | function + read_bytes | ev_30d736aaee2eba3faeb44096c1cc2728ecc2475515de7930881f57f23dc15b08 / ev_e087554034d37c2b4b06c8aa074fe3bbb27f04f75535502c0ae42b3934254efa | VERIFIED (tool output) |
| 20 | FUN_00521d80 (0x521d80-0x521dc8) | InfantryClass GetCurrentSpeed wrapper: `CALL 0x004db1a0` at 0x521d83, result in ECX; if byte `this+0x6DB` != 0 (0x521d8a): loads `this+0x6C0` at 0x521d94 (`MOV EAX,[ESI+0x6c0]`) and tests byte `[that]+0xEBD` (0x521d9a); non-zero -> `v - trunc(v/3)` (IMUL by immediate 0x55555555, 0x521da4-0x521dbb), zero -> `v + trunc(v/2)` (CDQ/SAR 1, 0x521dbc-0x521dc3); no FPU, no DAT operand, no F2I call. Only reference to the function: 0x7eb590 (= 0x7EB058 + 0x538) | function (+ xrefs) | ev_e0a2a5c34a50488eefa642410c9683e17c676f9d6e7c2cf82666569712ecf0c3 / ev_3e3a547987cdedecf729c694bc429dfa471c7067f3cef8d44dc21fc8cc75961a | VERIFIED (tool output) |
| 21 | 0x822d80 | `DAT_00822d80` (x87 control word enforced by F2I): referenced from 0x7c5ef9 / 0x7c5f13 / 0x7c5f26 only; no writer returned. Bytes `7f 0e` = 0x0E7F little-endian | xrefs + read_bytes | ev_2743ff13d939b5e5429434b1f5041eeaeecd1cb7f4e4d93370179ff37e361646 / ev_e087554034d37c2b4b06c8aa074fe3bbb27f04f75535502c0ae42b3934254efa | VERIFIED (tool output); run-time writes UNVERIFIED |
| 22 | FUN_005276d0 (0x5276d0-0x5278e3) | INI int reader: this=INI, args (section, key, int default), returns int in EAX, default on null args / missing section / missing key / empty value; value string converted by FUN_007c9bfd (or FUN_007ca530 with 0x825bb8 when it starts with '$', with 0x825bb4 when FUN_007caff4(last char)==0x68) | function | ev_a3d4e51d5824a6c9b75bb8bd6f6ebfd9337123d370b6170c94bb2ae3025870df | VERIFIED (tool output) |
| 23 | FUN_005283d0 (0x5283d0-0x5285a1) | INI double reader: this=INI, args (section, key, double default), returns on x87 (`FLD ...; RET 0x10`), default on the same miss conditions; value parsed via FUN_007ca530 (0x825bd8) as float, multiplied by [0x7e3808] (= 0.01 per pseudocode) when FUN_007caf30(value, 0x2525) != 0 | function | ev_be4c09eb3b81519c903074d226e9905149b5d2c56adb567e44e9fb890a41e352 | VERIFIED (tool output) |
| 24 | FUN_00526810 (0x526810-0x526940) | INI section lookup: this=INI, arg (section name); hash via FUN_004a1de0, binary search over 8-byte {hash,value} entries at this+0x28 (count this+0x2C, cache this+0x38); returns entry value, 0 for null arg / empty INI / FUN_0052b750 failure, `[0xb7882c]` on search miss (value not shown) | function | ev_f2681433dc390d881a5435965c396d6184b7d2871ac96339566225ce72597ee6 | VERIFIED (tool output) |
| 25 | FUN_0070d0d0 (0x70d0d0-0x70d14f) | Ability lookup: predicates FUN_0074ff90 / FUN_00750010 on this+0x150, then byte `[(vtable+0x84 result) + 0x29c + arg]` (first path) or `+0x29c`/`+0x2ae + arg` (second path); returns AL 0/1; 16 callers incl. 0x4db1a0, 0x4b0f20, 0x6a05f0 | function | ev_461c68b6ffac8c1615475d016a3a935493ab6c30c70e01ad7c040dddcb2a3da3 | VERIFIED (tool output) |
| 26 | 0x6f3270 | `function` and `instructions` both: "No procedure exists at the requested address: 0x6f3270" (not a Ghidra procedure); body not seen. `xrefs 0x6f3270` works (row 18) | function / instructions (errors) | none | UNVERIFIED |
| 27 | FUN_00674000 (0x674000-0x674237) | Loader of DAT_0089ea40: 12 sections from pointer table 0x839d68 (Clear, Road, Water, Rock, Wall, Tiberium, Beach, Rough, Ice, Railroad, Tunnel, Weeds), 36-byte rows, keys Foot/Track/Wheel/Hover/-/Float/Amphibious/FloatBeach (floats via FUN_005283d0, default 1.0, capped at 1.0) + Buildable (byte via FUN_005295f0 at row+0x20); caller FUN_00668bf0. `search "Foot"` finds only RTTI names (the key at 0x81dbd4 is undefined data in Ghidra) | xrefs + function + search + read-bytes (5) | ev_d0af7dff62b0346b4e5b0761a43bee371cce6d0a7287f6b2aa340860e67cf4a5 / ev_cbd3ace28308a7569a525a44a684264d78d40366a83f246c6b790ca85ec92e25 / ev_b5dcaed203abd157d161a3644da58cc70803499d458a285210849064d6aed959 / ev_c7b013cd2e60ad4c7b183a9534f5eb674708c460938a6fe1f02d5ea5ae7d9362 / ev_00fe57e42dc4e651c1492f46513f6dd0e006d36b031f9c897af27acfde1a711e / ev_59e3db791a35505c546374799a40dc225fd37d95a85366a3dea29e8d2b7c6c74 / ev_b7c0235aadd8e93f6d8d8553151b1a13294f2f5cf9d987da1b1f7af9520cc593 / ev_83bb0cdffd2dcefbbaab38f8330dff78dee30e770601ba59cc01af88f257e6ed | VERIFIED (tool output) |
| 28 | FUN_004cd600 (0x4cd600-0x4ce4a9), Phobos hook 0x4CDA78 inside | Fly locomotor per-frame: speed int from ILocomotion slot +0x84 of this+0x4 (0x4cda72), position step F2I(coord +/- trig(angle) * speed) (0x4cda84-0x4cdae5), target ratio +0x40 = min(1, dist/Type+0x2f8) and +0x48 stepping by 0.1 toward it; no read of Type+0x678 / +0x38C | function | ev_e8f8f023f2e73e8631f1780d2aa8bcb480f345c8e83eedc8dccf0d03b00df44f | VERIFIED (tool output) |
| 29 | 0x4CE4BF / 0x4CE4B0 | Second Phobos Fly hook site; `function 0x4ce4bf` -> "No procedure exists", `xrefs 0x4ce4b0` -> [] | function (error), xrefs | ev_0d6c3caffb743e25f0d2bfd972d5277ed9b00c93a484908029786038f518c155 (xrefs) | UNVERIFIED (not a Ghidra function; body not seen) |
| 30 | FUN_0054d0f0 (0x54d0f0-0x54d6c5), Phobos hook 0x54D138 inside | Jumpjet locomotor per-frame: accelerate +0x70 by +0x30 toward +0x78, cap at (double)+0x20, decelerate by +0x30*1.5, floor 0; SetSpeedPercentage(+0x70/+0x20) via LinkedTo +0x544; step = F2I(+0x70) leptons along facing; no read of Type+0x678 / Rules+0x410 | function | ev_9a13d9d438894a55084bb4fcf8b8ee958ffc8644733699921a6cfece1ff98bde | VERIFIED (tool output) |

Irrelevant (analyzed, not speed, like row 14): `fn-0x6fdb80.json` (FUN_006fdb80, ev_8f9129a4c6e9d8d3d0c1abf885d56bf805db70a869bf26828614360e6c65e159) and `fn-0x5f540f.json` (FUN_005f5390, ev_a91f9ada2905c3d95e95496e730ddb22a8d27650df51b21041b1cc496cce5830) are callers of the damage function FUN_00489180 (row 14).

Status values: VERIFIED (tool output seen and checked in the Ghidra GUI), REFERENCE-SUGGESTED (from refs/), UNVERIFIED (inference).
"VERIFIED (tool output)" means REA output was seen; nothing has been checked in the Ghidra GUI yet.
Resolved: "Reveal" is at 0x81d9dc (also pointed to from the crate table at 0x7e525c). 0x81d4e4 does not hold that string. 0x7e5264 has no incoming Ghidra reference (data reference only); that the crate table is read from its base and not per entry is an inference.

### Raw tool output (excerpts)

xrefs 0x81d9cc (ev_245d8c96...): `["0x67441f","0x71464c","0x7722f5","0x7e5264"]`
inspect-native-instruction 0x7722f5 (ev_3c503f21...): `0x7722f5: PUSH 0x81d9cc` (bytes 68ccd98100, procedure = null, DATA reference 0x7722f5 -> 0x81d9cc)
xrefs 0x7e5264 (ev_93a4d1a5...): `[]`

function 0x71464c (ev_a607860c...), assembly:
```
0x71464a: PUSH -0x1
0x71464c: PUSH 0x81d9cc
0x714651: PUSH EBX
0x714652: MOV ECX, ESI
0x71465a: CALL 0x005276d0
0x71465f: CMP EAX, -0x1
0x714662: JZ 0x0071469f
0x714664: CMP EAX, 0x64
0x714667: JL 0x0071466e
0x714669: MOV EAX, 0x64
0x71466e: XOR ECX, ECX
0x714670: TEST EAX, EAX
0x714672: SETLE CL
0x714675: DEC ECX
0x714676: AND ECX, EAX
0x714678: MOV EAX, 0x51eb851f
0x71467d: SHL ECX, 0x8
0x714680: IMUL ECX
0x714682: SAR EDX, 0x5
0x714685: MOV EAX, EDX
0x714687: SHR EAX, 0x1f
0x71468a: ADD EDX, EAX
0x71468c: CMP EDX, 0xff
0x714692: JL 0x00714699
0x714694: MOV EDX, 0xff
0x714699: MOV dword ptr [EBP + 0x678], EDX
```

function 0x71464c (ev_a607860c...), SpeedType= read:
```
0x7121d1: MOV EDX, dword ptr [EBP + 0x67c]
0x7121d7: PUSH EDX
0x7121d8: PUSH 0x844504                  ; "SpeedType"
0x7121dd: PUSH EBX
0x7121de: MOV ECX, ESI
0x7121e0: CALL 0x00476fc0
0x7121e5: MOV dword ptr [EBP + 0x67c], EAX
pseudocode L138-L139: iVar4 = FUN_00476fc0(); in_ECX[0x19f] = iVar4;
```

function 0x476fc0 (ev_f6c772b6...), pseudocode:
```
  uVar1 = FUN_0048e030(local_80,0x80);
  iVar2 = FUN_00528a10(param_1,param_2,uVar1,puVar3,uVar4);
  if (iVar2 != 0) { uVar1 = FUN_0048dff0(); return uVar1; }
  return param_3;
(0x476ffe: LEA ECX, [ESP + 0x8] ; 0x477002: CALL 0x0048dff0 ; 0x477012: MOV EAX, EDI = param_3)
```

function 0x48dff0 (ev_bcb31614...), pseudocode:
```
    ppuVar2 = &PTR_DAT_0081da58;
    do {
      iVar1 = FUN_007c8d20(*ppuVar2);
      if (iVar1 == 0) { return iVar3; }
      ppuVar2 = ppuVar2 + 1;
      iVar3 = iVar3 + 1;
    } while ((int)ppuVar2 < 0x81da78);
  return -1;
referenced_strings: {"address":"0x81dbcc","value":"Track","source_address":"0x48e003"}
referenced_names: PTR_DAT_0081da58 (index 0), PTR_s_Track_0081da5c (index 1), PTR_s_Underground_0081da78 (loop end, not scanned)
```

function 0x4db1b6 (ev_d12530ff...), assembly:
```
0x4db1a7: MOV EAX, dword ptr [ESI]
0x4db1a9: CALL dword ptr [EAX + 0x84]          ; slot +0x84 = 0x6F3270 in the Aircraft/Unit/Infantry vtables (ev_e03b859e...); name GetTechnoType REFERENCE-SUGGESTED
0x4db1af: MOV ECX, dword ptr [ESI + 0x21c]     ; Owner
0x4db1b5: PUSH EAX
0x4db1b6: CALL 0x0050c050                      ; country speed multiplier
0x4db1bf: FSTP double ptr [ESP + 0xc]
0x4db1c3: CALL dword ptr [EDX + 0x38c]         ; slot +0x38C = 0x70EFE0 in the Aircraft/Unit/Infantry vtables (ev_8c396410...); name GetMaxSpeed REFERENCE-SUGGESTED (Phobos; YRpp GetDefaultSpeed)
0x4db1cd: FILD dword ptr [ESP + 0x8]
0x4db1d1: FMUL double ptr [ESP + 0xc]
0x4db1d5: FMUL double ptr [ESI + 0x580]        ; SpeedMultiplier
0x4db1db: CALL 0x007c5f00                      ; F2I (truncation, row 19)
0x4db1e0: PUSH 0x0
0x4db1e8: CALL 0x0070d0d0                      ; FUN_0070d0d0(0), row 25
0x4db1ef: JZ 0x004db209
0x4db1f1: FILD dword ptr [ESP + 0x8]
0x4db1f5: MOV EAX, [0x008871e0]                ; RulesClass::Instance
0x4db1fa: FMUL double ptr [EAX + 0x678]        ; VeteranSpeed
0x4db200: CALL 0x007c5f00
0x4db209: FILD dword ptr [ESP + 0x8]
0x4db20d: FMUL double ptr [ESI + 0x578]        ; SpeedPercentage
0x4db213: CALL 0x007c5f00
0x4db21e: CALL dword ptr [EDX + 0x2c]          ; WhatAmI
0x4db221: CMP EAX, 0x1
0x4db226: MOV EAX, dword ptr [ESI + 0x6cc]     ; FlagHouseIndex
0x4db22c: CMP EAX, -0x1
0x4db233: CDQ / SUB EAX, EDX / SAR EAX, 0x1    ; /2 toward zero
```

instruction stream 0x70efe0-0x70eff5 (inspect-native-instruction x8; ev_b41714b1..., ev_d3f7d56d..., ev_1e8a9f4d..., ev_dffad71b..., ev_6deeab10..., ev_40f300a4..., ev_4690f837..., ev_c54dbca8...; every decode reports `"procedure": null`):
```
0x70efe0  8b01          MOV EAX,dword ptr [ECX]            flow: fallthrough; six incoming DATA references from 0x7e2630, 0x7e4248, 0x7e9020, 0x7eb3e4, 0x7f4cec, 0x7f5ffc
0x70efe2  ff9084000000  CALL dword ptr [EAX + 0x84]        flow: call
0x70efe8  85c0          TEST EAX,EAX                       flow: fallthrough
0x70efea  7407          JZ 0x0070eff3                      flow: jump, conditional
0x70efec  8b8078060000  MOV EAX,dword ptr [EAX + 0x678]    flow: fallthrough
0x70eff2  c3            RET                                flow: return
0x70eff3  33c0          XOR EAX,EAX                        flow: fallthrough
0x70eff5  c3            RET                                flow: return
```
xrefs 0x70efe0 (ev_8c396410...): `["0x7e2630","0x7e4248","0x7e9020","0x7eb3e4","0x7f4cec","0x7f5ffc"]`
address-to-file-offset 0x70efe0 (ev_5c8e3083...): `{"address":"0x70efe0","file_offset":3207136}` (= 0x30efe0)
xrefs 0x4db1a0 (ev_3038fc4f...): `["0x521d83","0x7e27dc","0x7e91cc","0x7f61a8"]`
xrefs 0x6f3270 (ev_e03b859e...): `["0x7e2328","0x7e3f40","0x7e8d18","0x7eb0dc","0x7f49e4","0x7f5cf4"]`
xrefs 0x521d80 (ev_3e3a5479...): `["0x7eb590"]`

function 0x7c5f00 (ev_30d736aa...), assembly (complete):
```
0x7c5f00: SUB ESP, 0xc
0x7c5f03: FNSTCW word ptr [ESP]
0x7c5f06: LEA EAX, [ESP + 0x4]
0x7c5f0a: MOV EDX, dword ptr [ESP]
0x7c5f0d: AND EDX, 0xffff
0x7c5f13: CMP EDX, dword ptr [0x00822d80]
0x7c5f19: JNZ 0x007c5f26
0x7c5f1b: FISTP qword ptr [EAX]
0x7c5f1d: MOV EDX, dword ptr [EAX + 0x4]
0x7c5f20: MOV EAX, dword ptr [EAX]
0x7c5f22: ADD ESP, 0xc
0x7c5f25: RET
0x7c5f26: MOV EDX, dword ptr [0x00822d80]
0x7c5f2c: MOV dword ptr [ESP], EDX
0x7c5f2f: FLDCW word ptr [ESP]
0x7c5f32: FISTP qword ptr [EAX]
0x7c5f34: MOV EDX, dword ptr [EAX + 0x4]
0x7c5f37: MOV EAX, dword ptr [EAX]
0x7c5f39: ADD ESP, 0xc
0x7c5f3c: RET
```
xrefs 0x822d80 (ev_2743ff13...): `["0x7c5ef9","0x7c5f13","0x7c5f26"]`
read_bytes 0x822d80 length 2 (ev_e0875540...): `"bytes_hex":"7f0e"` -> control word 0x0E7F (bits 11:10 = 11 = round toward zero; bits 9:8 = 10 = 53-bit precision)

function 0x521d80 (ev_e0a2a5c3...), assembly (complete):
```
0x521d80: PUSH ESI
0x521d81: MOV ESI, ECX
0x521d83: CALL 0x004db1a0
0x521d88: MOV ECX, EAX
0x521d8a: MOV AL, byte ptr [ESI + 0x6db]
0x521d90: TEST AL, AL
0x521d92: JZ 0x00521dc5
0x521d94: MOV EAX, dword ptr [ESI + 0x6c0]
0x521d9a: MOV DL, byte ptr [EAX + 0xebd]
0x521da0: TEST DL, DL
0x521da2: JZ 0x00521dbc
0x521da4: MOV EAX, 0x55555555
0x521da9: POP ESI
0x521daa: IMUL ECX
0x521dac: SUB EDX, ECX
0x521dae: SAR EDX, 0x1
0x521db0: MOV EAX, EDX
0x521db2: SHR EAX, 0x1f
0x521db5: ADD EDX, EAX
0x521db7: ADD ECX, EDX
0x521db9: MOV EAX, ECX
0x521dbb: RET
0x521dbc: MOV EAX, ECX
0x521dbe: CDQ
0x521dbf: SUB EAX, EDX
0x521dc1: SAR EAX, 0x1
0x521dc3: ADD ECX, EAX
0x521dc5: MOV EAX, ECX
0x521dc7: POP ESI
0x521dc8: RET
```
pseudocode: `if (*(char *)(in_ECX + 0x6db) != '\0') { if (*(char *)(*(int *)(in_ECX + 0x6c0) + 0xebd) != '\0') { iVar2 = (int)((ulonglong)((longlong)iVar1 * 0x55555555) >> 0x20) - iVar1; return iVar1 + ((iVar2 >> 1) - (iVar2 >> 0x1f)); } iVar1 = iVar1 + iVar1 / 2; } return iVar1;`

function 0x70d0d0 (ev_461c68b6...), assembly (excerpt):
```
0x70d0d5: LEA EDI, [ESI + 0x150]
0x70d0dd: CALL 0x0074ff90
0x70d0e8: CALL 0x00750010
0x70d0f5: CALL dword ptr [EAX + 0x84]
0x70d104: MOV EBX, dword ptr [ESP + 0x10]
0x70d10c: MOV AL, byte ptr [ESI + EBX*0x1 + 0x29c]
0x70d119: MOV AL, 0x1
0x70d12a: MOV AL, byte ptr [ESI + EBX*0x1 + 0x29c]
0x70d135: MOV AL, byte ptr [ESI + EBX*0x1 + 0x2ae]
0x70d14a: XOR AL, AL
```
pseudocode: `cVar1 = FUN_0074ff90(); if ((cVar1 == '\0') && (cVar1 = FUN_00750010(), cVar1 == '\0')) return 0; iVar2 = (**(code **)(*in_ECX + 0x84))(); cVar1 = FUN_0074ff90(); if ((cVar1 != '\0') && (*(char *)(iVar2 + 0x29c + param_1) != '\0')) return 1; cVar1 = FUN_00750010(); if ((cVar1 != '\0') && ((*(char *)(iVar2 + 0x29c + param_1) != '\0' || (*(char *)(iVar2 + 0x2ae + param_1) != '\0')))) return 1; return 0;`

function 0x50c079 (ev_f7a03853...), pseudocode:
```
iVar1 = (**(code **)(*param_1 + 0x2c))();            // WhatAmI
if (iVar1 == 3)    return *(float *)(*(int *)(in_ECX + 0x34) + 0x130);
if (iVar1 == 0x10) return *(float *)(*(int *)(in_ECX + 0x34) + 0x128);
if (iVar1 == 0x28) return *(float *)(*(int *)(in_ECX + 0x34) + 300);   // 0x12C
return 1.0;
```

function 0x5276d0 (ev_a3d4e51d...), pseudocode excerpts: `if ((param_1 == (char *)0x0) || (param_2 == (char *)0x0)) { return param_3; }` ... `if (*pcVar7 == '$') { FUN_007ca530(pcVar7,&PTR_LAB_00825bb8,&param_3); return param_3; }` ... `iVar2 = FUN_007caff4((int)pcVar7[~uVar5 - 2]); if (iVar2 == 0x68) { FUN_007ca530(*(undefined4 *)(iVar4 + 0x10),&DAT_00825bb4,&param_3); return param_3; } param_3 = FUN_007c9bfd(*(undefined4 *)(iVar4 + 0x10));` ... `return param_3;` (exits `RET 0xc` at 0x527838 / 0x5278d5 / 0x5278e1, EAX loaded from the default slot).
function 0x5283d0 (ev_be4c09eb...), assembly (value conversion) and pseudocode:
```
0x528558: CALL 0x007ca530
0x52855d: FLD float ptr [ESP + 0x2c]
0x528564: PUSH 0x2525
0x52856e: CALL 0x007caf30
0x528576: TEST EAX, EAX
0x528578: JZ 0x00528588
0x52857a: FLD double ptr [ESP + 0x28]
0x52857e: FMUL double ptr [0x007e3808]
0x528584: FSTP double ptr [ESP + 0x28]
0x528588: FLD double ptr [ESP + 0x28]
0x528593: RET 0x10
pseudocode: FUN_007ca530(*(int *)(iVar4 + 0x10),&DAT_00825bd8,&param_1); param_3 = (double)(float)param_1; iVar4 = FUN_007caf30(*(undefined4 *)(iVar4 + 0x10),0x2525); if (iVar4 != 0) { param_3 = param_3 * 0.01; } ... return (float10)param_3;
```
function 0x526810 (ev_f2681433...), pseudocode excerpts: `if (param_1 != (char *)0x0) { ... iVar5 = FUN_004a1de0(param_1,~uVar8 - 1); if (*(int *)(in_ECX + 0x2c) != 0) { ... iVar6 = FUN_0052b750(local_c); if (iVar6 == 0) { return 0; } ... return *(undefined4 *)(*(int *)(in_ECX + 0x38) + 4); ... return DAT_00b7882c; } } return 0;` (binary search 0x5268e1-0x52690a with stride `*0x8`).

function 0x66eefc (ev_2772022c...), FUN_0066d530 (0x66d530-0x671e98), assembly:
```
0x66eeef: PUSH 0x83c9b4            ; "VeteranSpeed"
0x66eef7: CALL 0x005283d0
0x66eefc: FSTP double ptr [ESI + 0x678]
0x66f227: PUSH 0x83c8ac            ; "TrackedUphill"
0x66f22f: CALL 0x005283d0
0x66f234: FSTP double ptr [ESI + 0x768]
0x66f24e: PUSH 0x83c89c            ; "TrackedDownhill"
0x66f256: CALL 0x005283d0
0x66f25b: FSTP double ptr [ESI + 0x770]
0x66f275: PUSH 0x83c88c            ; "WheeledUphill"
0x66f27d: CALL 0x005283d0
0x66f282: FSTP double ptr [ESI + 0x778]
0x66f29c: PUSH 0x83c87c            ; "WheeledDownhill"
0x66f2a4: CALL 0x005283d0
0x66f2a9: FSTP double ptr [ESI + 0x780]
(each call also pushes the pointer from [0x007f0c9c] = PTR_s_General_007f0c9c and the existing qword at the target offset)
pseudocode L690-L692: fVar8 = (float10)FUN_005283d0(s_General_00826278,s_VeteranSpeed_0083c9b4, *(in_ECX+0x678), *(in_ECX+0x67c)); *(double *)(in_ECX + 0x678) = (double)fVar8;
pseudocode L766-L777: same for s_TrackedUphill_0083c8ac -> +0x768, s_TrackedDownhill_0083c89c -> +0x770, s_WheeledUphill_0083c88c -> +0x778, s_WheeledDownhill_0083c87c -> +0x780.
```

function 0x66b37f (ev_22a31426...), FUN_006691e0 (0x6691e0-0x66b8ff), assembly:
```
0x66b36a: MOV ECX, dword ptr [0x007f0c7c]   ; PTR_s_AudioVisual_007f0c7c
0x66b372: PUSH 0x83a370                     ; "ConditionYellow"
0x66b37a: CALL 0x005283d0
0x66b37f: FSTP double ptr [ESI + 0x1700]
pseudocode L894-L896: fVar6 = (float10)FUN_005283d0(s_AudioVisual_00839ea8,s_ConditionYellow_0083a370,in_ECX[0x5c0],in_ECX[0x5c1]); *(double *)(in_ECX + 0x5c0) = (double)fVar6;
```

function 0x5f5c60 (ev_62e78e52...), assembly (complete):
```
0x5f5c60: SUB ESP, 0x8
0x5f5c63: FILD dword ptr [ECX + 0x6c]
0x5f5c66: MOV EAX, dword ptr [ECX]
0x5f5c68: FSTP double ptr [ESP]
0x5f5c6c: CALL dword ptr [EAX + 0x88]
0x5f5c72: FILD dword ptr [EAX + 0xa0]
0x5f5c78: FDIVR double ptr [ESP]
0x5f5c7c: ADD ESP, 0x8
0x5f5c7f: RET
pseudocode: return (float10)iVar1 / (float10)*(int *)(iVar2 + 0xa0);   // iVar1 = in_ECX[0x1b], iVar2 = vtable[+0x88]()
```
function 0x578080 (ev_0c254678...), pseudocode (complete):
```
  local_8 = *param_1;
  local_4 = param_1[1];
  iVar1 = local_8 + (local_8 >> 0x1f & 0xffU);
  iVar2 = param_1[1] + (param_1[1] >> 0x1f & 0xffU);
  iVar3 = (iVar2 >> 8) * 0x200 + (iVar1 >> 8);
  if (((iVar3 < 0) || (DAT_0087f928 <= iVar3)) || (*(int *)(DAT_0087f924 + iVar3 * 4) == 0)) {
    param_1 = (int *)CONCAT22((short)((uint)iVar2 >> 8),(short)((uint)iVar1 >> 8));
    DAT_00abdc74 = param_1;
  }
  FUN_0047b3a0(&local_8);     // 0x5780ed: CALL 0x0047b3a0; POP ESI; ADD ESP,0x8; RET 0x4 (EAX passed through)
```
function 0x47b3a0 (ev_4932a5d2...), assembly (tail):
```
0x47ba94: MOVSX EDX, byte ptr [ESI + 0x11b]
0x47ba9b: IMUL EDX, dword ptr [0x0089e7c0]
0x47baa6: FILD dword ptr [ESP + 0x4]
0x47baaa: FADD double ptr [0x007e1738]
0x47bab0: CALL 0x007c5f00
0x47bab5: MOV CL, byte ptr [ESI + 0x11c]
0x47babf: TEST CL, CL
0x47bac1: JBE 0x0047bb54
...
0x47bb47: FILD dword ptr [ESP + 0x8]
0x47bb4b: FADD ST0, ST1
0x47bb4d: CALL 0x007c5f00
0x47bb58: RET 0x4
```

function 0x4b3df0 (ev_2ad20377..., FUN_004b2630 = Drive `Process`), assembly of the coefficient block:
```
0x4b3c88: MOV ESI, 0x1
0x4b3c92: CALL dword ptr [EDX + 0x84]
0x4b3c98: MOV EDX, dword ptr [EAX + 0x67c]
0x4b3c9e: LEA ECX, [ESI + ESI*0x8]
0x4b3ca1: ADD EDX, ECX
0x4b3ca3: FLD float ptr [EDX*0x4 + 0x89ea40]
0x4b3cae: FCOMP double ptr [0x007e1718]
0x4b3cb6: TEST AH, 0x41
0x4b3cb9: JNZ 0x004b3ccb
0x4b3cbb: MOV dword ptr [ESP + 0x18], 0x0
0x4b3cc3: MOV dword ptr [ESP + 0x1c], 0x3ff00000
0x4b3cd5: MOV ECX, 0x87f7e8
0x4b3cda: CALL 0x005657a0
0x4b3ce1: CALL 0x00480a30
0x4b3ce6: PUSH EAX
0x4b3cec: CALL 0x00578080
0x4b3cf4: MOV ESI, EAX
0x4b3cf6: ADD EDX, 0x9c
0x4b3d1a: CALL 0x00578080
0x4b3d1f: MOV EDI, EAX
0x4b3d21: CMP ESI, EDI
0x4b3d23: JLE 0x004b3d6a
0x4b3d2a: CALL dword ptr [EDX + 0x2c]
0x4b3d2d: CMP EAX, 0x1
0x4b3d3d: MOV ECX, dword ptr [EAX + 0x67c]
0x4b3d47: CMP ECX, 0x1
0x4b3d52: FMUL double ptr [ECX + 0x768]
0x4b3d60: FMUL double ptr [EDX + 0x778]
0x4b3d68: CMP ESI, EDI
0x4b3d6a: JGE 0x004b3db0
0x4b3d98: FMUL double ptr [EAX + 0x770]
0x4b3da6: FMUL double ptr [ECX + 0x780]
0x4b3db4: FCOMP double ptr [0x007e2800]
0x4b3dc9: MOV dword ptr [ESP + 0x1c], 0x3fe00000
0x4b3dd4: CALL 0x005f5c60
0x4b3ddf: FCOMP double ptr [EDX + 0x1700]
0x4b3deb: TEST AH, 0x41
0x4b3dee: JZ 0x004b3dfa
0x4b3df0: FMUL double ptr [0x007e7fc0]
0x4b3dfa: CMP dword ptr [EBP + 0x58], 0x40
0x4b3e00: FSTP double ptr [EBP + 0x50]
```
pseudocode L773-L817:
```
L773:   iVar8 = (**(code **)(**(int **)(in_ECX + 0xc) + 0x84))();
L774:   local_48 = (double)(float)(&DAT_0089ea40)[*(int *)(iVar8 + 0x67c) + iVar6 * 9];
L775:   if (1.0 < (float)(&DAT_0089ea40)[*(int *)(iVar8 + 0x67c) + iVar6 * 9]) {
L776:     local_48 = 1.0;
L780:   iVar8 = FUN_00578080();
L782:   iStack_1c = *(int *)(iVar6 + 0x9c);
L785:   iVar6 = FUN_00578080();
L786:   if ((iVar6 < iVar8) && (iVar12 = (**(code **)(**(int **)(in_ECX + 0xc) + 0x2c))(), iVar12 == 1)) {
L788:     if (*(int *)(iVar6 + 0x67c) == 1) { local_48 = local_48 * *(double *)(DAT_008871e0 + 0x768); }
L792:     else { local_48 = local_48 * *(double *)(DAT_008871e0 + 0x778); }
L795:   else if ((iVar8 < iVar6) && (iVar6 = (**(code **)(**(int **)(in_ECX + 0xc) + 0x2c))(), iVar6 == 1)) {
L798:     if (*(int *)(iVar6 + 0x67c) == 1) { local_48 = local_48 * *(double *)(DAT_008871e0 + 0x770); }
L802:     else { local_48 = local_48 * *(double *)(DAT_008871e0 + 0x780); }
L805:   if (local_48 == 0.0) { local_48 = 0.5; }
L808:   fVar24 = (float10)FUN_005f5c60();
L809:   if (fVar24 <= (float10)*(double *)(DAT_008871e0 + 0x1700)) { local_48 = local_48 * 0.75; }
L812:   if (*(int *)(in_ECX + 0x58) < 0x40) { *(double *)(in_ECX + 0x50) = local_48; }
L815:   else if (local_48 != *(double *)(*(int **)(in_ECX + 0xc) + 0x15e)) { (**(code **)(**(int **)(in_ECX + 0xc) + 0x544))(...); }
```
function 0x6a343f (ev_37ea75fb..., FUN_006a1c80 = Ship `Process`), assembly: identical sequence at 0x6a32d3-0x6a3476 (`0x6a32f2: FLD float ptr [EDX*0x4 + 0x89ea40]`, `0x6a3423: CALL 0x005f5c60`, `0x6a342e: FCOMP double ptr [EDX + 0x1700]`, `0x6a343a: TEST AH, 0x41`, `0x6a343f: FMUL double ptr [0x007e7fc0]`, `0x6a344f: FSTP double ptr [EBP + 0x50]`, `0x6a3470: CALL dword ptr [EAX + 0x544]`); pseudocode L760-L818 textually identical to the Drive file.

xrefs 0x89ea40 (ev_d0af7dff...): `["0x47ca58","0x4835de","0x4b3ca3","0x51895a","0x51c750","0x51c7bc","0x6740b4","0x67f882","0x67faf6","0x6a32f2","0x73fab5","0x7400a1","0x740c9c"]`
function 0x6740b4 (ev_cbd3ace2..., FUN_00674000, 0x674000-0x674237), assembly (excerpt):
```
0x674007: MOV ESI, 0x839d68
0x67400c: MOV EBX, 0x89ea44
0x674011: MOV EAX, dword ptr [ESI]
0x674016: CALL 0x00526810
0x674022: JZ 0x0067421e
0x67402a: PUSH 0x3ff00000
0x67402f: PUSH 0x0
0x674031: PUSH 0x81dbbc             ; "Hover"
0x674039: CALL 0x005283d0
0x67403e: FCOMP double ptr [0x007e1718]
0x674046: TEST AH, 0x1
0x674063: FLD double ptr [0x007e1718]
0x674070: FSTP float ptr [EBX + 0x8]
0x674075: PUSH 0x81dbd4             ; DAT_0081dbd4 = "Foot" (read_bytes)
0x6740b4: FSTP float ptr [EBX + -0x4]
0x6740b9: PUSH 0x81dbcc             ; "Track"
0x6740f8: FSTP float ptr [EBX]
0x6740fc: PUSH 0x81dbc4             ; "Wheel"
0x67413b: FSTP float ptr [EBX + 0x4]
0x674140: PUSH 0x81dbac             ; "Float"
0x674148: MOV dword ptr [EBX + 0xc], 0x3f800000
0x674186: FSTP float ptr [EBX + 0x10]
0x67418b: PUSH 0x81bb18             ; "Amphibious"
0x6741ca: FSTP float ptr [EBX + 0x14]
0x6741cf: PUSH 0x81dba0             ; "FloatBeach"
0x67420b: FSTP float ptr [EBX + 0x18]
0x67420e: PUSH 0x83d4b4             ; "Buildable"
0x674216: CALL 0x005295f0
0x67421b: MOV byte ptr [EBX + 0x1c], AL
0x67421e: ADD EBX, 0x24
0x674221: ADD ESI, 0x4
0x674224: CMP EBX, 0x89ebf4
0x67422a: JL 0x00674011
```
pseudocode L14-L16, L88-L90: `ppuVar5 = &PTR_s_Clear_00839d68; pfVar4 = (float *)&DAT_0089ea44; do { ... pfVar4 = pfVar4 + 9; ppuVar5 = ppuVar5 + 1; } while ((int)pfVar4 < 0x89ebf4);`
search "Foot" (ev_b5dcaed2...): `[{"address":"0x817b80","value":".?AVFootClass@@"},{"address":"0x822558","value":".?AV?$VectorClass@PAVFootClass@@@@"},{"address":"0x822588","value":".?AV?$DynamicVectorClass@PAVFootClass@@@@"}]`
read_bytes 0x839d68 length 48 (ev_c7b013cd...): `"bytes_hex":"1cdc810014dc8100e8ba81000cdc810058ac81007872810004dc8100fcdb8100f8db8100ecdb8100e4db8100dcdb8100"` (12 little-endian pointers: 0x81dc1c, 0x81dc14, 0x81bae8, 0x81dc0c, 0x81ac58, 0x817278, 0x81dc04, 0x81dbfc, 0x81dbf8, 0x81dbec, 0x81dbe4, 0x81dbdc)
read_bytes 0x81dbd4 length 80 (ev_00fe57e4...): `"bytes_hex":"466f6f7400000000576565647300000054756e6e656c00005261696c726f61640000000049636500526f7567680000004265616368000000526f636b00000000526f616400000000436c656172000000"` ("Foot" 0x81dbd4, "Weeds" 0x81dbdc, "Tunnel" 0x81dbe4, "Railroad" 0x81dbec, "Ice" 0x81dbf8, "Rough" 0x81dbfc, "Beach" 0x81dc04, "Rock" 0x81dc0c, "Road" 0x81dc14, "Clear" 0x81dc1c)
read_bytes 0x81bae8 / 0x81ac58 / 0x817278 length 16 (ev_59e3db79... / ev_b7c0235a... / ev_83bb0cdf...): `"5761746572000000466c7900496e6661"` ("Water"), `"57616c6c0000000044616d6167654669"` ("Wall"), `"546962657269756d0000000054616754"` ("Tiberium")

function 0x4b1150 (ev_82818cd0...; same function in fn-0x4b1f64.json ev_7bf7fc12...; instruction view instr-0x4b1f5c.json ev_e24c8928...), pseudocode lines:
```
L101  (**(code **)(**(int **)(in_ECX + 0xc) + 0x544))(*(undefined4 *)(in_ECX + 0x50));   // SetSpeedPercentage(coefficient) (+0x544: UNVERIFIED, YRpp order only)
L191  uVar10 = (**(code **)(**(int **)(in_ECX + 0xc) + 0x538))();                       // slot +0x538 = 0x4DB1A0 (Aircraft/Unit, ev_3038fc4f...) / 0x521D80 (Infantry, ev_3e3a5479...); name GetCurrentSpeed REFERENCE-SUGGESTED
L195  uStack_c8 = (~-(uint)(param_1 != '\0') & uVar10) + *(int *)(in_ECX + 0x4c);        // budget = speed + SpeedAccum
L271  if (7 < uStack_c8) {
L272    iVar8 = *(int *)(in_ECX + 0x58) * 0xc;                                           // TrackNumber * 12
L281    iStack_6c = *(int *)(&DAT_007e7a28 + iStack_c4);                                 // point list of entry (signed byte * 16)
L295    do {
L298      uStack_c8 = uStack_c8 + -7;                                                    // 7 budget units per track point
L299      iStack_7c = *(int *)(iStack_6c + iVar8 * 0xc);                                 // point[TrackIndex].x (12-byte points)
L300      iStack_78 = *(int *)(iStack_6c + iVar8 * 0xc + 4);                             // point[TrackIndex].y
L427      piVar13 = (int *)FUN_004b4780(piVar24,&iStack_7c,&iStack_d0);                  // transformed point = new X/Y
L683      *(int *)(in_ECX + 0x5c) = *(int *)(in_ECX + 0x5c) + 1;                         // TrackIndex += 1
L684    } while (7 < uStack_c8);
L686  *(int *)(in_ECX + 0x4c) = uStack_c8;                                               // leftover kept
```
instructions 0x4b1f5c (ev_e24c8928..., FUN_004b0f20, identical to the assembly array of ev_82818cd0...):
```
0x4b1510: CMP EDX, 0x7              ; loop entry test on budget
0x4b1513: JLE 0x004b1f5c
0x4b1519: MOV EDX, dword ptr [EBP + 0x58]
0x4b151c: LEA EDX, [EDX + EDX*0x2]
0x4b151f: LEA ESI, [EDX*0x4 + 0x7e7b28]        ; TrackNumber * 12
0x4b153a: MOVSX EDX, byte ptr [ESI]
0x4b153d: SHL EDX, 0x4
0x4b1546: MOV EBX, dword ptr [EDX + 0x7e7a28]   ; entry (signed byte * 16) -> point list
0x4b1596: MOV EAX, dword ptr [EBP + 0x5c]
0x4b159d: SUB EDI, 0x7
0x4b15a0: LEA ECX, [EAX + EAX*0x2]
0x4b15a7: MOV EDX, dword ptr [EBX + ECX*0x4]    ; point[TrackIndex] (12 bytes): +0
0x4b15af: MOV ECX, dword ptr [ECX + 0x4]        ; +4
0x4b16d0: MOV EAX, dword ptr [EBX + EDX*0x4 + 0x8] ; +8
0x4b16fb: CALL 0x004b4780
0x4b1a6b: CALL dword ptr [EDX + 0x1b4]          ; apply coordinate
0x4b1f4f: INC ECX
0x4b1f53: MOV dword ptr [EBP + 0x5c], ECX       ; TrackIndex += 1
0x4b1f56: JG 0x004b158f
0x4b1f64: MOV dword ptr [EBP + 0x4c], EAX       ; leftover
```
xrefs 0x7e7a28 (ev_19b22c8e...): `["0x4b0b35","0x4b1546","0x4b1ca7","0x4b22e2"]`
xrefs 0x7e7b28 (ev_5d2ddddf...): `["0x4b0b22","0x4b151f","0x4b153a","0x4b1b78","0x4b1b83","0x4b22d9","0x4b4023","0x4b4b2c","0x4b4b3b","0x4b4ba9","0x4b4bb0"]`
read_bytes 0x7e7a28 length 128 (ev_732a3cbc...), as little-endian dwords in 16-byte units: `0x0 0x0 0xc0 0x0 | 0x7e6258 0xffffffff 0x0 0xffffffff | 0x7e6378 0xffffffff 0x0 0xffffffff | 0x7e64f8 0x25 0xc 0x16 | 0x7e6790 0x1a 0xb 0x13 | 0x7e6968 0x2d 0xf 0x1f | 0x7e6c50 0x2c 0x10 0x1b | 0x7e6f00 0xffffffff 0x0 0xffffffff`
read_bytes 0x7e7b28 length 128 (ev_24c49978...), as little-endian dwords in 12-byte units: `0x1 0x0 0x0 | 0x703 0x20 0x8 | 0x904 0x40 0x8 | 0x0 0x60 0x0 | 0x0 0x80 0x0 | 0x0 0xa0 0x0 | 0x904 0xc0 0xa | 0x703 0xe0 0xa | 0x806 0x0 0xf | 0x2 0x20 0x0 | 0x806 0x40 ...`

function 0x4cda78 (ev_e8f8f023..., FUN_004cd600 = Fly per-frame), assembly (excerpt):
```
0x4cd682: LEA EDI, [ESI + 0x4]
0x4cda0b: CALL dword ptr [EAX + 0x10]           ; on [EDI]; AL gates the frame
0x4cda1b: CALL dword ptr [EDX + 0x84]           ; on [ESI + 0xc] (LinkedTo): Type
0x4cda24: MOV dword ptr [ESP + 0x2c], EAX
0x4cda6f: MOV EAX, dword ptr [EDI]
0x4cda71: PUSH EDI
0x4cda72: CALL dword ptr [EAX + 0x84]           ; ILocomotion slot +0x84 of this+0x4: integer speed
0x4cda78: TEST EAX, EAX                         ; Phobos hook site (6 bytes with the next line)
0x4cda7a: MOV dword ptr [ESP + 0x18], EAX
0x4cda7e: JLE 0x004cdb4c
0x4cda87: SUB ECX, 0x3fff
0x4cda99: FMUL double ptr [0x007e2810]
0x4cdabd: CALL 0x004cacb0
0x4cdac2: FMUL double ptr [ESP + 0x20]
0x4cdac6: FSUBR double ptr [ESP + 0x28]
0x4cdaca: CALL 0x007c5f00
0x4cdad5: CALL 0x004cad00
0x4cdada: FMUL double ptr [ESP + 0x28]
0x4cdae1: FIADD dword ptr [ESP + 0x50]
0x4cdae5: CALL 0x007c5f00
0x4ce241: FILD dword ptr [EDX + 0x2f8]
0x4ce247: FDIVR ST0, ST1
0x4ce260: FST double ptr [ESI + 0x40]
0x4ce28b: FMUL double ptr [0x007e1738]
0x4ce297: FSTP double ptr [ESI + 0x48]
0x4ce449: FLD double ptr [ESI + 0x48]
0x4ce44c: FCOMP double ptr [ESI + 0x40]
0x4ce459: FADD double ptr [0x007e3860]
0x4ce47c: FSUB double ptr [0x007e3860]
0x4ce495: FSTP double ptr [ESI + 0x48]
```
pseudocode 231: `dVar1 = (double)((short)uVar10 + -0x3fff) * -9.587672516830327e-05;`; 430-434: `dVar1 = dVar3 / (double)*(int *)(uStack_58 + 0x2f8); if (1.0 < dVar1) { dVar1 = 1.0; } *(double *)(in_ECX + 0x40) = dVar1;`; 504-516: `+0x48` moved toward `+0x40` by 0.1. No assembly line of FUN_004cd600 contains `0x678` or `0x38c`.
xrefs 0x4ce4b0 (ev_0d6c3caf...): `[]`

function 0x54d138 (ev_9a13d9d4..., FUN_0054d0f0 = Jumpjet per-frame), assembly (excerpt):
```
0x54d138: FLD double ptr [ESI + 0x78]
0x54d13b: FCOMP double ptr [ESI + 0x70]
0x54d145: FLD float ptr [ESI + 0x30]
0x54d148: FADD double ptr [ESI + 0x70]
0x54d14e: FILD dword ptr [ESI + 0x20]
0x54d166: FSTP double ptr [ESI + 0x70]
0x54d176: FLD float ptr [ESI + 0x30]
0x54d179: FMUL double ptr [0x007e48f0]
0x54d17f: FSUBR double ptr [ESI + 0x70]
0x54d182: FCOM double ptr [0x007e2800]
0x54d19d: FILD dword ptr [ESI + 0x20]
0x54d1a6: FDIVR double ptr [ESI + 0x70]
0x54d1ae: CALL dword ptr [EAX + 0x544]
0x54d562: FLD double ptr [ESI + 0x70]
0x54d575: CALL 0x007c5f00
0x54d58e: SUB ECX, 0x3fff
0x54d59c: FMUL double ptr [0x007e2810]
0x54d5c0: CALL 0x004cacb0
0x54d5c5: FMUL double ptr [ESP + 0x20]
0x54d5c9: FSUBR double ptr [ESP + 0x30]
0x54d5cd: CALL 0x007c5f00
0x54d5d8: CALL 0x004cad00
0x54d5dd: FMUL double ptr [ESP + 0x28]
0x54d5e4: FIADD dword ptr [ESP + 0x38]
0x54d5e8: CALL 0x007c5f00
0x54d607: CALL dword ptr [EAX + 0x1b4]
```
pseudocode 56-75: `if (*(double *)(in_ECX + 0x70) < *(double *)(in_ECX + 0x78)) { fVar2 = *(float *)(in_ECX + 0x30) + (float)*(double *)(in_ECX + 0x70); ... if ((float)iVar8 <= fVar2) { fVar2 = (float)iVar8; } *(double *)(in_ECX + 0x70) = (double)fVar2; } if (*(double *)(in_ECX + 0x78) < *(double *)(in_ECX + 0x70)) { fVar2 = (float)*(double *)(in_ECX + 0x70) - *(float *)(in_ECX + 0x30) * 1.5; ... if (fVar2 <= 0.0) { fVar2 = 0.0; } ... } dVar3 = *(double *)(in_ECX + 0x70) / (double)*(int *)(in_ECX + 0x20); (**(code **)(**(int **)(in_ECX + 0xc) + 0x544))();`. No `0x678`, `0x38c`, `0x8871e0` or `0x410` operand in the function.

function 0x662933 (ev_4af5eae0...): `if ((double)*(int *)(iVar16 + 0x678) < *(double *)(param_1 + 0x11)) *(double *)(param_1 + 0x11) = (double)*(int *)(iVar16 + 0x678);`
function 0x6a077f (ev_8217e49c...): `uStack_d0 = uStack_d0 - (double)*(int *)(iVar9 + 0x678) * *(double *)(iVar9 + 0x300);` guarded by `iVar8 < *(int *)(iVar9 + 0x2f8)`.

## Data layout
| Owner | Offset | Type | Meaning | Source |
|---|---|---|---|---|
| TechnoTypeClass | +0x678 | int 0..255 | Scaled `Speed=` | REA ev_a607860c; name REFERENCE-SUGGESTED (YRpp `int Speed`, Phobos hook at 0x71464A uses `&pThis->Speed`) |
| TechnoTypeClass | +0x67C | int | `SpeedType=` as table index: FUN_00476fc0 -> FUN_0048dff0 returns the position (0..7) of the matching entry of the pointer table 0x81da58..0x81da74, -1 if none; absent key keeps the old value; index 1 = "Track" | REA ev_a607860c (call site, store at 0x7121e5), ev_f6c772b6 (FUN_00476fc0), ev_bcb31614 (FUN_0048dff0); name REFERENCE-SUGGESTED (YRpp `SpeedType SpeedType`, `CCINIClass::ReadSpeedType` at 0x476FC0) |
| TechnoTypeClass | +0x2F8 / +0x300 | int / double | SlowdownDistance / DecelerationFactor (used by Ship locomotor); +0x2F8 also divides the Fly distance (ev_e8f8f023, pseudocode 430) | REA ev_8217e49c, ev_e8f8f023; names REFERENCE-SUGGESTED (YRpp `align_2FC` anchor) |
| TechnoTypeClass (object returned by vtable +0x84) | +0x29C / +0x2AE | byte[18] / byte[18] | Ability flags indexed by the FUN_0070d0d0 argument; the two tables are 0x12 bytes apart | REA ev_461c68b6; names VeteranAbilities / EliteAbilities and count 18 REFERENCE-SUGGESTED (YRpp TechnoTypeClass.h:20-39, 194-195) |
| TechnoTypeClass | +0x3B0 | double | multiplied by a slowdown ratio and stored as float at LinkedTo+0x2E8 when dist < Type+0x2F8 (0x4ce31c-0x4ce3ba) | REA ev_e8f8f023; name not identified |
| HouseTypeClass | +0x128 / +0x12C / +0x130 | float | SpeedInfantryMult / SpeedUnitsMult / SpeedAircraftMult | REA ev_27162a68; order matches YRpp field list exactly (REFERENCE-SUGGESTED names) |
| HouseClass | +0x34 | HouseTypeClass* | Type (country) | REA ev_f7a03853 reads it; name REFERENCE-SUGGESTED |
| TechnoClass | +0x21C | HouseClass* | Owner | REA ev_d12530ff reads it; name REFERENCE-SUGGESTED |
| TechnoClass | +0x150 | sub-object | Passed as `this` to FUN_0074ff90 / FUN_00750010 (tier predicates) | REA ev_461c68b6; name Veterancy REFERENCE-SUGGESTED (YRpp TechnoClass.h:628) |
| TechnoClass | +0x388 | FacingClass | facing source for the Fly position step (0x4cda62) | REA ev_e8f8f023; name REFERENCE-SUGGESTED |
| ObjectClass (`LinkedTo`, +0xc of the locomotor) | +0x6c | int | numerator of FUN_005f5c60 (Health per YRpp, REFERENCE-SUGGESTED) | REA ev_62e78e52 |
| ObjectClass | +0x9c / +0xa0 / +0xa4 | int x3 | coordinate passed to the second FUN_00578080 call and read by the Fly / Jumpjet position steps (Location per YRpp, REFERENCE-SUGGESTED) | REA ev_2ad20377, ev_e8f8f023, ev_9a13d9d4 |
| ObjectTypeClass (result of vtable +0x88) | +0xa0 | int | denominator of FUN_005f5c60 (Strength per YRpp, REFERENCE-SUGGESTED) | REA ev_62e78e52 |
| CellClass (entries of DAT_0087f924) | +0x11b / +0x11c | signed char / unsigned char | level byte scaled by DAT_0089e7c0 / ramp index | REA ev_4932a5d2 |
| FootClass | +0x578 / +0x580 | double | SpeedPercentage / SpeedMultiplier | REA ev_d12530ff, ev_82818cd0; names REFERENCE-SUGGESTED (YRpp `unused_574` anchor) |
| UnitClass | +0x6CC | int | FlagHouseIndex (-1 = none) | REA ev_d12530ff; name REFERENCE-SUGGESTED (YRpp `unknown_int_6D4` anchor) |
| InfantryClass | +0x6C0 | InfantryTypeClass* | Type (pointer whose +0xEBD byte is tested) | REA ev_e0a2a5c3 (load at 0x521d94); name REFERENCE-SUGGESTED (YRpp `sizeof(FootClass) == 0x6C0`, `InfantryClass::Type` first field; Phobos `pThis->Type`) |
| InfantryClass | +0x6DB | byte (bool) | Prone flag tested by GetCurrentSpeed; zero -> no prone adjustment | REA ev_e0a2a5c3 (0x521d8a); name `Crawling` REFERENCE-SUGGESTED (YRpp InfantryClass.h field order) |
| InfantryTypeClass | +0xEBD | byte (bool) | Selects the prone branch: non-zero -> `v - trunc(v/3)`, zero -> `v + trunc(v/2)` | REA ev_e0a2a5c3 (0x521d9a); name `Crawls` REFERENCE-SUGGESTED (Phobos hook reads `pType->Crawls` here) |
| DriveLocomotionClass | +0x4C / +0x50 / +0x58 / +0x5C / +0x60 | int / double / int / int / bool | SpeedAccum / speed coefficient (`movementspeed_50`) / TrackNumber / TrackIndex / IsOnShortTrack | REA ev_82818cd0, ev_e24c8928 (offsets used as table indices); names REFERENCE-SUGGESTED (YRpp DriveLocomotionClass.h L42-L46, same order) |
| .rdata | 0x7E7B28 | 12-byte entries, count not evidenced | Track selector: byte +0 / +1 = signed index into 0x7E7A28, byte +4 facing bits, byte +8 flags (bit 3 tested in FUN_004b2630 L886); first 128 bytes = triples with a 0x20-stepped middle word | REA ev_5d2ddddf (readers), ev_82818cd0 / ev_e24c8928 (arithmetic), ev_24c49978 (bytes) |
| .rdata | 0x7E7A28 | 16-byte entries, count not evidenced | +0 pointer to 12-byte point list (dwords +0, +4, +8), +4 / +0xC indices compared with TrackIndex, +8 point count; first 128 bytes = first word an address in 0x7e6258..0x7e6f00, then three ints | REA ev_19b22c8e (readers), ev_82818cd0 / ev_e24c8928 (arithmetic), ev_732a3cbc (bytes) |
| RulesClass (global ptr 0x8871E0) | +0x678 / +0x768 / +0x770 / +0x778 / +0x780 / +0x1700 | double | VeteranSpeed / TrackedUphill / TrackedDownhill / WheeledUphill / WheeledDownhill (all `[General]`) / ConditionYellow (`[AudioVisual]`) | REA ev_2772022c (FUN_0066d530) and ev_22a31426 (FUN_006691e0): `FSTP double ptr` after `CALL 0x005283d0` with the key string pushed; that ESI there is the object at 0x8871E0 is shown only by the readers (ev_d12530ff, ev_2ad20377); 0x8871E0 = RulesClass::Instance per YRpp (REFERENCE-SUGGESTED); YRpp field order TrackedUphill, TrackedDownhill, WheeledUphill, WheeledDownhill matches |
| RulesClass | +0x410 | int | `[JumpjetControls] Speed` | REA ev_ebf0a4ba; consumer open (row 4) |
| global | DAT_0089ea40 | float[12][9] (36-byte rows: 8 float + 1 byte Buildable + 3 pad) | ground speed table, one row per `[Land]` section (Clear, Road, Water, Rock, Wall, Tiberium, Beach, Rough, Ice, Railroad, Tunnel, Weeds), columns = SpeedType 0..7 (Foot, Track, Wheel, Hover, constant 1.0, Float, Amphibious, FloatBeach), byte "Buildable" at +0x20 | REA ev_cbd3ace2 (loader FUN_00674000), ev_d0af7dff (13 xrefs), ev_c7b013cd (section table 0x839d68), ev_00fe57e4 / ev_59e3db79 / ev_b7c0235a / ev_83bb0cdf (section and key strings); name `GroundType::Array` REFERENCE-SUGGESTED (YRpp MapClass.h:17) |
| .data | 0x822d80 | 16-bit (read as dword, masked 0xffff) | x87 control word that F2I (FUN_007c5f00) enforces before `FISTP`: bytes `7f 0e` = 0x0E7F (RC = truncate toward zero, PC = 53-bit, all exceptions masked) | REA ev_30d736aa (two reads), ev_2743ff13 (xrefs: no writer), ev_e0875540 (read_bytes) |
| vtable (Aircraft 0x7E22A4 / Unit 0x7F5C70 / Infantry 0x7EB058) | +0x84 / +0x38C / +0x538 | fn ptr | GetTechnoType -> 0x6F3270 / GetMaxSpeed (Phobos; YRpp: GetDefaultSpeed) -> 0x70EFE0 / GetCurrentSpeed -> 0x4DB1A0, 0x4DB1A0, 0x521D80 | REA xrefs ev_e03b859e (+0x84), ev_8c396410 + ev_b41714b1 (+0x38C), ev_3038fc4f + ev_3e3a5479 (+0x538): data references at exactly base+slot for all three vtables, VERIFIED (tool output); vtable bases and slot names REFERENCE-SUGGESTED (YRpp `AbsVTable`, ObjectClass.h:89, TechnoClass.h:280, FootClass.h:71, Phobos Hooks.cpp:814) |
| vtable (Aircraft/Unit/Infantry) | +0x2C / +0x544 / +0x1B4 / +0x1B8 | fn ptr | WhatAmI / SetSpeedPercentage / coordinate setter / cell getter (the last two called by the Drive, Fly and Jumpjet locomotors with a 12-byte coord struct / returning a 2x16-bit cell) | YRpp order only for +0x2C / +0x544 (AbstractClass.h:83, FootClass.h:74); +0x1B4 / +0x1B8 roles inferred from use (ev_e24c8928, ev_e8f8f023, ev_9a13d9d4); no target function known, so no xrefs possible (UNVERIFIED) |
| LocomotionClass | +0x4 | vtable ptr | second vtable; slot +0x84 returns the Fly frame's integer speed (0x4cda6f-0x4cda72), slot +0x10 a bool gating the frame (0x4cda0b) | REA ev_e8f8f023; ILocomotion / Apparent_Speed / Is_Moving REFERENCE-SUGGESTED (YRpp Interfaces.h:178, :265 with 3 IUnknown slots) |
| LocomotionClass | +0xC | FootClass* | LinkedTo (vtable +0x544 / +0x1b4 / +0x1b8 called on it; +0x9c/+0xa0/+0xa4 = coordinates) | REA ev_9a13d9d4, ev_e8f8f023, ev_82818cd0; name REFERENCE-SUGGESTED (YRpp LocomotionClass.h:171) |
| FlyLocomotionClass | +0x40 / +0x48 | double | TargetSpeed / CurrentSpeed - ratios 0..1 from dist / Type+0x2f8; +0x48 steps by 0.1 per frame toward +0x40 | REA ev_e8f8f023; names REFERENCE-SUGGESTED (YRpp FlyLocomotionClass.h:64-65) |
| FlyLocomotionClass | +0x1C / +0x20 (/ +0x24) | int | destination x / y (/ z) used for dx, dy (pseudocode 296-298) and cell compare (490-496) | REA ev_e8f8f023; name MovingDestination REFERENCE-SUGGESTED |
| FlyLocomotionClass | +0x38 | int | compared against the height from LinkedTo vtable +0x1c8 (pseudocode 304, 410) | REA ev_e8f8f023; name FlightLevel REFERENCE-SUGGESTED |
| FlyLocomotionClass | +0x50 / +0x51 / +0x5C | byte | flags gating the speed update (0x4ce15c, 0x4ce20d, 0x4ce311, 0x4ce3c0-0x4ce3d9) | REA ev_e8f8f023; names IsTakingOff / IsLanding / ? REFERENCE-SUGGESTED |
| JumpjetLocomotionClass | +0x20 | int | Speed (cap of CurrentSpeed and divisor for SetSpeedPercentage); only read in FUN_0054d0f0 | REA ev_9a13d9d4; name REFERENCE-SUGGESTED (YRpp `int Speed`, Phobos hook 0x54D138 writes `pThis->Speed`) |
| JumpjetLocomotionClass | +0x30 | float | Accel (per-frame increment; x1.5 when decelerating) | REA ev_9a13d9d4; name REFERENCE-SUGGESTED (YRpp `float Accel`) |
| JumpjetLocomotionClass | +0x50 | int | State (2 / 3 compared at 0x54d0ff-0x54d10f) | REA ev_9a13d9d4; name REFERENCE-SUGGESTED (YRpp `State`) |
| JumpjetLocomotionClass | +0x54 | FacingClass | LocomotionFacing (angle source for the position step) | REA ev_9a13d9d4; name REFERENCE-SUGGESTED |
| JumpjetLocomotionClass | +0x70 / +0x78 | double | CurrentSpeed / MaxSpeed (per-frame step = F2I(+0x70) leptons) | REA ev_9a13d9d4; names REFERENCE-SUGGESTED (YRpp `double CurrentSpeed; double MaxSpeed`) |

Helper functions. Verified from their own code:
- FUN_005276d0 INI int reader (section, key, int default) -> EAX, default on any miss (ev_a3d4e51d...; CCINIClass::ReadInteger REFERENCE-SUGGESTED, yrpp CCINIClass.h:99); called at 0x71465a with default -1 (row 3).
- FUN_005283d0 INI double reader (section, key, double default) -> x87 ST0, default on any miss, scaled by [0x7e3808] (0.01 per pseudocode) when FUN_007caf30(value, 0x2525) != 0 (ev_be4c09eb...; CCINIClass::ReadDouble REFERENCE-SUGGESTED, CCINIClass.h:108); also used by FUN_0066d530 / FUN_006691e0 (ev_2772022c, ev_22a31426) and by FUN_00674000 with default 1.0 (ev_cbd3ace2...).
- FUN_00526810 INI section lookup by name hash -> entry value or 0 (search-miss path returns the global [0xb7882c], value UNVERIFIED) (ev_f2681433...; CCINIClass::GetSection REFERENCE-SUGGESTED, CCINIClass.h:64).
- FUN_0070d0d0 ability-flag lookup by byte index (ev_461c68b6...: `byte [Type + 0x29c + arg]` / `[Type + 0x2ae + arg]` gated by FUN_0074ff90 / FUN_00750010 on this+0x150; YRpp name TechnoClass::HasAbility REFERENCE-SUGGESTED).
- FUN_007c5f00 F2I (ev_30d736aa...: FNSTCW / FLDCW from DAT_00822d80 / FISTP qword, 64-bit return; control word 0x0E7F = truncation toward zero, ev_e0875540...; YRpp name Game::F2I64 REFERENCE-SUGGESTED).
- FUN_00521d80 InfantryClass::GetCurrentSpeed wrapper (ev_e0a2a5c3...: calls FUN_004db1a0, prone branches v - trunc(v/3) / v + trunc(v/2) on this+0x6DB and Type+0xEBD; Phobos hook 0x521D94 "InfantryClass_CurrentSpeed_ProneSpeed" REFERENCE-SUGGESTED).
- 0x70EFE0 (label, not a Ghidra function): "max speed" getter - `this->vtable[+0x84]()` then dword at +0x678 of the result, 0 if the result is null; returns int in EAX, no stack args (ev_6deeab10..., ev_b41714b1..., ev_d3f7d56d...; Phobos name TechnoClass_GetMaxSpeed REFERENCE-SUGGESTED, Hooks.cpp:814; YRpp has no GetMaxSpeed virtual, nearest is GetDefaultSpeed, TechnoClass.h:280).
- FUN_005f5c60 (0x5f5c60-0x5f5c7f): returns `(double)this[+0x6c] / (double)(this->vtable[+0x88]())[+0xa0]` on the x87 stack; used as the ConditionYellow comparand (ev_62e78e52...). ObjectClass::GetHealthPercentage per YRpp (REFERENCE-SUGGESTED, inline, address not named).
- FUN_00578080 (0x578080-0x5780f8): coordinate (x, y leptons) -> cell via `>> 8` and `cellY * 0x200 + cellX` into `DAT_0087f924` (fallback cell 0xabdc50), then returns FUN_0047b3a0(cell, &xy) (ev_0c254678...). MapClass::GetCellFloorHeight / GetZPos per YRpp (REFERENCE-SUGGESTED).
- FUN_0047b3a0 (0x47b3a0-0x47bb5a): `int` floor height of a cell: `F2I((signed char)cell[+0x11b] * DAT_0089e7c0 + [0x7e1738])` plus a ramp term from `x & 0xff`, `y & 0xff` and the table at 0x81c900 when `(unsigned char)cell[+0x11c] != 0` (ev_4932a5d2...). CellClass::GetFloorHeight per YRpp (REFERENCE-SUGGESTED); the constants' values are UNVERIFIED.
- FUN_00476fc0 SpeedType= reader (FUN_00528a10 string read + FUN_0048dff0 lookup; ev_f6c772b6...); FUN_0048dff0 string-to-index over the table 0x81da58..0x81da74 (ev_bcb31614...).
- FUN_00674000 loader of DAT_0089ea40 (ev_cbd3ace2...; RulesClass::Read_LandCharacteristics per YRpp RulesClass.h:191, REFERENCE-SUGGESTED).
- FUN_0066d530 / FUN_006691e0 RulesClass `[General]` / `[AudioVisual]` loaders (ev_2772022c, ev_22a31426; RulesClass::Read_General / Read_AudioVisual per YRpp RulesClass.h:128 / :101, REFERENCE-SUGGESTED).

Roles inferred from use only (UNVERIFIED): FUN_006f3270 = vtable slot +0x84 of the Aircraft/Unit/Infantry/Building vtables (ev_e03b859e...) but not a Ghidra procedure (function/instructions errors, fn-0x6f3270.json / instr-0x6f3270.json), name GetTechnoType REFERENCE-SUGGESTED (YRpp ObjectClass.h:89); FUN_0074ff90 / FUN_00750010 byte-returning predicates on TechnoClass+0x150 (ev_461c68b6, called from FUN_0070d0d0), bodies not decoded; FUN_00528a10 INI string reader and FUN_007c8d20 string compare (YRpp `ReadString` at 0x528A10, `strcmpi` at 0x7C8D20 (CRT.h:88) REFERENCE-SUGGESTED); FUN_0048e030 called on the buffer before the read (role unknown); FUN_005295f0 INI bool/byte reader (key "Buildable", result in AL); FUN_00480a30 / FUN_005657a0 cell-coordinate getter and cell lookup on 0x87f7e8 (CellClass::GetCellCoords per YRpp CellClass.h:190, REFERENCE-SUGGESTED; FUN_005657a0 is not named); FUN_004cacb0 / FUN_004cad00 take an angle double, return a double; used as the y / x direction factors of the Fly and Jumpjet position step (sin/cos inferred); FUN_004c93d0 facing getter on a FacingClass (returns pointer to a 16-bit value); FUN_004b4780 track-point transform (Rule C); the string helpers FUN_007ca530 / FUN_007caff4 / FUN_007c9bfd / FUN_007caf30 used by the INI readers.

## Rule (plain language)

### A. Parsing `Speed=` (FUN_00712170, 0x71464a-0x71469f)
1. Read `Speed` from the type's section as an integer, default -1 (FUN_005276d0, row 22: returns the pushed default -1 when the section or key is missing or the value is empty).
2. If the result is -1 (missing key or explicit -1), keep the existing value.
3. Clamp to 0..100.
4. Multiply by 256 and divide by 100, truncating (magic-number divide `0x51EB851F`, shift 5, sign fix).
5. Cap at 255 and store at TechnoTypeClass+0x678.
Phobos's `INI_EX::ReadSpeed` reproduces this (`min(v,100)*256/100`, F2I, `min(speed,255)`), except it leaves negative values unchanged where the game clamps them to 0.
`SpeedType=` (0x7121d1-0x7121e5, rows 3b / 3c): read as a string by FUN_00476fc0; the existing +0x67C value is returned when the key is absent, else FUN_0048dff0 returns the index (0..7) of the first entry of the 8-pointer table at 0x81da58 that FUN_007c8d20 reports as equal (result 0), or -1. Index 1 = "Track" (0x81da5c -> 0x81dbcc, ev_bcb31614...); the other seven strings are not visible in the output.

### B. Current speed of a moving object (FUN_004db1a0)
```
max   = GetMaxSpeed()                                   // vtable +0x38C -> 0x70EFE0: Type (via vtable +0x84) -> +0x678, or 0 if no Type (ev_6deeab10...)
mult  = owner country Speed{Aircraft|Infantry|Units}Mult chosen by WhatAmI() (3 / 16 / 40), else 1.0
v     = F2I(max * mult * this->SpeedMultiplier)         // +0x580
if FUN_0070d0d0(0) != 0:  v = F2I(v * Rules->VeteranSpeed)     // ev_461c68b6...: tests byte [Type+0x29c+0] (and [Type+0x2ae+0] on the FUN_00750010 path); index 0 = Ability::Faster per YRpp GeneralDefinitions.h:200 (REFERENCE-SUGGESTED)
v     = F2I(v * this->SpeedPercentage)                  // +0x578
if WhatAmI() == 1 /*Unit*/ and this->FlagHouseIndex != -1:  v = v / 2   (toward zero)
return v
```
Each F2I result (FUN_007c5f00, ev_30d736aa...) is truncated toward zero (x87 RC=11 from DAT_00822d80 = 0x0E7F, ev_e0875540...) with `FISTP qword` before the next step; the caller uses the low 32 bits. The routine compares the current control word with DAT_00822d80 and loads it only when they differ, and never restores the caller's word; so after the first F2I call the thread's control word stays 0x0E7F (53-bit precision, truncation) for all later x87 arithmetic, including the `FMUL`s of this function. Before the first call the process default applies (UNVERIFIED which). Within a step the products are formed on the x87 stack and only then passed to F2I (0x4db1cd-0x4db1db: FILD, FMUL, FMUL, CALL - no intermediate store). A reimplementation in IEEE double with round-to-nearest can differ from the game for products that are not exactly representable (see the 255 x 1.2 row of the Test values); treat such cases as open.
AircraftClass and UnitClass expose this as `GetCurrentSpeed` (vtable +0x538 -> 0x4DB1A0 in both vtables, ev_3038fc4f...; InfantryClass vtable +0x538 -> FUN_00521d80, ev_3e3a5479...). Vtable slots +0x84 / +0x38C / +0x538 of the Aircraft, Unit and Infantry vtables are VERIFIED by REA xrefs (Evidence row 18); +0x544 and +0x2C are not. The slot +0x84 target 0x6F3270 is not a Ghidra procedure (row 26); the name GetTechnoType is REFERENCE-SUGGESTED.
InfantryClass (FUN_00521d80, ev_e0a2a5c3...) calls it and then applies a prone adjustment in integer arithmetic (no FPU, no F2I): if the byte at this+0x6DB is zero the value is returned unchanged; otherwise, if the byte at Type+0xEBD (Type = pointer at this+0x6C0, loaded at 0x521D94) is non-zero, the result is `v - trunc(v/3)` (two thirds, computed with the immediate 0x55555555 magic divide, 0x521DA4-0x521DBB), else `v + trunc(v/2)` (one and a half, 0x521DBC-0x521DC3). There is no constant at 0x521D94 and no rules key is read in this function; the names Crawling (+0x6DB) and InfantryTypeClass::Crawls (+0xEBD) are REFERENCE-SUGGESTED (Phobos hook `InfantryClass_CurrentSpeed_ProneSpeed`, YRpp field order).

### C. Per-frame movement, Drive locomotor (FUN_004b0f20)
1. Each frame: `budget = GetCurrentSpeed() + SpeedAccum` (the speed term is skipped when the function's bool argument is set).
2. While `budget > 7`: subtract 7 and advance one track point. The point is found as
   `e = DAT_007e7b28 + TrackNumber*12` (12-byte entries), `t = DAT_007e7a28 + (signed char)e[0]*16` (16-byte entries; `e[1]` instead of `e[0]` when the byte at this+0x60 is set), `p = *(int*)t + TrackIndex*12` (12-byte points: dwords +0, +4, +8).
   The new X/Y is what `FUN_004b4780(&out, &p[0..4], &p[8])` returns for the point (0x4b16fb-0x4b1737), applied through vtable +0x1B4 (0x4b1a6b); then `TrackIndex += 1` (0x4b1f4f). So one iteration costs 7 budget units, advances TrackIndex by 1 and moves by the difference between consecutive transformed track points, not by 7 leptons. A point with x == y == 0 at TrackIndex != 0 marks the end of the track (0x4b15ad-0x4b15c8). When `TrackIndex` equals the entry's dword +4 the locomotor may switch to another entry chosen from the facing and `e[4]` (L553-L586), setting `TrackIndex = (dword +8) - 1`. Cell coordinates are derived from leptons with `>> 8` (256 leptons per cell), seen at L417-L418 and L436-L437. Loop: entry test 0x4b1510, body 0x4b158f-0x4b1f56, exit 0x4b1f5c (ev_e24c8928...). Table layouts: bytes-0x7e7a28 / bytes-0x7e7b28 (ev_732a3cbc... / ev_24c49978...), rows 11b / 11c.
   What FUN_004b4780 does with the point (UNVERIFIED) and the unit of the point dwords (UNVERIFIED) are open.
3. Store the remaining budget in `SpeedAccum` for the next frame (0x4b1f64). The post-loop tail 0x4b1f5c-0x4b25f9 reads the next point once more when `0 < leftover` and `TrackNumber > -1` (partial step, not decoded).
4. Before moving, the locomotor calls `SetSpeedPercentage(coefficient at +0x50)` (L101); the coefficient is produced by `Process` (see D) and clamped to at least 0.2 (constant 0x7E3548) while crushing (0x4b1150-0x4b1173).
Inference (UNVERIFIED, AP-19 measurement pending): the value returned by `GetCurrentSpeed()` is in leptons per frame; `Speed=100` corresponds to 255 leptons (just under one cell) per frame before multipliers. The `>> 8` cell conversions and the 7-unit cost per track point are consistent with this but do not prove it.

### D. Speed coefficient (FUN_004b2630 = Drive `Process`, 0x4b2630-0x4b4766, ev_2ad20377..., pseudocode L772-L817)
```
coef = *(float*)(DAT_0089ea40 + 4*(Type->SpeedType (+0x67C) + landIndex * 9))   // 12 rows x 36 bytes, loader FUN_00674000 (ev_cbd3ace28308a7569a525a44a684264d78d40366a83f246c6b790ca85ec92e25)
if coef > 1.0: coef = 1.0                                                        // reader cap: FCOMP [0x7e1718], ev_2ad20377... 0x4b3cae-0x4b3cc3 (pseudocode L775-L776); Ship ev_37ea75fb... 0x6a32fd-0x6a3312
if WhatAmI() == 1 (Unit):
    cellHeight = FUN_00578080(FUN_00480a30(FUN_005657a0(MapInstance, &tmp, &cellXY)))   // call 1, 0x4b3cec: height of a looked-up cell
    objHeight  = FUN_00578080(&LinkedTo->+0x9c)                                          // call 2, 0x4b3d1a: height at the object's +0x9c coordinate
    if   cellHeight > objHeight: coef *= (SpeedType == 1 ? Rules+0x768 : Rules+0x778)   // TrackedUphill / WheeledUphill (row 16b, ev_2772022c93b2c19e906fded4d1be05172c67979986372008e57cc64adc1bec48); CMP ESI,EDI / JLE at 0x4b3d21
    elif cellHeight < objHeight: coef *= (SpeedType == 1 ? Rules+0x770 : Rules+0x780)   // TrackedDownhill / WheeledDownhill (row 16, ev_2772022c...); CMP ESI,EDI / JGE at 0x4b3d6a
    // SpeedType 1 = "Track": FUN_0048dff0 returns the index of the matching entry of the 8-pointer table at 0x81da58; entry 1 (0x81da5c) points to "Track" at 0x81dbcc (ev_bcb316147b322b39b3d9449cd8fa52d559a1b1fc701fbbe02b776e12319cecab);
    // the other seven strings are not visible in the output (YRpp enum order Foot, Track, Wheel, Hover, Winged, Float, Amphibious, FloatBeach is REFERENCE-SUGGESTED for them)
    // operator and argument order of the height test read from ev_2ad20377... (AP-16); which cell call 1 looks up (cellXY = uStack_c, built from DAT_0089f688[dir] + coordinate>>8 at L176-L179 but rewritten on other paths) is UNVERIFIED
if coef == 0.0: coef = 0.5
if FUN_005f5c60() <= Rules->ConditionYellow (+0x1700, [AudioVisual], ev_22a31426...): coef *= 0.75   // constant 0x7E7FC0; `<=` = FCOMP + TEST AH,0x41 at 0x4b3ddf-0x4b3deb
if this->TrackIndex (+0x58) < 0x40: this->coef (+0x50) = coef
elif coef != LinkedTo->SpeedPercentage (+0x578): LinkedTo->SetSpeedPercentage(coef)         // vtable +0x544 (UNVERIFIED, YRpp order only)
```
Heights come from two FUN_00578080 calls (0x578080-0x5780f8, ev_0c254678c6b2ea9eeb70e5c1d86dfd9b2cb36c82b2d43103327253ba9e78c7dd; MapClass::GetCellFloorHeight / GetZPos per YRpp MapClass.h:330/484, REFERENCE-SUGGESTED): the function takes a pointer to an (x, y) coordinate, converts both to cell units with `>> 8`, indexes the cell table `DAT_0087f924` with `cellY * 0x200 + cellX` (bounds `DAT_0087f928`, fallback cell 0xabdc50) and returns the `int` that FUN_0047b3a0 (0x47b3a0-0x47bb5a, ev_4932a5d2340faec97e79b524555e20a5bb031e789f704e820d8eca7a249cda9c; CellClass::GetFloorHeight per YRpp CellClass.h:186) computes from the cell: `F2I((signed char)cell[+0x11b] * DAT_0089e7c0 + [0x7e1738])`, plus a ramp term from `x & 0xff`, `y & 0xff` and the table at 0x81c900 when `(unsigned char)cell[+0x11c] != 0`. In Drive `Process` the first call (0x4b3cec) receives the coordinate that FUN_00480a30 returns for the cell FUN_005657a0 looks up (ECX = 0x87f7e8, MapClass::Instance per YRpp) and the second call (0x4b3d1a) receives a copy of `LinkedTo+0x9c..+0xa4` (ObjectClass::Location per YRpp ObjectClass.h:322, REFERENCE-SUGGESTED); the "uphill" factors apply when the first result is greater, the "downhill" factors when it is smaller (`CMP ESI,EDI; JLE` / `JGE`, ev_2ad20377...). FUN_005f5c60 (0x5f5c60-0x5f5c7f, ev_62e78e5252e6cddff837a5ae8d740d55c392b5be225d2a21baefb7ab14d81c6d) returns on the x87 stack `(double)*(int*)(this+0x6c) / (double)*(int*)(this->vtable[+0x88]()+0xa0)` (FILD / FILD / FDIVR); this matches YRpp's inline `ObjectClass::GetHealthPercentage() = Health / GetType()->Strength` (ObjectClass.h:206-207, REFERENCE-SUGGESTED; the address is not named in YRpp or Phobos, Phobos hooks the following instruction at 0x4B3DF0 as `LocomotionClass_Process_DamagedSpeedMultiplier`, Techno/Hooks.cpp:909).
The Ship locomotor (FUN_006a1c80, 0x6a1c80-0x6a3d95, ev_37ea75fb7220468fda6c807378a9098f4df7eb30a1522f4d3f28470308cd5e6a) has the identical sequence at 0x6a32d3-0x6a3476 (pseudocode L774-L818 of that file, same line numbers as the Drive file): table read at 0x6a32f2, 0.75 multiply at 0x6a343f, store at 0x6a344f. That FUN_006a1c80 is the Ship locomotor's `Process` is REFERENCE-SUGGESTED (Phobos hook 0x6A343F "// Ship"); the function carries no string.
The table at DAT_0089ea40 is filled by FUN_00674000 (0x674000-0x674237, ev_cbd3ace28308a7569a525a44a684264d78d40366a83f246c6b790ca85ec92e25; RulesClass::Read_LandCharacteristics per YRpp): 12 rows (`MOV EBX,0x89ea44 ... ADD EBX,0x24 ... CMP EBX,0x89ebf4; JL`), one per section name in the pointer table at 0x839d68 (in this order: Clear, Road, Water, Rock, Wall, Tiberium, Beach, Rough, Ice, Railroad, Tunnel, Weeds; ev_c7b013cd2e60ad4c7b183a9534f5eb674708c460938a6fe1f02d5ea5ae7d9362 + ev_00fe57e42dc4e651c1492f46513f6dd0e006d36b031f9c897af27acfde1a711e / ev_59e3db791a35505c546374799a40dc225fd37d95a85366a3dea29e8d2b7c6c74 / ev_b7c0235aadd8e93f6d8d8553151b1a13294f2f5cf9d987da1b1f7af9520cc593 / ev_83bb0cdffd2dcefbbaab38f8330dff78dee30e770601ba59cc01af88f257e6ed), 36 bytes per row = 9 dwords. A row is skipped (kept as is) when FUN_00526810 returns 0 for its section. Columns 0-7 are floats read with FUN_005283d0 (default 1.0, stored as min(value, 1.0) via `FCOMP [0x7e1718]`) for the keys "Foot" (0x81dbd4, ev_00fe57e4...), "Track", "Wheel", "Hover", (column 4: constant 1.0f, no key), "Float", "Amphibious", "FloatBeach"; column 8 (index 8) is NOT a float: the loader writes one byte there from FUN_005295f0 with key "Buildable" (`MOV byte ptr [EBX + 0x1c], AL`) and leaves the other 3 bytes unwritten. SpeedType 0..7 therefore selects a float column; the loader shows no percent-to-fraction division (FUN_005283d0 multiplies by 0.01 only when FUN_007caf30(value, 0x2525) != 0, row 23; what that tests is UNVERIFIED). The row index is `*(int*)(cell+0xec)` or 1 (L766-L770); neither reader range-checks it.

### E. Other locomotors
- Rocket (FUN_006622c0): per-frame `CurrentSpeed += Type->Acceleration-like float`, capped at `Type->Speed` (+0x678) read as double.
- Ship (FUN_006a05f0): within `Type->SlowdownDistance` of the target, `speed -= Type->Speed * Type->DecelerationFactor` per frame, floor 0.3 (or 0.1 in another branch).
- Ship `Process` (FUN_006a1c80): speed coefficient exactly as D, ev_37ea75fb... (no new facts beyond D).
- Fly (FUN_004cd600, 0x4cd600-0x4ce4a9, ev_e8f8f023f2e73e8631f1780d2aa8bcb480f345c8e83eedc8dccf0d03b00df44f): per frame, `speed = (this+0x4)->vtable[+0x84]()` (ILocomotion slot +0x84, Apparent_Speed per YRpp, REFERENCE-SUGGESTED; the routine itself - Phobos "0x4CE4B0" - is not a Ghidra function and could not be decompiled, ev_0d6c3caf... xrefs empty). If `speed > 0`: `new_x = F2I(x + FUN_004cad00(angle) * speed)`, `new_y = F2I(y - FUN_004cacb0(angle) * speed)`, `angle = (facing16 - 0x3fff) * DAT_007e2810` (-9.587672516830327e-05). Type+0x678 and vtable +0x38C are not read in FUN_004cd600, and it does not call FUN_004db1a0. Two locomotor doubles are updated per frame: `+0x40 = min(1.0, dist / Type[+0x2f8])` (0.0 or 0.1 when below 0.1, depending on `dist < 86`; 1.0 / 0.0 in other branches) and `+0x48` moves toward `+0x40` by at most 0.1 per frame (halved when `+0x40` drops to 0; floor 0.05 while `dist > 0`; capped at `dist`). YRpp names TargetSpeed / CurrentSpeed for +0x40 / +0x48 (REFERENCE-SUGGESTED). How Type+0x678 and +0x48 are combined into the integer `speed` is inside the slot +0x84 routine: OPEN. Phobos hooks 0x4CDA78 (inside FUN_004cd600, replaces `TEST EAX,EAX; MOV [ESP+0x18],EAX`) and 0x4CE4BF compute `Type->Speed * CurrentSpeed * multiplier` (REFERENCE only).
- Jumpjet (FUN_0054d0f0, 0x54d0f0-0x54d6c5, ev_9a13d9d438894a55084bb4fcf8b8ee958ffc8644733699921a6cfece1ff98bde): per frame, if `MaxSpeed` (+0x78) > `CurrentSpeed` (+0x70): `CurrentSpeed += Accel` (+0x30, float), capped at `(double)Speed` (+0x20, int); if `MaxSpeed` < `CurrentSpeed`: `CurrentSpeed -= Accel * 1.5` (DAT_007e48f0), floor 0.0. Then `LinkedTo->vtable[+0x544](CurrentSpeed / Speed)` (SetSpeedPercentage, name REFERENCE-SUGGESTED). Position step: `speed = F2I(CurrentSpeed)`; `new_x = F2I(x + FUN_004cad00(angle) * speed)`, `new_y = F2I(y - FUN_004cacb0(angle) * speed)` with `angle = (facing16 - 0x3fff) * DAT_007e2810` (-9.587672516830327e-05), written via `LinkedTo->vtable[+0x1b4]`. `CurrentSpeed` is zeroed near the destination (pseudocode 177-184). Type+0x678, vtable +0x38C/+0x538 and RulesClass+0x410 are NOT read in this function; the Jumpjet path bypasses FUN_004db1a0 (Rule B). Field names per YRpp JumpjetLocomotionClass.h (REFERENCE-SUGGESTED); where +0x20 and +0x78 are written is open.

## Pseudocode summary
See Rule sections A-E; they are original wording of 0x71464a-0x71469f and 0x7121d1-0x7121e5 (A), 0x4db1a0-0x4db245 and 0x521d80-0x521dc8 (B), 0x4b0f20-0x4b2607 with the loop 0x4b158f-0x4b1f56 (C), 0x4b2630-0x4b4766 / 0x6a1c80-0x6a3d95 (D), 0x4cd600-0x4ce4a9 and 0x54d0f0-0x54d6c5 (E).

## Test values
Parsing (section A), from the decoded rule (ev_a607860c...):
| Input `Speed=` | Stored +0x678 |
|---|---|
| missing / -1 | unchanged |
| -5 | 0 |
| 0 | 0 |
| 4 | 10 |
| 6 | 15 |
| 99 | 253 |
| 100 | 255 |
| 150 | 255 |

`SpeedType=Track` -> +0x67C = 1 (ev_bcb31614...); other strings: index REFERENCE-SUGGESTED only.

F2I (FUN_007c5f00), derived from ev_30d736aa... + ev_e0875540... (control word 0x0E7F = truncate toward zero): 7.5 -> 7, 8.5 -> 8, -5.0 -> -5, -4.5 -> -4, 2.4 -> 2, 2.6 -> 2, 0.0 -> 0.

Current speed (section B), from the decoded rule (ev_d12530ff...), all inputs hypothetical:
| max | country mult | SpeedMultiplier | Faster | VeteranSpeed | SpeedPercentage | flag | result |
|---|---|---|---|---|---|---|---|
| 255 | 1.0 | 1.0 | no | - | 1.0 | no | 255 |
| 255 | 1.2 | 1.0 | no | - | 1.0 | no | 306 if the x87 product is formed with round-to-nearest (255 * 1.2 == 306.0 in IEEE double, checked in AP-14-addendum); UNVERIFIED: with the control word 0x0E7F in force (RC = truncate) the 53-bit product of 255 and the double 1.2 (which is slightly below 1.2) can land just below 306 and F2I would then give 305 |
| 10 | 1.0 | 1.0 | no | - | 0.75 | no | F2I(7.5) = 7 (truncation, ev_e0875540...) |
| 10 | 1.0 | 1.0 | no | - | 1.0 | yes (Unit) | 5 |

Infantry prone adjustment (FUN_00521d80, ev_e0a2a5c3...), after FUN_004db1a0 returned v:
| v | this+0x6DB (prone) | Type+0xEBD (Crawls) | result |
|---|---|---|---|
| any | 0 | - | v |
| 10 | set | set | 7 |
| 10 | set | 0 | 15 |
| 255 | set | set | 170 |
| 255 | set | 0 | 382 |
| 3 | set | set | 2 |

TODO (AP-19, pending): take real `Speed=` values from the user's `rulesmd.ini` and a measured in-game distance per frame to confirm the leptons-per-frame reading; use the 7-budget-units-per-track-point rule of section C and the truncating F2I.

## Open questions
- Section B: the 255 x 1.2 test value depends on whether the x87 `FMUL`s in FUN_004db1a0 run under the truncating control word 0x0E7F (in force after the first F2I call of the thread) or under the process default (before it); neither the initial control word nor other `FLDCW` sites were searched, and whether DAT_00822d80 is ever written at run time is UNVERIFIED (ev_2743ff13... lists no writer).
- Section C: FUN_004b4780 (called per track point with the point's x/y and third dword) is not decoded; the unit of the track points is therefore inferred from the `>> 8` cell conversion only. The leptons-per-frame reading of `GetCurrentSpeed()` is still an inference (AP-19 measurement pending).
- Section C: readers of the track tables outside FUN_004b0f20 / FUN_004b2630 (0x4b0b22, 0x4b0b35, 0x4b4b2c, 0x4b4b3b, 0x4b4ba9, 0x4b4bb0) are in functions not yet decompiled; the entry counts of 0x7E7A28 / 0x7E7B28 are not evidenced; the post-loop tail 0x4b1f5c-0x4b25f9 (partial step with 0 < leftover <= 7) is not decoded.
- Section D: the cell that the first FUN_00578080 call evaluates (argument `uStack_c` of FUN_005657a0 at L778) is not traced; the values of DAT_0089e7c0, [0x7e1738], [0x7e2800] and the 0x81c900 ramp table used by FUN_0047b3a0 are not in the output; the meaning of `cell+0xec` (row index of the ground table) is not shown.
- Section D: strings at table indices 0 and 2..7 of 0x81da58 (SpeedType) are not yet quoted from tool output (REFERENCE-SUGGESTED YRpp order only; one `search "Track"` run or a data read of 0x81da58..0x81da78 would list them).
- Section D: whether FUN_005283d0 divides the `[Land]` values by 100: the loader FUN_00674000 stores the reader's double as float without scaling, and FUN_005283d0 multiplies by [0x7e3808] (0.01 per pseudocode) only when FUN_007caf30(value, 0x2525) != 0 (ev_be4c09eb...); what FUN_007caf30 tests (a "%" suffix is a guess) is UNVERIFIED.
- Section D: the ten remaining xrefs of DAT_0089ea40 (0x47ca58, 0x4835de, 0x51895a, 0x51c750, 0x51c7bc, 0x67f882, 0x67faf6, 0x73fab5, 0x7400a1, 0x740c9c) are unclassified; the initial contents of the table before the loader runs are not visible.
- Section E, Fly: the ILocomotion slot +0x84 routine (Phobos 0x4CE4B0, hook 0x4CE4BF) that produces the integer speed is not a Ghidra function in the snapshot and has no recorded xrefs (ev_0d6c3caf...); candidate follow-up: AP-12-style `inspect-native-instruction` chain from 0x4ce4b0, or `xrefs 0x7e8a78` (YRpp ILocoVTable 0x7E89F4 + 0x84). The combination of Type+0x678 with +0x48 is therefore still REFERENCE only.
- Section E, Jumpjet: where JumpjetLocomotionClass+0x20 / +0x78 are written (the consumer of Rules+0x410, row 4); the bodies of FUN_004cacb0 / FUN_004cad00 (trig helpers inferred); the meaning of `uVar14` / `iStack_50` in the near-destination zeroing.
- Section E: the Rocket "Acceleration-like float" offset (FUN_006622c0) and the Ship "floor 0.3 / 0.1" constants (FUN_006a05f0) are not quoted with offsets.
- Row 5: the weapon-type key sequence (Damage / ROF / Speed) and the store offset around 0x7722f5 need single-instruction runs around 0x7722f5 (Ghidra defines no function there) or a Ghidra GUI check. Row 6: the crate-table loader (YRpp `RulesClass::Read_Powerups`, 0x673E80) has not been run through REA.
- FUN_006f3270 is not a Ghidra procedure (fn-0x6f3270.json, instr-0x6f3270.json) although `xrefs 0x6f3270` works (row 18); find its containing procedure via `search --kind procedures`. Likewise 0x70EFE0 is not a Ghidra function (auto-analysis gap); the three extra data references to it (0x7E4248 / 0x7E9020 / 0x7F4CEC) and the unnamed vtable bases 0x7E8C94 / 0x7F4960 are not attributed to a class. Slots +0x544 (SetSpeedPercentage) and +0x2C (WhatAmI) have no known target function and stay YRpp-order only.
- Helper roles still inferred from use only: FUN_0074ff90 / FUN_00750010 (predicates of FUN_0070d0d0), FUN_00528a10 / FUN_007c8d20 / FUN_0048e030 (SpeedType read), FUN_005295f0 ("Buildable"), FUN_00480a30 / FUN_005657a0, FUN_004c93d0, the INI string helpers FUN_007ca530 / FUN_007caff4 / FUN_007c9bfd / FUN_007caf30, and the value of the global at 0xb7882c returned by FUN_00526810 on a search miss (not needed for T-022).
- Which rules keys set InfantryClass+0x6DB and InfantryTypeClass+0xEBD (YRpp/Phobos names Crawling / Crawls=) was not traced with REA.
- Frame rate at which section C runs (T-021).

## Resolved
- FUN_007c5f00 (F2I) truncates toward zero: control word 0x0E7F at DAT_00822d80 (ev_e087554034d37c2b4b06c8aa074fe3bbb27f04f75535502c0ae42b3934254efa, routine ev_30d736aaee2eba3faeb44096c1cc2728ecc2475515de7930881f57f23dc15b08) - AP-14 / AP-14-addendum.
- Row 15: the "max speed" getter at 0x70EFE0 is decoded instruction by instruction (ev_6deeab1046b5c4ed4af5a40a06e06746486423f035a6067e92b7c223287206e4 and seven further decodes) - AP-12.
- Rows 16/16b: the six RulesClass movement keys are read by FUN_0066d530 (`[General]`, REFERENCE-SUGGESTED `RulesClass::Read_General`, YRpp JMP_THIS 0x66D530) and FUN_006691e0 (`[AudioVisual]`, REFERENCE-SUGGESTED `RulesClass::Read_AudioVisual`, YRpp JMP_THIS 0x6691E0) (ev_2772022c93b2c19e906fded4d1be05172c67979986372008e57cc64adc1bec48, ev_22a314265c52606bc186043543877d91fa3da11f9e4a9306f311f9f1b77874c0) - AP-11.
- Row 18: all nine (vtable, slot) pairs for +0x84 / +0x38C / +0x538 are confirmed by data references at exactly base+slot (ev_3038fc4f05894b1ba94de99388c563e37ef8f68671523dcc96b04f19990132d9, ev_e03b859e594994112786502db398a9ed788bc79c039b556a4da8157ad8d55569, ev_8c39641075f39f71c8e07e73b649168ce728a44055e7ec1f99ac5036664a2128, ev_3e3a547987cdedecf729c694bc429dfa471c7067f3cef8d44dc21fc8cc75961a) - AP-13. The six-vtable set also contains 0x7E3EBC (BuildingClass per YRpp).
- Section D height comparison (AP-16): `CMP ESI,EDI; JLE` / `JGE` at 0x4b3d21 / 0x4b3d6a; ESI = FUN_00578080(cell coordinate), EDI = FUN_00578080(LinkedTo+0x9c). Uphill factors when ESI > EDI, downhill when ESI < EDI (ev_2ad203770828541ce9e60a327a1e7acd8c84b5a61b82793804e30628f44ecbc7). FUN_005f5c60 = `this[+0x6c] / GetType()[+0xa0]` (ev_62e78e5252e6cddff837a5ae8d740d55c392b5be225d2a21baefb7ab14d81c6d); the ConditionYellow test is `<=`.
- The infantry prone multiplier is not a constant at 0x521D94: FUN_00521d80 (ev_e0a2a5c34a50488eefa642410c9683e17c676f9d6e7c2cf82666569712ecf0c3) computes `v - trunc(v/3)` or `v + trunc(v/2)` with immediate integer operands depending on this+0x6DB and Type+0xEBD; no rules key is read there - AP-17.
- SpeedType string-to-int mapping: FUN_00476fc0 reads the key as a string and FUN_0048dff0 maps it to the index of the matching entry in the 8-pointer table at 0x81da58 (index 1 = "Track", ev_bcb316147b322b39b3d9449cd8fa52d559a1b1fc701fbbe02b776e12319cecab, ev_f6c772b6768acbe88672deb0541cf136c179e979777068c218f64a00d13e9f35) - AP-24.
- Helper roles FUN_005276d0 / FUN_005283d0 / FUN_00526810 read from their own code (ev_a3d4e51d5824a6c9b75bb8bd6f6ebfd9337123d370b6170c94bb2ae3025870df, ev_be4c09eb3b81519c903074d226e9905149b5d2c56adb567e44e9fb890a41e352, ev_f2681433dc390d881a5435965c396d6184b7d2871ac96339566225ce72597ee6) - AP-26; FUN_0070d0d0 decoded (ev_461c68b6ffac8c1615475d016a3a935493ab6c30c70e01ad7c040dddcb2a3da3) - AP-27.
- Ground table DAT_0089ea40: loader FUN_00674000, 12 rows x 36 bytes, 8 float columns + Buildable byte, section order and key names from REA data reads (ev_cbd3ace28308a7569a525a44a684264d78d40366a83f246c6b790ca85ec92e25, ev_c7b013cd2e60ad4c7b183a9534f5eb674708c460938a6fe1f02d5ea5ae7d9362, ev_00fe57e42dc4e651c1492f46513f6dd0e006d36b031f9c897af27acfde1a711e) - AP-15.
- Drive track loop: one iteration costs 7 budget units, advances TrackIndex by 1 and moves to the next transformed track point; loop 0x4b158f-0x4b1f56, not 0x4b1f5c-0x4b25f9 (ev_e24c89287b26153aaf977a13594beace34a14dfe8df9698a21438f62e7180dc8, ev_7bf7fc12fab5194682ce5da0ace375cfbc379b515ff0d6110294e021b61c3210); table strides 16 / 12 bytes match the data reads (ev_732a3cbc208c9531fbf11d2a266fe696b81d3601a3f2b3d6b4d03bbcf9deb5f4, ev_24c499783dcfb87328bb0389e65e1cd864c524a9af0adfda3109d00884e86cf6) - AP-20 / AP-23.
- Fly (partly): FUN_004cd600 per-frame stepping and the +0x40/+0x48 ratio update are evidenced (ev_e8f8f023f2e73e8631f1780d2aa8bcb480f345c8e83eedc8dccf0d03b00df44f) - AP-18. Jumpjet: FUN_0054d0f0, see Rule E (ev_9a13d9d438894a55084bb4fcf8b8ee958ffc8644733699921a6cfece1ff98bde) - AP-25.
- Rows 5 and 6 have REA evidence (ev_3c503f2196464753a9d8841dfda54c38650075f37b63b7e644b6afab6097a889, ev_93a4d1a59c9bfe8975491c150e4fe2541e7ed60d08abb00301e2df28a09bfef8) - AP-21; row 17b (Ship 0.75 path) is inside FUN_006a1c80 (ev_37ea75fb7220468fda6c807378a9098f4df7eb30a1522f4d3f28470308cd5e6a) - AP-22. No byte-read row remains.

## Human review
Reviewer: <name>, date: <YYYY-MM-DD>, notes: check 0x71464a-0x71469f, 0x4db1a0-0x4db245, 0x521d80-0x521dc8, the loop 0x4b158f-0x4b1f56 (entry test 0x4b1510, exit 0x4b1f5c) and 0x4b3c88-0x4b3e05 in the Ghidra GUI; confirm class names against YRpp.
