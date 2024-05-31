<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CardAddSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import EmojiLockOpen from '~icons/arcticons/emoji-lock-open';

	export let data: SuperValidated<Infer<CardAddSchema>>;
	export let showHeading = false;
	export let onSubmit: (question: string) => void = () => {};

	const { form, errors, constraints } = superForm(data);
	let loading = false;
	export let action = '/home?/add';
</script>

<form
	method="post"
	{action}
	use:enhance={({ formElement, formData, action, cancel, submitter }) => {
		loading = true;
		return ({update}) => {
			loading = false;
			const result = onSubmit(formData.get('front') as string);
			if(result === undefined){
				update();
			}
		}
	}}
>
	<div class="mx-auto max-w-xl rounded-lg border border-dashed shadow-sm">
		{#if showHeading}
			<div class="flex flex-col space-y-1.5 p-6 pb-4">
				<p class="text-sm text-muted-foreground">1. Write what you want to remember</p>
			</div>
		{/if}
		<div class="p-6 pt-0">
			<div class="space-y-4">
				<div class="space-y-2">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="question">Question</label
					>
					<textarea
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						id="question"
						name="front"
						bind:value={$form.front}
						placeholder="Capital of Paris?"
						rows="4"
						{...$constraints.front}
						data-gramm="false"
					></textarea>
					{#if $errors.front}<div class="text-gray-600">{$errors.front}</div>{/if}
				</div>
				<div class="space-y-2">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="answer">Answer</label
					><textarea
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						id="answer"
						name="back"
						bind:value={$form.back}
						placeholder="France"
						{...$constraints.back}
						data-gramm="false"
					></textarea>
					{#if $errors.back}<div class="text-gray-600">{$errors.back}</div>{/if}
				</div>
				<div class="flex items-center justify-between">
					<button class="flex items-center space-x-1"
						><EmojiLockOpen style="stroke-width:2px;" /><span>Public</span></button
					>
					<button
						disabled={loading}
						class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						type="submit"
					>
						Save Card
					</button>
				</div>
			</div>
		</div>
	</div>
</form>
