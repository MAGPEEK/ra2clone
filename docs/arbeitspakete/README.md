# Arbeitspakete T-022 (Movement speed)

Small work packages derived from `docs/specs/T-022-movement-speed.md` and the REA evidence in `evidence/`.
Each package is sized for one agent session. Research packages (AP-11+) close UNVERIFIED rows or open questions of the spec;
implementation packages (AP-01..07) build the evidenced rule in C# with xUnit tests. Numbers are stable; add new packages at the end.

Workflow per the project rules: research -> spec update (quote raw REA output, cite evidence_id) -> implement -> test -> review.
Reviews of the package texts themselves: `REVIEW-T-022-AP-implementation.md`, `REVIEW-T-022-AP-research.md`.

## Implementation (`T-022-AP-implementation.md`)
| AP | Title | Size | Spec |
|---|---|---|---|
| AP-01 | Game rounding helper (F2I) and multiplier representation | small | B, open question F2I |
| AP-02 | `Speed=` parsing into the 0..255 stored value | small | A |
| AP-03 | Country `Speed*Mult` parsing and selection by object kind | small | B (rows 7-9) |
| AP-04 | Current movement speed formula (FootClass::GetMovementSpeed) | medium | B (row 10) |
| AP-05 | Infantry current-speed wrapper with prone placeholder | small | B (FUN_00521d80) |
| AP-06 | Drive locomotor speed accumulator and 7-lepton stepping | medium | C (row 11) |
| AP-07 | Drive `Process` speed coefficient (ground table, hills, damage) | medium | D (row 17) |
| AP-08 | Drive crush clamp of the speed coefficient (max(coef, 0.2), constant 0x7E3548) | small | C.4 |

## Research / verification (`T-022-AP-research.md`)
| AP | Title | Size | Closes |
|---|---|---|---|
| AP-11 | RulesClass movement keys: VeteranSpeed, Tracked/Wheeled Up/Downhill, ConditionYellow | medium | rows 16, 16b |
| AP-12 | TechnoClass::GetMaxSpeed at 0x70EFE0 | small | row 15 |
| AP-13 | Vtable slots +0x538 / +0x84 / +0x38C | medium | row 18 |
| AP-14 | F2I rounding routine FUN_007c5f00 | small | row 19, open question 1 |
| AP-15 | Ground speed table DAT_0089ea40: loader, dimensions, indexing | medium | section D inference |
| AP-16 | FUN_005f5c60 identity and the height comparison via FUN_00578080 | small | section D inference |
| AP-17 | InfantryClass::GetCurrentSpeed FUN_00521d80 and the prone multiplier | small | open question 6 |
| AP-18 | FlyLocomotion per-frame speed application | medium | section E, open question 3 |
| AP-19 | In-game measurement plan for leptons per frame | small | Test values TODO |
| AP-20 | Drive track tables DAT_007e7a28 / DAT_007e7b28: readers and index arithmetic | medium | section C inference |
| AP-21 | Remaining byte-read rows: weapon Speed= (#5), crate table (#6) | medium | rows 5, 6 |
| AP-22 | Ship locomotor 0.75 path at 0x6A343F | small | row 17b |
| AP-23 | Drive track tables DAT_007e7a28 / DAT_007e7b28: entry bytes | small | section C inference |
| AP-24 | SpeedType string-to-int mapping (FUN_00712170 via FUN_00476fc0) | small | open question (SpeedType) |
| AP-25 | Jumpjet per-frame speed application | medium | section E |
| AP-26 | Helper roles: INI readers FUN_005276d0, FUN_005283d0, FUN_00526810 | small | open question (helpers) |
| AP-27 | Helper roles: FUN_0070d0d0 (HasAbility) and FUN_006f3270 (GetTechnoType) | small | open question (helpers) |

Suggested order: AP-14 (F2I) and AP-11 first (they unblock AP-01/AP-04/AP-07 test values), then AP-02 -> AP-03 -> AP-04 -> AP-06 -> AP-08 -> AP-07; AP-15/16/20/23/24 before AP-07 is finalized.
