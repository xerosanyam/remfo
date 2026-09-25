<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CardAddSchema } from '$lib/schemas';
	import { shortcut } from '$lib/shortcuts';
	import Save from '~icons/lucide/save';

	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import type { ActionResult } from '@sveltejs/kit';
	import { capture } from '$lib/posthog';
	import { Button } from '$lib/components/ui/button';
	import { Kbd, KbdGroup } from '$lib/components/ui/kbd';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	export let formData: SuperValidated<Infer<CardAddSchema>>;

	// Callback prop, not createEventDispatcher (deprecated in Svelte 5).
	export let onadded: (card: { front: string; back: string }) => void = () => {};

	// use:enhance against the cross-route action (/api/card-actions?/add): the shell prerenders,
	// so it owns no actions itself. Redirect results patch the list locally, skipping the
	// full load rerun; failures render server errors and resync via update().
	let errors: { front?: string[]; back?: string[] } = formData?.errors ?? {};
	let loading = false;
	let formRef: HTMLFormElement;

	const placeholders = [
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

	// The action answers 302, which enhance reports as type 'redirect'. Custom enhance
	// replaces default handling, so ignoring it here skips the full load rerun.
	const customEnhance = ({
		formElement,
		formData
	}: {
		formElement: HTMLFormElement;
		formData: FormData;
	}) => {
		HTMLFormElement.prototype.reset.call(formElement);
		const front = String(formData.get('front') ?? '');
		const back = String(formData.get('back') ?? '');
		return ({ result, update }: { result: ActionResult; update: () => void }) => {
			if (result.type === 'redirect') {
				errors = {};
				onadded({ front, back });
				void capture('flashcard_created', { entry_point: 'record' });
			} else if (result.type === 'failure') {
				errors = ((result.data?.form ?? {}) as { errors?: typeof errors }).errors ?? {};
				alert('unable to save.');
				update();
			} else if (result.type === 'error') {
				alert('unable to save.');
				update();
			}
		};
	};
</script>

<form
	method="post"
	action="/api/card-actions?/add"
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
						<!-- svelte-ignore a11y_autofocus -->
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
							<!-- Ctrl+Enter is a JS shortcut action: hidden without scripts. -->
							<span class="text-muted-foreground js-only flex items-center gap-1 text-xs"
								><KbdGroup><Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd></KbdGroup> to save</span
							>
							<Button type="submit" disabled={loading} title="shortcut: Ctrl/Command+Enter"
								><Save data-icon="inline-start" />save</Button
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</form>
