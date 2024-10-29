import { _getAttribute, _removeAttribute, _setAttribute } from "@/constants/string"
import { isVarHasValue } from "./data"
import { isBoolean } from "./typecheck"

export function setElementAttributeIfExist(value: unknown, keepValue: boolean = false): string | undefined {
	if (!isVarHasValue(value))
		return undefined

	if (isBoolean(value) && !keepValue)
		return value? '' : undefined

	return keepValue? `${ value }` : ''
}

export function isElementHasAttribute(element: Element, qualifiedName: string): boolean {
	return getElementAttribute(element, qualifiedName) != null
}

export function getElementAttribute(element: Element, qualifiedName: string): string | null {
	return element[_getAttribute](qualifiedName)
}

export function setElementAttribute(element: Element, qualifiedName: string, value: string = ''): void {
	return element[_setAttribute](qualifiedName, value)
}

export function removeElementAttribute(element: Element, qualifiedName: string): void {
	return element[_removeAttribute](qualifiedName)
}