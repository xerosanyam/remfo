<script lang="ts">
	import { enhance } from '$app/forms';

	export let cardId: string;
	export let customEnhance;

	const options = [
		{ value: 'Easy', text: 'super easy' },
		{ value: 'Good', text: 'easy' },
		{ value: 'Hard', text: 'difficult' },
		{ value: 'Challenging', text: 'super difficult' }
	];
</script>

<form
	method="post"
	action="?/review"
	class="mt-2 flex w-full space-x-2"
	use:enhance={customEnhance}
>
	<input type="hidden" name="cardId" value={cardId} />
	{#each options as { value, text } (value)}
		<button
			class="w-full whitespace-nowrap rounded-md border border-input bg-background px-4 py-4 text-center ring-offset-background transition-colors hover:border-solid hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			name="difficulty"
			{value}
		>
			<span>{text}</span>
		</button>
	{/each}
</form>
