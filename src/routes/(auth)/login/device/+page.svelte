<script lang="ts">
	import { enhance } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';

	export let data;
	export let form;

	let formElement: HTMLFormElement;
	let timer: ReturnType<typeof setTimeout> | undefined;
	// google's minimum gap between checks, widened if it ever answers slow_down
	let pollMs = (data.intervalSeconds ?? 5) * 1000;

	// Progressive enhancement. Without JS the button below is the only way forward and the
	// person is the poll. With JS we press it for them on google's interval, which is what a
	// device with a real runtime would do anyway. use:enhance keeps the plain form post
	// working when this script never runs.
	const schedulePoll = () => {
		clearTimeout(timer);
		if (!formElement || !data.expiresAt || Date.now() > data.expiresAt) return;
		timer = setTimeout(() => formElement.requestSubmit(), pollMs);
	};

	$: if (form?.pending) {
		if (form.slowDown) pollMs += 5000;
		schedulePoll();
	}

	$: if (formElement && !form) schedulePoll();

	// Make the code itself clickable where the Clipboard API exists. Without JS it stays plain,
	// selectable text.
	let canCopy = false;
	let copied = false;
	let copyFailed = false;
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		canCopy = !!navigator.clipboard?.writeText;
	});

	const copyCode = async () => {
		// userCode is absent on the unavailable branch, where this button is not rendered
		if (!data.userCode) return;
		clearTimeout(copiedTimer);
		try {
			await navigator.clipboard.writeText(data.userCode);
			copied = true;
			copyFailed = false;
		} catch {
			// A refusal here is usually transient, such as the document not being focused, so
			// the button stays put and says so. The code is selectable regardless.
			copyFailed = true;
			copied = false;
		}
		copiedTimer = setTimeout(() => {
			copied = false;
			copyFailed = false;
		}, 2000);
	};

	onDestroy(() => {
		clearTimeout(timer);
		clearTimeout(copiedTimer);
	});
</script>

<svelte:head>
	<title>sign in - remember forever</title>
</svelte:head>

<div class="container mx-auto max-w-md px-4 py-16 text-center">
	{#if data.unavailable}
		<p class="text-gray-700">could not reach google right now. please try again in a moment.</p>
	{:else}
		<p class="text-gray-700">
			open
			<!-- opens away from this page on purpose: the code lives here, and sending someone off
			     to google in the same tab takes it off their screen mid-task -->
			<a class="underline" href={data.verificationUrl} target="_blank" rel="noopener noreferrer"
				>google.com/device</a
			>
			and enter:
		</p>

		<p class="mt-6 text-center text-4xl font-medium tracking-widest">
			{#if canCopy}
				<button
					class="cursor-copy select-all"
					type="button"
					title="click to copy"
					aria-label={`copy code ${data.userCode}`}
					on:click={copyCode}>{data.userCode}</button
				>
			{:else}
				<span class="select-all">{data.userCode}</span>
			{/if}
		</p>

		<p aria-live="polite" class="mt-2 min-h-6 text-center text-sm text-gray-500">
			{#if copied}copied{:else if copyFailed}couldn't copy, select it instead{:else if canCopy}click
				code to copy{/if}
		</p>

		<form class="mt-8" method="post" bind:this={formElement} use:enhance>
			<button class="w-full rounded-sm bg-gray-900 px-6 py-4 text-white" type="submit">
				continue
			</button>
		</form>

		<p role="status" class="mt-4 min-h-6 text-sm text-gray-500">
			{#if form?.pending}
				not approved yet. finish on your other device, then press continue.
			{:else if form?.denied}
				that request was declined. reload for a new code.
			{:else if form?.expired}
				that code has expired. reload for a new one.
			{:else if form?.failed}
				something went wrong. reload to try again.
			{/if}
		</p>
	{/if}
</div>
