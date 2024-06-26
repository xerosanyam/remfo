import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite'
import { enhancedImages } from '@sveltejs/enhanced-img';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		VitePWA({ registerType: 'autoUpdate' }),
		enhancedImages(),
		sveltekit(),
		Icons({
			compiler: 'svelte',
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
