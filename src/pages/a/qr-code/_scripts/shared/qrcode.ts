export const ErrorCorrectionLevel = {
	Low: 'L',
	Medium: 'M',
	Quartile: 'Q',
	High: 'H'
} as const
export type ErrorCorrectionLevel = typeof ErrorCorrectionLevel[keyof typeof ErrorCorrectionLevel]

export const EncodingMode = {
	Auto: 'Auto',
	Numeric: 'numeric',
	Alphanumeric: 'alphanumeric',
	Byte: 'byte',
	Kanji: 'kanji'
} as const
export type EncodingMode = typeof EncodingMode[keyof typeof EncodingMode]