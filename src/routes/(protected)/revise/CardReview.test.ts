import { render, fireEvent, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import CardReview from '$project/components/Cards/CardReview.svelte';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { server } from '$lib/mocks/node';
import { http, HttpResponse } from 'msw';
import { mockCards } from '$lib/mocks/mockData';


beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('CardReview', () => {
	describe('Rendering', () => {
		it('renders correctly with cards', async () => {
			render(CardReview, { cards: mockCards });

			expect(screen.getByText('cards reviewed: 0/2')).toBeInTheDocument();
			expect(screen.getByText('Question 1')).toBeInTheDocument();
			expect(screen.getByText('Question 2')).toBeInTheDocument();
		});

		it('shows "all cards reviewed" message when no cards remain', async () => {
			render(CardReview, { cards: [] });

			expect(screen.getByText(/You have revised all the cards/)).toBeInTheDocument();
		});
	})

	describe('Card Review Functionality', () => {
		it('sends correct requestBody when a card is reviewed', async () => {
			const requestPromise = new Promise((resolve) => {
				server.use(
					http.post('?/review', async ({ request }) => {
						const formData = await request.formData();
						const requestBody = Object.fromEntries(formData)
						resolve(requestBody);
					})
				);
			});
			render(CardReview, { cards: mockCards });
			const easyButton = screen.getAllByText('super easy')[0];
			await fireEvent.click(easyButton);
			await tick()

			const requestBody = await requestPromise;
			expect(requestBody).toEqual({
				cardId: '1',
				difficulty: 'Easy'
			});
		})

		it('updates revised cards count when a card is reviewed', async () => {
			render(CardReview, { cards: mockCards });

			const easyButton = screen.getAllByText('super easy')[0];
			await fireEvent.click(easyButton);

			expect(screen.getByText('cards reviewed: 1/2')).toBeInTheDocument();
			expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
			expect(screen.getByText('Question 2')).toBeInTheDocument();
		});

		it('shows break message after reviewing 5 cards', async () => {
			const manyCards = Array(6).fill(null).map((_, i) => ({
				id: String(i),
				front: `Question ${i}`,
				back: `Answer ${i}`,
				nextPractice: new Date(),
				createdAt: new Date()
			}));

			render(CardReview, { cards: manyCards });

			const easyButtons = screen.getAllByText('super easy');
			for (let i = 0; i < 5; i++) {
				await fireEvent.click(easyButtons[i]);
				await tick();
			}

			expect(screen.getByText(/Hurray. You revised 5 cards. Take a break or keep going./)).toBeInTheDocument();
		});
	})



	describe('Card Deletion', () => {
		it('deletes a card and updates UI correctly', async () => {
			render(CardReview, { cards: mockCards });

			const deleteButton = screen.getAllByTestId('trash')[0];
			await fireEvent.click(deleteButton);

			// Assertions for UI updates after deletion
			expect(screen.getByText('cards reviewed: 1/2')).toBeInTheDocument();
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
	})
});