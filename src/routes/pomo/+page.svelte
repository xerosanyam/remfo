<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { capture } from '$lib/posthog';
	import { Button } from '$lib/components/ui/button';

	import {
		POMODORO_SECONDS,
		addPending,
		deadlineOf,
		finish,
		format,
		readNotifChoice,
		readRunning,
		secondsLeft,
		writeNotifChoice,
		writeRunning
	} from '$lib/pomodoro.util';
	import type { Running } from '$lib/pomodoro.util';

	export let data;

	let running: Running | null = null;
	let left = POMODORO_SECONDS;
	let justFinished = false;
	let askNotif = false;
	let audioCtx: AudioContext | null = null;
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
			if (response.ok) {
				void capture('pomodoro_session_recorded', { completed: body.completed });
			} else {
				console.warn('Could not record pomodoro session:', response.status, await response.text());
				addPending(body);
			}
		} catch (cause) {
			console.warn('Could not record pomodoro session:', cause);
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
			ring();
			ringNotify();
			record(stored, now);
			return;
		}

		running = stored;
		left = secondsLeft(stored, now);
		if (!ticker) startTicking();
	}

	// Sound may only start within a user gesture. The Start click is that gesture, so the context
	// is created there; when the deadline arrives the context is already running and can ring.
	// Best-effort throughout: audio must never stop the timer from starting.
	function primeAudio() {
		if (typeof AudioContext === 'undefined') return;
		try {
			if (!audioCtx) audioCtx = new AudioContext();
		} catch {
			audioCtx = null;
			return;
		}
		if (audioCtx.state === 'suspended') {
			audioCtx.resume().catch(() => {});
		}
	}

	function ring() {
		if (!audioCtx) return;
		// Two quick notes, low to high, like a soft version of the classic pomodoro ding.
		for (const [at, freq] of [
			[0, 523.25],
			[0.18, 783.99]
		]) {
			const osc = audioCtx.createOscillator();
			const gain = audioCtx.createGain();
			osc.type = 'sine';
			osc.frequency.value = freq;
			gain.gain.setValueAtTime(0.001, audioCtx.currentTime + at);
			gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + at + 0.03);
			gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + at + 0.6);
			osc.connect(gain).connect(audioCtx.destination);
			osc.start(audioCtx.currentTime + at);
			osc.stop(audioCtx.currentTime + at + 0.7);
		}
	}

	// Best effort, and only when the user has said yes. A granted browser permission alone
	// is not consent: declining in-page opts out even if permission was granted elsewhere.
	function ringNotify() {
		if (readNotifChoice() !== true) return;
		if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
		try {
			const n = new Notification('pomo done', {
				body: '25 minutes are up',
				tag: 'pomo-done'
			});
			const close = () => n.close();
			n.onclick = () => {
				window.focus();
				close();
			};
			setTimeout(close, 15000);
		} catch (cause) {
			console.warn('Could not show pomodoro notification:', cause);
		}
	}

	async function allowNotifications() {
		askNotif = false;
		// Without the API there is nothing to grant: record the refusal so Start stops asking.
		if (typeof Notification === 'undefined') {
			writeNotifChoice(false);
			return;
		}
		let granted = false;
		try {
			granted = (await Notification.requestPermission()) === 'granted';
		} catch {
			granted = false;
		}
		writeNotifChoice(granted);
	}

	const declineNotifications = () => {
		askNotif = false;
		writeNotifChoice(false);
	};

	function start() {
		void capture('pomodoro_started');
		justFinished = false;
		primeAudio();
		// Ask once, on the first Start, never on load. The browser prompt would otherwise fire
		// uninvited; this asks in-page first and only touches Notification if they want it.
		if (readNotifChoice() === null) askNotif = true;
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

<div class="mx-auto flex max-w-md flex-col items-center gap-6 px-4 pt-16 pb-24 sm:pt-24">
	<h1 class="text-muted-foreground text-sm">pomo</h1>

	<!-- role=timer with aria-live off on purpose: announcing every second would make this unusable
	     with a screen reader. The completion message below is the polite announcement. -->
	<p role="timer" aria-live="off" class="font-mono text-6xl tabular-nums sm:text-7xl">
		{display}
	</p>

	<p aria-live="polite" class="text-muted-foreground min-h-5 text-sm">
		{#if justFinished}
			25 minutes done.{data.user ? '' : ' sign in to keep it.'}
		{:else if running}
			running
		{/if}
	</p>

	{#if running}
		<Button variant="outline" onclick={stop}>stop</Button>
	{:else}
		<Button variant="outline" onclick={start}>start 25 minutes</Button>
	{/if}

	{#if askNotif}
		<p class="text-muted-foreground text-center text-sm">
			let me notify you when the 25 minutes are done?
		</p>
		<div class="flex gap-2">
			<Button variant="outline" size="sm" onclick={allowNotifications}>yes</Button>
			<Button variant="outline" size="sm" onclick={declineNotifications}>no</Button>
		</div>
	{/if}

	{#if !data.user}
		<p class="text-muted-foreground text-center text-xs">
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
			<div class="bg-muted h-1 w-48">
				<div class="css-bar bg-foreground h-full"></div>
			</div>
			<label
				for="css-start"
				class="border-border hover:bg-muted cursor-pointer rounded-xs border px-6 py-2"
				>start 25 minutes</label
			>
			<p class="text-muted-foreground text-center text-xs">
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
