<script lang="ts">
	import AddNewCard from '../home/AddNewCard.svelte';
	import GenerateFlashCard from './GenerateFlashCard.svelte';
	export let data;
	export let form;

	type GeneratedCard = { question: string; answer: string };
	let added: string[] = [];
	let cards: GeneratedCard[] = [];
	$: {
		cards =
			form?.data?.filter((card: { question: string }) => !added.includes(card.question)) || [];
	}

	const addToList = (question: string) => {
		added = [...added, question];
		return true;
	};
</script>

<section class="body-font mx-auto mt-10 max-w-lg text-gray-600">
	<div class="container mx-auto">
		<GenerateFlashCard data={data.learnForm} />
		<div class="container mx-auto mt-10 flex flex-wrap justify-center text-center">
			{#if cards?.length > 0}
				{#each cards as card (card.question)}
					<div class="w-full p-4">
						<AddNewCard
							action="/learn?/add"
							data={{ ...data.addForm, data: { front: card.question, back: card.answer } }}
							onSubmit={(question: string) => addToList(question)}
						/>
					</div>
				{/each}
			{/if}
			{#if form?.error}
				<span class="mt-10 text-red-800">{form?.error}</span>
			{/if}
		</div>
	</div>
</section>
