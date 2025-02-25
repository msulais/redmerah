import { KEY_ARROW_UP, KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT } from "@/constants/key-code"
import { arrayJoin, arrayLength } from "./array"
import { documentActive, documentHasFocus } from "./document"
import { attrGet, attrRemove } from "./attributes"
import { numberIsDefined, numberParse } from "./number"

export function elementScrollIntoView(
	element: HTMLElement,
	options?: ScrollIntoViewOptions
): void {
	return element.scrollIntoView(options)
}

export function elementScrollWidth(element: HTMLElement): number {
	return element.scrollWidth
}

export function elementClosest<T = HTMLElement>(
	element: HTMLElement,
	selector: string
): T | null {
	return element.closest(selector) as T | null
}

export function elementClientWidth(element: HTMLElement): number {
	return element.clientWidth
}

export function elementScrollHeight(element: HTMLElement): number {
	return element.scrollHeight
}

export function elementClientHeight(element: HTMLElement): number {
	return element.clientHeight
}

export function elementIsOverflowX(element: HTMLElement): boolean {
	return elementClientWidth(element) < elementScrollWidth(element)
}

export function elementIsOverflowY(element: HTMLElement): boolean {
	return elementClientHeight(element) < elementScrollHeight(element)
}

export function elementIsOverflow(element: HTMLElement): boolean {
	return elementIsOverflowX(element) || elementIsOverflowY(element)
}

export function elementContains(
	element: HTMLElement,
	other: Node | null
): boolean {
	return element.contains(other)
}

export function elementFirstChild<T = HTMLElement>(
	element: HTMLElement
): T | null {
	return element.firstElementChild as T | null
}

export function elementLastChild<T = HTMLElement>(
	element: HTMLElement
): T | null {
	return element.lastElementChild as T | null
}

export function elementParent<T = HTMLElement>(
	element: HTMLElement
): T | null {
	return element.parentElement as T | null
}

export function elementIsVisible(
	element: HTMLElement,
	options?: CheckVisibilityOptions
): boolean {
	return element.checkVisibility(options)
}

export function elementIsEditable(element: HTMLElement): boolean {
	return element.isContentEditable
}

export function elementIsConnected(element: HTMLElement): boolean {
	return element.isConnected
}

export function elementTabIndex(element: HTMLElement): number {
	return element.tabIndex
}

export function elementFocusAny(
	parent: HTMLElement,
	condition?: (el: HTMLElement) => boolean
): void {
	const selector = ':is(' +  arrayJoin([
		'[contenteditable]',
		'[tabindex]',
		'a[href]',
		'area[href]',
		'button:not(:disabled)',
		'select:not(:disabled)',
		'input:not(:disabled)',
		'textarea:not(:disabled)',
		'iframe:not(:disabled)',
	], ',') + ')'
	const elements = elementAllBySelector(selector, parent)
	for (const el of elements) {
		if (condition && !condition(el as HTMLElement)) continue

		elementFocus(el as HTMLElement)
		if (documentActive() === el) break
	}
}

export function elementIsFocusable(element: HTMLElement): boolean {
	const visible = elementIsVisible(element, {
		contentVisibilityAuto: true,
		visibilityProperty: true,
	})
	const connected = elementIsConnected(element)
	if (!visible || !connected) return false

	const disabled = elementMatches(element, '[disabled]')
	if (disabled) return false

	const tagname = elementTagName(element)
	if (
		tagname == 'BUTTON'
		|| tagname == 'SELECT'
		|| tagname == 'INPUT'
		|| tagname == 'TEXTAREA'
		|| tagname == 'IFRAME'
	) return true

	if ((
			tagname == 'A'
			|| tagname == 'AREA'
		)
		&& elementMatches(element, '[href]')
	) return true

	if (elementIsEditable(element)) return true
	if (elementMatches(element, '[tabindex]')) {
		const tabindex = attrGet(element, 'tabindex')
		if (tabindex && numberIsDefined(numberParse(tabindex, true))) {
			return true
		}
	}

	return false
}

export function elementCreate<K extends keyof HTMLElementTagNameMap>(
	tagname: K,
	options?: ElementCreationOptions
): HTMLElementTagNameMap[K] {
	return document.createElement(tagname, options)
}

export function elementById<T = HTMLElement>(elementId: string): T | null {
	return document.getElementById(elementId) as T | null
}

export function elementBySelector(
	selectors: string,
	from: HTMLElement | Document = document
): HTMLElement | null {
	return from.querySelector(selectors)
}

export function elementAllBySelector<E extends Element>(
	selectors: string,
	from: HTMLElement | Document = document
): NodeListOf<E> {
	return from.querySelectorAll<E>(selectors)
}

export function elementRect(element: Element): DOMRect {
	return element.getBoundingClientRect()
}

export function elementTextContentSet(element: HTMLElement, text: string): string {
	return element.textContent = text
}

export function elementPopoverSet(element: HTMLElement, popover: 'auto' | 'manual'): string {
	return element.popover = popover
}

export function elementIdSet(element: HTMLElement, id: string): string {
	return element.id = id
}

export function elementStyleSet(
		element: HTMLElement,
		property: string,
		value: string | null,
		priority?: string | undefined
	): void {
	return element.style.setProperty(property, value, priority)
}

export function elementStyleRemove(
	element: HTMLElement,
	property: string
): string {
	return element.style.removeProperty(property)
}

export function elementAppendChild(element: HTMLElement, node: Node): Node {
	return element.appendChild(node)
}

export function elementTagName(element: HTMLElement): string {
	return element.tagName
}

export function elementMatches(element: HTMLElement, selectors: string): boolean {
	return element.matches(selectors)
}

export function elementId(element: HTMLElement): string {
	return element.id
}

export function elementFocusByArrowKey<T = HTMLElement>(
	parent: HTMLElement | null,
	keyCode: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | string,
	options?: {
		up?: 'next' | 'prev'
		down?: 'next' | 'prev'
		left?: 'next' | 'prev'
		right?: 'next' | 'prev'
	},
	condition?: (sibling: T) => boolean
): HTMLElement | null {
	if (!documentHasFocus()) return null

	const element = documentActive()!
	if (!options) return null

	const up = options.up
	const down = options.down
	const left = options.left
	const right = options.right
	const validUp    = up    && (up    == 'next' || up    == 'prev') && keyCode == KEY_ARROW_UP
	const validDown  = down  && (down  == 'next' || down  == 'prev') && keyCode == KEY_ARROW_DOWN
	const validLeft  = left  && (left  == 'next' || left  == 'prev') && keyCode == KEY_ARROW_LEFT
	const validRight = right && (right == 'next' || right == 'prev') && keyCode == KEY_ARROW_RIGHT
	const allOptionsInvalid = (
		up != 'next' && up != 'prev'
		&& up == down
		&& up == left
		&& up == right
	)
	const invalidKeys = (
		keyCode != KEY_ARROW_UP
		&& keyCode != KEY_ARROW_DOWN
		&& keyCode != KEY_ARROW_RIGHT
		&& keyCode != KEY_ARROW_LEFT
	)
	if (
		allOptionsInvalid
		|| invalidKeys
		|| (
			!validUp
			&& !validDown
			&& !validLeft
			&& !validRight
		)
	) return null

	if (parent && !elementContains(parent, element)) return null

	// parent check
	let elParent = elementParent(element)
	let validParent = elParent === parent
	while (!validParent && elParent) {
		if (elementStyle(elParent, 'display') != 'contents') return null

		elParent = elementParent(elParent)
		validParent = elParent === parent
	}

	// Support nested element as long the CSS
	// property of `display` is `contents`.
	let sibling: HTMLElement | null = null
	do {
		let direction: 'next' | 'prev' = 'next'
		if (validUp) direction = up
		else if (validDown) direction = down
		else if (validLeft) direction = left
		else if (validRight) direction = right

		let source = (sibling? sibling : element) as HTMLElement
		sibling = (direction == 'next'
			? elementSiblingNext(source)
			: elementSiblingPrevious(source)
		)
		if (sibling) {
			if (
				elementStyle(sibling, 'display') == 'contents'
				&& arrayLength(elementChildren(sibling)) > 0
			) {
				sibling = (direction == 'next'
					? elementFirstChild(sibling)
					: elementLastChild(sibling)
				) as HTMLElement
			}

			if (condition?.(sibling as T) ?? true) {
				elementFocus(sibling)
				if (document.activeElement != sibling) continue
				else {
					elementTabIndexSet(element, -1)
					elementTabIndexSet(sibling, 0)
					return sibling
				}
			}
		}
		else if (elementParent(source) != parent) {
			sibling = elementParent(source)
		}
	} while (sibling)

	elementFocus(element)
	return null
}

export function elementIsChild(element: HTMLElement, parent: HTMLElement): boolean {
	if (!elementContains(parent, element)) return false

	let elParent: HTMLElement | null = null
	do {
		elParent = elementParent(elParent ?? element)!
		if (elParent === parent) return true
		else if (elementStyle(elParent, 'display') != 'contents') return false
	} while (elParent !== parent)
	return false
}

/**
 * Manages `tabIndex` for descendant elements, handling 'display: contents' and active element changes.
 * Ensures only one eligible descendant has `tabIndex="0"` (focused), others have `tabIndex="-1"`.
 * Updates `tabIndex` based on the currently active element within the managed group.
 *
 * @param element The parent element.
 * @param condition Optional filter function for eligible descendants.
 */
export function elementChildrenTabIndex(
    element: HTMLElement,
    condition?: (el: HTMLElement) => boolean
): HTMLElement | null {
	let elWithTabIndexZero: HTMLElement | null = null
    const traverse = (el: HTMLElement) => {
        let child = elementFirstChild(el)
        while (child) {
            const source = child
            if (elementStyle(child, 'display') === 'contents') {
                traverse(child)
            }
			else if ((condition?.(child) ?? true) && child instanceof HTMLElement) {
                if (!elWithTabIndexZero) {
                    elementTabIndexSet(child, 0)
					elWithTabIndexZero = child
                }
				else if (documentActive() == child) {
					elementTabIndexSet(elWithTabIndexZero, -1)
                    elementTabIndexSet(child, 0)
				}
				else elementTabIndexSet(child, -1)
            }
            child = elementSiblingNext(source)
        }
    }

    traverse(element)
	return elWithTabIndexZero
}

/**
 * Recursively removes the `tabIndex` attribute from eligible descendant elements, handling
 * 'display: contents'.
 *
 * @param element The parent element.
 * @param condition Optional filter function to determine which descendants to modify.
 */
export function elementChildrenRemoveTabIndex(
    element: HTMLElement,
    condition?: (el: HTMLElement) => boolean
): void {
    const traverse = (el: HTMLElement) => {
        let child = elementFirstChild(el)
        while (child) {
            const source = child
            if (elementStyle(child, 'display') === 'contents') {
                traverse(child)
            }
			else if ((condition?.(child) ?? true) && child instanceof HTMLElement) {
                attrRemove(child, 'tabindex')
            }
            child = elementSiblingNext(source)
        }
    }

    traverse(element)
}

export function elementStyle(
	element: Element,
	property: string,
	pseudoElement?: string | null
): string {
	return window
		.getComputedStyle(element, pseudoElement)
		.getPropertyValue(property)
}

export function elementClassList(element: HTMLElement): DOMTokenList {
	return element.classList
}

export function elementClassListContains(element: HTMLElement, token: string): boolean {
	return elementClassList(element).contains(token)
}

export function elementBlur(element: HTMLElement): void {
	return element.blur()
}

export function elementChildren<T = HTMLElement>(element: HTMLElement): T[] {
	return [...element.children] as unknown as T[]
}

export function elementPointerCaptureSet(element: HTMLElement, pointer_id: number): void {
	return element.setPointerCapture(pointer_id)
}

export function elementPointerCaptureRelease(element: HTMLElement, pointer_id: number): void {
	return element.releasePointerCapture(pointer_id)
}

export function elementClick(element: HTMLElement): void {
	return element.click()
}

export function elementFocus(element: HTMLElement, options?: FocusOptions): void {
	return element.focus(options)
}

export function elementTabIndexSet(element: HTMLElement, value: number): number {
	return element.tabIndex = value
}

export function elementSiblingNext<T = HTMLElement>(element: HTMLElement): T | null {
	return element.nextElementSibling as T | null
}

export function elementSiblingPrevious<T = HTMLElement>(element: HTMLElement): T | null {
	return element.previousElementSibling as T | null
}

export function elementScrollTop(element: HTMLElement): number {
	return element.scrollTop
}

export function elementDataset(element: HTMLElement, key: string): string | undefined {
	return element.dataset[key]
}

export function elementRemove(element: HTMLElement): void {
	return element.remove()
}

export function elementDispatchEvent(element: HTMLElement, event: Event): boolean {
	return element.dispatchEvent(event)
}

export function elementIsSame(element: HTMLElement, other: Node | null): boolean {
	return element === other
}

export function elementAnimate(
	element: HTMLElement,
	keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
	options?: number | KeyframeAnimationOptions
): Animation {
	return element.animate(keyframes, options)
}

/**
 * Validation helper for event delegation.
 * @param parent
 * @param target if emtpy, `document.activeElement` will be used.
 * @param condition
 * @returns
 */
export function elementValidTarget(
	parent: HTMLElement,
	target?: HTMLElement | null,
	condition?: (el: HTMLElement) => boolean
): boolean {
	if (!target) target = documentActive()
	return Boolean(
		target
		&& elementContains(parent, target)
		&& (condition?.(target) ?? true)
	)
}