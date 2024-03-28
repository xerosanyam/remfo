// for debugging & simulating real-world delays
export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
