import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/public', () => ({
	PUBLIC_POSTHOG_PROJECT_TOKEN: 'test-token',
	PUBLIC_POSTHOG_HOST: 'https://ph.test'
}));
vi.mock('#lib/posthog.js', () => ({
	captureException: vi.fn(async () => undefined),
	initPostHogIdle: vi.fn()
}));

import { handleError } from './hooks.client';
import { captureException } from '#lib/posthog.js';

beforeEach(() => {
	vi.mocked(captureException).mockReset().mockResolvedValue(undefined);
});

describe('SvelteKit 3 client error handling', () => {
	it.each(['app', 'framework'] as const)(
		'does not report %s errors or override their defaults',
		(kind) => {
			const error = { status: 404, message: 'not found' };

			expect(handleError({ kind, error, event: {} as never })).toBeUndefined();
			expect(captureException).not.toHaveBeenCalled();
		}
	);

	it('reports unknown errors without exposing their message', () => {
		const error = new Error('private internal detail');

		expect(handleError({ kind: 'unknown', error, event: {} as never })).toBeUndefined();
		expect(captureException).toHaveBeenCalledWith(error);
	});

	it('does not turn an analytics failure into another unhandled error', async () => {
		vi.mocked(captureException).mockRejectedValue(new Error('analytics unavailable'));

		expect(
			handleError({ kind: 'unknown', error: new Error('render failed'), event: {} as never })
		).toBeUndefined();
		await Promise.resolve();
	});
});
