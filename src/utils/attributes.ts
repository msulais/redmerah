import { _getAttribute, _removeAttribute, _setAttribute } from "@/constants/string"
import { isVarHasValue } from "./data"
import { isBoolean } from "./typecheck"

export function toggleAttribute(value: unknown, showValue: boolean = false): string | undefined {
    if (!isVarHasValue(value))
        return undefined

    if (isBoolean(value) && !showValue)
        return value? '' : undefined

    return showValue? `${ value }` : ''
}

export function hasAttribute(element: Element, qualifiedName: string): boolean {
    return getAttribute(element, qualifiedName) != null
}

export function getAttribute(element: Element, qualifiedName: string): string | null {
    return element[_getAttribute](qualifiedName)
}

export function setAttribute(element: Element, qualifiedName: string, value: string = ''): void {
    return element[_setAttribute](qualifiedName, value)
}

export function removeAttribute(element: Element, qualifiedName: string): void {
    return element[_removeAttribute](qualifiedName)
}