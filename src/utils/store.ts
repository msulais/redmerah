import { deepCopy } from "./object"

type Listener<T> = (state: T, oldState: T) => void
type ReadWrite<T> = {-readonly [P in keyof T]: T[P]}

export class ObservableStore<T extends object> {
	private state: Readonly<T>
	private listeners = new Map<symbol, Listener<Readonly<T>>>()

	constructor(initialState: T) {
		this.state = initialState
	}

	get value() {
		return this.state
	}

	get listenerKeys() {
		return new Set([...this.listeners.keys()])
	}

	/**
	 * Update state
	 * @param updater
	 * @param notifyKeys Keys of listener. Order matter. It is possible to repeat key.
	 */
	update(updater: (state: ReadWrite<T>) => unknown, notifyKeys: symbol[] | null = []) {
		const oldState = this.state
		// TODO: find better solution
		updater(this.state = deepCopy(this.state))
		if (notifyKeys !== null) {
			this.notify(notifyKeys, oldState)
		}
	}

	subscribeAll(listeners: Listener<T>[], keys: symbol[] = []) {
		for (let i = 0; i < listeners.length; i++) {
			this.subscribe(listeners[i], keys[i] ?? Symbol())
		}
	}

	subscribe(listener: Listener<T>, key: symbol = Symbol()) {
		if (this.listeners.values().some(v => v === listener)) {
			return
		}

		this.listeners.set(key, listener)
		return () => this.listeners.delete(key)
	}

	unsubscribe(key: symbol) {
		return this.listeners.delete(key)
	}

	/**
	 * Notify changes
	 * @param keys Keys of listener. Order matter. It is possible to repeat key.
	 * @param oldState
	 */
	notify(keys: symbol[] = [], oldState: T = this.state) {
		for (const key of (keys.length === 0? this.listeners.keys() : keys)) {
			this.listeners.get(key)?.(this.state, oldState)
		}
	}
}
