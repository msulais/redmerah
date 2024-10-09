import type { ConverterType, ConverterUnit } from "./_converter"
import type { DateOperation, DecimalNumberFormat, GroupingNumberFormat, NumberType, ScientificAngleType } from "./_enums"

export type Settings = {
	numberFormat: {
		decimal: DecimalNumberFormat
		grouping: GroupingNumberFormat
	}
	scientificNotation: boolean
	memoryButtons: boolean
	converter: {
		type: ConverterType
		inputUnit: ConverterUnit
		outputUnit: ConverterUnit
	}
	scientific: {
		angle: ScientificAngleType
	}
	programmer: {
		numberType: NumberType
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