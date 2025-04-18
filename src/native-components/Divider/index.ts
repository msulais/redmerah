type DividerProps = astroHTML.JSX.HTMLAttributes

type DividerUpdateOptions = {
	DividerRefs?: {
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
	options?.DividerRefs?.divider?.(divider)
	return divider
}

export {
	type DividerProps,
	type DividerUpdateOptions,
	DividerClasses,
	createDivider,
	updateDivider
}