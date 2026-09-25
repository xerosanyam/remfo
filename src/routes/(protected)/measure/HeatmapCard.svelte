<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';

	export let data: { date: string; count: number }[] = [];
	export let title: string;

	// cal-heatmap is the app's largest dependency: the /measure page chunk is 312KB
	// with it statically imported. Load it only after first paint so it never contends
	// with FCP/LCP, and reserve its space so the late paint doesn't shift layout.
	let Heatmap: Component<{ data: { date: string; count: number }[] }> | null = null;
	let failed = false;

	onMount(async () => {
		try {
			Heatmap = (await import('$lib/components/Heatmap/Heatmap.svelte')).default;
		} catch {
			// Titles, totals and streak above are SSR'd; the heatmap is enhancement.
			failed = true;
		}
	});

	$: total = data.reduce((sum, item) => sum + item.count, 0);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{total} {title}</Card.Title>
	</Card.Header>
	<Card.Content>
		<!-- 13 month-domains side by side: one label row + 7 day rows ≈ 120px. -->
		<div class="min-h-30">
			{#if Heatmap}
				<svelte:component this={Heatmap} {data} />
			{:else if failed}
				<p class="text-muted-foreground text-sm">heatmap unavailable</p>
			{:else}
				<Skeleton class="h-30 w-full" />
			{/if}
		</div>
	</Card.Content>
</Card.Root>
