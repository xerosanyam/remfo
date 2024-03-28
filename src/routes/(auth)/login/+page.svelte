<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	export let data;
	const { form, errors, constraints } = superForm(data.form);
</script>

<h1>Login</h1>
<form method="post">
	<div>
		<label for="email">Email</label>
		<input
			id="email"
			name="email"
			type="email"
			aria-invalid={$errors.email ? 'true' : undefined}
			bind:value={$form.email}
			{...$constraints.email}
		/>
		{#if $errors.email}<span>{$errors.email}</span>{/if}
	</div>
	<div>
		<label for="password">Password</label>
		<input
			id="password"
			name="password"
			type="password"
			autocomplete="current-password"
			aria-invalid={$errors.password ? 'true' : undefined}
			bind:value={$form.password}
		/>
		{#if $errors.password}<span>{$errors.password}</span>{/if}
	</div>
	<button type="reset">Reset</button>
	<button type="submit">Login</button>
</form>
