<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CardAddSchema } from '$lib/schemas';
	import { shortcut } from '$lib/shortcuts';
	import MyStar from '~icons/arcticons/mykyivstar';
	import Save from '~icons/arcticons/saveto';

	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import type { ActionResult } from '@sveltejs/kit';
	import posthog from 'posthog-js';

	export let formData: SuperValidated<Infer<CardAddSchema>>;

	const { form, errors, constraints } = superForm(formData);
	let loading = false;
	let formRef: HTMLFormElement;

	let placeholders = [
		{
			front: `i'm grateful for`,
			back: 'the beautiful weather today, which brightened my mood and filled me with energy'
		},
		{
			front: `capital of ukraine is`,
			back: 'kyiv'
		}
	];
	const randomPlaceholder = Math.floor(Math.random() * placeholders.length);

	const customEnhance = ({ formElement }: { formElement: HTMLFormElement }) => {
		HTMLFormElement.prototype.reset.call(formElement);
		return ({ result, update }: { result: ActionResult; update: () => void }) => {
			if (result.type === 'success') {
				posthog.capture('flashcard_created', { entry_point: 'record' });
			} else if (result.type === 'error' || result.type === 'failure') {
				alert('unable to save.');
			}
			update();
		};
	};
</script>

<form
	method="post"
	action="/record?/add"
	use:enhance={customEnhance}
	bind:this={formRef}
	use:shortcut={{
		control: true,
		code: 'Enter',
		callback: () => formRef.requestSubmit()
	}}
>
	<div class="relative mx-auto mt-8 flex max-w-lg space-x-1">
		<div class="w-full rounded-sm border-dashed border-slate-200 dark:border-slate-700 sm:border">
			<div class="mb-0 flex flex-col px-6 py-2">
				<p class="ml-6 text-slate-500 dark:text-slate-300">
					write something you'd like to remember
				</p>
			</div>
			<div
				class="group relative min-h-16 rounded-sm rounded-r-none border border-dashed border-slate-200 px-4 py-2 dark:border-slate-700"
			>
				<div class="space-y-2">
					<div class="flex space-x-2">
						<div>
							<MyStar style="" />
						</div>
						<div class="flex w-full flex-col space-y-2">
							<!-- svelte-ignore a11y_autofocus -->
							<textarea
								class="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-teal-300"
								id="question"
								name="front"
								bind:value={$form.front}
								placeholder={placeholders[randomPlaceholder].front}
								rows="2"
								data-gramm="false"
								disabled={loading}
								{...$constraints.front}
								autofocus
							></textarea>
							{#if $errors.front}<div class="text-red-800 dark:text-red-400">
									{$errors.front}
								</div>{/if}

							<textarea
								class="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-teal-300"
								id="answer"
								name="back"
								bind:value={$form.back}
								placeholder={placeholders[randomPlaceholder].back}
								data-gramm="false"
								rows="2"
								disabled={loading}
								{...$constraints.back}
							></textarea>
							<div class="flex justify-end sm:hidden">
								<button
									class="flex items-center space-x-1 rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-white disabled:pointer-events-none disabled:opacity-50 dark:border-teal-300 dark:bg-teal-300 dark:text-slate-950"
									disabled={loading}
									type="submit"><Save style="stroke-width:2px;" /><span>save</span></button
								>
							</div>
							{#if $errors.back}<div class="text-red-800 dark:text-red-400">
									{$errors.back}
								</div>{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="absolute -right-24 bottom-0 hidden sm:block">
			<button
				class="flex items-center space-x-1 rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-white disabled:pointer-events-none disabled:opacity-50 dark:border-teal-300 dark:bg-teal-300 dark:text-slate-950"
				disabled={loading}
				type="submit"><Save style="stroke-width:2px;" /><span>save</span></button
			>
		</div>
	</div>
</form>
