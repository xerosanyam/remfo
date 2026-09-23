import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import CardReview from '$lib/components/Cards/CardReview.svelte';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { server } from '../../../mocks/node';
import { http, HttpResponse } from 'msw';
import { mockCards } from '../../../mocks/mockData';

// 'error' rather than the default 'warn': warn also PERFORMS the unhandled request, so a
// mock that stops matching turns into a real socket to localhost:3000 (happy-dom's default
// document origin) that nothing answers. That failed fetch is invisible here, because the
// optimistic UI update in customEnhance lands before the response, so the assertions still
// pass while the request they exist to exercise never happened.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('CardReview', () => {
	describe('Rendering', () => {
		it('renders correctly with cards', async () => {
			render(CardReview, { cards: mockCards });

			expect(screen.getByText('Reviewed: 0/2')).toBeInTheDocument();
			expect(screen.getByText('Question 1')).toBeInTheDocument();
			expect(screen.queryByText('Question 2')).not.toBeInTheDocument();
		});

		it('shows "all cards reviewed" message when no cards remain', async () => {
			render(CardReview, { cards: [] });

			expect(screen.getByText(/You have revised all the cards/)).toBeInTheDocument();
		});
	});

	describe('Answer disclosure', () => {
		// The answer used to be hidden with `blur-md hover:filter-none`, unreachable on a
		// touch/e-ink device and dependent on hover. <details> is the native, JS-free
		// equivalent. happy-dom 14 has no HTMLDetailsElement, so it neither exposes `open`
		// nor toggles on click; native disclosure is the browser's contract, not ours.
		// What is ours, and what these assert: the answer lives inside a <details> behind a
		// <summary>, and the disclosure is rebuilt per card so it cannot stay open.
		const disclosure = () => document.querySelector('details#answer') as HTMLElement;

		it('puts the answer behind a summary rather than a hover-revealed div', async () => {
			render(CardReview, { cards: mockCards });

			expect(disclosure()).toBeInTheDocument();
			expect(disclosure().querySelector('summary')?.textContent?.trim()).toBe('show answer');
			expect(disclosure().textContent).toContain('Answer 1');
			expect(disclosure().hasAttribute('open')).toBe(false);
			expect(disclosure().className).not.toMatch(/blur|hover:filter-none/);
		});

		it('rebuilds the disclosure for the next card so it cannot stay open', async () => {
			render(CardReview, { cards: mockCards });

			// stands in for the user opening it, since happy-dom will not toggle on click
			disclosure().setAttribute('open', '');

			await fireEvent.click(screen.getAllByRole('button', { name: 'super easy' })[0]);
			await tick();

			expect(screen.getByText('Question 2')).toBeInTheDocument();
			expect(disclosure().textContent).toContain('Answer 2');
			expect(disclosure().hasAttribute('open')).toBe(false);
		});

		it('follows Anki reveal state and number mappings', async () => {
			const requests: Record<string, FormDataEntryValue>[] = [];
			server.use(
				http.post('?/review', async ({ request }) => {
					requests.push(Object.fromEntries(await request.formData()));
					return new HttpResponse(null, { status: 200 });
				})
			);
			const cards = Array(5)
				.fill(null)
				.map((_, i) => ({
					id: String(i),
					front: `Question ${i}`,
					back: `Answer ${i}`,
					nextPractice: new Date(),
					createdAt: new Date()
				}));
			render(CardReview, { cards });

			await fireEvent.keyDown(window, { key: '1', code: 'Digit1' });
			expect(screen.getByText('Reviewed: 0/5')).toBeInTheDocument();

			const shortcuts = [
				[{ key: ' ', code: 'Space' }, { key: '1', code: 'Digit1' }, 'Challenging'],
				[{ key: 'Enter', code: 'Enter' }, { key: '2', code: 'Numpad2' }, 'Hard'],
				[{ key: 'Enter', code: 'NumpadEnter' }, { key: '3', code: 'Digit3' }, 'Good'],
				[{ key: ' ', code: 'Space' }, { key: '4', code: 'Numpad4' }, 'Easy']
			] as const;

			for (const [reveal, rate] of shortcuts) {
				await fireEvent.keyDown(window, reveal);
				await tick();
				expect(disclosure()).toHaveAttribute('open');
				await fireEvent.keyDown(window, rate);
				await tick();
			}

			await waitFor(() =>
				expect(requests.map(({ difficulty }) => difficulty)).toEqual(
					shortcuts.map(([, , difficulty]) => difficulty)
				)
			);
			expect(screen.getByText('Reviewed: 4/5')).toBeInTheDocument();
		});

		it('uses Good after reveal unless an answer button is focused', async () => {
			const requests: Record<string, FormDataEntryValue>[] = [];
			server.use(
				http.post('?/review', async ({ request }) => {
					requests.push(Object.fromEntries(await request.formData()));
					return new HttpResponse(null, { status: 200 });
				})
			);
			render(CardReview, { cards: mockCards });

			await fireEvent.keyDown(window, { key: ' ', code: 'Space' });
			await fireEvent.keyDown(window, { key: ' ', code: 'Space' });
			await tick();

			await fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });
			const easyButton = screen.getByRole('button', { name: 'super easy' });
			easyButton.focus();
			await fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

			await waitFor(() =>
				expect(requests.map(({ difficulty }) => difficulty)).toEqual(['Good', 'Easy'])
			);
		});

		it('puts shortcut hints in hover titles', () => {
			render(CardReview, { cards: mockCards });

			expect(screen.getByText('show answer')).toHaveAttribute('title', 'shortcut: Space or Enter');
			expect(screen.getByRole('button', { name: 'super difficult' })).toHaveAttribute(
				'title',
				'shortcut: 1'
			);
			expect(screen.getByRole('button', { name: 'super easy' })).toHaveAttribute(
				'title',
				'shortcut: 4'
			);
		});
	});

	describe('Native activation outside the review form', () => {
		// Regression for the shortcut stealing Space/Enter: preventDefault runs before the
		// callback and cannot be undone, so focused trash/summary controls rated the card
		// instead of performing their native click/toggle. happy-dom never performs native
		// activation itself, which is exactly what makes the absence of side effects assertable.
		const answer = () => document.querySelector('details#answer') as HTMLElement;
		it('leaves a focused trash button alone on Space', async () => {
			const requests: Record<string, FormDataEntryValue>[] = [];
			server.use(
				http.post('?/review', async ({ request }) => {
					requests.push(Object.fromEntries(await request.formData()));
					return new HttpResponse(null, { status: 200 });
				})
			);
			render(CardReview, { cards: mockCards });

			const trash = screen.getAllByTestId('trash')[0];
			trash.focus();
			await fireEvent.keyDown(trash, { key: ' ', code: 'Space' });
			await tick();

			expect(requests).toHaveLength(0);
			expect(screen.getByText('Reviewed: 0/2')).toBeInTheDocument();
			expect(answer().hasAttribute('open')).toBe(false);
		});

		it('leaves a focused answer summary alone on Enter', async () => {
			const requests: Record<string, FormDataEntryValue>[] = [];
			server.use(
				http.post('?/review', async ({ request }) => {
					requests.push(Object.fromEntries(await request.formData()));
					return new HttpResponse(null, { status: 200 });
				})
			);
			render(CardReview, { cards: mockCards });

			const summary = answer().querySelector('summary') as HTMLElement;
			summary.focus();
			await fireEvent.keyDown(summary, { key: 'Enter', code: 'Enter' });
			await tick();

			expect(requests).toHaveLength(0);
			expect(screen.getByText('Reviewed: 0/2')).toBeInTheDocument();
			expect(answer().hasAttribute('open')).toBe(false);
		});
	});

	describe('Card Review Functionality', () => {
		it('sends correct requestBody when a card is reviewed', async () => {
			const requestPromise = new Promise((resolve) => {
				server.use(
					http.post('?/review', async ({ request }) => {
						const formData = await request.formData();
						const requestBody = Object.fromEntries(formData);
						resolve(requestBody);
						// returning nothing makes MSW fall through and replay the real request,
						// whose body this handler has already consumed -> ReadableStream is locked
						return new HttpResponse(null, { status: 200 });
					})
				);
			});
			render(CardReview, { cards: mockCards });
			const easyButton = screen.getAllByRole('button', { name: 'super easy' })[0];
			await fireEvent.click(easyButton);
			await tick();

			const requestBody = await requestPromise;
			expect(requestBody).toEqual({
				cardId: '1',
				difficulty: 'Easy'
			});
		});

		it('updates revised cards count when a card is reviewed', async () => {
			render(CardReview, { cards: mockCards });

			const easyButton = screen.getAllByRole('button', { name: 'super easy' })[0];
			await fireEvent.click(easyButton);
			await tick();

			expect(screen.getByText('Reviewed: 1/2')).toBeInTheDocument();
			expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
			expect(screen.getByText('Question 2')).toBeInTheDocument();
		});

		it('shows correct message after reviewing 5 cards', async () => {
			const manyCards = Array(6)
				.fill(null)
				.map((_, i) => ({
					id: String(i),
					front: `Question ${i}`,
					back: `Answer ${i}`,
					nextPractice: new Date(),
					createdAt: new Date()
				}));

			render(CardReview, { cards: manyCards });

			for (let i = 0; i < 5; i++) {
				await fireEvent.click(screen.getByRole('button', { name: 'super easy' }));
				await tick();
			}

			expect(screen.getByText('Reviewed: 5/6')).toBeInTheDocument();
		});
	});

	describe('Card Deletion', () => {
		it('deletes a card and updates UI correctly', async () => {
			render(CardReview, { cards: mockCards });

			const deleteButton = screen.getAllByTestId('trash')[0];
			await fireEvent.click(deleteButton);

			// Assertions for UI updates after deletion
			expect(screen.getByText('Reviewed: 1/2')).toBeInTheDocument();
			expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
			expect(screen.getByText('Question 2')).toBeInTheDocument();
		});

		it('sends correct delete request', async () => {
			const requestPromise = new Promise((resolve) => {
				server.use(
					http.post('?/delete', async ({ request }) => {
						const formData = await request.formData();
						const requestBody = Object.fromEntries(formData);
						resolve(requestBody);
						return new HttpResponse(null, { status: 200 });
					})
				);
			});

			render(CardReview, { cards: mockCards });

			const deleteButton = screen.getAllByTestId('trash')[0];
			await fireEvent.click(deleteButton);

			const requestBody = await requestPromise;

			expect(requestBody).toEqual({
				cardId: '1'
			});
		});
	});
});
