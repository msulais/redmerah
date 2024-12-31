import { ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT } from "@/constants/key_code"
import { array_length } from "./array"
import { document_active, document_has_focus } from "./document"
import { attr_get, attr_remove } from "./attributes"
import { number_is_defined, number_parse } from "./number"

export function element_scroll_width(el: HTMLElement): number {
	return el.scrollWidth
}

export function element_closest(
	el: HTMLElement,
	selector: string
): HTMLElement | null {
	return el.closest(selector)
}

export function element_client_width(el: HTMLElement): number {
	return el.clientWidth
}

export function element_scroll_height(el: HTMLElement): number {
	return el.scrollHeight
}

export function element_client_height(el: HTMLElement): number {
	return el.clientHeight
}

// TODO: rename to `element_is_overflow_x`
export function is_element_overflow_x(el: HTMLElement): boolean {
	return element_client_width(el) < element_scroll_width(el)
}

// TODO: rename to `element_is_overflow_y`
export function is_element_overflow_y(el: HTMLElement): boolean {
	return element_client_height(el) < element_scroll_height(el)
}

// TODO: rename to `element_is_overflow`
export function is_element_overflow(el: HTMLElement): boolean {
	return is_element_overflow_x(el) || is_element_overflow_y(el)
}

export function element_contains(el: HTMLElement, other: Node | null): boolean {
	return el.contains(other)
}

export function element_first_child(el: HTMLElement): HTMLElement | null {
	return el.firstElementChild as HTMLElement
}

export function element_last_child(el: HTMLElement): HTMLElement | null {
	return el.lastElementChild as HTMLElement
}

export function element_parent(el: HTMLElement): HTMLElement | null {
	return el.parentElement
}

export function element_visible(el: HTMLElement, options?: CheckVisibilityOptions): boolean {
	return el.checkVisibility(options)
}

export function element_editable(el: HTMLElement): boolean {
	return el.isContentEditable
}

export function element_connected(el: HTMLElement): boolean {
	return el.isConnected
}

export function element_tabindex(el: HTMLElement): number {
	return el.tabIndex
}

export function element_focusable(el: HTMLElement): boolean {
	const visible = element_visible(el, {
		contentVisibilityAuto: true,
		visibilityProperty: true,
	})
	const connected = element_connected(el)
	if (!visible || !connected) return false

	const disabled = element_matches(el, '[disabled]')
	if (disabled) return false

	const tagname = element_tagname(el)
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
		&& element_matches(el, '[href]')
	) return true

	if (element_editable(el)) return true
	if (element_matches(el, '[tabindex]')) {
		const tabindex = attr_get(el, 'tabindex')
		if (tabindex && number_is_defined(number_parse(tabindex, true))) {
			return true
		}
	}

	return false
}

// TODO: move to 'attributes.ts'
export function add_classlist_module(...arr: string[]): Record<string, boolean> {
	const classlist: Record<string, boolean> = {}
	for (const i in arr) {
		classlist[arr[i]] = true
	}
	return classlist
}

/** Creates an instance of the element for the specified tag */
export function element_create<K extends keyof HTMLElementTagNameMap>(tagname: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K] {
	return document.createElement(tagname, options)
}

/** Returns a reference to the first object with the specified value of the ID attribute */
export function element_by_id(element_id: string): HTMLElement | null {
	return document.getElementById(element_id)
}

/** Returns the first element that is a descendant of node that matches selectors */
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

export function element_set_style_property(
		element: HTMLElement,
		property: string,
		value: string | null,
		priority?: string | undefined
	): void {
	return element.style.setProperty(property, value, priority)
}

export function element_append_child(el: HTMLElement, node: Node): Node {
	return el.appendChild(node)
}

export function element_tagname(el: HTMLElement): string {
	return el.tagName
}

export function element_matches(el: HTMLElement, selectors: string): boolean {
	return el.matches(selectors)
}

export function element_id(el: HTMLElement): string {
	return el.id
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
	const valid_up    = up    && (up    == 'next' || up    == 'prev') && key_code == ARROW_UP
	const valid_down  = down  && (down  == 'next' || down  == 'prev') && key_code == ARROW_DOWN
	const valid_left  = left  && (left  == 'next' || left  == 'prev') && key_code == ARROW_LEFT
	const valid_right = right && (right == 'next' || right == 'prev') && key_code == ARROW_RIGHT
	const all_options_invalid = (
		up != 'next' && up != 'prev'
		&& up == down
		&& up == left
		&& up == right
	)
	const invalid_keys = (
		key_code != ARROW_UP
		&& key_code != ARROW_DOWN
		&& key_code != ARROW_RIGHT
		&& key_code != ARROW_LEFT
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

export function element_is_child(el: HTMLElement, parent: HTMLElement): boolean {
	if (!element_contains(parent, el)) return false

	let el_parent: HTMLElement | null = null
	do {
		el_parent = element_parent(el_parent ?? el)!
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
 * Recursively removes the `tabIndex` attribute from eligible descendant elements, handling 'display: contents'.
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

export function element_classlist(el: HTMLElement): DOMTokenList {
	return el.classList
}

export function element_blur(el: HTMLElement): void {
	return el.blur()
}

export function element_children<T = HTMLElement>(el: HTMLElement): T[] {
	return [...el.children] as unknown as T[]
}

export function element_click(el: HTMLElement): void {
	return el.click()
}

export function element_focus(el: HTMLElement, options?: FocusOptions): void {
	return el.focus(options)
}

export function element_set_tabindex(el: HTMLElement, value: number): number {
	return el.tabIndex = value
}

export function element_next_sibling(el: HTMLElement): HTMLElement | null {
	return el.nextElementSibling as HTMLElement | null
}

export function element_previous_sibling(el: HTMLElement): HTMLElement | null {
	return el.previousElementSibling as HTMLElement | null
}

export function element_scroll_top(el: HTMLElement): number {
	return el.scrollTop
}

export function element_dataset(el: HTMLElement, key: string): string | undefined {
	return el.dataset[key]
}

export function element_remove(el: HTMLElement): void {
	return el.remove()
}

export function element_dispatch_event(el: HTMLElement, event: Event): boolean {
	return el.dispatchEvent(event)
}

export function element_is_same_node(el: HTMLElement, otherNode: Node | null): boolean {
	return el === otherNode
}

export function element_animate(
	el: HTMLElement,
	keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
	options?: number | KeyframeAnimationOptions
): Animation {
	return el.animate(keyframes, options)
}