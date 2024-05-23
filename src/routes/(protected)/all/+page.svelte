<script lang="ts">
	export let data;
</script>

{#each data.cards as card}
	<div class="border">
		<div>{card.front}</div>
		<div>{card.back}</div>
		<form method="post" action="?/delete">
			<input type="hidden" name="id" value={card.id} />
			<button type="submit">Delete</button>
		</form>
		<hr />
	</div>
{/each}
