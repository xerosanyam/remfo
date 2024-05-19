<script lang="ts">
	import Logout from '$lib/components/Logout.svelte';
	import CardAddTable from './CardAddTable.svelte';
	import CardReviewTable from './CardReviewTable.svelte';
	export let data;
</script>

<img src={data.user?.picture} alt="User's display" />
<h1>Hey {data.user?.name},</h1>

<ol type="A">
	<li>
		<CardAddTable data={data.addForm} />
		<hr />
	</li>
	<li>
		{#if data.cards.length > 0}
			<CardReviewTable data={data.reviewForm} card={data.cards[0]} />
		{/if}
		Total cards: {data.cards?.length}
		<hr />
	</li>
	<li>
		<h2>Others</h2>
		<nav>
			<ol>
				<li>
					<a href="/all">All Cards</a>
				</li>
				<li>
					<Logout />
				</li>
			</ol>
		</nav>
	</li>
</ol>
