export type ObjectStoreSettings<T = unknown> = {
	key: string
	value: T
}

export type ObjectStoreMiscellaneous<T = unknown> = {
	key: string
	value: T
}

export enum ObjectStoreNames {
	settings = 'settings',
	miscellaneous = 'miscellaneous'
}

export enum ObjectStoreKeys {
	/** @param value `Pages` */
	miscellaneous_lastPage = 'last-page',

	/** @param value `HEXColor` */
	settings_backgroundColor = 'background-color',

	/** @param value `HEXColor` */
	settings_color = 'color',

	/** @param value `number` */
	settings_margin = 'margin',

	/** @param value `1-40 | null` */
	settings_version = 'version',

	/** @param value `ErrorCorrectionLevel` */
	settings_errorCorrectionLevel = 'error-correction-level',

	/** @param value `EncodingMode` */
	settings_encodingMode = 'encoding-mode',
}