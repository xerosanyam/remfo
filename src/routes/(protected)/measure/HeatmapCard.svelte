<script lang="ts">
	export let data: { date: string; count: number }[] = [];
	export let title;
	import Heatmap from '$lib/components/Heatmap/Heatmap.svelte';

	$: total = data.reduce((sum, item) => sum + item.count, 0);
</script>

<div class="w-full max-w-full rounded-sm border p-2">
	<h2>{total} {title}</h2>
	<div class="max-w-full overflow-x-auto pb-2">
		<Heatmap {data} />
	</div>
</div>
