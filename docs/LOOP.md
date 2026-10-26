# Supervised loop - how to run

1. Pick the model: `ollama ps` shows `qwen_p` loaded with enough `num_ctx` (Copilot CLI recommends a large context window).
2. Register REA as an MCP server in Copilot CLI (same command/env as for Visual Studio). Check with `copilot` -> `/mcp`.
3. From the repo root: `.\scripts\ralph-step.ps1 -MaxIterations 3`.
4. After every iteration the script stops and shows the diff, test results and log. You choose:
   - a = approve (commits on branch `task/T-xxx`, advances the status in docs/TASKS.md)
   - r = retry the step (discards uncommitted changes)
   - q = quit
5. Between steps, review `docs/specs/T-xxx-*.md` yourself in Ghidra before approving the research step.

Status flow: TODO -> SPEC-REVIEW -> TESTING -> DONE. The agent never changes statuses; only the script does after your approval.
Rules of thumb: small tasks, hard iteration cap, never approve a spec you have not spot-checked in Ghidra.
