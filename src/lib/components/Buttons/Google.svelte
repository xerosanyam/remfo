<script lang="ts">
	import OmIcon from '~icons/arcticons/growtracker';
	export let text: string = 'Sign In';
</script>

<form action="/login/google">
	<button class="flex rounded-sm bg-gray-900 px-6 py-4 text-white sm:px-8" type="submit"
		><OmIcon class="mr-1" style="font-size:1.2rem;stroke-width:2;" /><span>{text}</span></button
	>
</form>
