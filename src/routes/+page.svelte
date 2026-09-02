<script>
	import Google from '$lib/components/Buttons/Google.svelte';
	import { ROUTES } from '$lib/routes.util';
	export let data;
	import JotTextEditor from '~icons/arcticons/jotatexteditor';
	import BodyMeasures from 'virtual:icons/arcticons/body-measures';
	import MyBrain from 'virtual:icons/arcticons/my-brain';
	import SoloLearn from 'virtual:icons/arcticons/sololearn';
</script>

<div class="container mx-auto h-screen max-w-lg items-center py-8">
	<div class="mx-auto font-sans">
		<h1 class="mb-2 text-3xl font-medium">a tool that helps you remember.</h1>
		<ul class="mt-10 grid gap-8">
			<li class="flex items-start gap-4">
				<JotTextEditor style="font-size:2rem;" />
				<div class="grid gap-1">
					<h2 class="font-medium">record</h2>
					<p class="text-gray-500 dark:text-gray-400">
						record new words, learnings, affirmations, anything
					</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<SoloLearn style="font-size:2.2rem;" />
				<div class="grid gap-1">
					<h2 class="font-medium">revise</h2>
					<p class="text-gray-500 dark:text-gray-400">
						app will intelligently schedule things for revision
					</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<BodyMeasures style="font-size:2rem;" />
				<div class="grid gap-1">
					<h2 class="font-medium">measure</h2>
					<p class="text-gray-500 dark:text-gray-400">visualize your progress</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<MyBrain style="font-size:2rem;" />
				<div class="grid gap-1">
					<h2 class="font-medium">powered by ai</h2>
					<p class="text-gray-500 dark:text-gray-400">... of course its powered by ai</p>
				</div>
			</li>
		</ul>
	</div>
	<div class="mt-10 hidden justify-center space-x-1 sm:flex">
		<Google text="sign up / login" />
	</div>

	<!-- The fallback stays a quiet link, never a second button: it must not compete with the
	     primary call to action for people whose browser google accepts. It sits outside the
	     wrapper above, which is hidden below the sm breakpoint, so it stays reachable at the
	     narrow widths where this is actually needed. -->
	<p class="mx-auto mt-6 max-w-xs text-center text-sm text-gray-500">
		{#if data.bouncedFromGoogle}
			couldn't sign in? some browsers can't load google's sign-in page.
			<a class="whitespace-nowrap underline" href={ROUTES.LOGIN_DEVICE}>sign in with a code</a>
		{:else}
			<a class="underline" href={ROUTES.LOGIN_DEVICE}>trouble signing in? use a code</a>
		{/if}
	</p>
</div>
