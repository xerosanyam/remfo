<script lang="ts">
	import { calculateMaxStreak, calculateStreak, type info } from '$lib/algo.utils';
	import * as Card from '$lib/components/ui/card';

	export let data: info = [];
	const maxStreakInfo = calculateMaxStreak(data);
	const streak = calculateStreak(data, new Date());
	// const compounded = `${(Math.pow(1.01, 365) * 100 - 100).toFixed(0)}%`;
</script>

<Card.Root class="text-center">
	<Card.Header>
		<Card.Title>Current Streak: {streak}</Card.Title>
		{#if maxStreakInfo.maxStreak > 0}
			<Card.Description>
				Max Streak: {maxStreakInfo.maxStreak}
				({maxStreakInfo.startDate} - {maxStreakInfo.endDate})
			</Card.Description>
		{/if}
	</Card.Header>
</Card.Root>
