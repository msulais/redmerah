export const ScientificAngleTypes = {
	Radian : 'RAD',
	Degree : 'DEG',
	Gradian: 'GRAD',
} as const
export type ScientificAngleTypes = typeof ScientificAngleTypes[keyof typeof ScientificAngleTypes]

export const ConverterTypes = {
	Length     : 'length',
	Area       : 'area',
	Volume     : 'volume',
	Temperature: 'temperature',
	Time       : 'time',
	Weight     : 'weight',
	Frequency  : 'frequency',
	Pressure   : 'pressure',
	Angle      : 'angle',
} as const
export type ConverterTypes = typeof ConverterTypes[keyof typeof ConverterTypes]

export const ProgrammerNumTypes = {
	Decimal    : 'decimal',
	Hexadecimal: 'hexadecimal',
	Octal      : 'octal',
	Binary     : 'binary',
} as const
export type ProgrammerNumTypes = typeof ProgrammerNumTypes[keyof typeof ProgrammerNumTypes]

export const DateOperation = {
	Add       : 'add',
	Subtract  : 'subtract',
	Difference: 'difference'
} as const
export type DateOperation = typeof DateOperation[keyof typeof DateOperation]

export const GroupingNumberFormat = {
	Point     : '.',
	Comma     : ',',
	None      : '',
	Space     : ' ',
	Underscore: '_'
} as const
export type GroupingNumberFormat = typeof GroupingNumberFormat[keyof typeof GroupingNumberFormat]

export const DecimalNumberFormat = {
	Point: '.',
	Comma: ','
} as const
export type DecimalNumberFormat = typeof DecimalNumberFormat[keyof typeof DecimalNumberFormat]