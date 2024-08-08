<script lang="ts">
	import type { CardRevisePage } from '$lib/types/Card';
	import { formatDistanceToNow } from 'date-fns';
	import MyStar from '~icons/arcticons/mykyivstar';
	import Trash from '~icons/arcticons/trashcan';
	import ReviewOptions from './ReviewOptions.svelte';
	import { enhance } from '$app/forms';

	export let card: CardRevisePage;
	export let customEnhance;
	export let modifyingCardId: string;
</script>

<div class="mb-8 first:min-h-screen">
	<div
		class="group relative min-h-16 rounded-sm border border-dashed px-8 py-6 hover:border-gray-200"
	>
		<div class={modifyingCardId === card.id ? 'blur-sm' : ''}>
			<div class="flex space-x-2">
				<div>
					<MyStar />
				</div>
				<div class="flex w-full flex-col">
					<div
						class="mb-2 flex w-full whitespace-break-spaces rounded-md border-input ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						id="question"
					>
						{card.front}
					</div>
					<div class="border border-dashed">
						<div
							class="flex w-full whitespace-break-spaces rounded-md p-2 pb-10 pt-8 ring-offset-background blur-sm placeholder:text-muted-foreground hover:filter-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							id="answer"
						>
							{card.back}
						</div>
					</div>
					<ReviewOptions cardId={card.id} {customEnhance} />
				</div>
			</div>
		</div>
		<div
			class="absolute -right-28 bottom-0 hidden h-full flex-col-reverse px-2 opacity-0 group-hover:opacity-100 sm:flex"
		>
			<form method="post" action="?/delete" use:enhance={customEnhance}>
				<input type="hidden" name="cardId" value={card.id} />
				<button
					class="flex items-center space-x-1 rounded-md border bg-gray-800 px-4 py-2 text-white disabled:pointer-events-none disabled:opacity-50"
					disabled={modifyingCardId === card.id}
					type="submit"
				>
					<Trash style="stroke-width:2px;" /><span>delete</span>
				</button>
			</form>
		</div>
	</div>
	<div class="text-right text-sm text-gray-200" title={String(card.createdAt)}>
		added {formatDistanceToNow(card.createdAt)} ago
	</div>
</div>
