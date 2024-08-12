<script lang="ts">
	export let data = [];
	export let title;
	import Heatmap from '$lib/components/Heatmap/Heatmap.svelte';

	function convertDates(inputArray) {
		const dateCounts = {};

		inputArray.forEach((item) => {
			const localDate = new Date(item.date).toLocaleDateString('en-CA');

			if (dateCounts[localDate]) {
				dateCounts[localDate]++;
			} else {
				dateCounts[localDate] = 1;
			}
		});

		const outputArray = Object.keys(dateCounts).map((date) => ({
			date: date,
			count: dateCounts[date]
		}));

		return outputArray;
	}
</script>

<div>
	<h2>{title}</h2>
	<div class="my-4">
		<Heatmap data={convertDates(data)} />
	</div>
</div>
