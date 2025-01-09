export enum Pages {
	scan = 'scan',
	generate = 'generate'
}

export enum ErrorCorrectionLevel {
	low = 'L',
	medium = 'M',
	quartile = 'Q',
	high = 'H'
}

export enum EncodingMode {
	auto = 'Auto',
	numeric = 'numeric',
	alphanumeric = 'alphanumeric',
	byte = 'byte',
	kanji = 'kanji'
}

export enum CopyFileType {
	png = 'png',
	svg = 'svg'
}

export enum DownloadFileType {
	png = 'png',
	jpeg = 'svg',
	svg = 'svg'
}

export enum Commands {
	/** @param { Pages } page `Pages` */
	change_page,

	/** @param { ErrorCorrectionLevel } level `ErrorCorrectionLevel` */
	change_settings_errorcorrectionlevel,

	/** @param { HEXColor } color `HEXColor` */
	change_settings_color,

	/** @param { HEXColor } color `HEXColor` */
	change_settings_backgroundcolor,

	/** @param { number } value `number` */
	change_settings_margin,

	/** @param { number | null } version `number | null` */
	change_settings_version,

	/** @param { EncodingMode } mode `EncodingMode` */
	change_settings_encodingmode,

	/** @param { string } data `string` */
	change_qrcode_data,

	/** @param { DownloadFileType } type `DownloadFileType` */
	download_qrcode,

	/**
	@param { Event } event `Event`
	@param { CopyFileType } type `CopyFileType` */
	copy_qrcode,
}