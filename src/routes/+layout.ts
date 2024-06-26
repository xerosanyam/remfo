import { dev } from '$app/environment';
import { inject } from '@vercel/analytics';

inject({ mode: dev ? 'development' : 'production' });

import posthog from 'posthog-js'
import { browser } from '$app/environment';

export const load = async () => {

	if (browser) {
		posthog.init(
			'phc_9926SwyRC8yPRYf8le7laIwsnf1ygzhp3TtwXpYJ8Eq',
			{
				api_host: 'https://us.i.posthog.com',
				person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
			}
		)
	}
	return
};