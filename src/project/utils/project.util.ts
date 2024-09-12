import type { Session, User } from "lucia";

export const ROUTES = {
	'LOGIN': '/',
	'LOGOUT': '/logout',
	'HOME': '/record',
	'PRICING': '/pricing',
	'RECORD': '/record',
	'ALL': '/all',
	'LEARN': '/learn',
	'REVISE': '/revise',
}


export function sessionExists(locals: App.Locals): locals is App.Locals & { session: Session, user: User } {
	return !!locals?.session?.id && !!locals?.user?.id
}
