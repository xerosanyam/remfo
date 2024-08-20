export type info = {
	date: string;
}[]

export const calculateStreak = (inputArray: info, currentDate: Date) => {
	const dateSet = new Set(
		inputArray.map((item) => new Date(item.date).toLocaleDateString('en-CA'))
	);

	let streak = 0;

	while (dateSet.has(currentDate.toLocaleDateString('en-CA'))) {
		streak++;
		currentDate.setDate(currentDate.getDate() - 1);
	}

	return streak;
}

function isOneDayDifference(date1: string, date2: string) {
	const d1 = new Date(date1);
	const d2 = new Date(date2);

	d1.setHours(0, 0, 0, 0);
	d2.setHours(0, 0, 0, 0);

	const diffInDays = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);

	return Math.abs(diffInDays) === 1;
}



export const calculateMaxStreak = (inputArray: info) => {
	const dateSet = new Set(
		inputArray.map((item) => new Date(item.date).toLocaleDateString('en-CA'))
	);
	let maxStreak = dateSet.size >= 1 ? 1 : 0;
	let startDate = '';
	let endDate = '';

	let sortedDates = [...dateSet].toSorted((item1, item2) => (new Date(item1).getTime() - new Date(item2).getTime()))
	let left = 0;
	for (let right = 1; right < sortedDates.length; right++) {
		if (isOneDayDifference(sortedDates[right], sortedDates[right - 1])) {
			if (maxStreak < (right - left + 1)) {
				maxStreak = right - left + 1;
				startDate = sortedDates[left];
				endDate = sortedDates[right];
			}

		} else {
			left = right
		}
	}
	return { maxStreak, startDate, endDate };
}