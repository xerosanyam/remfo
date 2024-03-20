<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	export let data;
	const { form, errors, constraints, enhance, message } = superForm(data.form);
</script>

<form method="post" use:enhance>
	<div>
		<label for="email">Email</label>
		<input
			id="email"
			type="email"
			name="email"
			aria-invalid={$errors?.email ? 'true' : undefined}
			bind:value={$form.email}
			{...$constraints}
		/>
		{#if $errors?.email}<span>{$errors.email}</span>{/if}
	</div>
	<button type="reset">Reset</button>
	<button type="submit">Sign up</button>
	{#if $message}<span>{$message}</span>{/if}
</form>
