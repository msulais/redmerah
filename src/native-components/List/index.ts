type ListProps = astroHTML.JSX.HTMLAttributes & {
	ListTagName     ?: string
	ListVariant     ?: ListVariant
	ListContentAttr ?: astroHTML.JSX.HTMLAttributes
	ListLeadingAttr ?: astroHTML.JSX.HTMLAttributes
	ListTrailingAttr?: astroHTML.JSX.HTMLAttributes
	ListSubtitleAttr?: astroHTML.JSX.HTMLAttributes
}

type ListElement<T extends HTMLElement> = T

type ListUpdateOptions<T extends ListElement<HTMLElement>> = {
	ListLeading    ?: (Node | string)[] | boolean
	ListChildren   ?: (Node | string)[] | boolean
	ListSubtitle   ?: (Node | string)[] | boolean
	ListTrailing   ?: (Node | string)[] | boolean
	ListVariant    ?: ListVariant | boolean
	ListRefs       ?: {
		list    ?(ref: T             ): unknown
		content ?(ref: HTMLDivElement): unknown
		subtitle?(ref: HTMLDivElement): unknown
		leading ?(ref: HTMLDivElement): unknown
		trailing?(ref: HTMLDivElement): unknown
	}
}

enum ListClasses {
	list     = 'c-list',
	leading  = list + '-leading',
	trailing = list + '-trailing',
	content  = list + '-content',
	subtitle = list + '-subtitle'
}

enum ListVariant {
	transparent = 'transparent',
	tonal       = 'tonal',
	filled      = 'filled',
	outlined    = 'outlined'
}

enum ListAttributes {
	variant = 'data-c-list-variant'
}

function createListRef<T extends ListElement<HTMLElement>>(
	options?: ListUpdateOptions<T> & {ListTagName?: keyof HTMLElementTagNameMap}
): T {
	const listRef = document.createElement(options?.ListTagName ?? 'div')
	updateListRef(listRef, options)
	return listRef as T
}

function updateListRef<T extends ListElement<HTMLElement>>(listRef: T, options?: ListUpdateOptions<T>): T {
	const refs = options?.ListRefs
	listRef.classList.add(ListClasses.list)

	const variantOption = options?.ListVariant
	if (variantOption === false) {
		listRef.removeAttribute(ListAttributes.variant)
	}
	else if (variantOption !== undefined && variantOption !== true) {
		listRef.setAttribute(ListAttributes.variant, variantOption)
	}

	// leading
	const leadingOption = options?.ListLeading
	let leadingRef = listRef.querySelector<HTMLDivElement>(`.${ListClasses.leading}`)
	if (leadingOption === false) {
		leadingRef?.replaceChildren()
	}
	else if (leadingOption !== undefined && leadingOption !== true) {
		if (!leadingRef) {
			leadingRef = document.createElement('div')
			leadingRef.classList.add(ListClasses.leading)
		}

		leadingRef.replaceChildren(...leadingOption)
	}

	// content
	let contentRef = listRef.querySelector<HTMLDivElement>(`.${ListClasses.content}`)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(ListClasses.content)
	}

	// content -> subtitle
	const subtitleOption = options?.ListSubtitle
	let subtitleRef = contentRef.querySelector<HTMLDivElement>(`.${ListClasses.subtitle}`)
	if (subtitleOption === false) {
		subtitleRef?.replaceChildren()
	}
	else if (subtitleOption !== undefined && subtitleOption !== true) {
		if (!subtitleRef) {
			subtitleRef = document.createElement('div')
			subtitleRef.classList.add(ListClasses.subtitle)
		}

		subtitleRef.replaceChildren(...subtitleOption)
	}

	// content -> children
	const childrenRefs: (Node | string)[] = []
	for (const node of contentRef.childNodes) {
		if (subtitleRef && node === subtitleRef) continue

		childrenRefs.push(node)
	}

	const childrenOption = options?.ListChildren
	if (childrenOption === false) {
		childrenRefs.length = 0
	}
	else if (childrenOption !== undefined && childrenOption !== true) {
		childrenRefs.length = 0
		childrenRefs.push(...childrenOption)
	}

	contentRef.replaceChildren(...[...childrenRefs, subtitleRef].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	// trailing
	const trailingOption = options?.ListTrailing
	let trailingRef = listRef.querySelector<HTMLDivElement>(`.${ListClasses.trailing}`)
	if (trailingOption === false) {
		trailingRef?.replaceChildren()
	}
	else if (trailingOption && trailingOption !== true) {
		if (!trailingRef) {
			trailingRef = document.createElement('div')
			trailingRef.classList.add(ListClasses.trailing)
		}

		trailingRef.replaceChildren(...trailingOption)
	}

	listRef.replaceChildren(...[leadingRef, contentRef, trailingRef].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.list?.(listRef)
	refs?.content?.(contentRef)
	if (leadingRef) refs?.leading?.(leadingRef)
	if (subtitleRef) refs?.subtitle?.(subtitleRef)
	if (trailingRef) refs?.trailing?.(trailingRef)
	return listRef
}

export {
	type ListProps,
	type ListUpdateOptions,
	type ListElement,
	ListClasses,
	ListVariant,
	ListAttributes,
	createListRef,
	updateListRef
}