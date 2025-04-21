type ListProps = astroHTML.JSX.HTMLAttributes & {
	ListTagName     ?: string
	ListContentAttr ?: astroHTML.JSX.HTMLAttributes
	ListLeadingAttr ?: astroHTML.JSX.HTMLAttributes
	ListTrailingAttr?: astroHTML.JSX.HTMLAttributes
	ListSubtitleAttr?: astroHTML.JSX.HTMLAttributes
}

type ListUpdateOptions = {
	ListLeading    ?: (Node | string)[] | boolean
	ListChildren   ?: (Node | string)[] | boolean
	ListSubtitle   ?: (Node | string)[] | boolean
	ListTrailing   ?: (Node | string)[] | boolean
	ListRefs       ?: {
		list    ?(el: HTMLElement   ): unknown
		content ?(el: HTMLDivElement): unknown
		subtitle?(el: HTMLDivElement): unknown
		leading ?(el: HTMLDivElement): unknown
		trailing?(el: HTMLDivElement): unknown
	}
}

enum ListClasses {
	list     = 'c-list',
	leading  = list + '-leading',
	trailing = list + '-trailing',
	content  = list + '-content',
	subtitle = list + '-subtitle'
}

function createList<T extends HTMLElement>(
	options?: ListUpdateOptions & {tagName?: keyof HTMLElementTagNameMap}
): T {
	const list = document.createElement(options?.tagName ?? 'div')
	updateList(list, options)
	return list as T
}

function updateList<T extends HTMLElement>(list: T, options?: ListUpdateOptions): T {
	const refs = options?.ListRefs
	list.classList.add(ListClasses.list)

	// leading
	let leading = list.querySelector(`.${ListClasses.leading}`) as HTMLDivElement | null
	if (options?.ListLeading === false) {
		leading?.replaceChildren()
	}
	else if (options?.ListLeading && options.ListLeading !== true) {
		if (!leading) {
			leading = document.createElement('div')
			leading.classList.add(ListClasses.leading)
		}

		leading.replaceChildren(...options.ListLeading)
	}

	// content
	let content = list.querySelector(`.${ListClasses.content}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(ListClasses.content)
	}

	// content -> subtitle
	let subtitle = list.querySelector(`.${ListClasses.subtitle}`) as HTMLDivElement | null
	if (options?.ListSubtitle === false) {
		subtitle?.replaceChildren()
	}
	else if (options?.ListSubtitle && options.ListSubtitle !== true) {
		if (!subtitle) {
			subtitle = document.createElement('div')
			subtitle.classList.add(ListClasses.subtitle)
		}

		subtitle.replaceChildren(...options.ListSubtitle)
	}

	// content -> children
	const children: (Node | string)[] = []
	for (const node of content.childNodes) {
		if (subtitle && node === subtitle) continue

		children.push(node)
	}

	if (options?.ListChildren === false) {
		children.length = 0
	}
	else if (options?.ListChildren && options.ListChildren !== true) {
		children.length = 0
		children.push(...options.ListChildren)
	}

	content.replaceChildren(...[...children, subtitle].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	// trailing
	let trailing = list.querySelector(`.${ListClasses.trailing}`) as HTMLDivElement | null
	if (options?.ListTrailing === false) {
		trailing?.replaceChildren()
	}
	else if (options?.ListTrailing && options.ListTrailing !== true) {
		if (!trailing) {
			trailing = document.createElement('div')
			trailing.classList.add(ListClasses.trailing)
		}

		trailing.replaceChildren(...options.ListTrailing)
	}

	list.replaceChildren(...[leading, content, trailing].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.list?.(list)
	refs?.content?.(content)
	if (leading) refs?.leading?.(leading)
	if (subtitle) refs?.subtitle?.(subtitle)
	if (trailing) refs?.trailing?.(trailing)
	return list
}

export {
	type ListProps,
	type ListUpdateOptions,
	ListClasses,
	createList,
	updateList
}