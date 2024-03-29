<script lang="ts">
	import CardAddForm from './CardAddForm.svelte';
	export let data;
</script>

<h1>Add something you'd like to remember:</h1>
<CardAddForm data={data.form} />
