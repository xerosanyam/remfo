import type { Session, User } from "lucia";

import { format } from "date-fns";

// for debugging & simulating real-world delays
export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function sessionExists(locals: App.Locals): locals is App.Locals & { session: Session, user: User } {
	return !!locals?.session?.id && !!locals?.user?.id
}

export function humanReadableDate(date: Date | string) {
	return format(date, 'd MMM').toLowerCase()
}