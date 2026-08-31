// Page-load harness: runs Lighthouse N times per page, stores every run in a local sqlite
// file, and prints medians plus the delta against the previous label.
//
//   bun run perf                                  build, preview, then run every page 3 times
//   bun run perf --pages /,record --runs 5
//   bun run perf --url https://your-app.vercel.app
//   bun run perf --mobile                         run only mobile
//   bun run perf --desktop                        run only desktop
//   bun run perf --label before-index
//   bun run perf --report                         print history, run no browser
// Detailed failures are written to .perf/reports/*.md for direct use with an LLM.
//
// Protected pages need a session. This mints one directly in the DB the same way the lucia
// libsql adapter does, scopes the cookie to the target origin, and deletes it afterwards.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createClient } from '@libsql/client';
import * as chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer-core';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const PROTECTED = ['/record', '/revise', '/learn', '/measure'];
const RESULTS_DB = '.perf/runs.db';
const PAGE_LOAD_BUDGET_MS = 100;

// ---------------------------------------------------------------- args + env

const args = process.argv.slice(2);
const flag = (name, fallback) => {
	const i = args.indexOf(`--${name}`);
	return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

function discoverPages(directory = 'src/routes', segments = []) {
	const entries = readdirSync(directory, { withFileTypes: true });
	const pages = entries.some((entry) => entry.isFile() && entry.name.startsWith('+page.'))
		? [`/${segments.filter((segment) => !segment.startsWith('(')).join('/')}`]
		: [];
	for (const entry of entries) {
		if (!entry.isDirectory() || entry.name.startsWith('[')) continue;
		pages.push(...discoverPages(`${directory}/${entry.name}`, [...segments, entry.name]));
	}
	return [...new Set(pages)].filter((page) => page !== '/logout').sort();
}

const requestedPages = flag('pages', null);

const opts = {
	url: (flag('url', 'http://localhost:4173') ?? '').replace(/\/$/, ''),
	pages: requestedPages ? requestedPages.split(',') : discoverPages(),
	runs: Number(flag('runs', 3)),
	label: flag('label', new Date().toISOString().slice(0, 16).replace('T', ' ')),
	devices:
		has('desktop') && !has('mobile')
			? ['desktop']
			: has('mobile') && !has('desktop')
				? ['mobile']
				: ['mobile', 'desktop'],
	report: has('report')
};

// vite loads .env then .env.local, later wins
const env = {};
for (const file of ['.env', '.env.local']) {
	if (!existsSync(file)) continue;
	for (const line of readFileSync(file, 'utf8').split('\n')) {
		const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
		if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
	}
}

// ------------------------------------------------------------- results store

mkdirSync('.perf', { recursive: true });
const results = createClient({ url: `file:${RESULTS_DB}` });
await results.execute(`
	CREATE TABLE IF NOT EXISTS run (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		label TEXT NOT NULL, url TEXT NOT NULL, page TEXT NOT NULL, device TEXT NOT NULL,
		created_at INTEGER NOT NULL,
		perf REAL, a11y REAL, best_practices REAL, seo REAL,
		load_ms REAL, fcp REAL, lcp REAL, tbt REAL, cls REAL, si REAL, ttfb REAL,
		bytes REAL, dom REAL
	)`);
const columns = (await results.execute('PRAGMA table_info(run)')).rows.map((row) => row.name);
if (!columns.includes('load_ms')) await results.execute('ALTER TABLE run ADD COLUMN load_ms REAL');

const METRICS = [
	['perf', 'perf', scoreValue],
	['a11y', 'a11y', scoreValue],
	['best_practices', 'best', scoreValue],
	['seo', 'seo', scoreValue],
	['load_ms', 'page load', ms],
	['fcp', 'FCP', ms],
	['lcp', 'LCP', ms],
	['tbt', 'TBT', ms],
	['si', 'SI', ms],
	['ttfb', 'TTFB', ms],
	['cls', 'CLS', (n) => n?.toFixed(3)],
	['bytes', 'bytes', kb],
	['dom', 'DOM', (n) => n]
];

function ms(n) {
	return n == null ? null : Math.round(n) + 'ms';
}
function kb(n) {
	return n == null ? null : (n / 1024).toFixed(0) + 'KB';
}
function scoreValue(n) {
	return n == null ? null : Number(n.toFixed(1));
}
function average(values) {
	const present = values.filter((n) => n != null);
	return present.length ? present.reduce((sum, value) => sum + value, 0) / present.length : null;
}

function writeLlmReport(lhr, { label, device, target, run, loadMs }) {
	const categories = Object.values(lhr.categories);
	const imperfect = categories.filter((category) => Math.round(category.score * 100) < 100);
	if (!imperfect.length && loadMs <= PAGE_LOAD_BUDGET_MS) return null;

	const lines = [
		'# Lighthouse findings',
		'',
		`- URL: ${target}`,
		`- Device: ${device}`,
		`- Label: ${label}`,
		`- Page load: ${ms(loadMs)} (${loadMs <= PAGE_LOAD_BUDGET_MS ? 'PASS' : `FAIL, budget ${PAGE_LOAD_BUDGET_MS}ms`})`,
		`- Generated: ${new Date().toISOString()}`,
		'',
		'## Category scores',
		'',
		...categories.map((category) => `- ${category.title}: ${Math.round(category.score * 100)}`)
	];

	for (const category of imperfect) {
		lines.push('', `## ${category.title} failures`, '');
		for (const ref of category.auditRefs.filter((ref) => ref.weight > 0)) {
			const audit = lhr.audits[ref.id];
			if (audit.score == null || audit.score >= 1) continue;
			lines.push(`### ${audit.title}`, '', `- Audit: ${audit.id}`, `- Score: ${audit.score}`);
			if (audit.displayValue) lines.push(`- Result: ${audit.displayValue}`);
			lines.push('', audit.description);

			const samples = (audit.details?.items ?? []).slice(0, 10).map((item) => {
				const sample = {};
				for (const [key, value] of Object.entries(item)) {
					if (['string', 'number', 'boolean'].includes(typeof value) && value !== '')
						sample[key] = value;
					else if (value && typeof value === 'object' && !Array.isArray(value) && key !== 'node') {
						sample[key] = Object.fromEntries(
							Object.entries(value).filter(([, nested]) =>
								['string', 'number', 'boolean'].includes(typeof nested)
							)
						);
					}
				}
				return sample;
			});
			if (samples.length) {
				lines.push('', 'Affected samples:', '', '```json', JSON.stringify(samples, null, 2), '```');
			}
			lines.push('');
		}
	}

	mkdirSync('.perf/reports', { recursive: true });
	const name = `${label}-${device}-${new URL(target).pathname}-run-${run}`
		.replace(/[^a-z0-9]+/gi, '-')
		.replace(/^-|-$/g, '')
		.toLowerCase();
	const path = `.perf/reports/${name}.md`;
	writeFileSync(path, lines.join('\n'));
	return path;
}

// --------------------------------------------------------------- reporting

// lower is better for everything except the four 0-100 scores
const HIGHER_IS_BETTER = new Set(['perf', 'a11y', 'best_practices', 'seo']);

async function report(page, device, url) {
	const { rows } = await results.execute({
		sql: `SELECT * FROM run WHERE page = ? AND device = ? AND url = ? ORDER BY id`,
		args: [page, device, url]
	});
	if (!rows.length) return;

	// Group into labels and move a rerun label to the end, so "current" means the
	// label with the newest run rather than the label first inserted into SQLite.
	const labels = new Map();
	for (const row of rows) {
		const group = labels.get(row.label) ?? { label: row.label, rows: [] };
		group.rows.push(row);
		labels.delete(row.label);
		labels.set(row.label, group);
	}
	const ordered = [...labels.values()];
	const current = ordered.at(-1);
	const previous = ordered.at(-2);
	const averages = (group) =>
		Object.fromEntries(METRICS.map(([col]) => [col, average(group.rows.map((row) => row[col]))]));
	const nowValues = averages(current);
	const previousValues = previous ? averages(previous) : null;

	const table = {};
	for (const [col, display, fmt] of METRICS) {
		const now = nowValues[col];
		const row = { [`${current.label} (avg n=${current.rows.length})`]: fmt(now) ?? '-' };
		if (previous) {
			const was = previousValues[col];
			row[`${previous.label} (avg n=${previous.rows.length})`] = fmt(was) ?? '-';
			if (now != null && was != null) {
				const delta = now - was;
				const better = HIGHER_IS_BETTER.has(col) ? delta > 0 : delta < 0;
				const pct = was === 0 ? 0 : (delta / was) * 100;
				row.change =
					Math.abs(pct) < 1
						? '~'
						: `${better ? '+' : '-'}${Math.abs(pct).toFixed(0)}% ${better ? 'better' : 'WORSE'}`;
			}
		}
		table[display] = row;
	}

	console.log(`\n${device}  ${url}${page}`);
	console.table(table);
	const load = nowValues.load_ms;
	const budgetPass = load != null && load <= PAGE_LOAD_BUDGET_MS;
	console.log(
		`BUDGET: ${budgetPass ? 'PASS' : 'FAIL'} — average page load ${ms(load) ?? 'unavailable'} ` +
			`(limit ${PAGE_LOAD_BUDGET_MS}ms)`
	);
	if (!budgetPass) {
		console.log('VERDICT: BAD — page-load budget failed');
	} else if (previousValues) {
		let direction = 0;
		for (const [metric, higherIsBetter] of [
			['perf', true],
			['load_ms', false],
			['lcp', false]
		]) {
			const now = nowValues[metric];
			const was = previousValues[metric];
			if (now == null || was == null || was === 0 || Math.abs((now - was) / was) < 0.05) continue;
			direction += (higherIsBetter ? now > was : now < was) ? 1 : -1;
		}
		console.log(
			`VERDICT: ${direction > 0 ? 'GOOD' : direction < 0 ? 'BAD' : 'NO MATERIAL CHANGE'}`
		);
	}
	return budgetPass;
}

if (opts.report) {
	const { rows } = await results.execute(
		'SELECT DISTINCT page, device, url FROM run ORDER BY url, page, device'
	);
	if (!rows.length) console.log('no runs recorded yet');
	for (const r of rows) await report(r.page, r.device, r.url);
	process.exit(0);
}

// ----------------------------------------------------------------- session

// compare on the path alone, so /record?limit=500 still counts as protected
const needsAuth = opts.pages.some((p) => PROTECTED.includes(p.split('?')[0]));
let app = null;
let sessionId = null;

if (needsAuth) {
	if (!env.TURSO_CONNECTION_URL) throw new Error('TURSO_CONNECTION_URL missing from .env');
	app = createClient({ url: env.TURSO_CONNECTION_URL, authToken: env.TURSO_AUTH_TOKEN });

	const userId =
		env.PERF_USER_ID ??
		(await app.execute('SELECT id FROM auth_user ORDER BY created_at LIMIT 1')).rows[0]?.id;
	if (!userId) throw new Error('no user in auth_user to mint a session for');

	// same columns and second-precision expiry the lucia libsql adapter writes
	sessionId = randomUUID();
	await app.execute({
		sql: 'INSERT INTO user_session (id, user_id, expires_at) VALUES (?, ?, ?)',
		args: [sessionId, userId, Math.floor(Date.now() / 1000) + 3600]
	});
	console.log(`minted session for user ${userId}`);
}
console.log(`pages: ${opts.pages.join(', ')}`);

// ------------------------------------------------------------------- runs

let previewServer = null;
let chrome = null;
let budgetFailed = false;
try {
	if (opts.url === 'http://localhost:4173') {
		let previewRunning = false;
		try {
			await fetch(opts.url);
			previewRunning = true;
		} catch {
			// Start a production build below.
		}
		if (!previewRunning) {
			console.log('no local preview found; building and starting one');
			const vite = await import('vite');
			const consoleOutput = { log: console.log, info: console.info, warn: console.warn };
			console.log = console.info = console.warn = () => {};
			try {
				await vite.build({ logLevel: 'silent' });
			} finally {
				Object.assign(console, consoleOutput);
			}
			previewServer = await vite.preview({
				preview: { host: '127.0.0.1', port: 4173, strictPort: true }
			});
		}
	}

	chrome = await chromeLauncher.launch({
		chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu']
	});

	const browser = await puppeteer.connect({
		browserURL: `http://127.0.0.1:${chrome.port}`,
		defaultViewport: null
	});

	for (const path of opts.pages) {
		for (const device of opts.devices) {
			const desktop = device === 'desktop';
			const target = opts.url + path;

			for (let i = 0; i < opts.runs; i++) {
				const context = await browser.createBrowserContext();
				const tab = await context.newPage();
				if (sessionId && PROTECTED.includes(path.split('?')[0])) {
					// Each run gets a fresh context, and public pages never receive an auth cookie.
					await context.setCookie({
						name: 'auth_session',
						value: sessionId,
						url: opts.url,
						httpOnly: true,
						secure: new URL(target).protocol === 'https:'
					});
				}

				const { lhr } = await lighthouse(
					target,
					{ output: 'json', logLevel: 'error' },
					desktop ? desktopConfig : undefined,
					tab
				);
				await context.close();

				if (lhr.runtimeError) throw new Error(lhr.runtimeError.message);
				// a dead session redirects to login, and the login page would otherwise be recorded
				// as if it were this page. Silence is not success.
				const landed = new URL(lhr.finalDisplayedUrl).pathname;
				if (landed !== new URL(target).pathname) {
					throw new Error(`${path} redirected to ${landed}; refusing to record it as ${path}`);
				}
				if (lhr.audits['http-status-code']?.score !== 1) {
					throw new Error(`${path} returned an unsuccessful HTTP status; refusing to record it`);
				}

				const score = (c) => Math.round((lhr.categories[c]?.score ?? 0) * 100);
				// first id that exists, so a lighthouse rename does not silently blank a column
				const audit = (...ids) => {
					for (const id of ids) if (lhr.audits[id]) return lhr.audits[id].numericValue ?? null;
					console.warn(`  no such audit: ${ids.join(' / ')}`);
					return null;
				};
				const loadMs = lhr.audits.metrics?.details?.items?.[0]?.observedLoad ?? null;
				const llmReport = writeLlmReport(lhr, {
					label: opts.label,
					device,
					target,
					run: i + 1,
					loadMs
				});
				if (llmReport) console.log(`LLM report: ${llmReport}`);

				await results.execute({
					sql: `INSERT INTO run
					(label, url, page, device, created_at, perf, a11y, best_practices, seo,
					 load_ms, fcp, lcp, tbt, cls, si, ttfb, bytes, dom)
					VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
					args: [
						opts.label,
						opts.url,
						path,
						device,
						Date.now(),
						score('performance'),
						score('accessibility'),
						score('best-practices'),
						score('seo'),
						loadMs,
						audit('first-contentful-paint'),
						audit('largest-contentful-paint'),
						audit('total-blocking-time'),
						audit('cumulative-layout-shift'),
						audit('speed-index'),
						audit('server-response-time'),
						audit('total-byte-weight'),
						audit('dom-size-insight', 'dom-size')
					]
				});

				console.log(
					`${path} ${device} run ${i + 1}/${opts.runs}: ` +
						`load ${ms(loadMs)} perf ${score('performance')} lcp ${ms(audit('largest-contentful-paint'))}`
				);
			}

			if (!(await report(path, device, opts.url))) budgetFailed = true;
		}
	}
} finally {
	if (chrome) await chrome.kill();
	if (sessionId) {
		await app.execute({ sql: 'DELETE FROM user_session WHERE id = ?', args: [sessionId] });
		console.log('session deleted');
	}
	if (previewServer) await previewServer.close();
}

if (budgetFailed) process.exitCode = 1;
