import { render, screen } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

vi.mock('$lib/posthog', () => ({
	capture: vi.fn(async () => undefined),
	identify: vi.fn(async () => undefined),
	reset: vi.fn(async () => undefined),
	captureException: vi.fn(async () => undefined)
}));

import PomoPage from './+page.svelte';
import { capture } from '$lib/posthog';

// The pure timer maths lives in pomodoro.util.test.ts. What is only provable here is the wiring:
// that a session left in storage is picked back up on load, and that stopping one does not lose it.
const seedRunning = (startedMinutesAgo: number) =>
	localStorage.setItem(
		'pomo:running',
		JSON.stringify({ startedAt: Date.now() - startedMinutesAgo * 60_000, duration: 1500 })
	);

const pending = () => JSON.parse(localStorage.getItem('pomo:pending') ?? '[]');

// Signed out on purpose: the page then buffers locally instead of posting, so nothing here
// depends on a fetch, and the buffer is exactly what remfo-e4k.5 will claim.
const data = { user: null } as never;

// /api/me answers the session lookup the prerendered shell fires on mount. Signed-out tests
// leave it null; signed-in tests set it before render.
let meUser: unknown = null;

beforeEach(() => {
	localStorage.clear();
	meUser = null;
	vi.unstubAllGlobals();
	vi.stubGlobal('fetch', fetchMock);
	fetchMock.mockReset();
	fetchMock.mockImplementation((url: unknown) =>
		Promise.resolve(
			new Response(url === '/api/me' ? JSON.stringify({ user: meUser }) : '{}', {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		)
	);
	vi.mocked(capture).mockClear();
});

// The shell ships logged-out; tests needing a session wait for /api/me to flip it first.
const renderSignedIn = async () => {
	meUser = { id: 'user-1' };
	render(PomoPage, { data });
	await vi.waitFor(() =>
		expect(screen.queryByText(/kept in this browser/)).not.toBeInTheDocument()
	);
};

describe('pomo page', () => {
	it('offers a fresh 25 minutes when nothing is running', () => {
		render(PomoPage, { data });

		expect(screen.getByRole('timer')).toHaveTextContent('25:00');
		expect(screen.getByRole('button')).toHaveTextContent('start 25 minutes');
	});

	// The reason the deadline is in storage at all: a reload, a second tab, or a browser that was
	// closed mid-session must all come back to the same countdown.
	it('resumes a session left running, counting from the deadline', () => {
		seedRunning(13);

		render(PomoPage, { data });

		expect(screen.getByRole('timer')).toHaveTextContent('12:00');
		expect(screen.getByRole('button')).toHaveTextContent('stop');
	});

	it('posts a stopped session for a signed-in user', async () => {
		seedRunning(13);
		await renderSignedIn();

		await fireEvent.click(screen.getByRole('button'));
		await vi.waitFor(() =>
			expect(fetchMock).toHaveBeenCalledWith(
				'/pomo/record',
				expect.objectContaining({ method: 'POST', headers: { 'content-type': 'application/json' } })
			)
		);

		expect(
			JSON.parse(
				fetchMock.mock.calls.find(([url]) => url === '/pomo/record')?.[1].body as string
			)
		).toMatchObject({ completed: false });
		expect(pending()).toHaveLength(0);
	});

	it('records real elapsed minutes when a session is stopped early', async () => {
		seedRunning(13);
		render(PomoPage, { data });

		await fireEvent.click(screen.getByRole('button'));

		expect(localStorage.getItem('pomo:running')).toBe(null);
		expect(pending()).toHaveLength(1);
		const [record] = pending();
		expect(record.completed).toBe(false);
		expect(record.endedAt - record.startedAt).toBe(13 * 60);
	});

	// Time ran out while the tab was closed. The minutes were spent, so the session completed.
	it('closes out a session whose deadline passed while away', () => {
		seedRunning(40);

		render(PomoPage, { data });

		expect(screen.getByRole('timer')).toHaveTextContent('0:00');
		expect(localStorage.getItem('pomo:running')).toBe(null);
		expect(pending()[0]).toMatchObject({ completed: true });
		expect(pending()[0].endedAt - pending()[0].startedAt).toBe(1500);
	});

	it('reports starting a session', async () => {
		render(PomoPage, { data });

		await fireEvent.click(screen.getByRole('button'));

		await vi.waitFor(() => expect(vi.mocked(capture)).toHaveBeenCalledWith('pomodoro_started'));
	});

	it('reports a recorded session for a signed-in user', async () => {
		seedRunning(13);
		await renderSignedIn();

		await fireEvent.click(screen.getByRole('button'));

		await vi.waitFor(() =>
			expect(vi.mocked(capture)).toHaveBeenCalledWith('pomodoro_session_recorded', {
				completed: false
			})
		);
	});

	it('stays silent when the user declined, even with permission granted', async () => {
		localStorage.setItem('pomo:notifChoice', JSON.stringify(false));
		const constructed: unknown[] = [];
		vi.stubGlobal(
			'Notification',
			class {
				static permission = 'granted';
				constructor(...args: unknown[]) {
					constructed.push(args);
				}
				close() {}
			}
		);
		seedRunning(40);

		render(PomoPage, { data });

		await vi.waitFor(() => expect(pending()).toHaveLength(1));
		expect(constructed).toHaveLength(0);
	});

	it('stops asking when notifications are unavailable', async () => {
		vi.stubGlobal('Notification', undefined);
		render(PomoPage, { data });

		await fireEvent.click(screen.getByRole('button', { name: 'start 25 minutes' }));
		await fireEvent.click(screen.getByRole('button', { name: 'yes' }));

		expect(JSON.parse(localStorage.getItem('pomo:notifChoice') ?? 'null')).toBe(false);
		expect(
			screen.queryByText('let me notify you when the 25 minutes are done?')
		).not.toBeInTheDocument();
	});

	it('still starts the timer when audio setup throws', async () => {
		vi.stubGlobal(
			'AudioContext',
			class {
				constructor() {
					throw new Error('no audio device');
				}
			}
		);
		render(PomoPage, { data });

		await fireEvent.click(screen.getByRole('button', { name: 'start 25 minutes' }));

		expect(screen.getByRole('button', { name: 'stop' })).toBeInTheDocument();
		expect(localStorage.getItem('pomo:running')).not.toBe(null);
	});
});
