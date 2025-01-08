export type IDBStoreSettings<T = unknown> = {
	key: IDBStoreKeysSettings
	value: T
}

export type IDBStoreLastInput<T = unknown> = {
	key: IDBStoreKeysLastInput
	value: T
}

export const enum IDBStoreNames {
	settings = 'settings',
	last_input = 'last_input',
}

export const enum IDBStoreKeysSettings {
	mode = 'mode'
}

export const enum IDBStoreKeysLastInput {
	/** @param hex `HEXColor` */
	hex_color = 'hex_color'
}