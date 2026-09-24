import { render, screen, waitFor } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/dom';
import { stringify } from 'devalue';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { server } from '../../../mocks/node';
import { http, HttpResponse } from 'msw';

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(async () => undefined),
	invalidate: vi.fn(async () => undefined),
	goto: vi.fn(async () => undefined)
}));

// Headless deserialize needs the client decoder table; same block lives in the record and
// learn form tests, change all three in lockstep. Pinned to kit version by bun.lock.
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

const data = { data: { front: '', back: '' }, errors: {} } as never;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
	server.resetHandlers();
	vi.clearAllMocks();
});

describe('home AddNewCard submit path', () => {
	it('keeps prefilled values from props for the /learn reuse', () => {
		const { container } = render(AddNewCard, {
			data: { data: { front: 'Capital of Ukraine?', back: 'Kyiv' }, errors: {} } as never,
			action: '/learn?/add'
		});

		expect((container.querySelector('#question') as HTMLTextAreaElement).value).toBe(
			'Capital of Ukraine?'
		);
		expect((container.querySelector('#answer') as HTMLTextAreaElement).value).toBe('Kyiv');
	});

	it('posts to the given action, notifies and refreshes on success', async () => {
		const bodies: Record<string, string>[] = [];
		server.use(
			http.post('/learn', async ({ request }) => {
				bodies.push(Object.fromEntries(await request.formData()) as Record<string, string>);
				return actionResult('success', 200, {});
			})
		);
		const submitted: string[] = [];
		const { container } = render(AddNewCard, {
			data,
			action: '/learn?/add',
			onSubmit: (question: string) => {
				submitted.push(question);
			}
		});
		await fireEvent.change(container.querySelector('#question')!, { target: { value: 'q?' } });
		await fireEvent.change(container.querySelector('#answer')!, { target: { value: 'a!' } });

		await fireEvent.submit(container.querySelector('form')!);

		await waitFor(() => expect(bodies).toHaveLength(1));
		expect(bodies[0]).toMatchObject({ front: 'q?', back: 'a!' });
		expect(submitted).toEqual(['q?']);
		await waitFor(() =>
			expect(vi.mocked(capture)).toHaveBeenCalledWith('flashcard_created', {
				entry_point: 'learning'
			})
		);
		expect(vi.mocked(invalidateAll)).toHaveBeenCalled();
	});

	it('renders server validation errors without reporting creation', async () => {
		server.use(
			http.post('/learn', async () =>
				actionResult('failure', 400, {
					form: { errors: { back: ['Back is required'] } }
				})
			)
		);
		const { container } = render(AddNewCard, { data, action: '/learn?/add' });

		await fireEvent.submit(container.querySelector('form')!);

		await waitFor(() => expect(screen.getByText('Back is required')).toBeInTheDocument());
		expect(vi.mocked(capture)).not.toHaveBeenCalled();
	});
});
