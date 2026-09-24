import { describe, expect, it } from 'vitest';
import {
	POMODORO_SECONDS,
	finish,
	format,
	readNotifChoice,
	secondsLeft,
	writeNotifChoice
} from './pomodoro.util';

const START = 1_700_000_000_000;
const run = { startedAt: START, duration: POMODORO_SECONDS };

describe('notif choice', () => {
	it('starts unanswered and remembers the answer', () => {
		expect(readNotifChoice()).toBeNull();
		writeNotifChoice(true);
		expect(readNotifChoice()).toBe(true);
		writeNotifChoice(false);
		expect(readNotifChoice()).toBe(false);
	});
});

describe('secondsLeft', () => {
	it('counts down from the full duration', () => {
		expect(secondsLeft(run, START)).toBe(POMODORO_SECONDS);
		expect(secondsLeft(run, START + 60_000)).toBe(POMODORO_SECONDS - 60);
	});

	// The reason the timer stores a deadline instead of counting ticks: a throttled or suspended
	// tab drops ticks, and this has to survive being away for the whole session.
	it('never goes negative, however long the tab was asleep', () => {
		expect(secondsLeft(run, START + 3 * 60 * 60 * 1000)).toBe(0);
	});
});

describe('finish', () => {
	it('records an explicit stop as an incomplete session with real elapsed time', () => {
		const record = finish(run, START + 12 * 60_000);

		expect(record.completed).toBe(false);
		expect(record.endedAt - record.startedAt).toBe(12 * 60);
	});

	// Coming back to a deadline that has passed means the 25 minutes elapsed, watched or not.
	it('records a deadline that passed while away as completed, ending at the deadline', () => {
		const record = finish(run, START + 90 * 60_000);

		expect(record.completed).toBe(true);
		expect(record.endedAt - record.startedAt).toBe(POMODORO_SECONDS);
	});

	it('stores seconds, not milliseconds', () => {
		expect(finish(run, START).startedAt).toBe(START / 1000);
	});
});

describe('format', () => {
	it('pads seconds', () => {
		expect(format(POMODORO_SECONDS)).toBe('25:00');
		expect(format(61)).toBe('1:01');
		expect(format(0)).toBe('0:00');
	});
});
