export type info = {
	date: string;
}[];

export const calculateStreak = (inputArray: info, currentDate: Date) => {
	const dateSet = new Set(
		inputArray.map((item) => new Date(item.date).toLocaleDateString('en-CA'))
	);

	let streak = 0;
	// copy: this used to walk the caller's Date backwards, mutating it
	const cursor = new Date(currentDate);

	while (dateSet.has(cursor.toLocaleDateString('en-CA'))) {
		streak++;
		cursor.setDate(cursor.getDate() - 1);
	}

	return streak;
};

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

	let sortedDates = [...dateSet].toSorted(
		(item1, item2) => new Date(item1).getTime() - new Date(item2).getTime()
	);
	// a lone active day is a streak of 1, so it starts and ends on itself
	let startDate = sortedDates[0] ?? '';
	let endDate = sortedDates[0] ?? '';
	let left = 0;
	for (let right = 1; right < sortedDates.length; right++) {
		if (isOneDayDifference(sortedDates[right], sortedDates[right - 1])) {
			if (maxStreak < right - left + 1) {
				maxStreak = right - left + 1;
				startDate = sortedDates[left];
				endDate = sortedDates[right];
			}
		} else {
			left = right;
		}
	}
	return { maxStreak, startDate, endDate };
};

type Sm2Card = {
	easiness: number;
	interval: number;
	repetitions: number;
	nextPractice: Date;
};

const DIFFICULTY_QUALITY = { Easy: 4, Good: 3, Hard: 2, Challenging: 1 } as const;
export type Sm2Difficulty = keyof typeof DIFFICULTY_QUALITY;

const MILLISECONDS_IN_DAY = 60 * 60 * 24 * 1000;

// SM-2, graded 1-4 rather than the original 0-5. Mutates and returns the card it is given:
// reviewCard passes the row straight to db.update().set().
export function calculateSuperMemo2Algorithm<T extends Sm2Card>(
	card: T,
	difficulty: Sm2Difficulty
) {
	const quality = DIFFICULTY_QUALITY[difficulty];

	if (quality >= 3) {
		if (card.repetitions === 0) {
			card.interval = 1;
		} else if (card.repetitions === 1) {
			card.interval = 6;
		} else {
			card.interval = Math.round(card.interval * card.easiness);
		}
		card.repetitions += 1;
	} else {
		card.repetitions = 0;
		card.interval = 1;
	}

	// easiness factor
	card.easiness = Math.max(
		1.3,
		card.easiness + (0.1 - (5.0 - quality) * (0.08 + (5.0 - quality) * 0.02))
	);

	// next practice
	card.nextPractice = new Date(Date.now() + MILLISECONDS_IN_DAY * card.interval);

	return card;
}
