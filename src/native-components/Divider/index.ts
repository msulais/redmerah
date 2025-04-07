type DividerProps = astroHTML.JSX.HTMLAttributes

type DividerUpdateOptions = {
	refs?: {
		divider?(el: HTMLDivElement): unknown
	}
}

enum DividerClasses {
	divider = 'c-divider'
}

function createDivider(options?: DividerUpdateOptions): HTMLDivElement {
	const divider = document.createElement('div')
	return updateDivider(divider, options)
}

function updateDivider(divider: HTMLDivElement, options?: DividerUpdateOptions): HTMLDivElement {
	options?.refs?.divider?.(divider)
	return divider
}

export {
	type DividerProps,
	type DividerUpdateOptions,
	DividerClasses,
	createDivider,
	updateDivider
}