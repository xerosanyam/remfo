<script lang="ts">
	import { difficulty, type CardReviewSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardReviewSchema>>;
	const { errors } = superForm(data);
</script>

<h1>Try to recall the answer</h1>
<form method="post" action="?/review">
	<details>
		<summary>What is wealth?</summary>
		<p>Assets that earn while you sleep</p>
		<fieldset>
			<legend>How difficult was it to remember ?</legend>
			<div>
				{#each difficulty as option}
					<button name="difficulty" value={option}>{option}</button>
				{/each}
			</div>
			{#if $errors.difficulty}<span>{$errors.difficulty}</span>{/if}
		</fieldset>
	</details>
</form>
