# Evidence cross-check: T-022-movement-speed.md vs ra2-gamemd/*.json

Generated 2026-10-27 by `evidence/tools/crosscheck.mjs`.

## Counts

- JSON files: 94 (successful: 84, failed: 10)
- Distinct evidence_ids in files: 84
- Distinct evidence_ids cited in spec (full 64-hex form): 79
- Cited but not found in any file: 0
- Present in files but not cited in spec: 5

## Cited in spec but not found in files

None.

## Present in files but not cited in spec

- ev_a30b2b64830956e5b76792041c8a121b426bdc920b6df2f17be4d0f343adddc0 — `inspect-artifact.json`
- ev_c7ea0c0c105e964044ac73cbc05d3c49f7963cc60d76c2290d22dd7ac0f68798 — `inspect-byte-entropy.json`
- ev_c324f0d2e98a9ced2ecb9c6acb1fae18aa0dfd464f456e6d82733dcb02673a9e — `inspect-pe-certificates.json`
- ev_e068037a9babe39e5d818b78317f43df59a50b6b8f771420a7358acf22f52c4f — `inspect-pe-imports.json`
- ev_1fc663217f60150e7de3d36ac27bac6573e5a47a32f1038f136a183c5406f230 — `inspect-pe-resources.json`

## Truncated ids in spec prose (ev_xxxxxxxx...) that match no known id

None.

## Same evidence_id in more than one file

None.

## Failed runs (no evidence_id)

- `decompile-0x70efe0.json` — invalid_request: File offset 0x30efe0 maps to analysis address 0x70efe0, but no procedure starts at or contains that address in the current Ghidra analysis. Choose an observed procedure with CLI rea search <path> . --kind procedures --mode regex --provider ghidra --json or MCP list_procedures.
- `fn-0x4ce4bf.json` — invalid_request: No procedure exists at the requested address: 0x4ce4bf
- `fn-0x6f3270.json` — invalid_request: No procedure exists at the requested address: 0x6f3270
- `fn-0x70efe0.json` — invalid_request: No procedure exists at the requested address: 0x70efe0
- `fn-0x7722f5.json` — invalid_request: No procedure exists at the requested address: 0x7722f5
- `fn-0x7729b0.json` — invalid_request: No procedure exists at the requested address: 0x7729b0
- `fn-0x7e5264.json` — invalid_request: No procedure exists at the requested address: 0x7e5264
- `instr-0x6f3270.json` — invalid_request: No procedure exists at the requested address: 0x6f3270
- `instr-0x70efe0.json` — invalid_request: No procedure exists at the requested address: 0x70efe0
- `instr-0x7722f5.json` — invalid_request: No procedure exists at the requested address: 0x7722f5

## Cited ids and where they live

| evidence_id | spec lines | file(s) |
|---|---|---|
| ev_a607860c134d8d4c41b8a119d8809d1a7564cde8fae4596e621996c2d0f4e442 | 26, 28, 29 | `fn-0x71464c.json` |
| ev_245d8c967e3b8fc714eacb1eaa28021d453a3c0124fb0510d6e7f5d8bb344d2b | 27, 33 | `xrefs-speed.json` |
| ev_f6c772b6768acbe88672deb0541cf136c179e979777068c218f64a00d13e9f35 | 29, 777 | `fn-0x476fc0.json` |
| ev_bcb316147b322b39b3d9449cd8fa52d559a1b1fc701fbbe02b776e12319cecab | 30, 697, 777 | `fn-0x48dff0.json` |
| ev_e12ce0fc5c446d33a303e5d28ab7417eed9666fe3fdce68a1b84033b95f89c15 | 30 | `bytes-0x81da58.json` |
| ev_226c06127cd47f286111844fae2637a375d486616fb8f2e3bdae36122f811b69 | 30 | `bytes-0x81dba0.json` |
| ev_072214efd15ad7c2055db848b8d7c299952a5d2227f90c39ff662afb50e8014a | 30 | `bytes-0x81bb18.json` |
| ev_00fe57e42dc4e651c1492f46513f6dd0e006d36b031f9c897af27acfde1a711e | 30, 62, 707, 779 | `bytes-0x81dbd4.json` |
| ev_ebf0a4ba301b8e9abe80b65862f7b58993b28234894d26c0dcd97e0ae9248b69 | 31 | `fn-0x67441f.json` |
| ev_3c503f2196464753a9d8841dfda54c38650075f37b63b7e644b6afab6097a889 | 32, 782 | `instr-0x7722f5-single.json` |
| ev_93a4d1a59c9bfe8975491c150e4fe2541e7ed60d08abb00301e2df28a09bfef8 | 33, 782 | `xrefs-0x7e5264.json` |
| ev_02e1f5ea5319b997847c27f9395bda029b3def3571bbef46463717b06a55f010 | 34 | `xrefs-0x82534c.json` |
| ev_2b6cb9491d9735b1402f085c0c74d053d4b87e16984bed71bcd3a9de583141c4 | 34 | `xrefs-0x82535c.json` |
| ev_55fcfe2b8c9765208a804c57caac475d90ce9183f6c7837ec87606e161be7017 | 34 | `xrefs-0x825338.json` |
| ev_27162a68542bf6ac5d71db554490899d36f6fcaab1dc2d9b2b52926bed1ab2d5 | 35 | `fn-0x511c2c.json` |
| ev_f7a0385389155dc4130105a5cc2225b56ebb514b45c1929c7b6ff0ba57844612 | 36 | `fn-0x50c079.json` |
| ev_d12530ffa6271545062969ddf26320632fb24563966c3e208dfe11913ef56a57 | 37 | `fn-0x4db1b6.json` |
| ev_82818cd00999a883d38000b429421800ebf5841f70e8c52d6ff3bdebf2110f55 | 38 | `fn-0x4b1150.json` |
| ev_7bf7fc12fab5194682ce5da0ace375cfbc379b515ff0d6110294e021b61c3210 | 38, 780 | `fn-0x4b1f64.json` |
| ev_e24c89287b26153aaf977a13594beace34a14dfe8df9698a21438f62e7180dc8 | 38, 780 | `instr-0x4b1f5c.json` |
| ev_19b22c8e16061c46cc337e67c9174096a1b6a6ca0ca69d82a5d47a09e6f23155 | 39 | `xrefs-0x7e7a28.json` |
| ev_732a3cbc208c9531fbf11d2a266fe696b81d3601a3f2b3d6b4d03bbcf9deb5f4 | 39, 780 | `bytes-0x7e7a28.json` |
| ev_5d2ddddfbade2c80b1e801a25fa2a0eec19f2acb67099eb508659e53a0883d52 | 40 | `xrefs-0x7e7b28.json` |
| ev_24c499783dcfb87328bb0389e65e1cd864c524a9af0adfda3109d00884e86cf6 | 40, 780 | `bytes-0x7e7b28.json` |
| ev_4af5eae01ca7599958a94c6e69b809f91a6fda88d03480bc0e179b63faf0f084 | 41 | `fn-0x662933.json` |
| ev_8217e49c6122fd541036e0c3705828fa1ee0b63cc3243bb349465c91f0446007 | 42 | `fn-0x6a077f.json` |
| ev_78c91595642b41ed94693cf94a2d5eb12841be7ea93939326dfc1e6899aef988 | 43 | `fn-0x4891ce.json` |
| ev_6deeab1046b5c4ed4af5a40a06e06746486423f035a6067e92b7c223287206e4 | 44, 772 | `instr-0x70efec-single.json` |
| ev_b41714b131b2b7bc4d17252ede4a3eaad3bd8d7c4090366d8bad45ff15958392 | 44, 53 | `instr-0x70efe0-single.json` |
| ev_d3f7d56d571a2ec5aeab0fca38da29462e1f1d1dde2a82e0dd4eba07c607e269 | 44 | `instr-0x70efe2-single.json` |
| ev_8c39641075f39f71c8e07e73b649168ce728a44055e7ec1f99ac5036664a2128 | 44, 53, 774 | `xrefs-0x70efe0.json` |
| ev_5c8e3083fb884e5774e3a590a4bd3d30a0345bedada0417682f54c337bee1e49 | 44 | `fileoffset-0x70efe0.json` |
| ev_1e8a9f4dca747da9847d26b9ef987b45ef41c2d5483c1af3af729a126309d0ce | 44 | `instr-0x70efe8-single.json` |
| ev_dffad71b29e7e054081c4bb5635b10d7a590114836f03e149d7d51fe62f3d74c | 44 | `instr-0x70efea-single.json` |
| ev_40f300a4a8746855b0c72e0e910353475441fc72d64020e36569af254da53a8a | 44 | `instr-0x70eff2-single.json` |
| ev_4690f8379b6af4d828ccb32b42245d28839c6b4efc2956e5440b11f2395b4d60 | 44 | `instr-0x70eff3-single.json` |
| ev_c54dbca84087ac3c4026e534f288d5eaf1c9ac4225903dc0676881ab4bf2a1b4 | 44 | `instr-0x70eff5-single.json` |
| ev_2772022c93b2c19e906fded4d1be05172c67979986372008e57cc64adc1bec48 | 45, 46, 695, 773 | `fn-0x66eefc.json` |
| ev_22a314265c52606bc186043543877d91fa3da11f9e4a9306f311f9f1b77874c0 | 45, 773 | `fn-0x66b37f.json` |
| ev_2ad203770828541ce9e60a327a1e7acd8c84b5a61b82793804e30628f44ecbc7 | 47, 52, 775 | `fn-0x4b3df0.json` |
| ev_62e78e5252e6cddff837a5ae8d740d55c392b5be225d2a21baefb7ab14d81c6d | 48, 705, 775 | `fn-0x5f5c60.json` |
| ev_37ea75fb7220468fda6c807378a9098f4df7eb30a1522f4d3f28470308cd5e6a | 49, 706, 782 | `fn-0x6a343f.json` |
| ev_0c254678c6b2ea9eeb70e5c1d86dfd9b2cb36c82b2d43103327253ba9e78c7dd | 50, 705 | `fn-0x578080.json` |
| ev_4932a5d2340faec97e79b524555e20a5bb031e789f704e820d8eca7a249cda9c | 51, 705 | `fn-0x47b3a0.json` |
| ev_3038fc4f05894b1ba94de99388c563e37ef8f68671523dcc96b04f19990132d9 | 53, 774 | `xrefs-0x4db1a0.json` |
| ev_e03b859e594994112786502db398a9ed788bc79c039b556a4da8157ad8d55569 | 53, 774 | `xrefs-0x6f3270.json` |
| ev_3e3a547987cdedecf729c694bc429dfa471c7067f3cef8d44dc21fc8cc75961a | 53, 55, 774 | `xrefs-0x521d80.json` |
| ev_30d736aaee2eba3faeb44096c1cc2728ecc2475515de7930881f57f23dc15b08 | 54, 771 | `fn-0x7c5f00.json` |
| ev_e087554034d37c2b4b06c8aa074fe3bbb27f04f75535502c0ae42b3934254efa | 54, 56, 771 | `bytes-0x822d80.json` |
| ev_e0a2a5c34a50488eefa642410c9683e17c676f9d6e7c2cf82666569712ecf0c3 | 55, 776 | `fn-0x521d80.json` |
| ev_2743ff13d939b5e5429434b1f5041eeaeecd1cb7f4e4d93370179ff37e361646 | 56 | `xrefs-0x822d80.json` |
| ev_a3d4e51d5824a6c9b75bb8bd6f6ebfd9337123d370b6170c94bb2ae3025870df | 57, 778 | `fn-0x5276d0.json` |
| ev_be4c09eb3b81519c903074d226e9905149b5d2c56adb567e44e9fb890a41e352 | 58, 778 | `fn-0x5283d0.json` |
| ev_f2681433dc390d881a5435965c396d6184b7d2871ac96339566225ce72597ee6 | 59, 778 | `fn-0x526810.json` |
| ev_461c68b6ffac8c1615475d016a3a935493ab6c30c70e01ad7c040dddcb2a3da3 | 60, 778 | `fn-0x70d0d0.json` |
| ev_2b1a0acdeb579bcb416dbb4f336fb474469b820fdf6c8da417ce088eee62dab9 | 61 | `inspect-instr-0x6f3270.json` |
| ev_d0af7dff62b0346b4e5b0761a43bee371cce6d0a7287f6b2aa340860e67cf4a5 | 62 | `xrefs-0x89ea40.json` |
| ev_cbd3ace28308a7569a525a44a684264d78d40366a83f246c6b790ca85ec92e25 | 62, 690, 707, 779 | `fn-0x6740b4.json` |
| ev_b5dcaed203abd157d161a3644da58cc70803499d458a285210849064d6aed959 | 62 | `search-Foot.json` |
| ev_c7b013cd2e60ad4c7b183a9534f5eb674708c460938a6fe1f02d5ea5ae7d9362 | 62, 707, 779 | `bytes-0x839d68.json` |
| ev_59e3db791a35505c546374799a40dc225fd37d95a85366a3dea29e8d2b7c6c74 | 62, 707 | `bytes-0x81bae8.json` |
| ev_b7c0235aadd8e93f6d8d8553151b1a13294f2f5cf9d987da1b1f7af9520cc593 | 62, 707 | `bytes-0x81ac58.json` |
| ev_83bb0cdffd2dcefbbaab38f8330dff78dee30e770601ba59cc01af88f257e6ed | 62, 707 | `bytes-0x817278.json` |
| ev_e8f8f023f2e73e8631f1780d2aa8bcb480f345c8e83eedc8dccf0d03b00df44f | 63, 713, 781 | `fn-0x4cda78.json` |
| ev_813a54a2233db5acedeb0da099101a5959725d9185531803201f3b3420a2108e | 64 | `bytes-0x7e8a78.json` |
| ev_b43b822b0b186b437373925f392321db5ad36e2bf12dcda4d65c106dea2b24e2 | 64 | `fn-0x4cfe20.json` |
| ev_9c0988462b6bd9c2830368eb5113f294ceb494c1aa0f5fe9cbc8defb3ce6c42e | 64 | `inspect-instr-0x4ce4b0.json` |
| ev_0d6c3caffb743e25f0d2bfd972d5277ed9b00c93a484908029786038f518c155 | 64 | `xrefs-0x4ce4b0.json` |
| ev_9a13d9d438894a55084bb4fcf8b8ee958ffc8644733699921a6cfece1ff98bde | 65, 714, 781 | `fn-0x54d138.json` |
| ev_8f9129a4c6e9d8d3d0c1abf885d56bf805db70a869bf26828614360e6c65e159 | 67 | `fn-0x6fdb80.json` |
| ev_a91f9ada2905c3d95e95496e730ddb22a8d27650df51b21041b1cc496cce5830 | 67 | `fn-0x5f540f.json` |
| ev_703c6bb647f168a2fc35e1158d802d4d51a84dccaa6d3dddf633278eb7166495 | 638 | `fn-0x7caf30.json` |
| ev_1745e3d90518b7349baaf8109a6faab3475f950454deb0d49a6bf65283ee6b12 | 683 | `fn-0x4b4780.json` |
| ev_962e8f852e902ecd56bc2aa63bdcdf07a767c4c11ba225e1d15b740007995624 | 757 | `searchbytes-d92d.json` |
| ev_bc854e94c85ad9e6cae8d14f7c2ccbcf5ffa2a8a02293444c4ce15ff4dc45027 | 757 | `inspect-instr-0x4495f3.json` |
| ev_c9eb9f783687ab57270493f34722c27302c2c31602d3b715c340ebce65f55ffb | 757 | `inspect-instr-0x4eb1eb.json` |
| ev_b9c8929a0c7b94c3711876f617be1590422a89d7a215786ce53f0f5bc7ebf66f | 757 | `inspect-instr-0x530c13.json` |
| ev_99e0fbadcd5bc06b1f2859a25ff45f15418dd371a353dfb5ca471a34b92e71d7 | 757 | `inspect-instr-0x7b603a.json` |
| ev_2902956242d7a1fba95ffd30a546d8bcba35a5d967e7b5b62d44f8605fd510a5 | 757 | `searchbytes-fldcw-all.json` |
