import {
	type ButtonUpdateOptions,
	type ButtonProps,
	createButton,
	updateButton,
} from "@/native-components/Button"

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

type SideBarUpdateOptions = {
	SideBarChildren?: (Node | string)[] | boolean
	SideBarHeader  ?: (Node | string)[] | boolean
	SideBarFooter  ?: (Node | string)[] | boolean
	SideBarRefs    ?: {
		sideBar?(el: HTMLElement   ): unknown
		content?(el: HTMLDivElement): unknown
		header ?(el: HTMLDivElement): unknown
		footer ?(el: HTMLDivElement): unknown
	}
}

type SideBarButtonUpdateOptions = ButtonUpdateOptions & {
	SideBarButtonSelected?: boolean
	SideBarButtonLeading ?: (string | Node)[] | boolean
	SideBarButtonRefs    ?: {
		button ?(el: HTMLButtonElement): unknown
		content?(el: HTMLDivElement): unknown
		leading?(el: HTMLDivElement): unknown
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

function createSideBar<T extends HTMLElement>(
	options?: SideBarUpdateOptions & {tagName?: string}
): T {
	const sideBar = document.createElement(options?.tagName ?? 'div')
	updateSideBar(sideBar, options)
	return sideBar as T
}

function updateSideBar<T extends HTMLElement>(
	sideBar: T,
	options?: SideBarUpdateOptions
): T {
	const refs = options?.SideBarRefs
	sideBar.classList.add(SideBarClasses.sideBar)

	// header
	let header = sideBar.querySelector(`.${SideBarClasses.header}`) as HTMLDivElement | null
	if (options?.SideBarHeader === false) {
		header?.replaceChildren()
	}
	else if (options?.SideBarHeader && options.SideBarHeader !== true) {
		if (!header) {
			header = document.createElement('div')
			header.classList.add(SideBarClasses.header)
		}

		header.replaceChildren(...options.SideBarHeader)
	}

	// content
	let content = sideBar.querySelector(`.${SideBarClasses.content}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(SideBarClasses.content)
	}

	if (options?.SideBarChildren === false) {
		content.replaceChildren()
	}
	else if (options?.SideBarChildren && options.SideBarChildren !== true) {
		content.replaceChildren(...options.SideBarChildren)
	}

	// footer
	let footer = sideBar.querySelector(`.${SideBarClasses.footer}`) as HTMLDivElement | null
	if (options?.SideBarFooter === false) {
		footer?.replaceChildren()
	}
	else if (options?.SideBarFooter && options.SideBarFooter !== true) {
		if (!footer) {
			footer = document.createElement('div')
			footer.classList.add(SideBarClasses.footer)
		}

		footer.replaceChildren(...options.SideBarFooter)
	}

	sideBar.replaceChildren(...[header, content, footer].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.content?.(content)
	refs?.sideBar?.(sideBar)
	if (header) refs?.header?.(header)
	if (footer) refs?.footer?.(footer)
	return sideBar
}

function createSideBarButton(options?: SideBarButtonUpdateOptions): HTMLButtonElement {
	const button = createButton(options)
	return updateSideBarButton(button, options)
}

function updateSideBarButton(
	button: HTMLButtonElement,
	options?: SideBarButtonUpdateOptions
): HTMLButtonElement {
	const refs = options?.SideBarButtonRefs
	updateButton(button, options)
	button.classList.add(SideBarClasses.button)

	if (options?.SideBarButtonSelected !== undefined) {
		button.toggleAttribute(SideBarButtonAttributes.selected, options.SideBarButtonSelected)
	}

	// leading
	let leading = button.querySelector(`.${SideBarClasses.buttonLeading}`) as HTMLDivElement | null
	if (options?.SideBarButtonLeading === false) {
		leading?.replaceChildren()
	}
	else if (options?.SideBarButtonLeading && options.SideBarButtonLeading !== true) {
		if (!leading) {
			leading = document.createElement('div')
			leading.classList.add(SideBarClasses.buttonLeading)
		}

		leading.replaceChildren(...options.SideBarButtonLeading)
	}

	// content
	let content = button.querySelector(`.${SideBarClasses.buttonContent}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(SideBarClasses.content)
	}

	if (options?.ButtonChildren === false) {
		content.replaceChildren()
	}
	else if (options?.ButtonChildren && options.ButtonChildren !== true) {
		content.replaceChildren(...options.ButtonChildren)
	}

	button.replaceChildren(...[leading, content].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.button?.(button)
	refs?.content?.(content)
	refs?.button?.(button)
	if (leading) refs?.leading?.(leading)
	return button
}

export {
	type SideBarProps,
	type SideBarButtonProps,
	type SideBarUpdateOptions,
	type SideBarButtonUpdateOptions,
	SideBarClasses,
	SideBarAttributes,
	SideBarButtonAttributes,
	createSideBar,
	createSideBarButton,
	updateSideBar,
	updateSideBarButton
}