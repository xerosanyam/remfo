<script>
	import Google from '$lib/components/Buttons/Google.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import JotTextEditor from '~icons/arcticons/jotatexteditor';
	import BodyMeasures from 'virtual:icons/arcticons/body-measures';
	import MyBrain from 'virtual:icons/arcticons/my-brain';
	import SoloLearn from 'virtual:icons/arcticons/sololearn';
</script>

<div class="container mx-auto h-screen max-w-lg items-center py-8">
	<div class="mx-auto font-sans">
		<h1 class="mb-2 text-3xl font-medium">A tool that helps you remember.</h1>
		<ul class="mt-8 grid gap-8">
			<li class="flex items-start gap-4">
				<JotTextEditor style="font-size:2rem;" />
				<div class="grid gap-1">
					<h3 class="font-medium">Record</h3>
					<p class="text-gray-500 dark:text-gray-400">Record new learnings, words, anything</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<SoloLearn style="font-size:2.2rem;" />
				<div class="grid gap-1">
					<h3 class="font-medium">Revise</h3>
					<p class="text-gray-500 dark:text-gray-400">
						Just before you forget, the app will nudge you to revise
					</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<BodyMeasures style="font-size:2rem;" />
				<div class="grid gap-1">
					<h3 class="font-medium">Measure</h3>
					<p class="text-gray-500 dark:text-gray-400">
						Visualize your progress to achieve your goals
					</p>
				</div>
			</li>
			<li class="flex items-start gap-4">
				<MyBrain style="font-size:2rem;" />
				<div class="grid gap-1">
					<h3 class="font-medium">Powered by AI</h3>
					<p class="text-gray-500 dark:text-gray-400">.. ofcourse its powered by AI</p>
				</div>
			</li>
		</ul>
	</div>
	<div class="mt-8 flex justify-center">
		<Google text="Sign Up with Google" />
	</div>
</div>

<Footer />
