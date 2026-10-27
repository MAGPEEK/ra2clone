# REA evidence

Raw REA output collected on 2026-10-26 and 2026-10-27 with rea-agents 6.8.0 (Ghidra 12.1.4 provider for native work) and, for the data reads of 2026-10-27, the REA MCP `read_bytes` tool on the same Ghidra provider.
Files are unmodified tool output, except that `rea_progress` lines are still included in some files.

> `fn-*.json` and `*.snapshot` under `ra2-gamemd/` stay local (gitignored): they contain decompiled
> code and analysis of `gamemd.exe` (see "Do not" in `.github/copilot-instructions.md`). The `xrefs-*`, `instr-*`,
> `bytes-*`, `search-*`, `fileoffset-*` and `decompile-*` JSON files (address lists, single decoded instructions,
> short data windows, errors) are tracked. Cite evidence_ids in specs instead of copying decompiled code.

## ra2-gamemd — `gamemd.exe` (T-022)

Target: `C:\Program Files\EA Games\Command and Conquer Red Alert II\gamemd.exe`
SHA-256 `ddeb66a552040d3a6a660e7d8228a6dbeef3a14a9413239f0ec42d7078c86d48`

Unless noted, the command prefix is `npx -y rea-agents@6.8.0 <cmd> "<gamemd.exe>" <address> --provider ghidra [--snapshot <snapshot>] --format json`; `read-bytes` / `inspect-native-instruction` / `address-to-file-offset` take no `--snapshot` flag.

| File | REA command | evidence_id | What it shows |
|---|---|---|---|
| `xrefs-speed.json` | `xrefs 0x81d9cc --provider ghidra` | ev_245d8c967e3b8fc714eacb1eaa28021d453a3c0124fb0510d6e7f5d8bb344d2b | References to "Speed": 0x67441f, 0x71464c, 0x7722f5, 0x7e5264 |
| `fn-0x71464c.json` | `function 0x71464c --provider ghidra` | ev_a607860c134d8d4c41b8a119d8809d1a7564cde8fae4596e621996c2d0f4e442 | FUN_00712170: unit `Speed=` read, clamp, scale, store at +0x678; `SpeedType=` read via FUN_00476fc0 at 0x7121e0 |
| `fn-0x67441f.json` | `function 0x67441f --provider ghidra` | ev_ebf0a4ba301b8e9abe80b65862f7b58993b28234894d26c0dcd97e0ae9248b69 | FUN_006743d0: `[JumpjetControls] Speed` into +0x410 |
| `fn-0x7722f5.json` | `function 0x7722f5 --provider ghidra` | none (error) | "No procedure exists at the requested address" |
| `fn-0x7e5264.json` | `function 0x7e5264 --provider ghidra` | none (error) | Same error; the address is data in .rdata |
| `xrefs-0x82534c.json` | `xrefs 0x82534c --provider ghidra` | ev_02e1f5ea5319b997847c27f9395bda029b3def3571bbef46463717b06a55f010 | "SpeedUnitsMult" referenced once: 0x511c2c |
| `xrefs-0x82535c.json` | `xrefs 0x82535c --provider ghidra` | ev_2b6cb9491d9735b1402f085c0c74d053d4b87e16984bed71bcd3a9de583141c4 | "SpeedInfantryMult" referenced once: 0x511c0d |
| `xrefs-0x825338.json` | `xrefs 0x825338 --provider ghidra` | ev_55fcfe2b8c9765208a804c57caac475d90ce9183f6c7837ec87606e161be7017 | "SpeedAircraftMult" referenced once: 0x511c4b |
| `fn-0x511c2c.json` | `function 0x511c2c --provider ghidra` | ev_27162a68542bf6ac5d71db554490899d36f6fcaab1dc2d9b2b52926bed1ab2d5 | FUN_00511850: country loader, Speed*Mult floats at +0x128/+0x12C/+0x130 |
| `fn-0x50c079.json` | `function 0x50c079 --provider ghidra` | ev_f7a0385389155dc4130105a5cc2225b56ebb514b45c1929c7b6ff0ba57844612 | FUN_0050c050: country speed multiplier selector by WhatAmI() |
| `fn-0x4db1b6.json` | `function 0x4db1b6 --provider ghidra` | ev_d12530ffa6271545062969ddf26320632fb24563966c3e208dfe11913ef56a57 | FUN_004db1a0: movement speed formula (Rule B) |
| `fn-0x4b1150.json` | `function 0x4b1150 --provider ghidra` | ev_82818cd00999a883d38000b429421800ebf5841f70e8c52d6ff3bdebf2110f55 | FUN_004b0f20: Drive per-frame stepping, accumulator +0x4C, track loop |
| `fn-0x4b1f64.json` | `function 0x4b1f64 --provider ghidra` | ev_7bf7fc12fab5194682ce5da0ace375cfbc379b515ff0d6110294e021b61c3210 | Same function (FUN_004b0f20), second decompile |
| `fn-0x4b3df0.json` | `function 0x4b3df0 --provider ghidra` | ev_2ad203770828541ce9e60a327a1e7acd8c84b5a61b82793804e30628f44ecbc7 | FUN_004b2630: Drive `Process`, speed coefficient (Rule D) |
| `fn-0x662933.json` | `function 0x662933 --provider ghidra` | ev_4af5eae01ca7599958a94c6e69b809f91a6fda88d03480bc0e179b63faf0f084 | FUN_006622c0: Rocket locomotor, cap at Type+0x678 |
| `fn-0x6a077f.json` | `function 0x6a077f --provider ghidra` | ev_8217e49c6122fd541036e0c3705828fa1ee0b63cc3243bb349465c91f0446007 | FUN_006a05f0: Ship locomotor slowdown |
| `fn-0x4891ce.json` | `function 0x4891ce --provider ghidra` | ev_78c91595642b41ed94693cf94a2d5eb12841be7ea93939326dfc1e6899aef988 | FUN_00489180: damage function (not speed; false lead) |
| `fn-0x6fdb80.json` | `function 0x6fdb80 --provider ghidra` | ev_8f9129a4c6e9d8d3d0c1abf885d56bf805db70a869bf26828614360e6c65e159 | FUN_006fdb80: caller of the damage function (irrelevant to T-022) |
| `fn-0x5f540f.json` | `function 0x5f540f --provider ghidra` | ev_a91f9ada2905c3d95e95496e730ddb22a8d27650df51b21041b1cc496cce5830 | FUN_005f5390: caller of the damage function (irrelevant to T-022) |
| `fn-0x7c5f00.json` | `function 0x7c5f00 --provider ghidra --snapshot gamemd-AP14.snapshot` | ev_30d736aaee2eba3faeb44096c1cc2728ecc2475515de7930881f57f23dc15b08 | FUN_007c5f00 (F2I): FNSTCW, compare/FLDCW with DAT_00822d80, FISTP qword, 64-bit return; 461 callers |
| `xrefs-0x822d80.json` | `xrefs 0x822d80 --provider ghidra --snapshot gamemd-AP14.snapshot` | ev_2743ff13d939b5e5429434b1f5041eeaeecd1cb7f4e4d93370179ff37e361646 | References to DAT_00822d80: 0x7c5ef9, 0x7c5f13, 0x7c5f26 (no writer) |
| `bytes-0x822d80.json` | REA MCP `read_bytes 0x822d80 2` (Ghidra) | ev_e087554034d37c2b4b06c8aa074fe3bbb27f04f75535502c0ae42b3934254efa | 2 bytes `7f 0e` = x87 control word 0x0E7F loaded by FUN_007c5f00 (RC = truncate) |
| `fn-0x70efe0.json` | `function 0x70efe0 --provider ghidra --snapshot gamemd-AP12.snapshot` | none (error) | "No procedure exists at the requested address: 0x70efe0" |
| `xrefs-0x70efe0.json` | `xrefs 0x70efe0 --provider ghidra --snapshot gamemd-AP12.snapshot` | ev_8c39641075f39f71c8e07e73b649168ce728a44055e7ec1f99ac5036664a2128 | References to 0x70efe0: 0x7e2630, 0x7e4248, 0x7e9020, 0x7eb3e4, 0x7f4cec, 0x7f5ffc (vtable +0x38C for Aircraft/Infantry/Unit) |
| `instr-0x70efe0.json` | `instructions 0x70efe0 --provider ghidra --snapshot gamemd-AP12.snapshot` | none (error) | Same "No procedure exists" error |
| `fileoffset-0x70efe0.json` | `address-to-file-offset 0x70efe0 --provider ghidra` | ev_5c8e3083fb884e5774e3a590a4bd3d30a0345bedada0417682f54c337bee1e49 | 0x70efe0 -> file offset 3207136 (0x30efe0) |
| `decompile-0x70efe0.json` | `decompile --file-offset=0x30efe0 --provider ghidra --snapshot gamemd-AP12.snapshot` | none (error) | "no procedure starts at or contains that address" |
| `instr-0x70efe0-single.json` | `inspect-native-instruction 0x70efe0 --provider ghidra` | ev_b41714b131b2b7bc4d17252ede4a3eaad3bd8d7c4090366d8bad45ff15958392 | `MOV EAX,dword ptr [ECX]` (8b01); six DATA incoming references |
| `instr-0x70efe2-single.json` | `inspect-native-instruction 0x70efe2 --provider ghidra` | ev_d3f7d56d571a2ec5aeab0fca38da29462e1f1d1dde2a82e0dd4eba07c607e269 | `CALL dword ptr [EAX + 0x84]` (ff9084000000) |
| `instr-0x70efe8-single.json` | `inspect-native-instruction 0x70efe8 --provider ghidra` | ev_1e8a9f4dca747da9847d26b9ef987b45ef41c2d5483c1af3af729a126309d0ce | `TEST EAX,EAX` (85c0) |
| `instr-0x70efea-single.json` | `inspect-native-instruction 0x70efea --provider ghidra` | ev_dffad71b29e7e054081c4bb5635b10d7a590114836f03e149d7d51fe62f3d74c | `JZ 0x0070eff3` (7407) |
| `instr-0x70efec-single.json` | `inspect-native-instruction 0x70efec --provider ghidra` | ev_6deeab1046b5c4ed4af5a40a06e06746486423f035a6067e92b7c223287206e4 | `MOV EAX,dword ptr [EAX + 0x678]` (8b8078060000) - the Type->Speed load of row 15 |
| `instr-0x70eff2-single.json` | `inspect-native-instruction 0x70eff2 --provider ghidra` | ev_40f300a4a8746855b0c72e0e910353475441fc72d64020e36569af254da53a8a | `RET` (c3) |
| `instr-0x70eff3-single.json` | `inspect-native-instruction 0x70eff3 --provider ghidra` | ev_4690f8379b6af4d828ccb32b42245d28839c6b4efc2956e5440b11f2395b4d60 | `XOR EAX,EAX` (33c0), target of the JZ |
| `instr-0x70eff5-single.json` | `inspect-native-instruction 0x70eff5 --provider ghidra` | ev_c54dbca84087ac3c4026e534f288d5eaf1c9ac4225903dc0676881ab4bf2a1b4 | `RET` (c3) |
| `fn-0x66eefc.json` | `function 0x66eefc --provider ghidra --snapshot gamemd-AP11.snapshot` | ev_2772022c93b2c19e906fded4d1be05172c67979986372008e57cc64adc1bec48 | FUN_0066d530 (0x66d530-0x671e98, `[General]` loader): `FSTP double ptr [ESI+0x678/0x768/0x770/0x778/0x780]` after `CALL 0x005283d0` with keys "VeteranSpeed" 0x83c9b4, "TrackedUphill" 0x83c8ac, "TrackedDownhill" 0x83c89c, "WheeledUphill" 0x83c88c, "WheeledDownhill" 0x83c87c |
| `fn-0x66b37f.json` | `function 0x66b37f --provider ghidra --snapshot gamemd-AP11.snapshot` | ev_22a314265c52606bc186043543877d91fa3da11f9e4a9306f311f9f1b77874c0 | FUN_006691e0 (0x6691e0-0x66b8ff, `[AudioVisual]` loader): `FSTP double ptr [ESI+0x1700]` after `CALL 0x005283d0` with key "ConditionYellow" 0x83a370 |
| `xrefs-0x4db1a0.json` | `xrefs 0x4db1a0 --provider ghidra --snapshot gamemd-AP13.snapshot` | ev_3038fc4f05894b1ba94de99388c563e37ef8f68671523dcc96b04f19990132d9 | References to 0x4db1a0: 0x521d83 (CALL in FUN_00521d80), 0x7e27dc (= 0x7E22A4+0x538), 0x7f61a8 (= 0x7F5C70+0x538), 0x7e91cc (= 0x7E8C94+0x538, unnamed vtable) |
| `xrefs-0x6f3270.json` | `xrefs 0x6f3270 --provider ghidra --snapshot gamemd-AP13.snapshot` | ev_e03b859e594994112786502db398a9ed788bc79c039b556a4da8157ad8d55569 | References to 0x6f3270 (no Ghidra procedure there): 0x7e2328 / 0x7f5cf4 / 0x7eb0dc (= Aircraft / Unit / Infantry vtable +0x84), 0x7e3f40 (= 0x7E3EBC+0x84, Building), 0x7e8d18, 0x7f49e4 (unnamed vtables +0x84) |
| `xrefs-0x6f3270.json.stderr` | stderr of the run above | n/a | Empty (no errors) |
| `fn-0x5f5c60.json` | `function 0x5f5c60 --provider ghidra --snapshot gamemd-AP16.snapshot` | ev_62e78e5252e6cddff837a5ae8d740d55c392b5be225d2a21baefb7ab14d81c6d | FUN_005f5c60 (32 bytes): `this[+0x6c]` / `GetType()[+0xa0]` as double on x87 (ConditionYellow comparand) |
| `fn-0x578080.json` | `function 0x578080 --provider ghidra --snapshot gamemd-AP16.snapshot` | ev_0c254678c6b2ea9eeb70e5c1d86dfd9b2cb36c82b2d43103327253ba9e78c7dd | FUN_00578080: coordinate -> cell (`>> 8`, `y*0x200+x`, DAT_0087f924, fallback 0xabdc50) -> FUN_0047b3a0 |
| `fn-0x47b3a0.json` | `function 0x47b3a0 --provider ghidra --snapshot gamemd-AP16.snapshot` | ev_4932a5d2340faec97e79b524555e20a5bb031e789f704e820d8eca7a249cda9c | FUN_0047b3a0: int cell floor height from byte +0x11b * DAT_0089e7c0 plus ramp term (byte +0x11c, table 0x81c900) |
| `fn-0x521d80.json` | `function 0x521d80 --provider ghidra --snapshot gamemd-AP17.snapshot` | ev_e0a2a5c34a50488eefa642410c9683e17c676f9d6e7c2cf82666569712ecf0c3 | FUN_00521d80 (InfantryClass GetCurrentSpeed wrapper): calls FUN_004db1a0, tests this+0x6DB and [this+0x6C0]+0xEBD, integer prone branches v - trunc(v/3) / v + trunc(v/2); no FPU, no DAT operand |
| `xrefs-0x521d80.json` | `xrefs 0x521d80 --provider ghidra --snapshot gamemd-AP17.snapshot` | ev_3e3a547987cdedecf729c694bc429dfa471c7067f3cef8d44dc21fc8cc75961a | Single reference to 0x521d80 from 0x7eb590 (= 0x7EB058 + 0x538, InfantryClass vtable slot) |
| `fn-0x476fc0.json` | `function 0x476fc0 --provider ghidra --snapshot gamemd-AP24.snapshot` | ev_f6c772b6768acbe88672deb0541cf136c179e979777068c218f64a00d13e9f35 | FUN_00476fc0 (0x476fc0-0x47701e): `SpeedType=` reader; FUN_0048e030(buf,0x80), FUN_00528a10(section,key,..,buf,0x80), on non-zero result FUN_0048dff0(buf), else returns the 3rd argument (old value) |
| `fn-0x48dff0.json` | `function 0x48dff0 --provider ghidra --snapshot gamemd-AP24.snapshot` | ev_bcb316147b322b39b3d9449cd8fa52d559a1b1fc701fbbe02b776e12319cecab | FUN_0048dff0 (0x48dff0-0x48e028): index lookup over 8 string pointers 0x81da58..0x81da74 via FUN_007c8d20, returns index or -1; entry 1 = "Track" (0x81dbcc); `PTR_s_Underground_0081da78` is the loop end |
| `fn-0x5276d0.json` | `function 0x5276d0 --provider ghidra --snapshot gamemd-AP12.snapshot` | ev_a3d4e51d5824a6c9b75bb8bd6f6ebfd9337123d370b6170c94bb2ae3025870df | FUN_005276d0: INI int reader (section, key, default) -> EAX; default on miss |
| `fn-0x5283d0.json` | `function 0x5283d0 --provider ghidra --snapshot gamemd-AP12.snapshot` | ev_be4c09eb3b81519c903074d226e9905149b5d2c56adb567e44e9fb890a41e352 | FUN_005283d0: INI double reader (section, key, double default) -> x87; 0.01 scaling path via FUN_007caf30 |
| `fn-0x526810.json` | `function 0x526810 --provider ghidra --snapshot gamemd-AP12.snapshot` | ev_f2681433dc390d881a5435965c396d6184b7d2871ac96339566225ce72597ee6 | FUN_00526810: INI section lookup by name hash, binary search over 8-byte entries |
| `fn-0x70d0d0.json` | `function 0x70d0d0 --provider ghidra --snapshot gamemd-AP14.snapshot` | ev_461c68b6ffac8c1615475d016a3a935493ab6c30c70e01ad7c040dddcb2a3da3 | FUN_0070d0d0: ability flag lookup, byte [Type+0x29c+arg] / [Type+0x2ae+arg] gated by FUN_0074ff90 / FUN_00750010 on this+0x150; 16 callers |
| `fn-0x6f3270.json` | `function 0x6f3270 --provider ghidra --snapshot gamemd-AP14.snapshot` | none (error) | "No procedure exists at the requested address: 0x6f3270" |
| `instr-0x6f3270.json` | `instructions 0x6f3270 --provider ghidra --snapshot gamemd-AP14.snapshot` | none (error) | Same error from read_function_instructions |
| `xrefs-0x89ea40.json` | `xrefs 0x89ea40 --provider ghidra --snapshot gamemd-AP15.snapshot` | ev_d0af7dff62b0346b4e5b0761a43bee371cce6d0a7287f6b2aa340860e67cf4a5 | 13 references to DAT_0089ea40 (kinds not exposed): 0x47ca58, 0x4835de, 0x4b3ca3 (Drive read), 0x51895a, 0x51c750, 0x51c7bc, 0x6740b4 (loader store), 0x67f882, 0x67faf6, 0x6a32f2 (Ship read), 0x73fab5, 0x7400a1, 0x740c9c |
| `fn-0x6740b4.json` | `function 0x6740b4 --provider ghidra --snapshot gamemd-AP15.snapshot` | ev_cbd3ace28308a7569a525a44a684264d78d40366a83f246c6b790ca85ec92e25 | FUN_00674000 (0x674000-0x674237): loader of DAT_0089ea40, 12 x 36-byte rows from section table 0x839d68; float keys via FUN_005283d0 (default 1.0, capped at 1.0): 0x81dbd4/Track/Wheel/Hover/-/Float/Amphibious/FloatBeach, byte "Buildable" via FUN_005295f0 at row+0x20 |
| `search-Foot.json` | `search "Foot" --kind strings --mode literal --case-sensitive --provider ghidra --snapshot gamemd-AP15b.snapshot` | ev_b5dcaed203abd157d161a3644da58cc70803499d458a285210849064d6aed959 | Only RTTI names match (".?AVFootClass@@" 0x817b80 etc.); no defined plain "Foot" string |
| `bytes-0x839d68.json` | `read-bytes 0x839d68 --length 48 --provider ghidra` | ev_c7b013cd2e60ad4c7b183a9534f5eb674708c460938a6fe1f02d5ea5ae7d9362 | 12 pointers of the land section-name table: 0x81dc1c, 0x81dc14, 0x81bae8, 0x81dc0c, 0x81ac58, 0x817278, 0x81dc04, 0x81dbfc, 0x81dbf8, 0x81dbec, 0x81dbe4, 0x81dbdc |
| `bytes-0x81dbd4.json` | `read-bytes 0x81dbd4 --length 80 --provider ghidra` | ev_00fe57e42dc4e651c1492f46513f6dd0e006d36b031f9c897af27acfde1a711e | Strings "Foot" 0x81dbd4 (column-0 key of FUN_00674000), "Weeds" 0x81dbdc, "Tunnel" 0x81dbe4, "Railroad" 0x81dbec, "Ice" 0x81dbf8, "Rough" 0x81dbfc, "Beach" 0x81dc04, "Rock" 0x81dc0c, "Road" 0x81dc14, "Clear" 0x81dc1c |
| `bytes-0x81bae8.json` | `read-bytes 0x81bae8 --length 16 --provider ghidra` | ev_59e3db791a35505c546374799a40dc225fd37d95a85366a3dea29e8d2b7c6c74 | String "Water" at 0x81bae8 (land section-table entry 2) |
| `bytes-0x81ac58.json` | `read-bytes 0x81ac58 --length 16 --provider ghidra` | ev_b7c0235aadd8e93f6d8d8553151b1a13294f2f5cf9d987da1b1f7af9520cc593 | String "Wall" at 0x81ac58 (entry 4) |
| `bytes-0x817278.json` | `read-bytes 0x817278 --length 16 --provider ghidra` | ev_83bb0cdffd2dcefbbaab38f8330dff78dee30e770601ba59cc01af88f257e6ed | String "Tiberium" at 0x817278 (entry 5) |
| `xrefs-0x7e7a28.json` | `xrefs 0x7e7a28 --provider ghidra --snapshot gamemd-AP20.snapshot` | ev_19b22c8e16061c46cc337e67c9174096a1b6a6ca0ca69d82a5d47a09e6f23155 | Readers of the track table DAT_007e7a28: 0x4b0b35, 0x4b1546, 0x4b1ca7, 0x4b22e2 |
| `xrefs-0x7e7b28.json` | `xrefs 0x7e7b28 --provider ghidra --snapshot gamemd-AP20.snapshot` | ev_5d2ddddfbade2c80b1e801a25fa2a0eec19f2acb67099eb508659e53a0883d52 | Readers of the track selector table DAT_007e7b28: 0x4b0b22, 0x4b151f, 0x4b153a, 0x4b1b78, 0x4b1b83, 0x4b22d9, 0x4b4023, 0x4b4b2c, 0x4b4b3b, 0x4b4ba9, 0x4b4bb0 |
| `instr-0x4b1f5c.json` | `instructions 0x4b1f5c --provider ghidra --snapshot gamemd-AP20.snapshot` | ev_e24c89287b26153aaf977a13594beace34a14dfe8df9698a21438f62e7180dc8 | FUN_004b0f20, all 1655 instructions 0x4b0f20-0x4b2607 (instruction-level view of the track loop; identical text to the assembly in fn-0x4b1150.json) |
| `bytes-0x7e7a28.json` | REA MCP `read_bytes 0x7e7a28 128` (Ghidra) | ev_732a3cbc208c9531fbf11d2a266fe696b81d3601a3f2b3d6b4d03bbcf9deb5f4 | First 128 bytes of Drive track table DAT_007e7a28 (16-byte entries) |
| `bytes-0x7e7b28.json` | REA MCP `read_bytes 0x7e7b28 128` (Ghidra) | ev_24c499783dcfb87328bb0389e65e1cd864c524a9af0adfda3109d00884e86cf6 | First 128 bytes of Drive track selector table DAT_007e7b28 (12-byte entries) |
| `fn-0x4cda78.json` | `function 0x4cda78 --provider ghidra --snapshot gamemd-AP18.snapshot` | ev_e8f8f023f2e73e8631f1780d2aa8bcb480f345c8e83eedc8dccf0d03b00df44f | FUN_004cd600 (0x4cd600-0x4ce4a9): Fly locomotor per-frame routine; speed int via ILocomotion slot +0x84 of this+0x4, position step with F2I, +0x40/+0x48 ratio update |
| `fn-0x4ce4bf.json` | `function 0x4ce4bf --provider ghidra --snapshot gamemd-AP18.snapshot` | none (error) | "No procedure exists at the requested address: 0x4ce4bf" |
| `xrefs-0x4ce4b0.json` | `xrefs 0x4ce4b0 --provider ghidra --snapshot gamemd-AP18.snapshot` | ev_0d6c3caffb743e25f0d2bfd972d5277ed9b00c93a484908029786038f518c155 | No references to 0x4ce4b0 recorded by Ghidra (`[]`) |
| `fn-0x54d138.json` | `function 0x54d138 --provider ghidra --snapshot gamemd-AP25.snapshot` | ev_9a13d9d438894a55084bb4fcf8b8ee958ffc8644733699921a6cfece1ff98bde | FUN_0054d0f0 (0x54d0f0-0x54d6c5): Jumpjet locomotor per-frame speed update (+0x70 toward +0x78 by +0x30, cap +0x20), SetSpeedPercentage via +0x544, position step F2I(+0x70) along facing |
| `instr-0x7722f5.json` | `instructions 0x7722f5 --provider ghidra --snapshot gamemd-AP20.snapshot` | none (error) | "No procedure exists at the requested address: 0x7722f5" (operation read_function_instructions) |
| `fn-0x7729b0.json` | `function 0x7729b0 --provider ghidra --snapshot gamemd-AP20.snapshot` | none (error) | "No procedure exists at the requested address: 0x7729b0" (Phobos hook address WeaponTypeClass_LoadFromINI) |
| `xrefs-0x7e5264.json` | `xrefs 0x7e5264 --provider ghidra --snapshot gamemd-AP20.snapshot` | ev_93a4d1a59c9bfe8975491c150e4fe2541e7ed60d08abb00301e2df28a09bfef8 | No references to 0x7e5264 (empty list): the "Speed" pointer in the crate table is a data reference only |
| `instr-0x7722f5-single.json` | `inspect-native-instruction 0x7722f5 --provider ghidra` (command has no --snapshot flag) | ev_3c503f2196464753a9d8841dfda54c38650075f37b63b7e644b6afab6097a889 | 0x7722f5: `PUSH 0x81d9cc`, bytes 68ccd98100, procedure null, DATA reference to "Speed" |
| `fn-0x6a343f.json` | `function 0x6a343f --provider ghidra --snapshot gamemd-AP22.snapshot` | ev_37ea75fb7220468fda6c807378a9098f4df7eb30a1522f4d3f28470308cd5e6a | FUN_006a1c80 (0x6a1c80-0x6a3d95, Ship `Process` per Phobos hook): ground-table `FLD float ptr [EDX*4 + 0x89ea40]` at 0x6a32f2, 1.0 cap, up/downhill factors, `CALL 0x005f5c60` + `FCOMP [Rules+0x1700]`, `FMUL [0x7e7fc0]` (0.75) at 0x6a343f, `FSTP [EBP+0x50]` at 0x6a344f; byte-identical to Drive 0x4b3c84-0x4b3e27 |
| `*.stderr.log` (`bytes-0x817278`, `bytes-0x81ac58`, `bytes-0x81bae8`, `bytes-0x81dbd4`, `bytes-0x839d68`, `fn-0x4cda78`, `fn-0x4ce4bf`, `fn-0x54d138`, `fn-0x6740b4`, `fn-0x6a343f`, `fn-0x7729b0`, `instr-0x4b1f5c`, `instr-0x7722f5`, `instr-0x7722f5-single`, `search-Foot`, `xrefs-0x4ce4b0`, `xrefs-0x7e5264`, `xrefs-0x7e7a28`, `xrefs-0x7e7b28`, `xrefs-0x89ea40`) | stderr of the run with the same basename | n/a | Progress output only, or empty |
| `inspect-artifact.json` | `inspect-artifact` | ev_a30b2b64830956e5b76792041c8a121b426bdc920b6df2f17be4d0f343adddc0 | PE inventory |
| `inspect-pe-imports.json` | `inspect-pe-imports` | see file | 15 import DLLs, imphash md5 2b93d0cf33d4449cc0b6a0db0a52a102 |
| `inspect-pe-resources.json` | `inspect-pe-resources` | see file | Resource directory |
| `inspect-pe-certificates.json` | `inspect-pe-certificates` | see file | Authenticode PKCS#7 structure (not cryptographically checked by REA) |
| `inspect-byte-entropy.json` | `inspect-byte-entropy` | see file | File entropy 6.82; high-entropy runs only near resources/signature |
| `inspect-desktop-application.md` | `inspect-desktop-application <game folder>` | ev_742030dba4af483b9d78e18dcefc76f96fabf8aa912fb9cb7711834d0dab0ff8 | Inventory of the whole install folder |
| `bytes-0x81da58.json` | `read-bytes 0x81da58 --length 32` | ev_e12ce0fc5c446d33a303e5d28ab7417eed9666fe3fdce68a1b84033b95f89c15 | SpeedType name pointer table (8 pointers) |
| `bytes-0x81dba0.json` | `read-bytes 0x81dba0 --length 52` | ev_226c06127cd47f286111844fae2637a375d486616fb8f2e3bdae36122f811b69 | Strings FloatBeach, Float, Winged, Hover, Wheel, Track |
| `bytes-0x81bb18.json` | `read-bytes 0x81bb18 --length 16` | ev_072214efd15ad7c2055db848b8d7c299952a5d2227f90c39ff662afb50e8014a | String Amphibious |
| `bytes-0x7e8a78.json` | `read-bytes 0x7e8a78 --length 4` | ev_813a54a2233db5acedeb0da099101a5959725d9185531803201f3b3420a2108e | Fly ILocomotion vtable slot +0x84 = 0x4cfe20 |
| `inspect-instr-0x4ce4b0.json` | `inspect-native-instruction 0x4ce4b0` | ev_9c0988462b6bd9c2830368eb5113f294ceb494c1aa0f5fe9cbc8defb3ce6c42e | Undecodable, no references |
| `inspect-instr-0x6f3270.json` | `inspect-native-instruction 0x6f3270` | ev_2b1a0acdeb579bcb416dbb4f336fb474469b820fdf6c8da417ce088eee62dab9 | `MOV EAX,[ECX]`, no procedure, six data references |
| `fn-0x4cfe20.json` (local) | `function 0x4cfe20` | ev_b43b822b0b186b437373925f392321db5ad36e2bf12dcda4d65c106dea2b24e2 | Fly slot +0x84: F2I(Type+0x678 * p+0x44) |
| `fn-0x7caf30.json` (local) | `function 0x7caf30` | ev_703c6bb647f168a2fc35e1158d802d4d51a84dccaa6d3dddf633278eb7166495 | strchr |
| `fn-0x4b4780.json` (local) | `function 0x4b4780` | ev_1745e3d90518b7349baaf8109a6faab3475f950454deb0d49a6bf65283ee6b12 | Drive track point transform |
| `searchbytes-d92d.json` | `search-bytes d92d` | ev_962e8f852e902ecd56bc2aa63bdcdf07a767c4c11ba225e1d15b740007995624 | 8 byte matches of FLDCW [abs32] |
| `inspect-instr-0x4495f3.json` etc. | `inspect-native-instruction` x4 | ev_bc854e94... / ev_c9eb9f78... / ev_b9c8929a... / ev_99e0fbad... | All four `.text` matches are not instruction starts |
| `searchbytes-fldcw-all.json` | `search-bytes d928 --mask ff38` | ev_2902956242d7a1fba95ffd30a546d8bcba35a5d967e7b5b62d44f8605fd510a5 | First page of masked FLDCW byte matches; not conclusive |
| `gamemd.snapshot` | `--snapshot` of the 2026-10-26 runs | n/a | REA analysis snapshot; the packages of 2026-10-27 only copied it and never wrote it |
| `gamemd-AP11.snapshot` | copy of `gamemd.snapshot` used for the AP-11 runs | n/a | private snapshot (parallel-agent isolation) |
| `gamemd-AP12.snapshot` | copy of `gamemd.snapshot` used by the AP-12 and AP-26 runs | n/a | REA snapshot (AP-12/AP-26) |
| `gamemd-AP13.snapshot` | `--snapshot` copy used by the AP-13 runs | n/a | Private snapshot copy of `gamemd.snapshot` |
| `gamemd-AP14.snapshot` | `--snapshot` copy used by the AP-14 and AP-27 runs | n/a | Private snapshot copy of `gamemd.snapshot` |
| `gamemd-AP15.snapshot`, `gamemd-AP15b.snapshot` | private snapshot copies for AP-15 (`xrefs` / `function`, and the parallel `search` run) | n/a | copies of `gamemd.snapshot` |
| `gamemd-AP16.snapshot` | `--snapshot` copy used by AP-16 | n/a | private copy of `gamemd.snapshot` for the three AP-16 runs |
| `gamemd-AP17.snapshot` | `--snapshot` copy used by the AP-17 runs | n/a | Private snapshot copy of `gamemd.snapshot` |
| `gamemd-AP18.snapshot` | copy of `gamemd.snapshot` used by the AP-18 runs (and copied to `gamemd-AP25.snapshot`) | n/a | REA snapshot (AP-18) |
| `gamemd-AP20.snapshot` | snapshot copy used by the AP-20 and AP-21 runs | n/a | Private copy of `gamemd.snapshot` |
| `gamemd-AP22.snapshot` | private snapshot copy for AP-22 | n/a | copy of `gamemd.snapshot`, used by one run |
| `gamemd-AP24.snapshot` | copy of `gamemd.snapshot` used for the AP-24 runs | n/a | private snapshot (parallel-agent isolation) |
| `gamemd-AP25.snapshot` | copy of `gamemd-AP18.snapshot` used by the AP-25 run | n/a | REA snapshot (AP-25) |
| `gamemd-AP28.snapshot`, `gamemd-AP28b.snapshot` | private snapshot copies for the AP-28 `function` runs | n/a | copies of `gamemd.snapshot` |
| `gamemd-2.snapshot` .. `gamemd-6.snapshot` | not named by any package result file | n/a | Present in the folder; origin not recorded |

### Deviations from the package scripts (`docs/arbeitspakete/T-022-AP-research.md`)

- AP-12 used an 8-step `inspect-native-instruction` chain (runs 6-13, over the 3-run cap) plus `address-to-file-offset` and `decompile --file-offset`, because Ghidra has no procedure at 0x70EFE0 and `function` / `instructions` / `decompile` all errored; the chain follows the decoded instruction lengths and ends at the second `RET`.
- AP-14 replaced its step 2 (`instructions 0x7C5F00`) by `xrefs 0x822d80`; the control-word value came from a later REA MCP `read_bytes` (AP-14-addendum, `bytes-0x822d80.json`).
- AP-15 used 4 extra `read-bytes` runs (runs 6-9: `bytes-0x81dbd4`, `bytes-0x81bae8`, `bytes-0x81ac58`, `bytes-0x817278`) for strings that are undefined data in Ghidra (the `search "Foot"` run returned only RTTI names), and a second snapshot copy `gamemd-AP15b.snapshot` so the `search` run could run in parallel with a read.
- AP-16 spent its optional step 3 on `function 0x47b3a0` instead of `instructions 0x4b3df0`; AP-24 spent its second run on `function 0x48dff0` instead of a `search`.
- AP-17 did not run `xrefs` / `instructions` on a `DAT_` operand (there is none: the prone multiplier is immediate integer arithmetic) and used its second run for `xrefs 0x521d80`.
- AP-18 skipped the `instructions` fallback for 0x4ce4bf (same "No procedure exists" error as `function`, as AP-12 had shown) and used the third run for `xrefs 0x4ce4b0` (empty).
- AP-21 used a 4th run (`inspect-native-instruction 0x7722f5`, no `--snapshot` flag: the command rejects it) after `instructions 0x7722f5` and `function 0x7729b0` both errored.
- AP-22 used its own snapshot copy `gamemd-AP22.snapshot` (the package text named `gamemd-AP15.snapshot` for both AP-15 and AP-22, which ran in parallel).
- Every package worked on a private copy `gamemd-AP*.snapshot` of `gamemd.snapshot`; `gamemd.snapshot` itself was never written by the packages.
- Two agents deleted empty `*.stderr` / `*.stderr.log` side files (AP-13 for `xrefs-0x4db1a0.json.stderr`, AP-17 for `fn-0x521d80.json.stderr` / `xrefs-0x521d80.json.stderr`; the AP-11 and AP-24 `fn-*.stderr.log` files and the AP-16 ones are also absent), so only the stderr files listed above exist.

Not REA evidence (recorded in the spec as UNVERIFIED): the weapon-key sequence (Damage / ROF / Speed) and the store offset around 0x7722f5 (only the single instruction at 0x7722f5 is REA-decoded), the PE header/sections, and the Authenticode signer (PowerShell `Get-AuthenticodeSignature`). The earlier manual byte reads (strings at 0x81d9c0..0x81d9dc and 0x825338..0x82535c, the crate-name pointer table at 0x7e5248..0x7e5284, the vtable slots, the RulesClass stores) have all been superseded by REA output listed above.

## notes-example — Electron notes app (rea.tools example)

Target: `example\notes-example` (from https://rea.tools/examples/notes-example.zip, sha256 9330AFF1...6EE5B)

| File | REA command | evidence_id | What it shows |
|---|---|---|---|
| `notes-evidence.json` | `analyze-javascript-application --detail summary` | parent ev_183910ec9a0a5f187c385532c1e64a288973ed80a04101822a94de525944eb70 | Application graph bundle |
| `analyze.out` | same, stdout | view ev_e130dca070a391781d63deed2e8e496e37b436faf7b750b0e5d5d51c32bbc79a | Summary view |
| `trace.out` | `trace-application-feature` seed "Export notes" | see file | No match (label lives only in HTML) |
| `trace2.out` | `trace-application-feature` seed "notes:export" | ev_267add10d26aa33e08c350e970c7d7982bf644eeadd5ade0c72bed5752c41b97 | Renderer → preload → IPC → main chain |
| `skilltest-evidence.json`, `skilltest-trace-1.json` | same, via the `rea-trace-feature` skill helper | same ids | Skill test run |
