<script lang="ts">
	import LogIn from '~icons/lucide/log-in';
	import { Button } from '$lib/components/ui/button';
	export let text: string = 'Sign In';
</script>

<form action="/login/google">
	<Button type="submit"
		><LogIn data-icon="inline-start" style="font-size:1.2rem;" /><span>{text}</span></Button
	>
</form>
