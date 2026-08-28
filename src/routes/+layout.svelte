<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import PrimaryNav from '$lib/components/PrimaryNav.svelte';
	import '../app.css';
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });

	// loaded lazily so the posthog SDK stays off the critical path and out of the root layout chunk
	onMount(async () => {
		const { default: posthog } = await import('posthog-js');
		posthog.init('phc_9926SwyRC8yPRYf8le7laIwsnf1ygzhp3TtwXpYJ8Eq', {
			api_host: 'https://us.i.posthog.com',
			person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
		});
	});
	export let data;
	import { pwaInfo } from 'virtual:pwa-info';

	$: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<PrimaryNav user={data?.user} />
<main class="sm:ml-44">
	<slot></slot>
</main>

<svelte:head>
	<title>remember forever</title>
	<meta name="description" content="a tool that helps you remember" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	{@html webManifestLink}
	<script type="application/ld+json">
		{
			"@context": "https://schema.org/",
			"@type": "Quiz",
			"about": {
				"@type": "Thing",
				"name": "Cell Transport"
			},
			"educationalAlignment": [
				{
					"@type": "AlignmentObject",
					"alignmentType": "educationalSubject",
					"targetName": "Biology"
				}
			],
			"hasPart": [
				{
					"@context": "https://schema.org/",
					"@type": "Question",
					"eduQuestionType": "Flashcard",
					"text": "This is some fact about receptor molecules.",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "receptor molecules"
					}
				},
				{
					"@context": "https://schema.org/",
					"@type": "Question",
					"eduQuestionType": "Flashcard",
					"text": "This is some fact about the cell membrane.",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "cell membrane"
					}
				}
			]
		}
	</script>
</svelte:head>
<SvelteToast />
