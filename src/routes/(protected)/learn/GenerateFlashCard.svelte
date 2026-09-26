<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { CardLearnSchema } from '$lib/schemas';
	import { shortcut } from '$lib/shortcuts';
	import { capture } from '$lib/posthog';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

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
	<div class="border-border mx-auto mt-4 max-w-xl rounded-lg border border-dashed shadow-xs">
		<div class="px-4 py-2">
			<div class="flex flex-col gap-2">
				<div class="flex w-full flex-col gap-2">
					<Label for="question">what do you want to learn about?</Label>
					<Textarea
						id="question"
						name="userInput"
						placeholder="i want to learn about..."
						rows={3}
						value={data?.data?.userInput ?? ''}
						required
						minlength={1}
						maxlength={140}
						data-gramm="false"
					/>
					{#if errors.userInput}<div class="text-red-800 dark:text-red-400">
							{errors.userInput}
						</div>{/if}
				</div>
				<div class="flex flex-row-reverse items-center justify-between">
					<Button type="submit" disabled={loading}>generate flashcards</Button>
				</div>
			</div>
		</div>
	</div>
</form>
