import { _addEventListener, _preventDefault, _removeEventListener, _stopImmediatePropagation, _stopPropagation } from "@/data/string"

export function addEventListener(
        element: Element | Window | Document, 
        type: string, 
        listener: EventListenerOrEventListenerObject, 
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
    return element[_addEventListener](type, listener, options)
}

export function removeEventListener(
        element: Element | Window | Document, 
        type: string, 
        listener: EventListenerOrEventListenerObject, 
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
    return element[_removeEventListener](type, listener, options)
}

export function stopImmediatePropagation(event: Event): void {
    return event[_stopImmediatePropagation]()
}

export function preventDefault(event: Event): void {
    return event[_preventDefault]()
}

export function stopPropagation(event: Event): void {
    return event[_stopPropagation]()
}