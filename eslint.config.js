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
		rules: { ...ts.configs.recommended.rules, 'no-undef': 'off' }
	},
	prettier
];
