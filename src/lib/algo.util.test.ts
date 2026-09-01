import {
	calculateMaxStreak,
	calculateStreak,
	calculateSuperMemo2Algorithm,
	type info
} from '$lib/algo.utils';
import { afterEach, describe, expect, test, vi } from 'vitest';

const days = (...dates: string[]): info => dates.map((date) => ({ date }));

// The streak functions bucket timestamps with toLocaleDateString, so results depend on the
// runtime timezone. These fixtures use bare 'YYYY-MM-DD' strings, which Date parses as UTC
// midnight and every timezone west of UTC then renders as the previous day - so the assertions
// below are written against dates, not against a hardcoded timezone.
const localDay = (iso: string) => new Date(iso).toLocaleDateString('en-CA');

describe('calculateStreak', () => {
	test('counts consecutive days back from today', () => {
		const streak = calculateStreak(
			days('2021-01-05', '2021-01-06', '2021-01-07'),
			new Date('2021-01-07')
		);
		expect(streak).toBe(3);
	});

	test('stops at the first gap', () => {
		const streak = calculateStreak(
			// 01-04 is stranded behind the gap at 01-05
			days('2021-01-03', '2021-01-04', '2021-01-06', '2021-01-07'),
			new Date('2021-01-07')
		);
		expect(streak).toBe(2);
	});

	test('counts a day only once when it has several activities', () => {
		const streak = calculateStreak(
			days('2021-01-07', '2021-01-07', '2021-01-07'),
			new Date('2021-01-07')
		);
		expect(streak).toBe(1);
	});

	test('is 0 for no activity', () => {
		expect(calculateStreak(days(), new Date('2021-01-07'))).toBe(0);
	});

	// Pinning a product decision, not an endorsement: the streak drops to 0 the moment the day
	// rolls over, before the user has had a chance to review. Most streak UIs keep yesterday's
	// streak alive until the day ends. See remfo bead on streak grace period.
	test('is 0 when yesterday was active but today is not', () => {
		expect(calculateStreak(days('2021-01-06'), new Date('2021-01-07'))).toBe(0);
	});

	test('does not mutate the Date it is given', () => {
		const today = new Date('2021-01-07T12:00:00.000Z');
		const snapshot = today.toISOString();
		calculateStreak(days('2021-01-06T12:00:00.000Z', '2021-01-07T12:00:00.000Z'), today);
		expect(today.toISOString()).toBe(snapshot);
	});
});

describe('calculateMaxStreak', () => {
	test('finds the longest run and reports its bounds', () => {
		const result = calculateMaxStreak(
			days('2021-01-01', '2021-01-02', '2021-01-03', '2021-01-04', '2021-01-06', '2021-01-07')
		);
		expect(result.maxStreak).toBe(4);
		expect(result.startDate).toBe(localDay('2021-01-01'));
		expect(result.endDate).toBe(localDay('2021-01-04'));
	});

	test('finds the longest run when it is not the first run', () => {
		const result = calculateMaxStreak(
			days('2021-01-01', '2021-01-02', '2021-01-05', '2021-01-06', '2021-01-07', '2021-01-08')
		);
		expect(result.maxStreak).toBe(4);
		expect(result.startDate).toBe(localDay('2021-01-05'));
		expect(result.endDate).toBe(localDay('2021-01-08'));
	});

	test('sorts unordered input before measuring', () => {
		const result = calculateMaxStreak(days('2021-03-03', '2021-03-01', '2021-03-02'));
		expect(result.maxStreak).toBe(3);
		expect(result.startDate).toBe(localDay('2021-03-01'));
	});

	test('collapses repeat activity on one day', () => {
		const result = calculateMaxStreak(days('2021-01-01', '2021-01-01', '2021-01-02'));
		expect(result.maxStreak).toBe(2);
	});

	test('a single active day is a streak of 1 that starts and ends on itself', () => {
		const result = calculateMaxStreak(days('2021-01-01'));
		expect(result.maxStreak).toBe(1);
		expect(result.startDate).toBe(localDay('2021-01-01'));
		expect(result.endDate).toBe(localDay('2021-01-01'));
	});

	test('isolated days never form a run longer than 1', () => {
		const result = calculateMaxStreak(days('2021-01-01', '2021-01-05', '2021-01-09'));
		expect(result.maxStreak).toBe(1);
		expect(result.startDate).toBe(localDay('2021-01-01'));
	});

	test('is 0 with no activity', () => {
		expect(calculateMaxStreak(days())).toEqual({ maxStreak: 0, startDate: '', endDate: '' });
	});

	test('counts a run that crosses a month boundary', () => {
		const result = calculateMaxStreak(days('2021-01-30', '2021-01-31', '2021-02-01'));
		expect(result.maxStreak).toBe(3);
	});
});

describe('calculateSuperMemo2Algorithm', () => {
	const NOW = new Date('2024-01-15T10:00:00.000Z');
	const card = (over: Partial<Parameters<typeof calculateSuperMemo2Algorithm>[0]> = {}) => ({
		easiness: 2.5,
		interval: 1,
		repetitions: 0,
		nextPractice: new Date('2000-01-01'),
		...over
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const atNow = () => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
	};

	describe('interval progression on a passing grade', () => {
		test('first correct review schedules 1 day out', () => {
			const result = calculateSuperMemo2Algorithm(card({ repetitions: 0 }), 'Good');
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(1);
		});

		test('second correct review jumps to 6 days', () => {
			const result = calculateSuperMemo2Algorithm(card({ repetitions: 1, interval: 1 }), 'Good');
			expect(result.interval).toBe(6);
			expect(result.repetitions).toBe(2);
		});

		test('third and later multiply by easiness and round', () => {
			const result = calculateSuperMemo2Algorithm(
				card({ repetitions: 2, interval: 6, easiness: 2.5 }),
				'Easy'
			);
			expect(result.interval).toBe(15); // round(6 * 2.5)
			expect(result.repetitions).toBe(3);
		});

		test('rounds rather than truncates', () => {
			const result = calculateSuperMemo2Algorithm(
				card({ repetitions: 5, interval: 3, easiness: 1.5 }),
				'Easy'
			);
			expect(result.interval).toBe(5); // round(4.5)
		});
	});

	describe('failing grades reset the schedule', () => {
		test.each(['Hard', 'Challenging'] as const)('%s resets to day 1 and 0 repetitions', (grade) => {
			const result = calculateSuperMemo2Algorithm(card({ repetitions: 9, interval: 240 }), grade);
			expect(result.interval).toBe(1);
			expect(result.repetitions).toBe(0);
		});
	});

	describe('easiness factor', () => {
		// delta = 0.1 - (5-q)(0.08 + (5-q)*0.02), with Easy=4 Good=3 Hard=2 Challenging=1
		test.each([
			['Easy', 2.5],
			['Good', 2.36],
			['Hard', 2.18],
			['Challenging', 1.96]
		] as const)('%s moves easiness from 2.5 to %d', (grade, expected) => {
			const result = calculateSuperMemo2Algorithm(card(), grade);
			expect(result.easiness).toBeCloseTo(expected, 10);
		});

		test('never falls below the 1.3 floor', () => {
			let c = card({ easiness: 1.4 });
			for (let i = 0; i < 20; i++) c = calculateSuperMemo2Algorithm(c, 'Challenging');
			expect(c.easiness).toBe(1.3);
		});

		test('Easy leaves easiness untouched', () => {
			const result = calculateSuperMemo2Algorithm(card({ easiness: 1.87 }), 'Easy');
			expect(result.easiness).toBeCloseTo(1.87, 10);
		});
	});

	describe('nextPractice', () => {
		test('is exactly interval days after now', () => {
			atNow();
			const result = calculateSuperMemo2Algorithm(card({ repetitions: 1 }), 'Good');
			expect(result.interval).toBe(6);
			expect(result.nextPractice.toISOString()).toBe('2024-01-21T10:00:00.000Z');
		});

		test('a failed card comes back tomorrow', () => {
			atNow();
			const result = calculateSuperMemo2Algorithm(card({ repetitions: 8, interval: 100 }), 'Hard');
			expect(result.nextPractice.toISOString()).toBe('2024-01-16T10:00:00.000Z');
		});
	});

	test('mutates and returns the same object, which reviewCard relies on', () => {
		const input = card();
		const result = calculateSuperMemo2Algorithm(input, 'Good');
		expect(result).toBe(input);
	});

	test('a full Good-only run grows the interval the way SM-2 says it should', () => {
		let c = card();
		const intervals: number[] = [];
		for (let i = 0; i < 6; i++) {
			c = calculateSuperMemo2Algorithm(c, 'Good');
			intervals.push(c.interval);
		}
		// 1, then 6, then interval * the easiness left over from the previous review, which 'Good'
		// drags down by 0.14 each time: 6*2.22=13, 13*2.08=27, 27*1.94=52, 52*1.80=94
		expect(intervals).toEqual([1, 6, 13, 27, 52, 94]);
	});
});
