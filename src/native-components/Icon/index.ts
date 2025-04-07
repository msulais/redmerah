type IconProps = astroHTML.JSX.HTMLAttributes & {
	'c:icon'   : number
	'c:filled'?: boolean
	'c:inline'?: boolean
}

type IconUpdateOptions = {
	icon  ?: number
	filled?: boolean
	inline?: boolean
	refs  ?: {
		icon?(el: HTMLElement): unknown
	}
}

enum IconAttributes {
	inline = 'data-c-inline'
}

enum IconClasses {
	icon = 'c-icon',
}

function createIcon(
	options: Omit<IconUpdateOptions, 'icon'> & { icon: number }
): HTMLElement {
	const icon = document.createElement('i')
	return updateIcon(icon, options)
}

function updateIcon(icon: HTMLElement, options?: IconUpdateOptions): HTMLElement {
	const classList = icon.classList
	classList.add(IconClasses.icon)
	icon.translate = false
	if (options?.inline !== undefined) {
		icon.toggleAttribute(IconAttributes.inline, options.inline)
	}
	if (options?.icon) {
		icon.textContent = String.fromCharCode(options.icon - (options.filled? 1 : 0))
	}

	options?.refs?.icon?.(icon)
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