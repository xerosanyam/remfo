<script lang="ts">
	import type { CardLearnSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardLearnSchema>>;
	const { form, errors, constraints } = superForm(data);
</script>

<form method="post" action="?/generateCard">
	<textarea
		class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		id="question"
		name="userInput"
		placeholder="Capital of Paris?"
		rows="4"
		bind:value={$form.userInput}
		{...$constraints.userInput}
	></textarea>
	<div>
		<button class="mt-4 w-auto rounded-sm bg-gray-900 px-2 py-1 text-white" type="submit"
			>Generate flashcards</button
		>
	</div>
	<span class="text-red-600">{$errors.userInput}</span>
</form>
