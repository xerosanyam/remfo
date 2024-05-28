<script>
	import AddNewCard from '../home/AddNewCard.svelte';
	import GenerateFlashCard from './GenerateFlashCard.svelte';
	export let data;
	export let form;
</script>

<section class="body-font text-gray-600">
	<div class="container mx-auto px-5 py-10">
		<div class="mx-auto max-w-lg">
			<div class="mb-20 flex w-full flex-col text-center">
				<h1 class="title-font mb-4 text-2xl font-medium text-gray-900 sm:text-xl">
					What do you want to learn about?
				</h1>
				<GenerateFlashCard data={data.learnForm} />
			</div>
		</div>
		{#if form?.data}
			<div class="container mx-auto flex flex-wrap text-center">
				{#each form.data as card}
					<div class="w-full p-4 sm:w-1/2 md:w-1/4">
						<AddNewCard
							data={{ ...data.addForm, data: { front: card.question, back: card.answer } }}
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>
