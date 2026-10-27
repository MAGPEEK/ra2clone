# Package results (T-022)

One file per research package (`AP-NN.md`), written by the agent that ran the package.
Each file holds: the REA commands run, the raw-output files and their evidence_ids, quoted
assembly/pseudocode excerpts, the derived facts, and the exact spec/README edits proposed.
The spec (`docs/specs/T-022-movement-speed.md`) and `evidence/README.md` are updated from
these files in a separate merge step, never by the package agents themselves.

AP-28 (`AP-28.md`) was added after the AP-11..AP-27 merge. It is not in `T-022-AP-research.md`; it works
through the spec's open questions (SpeedType names, Fly slot +0x84, FUN_004b4780, FUN_007caf30, 0x6f3270,
FLDCW sites), and its edits are already applied to the spec and `evidence/README.md`.
