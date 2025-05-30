type Listener<T> = (state: T, oldState: T) => void

let _KEY_ID = 0
function _createKey() {
	++_KEY_ID
	return _KEY_ID + ''
}

export class ObservableStore<T extends object> {
	private state: T
	private listeners = new Map<string, Listener<T>>()

	constructor(initialState: T) {
		this.state = initialState
	}

	get value() {
		return this.state
	}

	get listenerKeys() {
		return [...this.listeners.keys()]
	}

	/**
	 * Update state
	 * @param updater
	 * @param notifyKeys Keys of listener. Order matter. It is possible to repeat key.
	 */
	update(updater: (state: T) => T, notifyKeys: string[] | null = []) {
		const oldState = this.state
		this.state = updater(this.state)
		if (notifyKeys !== null) {
			this.notify(notifyKeys, oldState)
		}
	}

	subscribe(listener: Listener<T>, key?: string) {
		if (this.listeners.values().some(v => v === listener)) {
			return
		}

		if (!key) {
			key = _createKey()
		}

		this.listeners.set(key, listener)
		return () => this.listeners.delete(key)
	}

	unsubscribe(key: string) {
		return this.listeners.delete(key)
	}

	/**
	 * Notify changes
	 * @param keys Keys of listener. Order matter. It is possible to repeat key.
	 * @param oldState
	 */
	notify(keys: string[] = [], oldState: T = this.state) {
		for (const key of (keys.length == 0? this.listeners.keys() : keys)) {
			this.listeners.get(key)?.(this.state, oldState)
		}
	}
}
