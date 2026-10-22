import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { svelteTesting } from '@testing-library/svelte/vite';

const vercelEnvironment = process.env.VERCEL_ENV;
if (vercelEnvironment === 'preview' || vercelEnvironment === 'production') {
	for (const name of ['PUBLIC_POSTHOG_PROJECT_TOKEN', 'PUBLIC_POSTHOG_HOST']) {
		if (!process.env[name]?.trim()) {
			throw new Error(`${name} is required for ${vercelEnvironment} builds`);
		}
	}
}

export default defineConfig({
	plugins: [
		enhancedImages(),
		sveltekit({
			// Consult https://kit.svelte.dev/docs/integrations#preprocessors
			// for more information about preprocessors
			preprocess: vitePreprocess(),

			// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
			// If your environment is not supported or you settled on a specific environment, switch out the adapter.
			// See https://kit.svelte.dev/docs/adapters for more information about adapters.
			adapter: adapter({
				runtime: 'nodejs24.x',
				// The database is a single Turso primary in India. Edge functions otherwise run
				// near the viewer, which maximises the distance to it on the hot path, and every
				// protected request pays that round trip twice: once to validate the session in
				// hooks.server.ts, then again for the page's own query. Measured at 256ms each
				// against production before this was set (Server-Timing: auth;desc="session db").
				// Pinning next to the database trades one round trip of HTML latency for far-away
				// viewers against two round trips of database latency for everyone.
				regions: ['bom1']
			}),

			// Required for PostHog session replay with SSR.
			paths: { relative: false }
		}),
		svelteTesting(),
		Icons({
			compiler: 'svelte'
		})
	],
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./vitest-setup.ts']
	}
});
