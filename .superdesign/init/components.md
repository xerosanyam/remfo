# Shared UI components

Remfo uses small custom Svelte components rather than a component library.

## GoogleButton

- Path: `src/lib/components/Buttons/Google.svelte`
- Props: `text: string`
- Primary Google sign-in action.

```svelte
<script lang="ts">
	import OmIcon from '~icons/arcticons/growtracker';
	export let text: string = 'Sign In';
</script>

<form action="/login/google">
	<button class="flex rounded-sm bg-gray-900 px-6 py-4 text-white sm:px-8" type="submit"
		><OmIcon class="mr-1" style="font-size:1.2rem;stroke-width:2;" /><span>{text}</span></button
	>
</form>
```

## Login

- Path: `src/lib/components/Buttons/Login.svelte`
- Props: `text: string`
- Quiet full-width sign-in link button.

```svelte
<script lang="ts">
	export let text: string = 'sign in';
</script>

<form action="/login/google">
	<button
		class="flex w-full items-center space-x-2 px-6 py-4 text-gray-800 underline hover:bg-gray-100"
		type="submit"
	>
		<span>{text} </span>
	</button>
</form>
```

## Logout

- Path: `src/lib/components/Logout.svelte`
- Signs the current user out from navigation.

```svelte
<script>
	import { ROUTES } from '$lib/routes.util';
	import ExitIcon from '~icons/mdi/exit-run';
</script>

<form class="w-1/5 sm:mt-auto sm:w-full" method="post" action={ROUTES.LOGOUT}>
	<button
		class="flex h-16 w-full flex-col items-center justify-center gap-0.5 border-r p-1 text-center text-[0.7rem] leading-tight text-gray-900 ring-offset-background transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:h-10 sm:flex-row sm:justify-start sm:gap-2 sm:border-r-0 sm:px-4 sm:py-6 sm:text-left sm:text-base sm:leading-normal"
		type="submit"
	>
		<ExitIcon />
		sign out
	</button>
</form>
```

## ContentRenderer

- Path: `src/lib/components/ContentRenderer.svelte`
- Props: `text: string`
- Renders text, safe HTTP links, or image URLs used in cards.

```svelte
<script lang="ts">
	export let text = '';

	const IMAGE_PATH = /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i;

	function parseHttpUrl(value: string): URL | null {
		try {
			const url = new URL(value);
			return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
		} catch {
			return null;
		}
	}

	$: url = parseHttpUrl(text);
	$: isImageUrl = !!url && IMAGE_PATH.test(url.pathname);
</script>

{#if isImageUrl}
	<img src={text} alt="content" />
{:else if url}
	<a class="underline" href={text} target="_blank" rel="noopener noreferrer">{text}</a>
{:else}
	{text}
{/if}
```
