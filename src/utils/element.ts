export function element_scroll_width(el: HTMLElement): number {
	return el.scrollWidth
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

export function is_element_overflow_x(el: HTMLElement): boolean {
	return element_client_width(el) < element_scroll_width(el)
}

export function is_element_overflow_y(el: HTMLElement): boolean {
	return element_client_height(el) < element_scroll_height(el)
}

export function is_element_overflow(el: HTMLElement): boolean {
	return is_element_overflow_x(el) || is_element_overflow_y(el)
}

export function element_contains(el: HTMLElement, other: Node | null): boolean {
	return el.contains(other)
}

export function element_first_element_child(el: HTMLElement): HTMLElement | null {
	return el.firstElementChild as HTMLElement
}

export function element_last_element_child(el: HTMLElement): HTMLElement | null {
	return el.lastElementChild as HTMLElement
}

export function element_parent_element(el: HTMLElement): HTMLElement | null {
	return el.parentElement
}

export function add_classlist_module(...arr: string[]): Record<string, boolean> {
	const classlist: Record<string, boolean> = {}
	for (const i in arr) {
		classlist[arr[i]] = true
	}
	return classlist
}

/** Creates an instance of the element for the specified tag */
export function create_element<K extends keyof HTMLElementTagNameMap>(tagname: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K] {
	return document.createElement(tagname, options)
}

/** Returns a reference to the first object with the specified value of the ID attribute */
export function get_element_by_id(element_id: string): HTMLElement | null {
	return document.getElementById(element_id)
}

/** Returns the first element that is a descendant of node that matches selectors */
export function get_element_by_selector(
	selectors: string,
	from: HTMLElement | Document = document
): HTMLElement | null {
	return from.querySelector(selectors)
}

/** Returns all element descendants of node that match selectors */
export function get_multiple_element_by_selector<E extends Element>(
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

export function element_classlist(el: HTMLElement): DOMTokenList {
	return el.classList
}

export function element_blur(el: HTMLElement): void {
	return el.blur()
}

export function element_children(el: HTMLElement): HTMLCollection {
	return el.children
}

export function element_click(el: HTMLElement): void {
	return el.click()
}

export function element_focus(el: HTMLElement, options?: FocusOptions): void {
	return el.focus(options)
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
	return el.isSameNode(otherNode)
}

export function element_animate(
	el: HTMLElement,
	keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
	options?: number | KeyframeAnimationOptions
): Animation {
	return el.animate(keyframes, options)
}