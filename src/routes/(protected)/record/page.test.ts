import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { cardAddSchema } from '$lib/schemas';
import type { CardEssentials } from '$lib/types/Card';
import RecordPage from './+page.svelte';
import type { PageData } from './$types';

const addForm = await superValidate(zod(cardAddSchema));

const card = (id: string, front: string): CardEssentials => ({
	id,
	front,
	back: `answer ${id}`,
	createdAt: new Date('2026-08-30T10:00:00Z')
});

// PageData also carries user and deviceType from the root layout load. This page reads
// neither, so the fixture leaves them off and casts.
type LoadedCards = { cards: CardEssentials[]; totalCards: number } | null;
const pageData = (cards: LoadedCards) => ({ addForm, limit: 50, cards }) as unknown as PageData;

// The list used to be streamed, with pending and catch branches for the in-flight and
// failed states. It is awaited now, so the load either produced a list or it did not, and
// only those two states can reach this component. The no-JS guard (bun run test:nojs)
// covers the reason for that change, which these unit tests cannot see.
describe('record page card list', () => {
	it('shows the Anki save shortcut on hover', () => {
		render(RecordPage, { data: pageData({ cards: [], totalCards: 0 }) });

		for (const button of screen.getAllByRole('button', { name: 'save' })) {
			expect(button).toHaveAttribute('title', 'shortcut: Ctrl/Command+Enter');
		}
	});

	it('renders the cards the load resolved', () => {
		render(RecordPage, {
			data: pageData({ cards: [card('1', 'first question')], totalCards: 1 })
		});

		expect(screen.getByText('first question')).toBeInTheDocument();
		expect(screen.queryByText('could not load your cards.')).not.toBeInTheDocument();
	});

	it('sets questions apart from answers', () => {
		render(RecordPage, {
			data: pageData({ cards: [card('1', 'first question')], totalCards: 1 })
		});

		// Scoped by text: the add form reuses the same ids on its own fields.
		expect(screen.getByText('first question').className).toContain('text-foreground');
		expect(screen.getByText('answer 1').className).toContain('text-sm');
	});

	it('shows each date group under an inline header, with no absolute rail', () => {
		const { container } = render(RecordPage, {
			data: pageData({ cards: [card('1', 'first question')], totalCards: 1 })
		});

		const headers = container.querySelectorAll('h2');
		expect(headers).toHaveLength(1);
		expect(container.innerHTML).not.toMatch(/-left-\d/);
	});

	it('renders one subtle delete control per card with no hover stains', () => {
		const { container } = render(RecordPage, {
			data: pageData({ cards: [card('1', 'first question')], totalCards: 1 })
		});

		const row = screen.getByText('first question').closest('div[title]') as HTMLElement;
		expect(row.className).not.toMatch(/hover:|min-h-16/);
		expect(row.querySelectorAll('form[action="?/delete"]')).toHaveLength(1);
		expect(row.querySelector('button')?.className).toContain('opacity-60');
	});

	// a failed load must not take the whole page down: the add-card form still works
	it('shows a message, and keeps the add form, when the load failed', () => {
		render(RecordPage, { data: pageData(null) });

		expect(screen.getByText('could not load your cards.')).toBeInTheDocument();
		expect(document.querySelector('form')).toBeInTheDocument();
	});

	it('shows an empty state instead of a blank page when there are no cards', () => {
		render(RecordPage, { data: pageData({ cards: [], totalCards: 0 }) });

		expect(screen.getByText('nothing here yet')).toBeInTheDocument();
		expect(document.querySelector('form')).toBeInTheDocument();
	});
});
