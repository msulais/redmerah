import { _addEventListener, _preventDefault, _removeEventListener, _stopImmediatePropagation, _stopPropagation } from "@/constants/string"

type HasEventElement =
    Element |
    Window |
    Document |
    MediaQueryList |
    FileReader


export function addEventListener<E = Event>(
        element: HasEventElement,
        type: string,
        listener: (ev: E) => unknown,
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
    return element[_addEventListener](type, listener as any, options)
}

export function removeEventListener<E = Event>(
        element: HasEventElement,
        type: string,
        listener: (ev: E) => unknown,
        options?: boolean | AddEventListenerOptions | undefined
    ): void {
    return element[_removeEventListener](type, listener as any, options)
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