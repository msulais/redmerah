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
	last_input = 'last_input',
}

export enum ObjectStoreKeys {
	settings_textwrap = 'text_wrap',
	settings_fontsize = 'font_size',
	lastinput_css = 'css',
	lastinput_markdown = 'markdown'
}