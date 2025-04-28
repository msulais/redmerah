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
		checkbox?(ref: HTMLLabelElement): unknown
		input   ?(ref: HTMLInputElement): unknown
		icon    ?(ref: SVGSVGElement   ): unknown
		content ?(ref: HTMLDivElement  ): unknown
	}
}

enum CheckBoxClasses {
	checkbox = 'c-checkbox',
	input    = checkbox + '-input',
	icon     = checkbox + '-icon',
	content  = checkbox + '-content'
}

function createCheckBoxRef(options?: CheckBoxUpdateOptions): HTMLLabelElement {
	const checkBoxRef = document.createElement('label')
	return updateCheckBoxRef(checkBoxRef, options)
}

function updateCheckBoxRef(
	checkBoxRef: HTMLLabelElement,
	options?: CheckBoxUpdateOptions
): HTMLLabelElement {
	const refs = options?.CheckBoxRefs
	checkBoxRef.classList.add(CheckBoxClasses.checkbox)

	// input
	let inputRef = checkBoxRef.querySelector('.' + CheckBoxClasses.input) as HTMLInputElement | null
	if (!inputRef) {
		inputRef = document.createElement('input')
		inputRef.type = 'checkbox'
		inputRef.classList.add(CheckBoxClasses.input)
	}

	const checkedOption = options?.CheckBoxChecked
	if (checkedOption !== undefined) {
		inputRef.checked = checkedOption
	}

	const disabledOption = options?.CheckBoxDisabled
	if (disabledOption !== undefined) {
		inputRef.disabled = disabledOption
	}

	// icon
	let iconRef = checkBoxRef.querySelector('.' + CheckBoxClasses.icon) as SVGSVGElement | null
	if (!iconRef) {
		iconRef = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		iconRef.classList.add(CheckBoxClasses.icon)
		iconRef.setAttribute('viewBox', '0 -960 960 960')

		const pathRef = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		pathRef.setAttribute('d', 'm389-369 299-299q10.91-11 25.45-11Q728-679 739-668t11 25.58q0 14.58-10.61 25.19L415-292q-10.91 11-25.45 11Q375-281 364-292L221-435q-11-11-11-25.5t11-25.5q11-11 25.67-11 14.66 0 25.33 11l117 117Z')
		iconRef.append(pathRef)
	}

	// content
	let contentRef = checkBoxRef.querySelector('.' + CheckBoxClasses.content) as HTMLDivElement | null
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(CheckBoxClasses.content)
	}

	const childrenOption = options?.CheckBoxChildren
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	checkBoxRef.replaceChildren(inputRef, iconRef, contentRef)
	refs?.checkbox?.(checkBoxRef)
	refs?.input?.(inputRef)
	refs?.icon?.(iconRef)
	refs?.content?.(contentRef)
	return checkBoxRef
}

export {
	type CheckBoxProps,
	type CheckBoxUpdateOptions,
	CheckBoxClasses,
	createCheckBoxRef,
	updateCheckBoxRef,
}