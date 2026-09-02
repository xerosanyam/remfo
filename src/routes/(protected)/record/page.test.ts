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
	it('renders the cards the load resolved', () => {
		render(RecordPage, {
			data: pageData({ cards: [card('1', 'first question')], totalCards: 1 })
		});

		expect(screen.getByText('first question')).toBeInTheDocument();
		expect(screen.queryByText('could not load your cards.')).not.toBeInTheDocument();
	});

	// a failed load must not take the whole page down: the add-card form still works
	it('shows a message, and keeps the add form, when the load failed', () => {
		render(RecordPage, { data: pageData(null) });

		expect(screen.getByText('could not load your cards.')).toBeInTheDocument();
		expect(document.querySelector('form')).toBeInTheDocument();
	});
});
