<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { CardLearnSchema } from '$lib/schemas';
	import { shortcut } from '$lib/shortcuts';
	import { capture } from '$lib/posthog';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardLearnSchema>>;
	// Plain use:enhance instead of superForm (remfo-tw9m): server-side zod validation is
	// authoritative and its errors render from the failure result below.
	let errors: { userInput?: string[] } = data?.errors ?? {};
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
			if (result.type === 'failure') {
				errors = ((result.data?.form ?? {}) as { errors?: typeof errors }).errors ?? {};
			} else {
				errors = {};
			}
			const generatedCards =
				result.type === 'success' && Array.isArray(result.data?.data) ? result.data.data : [];
			if (generatedCards.length > 0) {
				void capture('flashcard_generation_completed', {
					generated_card_count: generatedCards.length
				});
			}
			await applyAction(result);
		};
	}}
	bind:this={formRef}
	use:shortcut={{
		control: true,
		code: 'Enter',
		callback: () => formRef.requestSubmit()
	}}
>
	<div
		class="mx-auto mt-4 max-w-xl rounded-lg border border-dashed border-slate-200 shadow-sm dark:border-slate-700"
	>
		<div class="flex flex-col p-6 pb-4">
			<p class="text-slate-500 dark:text-slate-300">what do you want to learn about?</p>
		</div>
		<div class="px-4 py-2">
			<div class="space-y-2">
				<div class="flex w-full flex-col space-x-2">
					<textarea
						class="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-teal-300"
						id="question"
						name="userInput"
						placeholder="i want to learn about..."
						rows="3"
						value={data?.data?.userInput ?? ''}
						required
						minlength="1"
						maxlength="140"
						data-gramm="false"
					></textarea>
					{#if errors.userInput}<div class="text-red-800 dark:text-red-400">
							{errors.userInput}
						</div>{/if}
				</div>
				<div class="flex flex-row-reverse items-center justify-between">
					<button
						disabled={loading}
						class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-slate-900 px-4 py-6 text-white ring-offset-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-teal-300 dark:text-slate-950 dark:ring-offset-slate-950 dark:hover:bg-teal-200 dark:focus-visible:ring-teal-300"
						type="submit"
					>
						generate flashcards
					</button>
				</div>
			</div>
		</div>
	</div>
</form>
