<script lang="ts">
	import { enhance } from '$app/forms';
	import type { CardAddSchema } from '$lib/schemas';
	import { capture } from '$lib/posthog';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	export let data: SuperValidated<Infer<CardAddSchema>>;
	export let showHeading = false;
	export let onSubmit: (question: string) => void = () => {};

	// Plain use:enhance instead of superForm: the superforms client runtime (36KB) stays
	// off the page; server-side zod validation is authoritative and its errors render
	// from the failure result below (remfo-tw9m). Initial values come from props so the
	// /learn reuse with prefilled cards keeps working.
	let errors: { front?: string[]; back?: string[] } = data?.errors ?? {};
	let loading = false;
	// Required, no default: the old '/home?/add' default posted to a route that does not
	// exist (ROUTES.HOME is /record). Sole consumer learn/+page passes /learn?/add.
	export let action: string;
</script>

<form
	method="post"
	{action}
	use:enhance={({ formData }) => {
		loading = true;
		return ({ result, update }) => {
			loading = false;
			if (result.type === 'success') {
				errors = {};
				void capture('flashcard_created', {
					entry_point: action === '/learn?/add' ? 'learning' : 'home'
				});
			} else if (result.type === 'failure') {
				errors = ((result.data?.form ?? {}) as { errors?: typeof errors }).errors ?? {};
			}
			const submittedResult = onSubmit(formData.get('front') as string);
			if (submittedResult === undefined) {
				update();
			}
		};
	}}
>
	<div class="border-border mx-auto max-w-xl rounded-lg border border-dashed shadow-xs">
		{#if showHeading}
			<div class="flex flex-col space-y-1.5 p-6 pb-4">
				<p class="text-muted-foreground">1. Write what you want to remember</p>
			</div>
		{/if}
		<div class="p-6 pt-0">
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<Label for="question">question</Label>
					<Textarea
						id="question"
						name="front"
						value={data?.data?.front ?? ''}
						placeholder="Capital of Paris?"
						rows={4}
						required
						minlength={1}
						maxlength={2000}
						data-gramm="false"
					/>
					{#if errors.front}<div class="text-red-800 dark:text-red-400">{errors.front}</div>{/if}
				</div>
				<div class="flex flex-col gap-2">
					<Label for="answer">answer</Label>
					<Textarea
						id="answer"
						name="back"
						value={data?.data?.back ?? ''}
						placeholder="France"
						required
						minlength={1}
						maxlength={2000}
						data-gramm="false"
					/>
					{#if errors.back}<div class="text-red-800 dark:text-red-400">{errors.back}</div>{/if}
				</div>
				<div class="flex items-center justify-center">
					<Button type="submit" disabled={loading}>save card</Button>
				</div>
			</div>
		</div>
	</div>
</form>
