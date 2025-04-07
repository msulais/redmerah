type ListProps = astroHTML.JSX.HTMLAttributes & {
	'c:tagName'        ?: string
	'c:attrContent'    ?: astroHTML.JSX.HTMLAttributes
	'c:attrLeading'    ?: astroHTML.JSX.HTMLAttributes
	'c:attrTrailing'   ?: astroHTML.JSX.HTMLAttributes
	'c:attrDescription'?: astroHTML.JSX.HTMLAttributes
}

type ListUpdateOptions = {
	leading    ?: (Node | string)[] | boolean
	children   ?: (Node | string)[] | boolean
	description?: (Node | string)[] | boolean
	trailing   ?: (Node | string)[] | boolean
	refs       ?: {
		list       ?(el: HTMLElement   ): unknown
		content    ?(el: HTMLDivElement): unknown
		description?(el: HTMLDivElement): unknown
		leading    ?(el: HTMLDivElement): unknown
		trailing   ?(el: HTMLDivElement): unknown
	}
}

enum ListClasses {
	list        = 'c-list',
	leading     = 'c-list-leading',
	trailing    = 'c-list-trailing',
	content     = 'c-list-content',
	description = 'c-list-description'
}

function createList<T extends HTMLElement>(
	options?: ListUpdateOptions & {tagName?: keyof HTMLElementTagNameMap}
): T {
	const list = document.createElement(options?.tagName ?? 'div')
	updateList(list, options)
	return list as T
}

function updateList<T extends HTMLElement>(list: T, options?: ListUpdateOptions): T {
	const refs = options?.refs
	list.classList.add(ListClasses.list)

	// leading
	let leading = list.querySelector(`.${ListClasses.leading}`) as HTMLDivElement | null
	if (options?.leading === false) {
		leading?.replaceChildren()
	}
	else if (options?.leading && options.leading !== true) {
		if (!leading) {
			leading = document.createElement('div')
			leading.classList.add(ListClasses.leading)
		}

		leading.replaceChildren(...options.leading)
	}

	// content
	let content = list.querySelector(`.${ListClasses.content}`) as HTMLDivElement | null
	if (!content) {
		content = document.createElement('div')
		content.classList.add(ListClasses.content)
	}

	// content -> description
	let description = list.querySelector(`.${ListClasses.description}`) as HTMLDivElement | null
	if (options?.description === false) {
		description?.replaceChildren()
	}
	else if (options?.description && options.description !== true) {
		if (!description) {
			description = document.createElement('div')
			description.classList.add(ListClasses.description)
		}

		description.replaceChildren(...options.description)
	}

	// content -> children
	const children: (Node | string)[] = []
	for (const node of content.childNodes) {
		if (description && node === description) continue

		children.push(node)
	}

	if (options?.children === false) {
		children.length = 0
	}
	else if (options?.children && options.children !== true) {
		children.length = 0
		children.push(...options.children)
	}

	content.replaceChildren(...[...children, description].filter(
		v => typeof v === 'string' || v instanceof Node
	))

	// trailing
	let trailing = list.querySelector(`.${ListClasses.trailing}`) as HTMLDivElement | null
	if (options?.trailing === false) {
		trailing?.replaceChildren()
	}
	else if (options?.trailing && options.trailing !== true) {
		if (!trailing) {
			trailing = document.createElement('div')
			trailing.classList.add(ListClasses.trailing)
		}

		trailing.replaceChildren(...options.trailing)
	}

	list.replaceChildren(...[leading, content, trailing].filter(
		v => typeof v === 'string' || v instanceof Node
	))
	refs?.list?.(list)
	refs?.content?.(content)
	if (leading) refs?.leading?.(leading)
	if (description) refs?.description?.(description)
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