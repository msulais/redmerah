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
	last_input = 'last_input',
	last_output = 'last_output',
	miscellaneous = 'miscellaneous'
}

export enum ObjectStoreKeys {

	/** @param value `string|null` */
	lastinput_basic = 'basic',

	/** @param value `string|null` */
	lastinput_scientific = 'scientific',

	/** @param value `string|null` */
	lastinput_converter = 'converter',

	/** @param value `string|null` */
	lastinput_programmer = 'programmer',

	/** @param value `string` */
	lastinput_date_from = 'date/from',

	/** @param value `string` */
	lastinput_date_to = 'date/to',

	/** @param value `number` */
	lastinput_date_year = 'date/year',

	/** @param value `number` */
	lastinput_date_month = 'date/month',

	/** @param value `number` */
	lastinput_date_day = 'date/day',

	/** @param value `number | null` */
	lastoutput_basic = 'basic',

	/** @param value `number | null` */
	lastoutput_scientific = 'scientific',

	/** @param value `number | null` */
	lastoutput_converter = 'converter',

	/** @param value `number | null` */
	lastoutput_programmer = 'programmer',

	/** @param value`string | null` */
	lastoutput_date = 'date',

	/** @param {CalculatorType} value `CalculatorType` */
	miscellaneous_lastpage = 'last_page',

	/** @param value `string` */
	miscellaneous_note = 'note',

	/** @param {DecimalNumberFormat} value `DecimalNumberFormat` */
	settings_numberformat_decimal = 'number_format/decimal',

	/** @param {GroupingNumberFormat} value `GroupingNumberFormat` */
	settings_numberformat_grouping = 'number_format/grouping',

	/** @param value `boolean` */
	settings_scientificnotation = 'scientific_notation',

	/** @param value `boolean` */
	settings_memorybuttons = 'memory_buttons',

	/** @param {ConverterType} value `ConverterType` */
	settings_converter_type = 'converter/type',

	/** @param {ConverterUnit} value `ConverterUnit` */
	settings_converter_unitinput = 'converter/unit_input',

	/** @param {ConverterUnit} value `ConverterUnit` */
	settings_converter_unitoutput = 'converter/unit_output',

	/** @param {ScientificAngleType} value `ScientificAngleType` */
	settings_scientific_angle = 'scientific/angle',

	/** @param {NumberType} value `NumberType` */
	settings_programmer_numbertype = 'programmer/number_type',

	/** @param {DateOperation} value `DateOperation` */
	settings_date_operation = 'date/operation'
}