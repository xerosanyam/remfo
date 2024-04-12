<script lang="ts">
	import { difficulty, type CardReviewSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardReviewSchema>>;
	const { errors } = superForm(data);
</script>

<h2>Try to recall the answer:</h2>
<form method="post" action="?/review">
	<table>
		<tbody>
			<tr>
				<th>Question: </th>
				<td> What is wealth? </td>
			</tr>
			<tr>
				<th>Answer:</th>
				<td>
					<details>
						<summary>Show Answer</summary>
						<p>Assets that earn while you sleep</p>
					</details>
				</td>
			</tr>
			<tr>
				<th>Action(s):</th>
				<td>
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
				</td>
				{#if $errors.difficulty}<td>{$errors.difficulty}</td>{/if}
			</tr>
		</tbody>
	</table>
</form>
