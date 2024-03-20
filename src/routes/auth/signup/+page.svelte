<script lang="ts">
	import { enhance } from '$app/forms';

	export let form;
</script>

<form method="post" use:enhance>
	<div>
		<label for="email">Email</label>
		<input
			id="email"
			type="email"
			name="email"
			aria-invalid={form?.errors?.email ? true : undefined}
			value={form?.data?.email ?? ''}
			required
		/>
		{#if form?.errors?.email}<span>{form?.errors.email}</span>{/if}
	</div>
	<button type="reset">Reset</button>
	<button type="submit">Sign up</button>
</form>
