export type ObjectStoreSettings<T = unknown> = {
	key: string
	value: T
}

export type ObjectStoreLastInput<T = unknown> = {
	key: string
	value: T
}

export type ObjectStoreLastOutput<T = unknown> = {
	key: string
	value: T
}

export type ObjectStoreMiscellaneous<T = unknown> = {
	key: string
	value: T
}

export enum ObjectStoreNames {
	settings = 'settings',
	lastInput = 'last-input',
	lastOutput = 'last-output',
	miscellaneous = 'miscellaneous'
}

export enum ObjectStoreKeys {

	/** @param value `string|null` */
	lastInput_basic = 'basic',

	/** @param value `string|null` */
	lastInput_scientific = 'scientific',

	/** @param value `string|null` */
	lastInput_converter = 'converter',

	/** @param value `string|null` */
	lastInput_programmer = 'programmer',

	/** @param value `string` */
	lastInput_dateFrom = 'date-from',

	/** @param value `string` */
	lastInput_dateTo = 'date-to',

	/** @param value `number` */
	lastInput_dateYear = 'date-year',

	/** @param value `number` */
	lastInput_date_month = 'date-month',

	/** @param value `number` */
	lastInput_date_day = 'date-day',

	/** @param value `number | null` */
	lastOutput_basic = 'basic',

	/** @param value `number | null` */
	lastOutput_scientific = 'scientific',

	/** @param value `number | null` */
	lastOutput_converter = 'converter',

	/** @param value `number | null` */
	lastOutput_programmer = 'programmer',

	/** @param value`string | null` */
	lastOutput_date = 'date',

	/** @param {CalculatorType} value `CalculatorType` */
	miscellaneous_lastPage = 'last-page',

	/** @param value `string` */
	miscellaneous_note = 'note',

	/** @param {DecimalNumberFormat} value `DecimalNumberFormat` */
	settings_numberFormatDecimal = 'number-format-decimal',

	/** @param {GroupingNumberFormat} value `GroupingNumberFormat` */
	settings_numberFormatGrouping = 'number-format-grouping',

	/** @param value `boolean` */
	settings_scientificNotation = 'scientific-notation',

	/** @param value `boolean` */
	settings_memoryButtons = 'memory-buttons',

	/** @param {ConverterType} value `ConverterType` */
	settings_converterType = 'converter-type',

	/** @param {ConverterUnit} value `ConverterUnit` */
	settings_converterUnitInput = 'converter-unit-input',

	/** @param {ConverterUnit} value `ConverterUnit` */
	settings_converterUnitOutput = 'converter-unit-output',

	/** @param {ScientificAngleType} value `ScientificAngleType` */
	settings_scientificAngle = 'scientific-angle',

	/** @param {NumberType} value `NumberType` */
	settings_programmerNumberType = 'programmer-number-type',

	/** @param {DateOperation} value `DateOperation` */
	settings_dateOperation = 'date-operation'
}