import { render, screen, waitFor } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/dom';
import { stringify } from 'devalue';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '../../../mocks/node';
import { http, HttpResponse } from 'msw';

// update() inside the enhance callback hits SvelteKit's invalidateAll, which needs a
// router. Headless there is none, so it is stubbed; the request/response round trip --
// the thing this file exists to prove -- still runs for real through MSW.
vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(async () => undefined),
	invalidate: vi.fn(async () => undefined),
	goto: vi.fn(async () => undefined)
}));

// enhance deserializes action payloads with devalue using the SvelteKit client's decoders,
// which only exist after the client runtime initializes. Headless there is no client, so
// any payload WITH data throws before the result callback runs (payloads without data are
// why the existing MSW tests never hit this). Our plain-object payloads need no revivers,
// so an empty decoder table is faithful. Pinned to the installed kit version by bun.lock.
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

import AddNewCard from './AddNewCard.svelte';
import { invalidateAll } from '$app/navigation';
import { capture } from '$lib/posthog';

const actionResult = (type: string, status: number, data: unknown) =>
	HttpResponse.text(JSON.stringify({ type, status, data: stringify(data) }), { status });

const formData = { data: { front: '', back: '' }, errors: {} } as never;
const alertMock = vi.fn();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(() => vi.stubGlobal('alert', alertMock));
afterEach(() => {
	server.resetHandlers();
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

describe('record AddNewCard submit path', () => {
	it('renders initial values and constraint attributes without the superforms runtime', () => {
		const { container } = render(AddNewCard, {
			formData: { data: { front: 'q?', back: 'a!' }, errors: {} } as never
		});

		const question = container.querySelector('#question') as HTMLTextAreaElement;
		const answer = container.querySelector('#answer') as HTMLTextAreaElement;
		expect(question.value).toBe('q?');
		expect(answer.value).toBe('a!');
		for (const area of [question, answer]) {
			expect(area).toHaveAttribute('required');
			expect(area).toHaveAttribute('maxlength', '2000');
		}
		// One docked save button at every width, never the old mobile/desktop pair.
		expect(container.querySelectorAll('button[type="submit"]')).toHaveLength(1);
		// Fields stay labelled once filled: placeholders vanish while typing.
		expect(container.querySelector('label[for="question"]')).toHaveTextContent('question');
		expect(container.querySelector('label[for="answer"]')).toHaveTextContent('answer');
	});

	it('posts the card and reports creation on success', async () => {
		const bodies: Record<string, string>[] = [];
		server.use(
			http.post('/record', async ({ request }) => {
				bodies.push(Object.fromEntries(await request.formData()) as Record<string, string>);
				return actionResult('success', 200, {});
			})
		);
		const { container } = render(AddNewCard, { formData });
		await fireEvent.change(container.querySelector('#question')!, { target: { value: 'q?' } });
		await fireEvent.change(container.querySelector('#answer')!, { target: { value: 'a!' } });

		await fireEvent.submit(container.querySelector('form')!);

		await waitFor(() => expect(bodies).toHaveLength(1));
		expect(bodies[0]).toMatchObject({ front: 'q?', back: 'a!' });
		await waitFor(() =>
			expect(vi.mocked(capture)).toHaveBeenCalledWith('flashcard_created', {
				entry_point: 'record'
			})
		);
		expect(vi.mocked(invalidateAll)).toHaveBeenCalled();
		expect(screen.queryByText(/unable to save/)).not.toBeInTheDocument();
	});

	it('renders server validation errors and stays silent on analytics when rejected', async () => {
		server.use(
			http.post('/record', async () =>
				actionResult('failure', 400, {
					form: { errors: { front: ['Front is required'] } }
				})
			)
		);
		const { container } = render(AddNewCard, { formData });

		await fireEvent.submit(container.querySelector('form')!);

		await waitFor(() => expect(screen.getByText('Front is required')).toBeInTheDocument());
		expect(vi.mocked(capture)).not.toHaveBeenCalled();
		expect(alertMock).toHaveBeenCalled();
	});
});
