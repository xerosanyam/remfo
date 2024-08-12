<script lang="ts">
	import { onMount } from 'svelte';
	import CalHeatmap from 'cal-heatmap';
	import Tooltip from 'cal-heatmap/plugins/Tooltip';
	import 'cal-heatmap/cal-heatmap.css';

	export let data;
	let cal;
	let divElement: HTMLDivElement;

	const currentDate = new Date();
	currentDate.setMonth(currentDate.getMonth() - 12);
	onMount(() => {
		cal = new CalHeatmap();
		cal.paint(
			{
				itemSelector: divElement,
				range: 13, // show 13 months (current month + 12 months back)
				domain: {
					type: 'month',
					gutter: 4,
					label: { text: 'MMM', textAlign: 'start', position: 'top' }
				},
				subDomain: { type: 'ghDay', radius: 2, width: 8, height: 8, gutter: 2 },
				date: {
					start: currentDate
					// min: new Date('2024-01-01'),
					// max: new Date()
				},
				data: {
					source: data,
					x: 'date',
					y: (d) => +d['count']
				},
				scale: {
					color: {
						type: 'threshold',
						range: ['#4dd05a', '#37a446', '#166b34', '#14432a'],
						domain: [10, 20, 30]
					}
				}
			},
			[
				[
					Tooltip,
					{
						text: function (date, value, dayjsDate) {
							return (value ? value + ' items' : 'No data') + ' on ' + dayjsDate.format('LL');
						}
					}
				]
			]
		);
	});
</script>

<div bind:this={divElement}></div>

<style>
	/* #ch-tooltip {
		z-index: 100 !important;
	} */
	.cal-heatmap.future {
		fill: red;
	}
</style>
