import { ICON_ADD } from "@/constants/icons"
import {
	type IconUpdateOptions,
	type IconProps,
	createIcon,
	IconClasses,
	updateIcon
} from "@/native-components/Icon"

type ButtonProps = astroHTML.JSX.ButtonHTMLAttributes & {
	ButtonVariant?: ButtonVariant
	ButtonFocused?: boolean
}

type IconButtonProps = ButtonProps & {
	IconButtonCode     : number
	IconButtonFilled  ?: boolean
	IconButtonIconAttr?: Omit<IconProps, 'IconCode'> & {
		IconCode?: number
	}
}

type LinkButtonProps = astroHTML.JSX.AnchorHTMLAttributes & {
	LinkButtonVariant?: ButtonVariant
	LinkButtonFocused?: boolean
	LinkButtonNewTab ?: boolean
}

type LinkIconButtonProps = LinkButtonProps & {
	LinkIconButtonCode     : number
	LinkIconButtonFilled  ?: boolean
	LinkIconButtonIconAttr?: Omit<IconProps, 'IconCode'> & {
		IconCode?: number
	}
}

type ButtonUpdateOptions = {
	ButtonChildren?: (Node | string)[] | boolean
	ButtonVariant ?: ButtonVariant | boolean
	ButtonFocused ?: boolean
	ButtonDisabled?: boolean
	ButtonRefs    ?: {
		button?(el: HTMLButtonElement): unknown
	}
}

type LinkButtonUpdateOptions = {
	LinkButtonChildren?: (Node | string)[] | boolean
	LinkButtonHref    ?: string | boolean
	LinkButtonNewTab  ?: boolean
	LinkButtonVariant ?: ButtonVariant | boolean
	LinkButtonFocused ?: boolean
	LinkButtonRefs    ?: {
		link?(el: HTMLAnchorElement): unknown
	}
}

type LinkIconButtonUpdateOptions = Omit<LinkButtonUpdateOptions, 'LinkButtonChildren'> & {
	LinkIconButtonIcon?: IconUpdateOptions
	LinkIconButtonRefs?: {
		link?(el: HTMLAnchorElement): unknown
		icon?(el: HTMLElement): unknown
	}
}

type IconButtonUpdateOptions = Omit<ButtonUpdateOptions, 'ButtonChildren'> & {
	IconButtonIcon?: IconUpdateOptions
	IconButtonRefs?: {
		button?(el: HTMLButtonElement): unknown
		icon  ?(el: HTMLElement): unknown
	}
}

enum ButtonAttributes {
	variant = 'data-c-button-variant',
	focused = 'data-c-button-focused'
}

enum ButtonVariant {
	filled      = 'filled',
	outlined    = 'outlined',
	tonal       = 'tonal',
	transparent = 'transparent',
}

enum ButtonClasses {
	button  = 'c-button',
	icon    = 'c-icon-button'
}

function createButton(options?: ButtonUpdateOptions): HTMLButtonElement {
	const btn = document.createElement('button')
	return updateButton(btn, options)
}

function updateButton(button: HTMLButtonElement, options?: ButtonUpdateOptions): HTMLButtonElement {
	const refs = options?.ButtonRefs
	const classList = button.classList
	classList.add(ButtonClasses.button)

	const variant = options?.ButtonVariant
	if (variant === false) {
		button.removeAttribute(ButtonAttributes.variant)
	}
	else if (variant !== undefined && variant !== true) {
		button.setAttribute(ButtonAttributes.variant, variant)
	}

	const focused = options?.ButtonFocused
	if (focused !== undefined) {
		button.toggleAttribute(ButtonAttributes.focused, focused)
	}

	const disabled = options?.ButtonDisabled
	if (disabled !== undefined) {
		button.disabled = disabled
	}

	const children = options?.ButtonChildren
	if (children === false) {
		button.replaceChildren()
	}
	else if (children !== undefined && children !== true) {
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
	const refs = options?.LinkButtonRefs
	classList.add(ButtonClasses.button)

	const href = options?.LinkButtonHref
	if (href === false) {
		link.removeAttribute('href')
	}
	else if (href !== undefined && href !== true) {
		link.href = href
	}

	const variant = options?.LinkButtonVariant
	if (variant === false) {
		link.removeAttribute(ButtonAttributes.variant)
	}
	else if (variant !== undefined && variant !== true) {
		link.setAttribute(ButtonAttributes.variant, variant)
	}

	const newTab = options?.LinkButtonNewTab
	if (newTab) {
		link.setAttribute('target', '_blank')
		link.setAttribute('rel', 'noopener noreferrer')
	}
	else if (newTab === false) {
		link.removeAttribute('target')
		link.removeAttribute('rel')
	}

	const focused = options?.LinkButtonFocused
	if (focused !== undefined) {
		link.toggleAttribute(ButtonAttributes.focused, focused)
	}

	const children = options?.LinkButtonChildren
	if (children === false) {
		link.replaceChildren()
	}
	else if (children !== undefined && children !== true) {
		link.replaceChildren(...children)
	}

	refs?.link?.(link)
	return link
}

function createIconButton(
	options: Omit<IconButtonUpdateOptions, 'IconButtonIcon'> & {
		IconButtonIcon: Omit<IconUpdateOptions, 'IconCode'> & { IconCode: number }
	}
): HTMLButtonElement {
	const btn = createButton(options)
	return updateIconButton(btn, options)
}

function updateIconButton(button: HTMLButtonElement, options?: IconButtonUpdateOptions): HTMLButtonElement {
	const classList = button.classList
	const refs = options?.IconButtonRefs
	updateButton(button, options)
	classList.add(ButtonClasses.icon)

	let icon = button.querySelector(`.${IconClasses.icon}`) as HTMLElement | null
	if (icon) {
		updateIcon(icon, options?.IconButtonIcon)
	}
	else {
		icon = createIcon({IconCode: ICON_ADD, ...options?.IconButtonIcon})
		button.replaceChildren(icon)
	}

	refs?.button?.(button)
	refs?.icon?.(icon)
	return button
}

function createLinkIconButton(
	options: Omit<LinkIconButtonUpdateOptions, 'LinkIconButtonIcon'> & {
		LinkIconButtonIcon: Omit<IconUpdateOptions, 'IconCode'> & { IconCode: number }
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
	const refs = options?.LinkIconButtonRefs
	updateLinkButton(link, options)
	classList.add(ButtonClasses.icon)

	let icon = link.querySelector(`.${IconClasses.icon}`) as HTMLElement | null
	if (icon) {
		updateIcon(icon, options?.LinkIconButtonIcon)
	}
	else {
		icon = createIcon({IconCode: ICON_ADD, ...options?.LinkIconButtonIcon})
		link.replaceChildren(icon)
	}

	refs?.link?.(link)
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