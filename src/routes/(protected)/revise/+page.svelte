<script lang="ts">
	import Heatmap from '$lib/components/Heatmap/Heatmap.svelte';
	import ReviseCards from './ReviseCards.svelte';
	export let data;
</script>

{#await data.cards then cards}
	<ReviseCards {cards} />
{/await}

{#await data.groupedInfo then groupedInfo}
	<div class="my-20 flex justify-center">
		<Heatmap data={groupedInfo} />
	</div>
{/await}
