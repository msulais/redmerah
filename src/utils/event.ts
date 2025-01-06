import type { JSX } from "solid-js"

import { is_function } from "./typecheck"

export function event_add_listener<E = Event>(
		target: any,
		type: string,
		listener: (ev: E) => unknown,
		options?: boolean | AddEventListenerOptions | undefined
	): void {
	return target.addEventListener(type, listener as any, options)
}

export function event_remove_listener<E = Event>(
	target: any,
	type: string,
	listener: (ev: E) => unknown,
	options?: boolean | AddEventListenerOptions | undefined
): void {
	return target.removeEventListener(type, listener as any, options)
}

/** Invoking this method prevents event from reaching any registered event listeners after the
 * current one finishes running and, when dispatched in a tree, also prevents event from reaching
 * any other objects */
export function event_stop_immediate_propagation(event: Event): void {
	return event.stopImmediatePropagation()
}

/** If invoked when the cancelable attribute value is true, and while executing a listener for the
 * event with passive set to false, signals to the operation that caused event to be dispatched that
 * it needs to be canceled */
export function event_prevent_default(event: Event): void {
	return event.preventDefault()
}

/** When dispatched in a tree, invoking this method prevents event from reaching any objects other
 * than the current object */
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

export function event_target<T extends Event, U, V>(
	event: T & {
		currentTarget: U
		target: V
	}
): V {
	return event.target
}

export function event_call<T extends Event, U, V>(
	event: T & { currentTarget: U; target: Element },
	handler: V,
): boolean {
	if (handler) {
		if (is_function(handler)) (handler as JSX.EventHandler<U, T>)(event)
		else (handler as unknown as JSX.BoundEventHandler<U, T>)[0](
			(handler as unknown as JSX.BoundEventHandler<U, T>)[1],
			event
		)
	}

	return event?.defaultPrevented
}

export function event_type(ev: Event): string {
	return ev.type
}