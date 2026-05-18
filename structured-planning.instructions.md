---
description: "Enforces structured planning workflow: Plan -> Phase -> SubPhase -> Step -> SubStep -> Verify."
applyTo: "**"
---

# Structured Planning Workflow

**Before executing any non-trivial task**, create a structured plan. This is mandatory for multi-file changes, new features, refactors, migrations, or anything with more than ~3 steps.

## When to Plan

**ALWAYS plan** when:

- Task touches 3+ files or 2+ services
- Task involves a new feature, component, or integration
- Task has unclear scope or multiple possible approaches
- Task requires DB changes, API changes, or config changes
- User explicitly asks for a plan

**Skip planning** when:

- Single-file bug fix with obvious cause
- Answering a question or reading code
- Running a single command (build, test, start server)
- Renaming / reformatting with no logic change

## Plan Structure

### Level 1: Phases (the "what")

Break the full task into **2–5 phases**. Each phase is a logically complete milestone that can be verified independently.

```text
Phase 1: [Research & Design]     — understand the problem, read code, map dependencies
Phase 2: [Build Core Logic]      — create the main module / function / component
Phase 3: [Wire & Integrate]      — connect to existing code, add imports, update configs
Phase 4: [Verify & Test]         — build check, runtime test, edge cases
Phase 5: [Docs & Knowledge]      — update docs, SKILL.md, instructions if needed
```

### Level 2: SubPhases (the "grouping")

Each phase must be split into **1-4 SubPhases** so execution stays clear and not overwhelming.

```text
Phase 2: Build Core Logic
  SubPhase 2.A: Interface / Contract Layer
  SubPhase 2.B: Core Logic Layer
  SubPhase 2.C: Integration Wiring
```

### Level 3: Steps (the "how")

Each SubPhase breaks into **numbered steps**. Each step is a single action (one file edit, one command, one search).

```text
SubPhase 2.B: Core Logic Layer
  Step 2.1: Create mapping / data module
  Step 2.2: Create core function or class
  Step 2.3: Wire into entry point or caller
```

### Level 4: SubSteps (required for non-trivial steps)

If a single step is still complex (e.g. touching 5+ functions in one file), break it further:

```text
Step 2.2: Create service function
  SubStep 2.2a: Define input/output types
  SubStep 2.2b: Implement core logic
  SubStep 2.2c: Add error handling
```

### Level 5: Bullet Actions (micro-actions)

Each SubStep should include bullet actions whenever there are multiple edits/commands.

```text
SubStep 2.2b: Implement core logic
  - Add parser utility
  - Add guard clause for null payload
  - Add unit test fixture
```

**Always break down to atomic level.** Keep decomposing until every bullet is a single command, a single file edit, or a single tool call — nothing more. If a bullet still requires thinking about multiple things, break it further. Do not stop early because something "seems obvious."

## Plan Quality Requirements

Every plan must meet all of the following before execution begins:

1. **Atomic** — every leaf-level item (bullet action) is a single, unambiguous action. No step requires sub-decisions. Keep decomposing until nothing can be split further.
2. **Newbie-readable** — write as if a junior AI engineer with no project context will execute it. Spell out file paths, function names, exact commands. Never assume prior knowledge of the codebase.
3. **Complete and nothing missing** — the plan must cover every file touched, every config changed, every doc updated, every skill/agent loaded or created. A reader following only the plan should never need to guess what to do next.
4. **Includes skill/agent steps** — if the task needs a skill or agent, include explicit steps: "Load skill `X`", "Invoke `Y` agent", "Create skill `Z`". These are first-class plan steps, not afterthoughts.
5. **Can use agents to plan** — for large or ambiguous tasks, include a step to invoke a planning agent (e.g. `Feature Dev`, `AI Engineer`) to help scope the work before implementation begins.

## Verification Strategy

### Mandatory Simulation Gate

Before executing any approved non-trivial plan, simulate the full plan from the beginning to the end.

#### Simulation Rules

1. Simulate the exact execution order of all phases, subphases, steps, and substeps.
2. Look specifically for:

   - missing prerequisites
   - incorrect ordering
   - hidden environment dependencies
   - validation gaps
   - likely runtime blockers
   - places where the written plan would cause avoidable bugs

3. If simulation finds any bug, blocker, ambiguity, or bad ordering, fix the written plan first.
4. After fixing the written plan, simulate the entire plan again from the beginning.
5. Do not execute the real implementation until the latest simulation pass is clean.

#### Simulation Output Requirement

When a simulation reveals a flaw, update the plan file immediately under the affected phase and add a note under `## Notes` describing:

- what would have broken
- why it would have broken
- what changed in the written plan

#### Re-Simulation Rule

Any material plan change requires a fresh full simulation pass from Phase 1. Do not resume simulation from the middle.

#### Per-Step Verification (lightweight)

After each step, do a quick sanity check:

- File edit? → `get_errors` on that file
- New function? → Read it back to confirm structure
- Config change? → Verify no typos

#### Per-Phase Verification (thorough)

After completing a full phase, run a meaningful check:

- **After Build phase** → build / compile check
- **After Integration phase** → run the program, exercise the feature, or load the UI
- **After Migration** → query DB to confirm data
- **After Frontend** → build + check for runtime errors in console

**Skill-based review after every phase (mandatory):** After the technical check above passes, invoke the appropriate skill or agent to review the phase output before moving to the next phase. Choose based on what was built:

| Phase output | Skill/agent to invoke |
|---|---|
| New or changed code logic | `Code Reviewer` agent — behavior regressions, silent failures, error handling |
| New interfaces, endpoints, or contracts | `Code Reviewer` agent — security lens + input validation |
| Frontend components or UI | `Code Reviewer` agent + `frontend-design-expert` skill |
| Database changes or migrations | `Code Reviewer` agent — data correctness lens |
| Any security-sensitive code | `security-guidance` skill or `Security Guardian` agent |
| Any change in a known domain | Load the matching domain skill for the project |

After `Code Reviewer` passes with no blockers, run `code-simplifier` skill on the same changed code to reduce complexity, flatten nesting, and improve readability — without changing behavior. Skip if the phase produced no new code (e.g. config-only or doc-only changes).

If any review finds a blocker, fix it before advancing. If it finds only warnings, note them in `docs/plan/<plan-name>.md` under `## Notes` and continue.

#### Full Verification (end of task)

- Build passes with zero new errors
- Core functionality works (manual test, UI walkthrough, or direct invocation)
- End-to-end system simulation or real runtime walkthrough passes
- No regressions in existing features

## Plan File (Working Memory)

Every plan MUST be written to a markdown file at `docs/plan/<plan-name>.md` in the workspace root before execution begins. This is the single source of truth for the plan's progress while the task is active.

**File format:**

```text
# Plan: [Task Name]
_Created: [date] | Status: In Progress_

## Phase 1: [Name]
- [ ] Step 1.1: ...
  - [ ] SubStep 1.1a: ...
- [x] Step 1.2: ... _(completed)_
✅ Phase verified: [note]

## Phase 2: [Name]
- [ ] Step 2.1: ...
  - [ ] SubStep 2.1a: ...
- ⚠️ Step 2.2: [blocked — reason]

## Notes
- [any mid-execution discoveries or plan adaptations]
```

**Tracking rules:**

- `[ ]` = not started, `[x]` = completed, `⚠️` = blocked/adapted
- Mark each step/substep as `[x]` immediately after completing it
- When the plan adapts, add a note under `## Notes` explaining what changed and why
- When a phase is fully verified, add `✅ Phase verified:` with a one-line result
- When the full plan is done, update the status line to `Status: Complete`
- Before creating a new active plan in a plan folder, inspect that folder and remove clearly completed or obsolete legacy plan files unless the user explicitly wants them kept

### Plan Cleanup (after successful completion)

After the plan has been fully executed, tested, and the end-to-end system simulation or real runtime verification passes:

- Delete the now-unused active plan file (for example `docs/plan/<plan-name>.md`)
- Delete other completed or obsolete legacy plan files in the same plan folder so finished plans do not accumulate
- If `docs/plan/` becomes empty after cleanup, delete `docs/plan/`
- If a different plan folder is being used and it becomes empty after cleanup, delete that folder too

## Execution Rules

1. **Present the plan FIRST** - show the Phase/SubPhase/Step/SubStep breakdown before writing any code
2. **Get one approval, then run to completion** - present the plan and wait for a single confirmation. After that, execute all phases continuously without stopping for per-phase approval. Only stop if a hard blocker is hit (failure, ambiguity that can't be resolved, or destructive action).
3. **One phase at a time** - complete and verify Phase N before starting Phase N+1, but move to the next phase automatically without asking
4. **Announce phase transitions** - brief status line when moving between phases
5. **Simulate before execution** - after approval and before real execution, simulate the full plan end to end. If simulation finds a flaw, fix the written plan and simulate again from the start.
6. **Verify, test, and simulate after every phase** - do not skip verification. Every phase must end with a concrete check: build the project, run the program, exercise the feature, run a test, or simulate the flow manually. "Looks correct" is not a verification.
7. **On failure: stop, diagnose, fix** - do not skip failed steps. Fix before continuing.
8. **Adapt the plan** - if you discover something mid-execution that changes the approach, update the plan and state what changed and why
9. **Use bullet actions under SubSteps** when a SubStep still has multiple actions.

## Plan Presentation Format

When presenting a plan, use this format:

```text
## Plan: [Task Name]

### Phase 1: [Phase Name]
#### SubPhase 1.A: [SubPhase Name]
- Step 1.1: [action]
  - SubStep 1.1a: [action]
    - [bullet action]
    - [bullet action]
- Step 1.2: [action]
  - SubStep 1.2a: [action]
- ✅ Verify: [what to check]

### Phase 2: [Phase Name]
#### SubPhase 2.A: [SubPhase Name]
- Step 2.1: [action]
  - SubStep 2.1a: [action]
- Step 2.2: [action]
  - SubStep 2.2a: [action]
- ✅ Verify: [what to check]

### Phase 3: [Phase Name]
...
```

## What NOT to Do

- Do not present a 20-step waterfall plan for a 2-line fix
- Do not add a "Research" phase to the plan — do the research first (use tools, read files, search), then present the implementation plan once you have enough context. Research is preparation, not a plan step.
- Do not ask for approval on every sub-step or per-phase; ask once for the overall plan, then execute all phases to completion
- Do not skip verification — every phase needs a real test, build, or simulation, not just a code read
- Do not execute a non-trivial plan without first simulating it end to end, fixing any planning bug found, and re-simulating from the beginning
- Do not re-plan from scratch if one step fails — adapt the existing plan
- Do not present only Phase/Step for non-trivial work; include SubPhase and SubStep
- Do not write vague steps like "update the service" — name the exact file and what changes
- Do not omit skill/agent steps — if a skill needs loading or an agent needs invoking, include it in the plan
- Do not assume the reader knows the codebase — spell everything out
