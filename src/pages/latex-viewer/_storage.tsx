export type ObjectStoreSettings<T = unknown> = {
	key: string
	value: T
}

export type ObjectStoreLastInput<T = unknown> = {
	key: ObjectStoreKeys
	value: T
}

export enum ObjectStoreNames {
	settings = 'settings',
	lastInput = 'last-input',
}

export enum ObjectStoreKeys {
	settings_textWrap = 'text-wrap',
	settings_fontSize = 'font-size',
	settings_suffix = 'suffix',
	settings_prefix = 'prefix',
	lastInput_latex = 'latex'
}