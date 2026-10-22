import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const app = readFileSync('src/app.html', 'utf8');
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));

describe('shared page assets', () => {
	it('declares a small PNG favicon instead of relying on the 15KB ICO fallback', () => {
		const icon = app.match(/<link\b[^>]*\brel="icon"[^>]*>/)?.[0];
		expect(icon).toContain('href="/favicon-32x32.png"');
		expect(icon).toContain('type="image/png"');
		expect(icon).toContain('sizes="32x32"');
		expect(readFileSync('static/favicon-32x32.png').byteLength).toBeLessThan(2048);
	});

	it.each(['/favicon.ico', '/favicon-32x32.png', '/site.webmanifest'])(
		'gives %s a public cache lifetime of at least one day',
		(path) => {
			const rule = config.headers.find((rule: { source: string }) => rule.source === path);
			const cache = rule?.headers.find(
				(header: { key: string }) => header.key.toLowerCase() === 'cache-control'
			)?.value;
			expect(cache).toMatch(/\bpublic\b/);
			expect(Number(cache.match(/\bmax-age=(\d+)/)?.[1])).toBeGreaterThanOrEqual(86400);
		}
	);
});
