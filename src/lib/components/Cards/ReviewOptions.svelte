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

<form method="post" action="?/review" use:enhance={customEnhance}>
	<input type="hidden" hidden name="cardId" value={cardId} />
	<div
		class="flex w-full flex-col border-t border-slate-200 dark:border-slate-700 sm:flex-row sm:rounded-bl-md sm:rounded-br-md"
	>
		{#each options as { value, text } (value)}
			<button
				class="w-full whitespace-nowrap border-b border-slate-200 bg-white px-4 py-4 text-center -outline-offset-2 ring-offset-white transition-colors last:rounded-b-sm hover:bg-slate-100 hover:text-slate-900 hover:outline focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950 dark:hover:bg-violet-900 dark:hover:text-violet-100 dark:focus-visible:ring-teal-300 sm:border-b-0 sm:border-l sm:first:rounded-bl-sm sm:first:border-l-0 sm:last:rounded-bl-none sm:last:rounded-br-sm"
				name="difficulty"
				{value}
			>
				<span>{text}</span>
			</button>
		{/each}
	</div>
</form>
