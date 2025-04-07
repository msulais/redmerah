type LabelProps = astroHTML.JSX.HTMLAttributes

type LabelUpdateOptions = {
	children?: (string | Node)[] | boolean
	refs?: {
		label?(el: HTMLSpanElement): unknown
	}
}

enum LabelClasses {
	label = 'c-label'
}

function createLabel(options?: LabelUpdateOptions): HTMLSpanElement {
	const label = document.createElement('span')
	return updateLabel(label, options)
}

function updateLabel(label: HTMLSpanElement, options?: LabelUpdateOptions): HTMLSpanElement {
	label.classList.add(LabelClasses.label)

	const children = options?.children
	if (children === false) {
		label.replaceChildren()
	}
	else if (children && children !== true) {
		label.replaceChildren(...children)
	}

	options?.refs?.label?.(label)
	return label
}

export {
	type LabelProps,
	LabelClasses,
	createLabel,
	updateLabel
}