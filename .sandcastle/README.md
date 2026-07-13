# bun-sandcastle-config

Reusable [Sandcastle](https://github.com/ai-hero-dev/sandcastle) config for driving a
multi-agent, four-phase orchestration loop over a Bun project's GitHub Issues:

1. **Plan** — an Opus agent reads open issues labeled `ready-for-plan`, builds a
   dependency graph, and emits a validated `<plan>` JSON of unblocked issues.
2. **Execute + Review** — each issue gets its own sandbox/branch. An implementer runs
   (TDD, up to 100 iterations); if it commits, a reviewer refines the diff. All issue
   pipelines run concurrently.
3. **Merge** — one agent merges every completed branch into the current branch,
   resolving conflicts and closing the issues.

The outer loop repeats (up to `MAX_ITERATIONS`) so newly-unblocked issues get picked
up after each round of merges.

## Layout

Two runnable orchestration variants, each self-contained in its own folder:

| Folder                    | Entrypoint                  | Role                                        |
| ------------------------- | --------------------------- | ------------------------------------------- |
| `plan-implement-review/`  | `plan-implement-review.ts`  | Full loop: plan → execute + review → merge. |
| `implement/`              | `implement.ts`              | Copy of the loop, wired for implement work. |

Each folder holds the same prompt set:

| File                  | Role                                                          |
| --------------------- | ------------------------------------------------------------ |
| `plan-prompt.md`      | Planner prompt — pulls issues via `gh`, emits `<plan>` JSON. |
| `implement-prompt.md` | Implementer prompt — RGR/TDD, `RALPH:`-prefixed commits.     |
| `review-prompt.md`    | Reviewer prompt — clarity/correctness pass on the branch.    |
| `merge-prompt.md`     | Merger prompt — merges branches, closes issues.              |

Shared at the root:

| File                  | Role                                                          |
| --------------------- | ------------------------------------------------------------ |
| `CODING_STANDARDS.md` | Loaded by the reviewer; customize per project.               |
| `Dockerfile`          | Sandbox image (Bun 1.3 + git + gh + Claude Code CLI).        |
| `setup.sh`            | Installs deps, builds the image, creates the label + scripts.|

## Setup

Drop this into a repo as `.sandcastle/`, then:

```bash
cp .env.example .env   # fill in CLAUDE_CODE_OAUTH_TOKEN + GH_TOKEN
bun install
```

Get an OAuth token with `claude setup-token`. The `GH_TOKEN` needs a fine-grained PAT
with Issues (read/write) + Metadata (read).

## Runclaude-opus-4-8

```bash
bun run sandcastle:plan-implement-review   # full plan → execute + review → merge loop
bun run sandcastle:implement               # implement variant
```

Both scripts are registered by `setup.sh`.

## Customize per project

- **`copyToWorktree`** (in each entrypoint `.ts`) — list every `node_modules` to seed
  into the worktree. For a monorepo, add each package's path.
- **`hooks.sandbox.onSandboxReady`** — the `bun install` step; swap if you need extras.
- **`CODING_STANDARDS.md`** — the reviewer enforces these without spending
  implementer tokens.
- **`MAX_ITERATIONS`** — plan→execute→merge cycles before stopping.
- **Model** — templates use `claude-opus-4-7`; bump as needed.

## Notes

- Only issues labeled `ready-for-plan` are considered (see `plan-prompt.md`).
- Branch names are deterministic (`sandcastle/issue-{id}`) so re-planning preserves
  accumulated progress.
- `logs/` and `worktrees/` are runtime artifacts and gitignored.
