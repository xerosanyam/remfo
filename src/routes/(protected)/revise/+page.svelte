<script lang="ts">
	import Heatmap from '$lib/components/Heatmap/Heatmap.svelte';
	import CardReview from '$lib/components/Cards/CardReview.svelte';
	export let data;
</script>

{#await data.cards then cards}
	<CardReview {cards} />
{/await}

{#await data.groupedInfo then groupedInfo}
	<div class="my-20 flex justify-center">
		<Heatmap data={groupedInfo} />
	</div>
{/await}
