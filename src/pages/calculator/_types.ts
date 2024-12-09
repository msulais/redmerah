import type { ConverterType, ConverterUnit } from "./_converter"
import type { DateOperation, DecimalNumberFormat, GroupingNumberFormat, NumberType, ScientificAngleType } from "./_enums"

export type Settings = {
	number_format: {
		decimal: DecimalNumberFormat
		grouping: GroupingNumberFormat
	}
	scientific_notation: boolean
	memory_buttons: boolean
	converter: {
		type: ConverterType
		unit_input: ConverterUnit
		unit_output: ConverterUnit
	}
	scientific: {
		angle: ScientificAngleType
	}
	programmer: {
		number_type: NumberType
	}
	date: {
		operation: DateOperation
	}
}

export type DateCalculatorInput = {
	from: Date
	to: Date
	year: number
	month: number
	day: number
}

export type CalculatorInput = {
	basic: string
	scientific: string
	converter: string
	programmer: string
	date: DateCalculatorInput
}

export type CalculatorOutput = {
	basic: number | null
	scientific: number | null
	converter: number | null
	programmer: number | null
	date: string | null
}