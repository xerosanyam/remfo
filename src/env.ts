import { defineEnvVars } from '@sveltejs/kit/env';

// Empty analytics values disable the SDK; an empty diagnostic delay means no DB slowdown.
export const variables = defineEnvVars({
	TURSO_AUTH_TOKEN: { static: true },
	TURSO_CONNECTION_URL: { static: true },
	GOOGLE_DEVICE_CLIENT_ID: { static: true },
	GOOGLE_DEVICE_CLIENT_SECRET: { static: true },
	PUBLIC_POSTHOG_PROJECT_TOKEN: { public: true, schema: (input) => input ?? '' },
	PUBLIC_POSTHOG_HOST: { public: true, schema: (input) => input ?? '' },
	OPENAI_API_KEY: { static: true },
	GOOGLE_CLIENT_ID: { static: true },
	GOOGLE_CLIENT_SECRET: { static: true },
	REDIRECT_URI: { static: true },
	SLOW_DB_BY_MS: { schema: (input) => input ?? '' }
});
