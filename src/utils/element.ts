import { _clientHeight, _clientWidth, _getElementById, _length, _querySelector, _querySelectorAll, _scrollHeight, _scrollWidth, _setProperty, _style } from "@/data/string"
import { getDocument } from "@/data/window"

export function isElementOverflow(el: HTMLElement): boolean {
    return el[_clientWidth] < el[_scrollWidth] || el[_clientHeight] < el[_scrollHeight]
}

export function addClassListModule(...arr: string[]) {
    const classList: Record<string, boolean> = {}
    for (let i = 0; i < arr[_length]; i++) {
        classList[arr[i]] = true
    }
    return classList
}

export function getElementById(elementId: string): HTMLElement | null {
    return getDocument[_getElementById](elementId)
}

export function querySelector(selectors: string): HTMLElement | null {
    return getDocument[_querySelector](selectors)
}

export function querySelectorAll(selectors: string): NodeListOf<Element> {
    return getDocument[_querySelectorAll](selectors)
}

export function getBoundingClientRect(element: Element): DOMRect {
    return element.getBoundingClientRect()
}

export function setStyleProperty(
        element: HTMLElement, 
        property: string, 
        value: string | null, 
        priority?: string | undefined
    ): void {
    return element[_style][_setProperty](property, value, priority)
}