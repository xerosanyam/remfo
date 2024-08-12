<script lang="ts">
	import { calculateMaxStreak, calculateStreak, type info } from '$lib/algo.utils';

	export let data: info = [];
	const maxStreakInfo = calculateMaxStreak(data);
</script>

<div class="text-center text-gray-500">
	<div class="text-lg">
		Current Streak: <span class="text-gray-700">{calculateStreak(data, new Date())}</span>
	</div>
	{#if maxStreakInfo.maxStreak > 0}
		<div class="text-xs">
			Max Streak: {maxStreakInfo.maxStreak}
			({maxStreakInfo.startDate} - {maxStreakInfo.endDate})
		</div>
	{/if}
</div>
