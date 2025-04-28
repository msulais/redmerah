import {
	updateButtonRef,
	updateLinkButtonRef,
	type ButtonProps,
	type ButtonUpdateOptions,
	type LinkButtonProps,
	type LinkButtonUpdateOptions
} from "@/native-components/Button"

type DrawerProps = astroHTML.JSX.HTMLAttributes & {
	DrawerContainerAttr?: astroHTML.JSX.HTMLAttributes
	DrawerHeaderAttr   ?: astroHTML.JSX.HTMLAttributes
	DrawerContentAttr  ?: astroHTML.JSX.HTMLAttributes
	DrawerFooterAttr   ?: astroHTML.JSX.HTMLAttributes
}

type DrawerButtonProps = ButtonProps & {
	DrawerButtonSelected?: boolean
}

type LinkDrawerButtonProps = LinkButtonProps & {
	LinkDrawerButtonSelected?: boolean
}

type DrawerButtonUpdateOptions = ButtonUpdateOptions & {
	DrawerButtonSelected?: boolean
	DrawerButtonRefs    ?: {
		button?(ref: HTMLButtonElement): unknown
	}
}

type LinkDrawerButtonUpdateOptions = LinkButtonUpdateOptions & {
	DrawerButtonSelected?: boolean
	DrawerButtonRefs    ?: {
		link?(ref: HTMLAnchorElement): unknown
	}
}

type DrawerUpdateOptions = {
	DrawerChildren?: (string | Node)[] | boolean
	DrawerHeader  ?: (string | Node)[] | boolean
	DrawerFooter  ?: (string | Node)[] | boolean
	DrawerRefs    ?: {
		drawer   ?(ref: HTMLDivElement): unknown
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

function openDrawerRef(drawerRef: HTMLDivElement): void {
	drawerRef.showPopover()
}

function closeDrawerRef(drawerRef: HTMLDivElement): void {
	drawerRef.hidePopover()
}

function isDrawerRefOpen(drawerRef: HTMLDivElement): boolean {
	return drawerRef.matches(':popover-open')
}

function createDrawerRef(options?: DrawerUpdateOptions): HTMLDivElement {
	const drawerRef = document.createElement('div')
	return updateDrawerRef(drawerRef, options)
}

function updateDrawerRef(drawerRef: HTMLDivElement, options?: DrawerUpdateOptions): HTMLDivElement {
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

function createDrawerButtonRef(options?: DrawerButtonUpdateOptions): HTMLButtonElement {
	const buttonRef = document.createElement('button')
	return updateDrawerButtonRef(buttonRef, options)
}

function updateDrawerButtonRef(drawerButtonRef: HTMLButtonElement, options?: DrawerButtonUpdateOptions): HTMLButtonElement {
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

function createLinkDrawerButtonRef(options?: LinkDrawerButtonUpdateOptions): HTMLAnchorElement {
	const linkRef = document.createElement('a')
	return updateLinkDrawerButtonRef(linkRef, options)
}

function updateLinkDrawerButtonRef(linkDrawerButtonRef: HTMLAnchorElement, options?: LinkDrawerButtonUpdateOptions): HTMLAnchorElement {
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