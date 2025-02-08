import { objectHasValue } from "./object"
import { typeIsBoolean, typeIsString } from "./typecheck"
import { arrayFilter, arrayJoin } from "./array"
import { stringTrim } from "./string"

export function attrSetIfExist(value: unknown, keepValue: boolean = false): string | undefined {
	if (!objectHasValue(value))
		return undefined

	if (typeIsBoolean(value) && !keepValue)
		return value? '' : undefined

	return keepValue? `${ value }` : ''
}

export function attrHas(element: Element, qualifiedName: string): boolean {
	return element.hasAttribute(qualifiedName)
}

export function attrGet(element: Element, qualifiedName: string): string | null {
	return element.getAttribute(qualifiedName)
}

export function attrSet(element: Element, qualifiedName: string, value: string = ''): void {
	return element.setAttribute(qualifiedName, value)
}

export function attrRemove(element: Element, qualifiedName: string): void {
	return element.removeAttribute(qualifiedName)
}

export function attrToggle(element: Element, qualifiedName: string, force?: boolean): boolean {
	return element.toggleAttribute(qualifiedName, force)
}

export function attrClassList(...classes: (string | undefined | null)[]): string {
	return stringTrim(arrayJoin(arrayFilter(classes, name => typeIsString(name)), ' '))
}

export function attrClassListModule(...arr: string[]): Record<string, boolean> {
	const classlist: Record<string, boolean> = {}
	for (const i in arr) {
		classlist[arr[i]] = true
	}
	return classlist
}