<script>
	import PrimaryNav from '$lib/components/PrimaryNav.svelte';
	import '../app.css';
	export let data;
</script>

<PrimaryNav user={data?.user} />
<div class="sm:ml-44">
	<slot></slot>
</div>

<svelte:head>
	<title>remember forever</title>
	<meta name="description" content="a tool that helps you remember" />
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
