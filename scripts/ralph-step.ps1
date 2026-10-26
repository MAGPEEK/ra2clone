<#
Supervised autonomous loop for the RA2 clone.
Each iteration: pick the first open task -> run ONE fresh agent session (Copilot CLI + Ollama) ->
show diff/tests -> WAIT for your decision -> commit + advance status, retry, or quit.

Status flow in docs/TASKS.md:  TODO -> (research) -> SPEC-REVIEW -> (implement) -> TESTING -> (review) -> DONE
Run from the repo root:  .\scripts\ralph-step.ps1 -MaxIterations 3
#>
param(
  [int]$MaxIterations = 3,
  [string]$Model = "qwen_p",
  [string]$OllamaUrl = "http://localhost:11434",   # try http://localhost:11434/v1 if the CLI reports an endpoint error
  [string]$TasksFile = "docs/TASKS.md"
)

$ErrorActionPreference = "Stop"
$env:COPILOT_PROVIDER_BASE_URL = $OllamaUrl
$env:COPILOT_MODEL = $Model
# $env:COPILOT_OFFLINE = "true"   # optional: no contact with GitHub servers (see Copilot CLI BYOK docs)

# Fill in after checking `copilot --help` (tool permission flags differ by version). Keep this as narrow as you can.
$CopilotExtraArgs = @()

New-Item -ItemType Directory -Force -Path ".agent/history" | Out-Null
if (-not (Test-Path "docs/PROGRESS.md")) { "# Progress log`n" | Set-Content "docs/PROGRESS.md" }

function Get-NextTask {
  $m = Select-String -Path $TasksFile -Pattern '^- \[ \] (T-\d+) (TODO|SPEC-REVIEW|TESTING)\b' | Select-Object -First 1
  if (-not $m) { return $null }
  [pscustomobject]@{ Id = $m.Matches[0].Groups[1].Value; Status = $m.Matches[0].Groups[2].Value; Line = $m.Line }
}

function Set-Status($id, $old, $new) {
  $c = Get-Content $TasksFile -Raw
  $c = $c -replace "(?m)^- \[ \] $id $old\b", "- [ ] $id $new"
  Set-Content $TasksFile $c -NoNewline
}

function Get-Prompt($id, $step) {
@"
You are running ONE step of a supervised loop. Follow .github/copilot-instructions.md and docs/references.md.
Active task: $id. Step: $step.
Read docs/TASKS.md and docs/specs/$id*.md first. Work on this task only.

"@ + $(switch ($step) {
 "research" { @"
Use only the REA tools. If no binary is open: binary_session, then open_binary with provider ghidra on the target in the instructions.
Gather evidence. Quote raw tool output for each key finding BEFORE interpreting it.
Write or update docs/specs/$id-<short-name>.md from docs/specs/TEMPLATE.md. Mark inferences UNVERIFIED.
Do not write source code. Call close_binary at the end.
Append a 5-line summary (what was found, open questions, files changed) to docs/PROGRESS.md. Then stop.
"@ }
 "implement" { @"
Do not use REA tools. Implement only what docs/specs/$id*.md describes, in src/. Write xUnit tests in tests/ using the spec's test values.
Run 'dotnet test' and report the result. If the spec is unclear, stop and write the question to docs/PROGRESS.md.
Append a 5-line summary to docs/PROGRESS.md. Then stop.
"@ }
 "review" { @"
Do not change any file except docs/PROGRESS.md. Check each claim in docs/specs/$id*.md against its address and evidence_id,
list unsupported claims and any difference between spec and code. Append the findings to docs/PROGRESS.md. Then stop.
"@ }
})
}

for ($i = 1; $i -le $MaxIterations; $i++) {
  $task = Get-NextTask
  if (-not $task) { Write-Host "No open tasks left."; break }
  $step = switch ($task.Status) { "TODO" { "research" } "SPEC-REVIEW" { "implement" } "TESTING" { "review" } }
  $next = switch ($task.Status) { "TODO" { "SPEC-REVIEW" } "SPEC-REVIEW" { "TESTING" } "TESTING" { "DONE" } }

  Write-Host "`n=== Iteration $i/$MaxIterations: $($task.Id) [$($task.Status)] -> step '$step' ===" -ForegroundColor Cyan
  $branch = "task/$($task.Id)"
  if (-not (git branch --list $branch)) { git switch -c $branch | Out-Null } else { git switch $branch | Out-Null }

  $log = ".agent/history/$($task.Id)-$step-$(Get-Date -Format yyyyMMdd-HHmmss).log"
  $prompt = Get-Prompt $task.Id $step
  & copilot -p $prompt @CopilotExtraArgs 2>&1 | Tee-Object -FilePath $log

  Write-Host "`n--- Changes ---" -ForegroundColor Yellow
  git status --short
  git diff --stat
  if ($step -eq "implement") { Write-Host "`n--- dotnet test ---"; dotnet test --nologo 2>&1 | Select-Object -Last 15 }
  Write-Host "`nLog: $log   Progress: docs/PROGRESS.md"

  $choice = Read-Host "[a]pprove & commit, [r]etry this step, [q]uit"
  switch ($choice.ToLower()) {
    "a" {
      if ($next -eq "DONE") { (Get-Content $TasksFile -Raw) -replace "(?m)^- \[ \] $($task.Id) TESTING\b", "- [x] $($task.Id) DONE" | Set-Content $TasksFile -NoNewline }
      else { Set-Status $task.Id $task.Status $next }
      git add -A; git commit -m "$($task.Id): $step approved" | Out-Null
      Write-Host "Committed. $($task.Id) -> $next" -ForegroundColor Green
    }
    "r" { Write-Host "Retrying (discarding uncommitted changes)."; git restore . ; git clean -fd -e .agent -e refs | Out-Null; $i-- }
    default { Write-Host "Stopped by user."; break }
  }
}
