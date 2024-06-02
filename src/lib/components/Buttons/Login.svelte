<script lang="ts">
	import SqrlLoginIcon from '~icons/arcticons/signaturespoofingchecker';
	export let text: string = 'Sign In';
</script>

<form action="/login/google">
	<button
		class="flex w-full items-center space-x-2 px-4 py-4 text-gray-600 hover:bg-gray-100"
		type="submit"
	>
		<SqrlLoginIcon style="font-size:1.2rem;" />
		<span>{text} </span>
	</button>
</form>
