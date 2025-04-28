type DividerProps = astroHTML.JSX.HTMLAttributes

type DividerUpdateOptions = {
	DividerRefs?: {
		divider?(ref: HTMLDivElement): unknown
	}
}

enum DividerClasses {
	divider = 'c-divider'
}

function createDividerRef(options?: DividerUpdateOptions): HTMLDivElement {
	const dividerRef = document.createElement('div')
	return updateDividerRef(dividerRef, options)
}

function updateDividerRef(dividerRef: HTMLDivElement, options?: DividerUpdateOptions): HTMLDivElement {
	options?.DividerRefs?.divider?.(dividerRef)
	return dividerRef
}

export {
	type DividerProps,
	type DividerUpdateOptions,
	DividerClasses,
	createDividerRef,
	updateDividerRef
}