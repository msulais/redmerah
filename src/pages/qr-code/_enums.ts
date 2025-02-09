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
	updatePage,

	/** @param { ErrorCorrectionLevel } level `ErrorCorrectionLevel` */
	updateSettingsErrorCorrectionLevel,

	/** @param { HEXColor } color `HEXColor` */
	updateSettingsColor,

	/** @param { HEXColor } color `HEXColor` */
	updateSettingsBackgroundColor,

	/** @param { number } value `number` */
	updateSettingsMargin,

	/** @param { number | null } version `number | null` */
	updateSettingsVersion,

	/** @param { EncodingMode } mode `EncodingMode` */
	updateSettingsEncodingMode,

	/** @param { string } data `string` */
	updateQRCodeData,

	/** @param { DownloadFileType } type `DownloadFileType` */
	downloadQRCode,

	/**
	@param { CopyFileType } type `CopyFileType` */
	copyQRCode,
}