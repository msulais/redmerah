type IconProps = astroHTML.JSX.HTMLAttributes & {
	IconCode   : number
	IconFilled?: boolean
	IconInline?: boolean
}

type IconElement = HTMLElement

type IconUpdateOptions = {
	IconCode  ?: number
	IconFilled?: boolean
	IconInline?: boolean
	IconRefs  ?: {
		icon?(ref: IconElement): unknown
	}
}

enum IconAttributes {
	inline = 'data-c-icon-inline'
}

enum IconClasses {
	icon = 'c-icon',
}

function createIconRef(
	options: Omit<IconUpdateOptions, 'IconCode'> & { IconCode: number }
): IconElement {
	const iconRef = document.createElement('i')
	return updateIconRef(iconRef, options)
}

function updateIconRef(iconRef: IconElement, options?: IconUpdateOptions): IconElement {
	const classList = iconRef.classList
	classList.add(IconClasses.icon)
	iconRef.translate = false

	const inlineOption = options?.IconInline
	if (inlineOption !== undefined) {
		iconRef.toggleAttribute(IconAttributes.inline, inlineOption)
	}

	const filledOption = options?.IconFilled
	if (filledOption !== undefined && iconRef.textContent && iconRef.textContent.trim().length > 0) {
		const code = iconRef.textContent.trim().charCodeAt(0)
		iconRef.textContent = String.fromCharCode(code + (filledOption? -1 : 1))
	}
	if (options?.IconCode !== undefined) {
		iconRef.textContent = String.fromCharCode(options.IconCode - (options.IconFilled? 1 : 0))
	}

	options?.IconRefs?.icon?.(iconRef)
	return iconRef
}

export {
	type IconProps,
	type IconUpdateOptions,
	type IconElement,
	IconClasses,
	IconAttributes,
	createIconRef,
	updateIconRef
}