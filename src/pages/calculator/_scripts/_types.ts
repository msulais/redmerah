import type { NumberType } from "@/pages/_calculator/_enums"
import type { Commands, ConverterType, DateOperation, DecimalNumberFormat, GroupingNumberFormat, Pages, ScientificAngleType } from "./_enums"
import type { ConverterUnit } from "./classes"

export type ConverterUnitType = {
	name: string
	symbol: string
	value: number
}

export type CommandDetail = {
	type: Commands
}

export type CommandChangeProgrammerTypeDetail = CommandDetail & {
	programmer: NumberType
}

export type CommandChangeConverterTypeDetail = CommandDetail & {
	converter: ConverterType
	inputUnit: ConverterUnit
	outputUnit: ConverterUnit
}

export type CommandChangeUnitDetail = CommandDetail & {
	unit: ConverterUnit
}

export type CommandChangePageDetail = CommandDetail & {
	page: Pages
}

export type CommandKeyCharDetail = CommandDetail & {
	char: string
}

export type CommandChangeDecimalFormatDetail = CommandDetail & {
	format: DecimalNumberFormat
}

export type CommandChangeGroupingFormatDetail = CommandDetail & {
	format: GroupingNumberFormat
}

export type CommandScientificAngleDetail = CommandDetail & {
	angle: ScientificAngleType
}

export type Settings = {
	decimalFormat: DecimalNumberFormat
	groupingFormat: GroupingNumberFormat
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