<script lang="ts">
	import { enhance } from '$app/forms';
	import { humanReadableDate } from '$lib/common.util';
	import type { CardRevisePage } from '$lib/types/Card';
	import type { ActionResult } from '@sveltejs/kit';
	import { format, formatDistanceToNow } from 'date-fns';
	import MyStar from '~icons/arcticons/mykyivstar';
	import Trash from '~icons/arcticons/trashcan';

	export let cards: CardRevisePage[];
	let groupedCards: { [key: string]: CardRevisePage[] } = {};
	let dates: string[] = [];
	let revisedCards: string[] = [];
	let remainingCards: CardRevisePage[] = [];

	$: {
		remainingCards = cards.filter((card) => !revisedCards.includes(card.id));
		groupedCards = remainingCards.reduce((groups: { [key: string]: CardRevisePage[] }, card) => {
			const date = format(card.nextPractice, 'P');

			if (!groups[date]) {
				groups[date] = [];
			}

			groups[date].push(card);

			return groups;
		}, {});

		dates = Object.keys(groupedCards).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

		console.log(revisedCards);
	}

	let modifyingCardId = '';

	const customEnhance = ({ formData }: { formData: FormData }) => {
		const id = formData.get('cardId') as string;
		revisedCards = [...revisedCards, id];
		modifyingCardId = id;
		return ({ result }: { result: ActionResult }) => {
			modifyingCardId = '';
			if (result.type === 'error' || result.type === 'failure') {
				alert('unable to perform that action.');
			}
		};
	};

	const options = [
		{
			value: 'Easy',
			text: 'super easy'
			// icon: CheckCircleOutline
		},
		{
			value: 'Good',
			text: 'easy'
			// icon: CheckOutline
		},
		{
			value: 'Hard',
			text: 'difficult'
			// icon: Exclamation
		},
		{
			value: 'Challenging',
			text: 'super difficult'
			// icon: AlertCircleOutline
		}
	];

	let reviseCards = 5;
</script>

<div class="relative mx-auto mt-10 max-w-lg space-y-4 rounded-lg">
	{#if remainingCards.length === 0}
		You have revised all the cards. Go to <a href="/record" class="underline">Record</a> to create more
	{:else if revisedCards.length > 0 && revisedCards.length % reviseCards === 0}
		<div class="text-center text-lg text-gray-500">
			Hurray. You revised {revisedCards.length} cards. Take a break or keep going.
		</div>
	{:else}
		<div class="text-center text-lg text-gray-400">
			cards revised: {revisedCards.length}/{cards.length}
		</div>
	{/if}
	<div class="mt-10">
		{#if cards.length > 0}
			{#each dates as date (date)}
				<div class="absolute -left-14 z-10 w-12 bg-white py-2" title={date}>
					{humanReadableDate(groupedCards[date][0].nextPractice)}
				</div>
				<div class="absolute -left-8 h-full border-r"></div>
				<div>
					{#each groupedCards[date] as card (card.id)}
						<div class="mb-8 first:min-h-screen">
							<div
								class="group relative min-h-16 rounded-sm border border-dashed px-8 py-6 hover:border-gray-200"
							>
								<div class={` ${modifyingCardId === card.id ? 'blur-sm' : ''}`}>
									<div class="flex space-x-2">
										<div>
											<MyStar style="" />
										</div>
										<div class="flex w-full flex-col">
											<div
												class="mb-2 flex w-full whitespace-break-spaces rounded-md border-input ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												id="question"
												placeholder="Capital of Paris?"
												data-gramm="false"
											>
												{card.front}
											</div>
											<div class="border border-dashed">
												<div
													class="flex w-full whitespace-break-spaces rounded-md p-2 pb-10 pt-8 ring-offset-background blur-sm placeholder:text-muted-foreground hover:filter-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
													id="answer"
													placeholder="France"
													data-gramm="false"
												>
													{card.back}
												</div>
											</div>
										</div>
									</div>
									<form
										method="post"
										action="?/review"
										class="mt-2 flex w-full space-x-2"
										use:enhance={customEnhance}
									>
										<input type="hidden" name="cardId" value={card.id} />

										{#each options as { value, text } (value)}
											<button
												class="w-full whitespace-nowrap rounded-md border border-input bg-background px-4 py-4 text-center ring-offset-background transition-colors hover:border-solid hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
												name="difficulty"
												{value}
											>
												<!-- <svelte:component this={icon} /> -->
												<span>{text}</span>
											</button>
										{/each}
									</form>
								</div>
								<div
									class="absolute -right-28 bottom-0 flex h-full flex-col-reverse px-2 opacity-0 group-hover:opacity-100"
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
							<div class=" text-right text-sm text-gray-200" title={String(card.createdAt)}>
								added {formatDistanceToNow(card.createdAt)} ago
							</div>
						</div>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
</div>
