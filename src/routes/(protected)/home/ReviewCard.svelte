<script lang="ts">
	import { difficulty, type CardReviewSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardReviewSchema>>;
	const { errors } = superForm(data);

	export let card;
</script>

<div class="mx-auto max-w-xl rounded-lg border shadow-sm">
	<div class="flex flex-col space-y-1.5 p-6 pb-4">
		<p class="text-sm text-muted-foreground">Try to recall the answer</p>
	</div>
	<div class="p-6 pt-0">
		<div class="space-y-4">
			<section class="space-y-2">
				<label
					class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					for="question">Question</label
				>
				<div
					class="flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{card.front}
				</div>
			</section>
			<details>
				<summary class="cursor-pointer text-sm font-medium">Show Answer</summary>
				<div class="mt-4 space-y-4">
					<div
						class="flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{card.back}
					</div>
					<div class="mt-4 flex gap-4">
						<form method="post" action="?/review">
							<input type="hidden" name="cardId" value={card.id} />
							<fieldset>
								<legend class="text-xs">How difficult was it to remember ?</legend>
								<div class="flex flex-wrap space-x-1">
									{#each difficulty as option}
										<button
											class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-xs ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
											name="difficulty"
											value={option}>{option}</button
										>
									{/each}
								</div>
							</fieldset>
						</form>
					</div>
				</div>
			</details>
		</div>
	</div>
	{#if $errors.difficulty}<div class=" text-gray-500">{$errors.difficulty}</div>{/if}
</div>
