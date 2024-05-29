<script lang="ts">
	export let text: string = 'Sign In';
</script>

<form action="/login/google">
	<button class=" rounded-sm bg-gray-900 px-3 py-2 text-white" type="submit">{text}</button>
</form>
