import { cleanup, render, screen } from '@testing-library/svelte';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Card from '$lib/components/Cards/Card.svelte';
import { cardAddSchema } from '$lib/schemas';
import AddNewCard from '../record/AddNewCard.svelte';

vi.mock('$app/forms', async (importOriginal) => ({
	...((await importOriginal()) as Record<string, unknown>),
	enhance: () => {},
	applyAction: () => {}
}));

const card = {
	id: '1',
	front: 'Question',
	back: 'Answer',
	nextPractice: new Date(),
	createdAt: new Date()
};

afterEach(cleanup);

const renderCard = () => {
	render(Card, { card, customEnhance: () => {}, modifyingCardId: '' });
	const submissions: string[] = [];
	const form = document.querySelector('form[action="?/review"]') as HTMLFormElement;
	form.addEventListener(
		'submit',
		(event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			submissions.push(((event as SubmitEvent).submitter as HTMLButtonElement).value);
		},
		{ capture: true }
	);
	return {
		disclosure: document.querySelector('details#answer') as HTMLDetailsElement,
		submissions
	};
};

describe('Anki shortcuts in Chromium', () => {
	it('gates and maps number-row and numpad rating keys', async () => {
		const { disclosure, submissions } = renderCard();
		const ratings = ['Challenging', 'Hard', 'Good', 'Easy'];

		for (const key of ['1', '2', '3', '4']) await userEvent.keyboard(key);
		expect(submissions).toEqual([]);

		await userEvent.keyboard('{Space}');
		expect(disclosure.open).toBe(true);

		for (const key of ['1', '2', '3', '4']) await userEvent.keyboard(key);
		expect(submissions).toEqual(ratings);

		submissions.length = 0;
		for (const key of ['1', '2', '3', '4']) {
			window.dispatchEvent(
				new KeyboardEvent('keydown', {
					key,
					code: `Numpad${key}`,
					location: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD,
					cancelable: true
				})
			);
		}
		expect(submissions).toEqual(ratings);

		const hard = screen.getByRole('button', { name: 'difficult' });
		await userEvent.hover(hard);
		expect(hard).toHaveAttribute('title', 'shortcut: 2');
	});

	it.each([
		['Space', '{Space}', ' ', 'Space'],
		['Return', '{Enter}', 'Enter', 'Enter'],
		['numpad Enter', '{NumpadEnter}', 'Enter', 'NumpadEnter']
	])('reveals with %s, then defaults to Good', async (_, shortcut, key, code) => {
		const { disclosure, submissions } = renderCard();
		const observed: { key: string; code: string }[] = [];
		window.addEventListener(
			'keydown',
			(event) => observed.push({ key: event.key, code: event.code }),
			{
				once: true
			}
		);

		await userEvent.keyboard(shortcut);
		expect(observed).toEqual([{ key, code }]);
		expect(disclosure.open).toBe(true);
		await userEvent.keyboard(shortcut);
		expect(submissions).toEqual(['Good']);
	});

	it('activates a focused answer button instead of Good', async () => {
		const { submissions } = renderCard();
		await userEvent.keyboard('{Space}');
		const easy = screen.getByRole('button', { name: 'super easy' });
		easy.focus();

		await userEvent.keyboard('{Enter}');

		expect(submissions).toEqual(['Easy']);
	});

	it('keeps native record traversal and Ctrl or Command plus Enter submission', async () => {
		const formData = await superValidate(zod(cardAddSchema));
		render(AddNewCard, { formData });
		const [front, back] = screen.getAllByRole('textbox') as HTMLTextAreaElement[];
		const submissions: string[] = [];
		const form = front.form as HTMLFormElement;
		form.addEventListener(
			'submit',
			(event) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				submissions.push('submitted');
			},
			{ capture: true }
		);

		front.focus();
		await userEvent.tab();
		expect(back).toHaveFocus();
		await userEvent.tab({ shift: true });
		expect(front).toHaveFocus();

		await userEvent.fill(front, 'Question');
		await userEvent.fill(back, 'Answer');
		await userEvent.keyboard('{Control>}{Enter}{/Control}');
		await userEvent.keyboard('{Meta>}{Enter}{/Meta}');

		expect(submissions).toEqual(['submitted', 'submitted']);
		for (const save of screen.getAllByRole('button', { name: 'save' })) {
			await userEvent.hover(save);
			expect(save).toHaveAttribute('title', 'shortcut: Ctrl/Command+Enter');
		}
	});
});
