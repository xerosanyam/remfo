<script lang="ts">
	import type { CardRevisePage } from '$lib/types/Card';
	import { formatDistanceToNow } from 'date-fns';
	import Trash from '~icons/arcticons/trashcan';
	import ReviewOptions from './ReviewOptions.svelte';
	import { enhance } from '$app/forms';
	import ContentRenderer from '$lib/components/ContentRenderer.svelte';

	export let card: CardRevisePage;
	export let customEnhance;
	export let modifyingCardId: string;
</script>

<div class="group relative rounded-md border border-gray-100 bg-white sm:h-96">
	<div class={`flex h-full w-full flex-col ${modifyingCardId === card.id ? 'blur-sm' : ''}`}>
		<div
			class="flex h-fit max-h-48 min-h-16 w-full justify-center overflow-y-auto rounded-md border-input ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			id="question"
		>
			<div class="w-full whitespace-break-spaces p-6">
				<ContentRenderer text={card.front} />
			</div>
		</div>

		<div class="relative flex min-h-48 grow border-t border-dashed">
			<form
				class="absolute -top-5 right-0 z-10 bg-white"
				method="post"
				action="?/delete"
				use:enhance={customEnhance}
			>
				<input type="hidden" hidden name="cardId" value={card.id} />
				<button
					class="flex items-center space-x-1 rounded-md border px-4 py-2 hover:bg-accent hover:text-accent-foreground hover:outline disabled:pointer-events-none disabled:opacity-50"
					disabled={modifyingCardId === card.id}
					type="submit"
					title="move to trash"
					data-testid="trash"
				>
					<Trash style="stroke-width:2px;" /><span></span>
				</button>
			</form>
			<!-- keyed so the disclosure collapses again when the next card takes this slot:
			     `open` is DOM state, and Svelte reuses this component across cards -->
			{#key card.id}
				<details class="h-full w-full overflow-y-auto" id="answer">
					<summary
						class="cursor-pointer p-6 text-gray-500 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						show answer
					</summary>
					<div class="answer-body whitespace-break-spaces px-6 pb-6">{card.back}</div>
				</details>
			{/key}
		</div>
		<div class="w-full">
			<ReviewOptions cardId={card.id} {customEnhance} />
		</div>
	</div>
</div>
<div class="p-2 text-right text-sm text-gray-500" title={String(card.createdAt)}>
	added {formatDistanceToNow(card.createdAt)} ago
</div>

<style>
	/* One reveal mechanism per medium, never two at once.

	   Default, and what touch and e-ink get: a plain <details>. The answer is hidden,
	   the summary is the button, and there is no blur. Blur is deliberately NOT applied
	   here. It is a large repaint on a display that refreshes slowly and ghosts, and it
	   makes the worst case worse: if this browser turns out not to support <details>, an
	   unblurred fallback shows the answer (usable, just look away) while a blurred one
	   would be permanently obscured with no way to reveal it.

	   Mouse pointers get the opposite: the answer sits under a blur and hovering the card
	   reveals it with no click, which is the original desktop interaction. The summary is
	   redundant clutter there, so it is taken out of the visual flow but kept in the
	   accessibility tree, returning on keyboard focus and whenever the disclosure is open
	   so there is always a visible way to close it. */
	@media (hover: hover) and (pointer: fine) {
		@supports (filter: blur(4px)) {
			/* Chrome 131+ hides closed content with content-visibility rather than
			   display:none, so the child override alone paints nothing. Verified by
			   screenshot in Chrome 152. Older engines ignore this rule harmlessly. */
			details::details-content {
				content-visibility: visible;
			}

			details:not([open]) > .answer-body {
				display: block;
				filter: blur(6px);
				user-select: none;
				/* the summary is out of flow here, so the answer takes over the top
				   padding it used to provide, and stays clear of the delete button */
				padding-top: 1.5rem;
			}

			details:not([open]):hover > .answer-body {
				filter: none;
				user-select: auto;
			}

			details:not([open]) > summary:not(:focus-visible) {
				position: absolute;
				width: 1px;
				height: 1px;
				margin: -1px;
				padding: 0;
				overflow: hidden;
				white-space: nowrap;
				clip-path: inset(50%);
			}
		}
	}
</style>
