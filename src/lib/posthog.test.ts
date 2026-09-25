import { describe, expect, it, vi } from 'vitest';

// Overrides the vitest-setup.ts mock for this file: here the SDK is configured, so the
// lazy load path is exercised. Every other test file keeps the empty (disabled) env, which
// implicitly proves the helper never fetches posthog-js when unconfigured.
vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_POSTHOG_PROJECT_TOKEN: 'test-token', PUBLIC_POSTHOG_HOST: 'https://ph.test' }
}));

vi.mock('posthog-js', () => ({
	default: {
		init: vi.fn(),
		capture: vi.fn(),
		identify: vi.fn(),
		reset: vi.fn(),
		captureException: vi.fn()
	}
}));

type Sdk = Record<string, ReturnType<typeof vi.fn>>;

async function freshHelper() {
	vi.resetModules();
	return import('./posthog');
}

async function sdk(): Promise<Sdk> {
	return (await import('posthog-js')).default as unknown as Sdk;
}

describe('lazy posthog helper', () => {
	it('inits once with the FCP-safe config and forwards captures', async () => {
		const mod = await freshHelper();

		await mod.capture('flashcard_created', { entry_point: 'record' });

		const ph = await sdk();
		expect(ph.init).toHaveBeenCalledTimes(1);
		expect(ph.init).toHaveBeenCalledWith(
			'test-token',
			expect.objectContaining({
				api_host: 'https://ph.test',
				ui_host: 'https://us.posthog.com',
				capture_exceptions: true,
				capture_performance: { web_vitals: true },
				person_profiles: 'identified_only'
			})
		);
		expect(ph.capture).toHaveBeenCalledWith('flashcard_created', { entry_point: 'record' });
	});

	it('forwards exceptions without throwing when init itself fails', async () => {
		const mod = await freshHelper();
		const ph = await sdk();
		ph.init.mockImplementation(() => {
			throw new Error('blocked');
		});

		await expect(mod.capture('x')).resolves.toBeUndefined();
		await expect(mod.captureException(new Error('boom'))).resolves.toBeUndefined();
	});
});
