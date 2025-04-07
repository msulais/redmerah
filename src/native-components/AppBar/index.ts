type AppBarProps = astroHTML.JSX.HTMLAttributes & {
	'c:tagName'     ?: string
	'c:attrContent' ?: astroHTML.JSX.HTMLAttributes
	'c:attrLeading' ?: astroHTML.JSX.HTMLAttributes
	'c:attrTrailing'?: astroHTML.JSX.HTMLAttributes
	'c:attrHeading' ?: astroHTML.JSX.HTMLAttributes
}

type AppBarUpdateOptions = {
	children?: (Node | string)[] | boolean
	leading ?: (Node | string)[] | boolean
	headline?: (Node | string)[] | boolean
	trailing?: (Node | string)[] | boolean
	refs?: {
		appBar  ?(el: HTMLElement       ): unknown
		leading ?(el: HTMLDivElement    ): unknown
		trailing?(el: HTMLDivElement    ): unknown
		content ?(el: HTMLDivElement    ): unknown
		headline?(el: HTMLHeadingElement): unknown
	}
}

enum AppBarClasses {
	appbar   = 'c-appbar',
	leading  = 'c-appbar-leading',
	trailing = 'c-appbar-trailing',
	content  = 'c-appbar-content',
	headline = 'c-appbar-headline'
}

function createAppBar<T extends HTMLElement>(
	options?: AppBarUpdateOptions & {tagName?: keyof HTMLElementTagNameMap}
): T {
	const appbar = document.createElement(options?.tagName ?? 'header')
	return updateAppBar(appbar, options) as T
}

function updateAppBar<T extends HTMLElement>(appBar: T, options?: AppBarUpdateOptions): T {
	const refs = options?.refs
	appBar.classList.add(AppBarClasses.appbar)

	// leading
	let leading = appBar.querySelector(`.${AppBarClasses.leading}`) as HTMLDivElement | null
	if (options?.leading === false) {
		leading?.replaceChildren()
	}
	else if (options?.leading && options.leading !== true) {
		if (!leading) {
			leading = document.createElement('div')
			leading.classList.add(AppBarClasses.leading)
		}

		leading.replaceChildren(...options.leading)
	}

	// content
	let content = appBar.querySelector(`.${AppBarClasses.content}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(AppBarClasses.content)
	}

	// content -> headline
	let headline = appBar.querySelector(`.${AppBarClasses.headline}`) as HTMLHeadingElement | null
	if (options?.headline === false) {
		headline?.replaceChildren()
	}
	else if (options?.headline && options.headline !== true) {
		if (!headline) {
			headline = document.createElement('h2')
			headline.classList.add(AppBarClasses.headline)
		}

		headline.replaceChildren(...options.headline)
	}

	// content -> children
	const children: (Node | string)[] = []
	for (const node of content.childNodes) {
		if (headline && node === headline) continue

		children.push(node)
	}

	if (options?.children === false) {
		children.length = 0
	}
	else if (options?.children && options.children !== true) {
		children.length = 0
		children.push(...options.children)
	}

	content.replaceChildren(...[headline, ...children].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	// trailing
	let trailing = appBar.querySelector(`.${AppBarClasses.trailing}`) as HTMLDivElement | null
	if (options?.trailing === false) {
		trailing?.replaceChildren()
	}
	else if (options?.trailing && options.trailing !== true) {
		if (!trailing) {
			trailing = document.createElement('div')
			trailing.classList.add(AppBarClasses.trailing)
		}

		trailing.replaceChildren(...options.trailing)
	}

	appBar.replaceChildren(...[leading, content, trailing].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.appBar?.(appBar)
	refs?.content?.(content)
	if (leading) refs?.leading?.(leading)
	if (headline) refs?.headline?.(headline)
	if (trailing) refs?.trailing?.(trailing)
	return appBar
}

export {
	type AppBarProps,
	type AppBarUpdateOptions,
	AppBarClasses,
	createAppBar,
	updateAppBar
}