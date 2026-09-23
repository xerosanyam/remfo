import { env } from '$env/dynamic/public';
import type { PostHog } from 'posthog-js';

// Lazy singleton: posthog-js (~48KB) is never statically imported anywhere in
// src, so it splits into its own chunk and stays off the critical path. The
// SDK loads once, idle-deferred; every capture/identify just reuses it (or
// triggers the load when called from a post-load user interaction).
let instance: PostHog | null = null;
let inflight: Promise<PostHog | null> | null = null;

function configured(): boolean {
	return (
		!!env.PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() && !!env.PUBLIC_POSTHOG_HOST?.trim()
	);
}

async function load(): Promise<PostHog | null> {
	if (instance) return instance;
	if (!configured()) return null;
	if (!inflight) {
		inflight = import('posthog-js')
			.then(({ default: ph }) => {
				ph.init(env.PUBLIC_POSTHOG_PROJECT_TOKEN, {
					api_host: env.PUBLIC_POSTHOG_HOST,
					defaults: '2026-01-30',
					capture_exceptions: true,
					capture_performance: { web_vitals: true },
					person_profiles: 'identified_only'
				});
				instance = ph;
				return instance;
			})
			.catch(() => null);
	}
	return inflight;
}

// Called from hooks.client.ts init(): fetches the SDK only once the browser
// is idle, so it never competes with FCP/LCP for bandwidth (remfo-zfo).
export function initPostHogIdle(): void {
	if (typeof window === 'undefined' || !configured()) return;
	const start = () => void load();
	if ('requestIdleCallback' in window) {
		(window as Window).requestIdleCallback(start, { timeout: 5000 });
	} else {
		setTimeout(start, 3000);
	}
}

export async function capture(event: string, props?: Record<string, unknown>): Promise<void> {
	const ph = await load();
	ph?.capture(event, props);
}

export async function identify(
	distinctId: string,
	props?: Record<string, unknown>
): Promise<void> {
	const ph = await load();
	ph?.identify(distinctId, props);
}

export async function reset(): Promise<void> {
	const ph = await load();
	ph?.reset();
}

export async function captureException(error: unknown): Promise<void> {
	const ph = await load();
	ph?.captureException(error);
}
