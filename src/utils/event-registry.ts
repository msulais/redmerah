type EventType = string
type ParentElement = Document | Element
type Listener<T extends Event> = (ev: T) => unknown

const NON_BUBBLING_EVENTS = new Set([
	'focus',
	'blur',
	'scroll',
	'load',
	'error',
	'play',
	'pause',
	'mouseenter',
	'mouseleave'
])

const LISTENERS = new WeakMap<
	ParentElement,
	Map<EventType, {
		fn: (ev: Event) => unknown
		elements: Map<Element, Set<Listener<Event>>>
	}>
>()

export function delegateEvent<T extends Event = Event>(
	target: Element,
	type: EventType,
	callback: Listener<T>,
	parent: ParentElement = document,
) {
	if (!LISTENERS.has(parent)) {
		LISTENERS.set(parent, new Map())
	}

	const parentMap = LISTENERS.get(parent)!
	const useCapture = NON_BUBBLING_EVENTS.has(type)
	if (!parentMap.has(type)) {
		const fn = (ev: Event) => {
			const elementsMap = LISTENERS.get(parent)?.get(type)?.elements
			if (!elementsMap) {
				return
			}

			let current = ev.target as Node | null
			const endNode = parent === document ? null : parent.parentNode
			while (current && current !== endNode) {
				if (current.nodeType === Node.ELEMENT_NODE) {
					for (const cb of elementsMap.get(current as Element) ?? []) {
						cb(ev)
					}
				}

				current = current.parentNode
			}
		}

		parentMap.set(type, { fn, elements: new Map() })
		parent.addEventListener(type, fn, { capture: useCapture })
	}

	const elementsMap = parentMap.get(type)!.elements
	if (!elementsMap.has(target)) {
		elementsMap.set(target, new Set())
	}

	const callbacks = elementsMap.get(target)!
	callbacks.add(callback as Listener<Event>)
	return () => undelegateEvent(target, type, callback, parent)
}

export function undelegateEvent<T extends Event = Event>(
	target: Element,
	type: EventType,
	callback: Listener<T>,
	parent: ParentElement = document,
) {
	const parentMap = LISTENERS.get(parent)
	if (!parentMap) {
		return
	}

	const typeRegistry = parentMap.get(type)
	if (!typeRegistry) {
		return
	}

	const elementsMap = typeRegistry.elements
	const callbacks = elementsMap.get(target)
	if (!callbacks) {
		return
	}

	callbacks.delete(callback as Listener<Event>)
	if (callbacks.size > 0) {
		return
	}

	elementsMap.delete(target)
	if (elementsMap.size > 0) {
		return
	}

	const useCapture = NON_BUBBLING_EVENTS.has(type)
	parent.removeEventListener(type, typeRegistry.fn, { capture: useCapture })
	parentMap.delete(type)
	if (parentMap.size === 0) {
		LISTENERS.delete(parent)
	}
}