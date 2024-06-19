<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { CardLearnSchema } from '$lib/schemas';
	import { shortcut } from '$lib/shortcuts';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardLearnSchema>>;
	const { form, errors, constraints } = superForm(data);
	let loading = false;
	let formRef: HTMLFormElement;
</script>

<form
	method="post"
	action="?/generateCard"
	use:enhance={() => {
		loading = true;
		return async ({ result }) => {
			loading = false;
			await applyAction(result);
		};
	}}
	bind:this={formRef}
>
	<div class="mx-auto mt-4 max-w-xl rounded-lg border border-dashed text-sm shadow-sm">
		<div class="flex flex-col p-6 pb-4">
			<p class="text-base text-muted-foreground">what do you want to learn about?</p>
		</div>
		<div class="px-4 py-2">
			<div class="space-y-2">
				<div class="flex w-full flex-col space-x-2">
					<textarea
						class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						id="question"
						name="userInput"
						placeholder="i want to learn about..."
						rows="3"
						bind:value={$form.userInput}
						{...$constraints.userInput}
						data-gramm="false"
						use:shortcut={{
							control: true,
							code: 'Enter',
							callback: () => formRef.dispatchEvent(new Event('submit', { bubbles: true }))
						}}
					></textarea>
					{#if $errors.userInput}<div class="text-red-800">{$errors.userInput}</div>{/if}
				</div>
				<div class="flex flex-row-reverse items-center justify-between">
					<button
						disabled={loading}
						class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-6 text-sm text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						type="submit"
					>
						generate flashcards
					</button>
				</div>
			</div>
		</div>
	</div>
</form>
