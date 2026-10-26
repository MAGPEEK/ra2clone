---
name: next-task
description: Run one supervised research/implement step for the active task
disable-model-invocation: true
---
Active task: ${input:task:T-xxx}
Step: ${input:step:research | implement | review}

Follow `.github/copilot-instructions.md` and the references in `docs/references.md`.

If step = research:
1. Read `docs/TASKS.md` and any existing `docs/specs/${input:task}.md`.
2. For Phase 1 and 2 tasks, use refs/ra2ff, ModEnc and other documentation. Do not use REA. REA is only for Phase 3 tasks.
3. Gather evidence for the task. Show the raw tool results for every key finding before you interpret them.
4. Write or update `docs/specs/${input:task}.md` using `docs/specs/TEMPLATE.md`.
5. List open questions and everything marked UNVERIFIED. Do not write any source code in this step.
6. Call `close_binary`, then stop and wait for my review.

If step = implement:
1. Read `docs/specs/${input:task}.md`. Do not use REA tools in this step.
2. Implement only what the spec describes, in `src/`.
3. Write xUnit tests in `tests/` using the spec's test values.
4. Run the tests and report the results. If a spec item is unclear, stop and ask.

If step = review:
1. Re-check each claim in the spec against its evidence_id and address.
2. List any claim without evidence, any contradiction, and any difference between spec and code.
3. Do not change files; report only.
