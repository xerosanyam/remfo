<script lang="ts">
	import { calculateMaxStreak, calculateStreak, type info } from '$lib/algo.utils';

	export let data: info = [];
	const maxStreakInfo = calculateMaxStreak(data);
	const streak = calculateStreak(data, new Date());
	// const compounded = `${(Math.pow(1.01, 365) * 100 - 100).toFixed(0)}%`;
</script>

<div class="rounded-sm border p-2 text-center text-gray-500">
	<div class="text-lg">
		Current Streak: <span class="cursor-default text-gray-700">{streak}</span>
	</div>
	{#if maxStreakInfo.maxStreak > 0}
		<div class="text-xs">
			Max Streak: {maxStreakInfo.maxStreak}
			({maxStreakInfo.startDate} - {maxStreakInfo.endDate})
		</div>
	{/if}
</div>
