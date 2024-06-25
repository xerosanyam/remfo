<script lang="ts">
	import SqrlLoginIcon from '~icons/arcticons/signaturespoofingchecker';
	export let text: string = 'sign in';
</script>

<form action="/login/google">
	<button
		class="flex w-full items-center space-x-2 px-6 py-4 text-gray-800 underline hover:bg-gray-100"
		type="submit"
	>
		<span>{text} </span>
	</button>
</form>
