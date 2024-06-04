<script lang="ts">
	import AddNewCard from './AddNewCard.svelte';
	import NewCards from './NewCards.svelte';
	export let data;
</script>

{#await data.addForm then value}
	<AddNewCard formData={value} />
{/await}

{#await data.cards then value}
	<NewCards cards={value} />
{/await}
