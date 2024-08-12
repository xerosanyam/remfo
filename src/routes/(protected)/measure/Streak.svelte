<script lang="ts">
	export let data = [];

	function calculateStreak(inputArray) {
		const dateSet = new Set(
			inputArray.map((item) => new Date(item.date).toLocaleDateString('en-CA'))
		);
		console.log(dateSet);

		const currentDate = new Date();

		let streak = 0;

		while (dateSet.has(currentDate.toLocaleDateString('en-CA'))) {
			streak++;
			currentDate.setDate(currentDate.getDate() - 1);
		}

		return streak;
	}
</script>

<div>
	<h2 class="text-center">Current Streak: <span class="text-xl">{calculateStreak(data)}</span></h2>
</div>
