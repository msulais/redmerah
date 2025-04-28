import { ICON_ADD } from "@/constants/icons"

import {
	type IconUpdateOptions,
	type IconProps,
	createIconRef,
	IconClasses,
	updateIconRef
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
		button?(ref: HTMLButtonElement): unknown
	}
}

type LinkButtonUpdateOptions = {
	LinkButtonChildren?: (Node | string)[] | boolean
	LinkButtonHref    ?: string | boolean
	LinkButtonNewTab  ?: boolean
	LinkButtonVariant ?: ButtonVariant | boolean
	LinkButtonFocused ?: boolean
	LinkButtonRefs    ?: {
		link?(ref: HTMLAnchorElement): unknown
	}
}

type LinkIconButtonUpdateOptions = Omit<LinkButtonUpdateOptions, 'LinkButtonChildren'> & {
	LinkIconButtonIcon?: IconUpdateOptions
	LinkIconButtonRefs?: {
		link?(ref: HTMLAnchorElement): unknown
		icon?(ref: HTMLElement): unknown
	}
}

type IconButtonUpdateOptions = Omit<ButtonUpdateOptions, 'ButtonChildren'> & {
	IconButtonIcon?: IconUpdateOptions
	IconButtonRefs?: {
		button?(ref: HTMLButtonElement): unknown
		icon  ?(ref: HTMLElement): unknown
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

function createButtonRef(options?: ButtonUpdateOptions): HTMLButtonElement {
	const buttonRef = document.createElement('button')
	return updateButtonRef(buttonRef, options)
}

function updateButtonRef(buttonRef: HTMLButtonElement, options?: ButtonUpdateOptions): HTMLButtonElement {
	const refs = options?.ButtonRefs
	buttonRef.classList.add(ButtonClasses.button)

	const variantOption = options?.ButtonVariant
	if (variantOption === false) {
		buttonRef.removeAttribute(ButtonAttributes.variant)
	}
	else if (variantOption !== undefined && variantOption !== true) {
		buttonRef.setAttribute(ButtonAttributes.variant, variantOption)
	}

	const focusedOption = options?.ButtonFocused
	if (focusedOption !== undefined) {
		buttonRef.toggleAttribute(ButtonAttributes.focused, focusedOption)
	}

	const disabledOption = options?.ButtonDisabled
	if (disabledOption !== undefined) {
		buttonRef.disabled = disabledOption
	}

	const childrenOption = options?.ButtonChildren
	if (childrenOption === false) {
		buttonRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		buttonRef.replaceChildren(...childrenOption)
	}

	refs?.button?.(buttonRef)
	return buttonRef
}

function createLinkButtonRef(options?: LinkButtonUpdateOptions): HTMLAnchorElement {
	const linkRef = document.createElement('a')
	return updateLinkButtonRef(linkRef, options)
}

function updateLinkButtonRef(linkRef: HTMLAnchorElement, options?: LinkButtonUpdateOptions): HTMLAnchorElement {
	const refs = options?.LinkButtonRefs
	linkRef.classList.add(ButtonClasses.button)

	const hrefOption = options?.LinkButtonHref
	if (hrefOption === false) {
		linkRef.removeAttribute('href')
	}
	else if (hrefOption !== undefined && hrefOption !== true) {
		linkRef.href = hrefOption
	}

	const variantOption = options?.LinkButtonVariant
	if (variantOption === false) {
		linkRef.removeAttribute(ButtonAttributes.variant)
	}
	else if (variantOption !== undefined && variantOption !== true) {
		linkRef.setAttribute(ButtonAttributes.variant, variantOption)
	}

	const newTabOption = options?.LinkButtonNewTab
	if (newTabOption) {
		linkRef.setAttribute('target', '_blank')
		linkRef.setAttribute('rel', 'noopener noreferrer')
	}
	else if (newTabOption === false) {
		linkRef.removeAttribute('target')
		linkRef.removeAttribute('rel')
	}

	const focusedOption = options?.LinkButtonFocused
	if (focusedOption !== undefined) {
		linkRef.toggleAttribute(ButtonAttributes.focused, focusedOption)
	}

	const childrenOption = options?.LinkButtonChildren
	if (childrenOption === false) {
		linkRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		linkRef.replaceChildren(...childrenOption)
	}

	refs?.link?.(linkRef)
	return linkRef
}

function createIconButtonRef(
	options: Omit<IconButtonUpdateOptions, 'IconButtonIcon'> & {
		IconButtonIcon: Omit<IconUpdateOptions, 'IconCode'> & { IconCode: number }
	}
): HTMLButtonElement {
	const iconButtonRef = createButtonRef(options)
	return updateIconButtonRef(iconButtonRef, options)
}

function updateIconButtonRef(iconButtonRef: HTMLButtonElement, options?: IconButtonUpdateOptions): HTMLButtonElement {
	const refs = options?.IconButtonRefs
	updateButtonRef(iconButtonRef, options)
	iconButtonRef.classList.add(ButtonClasses.icon)

	const iconOption = options?.IconButtonIcon
	let iconRef = iconButtonRef.querySelector(`.${IconClasses.icon}`) as HTMLElement | null
	if (iconRef) {
		updateIconRef(iconRef, iconOption)
	}
	else {
		iconRef = createIconRef({IconCode: ICON_ADD, ...iconOption})
		iconButtonRef.replaceChildren(iconRef)
	}

	refs?.button?.(iconButtonRef)
	refs?.icon?.(iconRef)
	return iconButtonRef
}

function createLinkIconButtonRef(
	options: Omit<LinkIconButtonUpdateOptions, 'LinkIconButtonIcon'> & {
		LinkIconButtonIcon: Omit<IconUpdateOptions, 'IconCode'> & { IconCode: number }
	}
): HTMLAnchorElement {
	const linkIconButtonRef = createLinkButtonRef(options)
	return updateLinkIconButtonRef(linkIconButtonRef, options)
}

function updateLinkIconButtonRef(
	linkIconButtonRef: HTMLAnchorElement,
	options?: LinkIconButtonUpdateOptions
): HTMLAnchorElement {
	const refs = options?.LinkIconButtonRefs
	updateLinkButtonRef(linkIconButtonRef, options)
	linkIconButtonRef.classList.add(ButtonClasses.icon)

	const iconOption = options?.LinkIconButtonIcon
	let iconRef = linkIconButtonRef.querySelector(`.${IconClasses.icon}`) as HTMLElement | null
	if (iconRef) {
		updateIconRef(iconRef, iconOption)
	}
	else {
		iconRef = createIconRef({IconCode: ICON_ADD, ...iconOption})
		linkIconButtonRef.replaceChildren(iconRef)
	}

	refs?.link?.(linkIconButtonRef)
	refs?.icon?.(iconRef)
	return linkIconButtonRef
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
	updateButtonRef,
	updateLinkButtonRef,
	createButtonRef,
	createIconButtonRef,
	createLinkButtonRef,
	createLinkIconButtonRef,
	updateIconButtonRef
}