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
			<div
				class="h-full w-full items-center overflow-y-auto whitespace-break-spaces p-6 ring-offset-background blur-md placeholder:text-muted-foreground hover:filter-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				id="answer"
			>
				{card.back}
			</div>
		</div>
		<div class="w-full">
			<ReviewOptions cardId={card.id} {customEnhance} />
		</div>
	</div>
</div>
<div class="p-2 text-right text-sm text-gray-200" title={String(card.createdAt)}>
	added {formatDistanceToNow(card.createdAt)} ago
</div>
