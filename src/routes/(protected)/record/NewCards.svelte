<script lang="ts">
	import { enhance } from '$app/forms';
	import { humanReadableDate } from '$lib/common.util';
	import type { CardEssentials } from '$lib/types/Card';
	import type { ActionResult } from '@sveltejs/kit';
	import { format } from 'date-fns';
	import Trash from '~icons/arcticons/trashcan';
	import { capture } from '$lib/posthog';

	export let cards: CardEssentials[];
	export let totalCards: number;
	export let limit: number;
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

	const customEnhance = ({ formData }: { formData: FormData }) => {
		const tCardId = formData.get('cardId') as string;
		modifyingCardId = tCardId;
		return ({ result, update }: { result: ActionResult; update: () => void }) => {
			if (result.type === 'success') {
				void capture('flashcard_deleted');
			} else if (result.type === 'error' || result.type === 'failure') {
				alert('unable to delete.');
			}
			modifyingCardId = '';
			update();
		};
	};
</script>

{#if cards.length > 0}
	{#each dates as date (date)}
		<div class="mx-auto mt-8 max-w-lg space-y-4 rounded-lg">
			<h2
				class="px-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400"
				title={date}
			>
				{humanReadableDate(groupedCards[date][0].createdAt)}
			</h2>
			{#each groupedCards[date] as card (card.id)}
				<div class="relative rounded-sm px-2 py-1" title={String(card.createdAt)}>
					<div class={`space-y-2 ${modifyingCardId === card.id ? 'blur-sm' : ''}`}>
						<div class="flex w-full flex-col">
							<div
								class="flex w-full whitespace-break-spaces font-medium leading-relaxed text-slate-900 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-teal-300"
								id="question"
								placeholder="Capital of Paris?"
								data-gramm="false"
							>
								{card.front}
							</div>
							<div
								class="flex w-full whitespace-break-spaces border-slate-200 text-sm leading-relaxed text-slate-500 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-teal-300"
								id="answer"
								placeholder="France"
								data-gramm="false"
							>
								{card.back}
							</div>
							<div class="flex justify-end px-2">
								<form method="post" action="?/delete" use:enhance={customEnhance}>
									<input type="hidden" hidden name="cardId" value={card.id} />
									<button
										class="flex items-center space-x-1 rounded-md border border-slate-200 px-4 py-2 opacity-60 hover:opacity-100 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700"
										disabled={modifyingCardId === card.id}
										aria-label="delete card"
										type="submit"><Trash style="stroke-width:2px;" /></button
									>
								</form>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/each}
	<div class="space-y-4 pb-10 pt-24 text-center text-sm text-slate-500 dark:text-slate-300">
		{#if cards.length < totalCards}
			<div>
				<a
					href="?limit={limit + 50}"
					data-sveltekit-noscroll
					class="rounded-md border border-slate-200 px-4 py-2 text-slate-950 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-violet-900"
					>load more</a
				>
			</div>
		{/if}
		<div>showing {cards.length} of {totalCards} cards</div>
	</div>
{/if}
