<script>
	import HeatmapCard from './HeatmapCard.svelte';
	import Streak from './Streak.svelte';
	export let data;
</script>

<div class="mx-auto mt-10 max-w-xl">
	{#await data.reviewedInfo then info}
		<div class="mb-10">
			<Streak data={info} />
		</div>
		<HeatmapCard title={`${info.length} cards reviewed in last one year`} data={info} />
	{/await}
	{#await data.recordedInfo then info}
		<HeatmapCard title={`${info.length} cards created in last one year`} data={info} />
	{/await}
</div>
