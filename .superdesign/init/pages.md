# Page dependency trees

Every page is wrapped by `src/routes/+layout.svelte` and `src/lib/components/PrimaryNav.svelte`.

## `/` home

- `src/routes/+page.svelte`
  - `src/lib/components/Buttons/Google.svelte`
  - `src/lib/routes.util.ts`

## `/record`

- `src/routes/(protected)/record/+page.svelte`
  - `src/routes/(protected)/record/AddNewCard.svelte`
    - `src/lib/schemas.ts`
  - `src/routes/(protected)/record/NewCards.svelte`
    - `src/lib/common.util.ts`
    - `src/lib/types/Card.ts`

## `/revise`

- `src/routes/(protected)/revise/+page.svelte`
  - `src/lib/components/Cards/CardReview.svelte`
    - `src/lib/components/Cards/Card.svelte`
      - `src/lib/components/Cards/ReviewOptions.svelte`
      - `src/lib/components/ContentRenderer.svelte`
    - `src/lib/components/Cards/ReviewProgress.svelte`

## `/measure`

- `src/routes/(protected)/measure/+page.svelte`
  - `src/routes/(protected)/measure/Streak.svelte`
    - `src/lib/algo.utils.ts`
  - `src/routes/(protected)/measure/HeatmapCard.svelte`
    - `src/lib/components/Heatmap/Heatmap.svelte`

## `/learn`

- `src/routes/(protected)/learn/+page.svelte`
  - `src/routes/(protected)/learn/GenerateFlashCard.svelte`
    - `src/lib/schemas.ts`
    - `src/lib/shortcuts.js`
  - `src/routes/(protected)/home/AddNewCard.svelte`
    - `src/lib/schemas.ts`

## `/login/device`

- `src/routes/(auth)/login/device/+page.svelte`

## Static pages

- `/privacy`: `src/routes/privacy/+page.svelte`
  - `src/lib/routes.util.ts`
- `/pricing`: `src/routes/pricing/+page.svelte`
- `/compare/anki`: `src/routes/compare/anki/+page.svelte`
