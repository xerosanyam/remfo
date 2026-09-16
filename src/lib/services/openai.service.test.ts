import { beforeEach, describe, expect, test, vi } from 'vitest';

const create = vi.fn();

vi.mock('$env/static/private', () => ({ OPENAI_API_KEY: 'test-key' }));
vi.mock('openai', () => ({
	default: class {
		chat = { completions: { create } };
	}
}));

const { generateCardUsingOpenAI } = await import('$lib/services/openai.service');

const reply = (content: string) => ({ choices: [{ message: { content } }] });

describe('generateCardUsingOpenAI', () => {
	beforeEach(() => {
		create.mockReset();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	test('returns the parsed cards on a good response', async () => {
		create.mockResolvedValue(reply('{"cards":[{"question":"q","answer":"a"}],"error":null}'));

		const { cards, error } = await generateCardUsingOpenAI({ userInput: 'anything' });

		expect(cards).toEqual([{ question: 'q', answer: 'a' }]);
		expect(error).toBeNull();
	});

	// The regression this file exists for: an upstream failure used to escape as a 500.
	test('converts an upstream failure into an inline error instead of throwing', async () => {
		create.mockRejectedValue(Object.assign(new Error('credit balance exhausted'), { status: 429 }));

		const { cards, error } = await generateCardUsingOpenAI({ userInput: 'anything' });

		expect(cards).toEqual([]);
		expect(error).toBeTruthy();
		// the user-facing string must not leak the upstream detail
		expect(error).not.toMatch(/credit|429/i);
	});

	test('handles a response that is not valid JSON', async () => {
		create.mockResolvedValue(reply('not json'));

		const { cards, error } = await generateCardUsingOpenAI({ userInput: 'anything' });

		expect(cards).toEqual([]);
		expect(error).toBeTruthy();
	});
});
