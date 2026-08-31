import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
	plugins: [
		enhancedImages(),
		sveltekit(),
		svelteTesting(),
		Icons({
			compiler: 'svelte'
		}),
		SvelteKitPWA({
			manifest: {
				name: 'Remember Forever',
				short_name: 'Remfo',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				icons: [
					{ src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
				]
			}
		})
	],
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./vitest-setup.ts']
	}
});
