import {
	updateButtonRef,
	updateLinkButtonRef,
	type ButtonElement,
	type ButtonProps,
	type ButtonUpdateOptions,
	type LinkButtonElement,
	type LinkButtonProps,
	type LinkButtonUpdateOptions
} from "@/native-components/Button"

type DrawerProps = astroHTML.JSX.HTMLAttributes & {
	DrawerContainerAttr?: astroHTML.JSX.HTMLAttributes
	DrawerHeaderAttr   ?: astroHTML.JSX.HTMLAttributes
	DrawerContentAttr  ?: astroHTML.JSX.HTMLAttributes
	DrawerFooterAttr   ?: astroHTML.JSX.HTMLAttributes
}

type DrawerElement = HTMLDivElement
type DrawerButtonElement = ButtonElement
type LinkDrawerButtonElement = LinkButtonElement

type DrawerButtonProps = ButtonProps & {
	DrawerButtonSelected?: boolean
}

type LinkDrawerButtonProps = LinkButtonProps & {
	LinkDrawerButtonSelected?: boolean
}

type DrawerButtonUpdateOptions = ButtonUpdateOptions & {
	DrawerButtonSelected?: boolean
	DrawerButtonRefs    ?: {
		button?(ref: DrawerButtonElement): unknown
	}
}

type LinkDrawerButtonUpdateOptions = LinkButtonUpdateOptions & {
	DrawerButtonSelected?: boolean
	DrawerButtonRefs    ?: {
		link?(ref: LinkDrawerButtonElement): unknown
	}
}

type DrawerUpdateOptions = {
	DrawerChildren?: (string | Node)[] | boolean
	DrawerHeader  ?: (string | Node)[] | boolean
	DrawerFooter  ?: (string | Node)[] | boolean
	DrawerRefs    ?: {
		drawer   ?(ref: DrawerElement ): unknown
		container?(ref: HTMLDivElement): unknown
		header   ?(ref: HTMLDivElement): unknown
		content  ?(ref: HTMLDivElement): unknown
		footer   ?(ref: HTMLDivElement): unknown
	}
}

enum DrawerClasses {
	drawer    = 'c-drawer',
	container = drawer + '-container',
	header    = drawer + '-header',
	content   = drawer + '-content',
	footer    = drawer + '-footer',
	button    = drawer + '-button'
}

enum DrawerButtonAttributes {
	selected = 'data-c-drawer-button-selected'
}

function openDrawerRef(drawerRef: DrawerElement): void {
	drawerRef.showPopover()
}

function closeDrawerRef(drawerRef: DrawerElement): void {
	drawerRef.hidePopover()
}

function isDrawerRefOpen(drawerRef: DrawerElement): boolean {
	return drawerRef.matches(':popover-open')
}

function createDrawerRef(options?: DrawerUpdateOptions): DrawerElement {
	const drawerRef = document.createElement('div')
	return updateDrawerRef(drawerRef, options)
}

function updateDrawerRef(drawerRef: DrawerElement, options?: DrawerUpdateOptions): DrawerElement {
	const refs = options?.DrawerRefs
	drawerRef.classList.add(DrawerClasses.drawer)
	drawerRef.popover = 'auto'

	// container
	let containerRef = drawerRef.querySelector<HTMLDivElement>(`.${DrawerClasses.container}`)
	if (!containerRef) {
		containerRef = document.createElement('div')
		containerRef.classList.add(DrawerClasses.container)
	}

	// container -> header
	let headerRef = containerRef.querySelector<HTMLDivElement>(`.${DrawerClasses.header}`)
	if (!headerRef) {
		headerRef = document.createElement('div')
		headerRef.classList.add(DrawerClasses.header)
	}

	const headerOption = options?.DrawerHeader
	if (headerOption === false) {
		headerRef.replaceChildren()
	}
	else if (headerOption !== undefined && headerOption !== true) {
		headerRef.replaceChildren(...headerOption)
	}

	// container -> content
	let contentRef = containerRef.querySelector<HTMLDivElement>(`.${DrawerClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(DrawerClasses.content)
	}

	const childrenOption = options?.DrawerChildren
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	// container -> footer
	let footerRef = containerRef.querySelector<HTMLDivElement>(`.${DrawerClasses.footer}`)
	if (!footerRef) {
		footerRef = document.createElement('div')
		footerRef.classList.add(DrawerClasses.footer)
	}

	const footerOption = options?.DrawerFooter
	if (footerOption === false) {
		footerRef.replaceChildren()
	}
	else if (footerOption !== undefined && footerOption !== true) {
		footerRef.replaceChildren(...footerOption)
	}

	containerRef.replaceChildren(headerRef, contentRef, footerRef)
	drawerRef.replaceChildren(containerRef)
	refs?.drawer?.(drawerRef)
	refs?.container?.(containerRef)
	refs?.header?.(headerRef)
	refs?.content?.(contentRef)
	refs?.footer?.(footerRef)
	return drawerRef
}

function createDrawerButtonRef(options?: DrawerButtonUpdateOptions): DrawerButtonElement {
	const buttonRef = document.createElement('button')
	return updateDrawerButtonRef(buttonRef, options)
}

function updateDrawerButtonRef(drawerButtonRef: DrawerButtonElement, options?: DrawerButtonUpdateOptions): DrawerButtonElement {
	const refs = options?.DrawerButtonRefs
	updateButtonRef(drawerButtonRef, options)
	drawerButtonRef.classList.add(DrawerClasses.button)

	const selectedOption = options?.DrawerButtonSelected
	if (selectedOption !== undefined) {
		drawerButtonRef.toggleAttribute(DrawerButtonAttributes.selected, selectedOption)
	}

	refs?.button?.(drawerButtonRef)
	return drawerButtonRef
}

function createLinkDrawerButtonRef(options?: LinkDrawerButtonUpdateOptions): LinkDrawerButtonElement {
	const linkRef = document.createElement('a')
	return updateLinkDrawerButtonRef(linkRef, options)
}

function updateLinkDrawerButtonRef(
	linkDrawerButtonRef: LinkDrawerButtonElement,
	options?: LinkDrawerButtonUpdateOptions
): LinkDrawerButtonElement {
	const refs = options?.DrawerButtonRefs
	updateLinkButtonRef(linkDrawerButtonRef, options)
	linkDrawerButtonRef.classList.add(DrawerClasses.button)

	const selectedOption = options?.DrawerButtonSelected
	if (selectedOption !== undefined) {
		linkDrawerButtonRef.toggleAttribute(DrawerButtonAttributes.selected, selectedOption)
	}

	refs?.link?.(linkDrawerButtonRef)
	return linkDrawerButtonRef
}

export {
	type DrawerProps,
	type DrawerButtonProps,
	type DrawerUpdateOptions,
	type DrawerButtonUpdateOptions,
	type LinkDrawerButtonProps,
	type LinkDrawerButtonUpdateOptions,
	type DrawerElement,
	type DrawerButtonElement,
	type LinkDrawerButtonElement,
	DrawerClasses,
	DrawerButtonAttributes,
	openDrawerRef,
	closeDrawerRef,
	isDrawerRefOpen,
	createDrawerRef,
	updateDrawerRef,
	createDrawerButtonRef,
	updateDrawerButtonRef,
	createLinkDrawerButtonRef,
	updateLinkDrawerButtonRef
}