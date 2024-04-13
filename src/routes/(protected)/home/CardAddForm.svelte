<script lang="ts">
	import type { CardAddSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardAddSchema>>;
	const { form, errors, constraints } = superForm(data);
</script>

<h2>Add something you'd like to remember</h2>
<form method="post" action="?/add">
	<div>
		<label for="front">Question:</label>
		<textarea
			id="front"
			name="front"
			bind:value={$form.front}
			placeholder="Capital of Paris?"
			rows="4"
			{...$constraints.front}
		/>
		{#if $errors.front}<span>{$errors.front}</span>{/if}
	</div>
	<div>
		<label for="back">Answer 🙋:</label>
		<textarea
			id="back"
			name="back"
			bind:value={$form.back}
			placeholder="France"
			rows="4"
			{...$constraints.back}
		/>
		{#if $errors.back}<span>{$errors.back}</span>{/if}
	</div>
	<button type="reset">Clear</button>
	<button type="submit">Remember</button>
</form>
