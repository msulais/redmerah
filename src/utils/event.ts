import { _addEventListener, _defaultPrevented, _preventDefault, _removeEventListener, _stopImmediatePropagation, _stopPropagation } from "@/constants/string"
import type { BatteryManager } from "@/interfaces/battery"
import type { JSX } from "solid-js"
import { isFunction } from "./typecheck"

type HasEventElement =
	Element |
	Window |
	Document |
	MediaQueryList |
	FileReader |
	BatteryManager |
	any


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

export function callEventHandler<T, E extends Event>(
	event: E & { currentTarget: T; target: Element },
	handler: JSX.EventHandlerUnion<T, E> | undefined,
): boolean {
	if (handler) {
		if (isFunction(handler)) (handler as JSX.EventHandler<T, E>)(event)
		else (handler as JSX.BoundEventHandler<T, E>)[0](
			(handler as JSX.BoundEventHandler<T, E>)[1],
			event
		)
	}

	return event?.[_defaultPrevented]
}