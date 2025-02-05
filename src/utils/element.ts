import { KEY_ARROW_UP, KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT } from "@/constants/key_code"
import { array_join, array_length } from "./array"
import { document_active, document_has_focus } from "./document"
import { attr_get, attr_remove } from "./attributes"
import { number_is_defined, number_parse } from "./number"

export function element_scroll_width(element: HTMLElement): number {
	return element.scrollWidth
}

export function element_closest<T = HTMLElement>(
	element: HTMLElement,
	selector: string
): T | null {
	return element.closest(selector) as T | null
}

export function element_client_width(element: HTMLElement): number {
	return element.clientWidth
}

export function element_scroll_height(element: HTMLElement): number {
	return element.scrollHeight
}

export function element_client_height(element: HTMLElement): number {
	return element.clientHeight
}

export function element_is_overflow_x(element: HTMLElement): boolean {
	return element_client_width(element) < element_scroll_width(element)
}

export function element_is_overflow_y(element: HTMLElement): boolean {
	return element_client_height(element) < element_scroll_height(element)
}

export function element_is_overflow(element: HTMLElement): boolean {
	return element_is_overflow_x(element) || element_is_overflow_y(element)
}

export function element_contains(
	element: HTMLElement,
	other: Node | null
): boolean {
	return element.contains(other)
}

export function element_first_child<T = HTMLElement>(
	element: HTMLElement
): T | null {
	return element.firstElementChild as T | null
}

export function element_last_child<T = HTMLElement>(
	element: HTMLElement
): T | null {
	return element.lastElementChild as T | null
}

export function element_parent<T = HTMLElement>(
	element: HTMLElement
): T | null {
	return element.parentElement as T | null
}

export function element_visible(
	element: HTMLElement,
	options?: CheckVisibilityOptions
): boolean {
	return element.checkVisibility(options)
}

export function element_editable(element: HTMLElement): boolean {
	return element.isContentEditable
}

export function element_connected(element: HTMLElement): boolean {
	return element.isConnected
}

export function element_tabindex(element: HTMLElement): number {
	return element.tabIndex
}

export function element_focus_any(
	parent: HTMLElement,
	condition?: (el: HTMLElement) => boolean
): void {
	const selector = ':is(' +  array_join([
		'[tabindex]',
		'a[href]',
		'area[href]',
		'button:not(:disabled)',
		'select:not(:disabled)',
		'input:not(:disabled)',
		'textarea:not(:disabled)',
		'iframe:not(:disabled)',
	], ',') + ')'
	const elements = element_all_by_selector(selector, parent)
	for (const el of elements) {
		if (condition && !condition(el as HTMLElement)) continue

		element_focus(el as HTMLElement)
		if (document_active() === el) break
	}
}

export function element_focusable(element: HTMLElement): boolean {
	const visible = element_visible(element, {
		contentVisibilityAuto: true,
		visibilityProperty: true,
	})
	const connected = element_connected(element)
	if (!visible || !connected) return false

	const disabled = element_matches(element, '[disabled]')
	if (disabled) return false

	const tagname = element_tagname(element)
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
		&& element_matches(element, '[href]')
	) return true

	if (element_editable(element)) return true
	if (element_matches(element, '[tabindex]')) {
		const tabindex = attr_get(element, 'tabindex')
		if (tabindex && number_is_defined(number_parse(tabindex, true))) {
			return true
		}
	}

	return false
}

/** Creates an instance of the element for the specified tag */
export function element_create<K extends keyof HTMLElementTagNameMap>(
	tagname: K,
	options?: ElementCreationOptions
): HTMLElementTagNameMap[K] {
	return document.createElement(tagname, options)
}

/** Returns a reference to the first object with the specified value of the ID
 * attribute */
export function element_by_id<T = HTMLElement>(element_id: string): T | null {
	return document.getElementById(element_id) as T | null
}

/** Returns the first element that is a descendant of node that matches
 * selectors */
export function element_by_selector(
	selectors: string,
	from: HTMLElement | Document = document
): HTMLElement | null {
	return from.querySelector(selectors)
}

/** Returns all element descendants of node that match selectors */
export function element_all_by_selector<E extends Element>(
	selectors: string,
	from: HTMLElement | Document = document
): NodeListOf<E> {
	return from.querySelectorAll<E>(selectors)
}

export function element_rect(element: Element): DOMRect {
	return element.getBoundingClientRect()
}

export function element_set_textcontent(element: HTMLElement, text: string): string {
	return element.textContent = text
}

export function element_set_popover(element: HTMLElement, popover: 'auto' | 'manual'): string {
	return element.popover = popover
}

export function element_set_id(element: HTMLElement, id: string): string {
	return element.id = id
}

export function element_set_style(
		element: HTMLElement,
		property: string,
		value: string | null,
		priority?: string | undefined
	): void {
	return element.style.setProperty(property, value, priority)
}

export function element_remove_style(
	element: HTMLElement,
	property: string
): string {
	return element.style.removeProperty(property)
}

export function element_append_child(element: HTMLElement, node: Node): Node {
	return element.appendChild(node)
}

export function element_tagname(element: HTMLElement): string {
	return element.tagName
}

export function element_matches(element: HTMLElement, selectors: string): boolean {
	return element.matches(selectors)
}

export function element_id(element: HTMLElement): string {
	return element.id
}

export function element_focus_by_arrowkey<T = HTMLElement>(
	parent: HTMLElement | null,
	key_code: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | string,
	options?: {
		up?: 'next' | 'prev'
		down?: 'next' | 'prev'
		left?: 'next' | 'prev'
		right?: 'next' | 'prev'
	},
	condition?: (sibling: T) => boolean
): HTMLElement | null {
	if (!document_has_focus()) return null

	const element = document_active()!
	if (!options) return null

	const up = options.up
	const down = options.down
	const left = options.left
	const right = options.right
	const valid_up    = up    && (up    == 'next' || up    == 'prev') && key_code == KEY_ARROW_UP
	const valid_down  = down  && (down  == 'next' || down  == 'prev') && key_code == KEY_ARROW_DOWN
	const valid_left  = left  && (left  == 'next' || left  == 'prev') && key_code == KEY_ARROW_LEFT
	const valid_right = right && (right == 'next' || right == 'prev') && key_code == KEY_ARROW_RIGHT
	const all_options_invalid = (
		up != 'next' && up != 'prev'
		&& up == down
		&& up == left
		&& up == right
	)
	const invalid_keys = (
		key_code != KEY_ARROW_UP
		&& key_code != KEY_ARROW_DOWN
		&& key_code != KEY_ARROW_RIGHT
		&& key_code != KEY_ARROW_LEFT
	)
	if (
		all_options_invalid
		|| invalid_keys
		|| (
			!valid_up
			&& !valid_down
			&& !valid_left
			&& !valid_right
		)
	) return null

	if (parent && !element_contains(parent, element)) return null

	// parent check
	let el_parent = element_parent(element)
	let valid_parent = el_parent === parent
	while (!valid_parent && el_parent) {
		if (element_style(el_parent, 'display') != 'contents') return null

		el_parent = element_parent(el_parent)
		valid_parent = el_parent === parent
	}

	// Support nested element as long the CSS
	// property of `display` is `contents`.
	let sibling: HTMLElement | null = null
	do {
		let direction: 'next' | 'prev' = 'next'
		if (valid_up) direction = up
		else if (valid_down) direction = down
		else if (valid_left) direction = left
		else if (valid_right) direction = right

		let source = (sibling? sibling : element) as HTMLElement
		sibling = (direction == 'next'
			? element_next_sibling(source)
			: element_previous_sibling(source)
		)
		if (sibling) {
			if (
				element_style(sibling, 'display') == 'contents'
				&& array_length(element_children(sibling)) > 0
			) {
				sibling = (direction == 'next'
					? element_first_child(sibling)
					: element_last_child(sibling)
				) as HTMLElement
			}

			if (condition?.(sibling as T) ?? true) {
				element_focus(sibling)
				if (document.activeElement != sibling) continue
				else {
					element_set_tabindex(element, -1)
					element_set_tabindex(sibling, 0)
					return sibling
				}
			}
		}
		else if (element_parent(source) != parent) {
			sibling = element_parent(source)
		}
	} while (sibling)

	element_focus(element)
	return null
}

export function element_is_child(element: HTMLElement, parent: HTMLElement): boolean {
	if (!element_contains(parent, element)) return false

	let el_parent: HTMLElement | null = null
	do {
		el_parent = element_parent(el_parent ?? element)!
		if (el_parent === parent) return true
		else if (element_style(el_parent, 'display') != 'contents') return false
	} while (el_parent !== parent)
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
export function element_children_tabindex(
    element: HTMLElement,
    condition?: (el: HTMLElement) => boolean
): HTMLElement | null {
	let element_with_tabindex_zero: HTMLElement | null = null
    const traverse = (el: HTMLElement) => {
        let child = element_first_child(el)
        while (child) {
            const source = child
            if (element_style(child, 'display') === 'contents') {
                traverse(child)
            }
			else if ((condition?.(child) ?? true) && child instanceof HTMLElement) {
                if (!element_with_tabindex_zero) {
                    element_set_tabindex(child, 0)
					element_with_tabindex_zero = child
                }
				else if (document_active() == child) {
					element_set_tabindex(element_with_tabindex_zero, -1)
                    element_set_tabindex(child, 0)
				}
				else element_set_tabindex(child, -1)
            }
            child = element_next_sibling(source)
        }
    }

    traverse(element)
	return element_with_tabindex_zero
}

/**
 * Recursively removes the `tabIndex` attribute from eligible descendant elements, handling
 * 'display: contents'.
 *
 * @param element The parent element.
 * @param condition Optional filter function to determine which descendants to modify.
 */
export function element_children_remove_tabindex(
    element: HTMLElement,
    condition?: (el: HTMLElement) => boolean
): void {
    const traverse = (el: HTMLElement) => {
        let child = element_first_child(el)
        while (child) {
            const source = child
            if (element_style(child, 'display') === 'contents') {
                traverse(child)
            }
			else if ((condition?.(child) ?? true) && child instanceof HTMLElement) {
                attr_remove(child, 'tabindex')
            }
            child = element_next_sibling(source)
        }
    }

    traverse(element)
}

export function element_style(
	element: Element,
	property: string,
	pseudo_element?: string | null
): string {
	return window
		.getComputedStyle(element, pseudo_element)
		.getPropertyValue(property)
}

export function element_classlist(element: HTMLElement): DOMTokenList {
	return element.classList
}

export function element_classlist_contains(element: HTMLElement, token: string): boolean {
	return element_classlist(element).contains(token)
}

export function element_blur(element: HTMLElement): void {
	return element.blur()
}

export function element_children<T = HTMLElement>(element: HTMLElement): T[] {
	return [...element.children] as unknown as T[]
}

export function element_set_pointercapture(element: HTMLElement, pointer_id: number): void {
	return element.setPointerCapture(pointer_id)
}

export function element_release_pointercapture(element: HTMLElement, pointer_id: number): void {
	return element.releasePointerCapture(pointer_id)
}

export function element_click(element: HTMLElement): void {
	return element.click()
}

export function element_focus(element: HTMLElement, options?: FocusOptions): void {
	return element.focus(options)
}

export function element_set_tabindex(element: HTMLElement, value: number): number {
	return element.tabIndex = value
}

export function element_next_sibling<T = HTMLElement>(element: HTMLElement): T | null {
	return element.nextElementSibling as T | null
}

export function element_previous_sibling<T = HTMLElement>(element: HTMLElement): T | null {
	return element.previousElementSibling as T | null
}

export function element_scroll_top(element: HTMLElement): number {
	return element.scrollTop
}

export function element_dataset(element: HTMLElement, key: string): string | undefined {
	return element.dataset[key]
}

export function element_remove(element: HTMLElement): void {
	return element.remove()
}

export function element_dispatch_event(element: HTMLElement, event: Event): boolean {
	return element.dispatchEvent(event)
}

export function element_is_same_node(element: HTMLElement, other: Node | null): boolean {
	return element === other
}

export function element_animate(
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
export function element_valid_target(
	parent: HTMLElement,
	target?: HTMLElement | null,
	condition?: (el: HTMLElement) => boolean
): boolean {
	if (!target) target = document_active()
	return Boolean(
		target
		&& element_contains(parent, target)
		&& (condition?.(target) ?? true)
	)
}