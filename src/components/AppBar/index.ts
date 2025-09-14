type AppBarProps = astroHTML.JSX.HTMLAttributes & {
	AppBarTagName     ?: string
	AppBarContentAttr ?: astroHTML.JSX.HTMLAttributes
	AppBarLeadingAttr ?: astroHTML.JSX.HTMLAttributes
	AppBarTrailingAttr?: astroHTML.JSX.HTMLAttributes
	AppBarHeadingAttr ?: astroHTML.JSX.HTMLAttributes
}

type AppBarElement<T extends HTMLElement> = T

type AppBarUpdateOptions<T extends AppBarElement<HTMLElement>> = {
	AppBarChildren?: (Node | string)[] | boolean
	AppBarLeading ?: (Node | string)[] | boolean
	AppBarHeadline?: (Node | string)[] | boolean
	AppBarTrailing?: (Node | string)[] | boolean
	AppBarRefs?: {
		appBar  ?(ref: T                 ): unknown
		leading ?(ref: HTMLDivElement    ): unknown
		trailing?(ref: HTMLDivElement    ): unknown
		content ?(ref: HTMLDivElement    ): unknown
		headline?(ref: HTMLHeadingElement): unknown
	}
}

enum AppBarClasses {
	appbar   = 'c-appbar',
	leading  = appbar + '-leading',
	trailing = appbar + '-trailing',
	content  = appbar + '-content',
	headline = appbar + '-headline'
}

function createAppBarRef<T extends AppBarElement<HTMLElement>>(
	options?: AppBarUpdateOptions<T> & {AppBarTagName?: keyof HTMLElementTagNameMap}
): T {
	const appBarRef = document.createElement(options?.AppBarTagName ?? 'header')
	return updateAppBarRef(appBarRef, options) as T
}

function updateAppBarRef<T extends AppBarElement<HTMLElement>>(
	appBarRef: T,
	options?: AppBarUpdateOptions<T>
): T {
	const refs = options?.AppBarRefs
	appBarRef.classList.add(AppBarClasses.appbar)

	// leading
	const leadingOption = options?.AppBarLeading
	let leadingRef = appBarRef.querySelector(`.${AppBarClasses.leading}`) as HTMLDivElement | null
	if (leadingOption === false) {
		leadingRef?.replaceChildren()
	}
	else if (leadingOption !== undefined && leadingOption !== true) {
		if (!leadingRef) {
			leadingRef = document.createElement('div')
			leadingRef.classList.add(AppBarClasses.leading)
		}

		leadingRef.replaceChildren(...leadingOption)
	}

	// content
	let contentRef = appBarRef.querySelector(`.${AppBarClasses.content}`) as HTMLDivElement | null
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(AppBarClasses.content)
	}

	// content -> headline
	const headlineOption = options?.AppBarHeadline
	let headlineRef = contentRef.querySelector(`.${AppBarClasses.headline}`) as HTMLHeadingElement | null
	if (headlineOption === false) {
		headlineRef?.replaceChildren()
	}
	else if (headlineOption !== undefined && headlineOption !== true) {
		if (!headlineRef) {
			headlineRef = document.createElement('h2')
			headlineRef.classList.add(AppBarClasses.headline)
		}

		headlineRef.replaceChildren(...headlineOption)
	}

	// content -> children
	const children: (Node | string)[] = []
	for (const node of contentRef.childNodes) {
		if (headlineRef && node === headlineRef) continue

		children.push(node)
	}

	const childrenOption = options?.AppBarChildren
	if (childrenOption === false) {
		children.length = 0
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		children.length = 0
		children.push(...childrenOption)
	}

	contentRef.replaceChildren(...[headlineRef, ...children].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	// trailing
	const trailingOption = options?.AppBarTrailing
	let trailingRef = appBarRef.querySelector(`.${AppBarClasses.trailing}`) as HTMLDivElement | null
	if (trailingOption === false) {
		trailingRef?.replaceChildren()
	}
	else if (trailingOption !== undefined && trailingOption !== true) {
		if (!trailingRef) {
			trailingRef = document.createElement('div')
			trailingRef.classList.add(AppBarClasses.trailing)
		}

		trailingRef.replaceChildren(...trailingOption)
	}

	appBarRef.replaceChildren(...[leadingRef, contentRef, trailingRef].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.appBar?.(appBarRef)
	refs?.content?.(contentRef)
	if (leadingRef) refs?.leading?.(leadingRef)
	if (headlineRef) refs?.headline?.(headlineRef)
	if (trailingRef) refs?.trailing?.(trailingRef)
	return appBarRef
}

export {
	type AppBarProps,
	type AppBarUpdateOptions,
	type AppBarElement,
	AppBarClasses,
	createAppBarRef,
	updateAppBarRef
}