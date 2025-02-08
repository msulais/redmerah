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
	lastInput_css = 'css',
	lastinput_markdown = 'markdown'
}