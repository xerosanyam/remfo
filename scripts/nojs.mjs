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
		page: '/privacy',
		anonymous: true,
		present: [
			{ what: 'google data disclosure', match: (html) => html.includes('Google account data') },
			{ what: 'deletion instructions', match: (html) => html.includes('request deletion') }
		],
		absent: [
			{ what: 'a streamed-promise resolve() script', match: (html) => /\.resolve\(/.test(html) }
		]
	},
	{
		// signed out on purpose: this page is the way in for browsers google refuses, so it
		// has to work before any session exists
		page: '/login/device',
		anonymous: true,
		present: [
			{ what: 'a user code', match: (html) => /\b[A-Z0-9]{3,}(?:-[A-Z0-9]{3,})+\b/.test(html) },
			{ what: "google's verification link", match: (html) => html.includes('google.com/device') },
			{
				what: 'a plain form post to continue',
				match: (html) => /<form\b[^>]*\bmethod="post"/.test(html)
			}
		],
		absent: [
			{ what: 'a streamed-promise resolve() script', match: (html) => /\.resolve\(/.test(html) }
		]
	},
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
			// The list is a client island over /api/cards, so no-JS stays on the pending
			// branch. The contract is a sane degraded state: skeletons hidden via the
			// .js-only rule, honest note shown.
			{ what: 'the no-JS note', match: (html) => html.includes('the list needs javascript') },
			{ what: 'the js-only hide rule', match: (html) => html.includes('.js-only') }
		],
		absent: [
			// The footer only renders once the island fetch resolves, so its absence proves
			// no-JS really stays on the pending branch (and the .resolve() check used on
			// other pages does not apply: nothing streams here).
			{
				what: 'the card list footer (needs JS to resolve)',
				match: (html) => /showing \d+ of \d+ cards/.test(html)
			}
		]
	},
	{
		// The one page whose no-JS story is not "the data arrived": a countdown cannot exist
		// without a clock. The fallback is a CSS-only timer, so what has to be true is that the
		// stylesheet reaches the page as a <link> rather than being injected by JS, and that the
		// checkbox the animation hangs off is really in the markup.
		page: '/pomo',
		anonymous: true,
		present: [
			{ what: 'the css-only timer control', match: (html) => html.includes('id="css-start"') },
			{
				what: 'a linked stylesheet, not one injected by script',
				match: (html) => /<link[^>]*rel="stylesheet"/.test(html)
			},
			{ what: 'the starting time', match: (html) => html.includes('25:00') }
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

	for (const { page, present, absent, anonymous } of CHECKS) {
		const res = await fetch(URL_BASE + page, {
			headers: anonymous ? {} : { cookie: `auth_session=${sessionId}` },
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
