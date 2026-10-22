import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

import '../../app.css';
import PrimaryNav from './PrimaryNav.svelte';
import LandingPage from '../../routes/+page.svelte';

afterEach(cleanup);

// Guards the trap we fell into twice: lucide pins stroke-width="2" on its inner
// shapes as a presentation attribute, which beats inherited CSS from a style
// attribute on the <svg>. Only a real rule on the shapes (app.css) thins them,
// so this asserts the COMPUTED weight in Chromium, not the markup.
describe('sidebar assets in Chromium', () => {
	it('decodes the logo asynchronously at its rendered size', async () => {
		const { container } = render(PrimaryNav, { user: null });
		const image = container.querySelector('img')!;
		await image.decode();

		expect(image.decoding).toBe('async');
		expect(image.naturalWidth).toBe(40);
		expect(image.naturalHeight).toBe(40);
		expect(image.width).toBe(40);
		expect(image.height).toBe(40);
	});

	it('renders every sidebar icon shape at 1px, not the baked-in 2px', () => {
		render(PrimaryNav, { user: { id: 'u1', email: 'a@b.c', name: 'sanyam' } });

		const shapes = Array.from(
			document.querySelectorAll('.primary-nav svg :is(path, circle, rect, line)')
		);
		expect(shapes.length).toBeGreaterThan(0);
		for (const shape of shapes) {
			expect(getComputedStyle(shape).strokeWidth).toBe('1px');
		}
	});

	it('renders the landing feature icons at 1px too', () => {
		render(LandingPage);

		const shapes = Array.from(
			document.querySelectorAll('.landing-features svg :is(path, circle, rect, line)')
		);
		expect(shapes.length).toBeGreaterThan(0);
		for (const shape of shapes) {
			expect(getComputedStyle(shape).strokeWidth).toBe('1px');
		}
	});
});
