import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ContentRenderer from '$lib/components/ContentRenderer.svelte';

describe('ContentRenderer', () => {
	it('renders an image for a url ending in an image extension', () => {
		render(ContentRenderer, { text: 'https://example.com/cat.PNG' });
		expect(screen.getByAltText('content')).toHaveAttribute('src', 'https://example.com/cat.PNG');
	});

	it('renders a link for a page url, without requesting it', () => {
		render(ContentRenderer, { text: 'https://leetcode.com/problems/valid-parentheses' });
		expect(screen.getByRole('link')).toHaveAttribute(
			'href',
			'https://leetcode.com/problems/valid-parentheses'
		);
		expect(screen.queryByAltText('content')).not.toBeInTheDocument();
	});

	it('renders plain text as text', () => {
		render(ContentRenderer, { text: 'capital of France' });
		expect(screen.getByText('capital of France')).toBeInTheDocument();
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
	});

	it('does not turn a javascript: url into a link', () => {
		render(ContentRenderer, { text: 'javascript:alert(1)' });
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
		expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
	});
});
