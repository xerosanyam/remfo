<script lang="ts">
	import AddNewCard from '../home/AddNewCard.svelte';
	import GenerateFlashCard from './GenerateFlashCard.svelte';
	export let data;
	export let form;

	let added: string[] = [];
	let cards: any = [];
	$: {
		cards =
			form?.data?.filter((card: { question: string }) => !added.includes(card.question)) || [];
	}

	const addToList = (question: string) => {
		added = [...added, question];
		return true;
	};
</script>

<section class="body-font text-gray-600">
	<div class="container mx-auto px-5 py-10">
		<div class="mx-auto max-w-lg">
			<div class="mb-10 flex w-full flex-col text-center">
				<h1 class="title-font mb-4 text-2xl font-medium text-gray-900 sm:text-xl">
					What do you want to learn about?
				</h1>
				<GenerateFlashCard
					data={{ ...data.learnForm, data: { userInput: form?.userInput || '' } }}
				/>
			</div>
		</div>
		<div class="container mx-auto flex flex-wrap justify-center text-center">
			{#if cards?.length > 0}
				{#each cards as card (card.question)}
					<div class="w-full p-4 sm:w-1/2 md:w-1/3">
						<AddNewCard
							data={{ ...data.addForm, data: { front: card.question, back: card.answer } }}
							onSubmit={(question:string ) => addToList(question)}
						/>
					</div>
				{/each}
			{/if}
			{#if form?.error}
				<span class=" text-red-800">{form?.error}</span>
			{/if}
		</div>
	</div>
</section>
