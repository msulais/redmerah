import type { JSX } from "solid-js"

import { typeIsFunction } from "./typecheck"

export function eventListenerAdd<E = Event>(
		target: any,
		type: string,
		listener: (ev: E) => unknown,
		options?: boolean | AddEventListenerOptions | undefined
	): void {
	return target.addEventListener(type, listener as any, options)
}

export function eventListenerRemove<E = Event>(
	target: any,
	type: string,
	listener: (ev: E) => unknown,
	options?: boolean | AddEventListenerOptions | undefined
): void {
	return target.removeEventListener(type, listener as any, options)
}

export function eventStopImmediatePropagation(event: Event): void {
	return event.stopImmediatePropagation()
}

export function eventPreventDefault(event: Event): void {
	return event.preventDefault()
}

export function eventStopPropagation(event: Event): void {
	return event.stopPropagation()
}

export function eventCurrentTarget<T extends Event, U, V>(
	event: T & {
		currentTarget: U
		target: V
	}
): U {
	return event.currentTarget
}

export function eventTarget<T extends Event, U, V>(
	event: T & {
		currentTarget: U
		target: V
	}
): V {
	return event.target
}

export function eventCall<T extends Event, U, V>(
	event: T & { currentTarget: U; target: Element },
	handler: V,
): boolean {
	if (handler) {
		if (typeIsFunction(handler)) (handler as JSX.EventHandler<U, T>)(event)
		else (handler as unknown as JSX.BoundEventHandler<U, T>)[0](
			(handler as unknown as JSX.BoundEventHandler<U, T>)[1],
			event
		)
	}

	return event?.defaultPrevented
}

export function eventType(ev: Event): string {
	return ev.type
}