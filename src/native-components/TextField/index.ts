import { updateButton, type ButtonProps, type ButtonUpdateOptions } from "@/native-components/Button"

type TextFieldProps = astroHTML.JSX.HTMLAttributes & {
	TextFieldInputAttr   ?: astroHTML.JSX.InputHTMLAttributes
	TextFieldLeadingAttr ?: astroHTML.JSX.HTMLAttributes
	TextFieldTrailingAttr?: astroHTML.JSX.HTMLAttributes
}

type TextFieldButtonProps = ButtonProps

type TextFieldButtonUpdateOptions = ButtonUpdateOptions

type TextFieldUpdateOptions = {
	TextFieldLeading    ?: (string | Node)[] | boolean
	TextFieldTrailing   ?: (string | Node)[] | boolean
	TextFieldReadOnly   ?: boolean
	TextFieldPlaceholder?: string | boolean
	TextFieldValue      ?: string | boolean
	TextFieldRefs       ?: {
		textfield?(el: HTMLDivElement  ): unknown
		leading  ?(el: HTMLDivElement  ): unknown
		trailing ?(el: HTMLDivElement  ): unknown
		input    ?(el: HTMLInputElement): unknown
	}
}

enum TextFieldClasses {
	textfield = 'c-textfield',
	leading   = textfield + '-leading',
	input     = textfield + '-input',
	trailing  = textfield + '-trailing',
	button    = textfield + '-button'
}

function createTextField(options?: TextFieldUpdateOptions): HTMLDivElement {
	const textfield = document.createElement('div')
	return updateTextField(textfield, options)
}

function updateTextField(textfield: HTMLDivElement, options?: TextFieldUpdateOptions): HTMLDivElement {
	const refs = options?.TextFieldRefs
	textfield.classList.add(TextFieldClasses.textfield)

	// leading
	let leading = textfield.querySelector(`.${TextFieldClasses.leading}`) as HTMLDivElement | null
	if (!leading) {
		leading = document.createElement('div')
		leading.classList.add(TextFieldClasses.leading)
	}

	if (options?.TextFieldLeading === false) {
		leading.replaceChildren()
	}
	else if (options?.TextFieldLeading && options.TextFieldLeading !== true) {
		leading.replaceChildren(...options.TextFieldLeading)
	}

	// input
	let input = textfield.querySelector(`.${TextFieldClasses.input}`) as HTMLInputElement | null
	if (!input) {
		input = document.createElement('input')
		input.classList.add(TextFieldClasses.input)
		input.type = 'text'
	}

	const readonly = options?.TextFieldReadOnly
	if (readonly !== undefined) {
		input.readOnly = readonly
	}

	const placeholder = options?.TextFieldPlaceholder
	if (placeholder === false) {
		input.placeholder = ''
	}
	else if (placeholder && placeholder !== true) {
		input.placeholder = placeholder
	}

	const value = options?.TextFieldValue
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

	if (options?.TextFieldTrailing === false) {
		trailing.replaceChildren()
	}
	else if (options?.TextFieldTrailing && options.TextFieldTrailing !== true) {
		trailing.replaceChildren(...options.TextFieldTrailing)
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