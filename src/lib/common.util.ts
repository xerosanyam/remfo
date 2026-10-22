import type { Session, User } from 'lucia';

import { format } from 'date-fns';

// for debugging & simulating real-world delays
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sessionExists(
	locals: App.Locals
): locals is App.Locals & { session: Session; user: User } {
	return !!locals?.session?.id && !!locals?.user?.id;
}

export function humanReadableDate(date: Date | string) {
	return format(date, 'd MMM').toLowerCase();
}

const CARD_PAGE_SIZE = 50;
// a hostile ?limit= would put the whole table back on the page, which is the thing we just fixed
const CARD_MAX_LIMIT = 500;

export function clampCardLimit(requested: number) {
	return Math.min(Math.max(requested || CARD_PAGE_SIZE, CARD_PAGE_SIZE), CARD_MAX_LIMIT);
}
