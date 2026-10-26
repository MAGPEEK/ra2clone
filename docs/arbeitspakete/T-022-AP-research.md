# T-022 Movement speed - research work packages (AP-11 .. AP-27)

Scope: close the UNVERIFIED rows and open questions of `docs/specs/T-022-movement-speed.md` (the "spec").
Each package fits one agent session (one to three REA runs, ~4 min each, Ghidra re-import per run). No package may need more than 3 runs; fallback runs count against that cap.

Common rules for every package:
- Binary: `C:\Program Files\EA Games\Command and Conquer Red Alert II\gamemd.exe` (SHA-256 as in the spec header). Check the hash before the first run.
- Command pattern: `npx -y rea-agents@6.8.0 <function|xrefs|instructions|search> "<gamemd.exe>" <address> --provider ghidra --snapshot evidence\ra2-gamemd\gamemd.snapshot --format json > evidence\ra2-gamemd\<kind>-<address>.json` with `<kind>` = `fn-` (function), `xrefs-`, `instr-` (instructions), `search-`; a data read (see AP-13 / AP-23) is saved as `bytes-<address>.json`.
- Save every raw output under `evidence\ra2-gamemd\`, add a row to `evidence\README.md` (file, command, evidence_id, what it shows), quote the relevant assembly/pseudocode lines in the spec's "Raw tool output (excerpts)" section BEFORE interpreting them, and cite the evidence_id in the Evidence table. After each package regenerate `evidence/INDEX.md` (`node evidence/tools/index-evidence.mjs`) and `evidence/tools/crosscheck-report.md` (`node evidence/tools/crosscheck.mjs --out evidence/tools/crosscheck-report.md`).
- Names: keep `FUN_<address>` / `DAT_<address>`; a YRpp/Phobos name may be added as "REFERENCE-SUGGESTED" only, never as proof of behaviour.
- Do not write any fact about the game into the spec that is not visible in the quoted tool output. If a run errors ("No procedure exists ..."), record the error file, then use the package's stated fallback (`instructions` / `xrefs` / `search` / containing function); never fill the gap by reading bytes by hand. The only permitted byte-level evidence is REA's own data-read output (`read_bytes` / `inspect_native_data_type`), used where a package names it explicitly.
- Only the user's own game files (`rulesmd.ini` from the installed MIX archives, `RA2MD.INI`) may supply INI values.

---

### AP-11 RulesClass movement keys: VeteranSpeed, Tracked/Wheeled Up/Downhill, ConditionYellow (size: medium)
- Goal: replace the byte-read evidence for the RulesClass stores of rows #16 and #16b (+0x678, +0x768, +0x770, +0x778, +0x780, +0x1700) with REA function output. The key names are already known from the byte reads (row 16: VeteranSpeed / TrackedDownhill / WheeledDownhill / ConditionYellow; row 16b: TrackedUphill / WheeledUphill); this package turns them into REA-evidenced rows. It does not decide which height comparison is "uphill" (that is AP-16).
- Why: Evidence rows #16 (0x66EEFC / 0x66F25B / 0x66F2A9 / 0x66B37F) and #16b (0x66F234 / 0x66F282), both UNVERIFIED "byte read: fstp preceded by key push"; Rule D comments "(keys: byte read, row 16b)" and "(row 16)"; Data layout RulesClass row "byte read of ReadINI stores (UNVERIFIED)" (which lists only +0x678 / +0x770 / +0x780 / +0x1700); open question "Byte-read rows (#5, #6, #15-#19) need REA evidence".
- REA steps:
  1. `function 0x66EEFC` (store of +0x678 'VeteranSpeed' per row 16; the same containing function should also hold 0x66F234, 0x66F25B, 0x66F282, 0x66F2A9). Quote: function start/end, and for each of the five stores the `PUSH <string addr>` ... `CALL FUN_005283d0` (INI double reader per spec helper list) ... `FSTP qword ptr [ESI/EAX + 0x678|0x768|0x770|0x778|0x780]` sequences, including the key-string addresses.
  2. `function 0x66B37F` (store of +0x1700 'ConditionYellow'). Quote the same pattern for +0x1700.
  3. Fallback only: if step 1 or 2 errors ("No procedure exists"), run `instructions <that address>` and quote the window; if the output names a containing procedure, a `function <containing start>` run replaces the failed one. Cap: 3 runs in total; stores not reached within the cap stay UNVERIFIED and are listed.
- Reference check: YRpp `RulesClass.h` field order `TrackedUphill, TrackedDownhill, WheeledUphill, WheeledDownhill` and `VeteranSpeed`, `ConditionYellow` (quote file:line); the YRpp `JMP_THIS` address for the loader name (names only).
- Done when: Evidence rows #16 and #16b read "function" / evidence_id / VERIFIED (tool output); Rule D comment "(keys: byte read, row 16b)" becomes "(row 16b, ev_<id>)" and "(row 16)" becomes "(row 16, ev_<id>)"; the Data layout RulesClass row gains +0x768 / +0x778 and its source changes from "byte read ... (UNVERIFIED)" to the evidence_id; the open question's row list drops #16 / #16b; Status header line is updated. The Rule D sentence "which comparison is 'uphill' is inferred ... UNVERIFIED" is left untouched (AP-16).
- Depends on: none.

### AP-12 TechnoClass::GetMaxSpeed at 0x70EFE0 (size: small)
- Goal: evidence the function that returns Type+0x678 as the "max speed" input of FUN_004db1a0.
- Why: Evidence row #15 (UNVERIFIED: `mov eax,[eax+0x678]` at 0x70EFEC); Rule B line `max = GetMaxSpeed() // vtable +0x38C -> Type->Speed`.
- REA steps:
  1. `function 0x70EFE0`. Quote start/end, the full assembly (expected to be short), in particular the call through vtable +0x84 (GetTechnoType per spec) and the load from +0x678.
  2. `xrefs 0x70EFE0`. Quote the full reference list; data references from the three vtables (0x7E22A4, 0x7F5C70, 0x7EB058 per row #18) are expected and feed AP-13.
- Reference check: look up the hook at 0x70EFE0 in `phobos-src/src/Ext/Techno/Hooks.cpp` and quote its line (name and any skip address as written there); YRpp `TechnoClass.h` virtual `GetMaxSpeed` (names only).
- Done when: row #15 REA tool = "function + xrefs", evidence_id filled, Status VERIFIED (tool output); the helper list entry "FUN_0070EFE0" is added with its role from the quoted code.
- Depends on: none (AP-13 uses its xrefs output).

### AP-13 Vtable slots +0x538 / +0x84 / +0x38C (size: medium)
- Goal: evidence which vtable addresses hold the function pointers the spec names for the three slots that have a known target function (GetCurrentSpeed +0x538 -> 0x4DB1A0 / 0x521D80, GetTechnoType +0x84 -> 0x6F3270, GetMaxSpeed +0x38C -> 0x70EFE0) for Aircraft/Unit/Infantry: nine (vtable, slot) pairs = the pairs of row #18.
- Note: slots +0x544 (SetSpeedPercentage) and +0x2C (WhatAmI) of the Data layout vtable row have no target function in the spec, so no `xrefs` run is possible; they stay REFERENCE-SUGGESTED / UNVERIFIED and are not part of this package.
- Why: Evidence row #18 (UNVERIFIED, vtables at 0x7E22A4 / 0x7F5C70 / 0x7EB058); Data layout row "vtable (Aircraft/Unit/Infantry) ... byte read of vtables + YRpp order (UNVERIFIED)"; Rule B/C call-site comments `; GetMaxSpeed`, `; GetCurrentSpeed`.
- REA steps (at most 3 runs):
  1. `xrefs 0x4DB1A0` (Aircraft/Unit GetCurrentSpeed per spec). Quote all referencing addresses; each data reference inside a vtable gives `slot = ref - vtable_base`, and the spec claims 0x7E22A4+0x538 and 0x7F5C70+0x538.
  2. `xrefs 0x521D80` (Infantry GetCurrentSpeed per spec). Quote; expected 0x7EB058+0x538.
  3. `xrefs 0x6F3270` (GetTechnoType per spec, slot +0x84). Quote; this lists data references only, so additionally quote the `CALL dword ptr [EAX + 0x84]` at 0x4db1a9 from ev_d12530ff as the call site.
  Slot +0x38C is covered by AP-12's `xrefs 0x70EFE0`; do not re-run it.
  Fallback: if a run returns no data references (Ghidra may not create vtable xrefs), do not use `instructions` on the vtable (it would disassemble pointer bytes as code). Instead take one REA data read of the 4-byte pointer at `<vtable_base + slot>` (`read_bytes`, saved as `bytes-<address>.json`; this is the explicit data-read exception of the common rules). Each data read counts as a run; pairs not reached within the 3-run cap stay UNVERIFIED and are listed individually. Slot names remain REFERENCE-SUGGESTED in any case.
- Reference check: YRpp `AircraftClass.h`, `UnitClass.h`, `InfantryClass.h` vtable addresses in their class headers; YRpp `FootClass.h` `virtual int GetCurrentSpeed() const`; `TechnoClass.h` virtual order (names only).
- Done when: row #18 cites xrefs / data-read evidence_ids and reads VERIFIED (tool output) for every (vtable, slot) pair actually seen; the Data layout vtable row drops "byte read" for +0x84 / +0x38C / +0x538 and keeps +0x544 / +0x2C marked UNVERIFIED; unverified pairs stay listed as UNVERIFIED individually.
- Depends on: AP-12 (its `xrefs 0x70EFE0` output covers slot +0x38C).

### AP-14 F2I rounding routine FUN_007c5f00 (size: small)
- Goal: state from the instruction stream what FUN_007c5f00 does to its x87 input and derive an input/output table.
- Why: Evidence row #19 (UNVERIFIED); open question "Confirm FUN_007c5f00 (F2I) rounding semantics"; Test values table note "F2I(7.5) = 8 (F2I rounds; verify F2I semantics)"; Rule B sentence "Each F2I result is rounded to int before the next step".
- REA steps:
  1. `function 0x7C5F00`. Quote the complete assembly (expected: `fnstcw`, control-word manipulation, `fistp`, `fldcw`) and the pseudocode.
  2. `instructions 0x7C5F00` if the function output omits any byte-level detail of the control word mask/OR values (the rounding-mode bits are bits 10-11 of the x87 control word; quote the exact immediate values the code uses).
  3. No third run. From the quoted control-word value derive the rounding mode (00 nearest-even, 01 down, 10 up, 11 truncate) and write a table for inputs 7.5, 8.5, -5.0, -4.5, 2.4, 2.6, 0.0 with outputs following only from the quoted mode; mark the table "derived from ev_<id>". If no `fldcw` with a modified word is seen, record "mode = caller's control word; default nearest-even NOT verified" and keep row #19 UNVERIFIED for the mode.
- Reference check: YRpp `Unsorted.h` (`F2I64` / `F2I` wrapping `CALL(0x7C5F00)`, comment on negative values) - name only; the comment is not evidence.
- Done when: row #19 is VERIFIED (tool output) with REA tool "function/instructions"; open question 1 is moved to "Resolved" with the quoted control-word value (or stays open with the "caller's control word" note); the Test values note "(verify F2I semantics)" is replaced by the derived result; Rule B sentence states the mode as derived.
- Depends on: none.

### AP-15 Ground speed table DAT_0089ea40: loader, dimensions, indexing (size: medium)
- Goal: find the code that fills DAT_0089ea40 and evidence the row/column layout used by `groundTable[SpeedType + landIndex * 9]`.
- Why: Rule D "float table at DAT_0089ea40; capped at 1.0" and the sentence "inferred to hold the `[Land]`-section percentages per SpeedType (UNVERIFIED; 9 columns observed)"; Data layout has no row for the table yet.
- REA steps:
  1. `xrefs 0x89EA40`. Quote the full list; separate writers (stores) from readers (FUN_004b2630 at the L772-L817 region is a known reader; the Ship Process of AP-22 is expected).
  2. `function <first writer address>` - if the writer list is empty or ambiguous, take the `JMP_THIS` address of the land-characteristics reader from `yrpp-src/RulesClass.h` (quote file:line; the address 0x674000 is a candidate to verify in YRpp `RulesClass.h`, not an asserted value) and run `function <that address>`. Quote: the section/key strings pushed, the loop bounds (number of land rows, number of columns), the stride between rows (bytes), any percentage-to-float conversion, and the store addresses relative to 0x89EA40.
  3. Optional: `search "Land"` / `search "Clear"` / `search "Road"` string search to confirm the section names seen in step 2 and quote their addresses.
- Reference check: YRpp `MapClass.h` (`GroundType`, its `Cost[...]` / `Buildable` fields, array at 0x89EA40); `GeneralDefinitions.h` `enum class LandType` and `enum class SpeedType` - names/order only. Compare the observed stride and column count against these but report any mismatch as observed.
- Done when: Rule D line gets the loader function address and evidence_id, the index expression is written with the observed stride and limits, the "(UNVERIFIED; 9 columns observed)" clause is replaced by quoted loop bounds and states from them whether the 9th column is written as a float by the loader; the "capped at 1.0" clause cites the line of ev_2ad20377 where the cap is applied at the reader; a Data layout row "DAT_0089ea40 | float[...] | ground speed table | ev_<id>" is added; the `[Land]` key names seen in the output are listed.
- Depends on: none (AP-22's Ship Process output may add a second reader; AP-24 supplies the SpeedType column index).

### AP-16 FUN_005f5c60 identity and the height comparison via FUN_00578080 (size: small)
- Goal: evidence what FUN_005f5c60 returns and what FUN_00578080 computes, so Rule D's "health percentage" and "heights" wording is backed, and settle which of the two height comparisons is "uphill".
- Why: Rule D `if FUN_005f5c60() <= Rules->ConditionYellow ... FUN_005f5c60 is inferred to be a health-percentage getter (UNVERIFIED)`, "Heights come from two FUN_00578080 calls (MapClass::GetCellFloorHeight per YRpp)" and the comment "which comparison is 'uphill' is inferred from the key names, UNVERIFIED"; open question "Section D: which height comparison is 'uphill' is inferred from the key names only; confirm the sign of the two FUN_00578080 comparisons (AP-16)"; open question "Helper roles ... FUN_005f5c60 are inferred from use only"; Summary item 4 "0.75 when damaged below ConditionYellow".
- REA steps:
  1. `function 0x5F5C60`. Quote start/end and the pseudocode; note which `this` fields it reads (quote the offsets) and the return type (double on x87 or int).
  2. `function 0x578080`. Quote pseudocode: the argument (coordinate struct), the cell lookup (`>> 8` lepton-to-cell shift if present) and the returned field; quote the two call sites in ev_2ad20377 (L772-L817) that pass the current and the next coordinate, and the comparison operator between the two results in each branch.
  3. `instructions 0x4b3df0` only if the comparison direction (`<=` vs `<`) at the ConditionYellow test or the sign of the two height comparisons is not readable from ev_2ad20377; quote the `fcomp`/`fnstsw`/`test` sequences.
- Reference check: look up 0x5F5C60 in `yrpp-src` `ObjectClass.h`; quote the line or note "not named"; `MapClass.h` `GetCellFloorHeight` at 0x578080 (quote file:line) - names only.
- Done when: Rule D replaces "inferred to be a health-percentage getter (UNVERIFIED)" by the quoted formula with evidence_id; the "Heights come from ..." sentence cites the FUN_00578080 evidence_id and states which coordinate each call receives; the Rule D comment "which comparison is 'uphill' is inferred from the key names, UNVERIFIED" is rewritten from the quoted argument order and operator (or stays UNVERIFIED if the argument order is not readable), and the open question "confirm the sign of the two FUN_00578080 comparisons" is moved to Resolved (or kept with the reason); helper list entries for FUN_005f5c60 and FUN_00578080 are added with roles from the quoted code, and FUN_005f5c60 is removed from the "Helper roles ... inferred from use only" open question.
- Depends on: AP-11 (ConditionYellow offset must be verified for the comparison statement).

### AP-17 InfantryClass::GetCurrentSpeed FUN_00521d80 and the prone multiplier (size: small)
- Goal: evidence the infantry wrapper around FUN_004db1a0 and identify the prone multiplier (address, value, and whether it comes from a rules key).
- Why: Summary item 3 "InfantryClass wraps it and applies a prone multiplier"; Rule B last paragraph "(constant at 0x521D94, see raw bytes in evidence folder)"; open question "The infantry prone multiplier constant at 0x521D94"; Evidence row #20 (UNVERIFIED, byte read: call to 0x4DB1A0 at 0x521D83; `mov eax,[esi+0x6C0]` at 0x521D94; "the prone multiplier itself was not located"); helper list entry FUN_00521d80 (UNVERIFIED).
- REA steps:
  1. `function 0x521D80`. Quote start/end, the `CALL 0x004db1a0` (0x521D83 per row 20), the instruction at 0x521D94 (`mov eax,[esi+0x6C0]` per row 20) and the test that follows it - quote whichever `this` field the test reads and what it compares against; the `FMUL`/`FLD` operand address (expected a `qword ptr [DAT_xxxxxx]`) and the following `CALL 0x007c5f00` if present.
  2. `xrefs <DAT address from step 1>`. Quote all references; if a RulesClass loader (compare AP-11 function range) writes it, the multiplier is a rules key - quote the key string; if only FUN_00521d80 reads it, it is a constant.
  3. `instructions <DAT address>` to quote the 8 bytes of the double (REA output, not a manual byte read) if the xrefs run shows no writer.
- Reference check: look up the hook at 0x521D94 in `phobos-src/src/Ext/Techno/Hooks.cpp` and quote its line (name, return address as written there) and the matching lines of `docs/Fixed-or-Improved-Logics.md`; YRpp `InfantryTypeClass.h` / `FootClass.h` (`sizeof(FootClass)` as written there) - names only; Phobos defaults are not evidence for the vanilla value.
- Done when: Evidence row #20 reads "function (+ xrefs/instructions)" / evidence_id / VERIFIED (tool output) and its What column names the multiplier operand (`<DAT>` or `<key>`) and the field tested at 0x521D94; Rule B replaces "(constant at 0x521D94, see raw bytes ...)" with the quoted operand and value; the open question is moved to Resolved; the helper list entry drops UNVERIFIED.
- Depends on: AP-14 (if the wrapper calls FUN_007c5f00, cite the rounding result).

### AP-18 FlyLocomotion per-frame speed application (size: medium)
- Goal: evidence how the Fly locomotor turns Type+0x678 and its own CurrentSpeed into per-frame movement. (Jumpjet: AP-25.)
- Why: Rule E "Fly: not analyzed with REA. Phobos hooks (0x4CDA78, 0x4CE4BF) ... (REFERENCE only)"; open question "FlyLocomotion and Jumpjet per-frame application were not analyzed with REA".
- REA steps (at most 3 runs including fallbacks):
  1. `function 0x4CDA78`. Quote start/end of the containing function and, if present: the load of Type+0x678 (whether via vtable +0x84 / +0x38C or a direct read), any multiply with a locomotor double field (quote its offset), any `CALL 0x007c5f00`, and how the resulting value is consumed (added to a coordinate, compared with a distance, etc.). Do not presume the structure the Phobos hook description suggests.
  2. `function 0x4CE4BF`. Same quotes; note whether it is the same function as step 1 (then only one run is needed) or a second routine.
  3. Fallback when a hook address is not inside a Ghidra function ("No procedure exists"): run `instructions <addr>` and quote the window; if the output names a containing procedure, `function <containing start>`; if it does not, run `xrefs <addr>` (branches/calls into the region) or `search` for a string the Phobos hook source quotes near the address, and `function` on the returned address. Stop at the 3-run cap and list the addresses still open.
- Reference check: Phobos `src/Misc/Hooks.BugFixes.cpp` hooks at 0x4CDA78 and 0x4CE4BF (quote their lines); YRpp `FlyLocomotionClass.h` (`double CurrentSpeed`) - names only.
- Done when: Rule E gains a "Fly (FUN_<start>)" bullet written only from quoted lines, with evidence_id; Evidence rows for the functions actually decompiled are added as VERIFIED (tool output); the Fly half of the open question is moved to Resolved; the Data layout gets rows for the locomotor fields actually read.
- Depends on: AP-14 (rounding), AP-12 (GetMaxSpeed vs direct +0x678 read).

### AP-19 In-game measurement plan for leptons per frame (size: small)
- Goal: define a repeatable measurement with the user's own game files and a recorded unit that can confirm or refute "GetCurrentSpeed() is in leptons per frame" without any claim from memory.
- Why: Rule C "Inference (UNVERIFIED): the value returned by GetCurrentSpeed() is therefore in leptons per frame"; Test values TODO "take real Speed= values from the user's rulesmd.ini and a measured in-game distance per frame"; open question "Frame rate at which section C runs (T-021)".
- REA steps: none (no REA run). Instead:
  1. Inputs to capture from the user's own files (quote file, section, key, value, and the file's SHA-256): `rulesmd.ini` (extracted from the installed MIX archives by the user's tool of choice; record which archive) - for one tracked and one wheeled vehicle and one infantry: `Speed=`, `SpeedType=`, and the key AP-17 identifies for the prone path (if any); `[General] VeteranSpeed`, `ConditionYellow`, `TrackedDownhill`, `TrackedUphill`, `WheeledDownhill`, `WheeledUphill`; `[Land]`-type sections for the terrain used (e.g. the `Clear`/`Road` section lines for the unit's SpeedType); the country's `Speed*Mult` keys for the house played. Also `RA2MD.INI` game-speed setting.
  2. Recording protocol: skirmish on a flat map, unit at full health, no veterancy, no flag, owned by a country whose `Speed*Mult` values are quoted; order a straight move of a known whole number of cells along a cardinal direction (count cells on the grid; cell = 256 leptons per Rule C step 2); record video at a known capture frame rate with the game-speed slider at its maximum fixed setting, or use a frame counter overlay; measure frames between the first and last frame in which the unit's screen position changes.
  3. Compute, per unit and terrain: `predicted = F2I-chain of Rule B` using only the quoted INI values, the AP-14 rounding mode and the AP-24 SpeedType index, then `predicted cells per frame = predicted / 256` using the per-step delta AP-20 establishes (not an assumed 7 leptons); compare with `measured cells / measured frames`. State the game-tick-to-video-frame ratio as an explicit unknown unless T-021 supplies it; present both as a ratio so the per-tick unit can be read off independently of the frame rate.
  4. Record raw numbers (cells, frames, INI values) in `evidence\measurements\T-022-<date>.md` with the video file name and hash; no interpretation in that file.
- Reference check: none required; Phobos `GetCurrentSpeedMultiplier` lists extra multipliers that do not exist in vanilla and must not be applied.
- Done when: the measurement file exists with at least one tracked, one wheeled and one infantry run on `Clear` terrain; the spec's Test values TODO is replaced by a table "INI value -> predicted -> measured" with the file hashes; Rule C "Inference (UNVERIFIED)" becomes either "Confirmed by measurement <file>" or stays UNVERIFIED with the measured discrepancy quoted; the frame-rate dependency is referenced to T-021.
- Depends on: AP-11 (key names for uphill/downhill), AP-14 (rounding mode), AP-15 (terrain multiplier read), AP-17 (prone multiplier for the infantry run), AP-20 (per-step delta), AP-24 (SpeedType index).

### AP-20 Drive track tables DAT_007e7a28 / DAT_007e7b28: readers and index arithmetic (size: medium)
- Goal: evidence which code reads the two track tables and what one loop iteration (`budget -= 7`) moves the object by, from the index arithmetic in FUN_004b0f20. (Table entry bytes: AP-23.)
- Why: Rule C step 2 "advance one step along the current track table entry (DAT_007e7a28 / DAT_007e7b28, indexed by TrackNumber and TrackIndex)" and the sentence "moves along track tables in 7-lepton steps" (Summary item 4), both derived only from the loop constant; no table layout is quoted.
- REA steps (3 runs):
  1. `xrefs 0x7E7A28` and `xrefs 0x7E7B28`. Quote all readers; FUN_004b0f20 (ev_7bf7fc12 / ev_82818cd0, loop 0x4b1f5c-0x4b25f9) is expected; note any other locomotor reading them.
  2. `instructions 0x4b1f5c` (range through 0x4b25f9, or as many as the CLI returns) if the existing `fn-0x4b1f64.json` pseudocode (ev_7bf7fc12) does not already show the address arithmetic. Quote: the index computation (`TrackNumber * stride + TrackIndex * entry_size`), the entry size in bytes, whatever fields the loop reads from an entry, and the coordinate update that follows each `-7`. From this derive and state "one iteration advances TrackIndex by N and moves by the entry delta", not "7 leptons", unless the delta is literally 7.
- Reference check: YRpp `DriveLocomotionClass.h` (`SpeedAccum`, `movementspeed_50`, `TrackNumber`, `TrackIndex`, `IsOnShortTrack`); `ShipLocomotionClass.h` `TrackNumber`/`TrackIndex` - names only.
- Done when: Rule C step 2 is rewritten from quoted lines: the index formula, the entry size as implied by the arithmetic, and what one iteration moves; Summary item 4 "7-lepton steps" is either confirmed by the quoted delta or reworded; the loop line quotes (L270-L685) get the new evidence_id for the instruction-level view; `fn-0x4b1f64.json` (ev_7bf7fc12) is cited in the spec.
- Depends on: none (AP-23 adds the table-entry bytes).

### AP-21 Remaining byte-read rows: weapon Speed= (#5), crate table (#6) (size: medium)
- Goal: give REA evidence to the two remaining data/byte-read rows that have no Ghidra function (fn-0x7722f5.json and fn-0x7e5264.json both returned "No procedure exists"). (Ship 0.75 path, row #17b: AP-22.)
- Why: Evidence rows #5, #6 (UNVERIFIED); open question "Byte-read rows (#5, #6, #15-#19) need REA evidence".
- REA steps (at most 3 runs):
  1. Row #5: `instructions 0x7722f5`. Quote the instruction window around the instruction at 0x7722f5 that references 0x81d9cc (row 2); if the output names a containing procedure, run `function <that start>`; otherwise take the `ReadINI` `JMP_THIS` address from `yrpp-src/WeaponTypeClass.h` (quote file:line), run `function <that address>` and check whether 0x7722f5 lies in its range; quote the key sequence (Damage / ROF / Speed) and the store offset.
  2. Row #6: `xrefs 0x7E5264`. Quote the result. If a code reference appears, record its address; the `function <that address>` run is a follow-up session (note it under "Follow-ups" below), not part of this package's budget. Compare any loader address with YRpp `RulesClass.h` `Read_Powerups` (quote file:line; name only).
- Reference check: YRpp `WeaponTypeClass.h` `ReadINI` address; `RulesClass.h` `Read_Powerups` - names only.
- Done when: rows #5 and #6 each cite an evidence_id and read VERIFIED (tool output); for #6 the What column adds "data reference only" when no code reference exists (no new Status value is introduced); the open question "Byte-read rows ..." is reduced to the rows still open after AP-11..AP-14, AP-17 and AP-22.
- Depends on: none.

### AP-22 Ship locomotor 0.75 path at 0x6A343F (row #17b) (size: small)
- Goal: give REA evidence to the Ship `Process` sequence the spec records by byte read.
- Why: Evidence row #17b (0x6A343F / 0x6A344F, UNVERIFIED); Rule D "The Ship locomotor has the same sequence at 0x6A33E0-0x6A3457 (byte read)".
- REA steps (at most 3 runs including fallbacks):
  1. `function 0x6A343F`. Quote start/end of the Ship `Process`, the ground-table read from DAT_0089ea40 (feeds AP-15), the FUN_005f5c60 call and ConditionYellow compare, the 0.75 multiply (`FMUL qword ptr [0x7E7FC0]`) and the `FSTP [this+0x50]`.
  2. Fallback: on "No procedure exists", `instructions 0x6A343F` and quote the window; then `function <containing start>` if one is named.
- Reference check: Phobos `src/Ext/Techno/Hooks.cpp` `LocomotionClass_Process_DamagedSpeedMultiplier` at 0x6A343F (Ship) and 0x4B3DF0 (Drive) (quote the lines) - names only.
- Done when: row #17b cites an evidence_id and reads VERIFIED (tool output); Rule D "(byte read)" after 0x6A33E0-0x6A3457 is replaced by the Ship function range and evidence_id; the open question "Byte-read rows ..." drops #17b.
- Depends on: AP-11 (ConditionYellow), AP-16 (FUN_005f5c60) for the wording of the Ship path.

### AP-23 Drive track tables DAT_007e7a28 / DAT_007e7b28: entry bytes (size: small)
- Goal: obtain the leading bytes of the two track tables as REA output so the entry size and the distinction between the two tables can be matched with AP-20's index arithmetic.
- Why: AP-20 derives the entry size only from the arithmetic; Rule C step 2 names both tables without a layout; Data layout has no row for them.
- REA steps (at most 2 runs):
  1. One REA data read per table at 0x7E7A28 and 0x7E7B28 (`read_bytes` / `inspect_native_data_type`, saved as `bytes-<address>.json`; the explicit data-read exception of the common rules). Do not use `instructions` on these addresses (it would disassemble table bytes as code). Quote the first entries (as many bytes as AP-20's entry size times a few entries) and, if the data-type tool resolves a structure, its field list.
  2. No further run. Match the quoted bytes against the AP-20 entry size and stride; state the entry count only if the data read or the AP-20 loop bounds show it.
- Reference check: YRpp `DriveLocomotionClass.h` `IsOnShortTrack` (name only) for the short-track vs. normal distinction.
- Done when: a Data layout row for each table (address, entry size, count or "count not evidenced") is added with evidence_id; Rule C step 2 cites the table layout.
- Depends on: AP-20 (entry size and index formula).

### AP-24 SpeedType string-to-int mapping (FUN_00712170 via FUN_00476fc0) (size: small)
- Goal: evidence how the `SpeedType=` string becomes the integer stored at TechnoTypeClass+0x67C, so the `SpeedType == 1` branch of Rule D and AP-19's prediction rest on tool output.
- Why: open question "Section D: SpeedType string-to-int mapping (`SpeedType=` parsing in FUN_00712170 via FUN_00476fc0) is not decoded"; Rule D comment "SpeedType 1 = Track per YRpp enum (REFERENCE-SUGGESTED)"; Data layout row "TechnoTypeClass +0x67C int `SpeedType=` REA ev_a607860c (pseudocode)".
- REA steps (at most 2 runs):
  1. No run: from the existing `fn-0x71464c.json` (ev_a607860c) quote the pseudocode/assembly lines around the store to +0x67C and the `CALL 0x00476fc0`, including the key string pushed and the arguments passed.
  2. `function 0x476FC0`. Quote start/end and the pseudocode: how the input string is compared (string table address, loop bounds, compare callee) and which index is returned for which string; quote the string addresses.
  3. `search "<first string seen in step 2>"` only if the string table of step 2 is referenced by address without the strings being visible in the output; quote the returned addresses.
- Reference check: YRpp `GeneralDefinitions.h` `enum class SpeedType` (quote the order) - names only; compare with the observed index order and report any mismatch as observed.
- Done when: Rule D "SpeedType 1 = Track per YRpp enum (REFERENCE-SUGGESTED)" is replaced by the quoted mapping with evidence_id (or stays REFERENCE-SUGGESTED with the reason); an Evidence row for FUN_00476fc0 is added as VERIFIED (tool output); the Data layout +0x67C row cites the new evidence_id; the open question is moved to Resolved.
- Depends on: none (feeds AP-15 column index and AP-19).

### AP-25 Jumpjet per-frame speed application (size: small)
- Goal: evidence how the Jumpjet locomotor applies its speed fields per frame (split from AP-18 to keep the run cap).
- Why: open question "FlyLocomotion and Jumpjet per-frame application were not analyzed with REA"; Evidence row #4 (`[JumpjetControls] Speed` into RulesClass+0x410) has no consumer yet.
- REA steps (at most 3 runs including fallbacks):
  1. `function 0x54D138`. Quote start/end of the containing function and, if present: the locomotor fields read (offsets as seen), any acceleration step and cap, and whether Type+0x678 or RulesClass+0x410 (row #4) is read.
  2. Fallback as in AP-18 step 3 (`instructions <addr>`, then `function <containing start>`, else `xrefs <addr>` / `search`), within the cap.
- Reference check: Phobos `src/Misc/Hooks.BugFixes.cpp` hook at 0x54D138 (quote the line); YRpp `JumpjetLocomotionClass.h` (`int Speed`, `double CurrentSpeed`, `double MaxSpeed`) - names only.
- Done when: Rule E gains a "Jumpjet (FUN_<start>)" bullet written only from quoted lines, with evidence_id; an Evidence row is added as VERIFIED (tool output); the Jumpjet half of the open question is moved to Resolved; the Data layout gets rows for the locomotor fields actually read and row #4 gets its consumer noted.
- Depends on: AP-14 (rounding), AP-12 (GetMaxSpeed vs direct +0x678 read).

### AP-26 Helper roles: INI readers FUN_005276d0, FUN_005283d0, FUN_00526810 (size: small)
- Goal: replace the "roles inferred from use" wording for the three INI helpers with roles read from their own code.
- Why: Data layout helper list "roles inferred from use, UNVERIFIED: FUN_005276d0 INI int reader; FUN_005283d0 INI double reader; FUN_00526810 section-exists"; open question "Helper roles FUN_005276d0 / FUN_005283d0 / FUN_00526810 / FUN_0070d0d0 / FUN_006f3270 / FUN_005f5c60 are inferred from use only".
- REA steps (3 runs):
  1. `function 0x5276D0`. Quote start/end, the argument handling (section, key, default as pushed at 0x71464a-0x71465a in ev_a607860c), the callees, and the return register/type.
  2. `function 0x5283D0`. Same quotes; note the x87 return (`FLD`/`FSTP`) if present.
  3. `function 0x526810`. Same quotes; note what is returned when the section is absent, as far as the code shows it.
- Reference check: YRpp `CCINIClass.h` names for these addresses (quote file:line or "not named") - names only.
- Done when: the three helper list entries carry an evidence_id and the role as quoted (or "role still inferred" where the code does not show it); the open question drops the three functions; Evidence rows are added as VERIFIED (tool output).
- Depends on: none.

### AP-27 Helper roles: FUN_0070d0d0 (HasAbility) and FUN_006f3270 (GetTechnoType) (size: small)
- Goal: replace the inferred roles of the two TechnoClass helpers called from FUN_004db1a0 with roles read from their own code.
- Why: Data layout helper list "FUN_0070d0d0 TechnoClass::HasAbility; FUN_006f3270 GetTechnoType" (roles inferred, UNVERIFIED); Rule B lines `HasAbility(0 /*Faster*/)` and `GetTechnoType` (vtable +0x84); the same open question as AP-26.
- REA steps (2 runs):
  1. `function 0x70D0D0`. Quote start/end, how the argument `0` pushed at 0x4db1e0 (ev_d12530ff) is used (which `this`/Type field is indexed or tested), and the return.
  2. `function 0x6F3270`. Quote start/end and the returned field (expected a load of a `this` field; quote the offset).
- Reference check: YRpp `TechnoClass.h` `HasAbility` / `GetTechnoType` and `GeneralDefinitions.h` ability enum (name of value 0) - names only.
- Done when: both helper list entries carry an evidence_id and the role as quoted; the Rule B comment `/*Faster*/` is kept only if the YRpp name is cited as REFERENCE-SUGGESTED next to the quoted index use; the open question drops the two functions; Evidence rows are added as VERIFIED (tool output).
- Depends on: none (AP-13 uses `xrefs 0x6F3270`, not this package).

---

## Notes

- Uncited evidence files `fn-0x6fdb80.json` (ev_8f9129a4..., FUN_006fdb80) and `fn-0x5f540f.json` (ev_a91f9ada..., FUN_005f5390): analyzed, irrelevant to T-022 (callers of the damage function FUN_00489180, which row 14 records as "NOT speed"). The next package that edits the spec adds a one-line "irrelevant" entry for them under the Evidence table (like row 14) so the cross-check stops listing them.
- `fn-0x4b1f64.json` (ev_7bf7fc12...) is cited by AP-20.
- Rule E Rocket "`Type->Acceleration-like float`" (unnamed offset in FUN_006622c0) and Ship "floor 0.3 (or 0.1 in another branch)" (FUN_006a05f0) carry no offsets; no package in this set quotes them. Both functions already have evidence (ev_4af5eae0, ev_8217e49c); the offsets can be quoted from the existing files without a run when the spec is next edited.
- Open question "Frame rate at which section C runs (T-021)" is produced by task T-021, not by this set; AP-19 only references it.
- End state: when every Evidence row is VERIFIED (tool output) and no open question remains except the T-021 reference, the spec's Status header changes from DRAFT to REVIEW and the "Human review" Ghidra-GUI check is scheduled; no package does this on its own.
- Follow-ups: AP-21 step 2 may yield a code reference for 0x7E5264 whose `function` run is outside AP-21's budget; record it here when it occurs.

Suggested order: AP-14, AP-12, AP-11 (independent, short) -> AP-13, AP-16, AP-17, AP-24, AP-26, AP-27 -> AP-15, AP-20, AP-23, AP-18, AP-25, AP-21, AP-22 -> AP-19 last.

---

## Review log

Applied against `REVIEW-T-022-AP-research.md` after the spec update (row 20 added; row 16/16b key names; three new open questions replacing "Decode Process (REA run pending)").

| Finding | Severity | Applied? | Reason / what changed |
|---|---|---|---|
| Common rules: "record the error file and stop" vs fallbacks | low | applied | Reworded to "record the error file, then use the package's stated fallback"; REA data read named as the only byte-level exception. |
| Common rules: INDEX.md / cross-check regeneration | low | applied | Added the two `node` commands to the common rules. |
| Common rules: `<kind>` naming | low | applied | Kinds fixed to `fn-`, `xrefs-`, `instr-`, `search-` (plus `bytes-` for data reads). |
| AP-11: row 16b / addresses 0x66F234, 0x66F282 not cited; step 3 re-discovers known keys | high | applied | Rows 16 and 16b cited with all six addresses; key names stated as known from byte reads; `search "TrackedUphill"` step dropped; Done-when targets the real Rule D text "(keys: byte read, row 16b)" / "(row 16)". |
| AP-11: conflates key names with "which comparison is uphill" | medium | applied | AP-11 scoped to key names/offsets; uphill sign moved to AP-16 Goal and Done-when. |
| AP-11: no fallback for "No procedure exists"; run count | low | applied | `instructions` fallback added; cap 3 runs. |
| AP-12: `SkipGameCode = 0x70EFF2` stated as fact | low | applied | Replaced by "look up the hook and quote its line". |
| AP-13: +0x544 / +0x2C have no target; "nine" vs 15 pairs | high | applied | Goal restricted to +0x538 / +0x84 / +0x38C (nine pairs = row #18); +0x544 / +0x2C moved to a note as REFERENCE-SUGGESTED. |
| AP-13: fallback budget up to 12 runs; `instructions` on .rdata | high | applied | Fallback is one REA data read (`read_bytes`) per pair within the 3-run cap; remaining pairs stay UNVERIFIED individually; no AP-13b needed. |
| AP-14: no `fldcw` case | low | applied | "mode = caller's control word; default nearest-even NOT verified" instruction added. |
| AP-15: 0x674000 asserted as `Read_LandCharacteristics` | medium | applied | Marked as a candidate "to verify in YRpp RulesClass.h" (quote file:line) rather than asserted. |
| AP-15: 9th column may not be a speed value | low | applied | Done-when asks to state from the loop bounds whether column 9 is written as a float. |
| AP-16: helper list has no entries for FUN_005f5c60 / FUN_00578080 | medium | applied | Done-when now says "add helper list entries". |
| AP-16: uphill sign missing from Done-when | medium | applied | Done-when targets the Rule D comment and the new open question "confirm the sign of the two FUN_00578080 comparisons (AP-16)". |
| AP-16: `GetHealthPercentage` inline / 0x5F5C80 claim | low | applied | Replaced by "look up 0x5F5C60 in ObjectClass.h; quote the line or note 'not named'". |
| AP-17: "+0x6C0" invented | high | applied (modified) | The spec now records `mov eax,[esi+0x6C0]` at 0x521D94 in Evidence row 20, so AP-17 cites row 20 instead of deleting the offset; the test's field is still to be quoted, no interpretation pre-written. |
| AP-17: Phobos return address / ProneSpeed keys stated as facts | low | applied | Replaced by "quote the hook and docs lines from phobos-src". |
| AP-18: no fallback for hook addresses; presumed structure | medium | applied | Fallback `instructions` -> containing `function` -> `xrefs` / `search` added; quote list prefixed "if present"; Jumpjet split into AP-25. |
| AP-19: `Crawls=` not in spec | low | applied | "the key AP-17 identifies for the prone path (if any)". |
| AP-19: Depends-on omits AP-20 | low | applied | AP-20 (and AP-24) added; step 3 uses AP-20's per-step delta. |
| AP-20: `instructions` on a data table; 4 runs | medium | applied | Table-byte step moved to AP-23 as a REA data read; AP-20 capped at 3 runs. |
| AP-20: entry fields pre-stated | low | applied | "whatever fields the loop reads from an entry". |
| AP-21: 5 runs | medium | applied | Split: AP-21 (#5, #6, max 3 runs; #6 code-reference follow-up noted) and AP-22 (#17b Ship Process). |
| AP-21: "PUSH 0x81d9cc" presumed | low | applied | "the instruction at 0x7722f5 that references 0x81d9cc". |
| AP-21: new status "data only" | low | applied | Uses VERIFIED (tool output) with "data reference only" in the What column. |
| AP-21: `function 0x6A343F` without fallback | low | applied | `instructions 0x6A343F` fallback in AP-22. |
| Coverage 1: stale open question "Decode Process (REA run pending)" | - | not applied | No longer in the spec; it was replaced by the three new open questions that AP-16, AP-24 and AP-26/AP-27 now target. |
| Coverage 2: uphill comparison sign | - | applied | AP-16. |
| Coverage 3: SpeedType string-to-int mapping | - | applied | New AP-24. |
| Coverage 4: five helper roles | - | applied (split) | New AP-26 (three INI helpers) and AP-27 (HasAbility, GetTechnoType) to respect the 3-run cap. |
| Coverage 5: slots +0x544 / +0x2C | - | applied | Note in AP-13. |
| Coverage 6: Rocket / Ship unnamed offsets | - | note only | Recorded under Notes; quotable from existing evidence files without a run; no package. |
| Coverage 7: cap at 1.0 at the reader | - | applied | AP-15 Done-when cites the ev_2ad20377 line. |
| Coverage 8: frame rate (T-021) | - | note only | Recorded under Notes as produced by T-021. |
| Coverage 9: uncited `fn-0x6fdb80.json`, `fn-0x5f540f.json` | - | applied | Note: analyzed, irrelevant to T-022 (callers of the damage function); `fn-0x4b1f64.json` cited by AP-20. |
| Coverage 10: end state / Status header | - | note only | Recorded under Notes (DRAFT -> REVIEW when all rows are VERIFIED). |
