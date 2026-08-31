import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
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

const pending = () => new Promise<never>(() => {});

// PageData also carries user and deviceType from the root layout load. This page reads
// neither, so the fixture leaves them off and casts.
type StreamedCards = Promise<{ cards: CardEssentials[]; totalCards: number }>;
const pageData = (cards: StreamedCards) => ({ addForm, limit: 50, cards }) as unknown as PageData;

describe('record page card streaming', () => {
	it('shows the pending placeholder on first load, before anything has resolved', async () => {
		render(RecordPage, { data: pageData(pending()) });
		await tick();

		expect(screen.getByText('loading cards...')).toBeInTheDocument();
	});

	it('renders the cards once the streamed promise resolves', async () => {
		render(RecordPage, {
			data: pageData(Promise.resolve({ cards: [card('1', 'first question')], totalCards: 1 }))
		});
		await tick();
		await tick();

		expect(screen.getByText('first question')).toBeInTheDocument();
		expect(screen.queryByText('loading cards...')).not.toBeInTheDocument();
	});

	// the regression this cache exists for: deleting a card re-runs load and hands us a new
	// pending promise, which must not blank the list back to the placeholder
	it('keeps the previous list on screen while a reload is in flight', async () => {
		const { rerender } = render(RecordPage, {
			data: pageData(Promise.resolve({ cards: [card('1', 'first question')], totalCards: 1 }))
		});
		await tick();
		await tick();
		expect(screen.getByText('first question')).toBeInTheDocument();

		await rerender({ data: pageData(pending()) });
		await tick();

		expect(screen.getByText('first question')).toBeInTheDocument();
		expect(screen.queryByText('loading cards...')).not.toBeInTheDocument();
	});

	it('shows an error message when the streamed promise rejects', async () => {
		render(RecordPage, { data: pageData(Promise.reject(new Error('turso is down'))) });
		await tick();
		await tick();

		expect(screen.getByText('could not load your cards.')).toBeInTheDocument();
	});
});
