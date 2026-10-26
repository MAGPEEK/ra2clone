# Project rules: RA2 clone (C#)

Goal: an independent, playable reimplementation of Command & Conquer: Red Alert 2 / Yuri's Revenge in C#.
It reads the user's own legally owned game assets at runtime. Original code and assets are never committed.

- Do not modify .github/, docs/TASKS.md statuses, global.json, nuget.config or Directory.Build.props unless the task explicitly says so. If a change to these files seems necessary, stop and explain why.
- hase 1 and 2 tasks use documentation only; REA is for Phase 3 tasks.

## Working mode
- Work on ONE task from `docs/TASKS.md` at a time. Do not start other tasks.
- Before researching, read `docs/specs/` for existing findings. Do not redo finished work.
- Specs are the source of truth. Implement only what the spec describes.

## Facts about the original game
- Facts about original behavior (formulas, offsets, timing, rules) come ONLY from:
  1. REA/Ghidra tool output on `gamemd.exe`, or
  2. values in the user's own game files (`rules.ini`, `art.ini`, maps).
- Never answer behavior questions from memory. If no tool evidence exists, write "UNVERIFIED".
- Every claim in a spec needs an address and an REA evidence_id. Quote raw tool output before interpreting it.
- Do not invent function names, struct names or offsets. Use `FUN_<address>` style names unless a reference confirms one.
- If two results disagree, stop and report both. Do not pick one silently.

## REA / Ghidra usage
- Target binary: `C:\_Games\Command and Conquer Red Alert II\gamemd.exe` (Yuri's Revenge v1.001, x86 PE, image base 0x400000).
- Typical flow: `binary_session` -> `open_binary` (provider `ghidra`) -> `list_strings` / `search_strings` -> `xrefs` -> `procedure_pseudocode` / `analyze_function` -> `close_binary`.
- Tool names may differ slightly; check the tool picker. Only call tools that exist in the current tool list.
- Ghidra analysis can take minutes after opening. Wait; do not resend.
- REA cannot write names back to Ghidra on Windows. Record all findings in `docs/specs/`.
- Call `close_binary` when the research step is finished.

## References (`refs/`)
- See `docs/references.md`. Search `refs/` first for names, structures and file formats.
- References are for orientation and naming only. Never copy code from them. Never treat them as proof of behavior; confirm behavior with REA evidence.

## Code rules
- Language: C# (.NET), solution in `src/`, tests in `tests/` (xUnit v3).
- Simulation code is deterministic: fixed tick, no floating point in game logic unless a spec says otherwise, no wall-clock time, a single seeded RNG.
- Simulation code has no dependency on rendering, audio or input.
- Every implemented rule needs a test with expected values taken from a spec or real game data, not from your own guess.
- Keep changes small. One task = one branch = one reviewable diff.

## Do not
- Do not commit game assets, `gamemd.exe`, or decompiled output.
- Do not paste large pseudocode into source files. Describe the rule in the spec, then write original code.
- Do not use shell commands to search the disk for tools. Ask the user if something is missing.
