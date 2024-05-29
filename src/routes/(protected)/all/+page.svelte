<script lang="ts">
	import { enhance } from '$app/forms';
	import { humanReadableDate } from '$lib/common.util';

	export let data;
	let modifyingCardId = '';

	const customEnhance = ({ formData }: { formData: FormData }) => {
		const tCardId = formData.get('id') as string;
		modifyingCardId = tCardId;
		return ({ update }: { update: () => void }) => {
			modifyingCardId = '';
			update();
		};
	};
</script>

<section class="body-font text-gray-600">
	<div class="container mx-auto flex max-w-screen-md flex-wrap px-5">
		{#each data.cards as card (card.id)}
			<div
				title={`Created: ${humanReadableDate(card.createdAt)}
Next practice: ${humanReadableDate(card.nextPractice)}`}
				class="relative mx-auto flex pt-10 sm:items-center md:w-2/3"
			>
				<div class="absolute inset-0 flex h-full w-6 items-center justify-center">
					<div class="pointer-events-none h-full w-1 bg-gray-200"></div>
				</div>
				<div
					class="title-font relative z-0 -mx-10 mt-10 inline-flex flex-shrink-0 items-center justify-center rounded-full bg-gray-800 p-2 text-sm font-medium text-white sm:mt-0"
				>
					{humanReadableDate(card.nextPractice)}
				</div>
				<div class="flex flex-grow flex-col items-start pl-6 sm:flex-row sm:items-center md:pl-8">
					<div class="mt-6 flex-grow sm:mt-0 sm:pl-10">
						<p class="title-font mb-1 text-lg font-medium text-gray-900">{card.front}</p>
						<p class="leading-relaxed">
							{card.back}
						</p>
						<div class="mt-2 flex items-center space-x-2">
							<form method="post" action="?/delete" use:enhance={customEnhance}>
								<input type="hidden" name="id" value={card.id} />
								<button
									class="rounded-md border bg-gray-800 px-2 py-1 text-white disabled:pointer-events-none disabled:opacity-50"
									disabled={modifyingCardId === card.id}
									type="submit">Delete</button
								>
							</form>
							<form method="post" action="?/reset" use:enhance>
								<input type="hidden" name="id" value={card.id} />
								<button
									class="rounded-md border px-2 py-1 disabled:pointer-events-none disabled:opacity-50"
									disabled={modifyingCardId === card.id}
									type="submit">Reset</button
								>
							</form>
							<span id={`${card.id.slice(-6)}`} class="text-xs text-gray-200">
								{card.id.slice(-6)}<br />
							</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
	{#if Object.keys(data.cards).length === 0}
		<div class="mt-10 text-center">
			No cards at the moment. Go to <a href="/" class="underline">home</a> to create a card.
		</div>
	{/if}
</section>
