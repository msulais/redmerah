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
	settings_minify = 'minify',
	lastInput_sass = 'sass',
	lastInput_scss = 'scss'
}