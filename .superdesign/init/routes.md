# Routes

SvelteKit file-based routing. Every route uses `src/routes/+layout.svelte`; protected routes also use `src/routes/(protected)/+layout.svelte` and its server auth guard.

| URL | Page file | Purpose |
| --- | --- | --- |
| `/` | `src/routes/+page.svelte` | Product home and sign-in |
| `/login/device` | `src/routes/(auth)/login/device/+page.svelte` | Limited-input Google device login |
| `/logout` | `src/routes/(auth)/logout/+page.server.ts` | Sign-out action |
| `/record` | `src/routes/(protected)/record/+page.svelte` | Create and browse cards by date |
| `/revise` | `src/routes/(protected)/revise/+page.svelte` | Review scheduled cards |
| `/measure` | `src/routes/(protected)/measure/+page.svelte` | Streak and activity calendars |
| `/learn` | `src/routes/(protected)/learn/+page.svelte` | Generate and save AI flashcards |
| `/privacy` | `src/routes/privacy/+page.svelte` | Privacy policy |
| `/pricing` | `src/routes/pricing/+page.svelte` | Pricing shell |
| `/compare/anki` | `src/routes/compare/anki/+page.svelte` | Product comparison |

Server-only routes:

- `GET /login/google`: `src/routes/(auth)/login/google/+server.ts`
- `GET /login/google/callback`: `src/routes/(auth)/login/google/callback/+server.ts`
- `POST /api/health/db`: `src/routes/api/health/db/+server.ts`
