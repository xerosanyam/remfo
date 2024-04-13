<script lang="ts">
	import type { CardAddSchema } from '$lib/schemas';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';

	export let data: SuperValidated<Infer<CardAddSchema>>;
	const { form, errors, constraints } = superForm(data);
</script>

<h2>Add something you'd like to remember</h2>
<form method="post" action="?/add">
	<table>
		<tbody>
			<tr>
				<th> <label for="front">Question:</label> </th>
				<td>
					<textarea
						id="front"
						name="front"
						bind:value={$form.front}
						placeholder="Capital of Paris?"
						rows="4"
						{...$constraints.front}
					/>
				</td>
				{#if $errors.front}<td>{$errors.front}</td>{/if}
			</tr>
			<tr>
				<th>
					<label for="back">Answer 🙋:</label>
				</th>
				<td>
					<textarea
						id="back"
						name="back"
						bind:value={$form.back}
						placeholder="France"
						rows="4"
						{...$constraints.back}
					/>
				</td>
				{#if $errors.back}<td>{$errors.back}</td>{/if}
			</tr>
			<tr>
				<th>Action(s):</th>
				<td>
					<ol>
						<li>
							<button type="submit">Remember</button>
						</li>
						<li>
							<button type="reset">Clear</button>
						</li>
					</ol>
				</td>
			</tr>
		</tbody>
	</table>
</form>
