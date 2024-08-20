<script lang="ts">
	import { onMount } from 'svelte';

	export let text = '';

	let isUrl = false;
	let isImageUrl = false;

	onMount(() => {
		isUrl = isValidUrl(text);
		if (isUrl) {
			checkIfImageUrl(text).then((result: boolean) => {
				isImageUrl = result;
			});
		}
	});

	function isValidUrl(string: string) {
		try {
			new URL(string);
			return true;
		} catch (_) {
			return false;
		}
	}

	function checkIfImageUrl(url: string): Promise<boolean> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);
			img.src = url;
		});
	}
</script>

{#if isImageUrl}
	<img src={text} alt="content" />
{:else if isUrl}
	<a class="underline" href={text} target="_blank" rel="noopener noreferrer">{text}</a>
{:else}
	{text}
{/if}
