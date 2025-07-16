import {
	type ButtonUpdateOptions,
	type ButtonProps,
	createButtonRef,
	updateButtonRef,
	type ButtonElement,
} from "@/components/Button"

type SideBarProps = astroHTML.JSX.HTMLAttributes & {
	SideBarTagName    ?: string
	SideBarMinimized  ?: boolean
	SideBarContentAttr?: astroHTML.JSX.HTMLAttributes
	SideBarHeaderAttr ?: astroHTML.JSX.HTMLAttributes
	SideBarFooterAttr ?: astroHTML.JSX.HTMLAttributes
}

type SideBarButtonProps = ButtonProps & {
	SideBarButtonSelected   ?: boolean
	SideBarButtonContentAttr?: astroHTML.JSX.HTMLAttributes
	SideBarButtonLeadingAttr?: astroHTML.JSX.HTMLAttributes
}

type SideBarElement<T extends HTMLElement> = T
type SideBarButtonElement = ButtonElement

type SideBarUpdateOptions<T extends SideBarElement<HTMLElement>> = {
	SideBarMinimized?: boolean
	SideBarChildren ?: (Node | string)[] | boolean
	SideBarHeader   ?: (Node | string)[] | boolean
	SideBarFooter   ?: (Node | string)[] | boolean
	SideBarRefs     ?: {
		sideBar?(ref: T             ): unknown
		content?(ref: HTMLDivElement): unknown
		header ?(ref: HTMLDivElement): unknown
		footer ?(ref: HTMLDivElement): unknown
	}
}

type SideBarButtonUpdateOptions = ButtonUpdateOptions & {
	SideBarButtonSelected?: boolean
	SideBarButtonLeading ?: (string | Node)[] | boolean
	SideBarButtonRefs    ?: {
		button ?(ref: SideBarButtonElement): unknown
		content?(ref: HTMLDivElement): unknown
		leading?(ref: HTMLDivElement): unknown
	}
}

enum SideBarAttributes {
	minimized = 'data-c-sidebar-minimized'
}

enum SideBarButtonAttributes {
	selected = 'data-c-sidebar-button-selected'
}

enum SideBarClasses {
	sideBar       = 'c-sidebar',
	content       = sideBar + '-content',
	header        = sideBar + '-header',
	footer        = sideBar + '-footer',
	button        = sideBar + '-button',
	buttonContent = button + '-content',
	buttonLeading = button + '-leading',
}

function createSideBarRef<T extends SideBarElement<HTMLElement>>(
	options?: SideBarUpdateOptions<T> & {SideBarTagName?: string}
): T {
	const sideBarRef = document.createElement(options?.SideBarTagName ?? 'div') as T
	return updateSideBarRef<T>(sideBarRef, options)
}

function updateSideBarRef<T extends SideBarElement<HTMLElement>>(
	sideBarRef: T,
	options?: SideBarUpdateOptions<T>
): T {
	const refs = options?.SideBarRefs
	sideBarRef.classList.add(SideBarClasses.sideBar)

	const minimizedOption = options?.SideBarMinimized
	if (minimizedOption !== undefined) {
		sideBarRef.toggleAttribute(SideBarAttributes.minimized, minimizedOption)
	}

	// header
	const headerOption = options?.SideBarHeader
	let headerRef = sideBarRef.querySelector<HTMLDivElement>(`.${SideBarClasses.header}`)
	if (headerOption === false) {
		headerRef?.replaceChildren()
	}
	else if (headerOption !== undefined && headerOption !== true) {
		if (!headerRef) {
			headerRef = document.createElement('div')
			headerRef.classList.add(SideBarClasses.header)
		}

		headerRef.replaceChildren(...headerOption)
	}

	// content
	let contentRef = sideBarRef.querySelector<HTMLDivElement>(`.${SideBarClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(SideBarClasses.content)
	}

	const childrenOption = options?.SideBarChildren
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	// footer
	const footerOption = options?.SideBarFooter
	let footerRef = sideBarRef.querySelector<HTMLDivElement>(`.${SideBarClasses.footer}`)
	if (footerOption === false) {
		footerRef?.replaceChildren()
	}
	else if (footerOption !== undefined && footerOption !== true) {
		if (!footerRef) {
			footerRef = document.createElement('div')
			footerRef.classList.add(SideBarClasses.footer)
		}

		footerRef.replaceChildren(...footerOption)
	}

	sideBarRef.replaceChildren(...[headerRef, contentRef, footerRef].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.content?.(contentRef)
	refs?.sideBar?.(sideBarRef)
	if (headerRef) refs?.header?.(headerRef)
	if (footerRef) refs?.footer?.(footerRef)
	return sideBarRef
}

function createSideBarButtonRef(options?: SideBarButtonUpdateOptions): SideBarButtonElement {
	const sideBarButtonRef = createButtonRef(options)
	return updateSideBarButtonRef(sideBarButtonRef, options)
}

function updateSideBarButtonRef(
	sideBarButtonRef: SideBarButtonElement,
	options?: SideBarButtonUpdateOptions
): SideBarButtonElement {
	const refs = options?.SideBarButtonRefs
	updateButtonRef(sideBarButtonRef, options)
	sideBarButtonRef.classList.add(SideBarClasses.button)

	const selectedOption = options?.SideBarButtonSelected
	if (selectedOption !== undefined) {
		sideBarButtonRef.toggleAttribute(SideBarButtonAttributes.selected, selectedOption)
	}

	// leading
	const leadingOption = options?.SideBarButtonLeading
	let leadingRef = sideBarButtonRef.querySelector<HTMLDivElement>(`.${SideBarClasses.buttonLeading}`)
	if (leadingOption === false) {
		leadingRef?.replaceChildren()
	}
	else if (leadingOption !== undefined && leadingOption !== true) {
		if (!leadingRef) {
			leadingRef = document.createElement('div')
			leadingRef.classList.add(SideBarClasses.buttonLeading)
		}

		leadingRef.replaceChildren(...leadingOption)
	}

	// content
	let contentRef = sideBarButtonRef.querySelector<HTMLDivElement>(`.${SideBarClasses.buttonContent}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(SideBarClasses.content)
	}

	const childrenOption = options?.ButtonChildren
	if (childrenOption === false) {
		contentRef.replaceChildren()
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		contentRef.replaceChildren(...childrenOption)
	}

	sideBarButtonRef.replaceChildren(...[leadingRef, contentRef].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.button?.(sideBarButtonRef)
	refs?.content?.(contentRef)
	refs?.button?.(sideBarButtonRef)
	if (leadingRef) refs?.leading?.(leadingRef)
	return sideBarButtonRef
}

export {
	type SideBarProps,
	type SideBarButtonProps,
	type SideBarUpdateOptions,
	type SideBarButtonUpdateOptions,
	type SideBarElement,
	type SideBarButtonElement,
	SideBarClasses,
	SideBarAttributes,
	SideBarButtonAttributes,
	createSideBarRef,
	createSideBarButtonRef,
	updateSideBarRef,
	updateSideBarButtonRef
}