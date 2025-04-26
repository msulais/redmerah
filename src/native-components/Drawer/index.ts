import { updateButton, type ButtonProps, type ButtonUpdateOptions } from "../Button"

type DrawerProps = astroHTML.JSX.HTMLAttributes & {
	DrawerContainerAttr?: astroHTML.JSX.HTMLAttributes
	DrawerHeaderAttr   ?: astroHTML.JSX.HTMLAttributes
	DrawerContentAttr  ?: astroHTML.JSX.HTMLAttributes
	DrawerFooterAttr   ?: astroHTML.JSX.HTMLAttributes
}

type DrawerButtonProps = ButtonProps & {
	DrawerButtonSelected?: boolean
}

type DrawerButtonUpdateOptions = ButtonUpdateOptions & {
	DrawerButtonSelected?: boolean
	DrawerButtonRefs    ?: {
		button?(el: HTMLButtonElement): unknown
	}
}

type DrawerUpdateOptions = {
	DrawerChildren?: (string | Node)[] | boolean
	DrawerHeader  ?: (string | Node)[] | boolean
	DrawerFooter  ?: (string | Node)[] | boolean
	DrawerRefs    ?: {
		drawer   ?(el: HTMLDivElement): unknown
		container?(el: HTMLDivElement): unknown
		header   ?(el: HTMLDivElement): unknown
		content  ?(el: HTMLDivElement): unknown
		footer   ?(el: HTMLDivElement): unknown
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

function openDrawer(drawerRef: HTMLDivElement): void {
	drawerRef.showPopover()
}

function closeDrawer(drawerRef: HTMLDivElement): void {
	drawerRef.hidePopover()
}

function isDrawerOpen(drawerRef: HTMLDivElement): boolean {
	return drawerRef.matches(':popover-open')
}

function createDrawer(options?: DrawerUpdateOptions): HTMLDivElement {
	const drawerRef = document.createElement('div')
	return updateDrawer(drawerRef, options)
}

function updateDrawer(drawerRef: HTMLDivElement, options?: DrawerUpdateOptions): HTMLDivElement {
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

	const header = options?.DrawerHeader
	if (header === false) {
		headerRef.replaceChildren()
	}
	else if (header !== undefined && header !== true) {
		headerRef.replaceChildren(...header)
	}

	// container -> content
	let contentRef = containerRef.querySelector<HTMLDivElement>(`.${DrawerClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(DrawerClasses.content)
	}

	const children = options?.DrawerChildren
	if (children === false) {
		contentRef.replaceChildren()
	}
	else if (children !== undefined && children !== true) {
		contentRef.replaceChildren(...children)
	}

	// container -> footer
	let footerRef = containerRef.querySelector<HTMLDivElement>(`.${DrawerClasses.footer}`)
	if (!footerRef) {
		footerRef = document.createElement('div')
		footerRef.classList.add(DrawerClasses.footer)
	}

	const footer = options?.DrawerFooter
	if (footer === false) {
		footerRef.replaceChildren()
	}
	else if (footer !== undefined && footer !== true) {
		footerRef.replaceChildren(...footer)
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

function createDrawerButton(options?: DrawerButtonUpdateOptions): HTMLButtonElement {
	const buttonRef = document.createElement('button')
	return updateDrawerButton(buttonRef, options)
}

function updateDrawerButton(drawerButtonRef: HTMLButtonElement, options?: DrawerButtonUpdateOptions): HTMLButtonElement {
	const refs = options?.DrawerButtonRefs
	updateButton(drawerButtonRef, options)
	drawerButtonRef.classList.add(DrawerClasses.button)

	const selected = options?.DrawerButtonSelected
	if (selected !== undefined) {
		drawerButtonRef.toggleAttribute(DrawerButtonAttributes.selected, selected)
	}

	refs?.button?.(drawerButtonRef)
	return drawerButtonRef
}

export {
	type DrawerProps,
	type DrawerButtonProps,
	type DrawerUpdateOptions,
	type DrawerButtonUpdateOptions,
	DrawerClasses,
	DrawerButtonAttributes,
	openDrawer,
	closeDrawer,
	isDrawerOpen,
	createDrawer,
	updateDrawer,
	createDrawerButton,
	updateDrawerButton
}