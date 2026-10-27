# AP-14 addendum: control word at DAT_00822d80 (REA data read)

Follows `AP-14.md`, which left the rounding mode of FUN_007c5f00 open because the value loaded by
`FLDCW` from `DAT_00822d80` was not visible in the function output.

## 1. Runs

| Tool | Output file | evidence_id | Status |
|---|---|---|---|
| REA MCP `read_bytes` address 0x822d80 length 2 (Ghidra 12.1.4, session opened with `gamemd.snapshot`) | `evidence/ra2-gamemd/bytes-0x822d80.json` | ev_e087554034d37c2b4b06c8aa074fe3bbb27f04f75535502c0ae42b3934254efa | ok |

This is the explicit REA data-read exception of the common rules (no manual byte read).

## 2. Quoted output

```
"normalized_result":{"address":"0x822d80","requested_bytes":2,"returned_bytes":2,"bytes_hex":"7f0e","complete":true}
```

## 3. Derived facts

- The two bytes at 0x822d80 are `7f 0e`. FUN_007c5f00 loads them with `FLDCW word ptr [DAT_00822d80]`
  (ev_30d736aa..., AP-14), i.e. as a little-endian 16-bit x87 control word: **0x0E7F**.
- 0x0E7F = `0000 1110 0111 1111`.
  - Bits 11:10 (RC, rounding control) = `11` -> **round toward zero (truncate)**.
  - Bits 9:8 (PC, precision control) = `10` -> 53-bit (double) significand.
  - Bits 5:0 = `111111` -> all six exceptions masked.
- Therefore `FISTP` in FUN_007c5f00 truncates toward zero. Input/output table (derived from
  ev_30d736aa... + ev_e0875540...):

| input | F2I |
|---|---|
| 7.5 | 7 |
| 8.5 | 8 |
| -5.0 | -5 |
| -4.5 | -4 |
| 2.4 | 2 |
| 2.6 | 2 |
| 0.0 | 0 |

- AP-14 quoted that the function compares the current control word with DAT_00822d80 and only
  executes `FLDCW` when they differ, and never restores the caller's word. Consequence visible from
  the quoted code alone: after the first call, the x87 control word of that thread stays 0x0E7F for
  all later x87 arithmetic (not only inside FUN_007c5f00). Whether anything else resets it is
  UNVERIFIED (no search for other `FLDCW` sites was made).
- UNVERIFIED: whether DAT_00822d80 is ever written at run time. AP-14's `xrefs 0x822d80` listed
  only the three readers inside FUN_007c5f00 (0x7c5ef9, 0x7c5f13, 0x7c5f26) and no writer, so the
  shipped value 0x0E7F is the only one evidenced.

## 4. Reference check

YRpp `Unsorted.h` comment on `F2I` (see AP-14.md, REFERENCE-SUGGESTED) describes the routine as
"rounds"; the quoted control word shows truncation. Reference comment is not evidence; the tool
output wins.

## 5. Proposed spec edits

- Evidence row #19: Status -> `VERIFIED (tool output)`, REA tool -> `function + read_bytes`,
  evidence_id -> `ev_30d736aaee2eba3faeb44096c1cc2728ecc2475515de7930881f57f23dc15b08 / ev_e087554034d37c2b4b06c8aa074fe3bbb27f04f75535502c0ae42b3934254efa`,
  What -> "FUN_007c5f00: FNSTCW, compare with DAT_00822d80 (= 0x0E7F: RC=truncate, PC=53-bit), FLDCW if different, FISTP qword; returns EDX:EAX; caller's control word not restored".
- Rule B sentence "Each F2I result is rounded to int before the next step" ->
  "Each F2I result is truncated toward zero (x87 RC=11 from DAT_00822d80 = 0x0E7F) before the next step".
- Rule B precision paragraph: replace "the products are formed on the x87 stack in extended (80-bit) precision"
  by "the products are formed on the x87 stack with the control word 0x0E7F in force after the first F2I call
  (53-bit precision, truncation); before the first call the process default applies (UNVERIFIED which)".
- Test values (section B): `F2I(7.5) = 8 (F2I rounds; verify F2I semantics)` -> `F2I(7.5) = 7 (truncation, ev_e0875540...)`;
  `F2I(306.0) = 306`: with PC=53-bit the x87 product is rounded to double precision, and in double
  255 * 1.2 == 306.0 exactly (checked: `node -e "255*1.2===306"` -> true), so the row stays 306.
  The spec's earlier worry about extended (64-bit) precision no longer applies once the control
  word 0x0E7F is in force; before the first F2I call the process default precision is UNVERIFIED.
  Products that are not exactly representable (e.g. 10 * 0.75 = 7.5) now truncate: 7, not 8.
- Open question 1 -> Resolved: "FUN_007c5f00 truncates toward zero; control word 0x0E7F at DAT_00822d80 (ev_e0875540...)".

## 6. Proposed `evidence/README.md` row

| `bytes-0x822d80.json` | REA MCP `read_bytes 0x822d80 2` (Ghidra) | ev_e087554034d37c2b4b06c8aa074fe3bbb27f04f75535502c0ae42b3934254efa | 2 bytes `7f 0e` = x87 control word 0x0E7F loaded by FUN_007c5f00 |
