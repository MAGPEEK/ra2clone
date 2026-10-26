# Spec: T-xxx <title>

Status: DRAFT | REVIEWED | IMPLEMENTED
Binary: gamemd.exe (Yuri's Revenge v1.001), SHA-256: <paste from open_binary result>
Provider: Ghidra <version>, date: <YYYY-MM-DD>

## Goal
One or two sentences: what behavior of the original game this spec describes.

## Evidence
| # | Address | What | REA tool | evidence_id | Status |
|---|---|---|---|---|---|
| 1 | 0x... | e.g. string "Speed" | list_strings | ev_... | VERIFIED |
| 2 | 0x... | function that reads the key | xrefs / procedure_pseudocode | ev_... | VERIFIED |

Status values: VERIFIED (tool output seen and checked in the Ghidra GUI), REFERENCE-SUGGESTED (from refs/), UNVERIFIED (inference).

## Data layout
Fields involved (offset, size, meaning, source). Mark names that come from a reference.

## Rule (plain language)
Describe the logic step by step without copying decompiled code.

## Pseudocode summary
Short, original pseudocode of the rule. Mention the function addresses it summarizes.

## Test values
| Input | Expected | Source |
|---|---|---|
| ... | ... | e.g. rules.ini value / in-game measurement / documented value |

## Open questions
- ...

## Human review
Reviewer: <name>, date: <YYYY-MM-DD>, notes: ...
