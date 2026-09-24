<script>
	import HeatmapCard from './HeatmapCard.svelte';
	import Streak from './Streak.svelte';
	export let data;
</script>

<svelte:head>
	<title>Remfo | Measure</title>
</svelte:head>

<div class="container mt-10 flex flex-col items-center space-y-8">
	<Streak data={data.reviewedInfo} />
	<HeatmapCard title="cards reviewed" data={data.reviewedInfo} />
	<HeatmapCard title="cards created" data={data.recordedInfo} />
</div>
