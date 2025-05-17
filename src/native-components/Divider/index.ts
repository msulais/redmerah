type DividerProps = astroHTML.JSX.HTMLAttributes

type DividerElement = HTMLDivElement

type DividerUpdateOptions = {
	DividerRefs?: {
		divider?(ref: HTMLDivElement): unknown
	}
}

enum DividerClasses {
	divider = 'c-divider'
}

function createDividerRef(options?: DividerUpdateOptions): DividerElement {
	const dividerRef = document.createElement('div')
	return updateDividerRef(dividerRef, options)
}

function updateDividerRef(dividerRef: DividerElement, options?: DividerUpdateOptions): DividerElement {
	options?.DividerRefs?.divider?.(dividerRef)
	return dividerRef
}

export {
	type DividerProps,
	type DividerUpdateOptions,
	type DividerElement,
	DividerClasses,
	createDividerRef,
	updateDividerRef
}