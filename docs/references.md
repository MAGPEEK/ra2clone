# Reference repositories (`refs/`)

Cloned locally under `refs/` (gitignored). Check each repo's license before relying on it.
Use for NAMES, STRUCTURES and FORMATS. Behavior must be confirmed with REA evidence.

| Folder | What it is | Use it for | Do NOT use it for |
|---|---|---|---|
| `refs/Phobos` | Community engine extension for Yuri's Revenge (injects code via Syringe; uses modified YRpp) | Class names, field names and offsets of engine objects (look for the YRpp headers), how engine functions are hooked | Copying code; assuming behavior without REA evidence |
| `refs/Antares` (or docs: https://ares-developers.github.io/Ares-docs/) | Older YR extension and bug-fix project | Documented engine behavior, rules.ini tag meanings | Same as above |
| `refs/ra2fnt` | File format notes (`ra2ff.txt`) | MIX, SHP, PAL, TMP, VXL, HVA, map layout | Behavior rules |
| `refs/OpenRA` | Open-source RTS engine (C#) for early Westwood games | Architecture ideas: world/actor model, deterministic lockstep, asset loading | Copying code (check license); RA2 rules (it is a different engine) |
| `refs/gagarin` | Decompilation project of gamemd.exe v1.001 | Cross-checking function names/structure only (consult-only, see its LEGAL notes) | Copying any code; citing as evidence |
| `refs/Red-Alert-2-Modding-Guide` | Modding guide | Meaning of rules.ini / art.ini keys, tool list | Exact engine formulas |

## Search hints
- Engine class/field names: search `refs/Phobos` for `class` + the topic (e.g. `TechnoTypeClass`, `FootClass`).
- File formats: open `refs/ra2ff/ra2ff.txt` and search for the extension (`SHP`, `TMP`, `VXL`).
- When a reference gives a name or offset, note it in the spec as "reference-suggested", separate from "REA-verified".
