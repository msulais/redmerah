type TextAreaFieldProps = astroHTML.JSX.TextareaHTMLAttributes

type TextAreaFieldElement = HTMLTextAreaElement

type TextAreaFieldUpdateOption = {
	TextAreaFieldValue?: string
	TextAreaFieldRefs?: {
		textareafield?: (ref: TextAreaFieldElement) => unknown
	}
}

enum TextAreaFieldClasses {
	textareafield = 'c-textareafield'
}

function createTextAreaFieldRef(options?: TextAreaFieldUpdateOption): TextAreaFieldElement {
	const textAreaFieldRef = document.createElement('textarea')
	return updateTextAreaFieldRef(textAreaFieldRef, options)
}

function updateTextAreaFieldRef(
	textAreaFieldRef: TextAreaFieldElement,
	options?: TextAreaFieldUpdateOption
): TextAreaFieldElement {
	textAreaFieldRef.classList.add(TextAreaFieldClasses.textareafield)
	const value = options?.TextAreaFieldValue
	if (typeof value === 'string') {
		textAreaFieldRef.value = value
	}

	return textAreaFieldRef
}

export {
	type TextAreaFieldProps,
	type TextAreaFieldElement,
	type TextAreaFieldUpdateOption,
	TextAreaFieldClasses,
	createTextAreaFieldRef,
	updateTextAreaFieldRef
}