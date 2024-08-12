<script>
	import HeatmapCard from './HeatmapCard.svelte';
	import Streak from './Streak.svelte';
	export let data;
</script>

<div class="container mt-10 flex flex-col items-center space-y-8">
	{#await data.reviewedInfo then info}
		<Streak data={info} />
		<HeatmapCard title={`${info.length} cards reviewed in last one year`} data={info} />
	{/await}
	{#await data.recordedInfo then info}
		<HeatmapCard title={`${info.length} cards created in last one year`} data={info} />
	{/await}
</div>
