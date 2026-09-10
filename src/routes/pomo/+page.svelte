<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import {
		POMODORO_SECONDS,
		addPending,
		deadlineOf,
		finish,
		format,
		readRunning,
		secondsLeft,
		writeRunning
	} from '$lib/pomodoro.util';
	import type { Running } from '$lib/pomodoro.util';

	export let data;

	let running: Running | null = null;
	let left = POMODORO_SECONDS;
	let justFinished = false;
	let ticker: ReturnType<typeof setInterval> | undefined;

	// A finished session holds at 0:00 rather than snapping back to 25:00, which would sit under
	// the words "25 minutes done" and read as though a fresh block were already queued up.
	$: display = format(running ? left : justFinished ? 0 : POMODORO_SECONDS);

	function stopTicking() {
		clearInterval(ticker);
		ticker = undefined;
	}

	// Ticks only drive the display. The value shown is recomputed from the deadline every time, so
	// a throttled tab that fires this once a minute shows the right number when it does.
	function startTicking() {
		stopTicking();
		ticker = setInterval(refresh, 1000);
	}

	async function record(session: Running, now: number) {
		const body = finish(session, now);
		if (!data.user) return addPending(body);

		try {
			const response = await fetch('/pomo/record', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body)
			});
			// Offline, edge hiccup, expired session: keep it locally rather than lose the minutes.
			if (!response.ok) addPending(body);
		} catch {
			addPending(body);
		}
	}

	function refresh() {
		const stored = readRunning();

		if (!stored) {
			running = null;
			stopTicking();
			return;
		}

		const now = Date.now();
		if (now >= deadlineOf(stored)) {
			// Clear storage before the await, so a second tab waking at the same moment cannot
			// read the same session and record it twice.
			writeRunning(null);
			running = null;
			left = 0;
			justFinished = true;
			stopTicking();
			record(stored, now);
			return;
		}

		running = stored;
		left = secondsLeft(stored, now);
		if (!ticker) startTicking();
	}

	function start() {
		justFinished = false;
		writeRunning({ startedAt: Date.now(), duration: POMODORO_SECONDS });
		refresh();
	}

	function stop() {
		const stopped = running;
		if (!stopped) return;

		writeRunning(null);
		running = null;
		left = POMODORO_SECONDS;
		stopTicking();
		record(stopped, Date.now());
	}

	onMount(() => {
		// Picks up a session left running by a reload, another tab, or a closed browser.
		refresh();
		// Two tabs share one timer instead of racing: whichever starts or stops, both follow.
		addEventListener('storage', refresh);
		// A suspended phone stops firing intervals entirely, so recheck the moment it comes back.
		// visibilitychange is fired at the document, so it is listened for there.
		document.addEventListener('visibilitychange', refresh);
	});

	onDestroy(() => {
		stopTicking();
		if (typeof removeEventListener === 'undefined') return;
		removeEventListener('storage', refresh);
		document.removeEventListener('visibilitychange', refresh);
	});
</script>

<svelte:head>
	<title>{running ? `${display} - pomo` : 'pomo'}</title>
	<meta name="description" content="a 25 minute timer, so time gets spent on purpose" />
</svelte:head>

<div class="mx-auto flex max-w-md flex-col items-center gap-6 px-4 pb-24 pt-16 sm:pt-24">
	<h1 class="text-sm text-gray-500">pomo</h1>

	<!-- role=timer with aria-live off on purpose: announcing every second would make this unusable
	     with a screen reader. The completion message below is the polite announcement. -->
	<p role="timer" aria-live="off" class="font-mono text-6xl tabular-nums sm:text-7xl">
		{display}
	</p>

	<p aria-live="polite" class="min-h-5 text-sm text-gray-500">
		{#if justFinished}
			25 minutes done.{data.user ? '' : ' sign in to keep it.'}
		{:else if running}
			running
		{/if}
	</p>

	{#if running}
		<button
			on:click={stop}
			class="rounded-sm border px-6 py-2 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2"
		>
			stop
		</button>
	{:else}
		<button
			on:click={start}
			class="rounded-sm border px-6 py-2 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2"
		>
			start 25 minutes
		</button>
	{/if}

	{#if !data.user}
		<p class="text-center text-xs text-gray-400">
			the timer works signed out. sessions are kept in this browser until you sign in.
		</p>
	{/if}

	<noscript>
		<!-- Registered custom properties are animatable and can feed a CSS counter, so the countdown
		     itself needs no JS. What it cannot do is make a sound or record the session, so this is
		     a working clock and nothing more. -->
		<input type="checkbox" id="css-start" class="sr-only" />
		<div class="flex flex-col items-center gap-4">
			<p class="css-timer font-mono text-6xl tabular-nums" aria-hidden="true"></p>
			<div class="h-1 w-48 bg-gray-200"><div class="css-bar h-full bg-gray-900"></div></div>
			<label for="css-start" class="cursor-pointer rounded-sm border px-6 py-2 hover:bg-gray-50"
				>start 25 minutes</label
			>
			<p class="text-center text-xs text-gray-400">
				without javascript the clock runs but nothing is saved and nothing will ring.
			</p>
		</div>
	</noscript>
</div>

<style>
	@property --pomo-minutes {
		syntax: '<integer>';
		initial-value: 25;
		inherits: false;
	}

	.css-timer::after {
		content: counter(pomo) ' min';
		counter-reset: pomo var(--pomo-minutes);
	}

	.css-timer,
	.css-bar {
		animation-duration: 1500s;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
		animation-play-state: paused;
	}

	.css-timer {
		animation-name: pomo-count;
	}

	.css-bar {
		width: 100%;
		animation-name: pomo-drain;
	}

	#css-start:checked ~ div :is(.css-timer, .css-bar) {
		animation-play-state: running;
	}

	@keyframes pomo-count {
		to {
			--pomo-minutes: 0;
		}
	}

	@keyframes pomo-drain {
		to {
			width: 0%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.css-bar {
			animation-name: none;
		}
	}
</style>
