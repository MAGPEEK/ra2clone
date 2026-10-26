# Arbeitspakete: T-022 Movement speed

Source spec: `docs/specs/T-022-movement-speed.md` (status DRAFT). Section letters below refer to its "Rule" sections A-E; evidence ids are the `ev_...` ids in its evidence table. "VERIFIED-by-tool-output" means REA output was seen but not yet checked in the Ghidra GUI (spec's own caveat).

Conventions for all packages:
- Simulation code lives in `src/Ra2.Sim`, parsing of rules in `src/Ra2.Core`, tests in `tests/Ra2.Tests` (xUnit v3). No wall-clock, no RNG, no rendering/audio/input dependencies.
- Integers everywhere the spec is integer-based (A, C, the halving in B). Where the game multiplies by doubles (B multipliers, D coefficient) the spec documents `double`/`float`; these packages isolate every such multiplication behind the helper from AP-01 so the representation can be swapped (see AP-01 for the fixed-point vs. isolated-double decision).
- Names such as `GetMaxSpeed`, `SpeedMultiplier`, `SpeedPercentage`, `FlagHouseIndex`, `TrackedDownhill` are REFERENCE-SUGGESTED (YRpp/Phobos) per the spec; use them as C# identifiers but do not treat them as verified semantics beyond what the spec states.
- One AP = one branch = one small diff. Do not implement rows the spec marks UNVERIFIED as behaviour; put them behind an injectable parameter and name the gap in a test `Skip` reason or a `// UNVERIFIED (T-022 row N)` comment.

Dependency sketch: AP-01 -> AP-04, AP-05, AP-07, AP-08; AP-02 -> AP-04, AP-07 (`SpeedType`); AP-03 -> AP-04; AP-04 -> AP-05, AP-06; AP-07 -> AP-06 (coefficient push); AP-06, AP-07 -> AP-08 (crush clamp). External: T-005 (INI parser), T-020 (typed rules), T-021 (fixed tick / frame loop), a veterancy/abilities task (not yet defined; `HasFaster` input of AP-04).

---

### AP-01 Game rounding helper (F2I) and multiplier representation (size: small)
- Goal: Provide one shared, deterministic `GameMath.F2I(double) -> int` plus a `SpeedMultiplier` value type so every speed multiplication in T-022 goes through a single, swappable rounding seam.
- Spec basis: B (0x7C5F00 called after each multiply, ev_d12530ff... VERIFIED-by-tool-output for the call sites); B's precision note: the FILD/FMUL/FMUL chain (0x4db1cd-0x4db1db) runs on the x87 stack in 80-bit extended precision with no intermediate store, so a double-based port may differ from the game for products that are not exactly representable; row 19 (0x7C5F00 is F2I, `fnstcw` prologue) UNVERIFIED; spec "Open questions": rounding semantics assumed round-to-nearest per YRpp.
- Files: `src/Ra2.Sim/Math/GameMath.cs` (static `F2I`), `src/Ra2.Sim/Math/SpeedMultiplier.cs` (readonly struct), `tests/Ra2.Tests/Math/GameMathTests.cs`.
- Steps:
  - Implement `F2I` as round-to-nearest (the spec's working assumption); document the x87-control-word origin and that the tie rule (half-even vs. half-away) is unknown. Expose the mode as a `GameMath.RoundingMode` internal enum so a one-line change re-runs all dependent tests when semantics are verified.
  - Define `SpeedMultiplier` wrapping a `double` (the game stores doubles at FootClass+0x578/+0x580 and `float` for country mults, spec data layout). Mark the struct `// isolated double, permitted by T-022 B which documents double arithmetic`. Forbid implicit conversion; the only public operations are `GameMath.MulRound(int v, SpeedMultiplier m) -> int` (= `F2I((double)v * m)`) and `GameMath.MulRound(int v, SpeedMultiplier a, SpeedMultiplier b) -> int` (= `F2I(((double)v * a) * b)`, left-to-right, one F2I; this is the shape AP-04 step 1 needs). No `SpeedMultiplier * SpeedMultiplier` operator.
  - Alternative to record in the file header, not implement: Q16.16 fixed point. Note the trade-off explicitly with a product that is genuinely non-integral in IEEE-754 double: `7 * 1.1` evaluates to the double `7.700000000000001`, so round-to-nearest gives 8 but truncation gives 7. (`255 * 1.2`, the spec's table-B example, is exactly `306.0` in double and therefore does not distinguish the modes.) A fixed-point swap would change results and needs the F2I verification first.
  - Precision seam: the game forms each product in x87 extended precision before F2I (spec B). The .NET port forms it in IEEE double. For non-representable products the two can differ (spec B's example: `255 * 1.2` is `305.99999999999998867...` in extended precision but `306.0` in double, so under truncation semantics the game would give 305 where the port gives 306). Bit-exactness with the game for such products is NOT a goal of T-022 until F2I semantics are verified (spec B, open question); `MulRound` is the single place where an extended-precision emulation would go if it becomes one. State this in the `GameMath` file header.
  - Ensure determinism: .NET Core on x64 uses SSE2 IEEE-754 doubles; disallow `Math.FusedMultiplyAdd` and `float` intermediates by review/analyzer rule.
  - Add `GameMath.HalveTowardZero(int)` (`cdq / sub / sar 1` idiom from B) as a plain integer helper.
- Tests:
  - `F2I(306.0) == 306`, `F2I(255.0) == 255` (spec table B, rows 1-2); `F2I(0.0) == 0` (derived).
  - `F2I(7.5) == 8` (spec table B row 3; spec labels this "verify F2I semantics" -> mark `[Trait("Verification","F2I-UNVERIFIED")]`).
  - `F2I(255 * 1.2) == 306` with the literal double product (spec table B row 2). The double product is exactly `306.0`, so this test is mode-independent in double; do not tag it `F2I-UNVERIFIED`. Tag it `X87-PRECISION-OPEN` instead: in the game's extended-precision chain the product is below 306 and the result under truncation would be 305 (spec B).
  - Discriminating test: `F2I(7 * 1.1) == 8` with the literal double product `7.700000000000001` (hypothetical input; nearest -> 8, truncation -> 7); tag `F2I-UNVERIFIED`. This is the test that flips when `RoundingMode` changes.
  - `HalveTowardZero(10) == 5` (spec table B row 4 after multipliers); `HalveTowardZero(-7) == -3`, `HalveTowardZero(7) == 3` (derived from B's "toward zero").
  - Tie case `F2I(2.5)`: assert whatever the chosen mode gives and tag `F2I-UNVERIFIED` so it is revisited.
- Depends on: none.
- Open points: exact F2I semantics (row 19 UNVERIFIED): nearest vs. truncation and tie rule; x87 extended-precision intermediates vs. IEEE double (spec B: results may differ for non-representable products; bit-exactness deferred); whether the x87 control word is ever changed elsewhere in the game (spec silent); fixed-point vs. double final decision deferred until F2I is verified.

### AP-02 `Speed=` parsing into the 0..255 stored value (size: small)
- Goal: Parse the TechnoType `Speed=` key exactly as FUN_00712170 does: default -1 means unchanged, clamp 0..100, scale by 256/100 truncating, cap 255. Also read the neighbouring `SpeedType=` key (same reader function) into an `int`, because AP-07 needs it as the ground-table row index and for the `SpeedType == 1` hill branch.
- Spec basis: A (ev_a607860c..., ev_245d8c96..., VERIFIED-by-tool-output); data layout rows TechnoTypeClass+0x678 (`Speed`) and +0x67C (`SpeedType=`, int, "REA ev_a607860c (pseudocode)"; no clamp/scale/default is quoted for it).
- Files: `src/Ra2.Core/Rules/SpeedValue.cs` (static `SpeedValue.Scale(int raw, int current) -> int`), hook into the TechnoType reader from T-020 (`src/Ra2.Core/Rules/TechnoTypeRules.cs` or equivalent: field `Speed`), `tests/Ra2.Tests/Rules/SpeedValueTests.cs`.
- Steps:
  - Read `Speed` with the T-005 integer reader, default `-1`.
  - If raw == -1: return `current` (missing key and explicit -1 are identical).
  - Clamp: `raw > 100 -> 100`; `raw <= 0 -> 0` (the `SETLE/DEC/AND` sequence zeroes non-positive values; game clamps negatives to 0, unlike Phobos).
  - Compute `(clamped << 8) / 100` with integer truncation. The magic multiply `0x51EB851F` + `SAR 5` + sign fix is an exact divide-by-100 for this range; a plain `/ 100` is equivalent for 0..25600. Add a comment stating this equivalence.
  - `if result >= 255 -> 255`; store as `int`.
  - `SpeedType=`: read as a plain `int` into field `SpeedType` with the T-005 integer reader; apply no clamp or scaling (spec only shows the store at +0x67C). Default: leave the field unchanged when the key is missing (reader default = current value), with `// default/clamp of SpeedType not quoted in T-022 (data layout +0x67C only)`. The meaning of the values (1 = Track per YRpp enum) is REFERENCE-SUGGESTED and is AP-07's concern.
- Tests (all from spec table A unless marked):
  - `missing -> unchanged`, `-1 -> unchanged` (use `current = 42`, expect 42).
  - `-5 -> 0`, `0 -> 0`, `4 -> 10`, `6 -> 15`, `99 -> 253`, `100 -> 255`, `150 -> 255`.
  - Exhaustive property test 0..100: result is monotonic non-decreasing and `<= 255` (derived, not a spec table).
  - Integration: INI section `[E1] Speed=4` through the T-020 reader yields `Speed == 10`.
  - `SpeedType=1` through the T-020 reader yields `SpeedType == 1`; missing key leaves the field unchanged (derived from data layout +0x67C; hypothetical value).
- Depends on: T-005, T-020.
- Open points: none of A is UNVERIFIED; `[JumpjetControls] Speed` (row 4) and weapon `Speed=` (row 5, UNVERIFIED) are different keys and are out of scope here; `SpeedType=` default and value range are not quoted in the spec (only the store offset).

### AP-03 Country `Speed*Mult` parsing and selection by object kind (size: small)
- Goal: Load `SpeedInfantryMult` / `SpeedUnitsMult` / `SpeedAircraftMult` per country and select the one matching the moving object's type kind (Aircraft / Infantry / Unit), else 1.0.
- Spec basis: B line 2; rows 7, 8, 9 (ev_02e1f5ea..., ev_2b6cb949..., ev_55fcfe2b..., ev_27162a68..., ev_f7a03853...; all VERIFIED-by-tool-output). Kind values 3 / 16 / 40 are `WhatAmI()` of the *type* (asm: `PUSH EAX` after GetTechnoType, then selector), names AircraftType/InfantryType/UnitType REFERENCE-SUGGESTED.
- Files: `src/Ra2.Core/Rules/HouseTypeRules.cs` (add three fields, read as `float` per data layout (reader function not quoted in spec), then widened to `SpeedMultiplier`), `src/Ra2.Sim/Movement/CountrySpeedMultiplier.cs` (`Select(TechnoKind kind, HouseTypeRules country) -> SpeedMultiplier`), `tests/Ra2.Tests/Movement/CountrySpeedMultiplierTests.cs`.
- Steps:
  - Add the three keys to the country section reader (same loader that reads Armor*/Cost*/BuildTime*Mult per row 8).
  - Store them as `float` first (the game stores `float` at +0x128/+0x12C/+0x130) and widen to the `SpeedMultiplier` double only at use, so rounding matches the game's float->double promotion.
  - Implement the selector over the project's `TechnoKind` enum (Aircraft -> SpeedAircraftMult, Infantry -> SpeedInfantryMult, Unit -> SpeedUnitsMult, anything else -> 1.0). Do not hard-code 3/16/40; cite them in a comment.
  - Resolve owner -> country via the T-020 house model (`Owner.Type`).
- Tests:
  - Country with `SpeedUnitsMult=1.2`: Unit -> 1.2, Aircraft -> its own value, Infantry -> its own value (hypothetical values; spec table B row 2 uses 1.2 as "country mult").
  - Kind Building -> 1.0 regardless of country values.
  - Float precision: parse `1.2`, assert the stored value equals `(double)(float)1.2`, not `1.2` (derived from data layout "float").
  - Missing key: assert only that the field is unchanged from whatever it was before the read (reader default = current value); the initial value itself is `spec silent`.
- Depends on: T-005, T-020, AP-01 (SpeedMultiplier type).
- Open points: default when a key is missing (spec silent; the loader body is not quoted); whether multiplayer country overrides reach this field (spec silent).

### AP-04 Current movement speed formula (FootClass::GetMovementSpeed) (size: medium)
- Goal: Implement `MovementSpeed.Compute(...) -> int` reproducing FUN_004db1a0: max speed times country mult times SpeedMultiplier, optional VeteranSpeed for Faster, times SpeedPercentage, each step rounded with F2I, then halved toward zero for a flag-carrying Unit.
- Spec basis: B (ev_d12530ff... VERIFIED-by-tool-output); row 15 GetMaxSpeed returns Type+0x678 (UNVERIFIED byte read, but consistent with B's call); row 16 Rules+0x678 = `VeteranSpeed` (UNVERIFIED key name/offset); FUN_0070d0d0 = HasAbility (role inferred, UNVERIFIED).
- Files: `src/Ra2.Sim/Movement/MovementSpeed.cs` (pure function taking a `MovementSpeedInput` record: `MaxSpeed`, `CountryMult`, `SpeedMultiplier`, `HasFaster`, `VeteranSpeed`, `SpeedPercentage`, `Kind`, `CarriesFlag`), `src/Ra2.Sim/Movement/IMovingObject.cs` (minimal interface exposing those inputs; concrete Unit/Aircraft wiring is a later task), `tests/Ra2.Tests/Movement/MovementSpeedTests.cs`.
- Steps:
  - `v = MulRound(max, countryMult, speedMultiplier)` = `F2I(((double)max * countryMult) * speedMultiplier)` — the game's chain is `FILD max; FMUL mult; FMUL SpeedMultiplier; CALL F2I` (0x4db1cd-0x4db1db), i.e. `(max * mult) * SpeedMultiplier` left to right with ONE F2I at the end. Keep exactly that association (floating-point multiplication is not associative); never form `countryMult * speedMultiplier` first. Uses the three-argument `MulRound` from AP-01.
  - `if HasFaster: v = MulRound(v, VeteranSpeed)`.
  - `v = MulRound(v, SpeedPercentage)`.
  - `if Kind == Unit && CarriesFlag: v = HalveTowardZero(v)`.
  - Expose `SpeedMultiplier` (default 1.0) and `SpeedPercentage` (default 1.0) as mutable state on the foot object with a `SetSpeedPercentage` setter (vtable +0x544 in spec); AP-07 writes it.
- Tests (spec table B; all inputs hypothetical per spec):
  - `255, 1.0, 1.0, no Faster, 1.0, no flag -> 255`.
  - `255, 1.2, 1.0, no, 1.0, no -> 306` (tag `F2I-UNVERIFIED`).
  - `10, 1.0, 1.0, no, 0.75, no -> 8` (spec: "F2I rounds; verify F2I semantics"; tag `F2I-UNVERIFIED`).
  - `10, 1.0, 1.0, no, 1.0, flag, Kind=Unit -> 5`.
  - `10, 1.0, 1.0, no, 1.0, flag, Kind=Aircraft -> 10` (derived: halving is Unit-only).
  - Faster: `100, 1.0, 1.0, yes, VeteranSpeed=1.2 (hypothetical), 1.0 -> F2I(120.0) = 120` (derived from rule; VeteranSpeed value not in spec).
  - Rounding order: `7, country 1.1, SpeedMultiplier 1.0, no Faster, SpeedPercentage 1.1, no flag` -> step-wise `F2I(F2I(7 * 1.1) * 1.1)` = `F2I(8 * 1.1)` = 9 under round-to-nearest, whereas a single `F2I(7 * 1.1 * 1.1)` = `F2I(8.47...)` = 8; assert 9 to pin the per-step F2I (derived from B; hypothetical inputs; tag `F2I-UNVERIFIED` because the first step rounds `7.700000000000001`).
- Depends on: AP-01, AP-02 (max speed source), AP-03 (country mult), T-020 (`[General] VeteranSpeed`), a veterancy/abilities task (not yet defined) for the `HasFaster` input (`HasAbility(0)`, FUN_0070d0d0, is per-object veterancy state, not a rules key; until that task exists `HasFaster` stays a plain bool input).
- Open points: F2I semantics; `VeteranSpeed` key/offset UNVERIFIED (inject as parameter, read from T-020 rules under that name with a comment); HasAbility(0) == Faster is inferred; GetMaxSpeed returning Type.Speed unmodified is row 15 UNVERIFIED; what `SpeedMultiplier` (+0x580) is set by (spec silent: keep default 1.0); initial value of `SpeedPercentage` (+0x578) (spec silent, only the setter path via Process is evidenced: default 1.0).

### AP-05 Infantry current-speed wrapper with prone placeholder (size: small)
- Goal: Provide `InfantrySpeed.Compute` that calls AP-04 and applies a prone multiplier hook whose constant is not yet known.
- Spec basis: B last paragraph (FUN_00521d80 wraps the formula; Phobos hook 0x521D94 "ProneSpeed"); the wrapper role (InfantryClass::GetCurrentSpeed, vtable slot +0x538 -> 0x521D80) and the "when prone" condition are inferred (spec helper list, row 18, UNVERIFIED); the constant itself is listed under "Open questions" and UNVERIFIED.
- Files: `src/Ra2.Sim/Movement/InfantrySpeed.cs`, `tests/Ra2.Tests/Movement/InfantrySpeedTests.cs`.
- Steps:
  - `Compute(input, isProne, SpeedMultiplier proneMultiplier)`: `v = MovementSpeed.Compute(input)`; if `isProne`, `v = MulRound(v, proneMultiplier)`.
  - Default `proneMultiplier = 1.0` with `// PLACEHOLDER: constant at 0x521D94 not yet read (T-022 open question)`; no rules key is invented for it.
  - Keep the function pure; the prone flag source (infantry state) is wired by a later task.
- Tests:
  - Not prone -> identical to AP-04 for the four spec-table-B rows.
  - Prone with placeholder 1.0 -> unchanged (documents the placeholder).
  - Prone with injected 0.5 and `v = 10 -> 5` (hypothetical multiplier, tag `PRONE-UNVERIFIED`; shows the hook works; the application form (F2I multiply) is assumed, see Open points).
- Depends on: AP-01, AP-04.
- Open points: prone multiplier constant (UNVERIFIED); whether it is applied via F2I multiply or another form (spec silent); whether it applies to all infantry or only `Crawls=` types (spec silent).

### AP-06 Drive locomotor speed accumulator and 7-lepton stepping (size: medium)
- Goal: Implement the per-frame budget logic of DriveLocomotionClass::WhileMoving: `budget = speed + accum`, step while `budget > 7`, keep the remainder.
- Spec basis: C (ev_82818cd0... VERIFIED-by-tool-output, pseudocode L101/L190/L194/L270-L685); data layout DriveLocomotionClass+0x4C (`SpeedAccum`, int) and +0x50 (coefficient, double); the leptons-per-frame reading is UNVERIFIED inference.
- Files: `src/Ra2.Sim/Movement/DriveSpeedAccumulator.cs` (state: `int SpeedAccum`; method `int Advance(int currentSpeed, bool skipSpeed, Action step)` or returning step count), `src/Ra2.Sim/Movement/DriveLocomotor.cs` (frame entry: push coefficient via `SetSpeedPercentage`, then call `GetCurrentSpeed`, then accumulate), `tests/Ra2.Tests/Movement/DriveSpeedAccumulatorTests.cs`.
- Steps:
  - At frame start (L101): `LinkedTo.SetSpeedPercentage(Coefficient)` where `Coefficient` is the AP-07 output stored on the locomotor.
  - `budget = (skipSpeed ? 0 : GetCurrentSpeed()) + SpeedAccum` (L194 mask idiom).
  - `while (budget > 7) { budget -= 7; step(); }` — one step = one entry along the track table (table contents out of scope; `step` is a callback/interface).
  - `SpeedAccum = budget` (L685).
  - Constant `BudgetPerStep = 7` (`// unit (leptons) UNVERIFIED, T-022 C inference; the value 7 is VERIFIED-by-tool-output`), `LeptonsPerCell = 256` (`>> 8` at L353) as named constants in `Ra2.Sim.Movement.Leptons`.
- Tests (derived from Rule C; the spec has no table for C, so all are rule-derived, none hypothetical in the game-value sense):
  - speed 20, accum 0 -> 2 steps, accum 6.
  - speed 7, accum 0 -> 0 steps, accum 7; next frame speed 7 -> budget 14 -> 1 step, accum 7 (shows `> 7`, not `>=`).
  - speed 0, accum 0 -> 0 steps, accum 0.
  - speed 255, accum 0 -> 36 steps, accum 3 (255 - 35*7 = 10 > 7 -> one more step -> 3).
  - skipSpeed = true, speed 50, accum 10 -> 1 step, accum 3 (speed ignored).
  - Over 10 frames at speed 7 total steps == 9 and final accum 7 (conservation: steps*7 + accum == sum of speeds).
  - `SetSpeedPercentage` is called before `GetCurrentSpeed` each frame (ordering test with a fake foot; scoped to `skipSpeed = false`, because the package short-circuits the getter when the speed term is skipped, whereas the game still calls it at L190 and masks the result at L194).
- Depends on: AP-04 (GetCurrentSpeed), AP-07 (coefficient value; can start with a constant 1.0 stub), T-021 (fixed tick drives `Advance` once per frame).
- Open points: what one step moves (track tables `DAT_007e7a28/7b28`, TrackNumber/TrackIndex) — out of scope, spec gives no contents; leptons-per-frame unit statement UNVERIFIED (do not assert cell distances); the 0.2 coefficient clamp "while crushing" (C.4) is implemented by AP-08 (insert its `ClampForCrushing` call before the `SetSpeedPercentage` push of step 1 once AP-08 lands; until then `// see AP-08, T-022 C.4`); frame rate (T-021).

### AP-07 Drive `Process` speed coefficient (ground table, hills, damage) (size: medium)
- Goal: Compute the Drive locomotor's speed coefficient per `Process`: ground-table lookup capped at 1.0, Unit-only up/downhill factors, 0.5 fallback for 0, 0.75 when health <= ConditionYellow, then store or push to `SetSpeedPercentage`.
- Spec basis: D (ev_2ad20377... VERIFIED-by-tool-output, L772-L817); rules keys all from byte reads (fstp preceded by key push), UNVERIFIED: row 16 Rules+0x770 `TrackedDownhill`, +0x780 `WheeledDownhill`, +0x1700 `ConditionYellow`; row 16b Rules+0x768 `TrackedUphill`, +0x778 `WheeledUphill`; which height comparison is "uphill" is inferred from the key names (Rule D, UNVERIFIED); `SpeedType == 1` = Track per YRpp enum (REFERENCE-SUGGESTED); ground table at DAT_0089ea40 = `[Land]` percentages inferred, UNVERIFIED; FUN_005f5c60 = health getter inferred, UNVERIFIED; row 17b Ship same sequence UNVERIFIED (out of scope). Note: the spec's "Open questions" still lists "Decode `Process` (REA run pending)" although row 17 is VERIFIED-by-tool-output and Rule D quotes its pseudocode; that open question is stale and the spec owner should remove it before AP-07 starts.
- Files: `src/Ra2.Sim/Movement/DriveSpeedCoefficient.cs` (pure `Compute(CoefficientInput) -> SpeedMultiplier`), `src/Ra2.Sim/Movement/IGroundSpeedTable.cs` (`float Lookup(int speedType, int landIndex)`; 9 columns per spec), `src/Ra2.Sim/Movement/HillFactors.cs` (record `TrackedUphill`, `WheeledUphill`, `TrackedDownhill`, `WheeledDownhill` as `SpeedMultiplier`, spec spelling), `tests/Ra2.Tests/Movement/DriveSpeedCoefficientTests.cs`.
- Steps:
  - `coef = min(table.Lookup(speedType, landIndex), 1.0)` using the `float` table value widened to double. `speedType` is the TechnoType `SpeedType` field parsed by AP-02.
  - If `Kind == Unit`: apply the height-comparison mapping from ONE place (`HillFactors.Select(speedType, heightHere, heightThere)`), so it can be flipped in one line: `heightThere < heightHere -> coef *= (speedType == 1 ? TrackedUphill : WheeledUphill)`; `heightHere < heightThere -> coef *= (speedType == 1 ? TrackedDownhill : WheeledDownhill)`. Mark the mapping `// UNVERIFIED (T-022 D): which comparison is "uphill" is inferred from the key names`. Pass heights as ints from a `IHeightSource` (MapClass::GetCellFloorHeight equivalent, inferred).
  - `if coef == 0.0 -> coef = 0.5`.
  - `if healthRatio <= ConditionYellow -> coef *= 0.75`.
  - Write-back: `if TrackIndex < 0x40: locomotor.Coefficient = coef; else if coef != LinkedTo.SpeedPercentage: LinkedTo.SetSpeedPercentage(coef)`.
  - All six rules keys (`VeteranSpeed` is AP-04's) are treated the same way: bind `TrackedUphill`, `WheeledUphill`, `TrackedDownhill`, `WheeledDownhill`, `ConditionYellow` to T-020 `[General]` keys under the spec's names, each with `// row 16/16b UNVERIFIED (byte read of ReadINI store)`.
- Tests (all values hypothetical: the spec has no table for D; derived from D's pseudocode). Arithmetic: table values are `float` widened to double and multiplied by double factors, exactly as the steps prescribe; every table value below (0.0, 0.25, 0.5, 0.75, 1.0, 1.5) is exactly representable in `float`, and every factor (0.5, 0.75, 1.25) is a dyadic rational, so all expected results are exact doubles and are asserted with bitwise equality (`Assert.Equal(double, double)` without tolerance). Do not use 0.8 or similar: `(double)(float)0.8 * 0.75` is `0.6000000089406967`, not 0.6.
  - table 1.0, heights equal, healthy -> 1.0.
  - table 0.0, heights equal, healthy -> 0.5 (fallback).
  - table 1.5, heights equal, healthy -> 1.0 (cap).
  - table 0.75, heights equal, health <= ConditionYellow -> 0.5625 (0.75 * 0.75).
  - table 0.0, damaged -> 0.375 (fallback then 0.75; pins order).
  - Unit, speedType 1, `heightHere < heightThere`, TrackedDownhill = 1.25, table 1.0 -> 1.25 (pins that no cap is applied after the hill factor; the spec caps only the table lookup); Aircraft/Infantry kind with the same heights -> 1.0 (hill rule Unit-only). Tag `HILL-DIRECTION-UNVERIFIED`.
  - Unit, speedType 2, `heightThere < heightHere`, WheeledUphill = 0.5, table 0.75 -> 0.375. Tag `HILL-DIRECTION-UNVERIFIED`.
  - Unit, speedType 1, `heightThere < heightHere`, TrackedUphill = 0.5, table 0.25 -> 0.125 (pins the Tracked/Wheeled selection). Tag `HILL-DIRECTION-UNVERIFIED`.
  - Write-back: TrackIndex 0x3F -> stored on locomotor, foot untouched; TrackIndex 0x40 and coef differs -> `SetSpeedPercentage` called once; equal -> not called.
  - Equality `healthRatio == ConditionYellow` applies the 0.75 (`<=`).
- Depends on: AP-01, AP-02 (`SpeedType` field), AP-04 (`SpeedPercentage`/`SetSpeedPercentage`), T-020 (`[General] ConditionYellow`, `TrackedUphill`, `WheeledUphill`, `TrackedDownhill`, `WheeledDownhill`, `[Land]` sections), map height source from a terrain task (stub interface here).
- Open points: ground table contents and `[Land]` mapping / landIndex derivation (UNVERIFIED, 9 columns observed); all five rules keys are byte reads (rows 16/16b, UNVERIFIED); hill direction mapping (UNVERIFIED, inferred from key names); health getter semantics and the unit of `ConditionYellow` comparison (UNVERIFIED); the 0.2 crush clamp from C.4 is AP-08; Ship locomotor duplicate (row 17b) not in scope.

### AP-08 Drive crush clamp of the speed coefficient (size: small)
- Goal: Apply the lower bound of 0.2 to the Drive coefficient while the unit is crushing, before it is pushed via `SetSpeedPercentage` in WhileMoving.
- Spec basis: C.4 (ev_82818cd0... VERIFIED-by-tool-output, 0x4b1150-0x4b1173: coefficient "clamped to at least 0.2 (constant 0x7E3548) while crushing"); the crushing condition's source is not quoted in the spec.
- Files: `src/Ra2.Sim/Movement/DriveLocomotor.cs` (add `static SpeedMultiplier ClampForCrushing(SpeedMultiplier coef, bool isCrushing)`), `tests/Ra2.Tests/Movement/DriveCrushClampTests.cs`.
- Steps:
  - `ClampForCrushing(coef, isCrushing) = isCrushing ? max(coef, 0.2) : coef`; constant `CrushMinCoefficient = 0.2` with `// 0x7E3548, T-022 C.4`.
  - Call it in the AP-06 frame entry before `LinkedTo.SetSpeedPercentage(...)` (L101), on the value read from the locomotor's `Coefficient` (+0x50).
  - `isCrushing` is an injected `bool` on the frame-entry call; its source is a stub (`// condition source not quoted in T-022 C.4`). Do not invent a crushing rule.
- Tests (derived from C.4; values hypothetical):
  - isCrushing, coef 0.1 -> `SetSpeedPercentage(0.2)`.
  - isCrushing, coef 0.5 -> `SetSpeedPercentage(0.5)` (clamp is a lower bound only).
  - not crushing, coef 0.1 -> `SetSpeedPercentage(0.1)` (unchanged).
- Depends on: AP-01, AP-06 (frame entry), AP-07 (coefficient source; a constant stub is enough).
- Open points: what sets "crushing" (spec silent); whether the clamp also applies in the `Process` write-back path (spec places it only in WhileMoving, 0x4b1150-0x4b1173).

---

## Not covered by these packages (spec section E, by design)
Rocket, Ship and Fly/Jumpjet locomotors (E) are evidenced only partially or by reference; they get their own task once the Drive chain above is green. `[JumpjetControls] Speed` (row 4) and weapon `Speed=` (row 5) are different keys and are out of scope for T-022.

## Re-verification checklist (run after F2I is confirmed)
- Flip `GameMath.RoundingMode` if needed; re-run tests tagged `F2I-UNVERIFIED` (AP-01, AP-04) and update the spec's test table B. Revisit tests tagged `X87-PRECISION-OPEN` (AP-01) once it is decided whether extended-precision intermediates must be emulated.
- When the prone constant, the hill direction mapping, the rows 16/16b key names and the `[Land]` table are verified, remove the `PRONE-UNVERIFIED` / `HILL-DIRECTION-UNVERIFIED` tags and the `row 16/16b UNVERIFIED` comments (AP-05, AP-07).
- When the crushing condition's source is found, replace the injected `isCrushing` stub in AP-08.

## Review log
Findings from `docs/arbeitspakete/REVIEW-T-022-AP-implementation.md` (2026-10-26), applied against spec section B as amended (x87 extended-precision note).

Applied:
- AP-01 (high): false "255*1.2 = 305.999" rationale replaced by `7 * 1.1 = 7.700000000000001` (computed in IEEE double); the 255*1.2 test is kept as spec row 2 but relabelled mode-independent (`X87-PRECISION-OPEN`), and `F2I(7 * 1.1) == 8` is the new discriminating test.
- AP-01 / AP-04 (high): x87 extended-precision intermediates documented in AP-01 (spec basis, precision-seam step, open points); bit-exactness for non-representable products stated as NOT a goal until F2I is verified; `MulRound` named as the single place for a future emulation.
- AP-07 (high): tests rewritten with float-exact table values (0.0, 0.25, 0.5, 0.75, 1.0, 1.5) and dyadic factors so every expected value is an exact double under the prescribed `(double)(float)table * factor` arithmetic; bitwise equality, no tolerance.
- AP-04 (medium): multiplication order restored to `(max * mult) * SpeedMultiplier` with one F2I via a three-argument `MulRound` added to AP-01; per-step F2I pinned by a concrete rounding-order test.
- AP-07 (medium): hill direction mapping presented as UNVERIFIED, kept in one place (`HillFactors.Select`), tests expressed as height comparisons and tagged `HILL-DIRECTION-UNVERIFIED`.
- AP-07 (medium): all five `[General]` keys bound the same way under the spec's names `TrackedUphill` / `WheeledUphill` / `TrackedDownhill` / `WheeledDownhill` / `ConditionYellow`, each with a `row 16/16b UNVERIFIED` comment; `UphillTracked`/`UphillWheeled` placeholders removed.
- AP-06 / AP-07 (medium): 0.2 crush clamp (spec C.4, constant 0x7E3548) added as new AP-08 with an injected `isCrushing` stub and three tests; AP-06 open point and dependency sketch updated.
- AP-04 (medium): `HasFaster` source attributed to a veterancy/abilities task (not yet defined) instead of T-020.
- AP-07 (low, applied on request): `SpeedType=` parsing (data layout +0x67C) added to AP-02 and listed as an AP-07 dependency.
- AP-07 (low): downhill test changed to table 1.0 * 1.25 -> 1.25 to pin "no cap after hill factors".
- AP-06 (low): `LeptonsPerStep` renamed `BudgetPerStep` with a unit-UNVERIFIED comment.
- AP-06 (low): ordering test scoped to `skipSpeed = false` (the getter call is not changed to mirror L190/L194; the package's short-circuit is kept).
- AP-01 (low): "T-021 only for the project skeleton" dropped.
- AP-01 (low): "analyzer comment/test" -> "review/analyzer rule".
- AP-01 (low): `F2I(0.0)`, `HalveTowardZero(-7)`, `HalveTowardZero(7)` labelled derived.
- AP-03 (low): "parsed via T-005 double reader" -> "read as float (reader function not quoted in spec)".
- AP-03 (low, first half): missing-key test now asserts only "field unchanged from before the read".
- AP-05 (low): wrapper role and prone condition marked inferred (spec helper list, row 18) in Spec basis.
- AP-04 (low): `SpeedPercentage` initial value added to open points (spec silent, default 1.0).
- AP-07 (low): note added that the spec's "Decode `Process` (REA run pending)" open question is stale.

Not applied:
- AP-01 / AP-04 (high, part of the suggested fix): "add this to the spec's open questions" and "make `MulRound` operate on `decimal`/rational or emulate extended precision". Editing the spec is outside this package document, and spec B already states the extended-precision caveat; an emulation strategy is behaviour the spec does not prescribe, so the alternative option offered by the review ("state explicitly that bit-exactness is not a goal") was taken instead.
- AP-03 (low, second half): "add one selector test that goes through an owner object". Adding a test is not a one-line wording change; owner -> country resolution (`Owner.Type`, HouseClass+0x34) remains covered only by the step text.
- AP-05 (low, second half): "tag the prone tests accordingly". The prone tests already carry `PRONE-UNVERIFIED`; no second tag was added.
- AP-06 (low, first alternative): "always call `GetCurrentSpeed()` and mask the result". Would change the package's behaviour description; the review's second alternative (scope the test) was applied instead.
