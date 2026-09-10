import type { HandleClientError } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import posthog from 'posthog-js';

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

	posthog.init(PUBLIC_POSTHOG_PROJECT_TOKEN, {
		api_host: PUBLIC_POSTHOG_HOST,
		defaults: '2026-01-30',
		capture_exceptions: true
	});
}

export const handleError: HandleClientError = ({ error, status, message }) => {
	if (PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() && PUBLIC_POSTHOG_HOST?.trim()) {
		posthog.captureException(error);
	}

	return { message, status };
};
