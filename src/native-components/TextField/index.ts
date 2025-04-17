import { updateButton, type ButtonProps, type ButtonUpdateOptions } from "@/native-components/Button"

type TextFieldProps = astroHTML.JSX.HTMLAttributes & {
	'c:attrInput'?: astroHTML.JSX.InputHTMLAttributes
	'c:attrLeading'?: astroHTML.JSX.HTMLAttributes
	'c:attrTrailing'?: astroHTML.JSX.HTMLAttributes
}

type TextFieldButtonProps = ButtonProps

type TextFieldButtonUpdateOptions = ButtonUpdateOptions

type TextFieldUpdateOptions = {
	leading    ?: (string | Node)[] | boolean
	trailing   ?: (string | Node)[] | boolean
	readOnly   ?: boolean
	placeholder?: string | boolean
	value      ?: string | boolean
	refs       ?: {
		textfield?(el: HTMLDivElement  ): unknown
		leading  ?(el: HTMLDivElement  ): unknown
		trailing ?(el: HTMLDivElement  ): unknown
		input    ?(el: HTMLInputElement): unknown
	}
}

enum TextFieldClasses {
	textfield = 'c-textfield',
	leading   = 'c-textfield-leading',
	input     = 'c-textfield-input',
	trailing  = 'c-textfield-trailing',
	button    = 'c-textfield-btn'
}

function createTextField(options?: TextFieldUpdateOptions): HTMLDivElement {
	const textfield = document.createElement('div')
	return updateTextField(textfield, options)
}

function updateTextField(textfield: HTMLDivElement, options?: TextFieldUpdateOptions): HTMLDivElement {
	const refs = options?.refs
	textfield.classList.add(TextFieldClasses.textfield)

	// leading
	let leading = textfield.querySelector(`.${TextFieldClasses.leading}`) as HTMLDivElement | null
	if (!leading) {
		leading = document.createElement('div')
		leading.classList.add(TextFieldClasses.leading)
	}

	if (options?.leading === false) {
		leading.replaceChildren()
	}
	else if (options?.leading && options.leading !== true) {
		leading.replaceChildren(...options.leading)
	}

	// input
	let input = textfield.querySelector(`.${TextFieldClasses.input}`) as HTMLInputElement | null
	if (!input) {
		input = document.createElement('input')
		input.classList.add(TextFieldClasses.input)
		input.type = 'text'
	}

	const readonly = options?.readOnly
	if (readonly !== undefined) {
		input.readOnly = readonly
	}

	const placeholder = options?.placeholder
	if (placeholder === false) {
		input.placeholder = ''
	}
	else if (placeholder && placeholder !== true) {
		input.placeholder = placeholder
	}

	const value = options?.value
	if (value === false) {
		input.value = ''
	}
	else if (value && value !== true) {
		input.value = value
	}

	// trailing
	let trailing = textfield.querySelector(`.${TextFieldClasses.trailing}`) as HTMLDivElement | null
	if (!trailing) {
		trailing = document.createElement('div')
		trailing.classList.add(TextFieldClasses.trailing)
	}

	if (options?.trailing === false) {
		trailing.replaceChildren()
	}
	else if (options?.trailing && options.trailing !== true) {
		trailing.replaceChildren(...options.trailing)
	}
	textfield.replaceChildren(leading, input, trailing)
	refs?.input?.(input)
	refs?.leading?.(leading)
	refs?.textfield?.(textfield)
	refs?.trailing?.(trailing)
	return textfield
}

function createTextFieldButton(options?: TextFieldButtonUpdateOptions): HTMLButtonElement {
	const button = document.createElement('button')
	return updateTextFieldButton(button, options)
}

function updateTextFieldButton(button: HTMLButtonElement, options?: TextFieldButtonUpdateOptions): HTMLButtonElement {
	updateButton(button, options)
	button.classList.add(TextFieldClasses.button)
	return button
}

export {
	type TextFieldProps,
	type TextFieldUpdateOptions,
	type TextFieldButtonProps,
	TextFieldClasses,
	createTextField,
	updateTextField,
	createTextFieldButton,
	updateTextFieldButton
}