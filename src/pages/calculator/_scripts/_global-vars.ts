import { DecimalNumberFormat, GroupingNumberFormat, ScientificAngleType, DateOperation, NumberType, ConverterType, LengthUnits } from "./_enums"
import type { Settings } from "./_types"

// G_SETTINGS
let _decimalFormat = DecimalNumberFormat.point
let _groupingFormat = GroupingNumberFormat.comma
let _converterType = ConverterType.length
let _converterInputUnit = LengthUnits.meter
let _converterOutputUnit = LengthUnits.kilometer
let _scientificAngle = ScientificAngleType.RAD
let _programmerNumberType = NumberType.decimal
let _dateOperation = DateOperation.difference

export const G_SETTINGS: Settings = {
	get decimalFormat() { return _decimalFormat },
	set decimalFormat(v) { _decimalFormat = v },

	get groupingFormat() { return _groupingFormat },
	set groupingFormat(v) { _groupingFormat = v },

	converter: {
		get type(){ return _converterType },
		set type(v){ _converterType = v },

		get inputUnit(){ return _converterInputUnit },
		set inputUnit(v){ _converterInputUnit = v },

		get outputUnit() { return _converterOutputUnit },
		set outputUnit(v) { _converterOutputUnit = v }
	},
	scientific: {
		get angle() { return _scientificAngle },
		set angle(v) { _scientificAngle = v },
	},
	programmer: {
		get numberType() { return _programmerNumberType },
		set numberType(v) { _programmerNumberType = v },
	},
	date: {
		get operation() { return _dateOperation },
		set operation(v) { _dateOperation = v },
	}
}