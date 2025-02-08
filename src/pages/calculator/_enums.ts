export enum DecimalNumberFormat {
	point = '.',
	comma = ','
}

export enum NumberType {
	decimal = 'decimal',
	hexadecimal = 'hexadecimal',
	octal = 'octal',
	binary = 'binary',
}

export enum GroupingNumberFormat {
	point = '.',
	comma = ',',
	none = '',
	space = ' ',
	underscore = '_'
}

export enum DateOperation {
	add = 'add',
	subtract = 'subtract',
	difference = 'difference'
}

export enum ScientificAngleType {
	RAD = 'RAD',
	DEG = 'DEG',
	GRAD = 'GRAD'
}

export enum CalculatorType {
	basic = 'basic',
	scientific = 'scientific',
	converter = 'converter',
	programmer = 'programmer',
	date = 'date'
}

export enum Commands {
	toggleNavigationExpand,
	toggleNotebookExpand,

	/**
	@param {GroupingNumberFormat} type `GroupingNumberFormat` */
	updateSettingsNumberFormatGrouping,

	/**
	@param {DecimalNumberFormat} type `DecimalNumberFormat` */
	updateSettingsNumberFormatDecimal,

	toggleSettingsScientificNotation,
	toggleSettingsMemoryButtons,

	/**
	@param {string | DateCalculatorInput} value `string | DateCalculatorInput` */
	updateCalculatorInput,

	addMemory,
	subtractMemory,
	clearMemory,

	toggleSettingsScientificAngle,

	/** @param {ConverterType} value `ConverterType` */
	updateSettingsConverterType,

	/**
	@param {ConverterUnit} value `ConverterUnit` */
	updateSettingsConverterInputUnit,

	/**
	@param {ConverterUnit} value `ConverterUnit` */
	updateSettingsConverterOutputUnit,
	swapConverterUnits,

	/** @param {NumberType} type `NumberType` */
	updateSettingsProgrammerNumberType,

	/** @param {DateOperation} operation `DateOperation` */
	updateSettingsDateOperation,
}