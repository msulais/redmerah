import {
	updateButtonRef,
	type ButtonElement,
	type ButtonProps,
	type ButtonUpdateOptions
} from "@/components/Button"

type TextFieldProps = astroHTML.JSX.HTMLAttributes & {
	TextFieldInputAttr   ?: astroHTML.JSX.InputHTMLAttributes
	TextFieldLeadingAttr ?: astroHTML.JSX.HTMLAttributes
	TextFieldTrailingAttr?: astroHTML.JSX.HTMLAttributes
}

type TextFieldElement = HTMLDivElement
type TextFieldButtonElement = ButtonElement

type TextFieldButtonProps = ButtonProps

type TextFieldButtonUpdateOptions = ButtonUpdateOptions

type TextFieldUpdateOptions = {
	TextFieldLeading    ?: (string | Node)[] | boolean
	TextFieldTrailing   ?: (string | Node)[] | boolean
	TextFieldReadOnly   ?: boolean
	TextFieldType       ?: astroHTML.JSX.HTMLInputTypeAttribute
	TextFieldPlaceholder?: string | boolean
	TextFieldValue      ?: string | boolean
	TextFieldRefs       ?: {
		textfield?(ref: TextFieldElement): unknown
		leading  ?(ref: HTMLDivElement  ): unknown
		trailing ?(ref: HTMLDivElement  ): unknown
		input    ?(ref: HTMLInputElement): unknown
	}
}

enum TextFieldClasses {
	textfield = 'c-textfield',
	leading   = textfield + '-leading',
	input     = textfield + '-input',
	trailing  = textfield + '-trailing',
	button    = textfield + '-button'
}

function createTextFieldRef(options?: TextFieldUpdateOptions): TextFieldElement {
	const textFieldRef = document.createElement('div')
	return updateTextFieldRef(textFieldRef, options)
}

function updateTextFieldRef(
	textFieldRef: TextFieldElement,
	options?: TextFieldUpdateOptions
): TextFieldElement {
	const refs = options?.TextFieldRefs
	textFieldRef.classList.add(TextFieldClasses.textfield)

	// leading
	let leadingRef = textFieldRef.querySelector<HTMLDivElement>(`.${TextFieldClasses.leading}`)
	if (!leadingRef) {
		leadingRef = document.createElement('div')
		leadingRef.classList.add(TextFieldClasses.leading)
	}

	const leadingOption = options?.TextFieldLeading
	if (leadingOption === false) {
		leadingRef.replaceChildren()
	}
	else if (leadingOption !== undefined && leadingOption !== true) {
		leadingRef.replaceChildren(...leadingOption)
	}

	// input
	let inputRef = textFieldRef.querySelector<HTMLInputElement>(`.${TextFieldClasses.input}`)
	if (!inputRef) {
		inputRef = document.createElement('input')
		inputRef.classList.add(TextFieldClasses.input)
	}

	const typeOption = options?.TextFieldType
	if (typeOption !== undefined) {
		inputRef.type = typeOption ?? 'text'
	}

	const readOnlyOption = options?.TextFieldReadOnly
	if (readOnlyOption !== undefined) {
		inputRef.readOnly = readOnlyOption
	}

	const placeholderOption = options?.TextFieldPlaceholder
	if (placeholderOption === false) {
		inputRef.placeholder = ''
	}
	else if (placeholderOption !== undefined && placeholderOption !== true) {
		inputRef.placeholder = placeholderOption
	}

	const valueOption = options?.TextFieldValue
	if (valueOption === false) {
		inputRef.value = ''
	}
	else if (valueOption !== undefined && valueOption !== true) {
		inputRef.value = valueOption
	}

	// trailing
	let trailingRef = textFieldRef.querySelector<HTMLDivElement>(`.${TextFieldClasses.trailing}`)
	if (!trailingRef) {
		trailingRef = document.createElement('div')
		trailingRef.classList.add(TextFieldClasses.trailing)
	}

	const trailingOption = options?.TextFieldTrailing
	if (trailingOption === false) {
		trailingRef.replaceChildren()
	}
	else if (trailingOption !== undefined && trailingOption !== true) {
		trailingRef.replaceChildren(...trailingOption)
	}

	textFieldRef.replaceChildren(leadingRef, inputRef, trailingRef)
	refs?.input?.(inputRef)
	refs?.leading?.(leadingRef)
	refs?.textfield?.(textFieldRef)
	refs?.trailing?.(trailingRef)
	return textFieldRef
}

function createTextFieldButtonRef(options?: TextFieldButtonUpdateOptions): TextFieldButtonElement {
	const textFieldButtonRef = document.createElement('button')
	return updateTextFieldButtonRef(textFieldButtonRef, options)
}

function updateTextFieldButtonRef(
	textFieldButtonRef: TextFieldButtonElement,
	options?: TextFieldButtonUpdateOptions
): TextFieldButtonElement {
	updateButtonRef(textFieldButtonRef, options)
	textFieldButtonRef.classList.add(TextFieldClasses.button)
	return textFieldButtonRef
}

export {
	type TextFieldProps,
	type TextFieldUpdateOptions,
	type TextFieldButtonProps,
	type TextFieldElement,
	type TextFieldButtonElement,
	TextFieldClasses,
	createTextFieldRef,
	updateTextFieldRef,
	createTextFieldButtonRef,
	updateTextFieldButtonRef
}