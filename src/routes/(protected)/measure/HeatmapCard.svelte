<script lang="ts">
	import type { info } from '$lib/algo.utils';
	export let data: info = [];
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

<div class="rounded-sm border p-2">
	<h2>{title}</h2>
	<div>
		<Heatmap data={convertDates(data)} />
	</div>
</div>
