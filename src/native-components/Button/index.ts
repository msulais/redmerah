import { ICON_ADD } from "@/constants/icons"
import {
	type IconUpdateOptions,
	type IconProps,
	createIcon,
	IconClasses,
	updateIcon
} from "@/native-components/Icon"

type ButtonProps = astroHTML.JSX.ButtonHTMLAttributes & {
	'c:variant'?: ButtonVariant
	'c:focused'?: boolean
}

type IconButtonProps = ButtonProps & {
	'c:icon'     : number
	'c:filled'  ?: boolean
	'c:attrIcon'?: Omit<IconProps, 'c:icon'> & {
		'c:icon'?: number
	}
}

type LinkButtonProps = astroHTML.JSX.AnchorHTMLAttributes & {
	'c:variant'?: ButtonVariant
	'c:focused'?: boolean
	'c:newTab' ?: boolean
}

type LinkIconButtonProps = LinkButtonProps & {
	'c:icon'     : number
	'c:filled'  ?: boolean
	'c:attrIcon'?: Omit<IconProps, 'c:icon'> & {
		'c:icon'?: number
	}
}

type ButtonUpdateOptions = {
	children?: (Node | string)[] | boolean
	variant ?: ButtonVariant | boolean
	focused ?: boolean
	disabled?: boolean
	refs    ?: {
		button?(el: HTMLButtonElement): unknown
	}
}

type LinkButtonUpdateOptions = {
	children?: (Node | string)[] | boolean
	href    ?: string | boolean
	newTab  ?: boolean
	variant ?: ButtonVariant | boolean
	focused ?: boolean
	refs    ?: {
		link?(el: HTMLAnchorElement): unknown
	}
}

type LinkIconButtonUpdateOptions = Omit<LinkButtonUpdateOptions, 'children' | 'refs'> & {
	icon?: IconUpdateOptions
	refs?: LinkButtonUpdateOptions['refs'] & {
		icon?(el: HTMLElement): unknown
	}
}

type IconButtonUpdateOptions = Omit<ButtonUpdateOptions, 'children' | 'refs'> & {
	icon?: IconUpdateOptions
	refs?: ButtonUpdateOptions['refs'] & {
		icon?(el: HTMLElement): unknown
	}
}

enum ButtonAttributes {
	variant = 'data-c-variant',
	focused = 'data-c-focused'
}

enum ButtonVariant {
	filled      = 'filled',
	outlined    = 'outlined',
	tonal       = 'tonal',
	transparent = 'transparent',
}

enum ButtonClasses {
	btn  = 'c-btn',
	icon = 'c-icon-btn'
}

function createButton(options?: ButtonUpdateOptions): HTMLButtonElement {
	const btn = document.createElement('button')
	return updateButton(btn, options)
}

function updateButton(button: HTMLButtonElement, options?: ButtonUpdateOptions): HTMLButtonElement {
	const refs = options?.refs
	const classList = button.classList
	classList.add(ButtonClasses.btn)

	const variant = options?.variant
	if (variant === false) {
		button.removeAttribute(ButtonAttributes.variant)
	}
	else if (variant && variant !== true) {
		button.setAttribute(ButtonAttributes.variant, variant)
	}

	const focused = options?.focused
	if (focused !== undefined) {
		button.toggleAttribute(ButtonAttributes.focused, focused)
	}

	const disabled = options?.disabled
	if (disabled !== undefined) {
		button.disabled = disabled
	}

	const children = options?.children
	if (children === false) {
		button.replaceChildren()
	}
	else if (children && children !== true) {
		button.replaceChildren(...children)
	}

	refs?.button?.(button)
	return button
}

function createLinkButton(options?: LinkButtonUpdateOptions): HTMLAnchorElement {
	const link = document.createElement('a')
	return updateLinkButton(link, options)
}

function updateLinkButton(link: HTMLAnchorElement, options?: LinkButtonUpdateOptions): HTMLAnchorElement {
	const classList = link.classList
	const refs = options?.refs
	classList.add(ButtonClasses.btn)

	const href = options?.href
	if (href === false) {
		link.removeAttribute('href')
	}
	else if (href && href !== true) {
		link.href = href
	}

	const variant = options?.variant
	if (variant === false) {
		link.removeAttribute(ButtonAttributes.variant)
	}
	else if (variant && variant !== true) {
		link.setAttribute(ButtonAttributes.variant, variant)
	}

	const newTab = options?.newTab
	if (newTab) {
		link.setAttribute('target', '_blank')
		link.setAttribute('rel', 'noopener noreferrer')
	}
	else if (newTab === false) {
		link.removeAttribute('target')
		link.removeAttribute('rel')
	}

	const focused = options?.focused
	if (focused !== undefined) {
		link.toggleAttribute(ButtonAttributes.focused, focused)
	}

	const children = options?.children
	if (children === false) {
		link.replaceChildren()
	}
	else if (children && children !== true) {
		link.replaceChildren(...children)
	}

	refs?.link?.(link)
	return link
}

function createIconButton(
	options: Omit<IconButtonUpdateOptions, 'icon'> & {
		icon: Omit<IconUpdateOptions, 'icon'> & { icon: number }
	}
): HTMLButtonElement {
	const btn = createButton(options)
	return updateIconButton(btn, options)
}

function updateIconButton(button: HTMLButtonElement, options?: IconButtonUpdateOptions): HTMLButtonElement {
	const classList = button.classList
	const refs = options?.refs
	updateButton(button, options)
	classList.add(ButtonClasses.icon)

	let icon = button.querySelector(`.${IconClasses.icon}`) as HTMLElement | null
	if (icon) {
		updateIcon(icon, options?.icon)
	}
	else {
		icon = createIcon({icon: ICON_ADD, ...options?.icon})
		button.replaceChildren(icon)
	}

	refs?.icon?.(icon)
	return button
}

function createLinkIconButton(
	options: Omit<LinkIconButtonUpdateOptions, 'icon'> & {
		icon: Omit<IconUpdateOptions, 'icon'> & { icon: number }
	}
): HTMLAnchorElement {
	const link = createLinkButton(options)
	return updateLinkIconButton(link, options)
}

function updateLinkIconButton(
	link: HTMLAnchorElement,
	options?: LinkIconButtonUpdateOptions
): HTMLAnchorElement {
	const classList = link.classList
	const refs = options?.refs
	updateLinkButton(link, options)
	classList.add(ButtonClasses.icon)

	let icon = link.querySelector(`.${IconClasses.icon}`) as HTMLElement | null
	if (icon) {
		updateIcon(icon, options?.icon)
	}
	else {
		icon = createIcon({icon: ICON_ADD, ...options?.icon})
		link.replaceChildren(icon)
	}

	refs?.icon?.(icon)
	return link
}

export {
	type ButtonProps,
	type IconButtonProps,
	type LinkButtonProps,
	type LinkIconButtonProps,
	type ButtonUpdateOptions,
	type IconButtonUpdateOptions,
	type LinkButtonUpdateOptions,
	type LinkIconButtonUpdateOptions,
	ButtonVariant,
	ButtonClasses,
	ButtonAttributes,
	updateButton,
	updateLinkButton,
	createButton,
	createIconButton,
	createLinkButton,
	createLinkIconButton,
	updateIconButton
}