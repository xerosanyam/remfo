import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// kit >=2.27.2's client runtime reads this at module scope (normally injected by the
// sveltekit() vite plugin's dev/build define) as soon as a component under test
// transitively imports $app/stores or $app/forms. https://github.com/sveltejs/kit/issues/14143
vi.stubGlobal('__SVELTEKIT_PAYLOAD__', { data: null });

// $lib/posthog.ts reads this at module scope, so any component test that
// transitively imports it fails with "Cannot read properties of undefined
// (reading 'env')" without the mock. Empty strings = analytics disabled.
vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_POSTHOG_PROJECT_TOKEN: '', PUBLIC_POSTHOG_HOST: '' }
}));
