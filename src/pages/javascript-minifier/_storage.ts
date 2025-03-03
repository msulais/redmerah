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
	settings_minifyBeautify = 'minify-beautify',
	settings_minifyEcma = 'minify-ecma',
	settings_minifyModule = 'minify-module',
	settings_minifyToplevel = 'minify-toplevel',
	settings_minifyIE8 = 'minify-ie8',
	settings_minifyKeepClassNames = 'minify-keep-class-names',
	settings_minifyKeepFunctionNames = 'minify-keep-function-names',
	settings_minifySafari10 = 'minify-safari10',

	lastInput_inputText = 'input-text'
}