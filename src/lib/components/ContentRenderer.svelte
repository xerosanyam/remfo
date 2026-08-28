<script lang="ts">
	export let text = '';

	// ponytail: extension sniff only. The old check loaded the URL with `new Image()` to see if it
	// decoded, which fired a cross-origin request per card - leaking users' card URLs to those
	// origins and setting their third-party cookies. Extension-less image URLs now render as links;
	// revisit with a HEAD request if that turns out to matter.
	const IMAGE_PATH = /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i;

	function parseHttpUrl(value: string): URL | null {
		try {
			const url = new URL(value);
			// card text is user input rendered into an href, so keep javascript:/data: out
			return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
		} catch {
			return null;
		}
	}

	$: url = parseHttpUrl(text);
	$: isImageUrl = !!url && IMAGE_PATH.test(url.pathname);
</script>

{#if isImageUrl}
	<img src={text} alt="content" />
{:else if url}
	<a class="underline" href={text} target="_blank" rel="noopener noreferrer">{text}</a>
{:else}
	{text}
{/if}
