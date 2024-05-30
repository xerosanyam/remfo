<script lang="ts">
	import { type CardReviewSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	// import CheckCircleOutline from '~icons/mdi/check-circle-outline';
	// import CheckOutline from '~icons/mdi/check-outline';
	// import AlertCircleOutline from '~icons/mdi/alert-circle-outline';
	// import Exclamation from '~icons/mdi/exclamation-thick';

	export let data: SuperValidated<Infer<CardReviewSchema>>;
	const { errors } = superForm(data);

	export let card;

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

	const shortCardId = card.id.slice(-6);
</script>

<div class="mx-auto max-w-md rounded-lg border shadow-md">
	<div class="flex flex-col space-y-1.5 p-6 pb-4">
		<p class="text-sm text-muted-foreground">2. Now, recall the answer</p>
	</div>
	<div class="p-6 pt-0">
		<div class="space-y-6">
			<div
				class="flex max-h-96 w-full overflow-y-auto rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{card.front}
			</div>
			<div
				class="flex max-h-96 w-full overflow-y-auto rounded-md border bg-background text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				<div class="w-full px-3 py-2 blur-sm hover:filter-none focus:filter-none">{card.back}</div>
			</div>
			<form method="post" action="?/review" class="w-full">
				<input type="hidden" name="cardId" value={card.id} />
				<div class="w-full">
					<div class="text-sm">3. How easy was it to recall ?</div>
					<div class="mt-3 flex justify-center">
						<div class="flex w-full flex-col space-y-2">
							{#each options as { value, text } (value)}
								<button
									class="w-full whitespace-nowrap rounded-md border border-dashed border-input bg-background px-4 py-1 text-left text-sm ring-offset-background transition-colors hover:border-solid hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
									name="difficulty"
									{value}
								>
									<span class="flex space-x-2">
										<!-- <svelte:component this={icon} /> -->
										<span>{text}</span>
									</span>
								</button>
							{/each}
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
	{#if $errors.difficulty}<div class=" text-gray-500">{$errors.difficulty}</div>{/if}
</div>
<a href={`all#${shortCardId}`} class="text-xs text-gray-200">
	{shortCardId}
</a>
