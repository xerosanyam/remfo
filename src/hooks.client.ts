import type { HandleClientError } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { captureException, initPostHogIdle } from '$lib/posthog';

const { PUBLIC_POSTHOG_HOST, PUBLIC_POSTHOG_PROJECT_TOKEN } = env;

export function init() {
	if (!PUBLIC_POSTHOG_PROJECT_TOKEN?.trim()) {
		if (import.meta.env.DEV) {
			throw new Error(
				'PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once PUBLIC_POSTHOG_PROJECT_TOKEN is configured'
			);
		}
		return;
	}

	if (!PUBLIC_POSTHOG_HOST?.trim()) {
		if (import.meta.env.DEV) {
			throw new Error(
				'PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once PUBLIC_POSTHOG_HOST is configured'
			);
		}
		return;
	}

	// Idle-deferred: the SDK loads in its own chunk only once the browser is
	// idle, so it never competes with FCP/LCP for bandwidth (remfo-zfo).
	initPostHogIdle();
}

export const handleError: HandleClientError = ({ error, status, message }) => {
	if (PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() && PUBLIC_POSTHOG_HOST?.trim()) {
		void captureException(error);
	}

	return { message, status };
};
