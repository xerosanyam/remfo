import type { Config } from 'tailwindcss';

// No tailwindcss/* runtime imports: the upgrade tool reads this file with its own
// packages, and the old fontFamily.sans spread only re-applied the default stack.

const config: Config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		}
	}
};

export default config;
