/**
 * @param {HTMLElement} node
 * @param {{
 *   alt?: boolean,
 *   shift?: boolean,
 *   control?: boolean,
 *   code?: string,
 *   key?: string | string[],
 *   callback?: (event: KeyboardEvent) => void
 * }} params
 */
export const shortcut = (node, params) => {
	/** @type {(event: KeyboardEvent) => void} */
	let handler = () => {};
	const removeHandler = () => window.removeEventListener('keydown', handler),
		setHandler = () => {
			removeHandler();
			if (!params) return;
			handler = (e) => {
				if (
					!!params.alt != e.altKey ||
					!!params.shift != e.shiftKey ||
					!!params.control != (e.ctrlKey || e.metaKey) ||
					(params.key
						? !(Array.isArray(params.key) ? params.key : [params.key]).includes(e.key)
						: params.code != e.code)
				)
					return;
				// preventDefault cannot be undone by the callback. A plain Space/Enter on a
				// natively-activatable element outside the bound node (trash button, answer
				// summary) must keep its default click/toggle instead of rating the card.
				// Explicit chords like Ctrl+Enter are untouched.
				const target = e.target;
				if (
					!e.altKey &&
					!e.ctrlKey &&
					!e.metaKey &&
					!e.shiftKey &&
					(e.key === ' ' || e.key === 'Enter') &&
					target instanceof HTMLElement &&
					!node.contains(target) &&
					/^(BUTTON|A|SUMMARY|INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
				)
					return;
				e.preventDefault();
				if (params.callback) params.callback(e);
				else node.click();
			};
			window.addEventListener('keydown', handler);
		};
	setHandler();
	return {
		update: setHandler,
		destroy: removeHandler
	};
};
