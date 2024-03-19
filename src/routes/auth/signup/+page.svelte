<script lang="ts">
	import { enhance } from '$app/forms';

	export let form;
</script>

{#if form?.missing}<p class="error">Please provide email!</p>{/if}

<form method="post" use:enhance>
	<div>
		<label for="email">Email</label>
		<input id="email" type="email" name="email" value={form?.email ?? ''} required />
	</div>
	<button type="reset">Reset</button>
	<button type="submit">Sign up</button>
</form>
