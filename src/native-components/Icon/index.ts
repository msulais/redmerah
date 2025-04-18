type IconProps = astroHTML.JSX.HTMLAttributes & {
	IconCode   : number
	IconFilled?: boolean
	IconInline?: boolean
}

type IconUpdateOptions = {
	IconCode  ?: number
	IconFilled?: boolean
	IconInline?: boolean
	IconRefs  ?: {
		icon?(el: HTMLElement): unknown
	}
}

enum IconAttributes {
	inline = 'data-c-icon-inline'
}

enum IconClasses {
	icon = 'c-icon',
}

function createIcon(
	options: Omit<IconUpdateOptions, 'IconCode'> & { IconCode: number }
): HTMLElement {
	const icon = document.createElement('i')
	return updateIcon(icon, options)
}

function updateIcon(icon: HTMLElement, options?: IconUpdateOptions): HTMLElement {
	const classList = icon.classList
	classList.add(IconClasses.icon)
	icon.translate = false
	if (options?.IconInline !== undefined) {
		icon.toggleAttribute(IconAttributes.inline, options.IconInline)
	}
	if (options?.IconCode) {
		icon.textContent = String.fromCharCode(options.IconCode - (options.IconFilled? 1 : 0))
	}

	options?.IconRefs?.icon?.(icon)
	return icon
}

export {
	type IconProps,
	type IconUpdateOptions,
	IconClasses,
	IconAttributes,
	createIcon,
	updateIcon
}