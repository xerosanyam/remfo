<script>
	import { ROUTES } from '$lib/routes.util';
</script>

<svelte:head>
	<title>privacy policy — remember forever</title>
	<meta
		name="description"
		content="How Remember Forever collects, uses, stores, and shares personal data."
	/>
</svelte:head>

<article class="container mx-auto max-w-2xl space-y-6 px-4 py-12 text-gray-800">
	<h1 class="text-3xl font-medium">privacy policy</h1>
	<p class="text-sm text-gray-500">effective September 2, 2026</p>

	<p>
		Remember Forever (“Remfo”) is a spaced-repetition flashcard service. This policy explains what
		data it handles and why.
	</p>

	<section class="space-y-2">
		<h2 class="text-xl font-medium">Google user data: access and use</h2>
		<p>
			When you sign in with Google, Remfo accesses your name, email address, profile picture,
			locale, and email-verification status. Remfo uses this Google account data only to create,
			identify, secure, and display your Remfo account. Remfo does not use it for advertising.
		</p>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-medium">Google user data: storage and retention</h2>
		<p>
			Your Google profile fields are stored in Remfo’s Turso database while your account remains
			active. Google access and refresh tokens are not stored. A short-lived, HTTP-only cookie holds
			the device-login code until completion, denial, or expiry.
		</p>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-medium">Google user data: sharing and disclosure</h2>
		<p>
			Vercel processes Google profile data while hosting Remfo, and Turso stores it for account and
			session operation. Remfo does not send Google profile data to PostHog, Vercel Analytics, or
			OpenAI. Remfo does not sell it or disclose it for advertising.
		</p>
		<p>
			Remfo’s use and transfer of information received from Google APIs complies with the Google API
			Services User Data Policy, including its Limited Use requirements.
		</p>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-medium">other data</h2>
		<p>
			Remfo stores flashcards you create, their review schedule, and review activity so the service
			can show and schedule your cards.
		</p>
		<p>
			PostHog and Vercel Analytics process site visits, interactions, and technical information such
			as browser and device details. Remfo uses this data to troubleshoot and improve the service.
			If you choose “generate with AI,” text you enter there is sent to OpenAI to generate
			flashcards.
		</p>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-medium">data protection</h2>
		<p>
			Remfo uses HTTPS, server-side authorization checks, access-controlled database credentials,
			and HTTP-only, Secure, SameSite session cookies. No internet service can guarantee absolute
			security.
		</p>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-medium">retention and deletion</h2>
		<p>
			Account data, flashcards, and review history are retained while your account remains active.
			Service-provider logs and backups follow each provider’s retention schedule. Email
			<a class="underline" href="mailto:code.sanyam@gmail.com">code.sanyam@gmail.com</a> to request deletion
			or a copy of your data. A verified deletion request removes your account, sessions, flashcards,
			and review activity from Remfo’s active database.
		</p>
	</section>

	<section class="space-y-2">
		<h2 class="text-xl font-medium">policy changes</h2>
		<p>
			This policy may change when the service or its data practices change. Material updates will be
			posted here with a new effective date.
		</p>
	</section>

	<p><a class="underline" href={ROUTES.LOGIN}>return to remember forever</a></p>
</article>
