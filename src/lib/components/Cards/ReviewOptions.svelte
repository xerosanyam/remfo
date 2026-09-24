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
		class="border-border flex w-full flex-col border-t sm:flex-row sm:rounded-br-md sm:rounded-bl-md"
	>
		{#each options as { value, text, shortcut: shortcutKey } (value)}
			<button
				class="border-border bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring w-full border-b px-4 py-4 text-center whitespace-nowrap -outline-offset-2 transition-colors last:rounded-b-sm hover:outline-solid focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:border-b-0 sm:border-l sm:first:rounded-bl-sm sm:first:border-l-0 sm:last:rounded-br-sm sm:last:rounded-bl-none"
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
