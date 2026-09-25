declare module 'cal-heatmap';

// The Tooltip plugin ships no types. Deliberately any: its options carry a `text`
// callback cal-heatmap's own PluginOptions does not declare, so a precise constructor
// type would only move the error to the options literal.
declare module 'cal-heatmap/plugins/Tooltip' {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped plugin; options carry a `text` callback PluginOptions does not declare
	const Tooltip: any;
	export default Tooltip;
}
