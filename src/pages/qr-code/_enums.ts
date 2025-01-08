export const enum Pages {
	scan,
	generate
}

export const enum ErrorCorrectionLevel {
	low = 'L',
	medium = 'M',
	quartile = 'Q',
	high = 'H'
}
export const all_ErrorCorrectionLevel = [
	ErrorCorrectionLevel.low,
	ErrorCorrectionLevel.medium,
	ErrorCorrectionLevel.quartile,
	ErrorCorrectionLevel.high
]

export const enum EncodingMode {
	auto = 'Auto',
	numeric = 'numeric',
	alphanumeric = 'alphanumeric',
	byte = 'byte',
	kanji = 'kanji'
}
export const all_EncodingMode = [
	EncodingMode.auto,
	EncodingMode.numeric,
	EncodingMode.alphanumeric,
	EncodingMode.byte,
	EncodingMode.kanji
]

export const enum CopyFileType {
	png,
	svg
}
export const all_CopyFileType = [
	CopyFileType.png,
	CopyFileType.svg
]

export const enum DownloadFileType {
	png,
	jpeg,
	svg
}
export const all_DownloadFileType = [
	DownloadFileType.png,
	DownloadFileType.jpeg,
	DownloadFileType.svg
]

export const enum Commands {
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