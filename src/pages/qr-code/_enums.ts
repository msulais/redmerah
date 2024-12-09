export enum Pages {
	scan,
	generate
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
	png,
	svg
}

export enum DownloadFileType {
	png,
	jpeg,
	svg
}

export enum Commands {
	/** @param { Pages } page `Pages` */
	change_page = 'a',

	/** @param { ErrorCorrectionLevel } level `ErrorCorrectionLevel` */
	change_settings_errorcorrectionlevel = 'b',

	/** @param { HEXColor } color `HEXColor` */
	change_settings_color = 'c',

	/** @param { HEXColor } color `HEXColor` */
	change_settings_backgroundcolor = 'd',

	/** @param { number } value `number` */
	change_settings_margin = 'e',

	/** @param { number | null } version `number | null` */
	change_settings_version = 'f',

	/** @param { EncodingMode } mode `EncodingMode` */
	change_settings_encodingmode = 'g',

	/** @param { string } data `string` */
	change_qrcode_data = 'h',

	/** @param { DownloadFileType } type `DownloadFileType` */
	download_qrcode = 'i',

	/**
	@param { Event } event `Event`
	@param { CopyFileType } type `CopyFileType` */
	copy_qrcode = 'j',
}