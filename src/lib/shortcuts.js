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
