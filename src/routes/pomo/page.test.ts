import { render, screen } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/dom';
import { beforeEach, describe, expect, it } from 'vitest';

import PomoPage from './+page.svelte';

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

beforeEach(() => localStorage.clear());

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
});
