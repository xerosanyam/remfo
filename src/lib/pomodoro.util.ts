// A pomodoro is a commitment of wall-clock time, so the timer is driven by a deadline rather than
// by an accumulating tick count. Background tabs get their timers throttled and suspended phones
// stop running JS altogether, so anything that counts ticks drifts; subtracting two timestamps
// cannot.

export const POMODORO_SECONDS = 25 * 60;

const RUNNING_KEY = 'pomo:running';
const PENDING_KEY = 'pomo:pending';
const NOTIF_CHOICE_KEY = 'pomo:notifChoice';

/** startedAt is milliseconds (Date.now), duration is seconds. */
export type Running = { startedAt: number; duration: number };

/** Shape the server stores. Seconds throughout, matching the unixepoch columns. */
export type SessionRecord = {
	duration: number;
	startedAt: number;
	endedAt: number;
	completed: boolean;
};

export const deadlineOf = (run: Running) => run.startedAt + run.duration * 1000;

export const secondsLeft = (run: Running, now: number) =>
	Math.max(0, Math.ceil((deadlineOf(run) - now) / 1000));

export const format = (seconds: number) =>
	`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * Close out a running session, whether it was stopped early or ran out while nobody was watching.
 *
 * A deadline already in the past means the wall clock ran out, so the block completed even if the
 * tab was closed or the phone was locked for the last ten minutes of it. Walking away does not
 * rewind time. Abandonment is therefore only ever an explicit Stop, which is also what keeps the
 * data sane: "abandoned after the full 25 minutes" is not a thing that can be true.
 */
export const finish = (run: Running, now: number): SessionRecord => {
	const deadline = deadlineOf(run);
	return {
		duration: run.duration,
		startedAt: Math.floor(run.startedAt / 1000),
		endedAt: Math.floor(Math.min(now, deadline) / 1000),
		completed: now >= deadline
	};
};

// localStorage throws outright in some privacy modes rather than just coming back empty, and a
// timer that cannot remember itself is still a usable timer, so every access degrades to null.
const read = <T>(key: string): T | null => {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : null;
	} catch {
		return null;
	}
};

const write = (key: string, value: unknown) => {
	try {
		if (value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// nothing to do: the session is lost, the timer keeps working
	}
};

export const readRunning = () => read<Running>(RUNNING_KEY);
export const writeRunning = (run: Running | null) => write(RUNNING_KEY, run);

/**
 * Sessions run while logged out, or that failed to reach the server, wait here until there is an
 * account to attach them to. Claiming them is remfo-e4k.5.
 */
export const readPending = () => read<SessionRecord[]>(PENDING_KEY) ?? [];
export const addPending = (record: SessionRecord) => write(PENDING_KEY, [...readPending(), record]);

/** The user's standing answer to "notify me when the timer finishes?" - null until first asked. */
export const readNotifChoice = () => read<boolean>(NOTIF_CHOICE_KEY);
export const writeNotifChoice = (choice: boolean | null) => write(NOTIF_CHOICE_KEY, choice);
