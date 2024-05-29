<script lang="ts">
	import { type CardReviewSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import CheckIcon from '~icons/mdi/check-outline';
	import CloseIcon from '~icons/mdi/close-outline';

	export let data: SuperValidated<Infer<CardReviewSchema>>;
	const { errors } = superForm(data);

	export let card;

	const options = {
		Easy: 'Super easy',
		Good: 'Yes',
		Hard: 'No',
		Challenging: 'Super difficult'
	};

	const shortCardId = card.id.slice(-6);
</script>

<div class="mx-auto max-w-md rounded-lg border shadow-sm">
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
				class="flex max-h-96 w-full overflow-y-auto rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background blur-sm placeholder:text-muted-foreground hover:filter-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{card.back}
			</div>
			<form method="post" action="?/review" class="w-full">
				<input type="hidden" name="cardId" value={card.id} />
				<div class="w-full">
					<div class="text-sm">3. Were you able to recall it easily ?</div>
					<div class="mt-3 flex justify-center space-x-4">
						<button
							class="inline-flex w-1/2 items-center justify-center space-x-1 whitespace-nowrap rounded-md border border-dashed border-input bg-background px-4 py-2 text-base ring-offset-background transition-colors hover:border-solid hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
							name="difficulty"
							value={'Good'}><CheckIcon /><span>{options['Good']}</span></button
						>

						<button
							class="inline-flex w-1/2 items-center justify-center space-x-1 whitespace-nowrap rounded-md border border-dashed border-input bg-background px-4 py-2 text-base ring-offset-background transition-colors hover:border-solid hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
							name="difficulty"
							value={'Hard'}><CloseIcon /><span>{options['Hard']}</span></button
						>
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
