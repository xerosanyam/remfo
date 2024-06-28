<script lang="ts">
	import { enhance } from '$app/forms';
	import { humanReadableDate } from '$lib/common.util';
	import type { CardEssentials } from '$lib/types/Card';
	import type { ActionResult } from '@sveltejs/kit';
	import { format } from 'date-fns';
	import MyStar from '~icons/arcticons/mykyivstar';
	import Trash from '~icons/arcticons/trashcan';

	export let cards: CardEssentials[];
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
			if (result.type === 'error' || result.type === 'failure') {
				alert('unable to delete.');
			}
			modifyingCardId = '';
			update();
		};
	};
</script>

{#if cards.length > 0}
	{#each dates as date (date)}
		<div class="relative mx-auto mt-8 max-w-lg space-y-4 rounded-lg">
			<div class="absolute -left-14 z-10 w-12 bg-white py-2 text-center" title={date}>
				{humanReadableDate(groupedCards[date][0].createdAt)}
			</div>
			<div class="absolute -left-8 h-full border-r"></div>
			{#each groupedCards[date] as card (card.id)}
				<div
					class="group relative min-h-16 rounded-sm border-white px-4 py-2 hover:bg-gray-100"
					title={String(card.createdAt)}
				>
					<div class={`space-y-2 ${modifyingCardId === card.id ? 'blur-sm' : ''}`}>
						<div class="flex space-x-2">
							<div>
								<MyStar style="" />
							</div>
							<div class="flex w-full flex-col">
								<div
									class="flex w-full whitespace-break-spaces italic text-gray-600 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									id="question"
									placeholder="Capital of Paris?"
									data-gramm="false"
								>
									{card.front}
								</div>
								<div
									class="flex w-full whitespace-break-spaces border-gray-300 text-gray-500 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									id="answer"
									placeholder="France"
									data-gramm="false"
								>
									{card.back}
								</div>
								<div class="flex justify-end px-2 sm:hidden">
									<form method="post" action="?/delete" use:enhance={customEnhance}>
										<input type="hidden" name="cardId" value={card.id} />
										<button
											class="flex items-center space-x-1 rounded-md border px-4 py-2 text-gray-900 disabled:pointer-events-none disabled:opacity-50"
											disabled={modifyingCardId === card.id}
											type="submit"><Trash style="stroke-width:2px;" /></button
										>
									</form>
								</div>
							</div>
						</div>
					</div>
					<div
						class="absolute -right-28 bottom-0 hidden h-full flex-col-reverse px-2 opacity-0 group-hover:opacity-100 sm:flex"
					>
						<form method="post" action="?/delete" use:enhance={customEnhance}>
							<input type="hidden" name="cardId" value={card.id} />
							<button
								class="flex items-center space-x-1 rounded-md border bg-gray-800 px-4 py-2 text-white disabled:pointer-events-none disabled:opacity-50"
								disabled={modifyingCardId === card.id}
								type="submit"><Trash style="stroke-width:2px;" /><span>delete</span></button
							>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/each}
	<div class="pb-10 pt-24 text-center text-sm text-gray-400">total cards: {cards.length}</div>
{/if}
