<script lang="ts">
	import { enhance } from '$app/forms';
	import { humanReadableDate } from '$lib/common.util';
	import type { CardReviewSchema } from '$lib/schemas';
	import type { CardRevisePage } from '$lib/types/Card';
	import { format, formatDistanceToNow } from 'date-fns';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import MyStar from '~icons/arcticons/mykyivstar';
	import Trash from '~icons/arcticons/trashcan';

	export let data: SuperValidated<Infer<CardReviewSchema>>;
	const { errors } = superForm(data);

	export let cards: CardRevisePage[];
	let groupedCards: { [key: string]: CardRevisePage[] } = {};
	let dates: string[] = [];

	$: {
		groupedCards = cards.reduce((groups: { [key: string]: CardRevisePage[] }, card) => {
			const date = format(card.nextPractice, 'P');

			// If this date isn't in the groups yet, add it
			if (!groups[date]) {
				groups[date] = [];
			}

			// Add this card to the group for this date
			groups[date].push(card);

			return groups;
		}, {});
		dates = Object.keys(groupedCards);
		dates = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
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

	const options = [
		{
			value: 'Easy',
			text: 'Super easy'
			// icon: CheckCircleOutline
		},
		{
			value: 'Good',
			text: 'Easy'
			// icon: CheckOutline
		},
		{
			value: 'Hard',
			text: 'Difficult'
			// icon: Exclamation
		},
		{
			value: 'Challenging',
			text: 'Super difficult'
			// icon: AlertCircleOutline
		}
	];
</script>

<div class="relative mx-auto mt-10 max-w-lg space-y-4 rounded-lg text-sm">
	Cards due for revision today: {cards.length || 0}
	<div class="mt-10">
		{#if cards.length > 0}
			{#each dates as date (date)}
				<div class="absolute -left-14 z-10 w-12 bg-white py-2" title={date}>
					{humanReadableDate(groupedCards[date][0].nextPractice)}
				</div>
				<div class="absolute -left-8 h-full border-r"></div>
				<div>
					{#each groupedCards[date] as card (card.id)}
						<div class="mb-8 first:h-screen">
							<div
								class="group relative min-h-16 rounded-sm border border-dashed px-8 py-6 hover:border-gray-200"
							>
								<div class={` ${modifyingCardId === card.id ? 'blur-sm' : ''}`}>
									<div class="flex space-x-2">
										<div class="text-base">
											<MyStar style="" />
										</div>
										<div class="flex w-full flex-col">
											<div
												class="flex w-full whitespace-pre-line rounded-md border-input ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												id="question"
												placeholder="Capital of Paris?"
												data-gramm="false"
											>
												{card.front}
											</div>
											<div class="border border-dashed p-2">
												<div
													class="flex w-full whitespace-pre-line rounded-md pb-10 pt-8 ring-offset-background blur-sm placeholder:text-muted-foreground hover:filter-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
										use:enhance
									>
										<input type="hidden" name="cardId" value={card.id} />

										{#each options as { value, text } (value)}
											<button
												class="w-full whitespace-nowrap rounded-md border border-input bg-background px-4 py-4 text-center text-sm ring-offset-background transition-colors hover:border-solid hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
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
										<input type="hidden" name="id" value={card.id} />
										<button
											class="flex items-center space-x-1 rounded-md border bg-gray-800 px-4 py-2 text-white disabled:pointer-events-none disabled:opacity-50"
											disabled={modifyingCardId === card.id}
											type="submit"><Trash style="stroke-width:2px;" /><span>Delete</span></button
										>
									</form>
								</div>
							</div>
							<div class=" text-right text-xs text-gray-200" title={String(card.createdAt)}>
								Added {formatDistanceToNow(card.createdAt)}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
</div>
<div class="pb-10 pt-24 text-center text-xs text-gray-400">Total card(s): {cards.length}</div>
