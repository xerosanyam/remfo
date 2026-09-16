<script lang="ts">
	export let text: string = 'sign in';
</script>

<form action="/login/google">
	<button
		class="flex w-full items-center space-x-2 px-6 py-4 underline hover:bg-slate-100 dark:hover:bg-violet-900"
		type="submit"
	>
		<span>{text} </span>
	</button>
</form>
