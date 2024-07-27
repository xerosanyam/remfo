import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite'
import { enhancedImages } from '@sveltejs/enhanced-img';
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig({
	plugins: [
		enhancedImages(),
		sveltekit(),
		svelteTesting(),
		Icons({
			compiler: 'svelte',
		}),
		SvelteKitPWA({/* pwa options */ }),
	],
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./vitest-setup.ts'],
	}
});
