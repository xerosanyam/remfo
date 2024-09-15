<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import AlertCircle from 'virtual:icons/lucide/circle-alert';

	let isOffline = !navigator.onLine;

	function handleOnline() {
		isOffline = false;
	}

	function handleOffline() {
		isOffline = true;
	}

	onMount(() => {
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
	});

	onDestroy(() => {
		window.removeEventListener('online', handleOnline);
		window.removeEventListener('offline', handleOffline);
	});
</script>

{#if isOffline}
	<div class="fixed left-0 right-0 top-0 z-50 bg-white">
		<Alert variant="destructive">
			<AlertCircle class="h-4 w-4" />
			<AlertTitle>Offline</AlertTitle>
			<AlertDescription>
				You are currently offline. Some features may be unavailable.
			</AlertDescription>
		</Alert>
	</div>
{/if}
