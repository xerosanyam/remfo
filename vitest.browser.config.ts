import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	resolve: { conditions: ['browser'] },
	optimizeDeps: {
		include: [
			'@testing-library/svelte',
			'date-fns',
			'posthog-js',
			'sveltekit-superforms',
			'sveltekit-superforms/adapters',
			'zod'
		]
	},
	plugins: [sveltekit(), svelteTesting({ autoCleanup: false }), Icons({ compiler: 'svelte' })],
	test: {
		include: ['src/**/*.browser.ts'],
		setupFiles: ['./vitest-setup.ts'],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [{ browser: 'chromium' }]
		}
	}
});
