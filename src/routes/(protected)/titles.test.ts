import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import RecordPage from './record/+page.svelte';
import LearnPage from './learn/+page.svelte';
import RevisePage from './revise/+page.svelte';
import MeasurePage from './measure/+page.svelte';

// remfo-jq17: every main page names its tab. Last render wins on document.title,
// so each case asserts immediately after its own render.
describe('protected page titles', () => {
	it('record names its tab', () => {
		render(RecordPage, {
			data: {
				addForm: { data: { front: '', back: '' }, errors: {} },
				cards: null,
				limit: 50
			} as never
		});

		expect(document.title).toBe('Remfo | Record');
	});

	it('learn names its tab', () => {
		render(LearnPage, {
			data: {
				learnForm: { data: { userInput: '' }, errors: {} },
				addForm: { data: { front: '', back: '' }, errors: {} }
			} as never,
			form: null
		});

		expect(document.title).toBe('Remfo | Learn');
	});

	it('revise names its tab', () => {
		render(RevisePage, { data: { cards: [] } as never });

		expect(document.title).toBe('Remfo | Revise');
	});

	it('measure names its tab', () => {
		render(MeasurePage, { data: { reviewedInfo: [], recordedInfo: [] } as never });

		expect(document.title).toBe('Remfo | Measure');
	});
});
