<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CardAddSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardAddSchema>>;
	const { form, errors, constraints } = superForm(data);
	export let showHeading = false;
	let loading = false;
	export let onSubmit: (question: string) => void = () => {};
</script>

<form
	method="post"
	action="/home?/add"
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
	<div class="mx-auto max-w-md rounded-lg border shadow-sm">
		{#if showHeading}
			<div class="flex flex-col space-y-1.5 p-6 pb-4">
				<p class="text-sm text-muted-foreground">Add something you'd like to remember</p>
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
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						id="question"
						name="front"
						bind:value={$form.front}
						placeholder="Capital of Paris?"
						rows="4"
						{...$constraints.front}
					></textarea>
					{#if $errors.front}<div class="text-gray-600">{$errors.front}</div>{/if}
				</div>
				<div class="space-y-2">
					<label
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="answer">Answer</label
					><textarea
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						id="answer"
						name="back"
						bind:value={$form.back}
						placeholder="France"
						{...$constraints.back}
					></textarea>
					{#if $errors.back}<div class="text-gray-600">{$errors.back}</div>{/if}
				</div>
				<div class="flex space-x-2">
					<button
						disabled={loading}
						class="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						type="submit"
					>
						Save Card
					</button>
					<button
						disabled={loading}
						class="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-xs ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
						type="reset"
					>
						Clear
					</button>
				</div>
			</div>
		</div>
	</div>
</form>
