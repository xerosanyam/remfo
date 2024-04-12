<script lang="ts">
	import CardAddTable from './CardAddTable.svelte';
	import CardReviewTable from './CardReviewTable.svelte';
	export let data;
</script>

<CardAddTable data={data.addForm} />
<hr />
<CardReviewTable data={data.reviewForm} />
