import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// kit >=2.27.2's client runtime reads this at module scope (normally injected by the
// sveltekit() vite plugin's dev/build define) as soon as a component under test
// transitively imports $app/stores or $app/forms. https://github.com/sveltejs/kit/issues/14143
vi.stubGlobal('__SVELTEKIT_PAYLOAD__', { data: null });
