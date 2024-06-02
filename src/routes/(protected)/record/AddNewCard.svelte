<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CardAddSchema } from '$lib/schemas';
	import MyStar from '~icons/arcticons/mykyivstar';
	import Save from '~icons/arcticons/saveto';

	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let formData: SuperValidated<Infer<CardAddSchema>>;
	export let onSubmit: (question: string) => void = () => {};

	const { form, errors, constraints } = superForm(formData);
	let loading = false;

	const customEnhance = ({ formData }: { formData: FormData }) => {
		loading = true;
		return ({ update }: { update: () => void }) => {
			loading = false;
			const result = onSubmit(formData.get('front') as string);
			if (result === undefined) {
				update();
			}
		};
	};
</script>

<form method="post" action="/record?/add" use:enhance={customEnhance}>
	<div class="relative mx-auto mt-8 flex max-w-lg space-x-1 text-sm">
		<div class="w-full rounded-sm border border-dashed">
			<div class="mb-0 flex flex-col px-6 py-2">
				<p class="ml-6 text-base text-muted-foreground">Write something you'd like to remember.</p>
			</div>
			<div
				class="group relative min-h-16 rounded-sm rounded-r-none border border-dashed border-white px-4 py-2"
			>
				<div class={`space-y-2`}>
					<div class="flex space-x-2">
						<div class="text-base">
							<MyStar style="" />
						</div>
						<div class="flex w-full flex-col space-y-2">
							<textarea
								class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								id="question"
								name="front"
								bind:value={$form.front}
								placeholder="Capital of Paris?"
								rows="2"
								data-gramm="false"
								disabled={loading}
								{...$constraints.front}
							>
							</textarea>
							{#if $errors.front}<div class="text-red-800">{$errors.front}</div>{/if}

							<textarea
								class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								id="answer"
								name="back"
								bind:value={$form.back}
								placeholder="France"
								data-gramm="false"
								rows="2"
								disabled={loading}
								{...$constraints.back}
							>
							</textarea>
							{#if $errors.back}<div class="text-red-800">{$errors.back}</div>{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="absolute -right-24 bottom-0">
			<button
				class="flex items-center space-x-1 rounded-md border bg-gray-800 px-4 py-2 text-white disabled:pointer-events-none disabled:opacity-50"
				disabled={loading}
				type="submit"><Save style="stroke-width:2px;" /><span>Save</span></button
			>
		</div>
	</div>
</form>
