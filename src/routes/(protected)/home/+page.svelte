<script lang="ts">
	import AddNewCard from './AddNewCard.svelte';
	import ReviewCard from './ReviewCard.svelte';
	export let data;
</script>

<section class="body-font text-gray-600">
	<div class="container mx-auto flex max-w-screen-md flex-wrap px-5 py-10">
		<div class="flex w-full flex-wrap justify-center">
			<div class="p-4 md:w-full lg:w-1/2">
				<AddNewCard data={data.addForm} showHeading={true} />
			</div>
			{#if Object.keys(data.card).length > 0}
				<div class="p-4 md:w-full lg:w-1/2">
					<ReviewCard data={data.reviewForm} card={data.card} />
				</div>
			{/if}
		</div>
	</div>
</section>
