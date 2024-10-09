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
	toggle_navigation_expand = 'a',
	toggle_notebook_expand = 'b',

	/**
	@param {GroupingNumberFormat} type `GroupingNumberFormat` */
	change_settings_numberFormatGrouping = 'c',

	/**
	@param {DecimalNumberFormat} type `DecimalNumberFormat` */
	change_settings_numberFormatDecimal = 'd',

	toggle_settings_scientificNotation = 'e',
	toggle_settings_memoryButtons = 'f',

	/**
	@param {string | DateCalculatorInput} value `string | DateCalculatorInput` */
	change_calculator_input = 'g',

	add_memory = 'h',
	subtract_memory = 'i',
	clear_memory = 'j',

	toggle_settings_scientific_angle = 'k',

	/** @param {ConverterType} value `ConverterType` */
	change_settings_converter_type = 'l',

	/**
	@param {ConverterUnit} value `ConverterUnit` */
	change_settings_converter_inputUnit = 'm',

	/**
	@param {ConverterUnit} value `ConverterUnit` */
	change_settings_converter_outputUnit = 'n',
	change_settings_converter_swapUnit = 'o',

	/** @param {NumberType} type `NumberType` */
	change_settings_programmer_numberType = 'p',

	/** @param {DateOperation} operation `DateOperation` */
	change_settings_date_operation = 'q',
}