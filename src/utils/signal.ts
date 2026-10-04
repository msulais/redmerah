type Subscriber<T> = (value: T) => unknown

/**
 * A reactive signal that holds a value and notifies subscribers upon mutation.
 * @template T The type of the signal's value.
 */
export interface SignalAccessor<T> {
    /** Returns the current value of the signal. */
    (): T

    /**
     * Subscribes a callback to value changes.
     * @param callback The function to execute on change.
     * @returns A function to unsubscribe the callback.
     */
    subscribe: (callback: Subscriber<T>) => () => boolean

    /**
     * Removes a previously subscribed callback.
     * @param callback The function to remove.
     */
    unsubscribe: (callback: Subscriber<T>) => void

    /**
	 * Manually forces a notification to all subscribers.
     * Useful for non-primitive mutations like Set, Map, or Array methods.
     */
    notify: () => void

    /**
     * Updates the signal's value.
     * @param v The new value.
     * @param notify Whether to notify subscribers (defaults to true).
     */
    set: (v: T | ((v: T) => T), notify?: boolean) => void
}

const _pendingSignalNotifications = new Set<SignalAccessor<any>>()
let _batchDepth = 0

/**
 * Creates a reactive signal with an initial value.
 * @template T The type of the value.
 * @param initialValue The starting value of the signal.
 * @returns A callable accessor with attached reactivity methods.
 */
export function signal<T>(initialValue: T): SignalAccessor<T> {
	const subscribers = new Set<Subscriber<T>>()
	let currentValue = initialValue

	const accessor = (() => currentValue) as SignalAccessor<T>

	accessor.notify = () => {
		if (_batchDepth > 0) {
			_pendingSignalNotifications.add(accessor)
			return
		}

		subscribers.forEach((callback) => callback(currentValue))
	}

	accessor.set = (v: T | ((v: T) => T), notify: boolean = true) => {
		const newValue = typeof v === 'function'? (v as ((v: T) => T))(currentValue) : v
		if (newValue === currentValue) {
			return
		}

		currentValue = newValue
		if (notify) {
			accessor.notify()
		}
	}

	accessor.subscribe = (callback: Subscriber<T>) => {
		subscribers.add(callback)
		return () => subscribers.delete(callback)
	}

	accessor.unsubscribe = (callback: Subscriber<T>) => {
		subscribers.delete(callback)
	}

	return accessor
}

/**
 * Batches multiple signal updates together to prevent redundant listener executions.
 * @param callback The function containing signal mutations.
 */
export function batch(callback: () => unknown): void {
	_batchDepth++
	try {
		callback()
	}
	finally {
		_batchDepth--

		// Only flush notifications if we've exited the outermost batch
		if (_batchDepth <= 0) {
			for (const sig of _pendingSignalNotifications) {
				sig.notify()
			}

			_pendingSignalNotifications.clear()
			_batchDepth = 0
		}
	}
}

/**
 * Subscribes a single callback to multiple signals.
 * @param callback The function to execute when any of the signals change.
 * @param signals The signals to observe.
 * @returns A cleanup function to unsubscribe from all provided signals.
 */
export function subscribe(callback: () => unknown, ...signals: SignalAccessor<any>[]) {
	for (const sig of signals) {
		sig.subscribe(callback)
	}

	return () => unsubscribe(callback, ...signals)
}

/**
 * Unsubscribes a callback from multiple signals.
 * @param callback The function to remove.
 * @param signals The signals to disconnect from.
 */
export function unsubscribe(callback: () => unknown, ...signals: SignalAccessor<any>[]): void {
	for (const sig of signals) {
		sig.unsubscribe(callback)
	}
}