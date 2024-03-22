<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	export let data;
	const { form, errors, constraints } = superForm(data.form);
</script>

<h1>Add something you'd like to remember:</h1>
<form method="post">
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
