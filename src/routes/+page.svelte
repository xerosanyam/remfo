<script>
	import Google from '$lib/components/Buttons/Google.svelte';
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
					<h3 class="font-medium">record</h3>
					<p class="text-gray-500 dark:text-gray-400">
						record new words, learnings, affirmations, anything
					</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<SoloLearn style="font-size:2.2rem;" />
				<div class="grid gap-1">
					<h3 class="font-medium">revise</h3>
					<p class="text-gray-500 dark:text-gray-400">
						app will intelligently schedule things for revision
					</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<BodyMeasures style="font-size:2rem;" />
				<div class="grid gap-1">
					<h3 class="font-medium">measure</h3>
					<p class="text-gray-500 dark:text-gray-400">visualize your progress</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<MyBrain style="font-size:2rem;" />
				<div class="grid gap-1">
					<h3 class="font-medium">powered by ai</h3>
					<p class="text-gray-500 dark:text-gray-400">... of course its powered by ai</p>
				</div>
			</li>
		</ul>
	</div>
	<div class="mt-10 hidden justify-center space-x-1 sm:flex">
		<Google text="sign up / login" />
	</div>
</div>
