import { format } from "date-fns";

// for debugging & simulating real-world delays
export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function humanReadableDate(date: Date | string) {
	return format(date, 'd MMM').toLowerCase()
}