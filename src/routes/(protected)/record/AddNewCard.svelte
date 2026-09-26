<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CardAddSchema } from '$lib/schemas';
	import { shortcut } from '$lib/shortcuts';
	import Save from '~icons/arcticons/saveto';

	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { ActionResult } from '@sveltejs/kit';
	import { capture } from '$lib/posthog';
	import { Button } from '$lib/components/ui/button';
	import { Kbd, KbdGroup } from '$lib/components/ui/kbd';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	export let formData: SuperValidated<Infer<CardAddSchema>>;

	// Plain use:enhance instead of superForm: the superforms client runtime (36KB) stays
	// off the page; server-side zod validation is authoritative and its errors render
	// from the failure result below (remfo-tw9m).
	let errors: { front?: string[]; back?: string[] } = formData?.errors ?? {};
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
				errors = {};
				void capture('flashcard_created', { entry_point: 'record' });
			} else if (result.type === 'failure') {
				errors = ((result.data?.form ?? {}) as { errors?: typeof errors }).errors ?? {};
				alert('unable to save.');
			} else if (result.type === 'error') {
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
	<div class="mx-auto mt-8 max-w-lg">
		<div class="border-border w-full rounded-xs border-dashed sm:border">
			<div class="mb-0 flex flex-col px-6 py-2">
				<p class="text-muted-foreground ml-6">write something you'd like to remember</p>
			</div>
			<div
				class="group border-border relative min-h-16 rounded-xs rounded-r-none border border-dashed px-4 py-2"
			>
				<div class="flex flex-col gap-2">
					<div class="flex w-full flex-col gap-2">
						<Label for="question">question</Label>
						<Textarea
							id="question"
							name="front"
							value={formData?.data?.front ?? ''}
							placeholder={placeholders[randomPlaceholder].front}
							rows={2}
							data-gramm="false"
							disabled={loading}
							required
							minlength={1}
							maxlength={2000}
							autofocus
						/>
						{#if errors.front}<div class="text-red-800 dark:text-red-400">
								{errors.front}
							</div>{/if}

						<Label for="answer">answer</Label>
						<Textarea
							id="answer"
							name="back"
							value={formData?.data?.back ?? ''}
							placeholder={placeholders[randomPlaceholder].back}
							data-gramm="false"
							rows={2}
							disabled={loading}
							required
							minlength={1}
							maxlength={2000}
						/>
						{#if errors.back}<div class="text-red-800 dark:text-red-400">
								{errors.back}
							</div>{/if}
						<div class="flex items-center justify-between pt-1">
							<span class="text-muted-foreground flex items-center gap-1 text-xs"
								><KbdGroup><Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd></KbdGroup> to save</span
							>
							<Button type="submit" disabled={loading} title="shortcut: Ctrl/Command+Enter"
								><Save data-icon="inline-start" style="stroke-width:2px;" />save</Button
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</form>
