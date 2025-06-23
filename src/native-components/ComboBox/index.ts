import { validEnumValue } from "@/utils/object"
import { ButtonClasses } from "../Button"

type ComboBoxProps = astroHTML.JSX.SelectHTMLAttributes & {
	ComboBoxVariant?: ComboBoxVariant
}

type ComboBoxOptionProps = astroHTML.JSX.OptionHTMLAttributes

type ComboBoxElement = HTMLSelectElement

type ComboBoxOptionElement = HTMLOptionElement

type ComboBoxUpdateOptions = {
	ComboBoxVariant?: ComboBoxVariant
	ComboBoxChildren?: (string | Node)[] | boolean
	ComboBoxRefs?: {
		combobox?(ref: ComboBoxElement): unknown
	}
}

type ComboBoxOptionUpdateOptions = {
	ComboBoxOptionChildren?: (string | Node)[] | boolean
	ComboBoxOptionRefs?: {
		option?(ref: ComboBoxOptionElement): unknown
	}
}

enum ComboBoxClasses {
	combobox = 'c-combobox',
	option = combobox + '-option'
}

enum ComboBoxAttributes {
	variant = 'data-c-combobox-variant'
}

enum ComboBoxVariant {
	filled = 'filled',
	outlined = 'outlined',
	tonal = 'tonal',
	transparent = 'transparent',
}

function createComboBoxRef(options?: ComboBoxUpdateOptions): ComboBoxElement {
	const comboBoxRef = document.createElement('select')
	return updateComboBoxRef(comboBoxRef, options)
}

function updateComboBoxRef(comboBoxRef: ComboBoxElement, options?: ComboBoxUpdateOptions): ComboBoxElement {
	comboBoxRef.classList.add(ComboBoxClasses.combobox)
	if (!comboBoxRef.hasAttribute('autocomplete')) {
		comboBoxRef.setAttribute('autocomplete', 'off')
	}

	const variantOption = options?.ComboBoxVariant
	if (variantOption && validEnumValue(variantOption, ComboBoxVariant)) {
		comboBoxRef.setAttribute(ComboBoxAttributes.variant, variantOption)
	}

	// children
	const childrenOption = options?.ComboBoxChildren
	if (childrenOption === false) {
		comboBoxRef.replaceChildren()
	}
	else if (childrenOption && childrenOption !== true) {
		comboBoxRef.replaceChildren(...childrenOption)
	}

	const refs = options?.ComboBoxRefs
	refs?.combobox?.(comboBoxRef)
	return comboBoxRef
}

function createComboBoxOptionRef(options?: ComboBoxOptionUpdateOptions): ComboBoxOptionElement {
	const optionRef = document.createElement('option')
	return updateComboBoxOptionRef(optionRef, options)
}

function updateComboBoxOptionRef(
	optionRef: ComboBoxOptionElement,
	options?: ComboBoxOptionUpdateOptions
): ComboBoxOptionElement {
	optionRef.classList.add(ButtonClasses.button, ComboBoxClasses.option)

	// children
	const childrenOption = options?.ComboBoxOptionChildren
	if (childrenOption === false) {
		optionRef.replaceChildren()
	}
	else if (childrenOption && childrenOption !== true) {
		optionRef.replaceChildren(...childrenOption)
	}

	const refs = options?.ComboBoxOptionRefs
	refs?.option?.(optionRef)
	return optionRef
}

export {
	type ComboBoxProps,
	type ComboBoxElement,
	type ComboBoxUpdateOptions,
	type ComboBoxOptionProps,
	type ComboBoxOptionElement,
	type ComboBoxOptionUpdateOptions,
	ComboBoxAttributes,
	ComboBoxClasses,
	ComboBoxVariant,
	createComboBoxRef,
	updateComboBoxRef,
	createComboBoxOptionRef,
	updateComboBoxOptionRef
}