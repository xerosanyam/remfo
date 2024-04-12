<script lang="ts">
	import Logout from '$lib/components/Logout.svelte';
	import CardAddTable from './CardAddTable.svelte';
	import CardReviewTable from './CardReviewTable.svelte';
	export let data;
</script>

<ol type="A">
	<li>
		<CardAddTable data={data.addForm} />
		<hr />
	</li>
	<li>
		<CardReviewTable data={data.reviewForm} />
		<hr />
	</li>
	<li>
		<h2>Others</h2>
		<nav>
			<ol>
				<li>
					<Logout />
				</li>
			</ol>
		</nav>
	</li>
</ol>
