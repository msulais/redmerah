import {
	type ButtonUpdateOptions,
	type ButtonProps,
	createButton,
} from "@/native-components/Button"

type SideNavigationProps = astroHTML.JSX.HTMLAttributes & {
	'c:tagName'    ?: string
	'c:minimized'  ?: boolean
	'c:attrContent'?: astroHTML.JSX.HTMLAttributes
	'c:attrHeader' ?: astroHTML.JSX.HTMLAttributes
	'c:attrFooter' ?: astroHTML.JSX.HTMLAttributes
}

type SideNavigationButtonProps = ButtonProps & {
	'c:selected'   ?: boolean
	'c:attrContent'?: astroHTML.JSX.HTMLAttributes
	'c:attrLeading'?: astroHTML.JSX.HTMLAttributes
}

type SideNavigationUpdateOptions = {
	children?: (Node | string)[] | boolean
	header  ?: (Node | string)[] | boolean
	footer  ?: (Node | string)[] | boolean
	refs    ?: {
		sideNavigation?(el: HTMLElement   ): unknown
		content       ?(el: HTMLDivElement): unknown
		header        ?(el: HTMLDivElement): unknown
		footer        ?(el: HTMLDivElement): unknown
	}
}

type SideNavigationButtonUpdateOptions = Omit<ButtonUpdateOptions, 'refs'> & {
	selected?: boolean
	leading ?: (string | Node)[] | boolean
	refs    ?: ButtonUpdateOptions['refs'] & {
		content?(el: HTMLDivElement): unknown
		leading?(el: HTMLDivElement): unknown
	}
}

enum SideNavigationAttributes {
	minimized = 'data-c-minimized'
}

enum SideNavigationButtonAttributes {
	selected = 'data-c-selected'
}

enum SideNavigationClasses {
	sideNavigation = 'c-side-navigation',
	content        = 'c-side-navigation-content',
	header         = 'c-side-navigation-header',
	footer         = 'c-side-navigation-footer',
	button         = 'c-side-navigation-btn',
	buttonContent  = 'c-side-navigation-btn-content',
	buttonLeading  = 'c-side-navigation-btn-leading',
}

function createSideNavigation<T extends HTMLElement>(
	options?: SideNavigationUpdateOptions & {tagName?: string}
): T {
	const sideNavigation = document.createElement(options?.tagName ?? 'div')
	updateSideNavigation(sideNavigation, options)
	return sideNavigation as T
}

function updateSideNavigation<T extends HTMLElement>(
	sideNavigation: T,
	options?: SideNavigationUpdateOptions
): T {
	const refs = options?.refs
	sideNavigation.classList.add(SideNavigationClasses.sideNavigation)

	// header
	let header = sideNavigation.querySelector(`.${SideNavigationClasses.header}`) as HTMLDivElement | null
	if (options?.header === false) {
		header?.replaceChildren()
	}
	else if (options?.header && options.header !== true) {
		if (!header) {
			header = document.createElement('div')
			header.classList.add(SideNavigationClasses.header)
		}

		header.replaceChildren(...options.header)
	}

	// content
	let content = sideNavigation.querySelector(`.${SideNavigationClasses.content}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(SideNavigationClasses.content)
	}

	if (options?.children === false) {
		content.replaceChildren()
	}
	else if (options?.children && options.children !== true) {
		content.replaceChildren(...options.children)
	}

	// footer
	let footer = sideNavigation.querySelector(`.${SideNavigationClasses.footer}`) as HTMLDivElement | null
	if (options?.footer === false) {
		footer?.replaceChildren()
	}
	else if (options?.footer && options.footer !== true) {
		if (!footer) {
			footer = document.createElement('div')
			footer.classList.add(SideNavigationClasses.footer)
		}

		footer.replaceChildren(...options.footer)
	}

	sideNavigation.replaceChildren(...[header, content, footer].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.content?.(content)
	refs?.sideNavigation?.(sideNavigation)
	if (header) refs?.header?.(header)
	if (footer) refs?.footer?.(footer)
	return sideNavigation
}

function createSideNavigationButton(options?: SideNavigationButtonUpdateOptions): HTMLButtonElement {
	const btn = createButton(options)
	return updateSideNavigationButton(btn, options)
}

function updateSideNavigationButton(
	btn: HTMLButtonElement,
	options?: SideNavigationButtonUpdateOptions
): HTMLButtonElement {
	const refs = options?.refs
	btn.classList.add(SideNavigationClasses.button)

	if (options?.selected !== undefined) {
		btn.toggleAttribute(SideNavigationButtonAttributes.selected, options.selected)
	}

	// leading
	let leading = btn.querySelector(`.${SideNavigationClasses.buttonLeading}`) as HTMLDivElement | null
	if (options?.leading === false) {
		leading?.replaceChildren()
	}
	else if (options?.leading && options.leading !== true) {
		if (!leading) {
			leading = document.createElement('div')
			leading.classList.add(SideNavigationClasses.buttonLeading)
		}

		leading.replaceChildren(...options.leading)
	}

	// content
	let content = btn.querySelector(`.${SideNavigationClasses.buttonContent}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(SideNavigationClasses.content)
	}

	if (options?.children === false) {
		content.replaceChildren()
	}
	else if (options?.children && options.children !== true) {
		content.replaceChildren(...options.children)
	}

	btn.replaceChildren(...[leading, content].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.content?.(content)
	refs?.button?.(btn)
	if (leading) refs?.leading?.(leading)
	return btn
}

export {
	type SideNavigationProps,
	type SideNavigationButtonProps,
	type SideNavigationUpdateOptions,
	type SideNavigationButtonUpdateOptions,
	SideNavigationClasses,
	SideNavigationAttributes,
	SideNavigationButtonAttributes,
	createSideNavigation,
	createSideNavigationButton,
	updateSideNavigation,
	updateSideNavigationButton
}