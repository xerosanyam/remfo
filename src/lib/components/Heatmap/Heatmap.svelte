<script lang="ts">
	import { onMount } from 'svelte';
	import CalHeatmap from 'cal-heatmap';
	import Tooltip from 'cal-heatmap/plugins/Tooltip';
	import 'cal-heatmap/cal-heatmap.css';

	export let data: { date: string; count: number }[];
	let cal: InstanceType<typeof CalHeatmap> | null = null;
	let divElement: HTMLDivElement;

	// Built in one shot rather than mutated after construction: this is only the calendar's
	// start boundary, so it needs no reactivity (and so no SvelteDate). Shifting the year is
	// equivalent to setMonth(month - 12), Feb 29 normalisation included.
	const today = new Date();
	const currentDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
	// Extracted (not inline): the Tooltip plugin is untyped, so an inline literal would
	// fail excess-property checking against PluginOptions, which declares no `text`.
	const tooltipOptions = {
		text: (
			date: number,
			value: number | null,
			dayjsDate: { format: (template?: string) => string }
		) => {
			return (value ? value + ' items' : 'No data') + ' on ' + dayjsDate.format('LL');
		}
	};
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
					start: currentDate,
					highlight: [
						new Date() // Highlight today
					],
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
				},
				data: {
					source: data,
					x: 'date',
					y: (d: { count: number }) => +d['count']
				},
				scale: {
					color: {
						type: 'threshold',
						range: ['#4dd05a', '#37a446', '#166b34', '#14432a'],
						domain: [10, 20, 30]
					}
				}
			},
			[[Tooltip, tooltipOptions]]
		);
	});
</script>

<div bind:this={divElement}></div>
