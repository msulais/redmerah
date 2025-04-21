type AppBarProps = astroHTML.JSX.HTMLAttributes & {
	AppTagName     ?: string
	AppContentAttr ?: astroHTML.JSX.HTMLAttributes
	AppLeadingAttr ?: astroHTML.JSX.HTMLAttributes
	AppTrailingAttr?: astroHTML.JSX.HTMLAttributes
	AppHeadingAttr ?: astroHTML.JSX.HTMLAttributes
}

type AppBarUpdateOptions = {
	AppBarChildren?: (Node | string)[] | boolean
	AppBarLeading ?: (Node | string)[] | boolean
	AppBarHeadline?: (Node | string)[] | boolean
	AppBarTrailing?: (Node | string)[] | boolean
	AppBarRefs?: {
		appBar  ?(el: HTMLElement       ): unknown
		leading ?(el: HTMLDivElement    ): unknown
		trailing?(el: HTMLDivElement    ): unknown
		content ?(el: HTMLDivElement    ): unknown
		headline?(el: HTMLHeadingElement): unknown
	}
}

enum AppBarClasses {
	appbar   = 'c-appbar',
	leading  = appbar + '-leading',
	trailing = appbar + '-trailing',
	content  = appbar + '-content',
	headline = appbar + '-headline'
}

function createAppBar<T extends HTMLElement>(
	options?: AppBarUpdateOptions & {AppBarTagName?: keyof HTMLElementTagNameMap}
): T {
	const appbar = document.createElement(options?.AppBarTagName ?? 'header')
	return updateAppBar(appbar, options) as T
}

function updateAppBar<T extends HTMLElement>(appBar: T, options?: AppBarUpdateOptions): T {
	const refs = options?.AppBarRefs
	appBar.classList.add(AppBarClasses.appbar)

	// leading
	let leading = appBar.querySelector(`.${AppBarClasses.leading}`) as HTMLDivElement | null
	if (options?.AppBarLeading === false) {
		leading?.replaceChildren()
	}
	else if (options?.AppBarLeading !== undefined && options.AppBarLeading !== true) {
		if (!leading) {
			leading = document.createElement('div')
			leading.classList.add(AppBarClasses.leading)
		}

		leading.replaceChildren(...options.AppBarLeading)
	}

	// content
	let content = appBar.querySelector(`.${AppBarClasses.content}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(AppBarClasses.content)
	}

	// content -> headline
	let headline = appBar.querySelector(`.${AppBarClasses.headline}`) as HTMLHeadingElement | null
	if (options?.AppBarHeadline === false) {
		headline?.replaceChildren()
	}
	else if (options?.AppBarHeadline !== undefined && options.AppBarHeadline !== true) {
		if (!headline) {
			headline = document.createElement('h2')
			headline.classList.add(AppBarClasses.headline)
		}

		headline.replaceChildren(...options.AppBarHeadline)
	}

	// content -> children
	const children: (Node | string)[] = []
	for (const node of content.childNodes) {
		if (headline && node === headline) continue

		children.push(node)
	}

	if (options?.AppBarChildren === false) {
		children.length = 0
	}
	else if (options?.AppBarChildren !== undefined && options.AppBarChildren !== true) {
		children.length = 0
		children.push(...options.AppBarChildren)
	}

	content.replaceChildren(...[headline, ...children].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	// trailing
	let trailing = appBar.querySelector(`.${AppBarClasses.trailing}`) as HTMLDivElement | null
	if (options?.AppBarTrailing === false) {
		trailing?.replaceChildren()
	}
	else if (options?.AppBarTrailing !== undefined && options.AppBarTrailing !== true) {
		if (!trailing) {
			trailing = document.createElement('div')
			trailing.classList.add(AppBarClasses.trailing)
		}

		trailing.replaceChildren(...options.AppBarTrailing)
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