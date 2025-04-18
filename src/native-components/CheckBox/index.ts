type CheckBoxProps = astroHTML.JSX.LabelHTMLAttributes & {
	CheckBoxInputAttr  ?: astroHTML.JSX.InputHTMLAttributes
	CheckBoxIconAttr   ?: astroHTML.JSX.SVGAttributes
	CheckBoxContentAttr?: astroHTML.JSX.HTMLAttributes
}

type CheckBoxUpdateOptions = {
	CheckBoxChildren?: (string | Node)[] | boolean
	CheckBoxDisabled?: boolean
	CheckBoxChecked ?: boolean
	CheckBoxRefs    ?: {
		checkbox?(el: HTMLLabelElement): unknown
		input   ?(el: HTMLInputElement): unknown
		icon    ?(el: SVGSVGElement   ): unknown
		content ?(el: HTMLDivElement  ): unknown
	}
}

enum CheckBoxClasses {
	checkbox = 'c-checkbox',
	input    = checkbox + '-input',
	icon     = checkbox + '-icon',
	content  = checkbox + '-content'
}

function createCheckBox(options?: CheckBoxUpdateOptions): HTMLLabelElement {
	const checkbox = document.createElement('label')
	return updateCheckBox(checkbox, options)
}

function updateCheckBox(
	checkbox: HTMLLabelElement,
	options?: CheckBoxUpdateOptions
): HTMLLabelElement {
	const refs = options?.CheckBoxRefs
	checkbox.classList.add(CheckBoxClasses.checkbox)

	// input
	let input = checkbox.querySelector('.' + CheckBoxClasses.input) as HTMLInputElement | null
	if (!input) {
		input = document.createElement('input')
		input.type = 'checkbox'
		input.classList.add(CheckBoxClasses.input)
	}

	if (options?.CheckBoxChecked !== undefined) {
		input.checked = options.CheckBoxChecked
	}

	if (options?.CheckBoxDisabled !== undefined) {
		input.disabled = options.CheckBoxDisabled
	}

	// icon
	let icon = checkbox.querySelector('.' + CheckBoxClasses.icon) as SVGSVGElement | null
	if (!icon) {
		icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		icon.classList.add(CheckBoxClasses.icon)
		icon.setAttribute('viewBox', '0 -960 960 960')

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		path.setAttribute('d', 'm389-369 299-299q10.91-11 25.45-11Q728-679 739-668t11 25.58q0 14.58-10.61 25.19L415-292q-10.91 11-25.45 11Q375-281 364-292L221-435q-11-11-11-25.5t11-25.5q11-11 25.67-11 14.66 0 25.33 11l117 117Z')
		icon.append(path)
	}

	// content
	let content = checkbox.querySelector('.' + CheckBoxClasses.content) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(CheckBoxClasses.content)
	}

	const children = options?.CheckBoxChildren
	if (children === false) {
		content.replaceChildren()
	}
	else if (children && children !== true) {
		content.replaceChildren(...children)
	}

	checkbox.replaceChildren(input, icon, content)
	refs?.checkbox?.(checkbox)
	refs?.input?.(input)
	refs?.icon?.(icon)
	refs?.content?.(content)
	return checkbox
}

export {
	type CheckBoxProps,
	type CheckBoxUpdateOptions,
	CheckBoxClasses,
	createCheckBox,
	updateCheckBox,
}