import { is_var_has_value } from "./object"
import { is_boolean, is_string } from "./typecheck"
import { array_filter, array_join } from "./array"
import { string_trim } from "./string"

export function attr_set_if_exist(value: unknown, keepValue: boolean = false): string | undefined {
	if (!is_var_has_value(value))
		return undefined

	if (is_boolean(value) && !keepValue)
		return value? '' : undefined

	return keepValue? `${ value }` : ''
}

/**
 * Returns true if element has an attribute whose qualified name is qualifiedName, and false otherwise.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/hasAttribute)
 */
export function attr_has(element: Element, qualifiedName: string): boolean {
	return element.hasAttribute(qualifiedName)
}

/**
 * Returns element's first attribute whose qualified name is qualifiedName, and null if there is no such attribute otherwise.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/getAttribute)
 */
export function attr_get(element: Element, qualifiedName: string): string | null {
	return element.getAttribute(qualifiedName)
}

/**
 * Sets the value of element's first attribute whose qualified name is qualifiedName to value.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/setAttribute)
 */
export function attr_set(element: Element, qualifiedName: string, value: string = ''): void {
	return element.setAttribute(qualifiedName, value)
}

/**
 * Removes element's first attribute whose qualified name is qualifiedName.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/removeAttribute)
 */
export function attr_remove(element: Element, qualifiedName: string): void {
	return element.removeAttribute(qualifiedName)
}

/**
 * If force is not given, "toggles" qualifiedName, removing it if it is present and adding it if it is not present. If force is true, adds qualifiedName. If force is false, removes qualifiedName.
 *
 * Returns true if qualifiedName is now present, and false otherwise.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/toggleAttribute)
 */
export function attr_toggle(element: Element, qualifiedName: string, force?: boolean): boolean {
	return element.toggleAttribute(qualifiedName, force)
}

export function classlist(...classname: (string | undefined | null)[]): string {
	return string_trim(array_join(array_filter(classname, name => is_string(name)), ' '))
}