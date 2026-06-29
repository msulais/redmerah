import { isNumberDefined } from "./number"

export function isElementOverflowX(element: Element): boolean {
	return element.clientWidth < element.scrollWidth
}

export function isElementOverflowY(element: Element): boolean {
	return element.clientHeight < element.scrollHeight
}

export function isElementOverflow(element: Element): boolean {
	return isElementOverflowX(element) || isElementOverflowY(element)
}

export function focusAnyElement(
	parent: Element,
	condition?: (el: Element) => boolean
): void {
	const selector = ':is(' +  [
		'[contenteditable]',
		'[tabindex]',
		'a[href]',
		'area[href]',
		'button:not(:disabled)',
		'select:not(:disabled)',
		'input:not(:disabled)',
		'textarea:not(:disabled)',
		'iframe:not(:disabled)',
	].join(',') + ')'
	const elements = parent.querySelectorAll<Element>(selector)
	for (const el of elements) {
		if (condition && !condition(el)) continue;

		try {
			(el as HTMLElement).focus()
		} catch {}

		if (document.activeElement === el) break
	}
}

export function isElementFocusable(element: Element): boolean {
	const visible = element.checkVisibility({
		contentVisibilityAuto: true,
		visibilityProperty: true,
	})
	const connected = element.isConnected
	if (!visible || !connected) return false

	const disabled = element.matches('[disabled]')
	if (disabled) return false

	const tagname = element.tagName
	if (
		tagname === 'BUTTON'
		|| tagname === 'SELECT'
		|| tagname === 'INPUT'
		|| tagname === 'TEXTAREA'
		|| tagname === 'IFRAME'
	) return true

	if ((
			tagname === 'A'
			|| tagname === 'AREA'
		)
		&& element.matches('[href]')
	) return true

	try {
		if ((element as HTMLElement).isContentEditable) return true
	} catch {}

	if (element.matches('[tabindex]')) {
		const tabindex = element.getAttribute('tabindex')
		if (tabindex && isNumberDefined(Number.parseInt(tabindex))) {
			return true
		}
	}

	return false
}

/**
 * Validation helper for event delegation.
 * @param parent
 * @param target if emtpy, `document.activeElement` will be used.
 * @param condition
 * @returns
 */
export function isTargetValidElement(
	parent: Element,
	target?: Element | null,
	condition?: (el: Element) => boolean
): boolean {
	if (!target) target = document.activeElement
	return Boolean(
		target
		&& parent.contains(target)
		&& (condition?.(target) ?? true)
	)
}

export function updateElementList<T extends Element, U>(
	parent: Element,
	data: U[],
	create: (data: U, index: number) => T,
	update?: (child: T, data: U, index: number) => unknown
): Element {
	const refs = [...parent.children] as unknown as T[]
	const dataLength = data.length
	const refsLength = refs.length
	for (let i = 0; i < refsLength; i++) {
		const ref = refs[i]
		if (!ref) {
			continue
		}

		if (i > dataLength-1) {
			ref.remove()
			continue
		}

		update?.(ref, data[i], i)
	}

	for (let i = 0; i < dataLength - refsLength; i++) {
		const index = refsLength + i
		const ref = create(data[index], index)
		update?.(ref, data[index], index)
		parent.append(ref)
	}

	return parent
}

export function showInputMessage(ref: HTMLInputElement | HTMLTextAreaElement, msg: string) {
	ref.setCustomValidity(msg)
	ref.reportValidity()
}

/**
 * Creates an HTML element with attributes, an optional ref callback, and optional children.
 *
 * @param tagname - The HTML tag name (e.g., 'div', 'input').
 * @param attributes - A map of attributes. If a value is null, the attribute is omitted.
 * @param ref - An optional callback function that receives the created DOM element.
 * @param children - An optional array of DOM Nodes or strings.
 * @returns The constructed HTMLElement.
 */
export function createElement<T extends Element = HTMLElement>(
  	tagname: string,
	attributes: Record<string, string | null> = {},
	ref: ((el: T) => unknown) | null = null,
	children: (Node | string)[] | undefined = undefined
): T {
	const element = document.createElement(tagname) as unknown as T
	for (const [key, value] of Object.entries(attributes)) {
		if (value !== null) {
			element.setAttribute(key, value)
		}
	}

	element.append(...(children ?? []))
	ref?.(element)
	return element
}