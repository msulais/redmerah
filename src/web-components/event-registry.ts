type EventType = string

interface EventRegistry {
    callbacks: Set<(ev: any) => unknown>
    rootHandler: (ev: Event) => void
}

const REGISTRY = new Map<EventType, EventRegistry>()

export function listenDocumentEvent<T extends Event>(
    type: EventType,
    callback: (ev: T) => unknown,
    options?: AddEventListenerOptions | boolean
) {
    if (!REGISTRY.has(type)) {
        const rootHandler = (ev: Event) => {
            for (const cb of REGISTRY.get(type)?.callbacks ?? []) {
                cb(ev)
            }
        }

        REGISTRY.set(type, {
            callbacks: new Set(),
            rootHandler
        })

        document.addEventListener(type, rootHandler, options)
    }

    const eventData = REGISTRY.get(type)!
    eventData.callbacks.add(callback)
    return () => {
        eventData.callbacks.delete(callback)
        if (eventData.callbacks.size === 0) {
            document.removeEventListener(type, eventData.rootHandler, options)
            REGISTRY.delete(type)
        }
    }
}