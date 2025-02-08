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
	mode = 'mode'
}

export enum IDBStoreKeysLastInput {
	/** @param hex `HEXColor` */
	hexColor = 'hex-color'
}