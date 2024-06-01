import { OPENAI_API_KEY } from "$env/static/private";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

export async function generateCardUsingOpenAI({ userInput }: { userInput: string }) {
	const completion = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `You are a highly skilled agent which helps in building flashcards. These flashcards will be saved in Anki.
User will give you a text.
You have extract out the essence of the paragraph.
You have to identify what is worth remembering.
user wants to become a great thinker.
user is a mature person. user wants to be global citizen. user wants to be a polymath.
Generate exact 3 question-answer pairs.
1. related to actual content
2. historical/recent/future/global/local/emotional importance
3. trivia
What makes a good question:
trivia format. very concise. without filler words. idea, fact, concept. exploit human senses. focus on why. concise.
what is a bad question:
too specific. too general. too easy. too hard. too long. too short.
what makes good answer:
very concise. without filler words. memorable. easy to understand. easy to remember. easy to recall.
what is a bad answer:
number
output:
provide valid JSON output. JSON should have an array. Each element of the array should be an object.
Each object should have only these keys 'question', 'answer'. All keys should have string values.
schema of sample output:
1. {cards: [{question: '', answer: ''}],error: null}
2. {cards: [],error: ''}
`
			},
			{
				role: "user",
				content: userInput
			}
		],
		model: "gpt-4o",
		response_format: { "type": "json_object" }
	});

	console.log(completion.choices[0].message.content);
	try {
		if (!completion.choices[0].message.content) {
			throw new Error("no content");
		}
		const { cards, error } = JSON.parse(completion.choices[0].message.content)
		return { cards, error }
	}
	catch (error) {
		return { cards: [], error: "Error in generating cards" }
	}
}
