// No-JS guard. CLAUDE.md promises the app works without JavaScript, and that promise was
// silently false: /revise and /measure returned their data as unawaited (streamed) load
// promises, which SvelteKit delivers through an inline <script>...resolve(...)</script>.
// With no JS those promises never settle and the page renders empty.
//
// A DOM test library cannot catch this, because happy-dom, jsdom and Cypress all execute
// JS. A plain fetch executes none, so it IS a no-JS browser for rendering purposes. That
// is the whole technique here: request the built app and assert on the raw HTML.
//
//   bun run test:nojs
//
// Reuses a preview already listening on 4173, otherwise builds and starts one. It calls
// vite.build directly rather than `bun run build`, which would recurse through the tests.

import { preview, build } from 'vite';
import { deleteSession, loadEnv, mintSession, openDb } from './session.mjs';

const URL_BASE = 'http://localhost:4173';

// Each check names content that only appears once the page's data has actually resolved.
// `absent` guards the root cause directly: a resolve() script means a streamed promise is
// still on the page, so something is being delivered to JS clients only.
const CHECKS = [
	{
		page: '/revise',
		present: [
			{ what: 'the card question block', match: (html) => html.includes('id="question"') },
			{ what: 'the answer disclosure', match: (html) => /<details[^>]*id="answer"/.test(html) }
		],
		absent: [
			{ what: 'a streamed-promise resolve() script', match: (html) => /\.resolve\(/.test(html) }
		]
	},
	{
		page: '/record',
		present: [
			{ what: 'the add-card form', match: (html) => /<textarea/.test(html) },
			// NewCards renders this footer only once the list is in hand, so it doubles as
			// proof that the load resolved rather than that a shell was returned
			{ what: 'the card list', match: (html) => /showing \d+ of \d+ cards/.test(html) },
			{ what: 'no load failure', match: (html) => !html.includes('could not load your cards.') }
		],
		absent: [
			{ what: 'a streamed-promise resolve() script', match: (html) => /\.resolve\(/.test(html) }
		]
	},
	{
		page: '/measure',
		present: [
			{ what: 'the streak panel', match: (html) => html.includes('Current Streak:') },
			{ what: 'the reviewed heatmap', match: (html) => html.includes('cards reviewed') },
			{ what: 'the created heatmap', match: (html) => html.includes('cards created') }
		],
		absent: [
			{ what: 'a streamed-promise resolve() script', match: (html) => /\.resolve\(/.test(html) }
		]
	}
];

const env = loadEnv();
const app = openDb(env);
const { sessionId, userId } = await mintSession(app, env);
console.log(`minted session for user ${userId}`);

let previewServer = null;
let failed = 0;

try {
	let running = false;
	try {
		await fetch(URL_BASE);
		running = true;
	} catch {
		// nothing listening; build and start our own below
	}
	if (!running) {
		console.log('no local preview found; building and starting one');
		await build({ logLevel: 'silent' });
		previewServer = await preview({
			preview: { host: '127.0.0.1', port: 4173, strictPort: true },
			logLevel: 'silent'
		});
	}

	for (const { page, present, absent } of CHECKS) {
		const res = await fetch(URL_BASE + page, {
			headers: { cookie: `auth_session=${sessionId}` },
			redirect: 'manual'
		});
		const html = await res.text();

		if (res.status !== 200) {
			console.log(`FAIL ${page}: expected 200, got ${res.status}`);
			failed++;
			continue;
		}
		const problems = [
			...present.filter((c) => !c.match(html)).map((c) => `missing ${c.what}`),
			...absent.filter((c) => c.match(html)).map((c) => `still has ${c.what}`)
		];
		if (problems.length) {
			failed++;
			console.log(`FAIL ${page} (${html.length} bytes of html)`);
			for (const p of problems) console.log(`       ${p}`);
		} else {
			console.log(`ok   ${page} renders without JS (${html.length} bytes of html)`);
		}
	}
} finally {
	await deleteSession(app, sessionId);
	if (previewServer) await previewServer.close();
}

if (failed) {
	console.log(`\n${failed} page(s) do not render without JS`);
	process.exit(1);
}
console.log('\nall checked pages render without JS');
