import type { Session, User } from "lucia";

// for debugging & simulating real-world delays
export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function sessionExists(locals: App.Locals): locals is App.Locals & { session: Session, user: User } {
	return !!locals?.session?.id && !!locals?.user?.id
}

export function humanReadableDate(date: Date) {
	return new Date(date).toLocaleString('en-us', { day: 'numeric', month: 'short', year: 'numeric' })
}