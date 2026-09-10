<script>
	import PrimaryNav from '$lib/components/PrimaryNav.svelte';
	import '../app.css';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import posthog from 'posthog-js';

	export let data;

	onMount(() => {
		if (!data?.user?.id) return;

		posthog.identify(data.user.id, {
			email: data.user.email,
			name: data.user.name
		});
	});
	const webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
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
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted markup from vite-plugin-pwa -->
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
