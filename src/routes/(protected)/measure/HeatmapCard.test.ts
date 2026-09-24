import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import HeatmapCard from './HeatmapCard.svelte';

const data = [
	{ date: '2026-09-01', count: 3 },
	{ date: '2026-09-02', count: 7 }
];

describe('HeatmapCard lazy heatmap', () => {
	it('paints totals before the lazy chunk arrives', () => {
		const { container } = render(HeatmapCard, { data, title: 'cards reviewed' });

		expect(screen.getByText('10 cards reviewed')).toBeInTheDocument();
		expect(container.querySelector('svg')).not.toBeInTheDocument();
	});

	it('paints the heatmap once the lazy chunk loads', async () => {
		const { container } = render(HeatmapCard, { data, title: 'cards reviewed' });

		await waitFor(() => expect(container.querySelector('svg')).toBeInTheDocument(), {
			timeout: 10000
		});
	});
});
