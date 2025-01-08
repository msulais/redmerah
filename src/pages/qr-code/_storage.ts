export type ObjectStoreSettings<T = unknown> = {
	key: string
	value: T
}

export type ObjectStoreMiscellaneous<T = unknown> = {
	key: string
	value: T
}

export const enum ObjectStoreNames {
	settings = 'settings',
	miscellaneous = 'miscellaneous'
}

export const enum ObjectStoreKeys {
	/** @param value `Pages` */
	miscellaneous_lastpage = 'last_page',

	/** @param value `HEXColor` */
	settings_backgroundcolor = 'background_color',

	/** @param value `HEXColor` */
	settings_color = 'color',

	/** @param value `number` */
	settings_margin = 'margin',

	/** @param value `1-40 | null` */
	settings_version = 'version',

	/** @param value `ErrorCorrectionLevel` */
	settings_errorcorrectionlevel = 'error_correction_level',

	/** @param value `EncodingMode` */
	settings_encodingmode = 'encoding_mode',
}