import { _clientHeight, _clientWidth, _createElement, _getBoundingClientRect, _getElementById, _length, _querySelector, _querySelectorAll, _scrollHeight, _scrollWidth, _setProperty, _style } from "@/data/string"
import { getDocument } from "@/data/window"

export function isElementOverflowX(el: HTMLElement): boolean {
    return el[_clientWidth] < el[_scrollWidth]
}

export function isElementOverflowY(el: HTMLElement): boolean {
    return el[_clientHeight] < el[_scrollHeight]
}

export function isElementOverflow(el: HTMLElement): boolean {
    return isElementOverflowX(el) || isElementOverflowY(el)
}

export function addClassListModule(...arr: string[]): Record<string, boolean> {
    const classList: Record<string, boolean> = {}
    for (let i = 0; i < arr[_length]; i++) {
        classList[arr[i]] = true
    }
    return classList
}

export function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K] {
    return getDocument()[_createElement](tagName, options)
}

export function getElementById(elementId: string): HTMLElement | null {
    return getDocument()[_getElementById](elementId)
}

export function querySelector(selectors: string): HTMLElement | null {
    return getDocument()[_querySelector](selectors)
}

export function querySelectorAll<E extends Element>(selectors: string): NodeListOf<E> {
    return getDocument()[_querySelectorAll]<E>(selectors)
}

export function getBoundingClientRect(element: Element): DOMRect {
    return element[_getBoundingClientRect]()
}

export function setStyleProperty(
        element: HTMLElement, 
        property: string, 
        value: string | null, 
        priority?: string | undefined
    ): void {
    return element[_style][_setProperty](property, value, priority)
}