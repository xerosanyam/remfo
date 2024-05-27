<script>
	import AddNewCard from '../home/AddNewCard.svelte';
	export let data;
</script>

<section class="body-font text-gray-600">
	<div class="container mx-auto px-5 py-10">
		<div class="mx-auto max-w-lg">
			<div class="mb-20 flex w-full flex-col text-center">
				<h1 class="title-font mb-4 text-2xl font-medium text-gray-900 sm:text-xl">
					What do you want to learn about?
				</h1>
				<textarea
					class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					id="question"
					name="front"
					placeholder="Capital of Paris?"
					rows="4"
				></textarea>
				<div>
					<button class="mt-4 w-auto rounded-sm bg-gray-900 px-2 py-1 text-white" type="submit"
						>Generate flashcards</button
					>
				</div>
			</div>
		</div>
		<div class="-m-4 flex flex-wrap text-center">
			<div class="w-full p-4 sm:w-1/2 md:w-1/4">
				<AddNewCard data={data.addForm} />
			</div>
		</div>
	</div>
</section>
