import { calculateMaxStreak, calculateStreak, type info } from "$lib/algo.utils";
import { describe, expect, test } from "vitest";

describe('streak algo', () => {
	test('should calculate current streak', () => {
		const inputArray = [
			{ date: '2021-01-01' },
			{ date: '2021-01-02' },
			{ date: '2021-01-03' },
			{ date: '2021-01-04' },
			//break
			{ date: '2021-01-06' },
			{ date: '2021-01-07' },
		];
		const streak = calculateStreak(inputArray, new Date('2021-01-07'));
		expect(streak).toBe(2);
	})

	test('should calculate max streak', () => {
		const inputArray = [
			{ date: '2021-01-01' },
			{ date: '2021-01-02' },
			{ date: '2021-01-03' },
			{ date: '2021-01-04' },
			//break
			{ date: '2021-01-06' },
			{ date: '2021-01-07' },
		];
		const streak = calculateMaxStreak(inputArray)
		expect(streak).toHaveProperty('maxStreak', 4)
		expect(streak).toHaveProperty('startDate', '2020-12-31')
		expect(streak).toHaveProperty('endDate', '2021-01-03');
	})
	test('should calculate max streak', () => {
		const inputArray: info = [];
		const streak = calculateMaxStreak(inputArray)
		expect(streak).toHaveProperty('maxStreak', 0);
	})
	test('should calculate max streak', () => {
		const inputArray = [
			{ date: '2021-01-01' }
		];
		const streak = calculateMaxStreak(inputArray)
		expect(streak).toHaveProperty('maxStreak', 1);
	})
})