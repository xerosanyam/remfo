<script lang="ts">
	import OmIcon from '~icons/arcticons/growtracker';
	import { Button } from '$lib/components/ui/button';
	export let text: string = 'Sign In';
</script>

<form action="/login/google">
	<Button type="submit"
		><OmIcon data-icon="inline-start" style="font-size:1.2rem;stroke-width:2;" /><span>{text}</span
		></Button
	>
</form>
