<script lang="ts">
	export let data;
</script>

<section class="body-font text-gray-600">
	<div class="container mx-auto flex max-w-screen-md flex-wrap px-5">
		{#each data.cards as card}
			<div class="relative mx-auto flex pb-10 pt-10 sm:items-center md:w-2/3">
				<div class="absolute inset-0 flex h-full w-6 items-center justify-center">
					<div class="pointer-events-none h-full w-1 bg-gray-200"></div>
				</div>
				<div
					class="title-font relative z-0 -mx-10 mt-10 inline-flex flex-shrink-0 items-center justify-center rounded-full bg-gray-800 p-2 text-sm font-medium text-white sm:mt-0"
				>
					{`${new Date(card.nextPractice).getDate()} - ${new Date(card.nextPractice).getMonth()} - ${new Date(card.nextPractice).getFullYear()}`}
				</div>
				<div class="flex flex-grow flex-col items-start pl-6 sm:flex-row sm:items-center md:pl-8">
					<div class="mt-6 flex-grow sm:mt-0 sm:pl-10">
						<p class="title-font mb-1 text-lg font-medium text-gray-900">{card.front}</p>
						<p class="leading-relaxed">
							{card.back}
						</p>
						<div class="mt-2 flex items-center space-x-2">
							<form method="post" action="?/delete">
								<input type="hidden" name="id" value={card.id} />
								<button class="rounded-md border bg-gray-800 px-2 py-1 text-white" type="submit"
									>Delete</button
								>
							</form>
							<form method="post" action="?/reset">
								<input type="hidden" name="id" value={card.id} />
								<button class="rounded-md border px-2 py-1" type="submit">Reset</button>
							</form>
							<span class="text-xs text-gray-200">{card.id.slice(-6)}</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
