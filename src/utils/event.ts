import type { JSX } from "solid-js"

export function eventCall<T extends Event, U, V>(
	event: T & { currentTarget: U; target: Element },
	handler: V,
): boolean {
	if (handler) {
		if (typeof handler === 'function') (handler as JSX.EventHandler<U, T>)(event)
		else (handler as unknown as JSX.BoundEventHandler<U, T>)[0](
			(handler as unknown as JSX.BoundEventHandler<U, T>)[1],
			event
		)
	}

	return event?.defaultPrevented
}