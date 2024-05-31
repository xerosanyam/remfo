<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CardAddSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let formData: SuperValidated<Infer<CardAddSchema>>;
	export let onSubmit: (question: string) => void = () => {};

	const { form, errors, constraints } = superForm(formData);
	let loading = false;
</script>

<form
	method="post"
	action="/record?/add"
	use:enhance={({  formData }) => {
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
	<div class="mx-auto mt-4 max-w-lg rounded-lg border border-dashed text-sm shadow-sm">
		<div class="flex flex-col px-6 py-2">
			<p class="text-base text-muted-foreground">Write something you'd like to remember.</p>
		</div>
		<div class="px-4 py-2">
			<div class="space-y-2">
				<div class="flex items-end space-x-2">
					<div class="flex w-full flex-col space-y-2">
						<textarea
							class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							id="question"
							name="front"
							bind:value={$form.front}
							placeholder="Capital of Paris?"
							rows="2"
							data-gramm="false"
							{...$constraints.front}
						></textarea>
						{#if $errors.front}<div class="text-red-800">{$errors.front}</div>{/if}

						<textarea
							class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							id="answer"
							name="back"
							bind:value={$form.back}
							placeholder="France"
							data-gramm="false"
							{...$constraints.back}
						></textarea>
						{#if $errors.back}<div class="text-red-800">{$errors.back}</div>{/if}
					</div>
					<button
						disabled={loading}
						class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						type="submit"
					>
						save
					</button>
				</div>
			</div>
		</div>
	</div>
</form>
