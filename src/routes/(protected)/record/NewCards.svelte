<script lang="ts">
	import { enhance } from '$app/forms';
	import { humanReadableDate } from '$lib/common.util';
	import type { CardEssentials } from '$lib/types/Card';
	import type { ActionResult } from '@sveltejs/kit';
	import { format } from 'date-fns';
	import Trash from '~icons/lucide/trash-2';
	import { Button } from '$lib/components/ui/button';
	import { capture } from '$lib/posthog';

	export let cards: CardEssentials[];
	export let totalCards: number;
	export let limit: number;

	// Callback prop, not createEventDispatcher (deprecated in Svelte 5).
	export let ondeleted: (detail: { cardId: string }) => void = () => {};
	let groupedCards: { [key: string]: CardEssentials[] } = {};
	let dates: string[] = [];

	$: {
		groupedCards = cards.reduce((groups: { [key: string]: CardEssentials[] }, card) => {
			// Convert `createdAt` to a date string without the time
			const date = format(card.createdAt, 'P');

			// If this date isn't in the groups yet, add it
			if (!groups[date]) {
				groups[date] = [];
			}

			// Add this card to the group for this date
			groups[date].push(card);

			return groups;
		}, {});
		dates = Object.keys(groupedCards);
		dates = dates.sort((b, a) => new Date(a).getTime() - new Date(b).getTime());
	}

	let modifyingCardId = '';

	// Cross-route action like AddNewCard: the row drops locally on redirect.
	const customEnhance = ({ formData }: { formData: FormData }) => {
		const tCardId = formData.get('cardId') as string;
		modifyingCardId = tCardId;
		return ({ result, update }: { result: ActionResult; update: () => void }) => {
			if (result.type === 'redirect') {
				ondeleted({ cardId: tCardId });
				void capture('flashcard_deleted');
			} else if (result.type === 'error' || result.type === 'failure') {
				alert('unable to delete.');
				update();
			}
			modifyingCardId = '';
		};
	};
</script>

{#if cards.length > 0}
	{#each dates as date (date)}
		<div class="mx-auto mt-8 max-w-lg space-y-4 rounded-lg">
			<h2
				class="text-muted-foreground px-2 text-xs font-medium tracking-wider uppercase"
				title={date}
			>
				{humanReadableDate(groupedCards[date][0].createdAt)}
			</h2>
			{#each groupedCards[date] as card (card.id)}
				<div class="relative rounded-xs px-2 py-1" title={String(card.createdAt)}>
					<div class={`space-y-2 ${modifyingCardId === card.id ? 'blur-xs' : ''}`}>
						<div class="flex w-full flex-col">
							<div
								class="text-foreground flex w-full leading-relaxed font-medium whitespace-break-spaces"
								placeholder="Capital of Paris?"
								data-gramm="false"
							>
								{card.front}
							</div>
							<div
								class="text-muted-foreground flex w-full text-sm leading-relaxed whitespace-break-spaces"
								placeholder="France"
								data-gramm="false"
							>
								{card.back}
							</div>
							<div class="flex justify-end px-2">
								<form method="post" action="/api/card-actions?/delete" use:enhance={customEnhance}>
									<input type="hidden" hidden name="cardId" value={card.id} />
									<Button
										variant="outline"
										class="opacity-60 hover:opacity-100"
										disabled={modifyingCardId === card.id}
										aria-label="delete card"
										type="submit"><Trash data-icon="inline-start" /></Button
									>
								</form>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/each}
	<div class="text-muted-foreground space-y-4 pt-24 pb-10 text-center text-sm">
		{#if cards.length < totalCards}
			<div>
				<a
					href="?limit={limit + 50}"
					data-sveltekit-noscroll
					class="border-border text-foreground hover:bg-muted rounded-md border px-4 py-2"
					>load more</a
				>
			</div>
		{/if}
		<div>showing {cards.length} of {totalCards} cards</div>
	</div>
{/if}
