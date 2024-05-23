<script lang="ts">
	import { difficulty, type CardReviewSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardReviewSchema>>;
	const { errors } = superForm(data);

	export let card;
</script>

<h2>Try to recall the answer</h2>
<table>
	<tbody>
		<tr>
			<th>Question: </th>
			<td>{card.front}</td>
		</tr>
		<tr>
			<th>Answer:</th>
			<td>
				<details>
					<summary>Show Answer</summary>
					<p>{card.back}</p>
				</details>
			</td>
		</tr>
		<tr>
			<th>Action(s):</th>
			<td>
				<form method="post" action="?/review">
					<fieldset>
						<legend>How difficult was it to remember ?</legend>
						<ol>
							{#each difficulty as option}
								<li>
									<button name="difficulty" value={option}>{option}</button>
								</li>
							{/each}
						</ol>
					</fieldset>
				</form>
			</td>
			{#if $errors.difficulty}<td>{$errors.difficulty}</td>{/if}
		</tr>
	</tbody>
</table>
