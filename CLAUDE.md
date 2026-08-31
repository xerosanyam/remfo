# remfo

Spaced-repetition flashcard app (SvelteKit + Turso/libSQL + Lucia auth), deployed to Vercel edge.

- All improvements we make should be measurable
- Always strive to add tests for critical functionalities
- UX should be snappy
- Use Best practices of HTML, CSS, JS, Accessibility
- App should work well without JS

## Commands

Bun is the package manager (`bun.lockb`, `engine-strict=true`).

- `bun run dev` - dev server
- `bun run test` - vitest (happy-dom). `bun run build` runs tests first.
- `bun run check` - svelte-check
- `bun run lint` / `bun run format` - prettier + eslint
- `bun run generate` / `bun run migrate` - drizzle-kit against Turso

Env vars live in `.env` (see `.env.example`): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `REDIRECT_URI`, `TURSO_CONNECTION_URL`, `TURSO_AUTH_TOKEN`, plus `OPENAI_API_KEY` for `/learn`.

## Layout

- `src/routes/(auth)/` - Google OAuth via arctic + Lucia; callback creates user and session cookie.
- `src/routes/(protected)/` - guarded by `(protected)/+layout.server.ts`; pages: `record` (add/list), `revise` (SM-2 review), `learn` (OpenAI card generation), `measure` (heatmap + streak).
- `src/lib/db/turso.schema.ts` - single source of truth for tables (`auth_user`, `user_session`, `card`, `activity`).
- `src/lib/db/tables/*.table.ts` - all query functions. No queries inline in routes.
- `src/lib/actions/card.action.ts` - shared form actions (`addAction`, `reviewAction`, `deleteAction`), each parameterised by redirect target.
- `src/lib/routes.util.ts` - `ROUTES` map; use it instead of literal paths.
- `essays/` - design notes and gotchas, not app code.

## Conventions

- Svelte 5 (prerelease) but components use legacy `export let` props, not runes. Match the file you are editing.
- Forms: sveltekit-superforms + zod schemas in `src/lib/schemas.ts`. Load returns a `superValidate` form, actions validate and redirect.
- Auth check in every server load/action is `sessionExists(locals)` from `src/lib/common.util.ts` (type guard, narrows `locals.user`).
- Deletes are soft: `card.deleted = true`. Queries must filter `eq(cardTable.deleted, false)`.
- The `activity` table is populated by SQL triggers (`migrations/0001_plain_stingray.sql`), not by app code. Streak and heatmap read from it.
- Icons come from `unplugin-icons`: `import X from '~icons/<collection>/<name>'`.
- Tabs, single quotes, no trailing commas (`.prettierrc`).

## Gotchas

- `hooks.server.ts` caches sessions in a module-level object; it survives per-instance only and is never evicted.
- SM-2 scheduling lives in `calculateSuperMemo2Algorithm` in `card.table.ts`. `src/lib/algo.utils.ts` holds streak math and has tests (`algo.util.test.ts`) - keep them passing.
- Vercel adapter runs `runtime: 'edge'`; avoid Node-only APIs in server code.
- Both postgres and sqlite Lucia adapters are installed; only the libSQL one is wired up.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->

## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:

   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```

5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**

- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->
