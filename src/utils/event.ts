import type { BatteryManager } from "@/interfaces/battery"
import type { JSX } from "solid-js"
import { is_function } from "./typecheck"

type HasEventElement =
	Element |
	Window |
	Document |
	MediaQueryList |
	FileReader |
	BatteryManager |
	any


export function event_add_listener<E = Event>(
		element: HasEventElement,
		type: string,
		listener: (ev: E) => unknown,
		options?: boolean | AddEventListenerOptions | undefined
	): void {
	return element.addEventListener(type, listener as any, options)
}

export function event_remove_listener<E = Event>(
		element: HasEventElement,
		type: string,
		listener: (ev: E) => unknown,
		options?: boolean | AddEventListenerOptions | undefined
	): void {
	return element.removeEventListener(type, listener as any, options)
}

/** Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects */
export function event_stop_immediate_propagation(event: Event): void {
	return event.stopImmediatePropagation()
}

/** If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled */
export function event_prevent_default(event: Event): void {
	return event.preventDefault()
}

/** When dispatched in a tree, invoking this method prevents event from reaching any objects other than the current object */
export function event_stop_propagation(event: Event): void {
	return event.stopPropagation()
}

export function event_current_target<T extends Event, U, V>(
	event: T & {
		currentTarget: U
		target: V
	}
): U {
	return event.currentTarget
}

export function event_call<T extends Event, U>(
	event: T & { currentTarget: U; target: Element },
	handler: JSX.EventHandlerUnion<U, T> | undefined,
): boolean {
	if (handler) {
		if (is_function(handler)) (handler as JSX.EventHandler<U, T>)(event)
		else (handler as JSX.BoundEventHandler<U, T>)[0](
			(handler as JSX.BoundEventHandler<U, T>)[1],
			event
		)
	}

	return event?.defaultPrevented
}