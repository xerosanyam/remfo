declare module 'cal-heatmap';

// The Tooltip plugin ships no types. Deliberately any: its options carry a `text`
// callback cal-heatmap's own PluginOptions does not declare, so a precise constructor
// type would only move the error to the options literal.
declare module 'cal-heatmap/plugins/Tooltip' {
	const Tooltip: any;
	export default Tooltip;
}
