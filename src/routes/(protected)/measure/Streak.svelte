<script lang="ts">
	import { calculateMaxStreak, calculateStreak, type info } from '$lib/algo.utils';

	export let data: info = [];
	const maxStreakInfo = calculateMaxStreak(data);
	const streak = calculateStreak(data, new Date());
	// const compounded = `${(Math.pow(1.01, 365) * 100 - 100).toFixed(0)}%`;
</script>

<div
	class="rounded-xs border border-slate-200 p-2 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300"
>
	<div class="text-lg">
		Current Streak: <span class="cursor-default text-slate-950 dark:text-slate-50">{streak}</span>
	</div>
	{#if maxStreakInfo.maxStreak > 0}
		<div class="text-xs">
			Max Streak: {maxStreakInfo.maxStreak}
			({maxStreakInfo.startDate} - {maxStreakInfo.endDate})
		</div>
	{/if}
</div>
