<script lang="ts">
	import AddNewCard from './AddNewCard.svelte';
	import NewCards from './NewCards.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import * as Empty from '$lib/components/ui/empty';

	export let data;
</script>

<svelte:head>
	<title>Remfo | Record</title>
</svelte:head>

<AddNewCard formData={data.addForm} />

{#if data.cards}
	{#if data.cards.cards.length > 0}
		<NewCards cards={data.cards.cards} totalCards={data.cards.totalCards} limit={data.limit} />
	{:else}
		<Empty.Root class="mx-auto mt-8 max-w-lg">
			<Empty.Header>
				<Empty.Title>nothing here yet</Empty.Title>
				<Empty.Description>your first card is one save away. write it above.</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
{:else}
	<Alert.Root variant="destructive" class="mx-auto mt-8 max-w-lg">
		<Alert.Title>could not load your cards.</Alert.Title>
		<Alert.Description>the add form above still works. try reloading.</Alert.Description>
	</Alert.Root>
{/if}
