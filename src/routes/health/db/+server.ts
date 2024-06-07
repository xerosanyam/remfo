import { TURSO_AUTH_TOKEN, TURSO_CONNECTION_URL } from "$env/static/private";

export async function GET() {
	const url = `https://${TURSO_CONNECTION_URL.split('//')[1]}/v2/pipeline`;
	try {
		const data = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${TURSO_AUTH_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				requests: [
					{ type: "execute", stmt: { sql: "SELECT 'ok';" } },
					{ type: "close" },
				],
			}),
		})
		const json = await data.json()
		if (json.results[0].type === 'error') {
			throw new Error(json.results[0].error.message)
		}
		return new Response(json.results[0].response.result.rows[0][0].value)
	} catch (err) {
		return new Response(String(err))
	}
}