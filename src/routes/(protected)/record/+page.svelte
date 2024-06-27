<script lang="ts">
	import Heatmap from '$lib/components/Heatmap/Heatmap.svelte';
	import AddNewCard from './AddNewCard.svelte';
	import NewCards from './NewCards.svelte';
	export let data;
</script>

<AddNewCard formData={data.addForm} />

<NewCards cards={data.cards} />

<div class="my-20 flex justify-center">
	<Heatmap data={data.groupedInfo} />
</div>
