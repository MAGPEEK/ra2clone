# Spec: T-022 Movement speed

Status: DRAFT (seed - nothing below is confirmed yet)
Binary: gamemd.exe (Yuri's Revenge v1.001), SHA-256: <paste from open_binary result>
Provider: Ghidra 12.1.4

## Goal
Describe how the `Speed=` key from `rules.ini` is turned into per-tick movement of a unit.

## Evidence
| # | Address | What | REA tool | evidence_id | Status |
|---|---|---|---|---|---|
| 1 | 0x81d9cc | String "Speed" (neighbors: "Firepower" at 0x81d9c0, "Armor" at 0x81d9d4) | list_strings | <fill> | VERIFIED (tool output) |
| 2 | 0x844504 | String "SpeedType" | list_strings | <fill> | VERIFIED (tool output) |
| 3 | 0x825338 / 0x82534c / 0x82535c | Strings "SpeedAircraftMult" / "SpeedUnitsMult" / "SpeedInfantryMult" | list_strings | <fill> | VERIFIED (tool output) |
| 4 | ? | Function referencing 0x81d9cc | xrefs | ? | TODO |

The earlier chat claimed "Reveal" at two different addresses (0x81d9dc and 0x81d4e4). Re-check before using either.

## Data layout
TODO: field offset where the parsed `Speed` value is stored in the type object. Check against `refs/Phobos` (YRpp headers) and mark as REFERENCE-SUGGESTED.

## Rule (plain language)
TODO

## Test values
TODO: take at least one value from the real game files or an in-game measurement.

## Open questions
- Which function reads the type's `Speed` key, and where is the value stored?
- Where do SpeedUnitsMult / SpeedInfantryMult / SpeedAircraftMult get applied?
- What is the unit of the stored value, and the tick rate it is applied at?
