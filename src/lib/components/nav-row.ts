// One source of truth for PrimaryNav row styling: the in-app links, the theme
// toggle, and the sign-out control must look like siblings, not three designs.
export const navRowClass =
	'border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex min-w-0 flex-1 flex-col items-center border-r px-1 py-2 text-center text-xs leading-tight transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden sm:h-10 sm:w-full sm:flex-none sm:flex-row sm:gap-2 sm:border-r-0 sm:px-4 sm:py-6 sm:text-left sm:text-base disabled:opacity-50';

// Single knob for sidebar icon size (24px). Weight is NOT set here: lucide pins
// stroke-width="2" on its inner shapes, which beats inherited CSS, so the weight
// lives on a .primary-nav rule in app.css instead.
export function navIconStyle(): string {
	return 'font-size:1.5rem;';
}
