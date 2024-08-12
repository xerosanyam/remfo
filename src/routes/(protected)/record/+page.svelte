<script lang="ts">
	import AddNewCard from './AddNewCard.svelte';
	import NewCards from './NewCards.svelte';
	export let data;
</script>

<AddNewCard formData={data.addForm} />

<NewCards cards={data.cards} />