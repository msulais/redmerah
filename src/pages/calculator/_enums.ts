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
	toggle_navigation_expand,
	toggle_notebook_expand,

	/**
	@param {GroupingNumberFormat} type `GroupingNumberFormat` */
	change_settings_numberformatgrouping,

	/**
	@param {DecimalNumberFormat} type `DecimalNumberFormat` */
	change_settings_numberformatdecimal,

	toggle_settings_scientificnotation,
	toggle_settings_memorybuttons,

	/**
	@param {string | DateCalculatorInput} value `string | DateCalculatorInput` */
	change_calculator_input,

	add_memory,
	subtract_memory,
	clear_memory,

	toggle_settings_scientific_angle,

	/** @param {ConverterType} value `ConverterType` */
	change_settings_converter_type,

	/**
	@param {ConverterUnit} value `ConverterUnit` */
	change_settings_converter_inputunit,

	/**
	@param {ConverterUnit} value `ConverterUnit` */
	change_settings_converter_outputunit,
	change_settings_converter_swapunit,

	/** @param {NumberType} type `NumberType` */
	change_settings_programmer_numbertype,

	/** @param {DateOperation} operation `DateOperation` */
	change_settings_date_operation,
}