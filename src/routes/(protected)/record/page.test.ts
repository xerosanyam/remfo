import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
const pageData = () => ({ addForm }) as unknown as PageData;

// The shell is prerendered; the list arrives via /api/cards on mount.
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

const serveCards = (cards: CardEssentials[], totalCards: number) =>
	fetchMock.mockResolvedValue(
		new Response(JSON.stringify({ cards, totalCards }), {
			status: 200,
			headers: { 'content-type': 'application/json' }
		})
	);

beforeEach(() => {
	fetchMock.mockReset();
	// createdAt serializes to string over the wire; the grouping only formats it.
	serveCards([], 0);
});

// These render against a resolved island fetch, so only the settled branches are reachable
// here; the skeleton is covered by holding SLOW_DB_BY_MS and looking.
describe('record page card list', () => {
	it('shows the Anki save shortcut on hover', () => {
		render(RecordPage, { data: pageData() });

		for (const button of screen.getAllByRole('button', { name: 'save' })) {
			expect(button).toHaveAttribute('title', 'shortcut: Ctrl/Command+Enter');
		}
	});

	it('renders the cards the load resolved', async () => {
		serveCards([card('1', 'first question')], 1);
		render(RecordPage, { data: pageData() });

		expect(await screen.findByText('first question')).toBeInTheDocument();
		expect(screen.queryByText('could not load your cards.')).not.toBeInTheDocument();
	});

	it('sets questions apart from answers', async () => {
		serveCards([card('1', 'first question')], 1);
		render(RecordPage, { data: pageData() });

		// Scoped by text: the add form reuses the same ids on its own fields.
		expect((await screen.findByText('first question')).className).toContain('text-foreground');
		expect(screen.getByText('answer 1').className).toContain('text-sm');
	});

	it('shows each date group under an inline header, with no absolute rail', async () => {
		serveCards([card('1', 'first question')], 1);
		const { container } = render(RecordPage, { data: pageData() });

		await screen.findByText('first question');
		const headers = container.querySelectorAll('h2');
		expect(headers).toHaveLength(1);
		expect(container.innerHTML).not.toMatch(/-left-\d/);
	});

	it('renders one subtle delete control per card with no hover stains', async () => {
		serveCards([card('1', 'first question')], 1);
		render(RecordPage, { data: pageData() });

		const row = (await screen.findByText('first question')).closest('div[title]') as HTMLElement;
		expect(row.className).not.toMatch(/hover:|min-h-16/);
		expect(row.querySelectorAll('form[action="/api/card-actions?/delete"]')).toHaveLength(1);
		expect(row.querySelector('button')?.className).toContain('opacity-60');
	});

	// a failed load must not take the whole page down: the add-card form still works
	it('shows a message, and keeps the add form, when the load failed', async () => {
		fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));
		render(RecordPage, { data: pageData() });

		expect(await screen.findByText('could not load your cards.')).toBeInTheDocument();
		expect(document.querySelector('form')).toBeInTheDocument();
	});

	it('shows an empty state instead of a blank page when there are no cards', async () => {
		render(RecordPage, { data: pageData() });

		expect(await screen.findByText('nothing here yet')).toBeInTheDocument();
		expect(document.querySelector('form')).toBeInTheDocument();
	});
});
