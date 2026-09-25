<script lang="ts">
	import { enhance } from '$app/forms';
	import { shortcut } from '$lib/shortcuts';

	export let cardId: string;
	export let customEnhance;
	export let answerOpen: boolean;
	let formRef: HTMLFormElement;

	const options = [
		{ value: 'Easy', text: 'super easy', shortcut: '4' },
		{ value: 'Good', text: 'easy', shortcut: '3' },
		{ value: 'Hard', text: 'difficult', shortcut: '2' },
		{ value: 'Challenging', text: 'super difficult', shortcut: '1' }
	];

	const handleShortcut = (event: KeyboardEvent) => {
		const answerKey = event.key === ' ' || event.key === 'Enter';
		if (!answerOpen) {
			if (answerKey) answerOpen = true;
			return;
		}

		const focusedButton = document.activeElement;
		const shortcutKey = answerKey ? '3' : event.key;
		const button =
			answerKey && focusedButton instanceof HTMLButtonElement && formRef.contains(focusedButton)
				? focusedButton
				: formRef.querySelector<HTMLButtonElement>(`[data-shortcut="${shortcutKey}"]`);
		button?.click();
	};
</script>

<form
	method="post"
	action="?/review"
	use:enhance={customEnhance}
	bind:this={formRef}
	use:shortcut={{ key: [' ', 'Enter', '1', '2', '3', '4'], callback: handleShortcut }}
>
	<input type="hidden" hidden name="cardId" value={cardId} />
	<div
		class="flex w-full flex-col border-t border-slate-200 sm:flex-row sm:rounded-br-md sm:rounded-bl-md dark:border-slate-700"
	>
		{#each options as { value, text, shortcut: shortcutKey } (value)}
			<button
				class="w-full border-b border-slate-200 bg-white px-4 py-4 text-center whitespace-nowrap ring-offset-white -outline-offset-2 transition-colors last:rounded-b-sm hover:bg-slate-100 hover:text-slate-900 hover:outline-solid focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:border-b-0 sm:border-l sm:first:rounded-bl-sm sm:first:border-l-0 sm:last:rounded-br-sm sm:last:rounded-bl-none dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950 dark:hover:bg-violet-900 dark:hover:text-violet-100 dark:focus-visible:ring-teal-300"
				name="difficulty"
				{value}
				data-shortcut={shortcutKey}
				title={`shortcut: ${shortcutKey}`}
			>
				<span>{text}</span>
			</button>
		{/each}
	</div>
</form>
