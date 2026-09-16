<script lang="ts">
	export let data: { date: string; count: number }[] = [];
	export let title;
	import Heatmap from '$lib/components/Heatmap/Heatmap.svelte';

	$: total = data.reduce((sum, item) => sum + item.count, 0);
</script>

<div class="rounded-sm border border-slate-200 p-2 dark:border-slate-700">
	<h2>{total} {title}</h2>
	<div>
		<Heatmap {data} />
	</div>
</div>
