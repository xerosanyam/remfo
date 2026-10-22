import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { init_transport } from './node_modules/@sveltejs/kit/src/runtime/app/internal/transport.js';

// Component tests do not boot the router, which normally sets the payload and transport.
vi.stubGlobal('__SVELTEKIT_PAYLOAD__', { data: null });
init_transport({});

// Empty strings disable analytics in component tests.
vi.mock('$app/env/public', () => ({
	PUBLIC_POSTHOG_PROJECT_TOKEN: '',
	PUBLIC_POSTHOG_HOST: ''
}));
