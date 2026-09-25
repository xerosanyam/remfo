import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const ignores = [
	'.agents/**',
	'.beads/**',
	'.claude/**',
	'.codex/**',
	'.perf/**',
	'.svelte-kit/**',
	'.vercel/**',
	'build/**',
	'migrations/meta/**',
	'node_modules/**',
	'static/mockServiceWorker.js'
];

export default [
	{ ignores },
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: { '@typescript-eslint': ts },
		rules: { ...ts.configs.recommended.rules, 'no-undef': 'off' }
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: { parser: tsParser },
			globals: { ...globals.browser, ...globals.node }
		},
		plugins: { '@typescript-eslint': ts },
		rules: {
			...ts.configs.recommended.rules,
			'no-undef': 'off',
			// The core rule cannot see Svelte reactivity: it reads `let x = initial` followed by
			// a `$:` block assigning x as a dead store, when the initialiser is what the first
			// render actually uses. Left on for .ts/.js, where it is accurate.
			'no-useless-assignment': 'off'
		}
	},
	{
		// Registry-generated shadcn-svelte code: polymorphic hrefs accept external URLs,
		// which resolve() throws on, so the rule is unsatisfiable here by construction.
		// Never hand-edit these files (update overwrites them); fix app code instead.
		files: ['src/lib/components/ui/**/*.svelte'],
		rules: { 'svelte/no-navigation-without-resolve': 'off' }
	},
	prettier
];
