<script lang="ts">
	import LoginIcon from '~icons/material-symbols-light/login-outline-rounded';
	export let text: string = 'Sign In';
</script>

<form action="/login/google">
	<button
		class="flex items-center space-x-2 rounded-sm bg-gray-900 px-3 py-2 text-white"
		type="submit"
	>
		<LoginIcon style="font-size:1.2rem;" />
		<span>{text} </span>
	</button>
</form>
