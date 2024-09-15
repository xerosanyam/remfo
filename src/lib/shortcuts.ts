export const shortcut = (node: HTMLTextAreaElement, params: { control: any; code: any; callback: any; alt?: any; shift?: any; }) => {
	let handler: { (this: Window, ev: KeyboardEvent): any; (e: any): void; (this: Window, ev: KeyboardEvent): any; };
	const removeHandler = () => window.removeEventListener('keydown', handler), setHandler = () => {
		removeHandler();
		if (!params)
			return;
		handler = (e) => {
			if ((!!params.alt != e.altKey) ||
				(!!params.shift != e.shiftKey) ||
				(!!params.control != (e.ctrlKey || e.metaKey)) ||
				params.code != e.code)
				return;
			e.preventDefault();
			params.callback ? params.callback() : node.click();
		};
		window.addEventListener('keydown', handler);
	};
	setHandler();
	return {
		update: setHandler,
		destroy: removeHandler,
	};
};
