<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AddNewCard from './AddNewCard.svelte';
	import NewCards from './NewCards.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import * as Empty from '$lib/components/ui/empty';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { clampCardLimit } from '$lib/common.util';
	import { ROUTES } from '$lib/routes.util';
	import type { CardEssentials } from '$lib/types/Card';

	let { data } = $props();

	// Prerendered shell: the list is a client-side island over /api/cards. Add/delete patch
	// it directly and skip update(), so one card never refetches all cards. The server stays
	// authoritative on reload, nav, and limit change.
	type LoadedCards = { cards: CardEssentials[]; totalCards: number } | null;
	let live: LoadedCards = $state(null);
	let loadingList = $state(true);
	// Set on mount before the first fetch resolves; NewCards only renders once live is set.
	let limit = $state(0);

	onMount(async () => {
		limit = clampCardLimit(Number(new URLSearchParams(window.location.search).get('limit')));
		let res: Response | null = null;
		try {
			res = await fetch(`/api/cards?limit=${limit}`);
		} catch {
			// Offline: falls through to the load-fail branch below.
		}
		// Logged out (or session expired between shell paint and fetch): the shell is
		// static, so guard client-side. Form posts still guard server-side.
		if (res?.status === 401) {
			await goto(resolve(ROUTES.LOGIN), { replaceState: true });
			return;
		}
		live = res?.ok ? await res.json().catch(() => null) : null;
		loadingList = false;
	});

	// Server makes the real id; the temp key reconciles on the next full load.
	const prepend = ({ front, back }: { front: string; back: string }) => {
		if (!live) return;
		live = {
			cards: [{ id: `pending-${Date.now()}`, front, back, createdAt: new Date() }, ...live.cards],
			totalCards: live.totalCards + 1
		};
	};

	const remove = ({ cardId }: { cardId: string }) => {
		if (!live) return;
		live = {
			cards: live.cards.filter((c) => c.id !== cardId),
			totalCards: Math.max(0, live.totalCards - 1)
		};
	};
</script>

<svelte:head>
	<title>Remfo | Record</title>
</svelte:head>

<AddNewCard formData={data.addForm} onadded={prepend} />

{#if live}
	{#if live.cards.length > 0}
		<NewCards cards={live.cards} totalCards={live.totalCards} {limit} ondeleted={remove} />
	{:else}
		<Empty.Root class="mx-auto mt-8 max-w-lg">
			<Empty.Header>
				<Empty.Title>nothing here yet</Empty.Title>
				<Empty.Description>your first card is one save away. write it above.</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
{:else if loadingList}
	<div class="mx-auto mt-8 max-w-lg space-y-2" aria-label="loading your cards">
		<div class="js-only space-y-2">
			<Skeleton class="h-16 w-full" />
			<Skeleton class="h-16 w-full" />
			<Skeleton class="h-16 w-full" />
		</div>
		<noscript>
			<p class="text-muted-foreground text-center text-sm">
				the list needs javascript. the add form above works without it.
			</p>
		</noscript>
	</div>
{:else}
	<Alert.Root variant="destructive" class="mx-auto mt-8 max-w-lg">
		<Alert.Title>could not load your cards.</Alert.Title>
		<Alert.Description>the add form above still works. try reloading.</Alert.Description>
	</Alert.Root>
{/if}
