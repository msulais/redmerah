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
	lastInput = 'lastInput',
}

export enum ObjectStoreKeys {
	settings_textWrap = 'textWrap',
	settings_fontSize = 'fontSize',
	settings_suffix = 'suffix',
	settings_prefix = 'prefix',
	lastInput_latex = 'latex'
}