# Progress log

Append-only. Each loop iteration adds a short summary: what was found/changed, open questions, files touched.

## 2026-10-26 T-022 research (REA 6.8.0 / Ghidra 12.1.4, Claude Code session)
- Found: Speed= parsed in FUN_00712170 to 0..255 at TechnoType+0x678 (ev_a607860c...); FootClass::GetMovementSpeed FUN_004db1a0 formula (ev_d12530ff...); Drive WhileMoving 7-lepton accumulator (ev_82818cd0...); Drive Process coefficient incl. 0.75 below ConditionYellow (ev_2ad20377...).
- Open: F2I rounding semantics, ground-speed table DAT_0089ea40 origin, FUN_005f5c60 identity, Fly/Jumpjet per-frame path, in-game measurement of leptons per frame.
- UNVERIFIED rows remain for byte-read facts (vtable slots, RulesClass key stores, weapon Speed at 0x7722f5, crate table at 0x7e5264).
- Files: docs/specs/T-022-movement-speed.md (rewritten), evidence/ (REA outputs; decompiled fn-*.json and snapshots deliberately not committed), docs/arbeitspakete/ (work packages).
- Note: game installed at C:\Program Files\EA Games\Command and Conquer Red Alert II (differs from copilot-instructions.md path); SHA-256 of gamemd.exe recorded in the spec.
