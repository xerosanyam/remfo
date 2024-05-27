<script lang="ts">
	import AddNewCard from './AddNewCard.svelte';
	import ReviewCard from './ReviewCard.svelte';
	export let data;
</script>

<section class="body-font text-gray-600">
	<div class="container mx-auto flex max-w-screen-md flex-wrap px-5 py-10">
		<div class="flex w-full flex-wrap">
			<div class="p-4 md:w-full lg:w-1/2">
				<AddNewCard data={data.addForm} />
			</div>
			<div class="p-4 md:w-full lg:w-1/2">
				{#if data.card}
					<ReviewCard data={data.reviewForm} card={data.card} />
				{/if}
			</div>
		</div>
	</div>
</section>
