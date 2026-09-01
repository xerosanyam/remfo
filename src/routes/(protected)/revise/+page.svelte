<script lang="ts">
	import CardReview from '$lib/components/Cards/CardReview.svelte';
	export let data;
</script>

<CardReview cards={data.cards} />
