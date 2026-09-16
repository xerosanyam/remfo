<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CardAddSchema } from '$lib/schemas';
	import posthog from 'posthog-js';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

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
	use:enhance={({ formData }) => {
		loading = true;
		return ({ result, update }) => {
			loading = false;
			if (result.type === 'success') {
				posthog.capture('flashcard_created', {
					entry_point: action === '/learn?/add' ? 'learning' : 'home'
				});
			}
			const submittedResult = onSubmit(formData.get('front') as string);
			if (submittedResult === undefined) {
				update();
			}
		};
	}}
>
	<div
		class="mx-auto max-w-xl rounded-lg border border-dashed border-slate-200 shadow-sm dark:border-slate-700"
	>
		{#if showHeading}
			<div class="flex flex-col space-y-1.5 p-6 pb-4">
				<p class="text-slate-500 dark:text-slate-300">1. Write what you want to remember</p>
			</div>
		{/if}
		<div class="p-6 pt-0">
			<div class="space-y-4">
				<div class="space-y-2">
					<label
						class="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="question">question</label
					>
					<textarea
						class="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-teal-300"
						id="question"
						name="front"
						bind:value={$form.front}
						placeholder="Capital of Paris?"
						rows="4"
						{...$constraints.front}
						data-gramm="false"
					></textarea>
					{#if $errors.front}<div class="text-red-800 dark:text-red-400">{$errors.front}</div>{/if}
				</div>
				<div class="space-y-2">
					<label
						class="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="answer">answer</label
					><textarea
						class="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-teal-300"
						id="answer"
						name="back"
						bind:value={$form.back}
						placeholder="France"
						{...$constraints.back}
						data-gramm="false"
					></textarea>
					{#if $errors.back}<div class="text-red-800 dark:text-red-400">{$errors.back}</div>{/if}
				</div>
				<div class="flex items-center justify-center">
					<!-- <button class="flex items-center space-x-1"
						><EmojiLockOpen style="stroke-width:2px;" /><span>Public</span></button
					> -->
					<button
						disabled={loading}
						class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-slate-900 px-4 py-2 text-white ring-offset-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-teal-300 dark:text-slate-950 dark:ring-offset-slate-950 dark:hover:bg-teal-200 dark:focus-visible:ring-teal-300"
						type="submit"
					>
						save card
					</button>
				</div>
			</div>
		</div>
	</div>
</form>
