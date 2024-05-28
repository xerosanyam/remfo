<script lang="ts">
	export let text: string = 'Sign In';
</script>

<form action="/login/google">
	<button class=" rounded-sm bg-gray-900 px-2 py-1 text-white" type="submit"
		>{text} with Google</button
	>
</form>
