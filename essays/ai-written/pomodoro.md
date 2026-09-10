# Pomodoro (/pomo)

Design notes for `remfo-e4k`. Written after grilling the requirement, so the
reversals are recorded on purpose: the discarded options are the useful part.

## What it is

A public 25-minute countdown at `/pomo`. Name the task, press start, get
interrupted. Signed-in sessions are logged; logged-out ones are buffered and
claimed later. Headline metric: total focus minutes logged.

## Countdown, not count-up

A count-up stopwatch fits the stated metric better and deletes the entire
alarm problem, because there is no alarm. It was considered and rejected: the
point is not to measure focus, it is to stop time being spent badly. A
countdown interrupts, and the interruption is the feature.

Consequence, accepted knowingly: "do not break my flow" cannot survive a tool
whose job is to break it. What survives is that the interruption is short and
offers Continue.

## The alarm is best effort, and that is correct

A notification can only be posted by code that runs. A backgrounded desktop
tab is throttled but still fires within about a minute. A locked phone freezes
the page entirely, so nothing fires and the session shows as finished on
return.

Ringing a locked phone needs Web Push: a service worker, VAPID keys, stored
subscriptions, a scheduled server-side send, and on iOS a home-screen install.
That is the largest single piece of work in the feature, for a ring at minute 25. Deferred until there is evidence of using `/pomo` from a locked phone.

Wake Lock does not help here. It keeps the screen from dimming while the page
is visible and auto-releases the moment the tab is hidden, which is exactly
when the problem occurs.

## Timer state

A deadline timestamp, never an accumulating `setInterval` count. Throttled
tabs drop ticks; a deadline cannot drift. Held in one localStorage key with a
`storage` listener, so two open tabs mirror one timer instead of racing, and a
reload resumes. A stale deadline found on the next visit is recorded as an
abandoned session rather than lost.

## Storage

One row per session, inserted at the END of the session, not the start. No
orphan rows from closed tabs, no update path, and localStorage is the source
of truth while the timer runs.

`activity` is populated by SQL triggers, not app code (`migrations/0001`), so
pomodoro follows suit: an `AFTER INSERT` trigger on `pomodoro_session` writes
an `activity` row, `WHEN completed = 1` only. Abandoned sessions keep their
minutes in `pomodoro_session` but stay out of the heatmap. The `WHEN` clause
mirrors `log_card_update` in `0003`.

This is what forces `activity.card_id` to become nullable. SQLite cannot
`ALTER COLUMN`, so it is a table rebuild. The triggers live on `card`, not on
`activity`, so dropping and recreating `activity` leaves them intact.

The fat attributes stay in `pomodoro_session`; `activity` stays a thin event
stream of who, what, when. That is what makes a future `/log` cheap.

## No JS

The `@property` CSS countdown genuinely works, and is the fallback:

```css
@property --t {
	syntax: '<integer>';
	initial-value: 1500;
	inherits: false;
}
.t {
	animation: tick 1500s linear forwards;
	counter-reset: t var(--t);
}
.t::after {
	content: counter(t);
}
@keyframes tick {
	to {
		--t: 0;
	}
}
```

Firefox shipped `@property` in 128, so all three target browsers are covered.
Pause works via a checkbox toggling `animation-play-state`. What CSS cannot do
is make a sound or log a row, so JS-off gets a working visual countdown and
nothing else.

Note that offline and no-JS point in opposite directions: offline needs _more_
JS, not less, since it wants a service worker.

## Anonymous sessions

Buffered in localStorage, claimed on sign-up, no cap and no expiry. Someone
who signs up a month later reclaims everything. An unauthenticated client is
therefore posting its own history and being believed. Accepted: this is a tool
for a personal journey, and inflating your own focus minutes only lies to
yourself.

The exception, which is not a trust question: the LLM endpoint is signed-in
only. An unauthenticated endpoint spending the OpenAI key is a billing hole,
not self-deception.

## Task capture

Before start, not after. A task named after the time is spent is a log entry;
a task named before it is a commitment, and it is the only position where a
quality suggestion can still change the outcome. The suggestion streams in
beside the running timer and never blocks Start.

On completion the screen shows the task and offers Break or Continue. The
button pressed is the recorded outcome, so there is no separate
"did you do it" question to answer while being interrupted.

## Known gaps

- `activity` timestamps are UTC epoch, so a late-night session lands on the
  wrong day in the heatmap. Pre-existing, inherited rather than introduced.
- The friend timeline is a different product: a follow graph, privacy rules,
  an abuse surface. Its only concession here is that `activity` rows stay
  generic, which the trigger already gives for free.
