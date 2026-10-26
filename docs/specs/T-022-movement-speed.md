# Spec: T-022 Movement speed

Status: DRAFT (parse, multiplier chain and Drive per-tick stepping evidenced; final unit/tick statement still inferred)
Binary: gamemd.exe (Yuri's Revenge, PE timestamp 2001-10-31, version resource "1.11", EA App build), SHA-256: ddeb66a552040d3a6a660e7d8228a6dbeef3a14a9413239f0ec42d7078c86d48
Path analyzed: `C:\Program Files\EA Games\Command and Conquer Red Alert II\gamemd.exe` (differs from the path in `.github/copilot-instructions.md`)
Provider: Ghidra 12.1.4 via REA (rea-agents 6.8.0, CLI), date: 2026-10-26
Raw evidence: `evidence/ra2-gamemd/` (index in `evidence/README.md`; local only, do not commit)
References used for names only: YRpp and Phobos (`evidence/yrpp-src`, `evidence/phobos-src`, shallow clones of 2026-10-26)

## Goal
Describe how the `Speed=` key from `rules.ini` is turned into per-tick movement of a unit.

## Summary of the chain
1. `TechnoTypeClass::ReadINI` reads `Speed=` (0..100) and stores it at TechnoTypeClass+0x678 scaled to 0..255.
2. `TechnoClass::GetMaxSpeed` (vtable +0x38C) returns that stored value.
3. `FootClass::GetMovementSpeed` multiplies it by the owner country's `Speed*Mult`, by `FootClass::SpeedMultiplier`,
   by `[General] VeteranSpeed` when the unit has the Faster ability, and by `FootClass::SpeedPercentage`; vehicles carrying a flag get half.
   `AircraftClass` and `UnitClass` use this directly as `GetCurrentSpeed` (vtable +0x538); `InfantryClass` wraps it and applies a prone multiplier.
4. `DriveLocomotionClass::WhileMoving` adds `GetCurrentSpeed()` to an accumulator each frame and moves along track tables in 7-lepton steps while the accumulator holds more than 7; the remainder is kept for the next frame.
   `DriveLocomotionClass::Process` computes the `SpeedPercentage` coefficient (downhill factors, 0.75 when damaged below `ConditionYellow`) that step 3 multiplies in.

## Evidence
| # | Address | What | REA tool | evidence_id | Status |
|---|---|---|---|---|---|
| 1 | 0x81d9cc | String "Speed" (neighbors "Firepower" 0x81d9c0, "Armor" 0x81d9d4) | xrefs / function | ev_a607860c134d8d4c41b8a119d8809d1a7564cde8fae4596e621996c2d0f4e442 | VERIFIED (tool output) |
| 2 | 0x81d9cc | References: 0x67441f, 0x71464c, 0x7722f5, 0x7e5264 | xrefs | ev_245d8c967e3b8fc714eacb1eaa28021d453a3c0124fb0510d6e7f5d8bb344d2b | VERIFIED (tool output) |
| 3 | 0x71464c in FUN_00712170 (0x712170-...) | Unit-type `Speed=` read, clamp, scale, store at this+0x678 | function | ev_a607860c134d8d4c41b8a119d8809d1a7564cde8fae4596e621996c2d0f4e442 | VERIFIED (tool output) |
| 4 | 0x67441f in FUN_006743d0 | `[JumpjetControls] Speed` into this+0x410 (RulesClass::Read_JumpjetControls per YRpp) | function | ev_ebf0a4ba301b8e9abe80b65862f7b58993b28234894d26c0dcd97e0ae9248b69 | VERIFIED (tool output) |
| 5 | 0x7722f5 | Weapon `Speed=` read (between Damage/ROF keys), not a Ghidra function | none (byte read) | - | UNVERIFIED |
| 6 | 0x7e5264 | Pointer to "Speed" in crate power-up name table (.rdata) | none (byte read) | - | UNVERIFIED |
| 7 | 0x82534c / 0x82535c / 0x825338 | "SpeedUnitsMult" / "SpeedInfantryMult" / "SpeedAircraftMult", each referenced once: 0x511c2c / 0x511c0d / 0x511c4b | xrefs (3 runs) | ev_02e1f5ea5319b997847c27f9395bda029b3def3571bbef46463717b06a55f010 / ev_2b6cb9491d9735b1402f085c0c74d053d4b87e16984bed71bcd3a9de583141c4 / ev_55fcfe2b8c9765208a804c57caac475d90ce9183f6c7837ec87606e161be7017 | VERIFIED (tool output) |
| 8 | FUN_00511850 (0x511850-0x512164) | Country loader: reads the three Speed*Mult keys (and Armor*/Cost*/BuildTime*Mult) into floats at +0x128/+0x12C/+0x130 | function | ev_27162a68542bf6ac5d71db554490899d36f6fcaab1dc2d9b2b52926bed1ab2d5 | VERIFIED (tool output) |
| 9 | FUN_0050c050 (0x50c050-0x50c09b) | Selector: WhatAmI()==3 -> Type+0x130, ==16 -> +0x128, ==40 -> +0x12C, else 1.0; single caller FUN_004db1a0 | function | ev_f7a0385389155dc4130105a5cc2225b56ebb514b45c1929c7b6ff0ba57844612 | VERIFIED (tool output) |
| 10 | FUN_004db1a0 (0x4db1a0-0x4db245) | Movement speed formula (see Rule); callees FUN_0050c050, FUN_0070d0d0, FUN_007c5f00; caller FUN_00521d80 | function | ev_d12530ffa6271545062969ddf26320632fb24563966c3e208dfe11913ef56a57 | VERIFIED (tool output) |
| 11 | FUN_004b0f20 (0x4b0f20-0x4b2607) | Drive per-frame stepping with accumulator at this+0x4C and coefficient at this+0x50 | function | ev_82818cd00999a883d38000b429421800ebf5841f70e8c52d6ff3bdebf2110f55 | VERIFIED (tool output) |
| 12 | FUN_006622c0 (0x6622c0-0x66300e) | Rocket locomotor: CurrentSpeed capped at Type+0x678 (as double) | function | ev_4af5eae01ca7599958a94c6e69b809f91a6fda88d03480bc0e179b63faf0f084 | VERIFIED (tool output) |
| 13 | FUN_006a05f0 (0x6a05f0-0x6a1c58) | Ship locomotor: slowdown `Type+0x678 * Type+0x300` when within Type+0x2F8 | function | ev_8217e49c6122fd541036e0c3705828fa1ee0b63cc3243bb349465c91f0446007 | VERIFIED (tool output) |
| 14 | FUN_00489180 (0x489180-0x48926c) | Multiplies by WarheadType+0x12C: MapClass::GetTotalDamage per YRpp. NOT speed; recorded to close a false lead | function | ev_78c91595642b41ed94693cf94a2d5eb12841be7ea93939326dfc1e6899aef988 | VERIFIED (tool output), irrelevant |
| 15 | 0x70EFEC | `mov eax,[eax+0x678]` in the function Phobos hooks as TechnoClass_GetMaxSpeed (0x70EFE0); vtable slot +0x38C in Aircraft/Unit/Infantry vtables points here | none (byte read) | - | UNVERIFIED |
| 16 | 0x66EEFC / 0x66F25B / 0x66F2A9 / 0x66B37F | RulesClass stores: +0x678 'VeteranSpeed', +0x770 'TrackedDownhill', +0x780 'WheeledDownhill', +0x1700 'ConditionYellow' | none (byte read: fstp preceded by key push) | - | UNVERIFIED |
| 16b | 0x66F234 / 0x66F282 | RulesClass stores: +0x768 'TrackedUphill', +0x778 'WheeledUphill' | none (byte read: fstp preceded by key push) | - | UNVERIFIED |
| 17 | FUN_004b2630 (0x4b2630-0x4b4766) | Drive `Process`: speed coefficient from ground table, up/downhill factors, 0.75 below ConditionYellow, stored at +0x50 / SetSpeedPercentage | function | ev_2ad203770828541ce9e60a327a1e7acd8c84b5a61b82793804e30628f44ecbc7 | VERIFIED (tool output) |
| 17b | 0x6A343F / 0x6A344F | Same 0.75 multiply and `fstp [this+0x50]` in the Ship locomotor | none (byte read) | - | UNVERIFIED |
| 18 | 0x7E22A4 / 0x7F5C70 / 0x7EB058 | Vtables (AircraftClass / UnitClass / InfantryClass per YRpp): slot +0x538 -> 0x4DB1A0 / 0x4DB1A0 / 0x521D80; slot +0x38C -> 0x70EFE0; slot +0x84 -> 0x6F3270 | none (byte read) | - | UNVERIFIED |
| 19 | 0x7C5F00 | Starts `sub esp,0Ch; fnstcw [esp]`; YRpp names it the game's F2I rounding routine | none (byte read) | - | UNVERIFIED |
| 20 | 0x521D83 / 0x521D94 | FUN_00521d80 calls 0x4DB1A0 at 0x521D83; at 0x521D94 the bytes `8B 86 C0 06 00 00` = `mov eax,[esi+0x6C0]` (the 6 bytes Phobos's ProneSpeed hook replaces); the prone multiplier itself was not located | none (byte read) | - | UNVERIFIED |

Status values: VERIFIED (tool output seen and checked in the Ghidra GUI), REFERENCE-SUGGESTED (from refs/), UNVERIFIED (inference).
"VERIFIED (tool output)" means REA output was seen; nothing has been checked in the Ghidra GUI yet.
Resolved: "Reveal" is at 0x81d9dc (also pointed to from the crate table at 0x7e525c). 0x81d4e4 does not hold that string.

### Raw tool output (excerpts)

xrefs 0x81d9cc (ev_245d8c96...): `["0x67441f","0x71464c","0x7722f5","0x7e5264"]`

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

function 0x4db1b6 (ev_d12530ff...), assembly:
```
0x4db1a7: MOV EAX, dword ptr [ESI]
0x4db1a9: CALL dword ptr [EAX + 0x84]          ; GetTechnoType
0x4db1af: MOV ECX, dword ptr [ESI + 0x21c]     ; Owner
0x4db1b5: PUSH EAX
0x4db1b6: CALL 0x0050c050                      ; country speed multiplier
0x4db1bf: FSTP double ptr [ESP + 0xc]
0x4db1c3: CALL dword ptr [EDX + 0x38c]         ; GetMaxSpeed
0x4db1cd: FILD dword ptr [ESP + 0x8]
0x4db1d1: FMUL double ptr [ESP + 0xc]
0x4db1d5: FMUL double ptr [ESI + 0x580]        ; SpeedMultiplier
0x4db1db: CALL 0x007c5f00                      ; F2I
0x4db1e0: PUSH 0x0
0x4db1e8: CALL 0x0070d0d0                      ; HasAbility(0)
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

function 0x50c079 (ev_f7a03853...), pseudocode:
```
iVar1 = (**(code **)(*param_1 + 0x2c))();            // WhatAmI
if (iVar1 == 3)    return *(float *)(*(int *)(in_ECX + 0x34) + 0x130);
if (iVar1 == 0x10) return *(float *)(*(int *)(in_ECX + 0x34) + 0x128);
if (iVar1 == 0x28) return *(float *)(*(int *)(in_ECX + 0x34) + 300);   // 0x12C
return 1.0;
```

function 0x4b1150 (ev_82818cd0...), pseudocode lines:
```
L101  (**(code **)(**(int **)(in_ECX + 0xc) + 0x544))(*(undefined4 *)(in_ECX + 0x50));   // SetSpeedPercentage(coefficient)
L190  uVar10 = (**(code **)(**(int **)(in_ECX + 0xc) + 0x538))();                       // GetCurrentSpeed
L194  uStack_c8 = (~-(uint)(param_1 != '\0') & uVar10) + *(int *)(in_ECX + 0x4c);        // budget = speed + SpeedAccum
L270  if (7 < uStack_c8) {
L294    do {
L297      uStack_c8 = uStack_c8 + -7;                                                    // one 7-lepton step
          ...
L683    } while (7 < uStack_c8);
L685  *(int *)(in_ECX + 0x4c) = uStack_c8;                                               // leftover kept
```

function 0x662933 (ev_4af5eae0...): `if ((double)*(int *)(iVar16 + 0x678) < *(double *)(param_1 + 0x11)) *(double *)(param_1 + 0x11) = (double)*(int *)(iVar16 + 0x678);`
function 0x6a077f (ev_8217e49c...): `uStack_d0 = uStack_d0 - (double)*(int *)(iVar9 + 0x678) * *(double *)(iVar9 + 0x300);` guarded by `iVar8 < *(int *)(iVar9 + 0x2f8)`.

## Data layout
| Owner | Offset | Type | Meaning | Source |
|---|---|---|---|---|
| TechnoTypeClass | +0x678 | int 0..255 | Scaled `Speed=` | REA ev_a607860c; name REFERENCE-SUGGESTED (YRpp `int Speed`, Phobos hook at 0x71464A uses `&pThis->Speed`) |
| TechnoTypeClass | +0x67C | int | `SpeedType=` | REA ev_a607860c (pseudocode) |
| TechnoTypeClass | +0x2F8 / +0x300 | int / double | SlowdownDistance / DecelerationFactor (used by Ship locomotor) | REA ev_8217e49c; names REFERENCE-SUGGESTED (YRpp `align_2FC` anchor) |
| HouseTypeClass | +0x128 / +0x12C / +0x130 | float | SpeedInfantryMult / SpeedUnitsMult / SpeedAircraftMult | REA ev_27162a68; order matches YRpp field list exactly (REFERENCE-SUGGESTED names) |
| HouseClass | +0x34 | HouseTypeClass* | Type (country) | REA ev_f7a03853 reads it; name REFERENCE-SUGGESTED |
| TechnoClass | +0x21C | HouseClass* | Owner | REA ev_d12530ff reads it; name REFERENCE-SUGGESTED |
| FootClass | +0x578 / +0x580 | double | SpeedPercentage / SpeedMultiplier | REA ev_d12530ff, ev_82818cd0; names REFERENCE-SUGGESTED (YRpp `unused_574` anchor) |
| UnitClass | +0x6CC | int | FlagHouseIndex (-1 = none) | REA ev_d12530ff; name REFERENCE-SUGGESTED (YRpp `unknown_int_6D4` anchor) |
| DriveLocomotionClass | +0x4C / +0x50 | int / double | SpeedAccum / speed coefficient (`movementspeed_50`) | REA ev_82818cd0; names REFERENCE-SUGGESTED |
| RulesClass (global ptr 0x8871E0) | +0x678 / +0x770 / +0x780 / +0x1700 | double | VeteranSpeed / TrackedDownhill / WheeledDownhill / ConditionYellow | byte read of ReadINI stores (UNVERIFIED); 0x8871E0 = RulesClass::Instance per YRpp |
| RulesClass | +0x410 | int | `[JumpjetControls] Speed` | REA ev_ebf0a4ba |
| vtable (Aircraft/Unit/Infantry) | +0x84 / +0x2C / +0x38C / +0x538 / +0x544 | fn ptr | GetTechnoType / WhatAmI / GetMaxSpeed / GetCurrentSpeed / SetSpeedPercentage | byte read of vtables + YRpp order (UNVERIFIED) |

Helper functions (roles inferred from use, UNVERIFIED): FUN_005276d0 INI int reader; FUN_005283d0 INI double reader; FUN_00526810 section-exists; FUN_0070d0d0 TechnoClass::HasAbility; FUN_007c5f00 F2I rounding; FUN_006f3270 GetTechnoType; FUN_00521d80 InfantryClass::GetCurrentSpeed (Phobos hook 0x521D94 "ProneSpeed").

## Rule (plain language)

### A. Parsing `Speed=` (FUN_00712170, 0x71464a-0x71469f)
1. Read `Speed` from the type's section as an integer, default -1.
2. If the result is -1 (missing key or explicit -1), keep the existing value.
3. Clamp to 0..100.
4. Multiply by 256 and divide by 100, truncating (magic-number divide `0x51EB851F`, shift 5, sign fix).
5. Cap at 255 and store at TechnoTypeClass+0x678.
Phobos's `INI_EX::ReadSpeed` reproduces this (`min(v,100)*256/100`, F2I, `min(speed,255)`), except it leaves negative values unchanged where the game clamps them to 0.

### B. Current speed of a moving object (FUN_004db1a0)
```
max   = GetMaxSpeed()                                   // vtable +0x38C -> Type->Speed (0..255)
mult  = owner country Speed{Aircraft|Infantry|Units}Mult chosen by WhatAmI() (3 / 16 / 40), else 1.0
v     = F2I(max * mult * this->SpeedMultiplier)         // +0x580
if HasAbility(0 /*Faster*/):  v = F2I(v * Rules->VeteranSpeed)
v     = F2I(v * this->SpeedPercentage)                  // +0x578
if WhatAmI() == 1 /*Unit*/ and this->FlagHouseIndex != -1:  v = v / 2   (toward zero)
return v
```
Each F2I result is rounded to int before the next step, but within a step the products are formed on the x87 stack in extended (80-bit) precision and only then passed to F2I (0x4db1cd-0x4db1db: FILD, FMUL, FMUL, CALL — no intermediate store). A reimplementation in IEEE double can differ from the game for products that are not exactly representable (e.g. 255 * 1.2 is exactly 306.0 in double but slightly below 306 in extended precision); treat such cases as open until AP-14 settles F2I semantics.
AircraftClass and UnitClass expose this as `GetCurrentSpeed` (vtable +0x538). InfantryClass (FUN_00521d80) calls it and then applies a prone multiplier (constant at 0x521D94, see raw bytes in evidence folder).

### C. Per-frame movement, Drive locomotor (FUN_004b0f20)
1. Each frame: `budget = GetCurrentSpeed() + SpeedAccum` (the speed term is skipped when the function's bool argument is set).
2. While `budget > 7`: subtract 7 and advance one step along the current track table entry (`DAT_007e7a28` / `DAT_007e7b28`, indexed by TrackNumber and TrackIndex). Cell coordinates are derived from leptons with `>> 8` (256 leptons per cell), seen at L353.
3. Store the remaining budget in `SpeedAccum` for the next frame.
4. Before moving, the locomotor calls `SetSpeedPercentage(coefficient at +0x50)` (L101); the coefficient is produced by `Process` (see D) and clamped to at least 0.2 (constant 0x7E3548) while crushing (0x4b1150-0x4b1173).
Inference (UNVERIFIED): the value returned by `GetCurrentSpeed()` is therefore in leptons per frame; `Speed=100` corresponds to 255 leptons (just under one cell) per frame before multipliers.

### D. Speed coefficient (FUN_004b2630 = Drive `Process`, 0x4b2630-0x4b4766, ev_2ad20377..., pseudocode L772-L817)
```
coef = groundTable[Type->SpeedType (+0x67C) + landIndex * 9]     // float table at DAT_0089ea40; capped at 1.0
if WhatAmI() == 1 (Unit):
    if  heightThere < heightHere:  coef *= (SpeedType == 1 ? Rules+0x768 : Rules+0x778)   // TrackedUphill / WheeledUphill (keys: byte read, row 16b)
    elif heightHere < heightThere: coef *= (SpeedType == 1 ? Rules+0x770 : Rules+0x780)   // TrackedDownhill / WheeledDownhill (row 16)
    // SpeedType 1 = Track per YRpp enum (REFERENCE-SUGGESTED); which comparison is "uphill" is inferred from the key names, UNVERIFIED
if coef == 0.0: coef = 0.5
if FUN_005f5c60() <= Rules->ConditionYellow (+0x1700): coef *= 0.75                          // constant 0x7E7FC0
if this->TrackIndex (+0x58) < 0x40: this->coef (+0x50) = coef
elif coef != LinkedTo->SpeedPercentage (+0x578): LinkedTo->SetSpeedPercentage(coef)         // vtable +0x544
```
Heights come from two FUN_00578080 calls (MapClass::GetCellFloorHeight per YRpp, 0x578080). FUN_005f5c60 is inferred to be a health-percentage getter (UNVERIFIED). The Ship locomotor has the same sequence at 0x6A33E0-0x6A3457 (byte read). The table at DAT_0089ea40 is inferred to hold the `[Land]`-section percentages per SpeedType (UNVERIFIED; 9 columns observed).

### E. Other locomotors
- Rocket (FUN_006622c0): per-frame `CurrentSpeed += Type->Acceleration-like float`, capped at `Type->Speed` (+0x678) read as double.
- Ship (FUN_006a05f0): within `Type->SlowdownDistance` of the target, `speed -= Type->Speed * Type->DecelerationFactor` per frame, floor 0.3 (or 0.1 in another branch).
- Fly: not analyzed with REA. Phobos hooks (0x4CDA78, 0x4CE4BF) compute `Type->Speed * CurrentSpeed * multiplier` (REFERENCE only).

## Pseudocode summary
See Rule sections A-C; they are original wording of 0x71464a-0x71469f, 0x4db1a0-0x4db245 and 0x4b0f20-0x4b2607.

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

Current speed (section B), from the decoded rule (ev_d12530ff...), all inputs hypothetical:
| max | country mult | SpeedMultiplier | Faster | VeteranSpeed | SpeedPercentage | flag | result |
|---|---|---|---|---|---|---|---|
| 255 | 1.0 | 1.0 | no | - | 1.0 | no | 255 |
| 255 | 1.2 | 1.0 | no | - | 1.0 | no | F2I(306.0) = 306 |
| 10 | 1.0 | 1.0 | no | - | 0.75 | no | F2I(7.5) = 8 (F2I rounds; verify F2I semantics) |
| 10 | 1.0 | 1.0 | no | - | 1.0 | yes (Unit) | 5 |

TODO: take real `Speed=` values from the user's `rulesmd.ini` and a measured in-game distance per frame to confirm the leptons-per-frame reading.

## Open questions
- Confirm FUN_007c5f00 (F2I) rounding semantics; the test values above assume round-to-nearest as YRpp describes.
- Section D: which height comparison is "uphill" is inferred from the key names only; confirm the sign of the two FUN_00578080 comparisons (AP-16).
- Section D: SpeedType string-to-int mapping (`SpeedType=` parsing in FUN_00712170 via FUN_00476fc0) is not decoded.
- Helper roles FUN_005276d0 / FUN_005283d0 / FUN_00526810 / FUN_0070d0d0 / FUN_006f3270 / FUN_005f5c60 are inferred from use only.
- FlyLocomotion and Jumpjet per-frame application were not analyzed with REA.
- Frame rate at which section C runs (T-021).
- Byte-read rows (#5, #6, #15-#19) need REA evidence (e.g. `rea instructions` or a containing function) before they count as VERIFIED.
- The infantry prone multiplier constant at 0x521D94 (see `evidence/ra2-gamemd/`).

## Human review
Reviewer: <name>, date: <YYYY-MM-DD>, notes: check 0x71464a-0x71469f, 0x4db1a0-0x4db245 and the loop at 0x4b1f5c-0x4b25f9 in the Ghidra GUI; confirm class names against YRpp.
