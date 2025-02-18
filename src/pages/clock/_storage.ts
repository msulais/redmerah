export type IDBStoreSettings<T = unknown> = {
	key: IDBStoreKeysSettings
	value: T
}

export type IDBStoreLastInput<T = unknown> = {
	key: IDBStoreKeysLastInput
	value: T
}

export enum IDBStoreNames {
	settings = 'settings',
	lastInput = 'last-input',
}

export enum IDBStoreKeysSettings {
	/** @param Pages page */
	lastPage = 'last-page',

	/** @param boolean value */
	keepAwake = 'keep-awake'
}

export enum IDBStoreKeysLastInput {
	/** @param number seconds */
	timerStartSeconds = 'timer-start-seconds'
}