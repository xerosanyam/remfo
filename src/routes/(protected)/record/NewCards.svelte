<script lang="ts">
	import { enhance } from '$app/forms';
	import { humanReadableDate } from '$lib/common.util';
	import type { Card, CardEssentials } from '$lib/types/Card';
	import MyStar from '~icons/arcticons/mykyivstar';
	import Trash from '~icons/arcticons/trashcan';

	export let cards: Card[];
	let groupedCards: { [key: string]: Card[] } = {};
	let dates: string[] = [];

	$: {
		groupedCards = cards.reduce((groups: { [key: string]: Card[] }, card) => {
			// Convert `createdAt` to a date string without the time
			const date = new Date(card.createdAt).toISOString().split('T')[0];

			// If this date isn't in the groups yet, add it
			if (!groups[date]) {
				groups[date] = [];
			}

			// Add this card to the group for this date
			groups[date].push(card);

			return groups;
		}, {});
		dates = Object.keys(groupedCards);
	}

	let modifyingCardId = '';

	const customEnhance = ({ formData }: { formData: FormData }) => {
		const tCardId = formData.get('id') as string;
		modifyingCardId = tCardId;
		return ({ update }: { update: () => void }) => {
			modifyingCardId = '';
			update();
		};
	};
	let card: CardEssentials = {
		id: '1',
		front: '',
		back: '',
		createdAt: new Date(),
		updatedAt: new Date()
	};
</script>

{#if cards.length > 0}
	{#each dates as date (date)}
		<div class="relative mx-auto mt-8 max-w-lg space-y-4 rounded-lg text-sm">
			<div class="absolute -left-16 z-10 bg-white py-2">{humanReadableDate(date)}</div>
			<div class="absolute -left-8 h-full border-r"></div>
			{#each groupedCards[date] as card (card.id)}
				<div
					class="group relative min-h-16 rounded-sm rounded-r-none border border-dashed border-white px-4 py-2 hover:border-gray-200"
				>
					<div class={`space-y-2 ${modifyingCardId === card.id ? 'blur-sm' : ''}`}>
						<div class="flex space-x-2">
							<div class="text-base">
								<MyStar style="" />
							</div>
							<div class="flex w-full flex-col">
								<div
									class="flex w-full rounded-md border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									id="question"
									placeholder="Capital of Paris?"
									data-gramm="false"
								>
									{card.front}
								</div>
								<div
									class="mt-1.5 flex w-full rounded-md border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									id="answer"
									placeholder="France"
									data-gramm="false"
								>
									{card.back}
								</div>
							</div>
						</div>
					</div>
					<div
						class="absolute -right-28 bottom-0 flex h-full flex-col-reverse px-2 opacity-0 group-hover:opacity-100"
					>
						<form method="post" action="?/delete" use:enhance={customEnhance}>
							<input type="hidden" name="id" value={card.id} />
							<button
								class="flex items-center space-x-1 rounded-md border bg-gray-800 px-4 py-2 text-white disabled:pointer-events-none disabled:opacity-50"
								disabled={modifyingCardId === card.id}
								type="submit"><Trash style="stroke-width:2px;" /><span>Delete</span></button
							>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/each}
	<div class="pb-10 pt-24 text-center text-xs text-gray-400">Total card(s): {cards.length}</div>
{/if}
