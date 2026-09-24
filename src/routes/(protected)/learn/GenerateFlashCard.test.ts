import { render, screen, waitFor } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/dom';
import { stringify } from 'devalue';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { server } from '../../../mocks/node';
import { http, HttpResponse } from 'msw';

// Headless deserialize needs the client decoder table; same block lives in the record and
// home form tests, change all three in lockstep. Pinned to kit version by bun.lock.
vi.mock(
	'../../../../node_modules/@sveltejs/kit/src/runtime/client/client.js',
	async (importOriginal) => {
		const actual = (await (importOriginal as () => Promise<Record<string, unknown>>)()) as Record<
			string,
			unknown
		>;
		return { ...actual, app: { ...((actual.app as object) ?? {}), decoders: {} } };
	}
);

vi.mock('$lib/posthog', () => ({
	capture: vi.fn(async () => undefined),
	identify: vi.fn(async () => undefined),
	reset: vi.fn(async () => undefined),
	captureException: vi.fn(async () => undefined)
}));

// The component calls applyAction directly; the real one needs an initialized client that
// headless tests never create. enhance itself stays real, so the submit path is genuine.
vi.mock('$app/forms', async (importOriginal) => {
	const actual = (await (importOriginal as () => Promise<Record<string, unknown>>)()) as Record<
		string,
		unknown
	>;
	return { ...actual, applyAction: vi.fn(async () => undefined) };
});

import GenerateFlashCard from './GenerateFlashCard.svelte';
import { applyAction } from '$app/forms';
import { capture } from '$lib/posthog';

const actionResult = (type: string, status: number, data: unknown) =>
	HttpResponse.text(JSON.stringify({ type, status, data: stringify(data) }), { status });

const data = { data: { userInput: '' }, errors: {} } as never;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
	server.resetHandlers();
	vi.clearAllMocks();
});

describe('learn GenerateFlashCard submit path', () => {
	it('posts the prompt and reports generation counts on success', async () => {
		const bodies: Record<string, string>[] = [];
		server.use(
			http.post('/', async ({ request }) => {
				bodies.push(Object.fromEntries(await request.formData()) as Record<string, string>);
				return actionResult('success', 200, {
					data: [
						{ question: 'q1', answer: 'a1' },
						{ question: 'q2', answer: 'a2' }
					]
				});
			})
		);
		const { container } = render(GenerateFlashCard, { data });
		await fireEvent.change(container.querySelector('#question')!, {
			target: { value: 'black holes' }
		});

		await fireEvent.submit(container.querySelector('form')!);

		await waitFor(() => expect(bodies).toHaveLength(1));
		expect(bodies[0]).toMatchObject({ userInput: 'black holes' });
		await waitFor(() =>
			expect(vi.mocked(capture)).toHaveBeenCalledWith('flashcard_generation_completed', {
				generated_card_count: 2
			})
		);
		expect(vi.mocked(applyAction)).toHaveBeenCalled();
	});

	it('renders server validation errors without reporting generation', async () => {
		server.use(
			http.post('/', async () =>
				actionResult('failure', 400, {
					form: { errors: { userInput: ['Prompt is required'] } }
				})
			)
		);
		const { container } = render(GenerateFlashCard, { data });

		await fireEvent.submit(container.querySelector('form')!);

		await waitFor(() => expect(screen.getByText('Prompt is required')).toBeInTheDocument());
		expect(vi.mocked(capture)).not.toHaveBeenCalled();
	});
});
