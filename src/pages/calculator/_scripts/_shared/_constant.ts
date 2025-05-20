import { IconCodes } from "@/enums/icons"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ConverterType, DecimalNumberFormat, GroupingNumberFormat, NumberType, ScientificAngleType } from "./_enums"
import { LengthUnits } from "./_units"

export const SCREEN_WIDTH_SMALL = 650
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_DECIMAL_NUMBER_FORMAT = DecimalNumberFormat.point
export const DEFAULT_GROUPING_NUMBER_FORMAT = GroupingNumberFormat.comma
export const DEFAULT_SCIENTIFIC_ANGLE = ScientificAngleType.RAD
export const DEFAULT_CONVERTER_TYPE = ConverterType.length
export const DEFAULT_CONVERTER_INPUT_UNIT = LengthUnits.meter
export const DEFAULT_CONVERTER_OUTPUT_UNIT = LengthUnits.kilometer
export const DEFAULT_PROGRAMMER_NUMBER_TYPE = NumberType.decimal
export const DIVISION_CHAR = '÷'
export const MULTIPLY_CHAR = '×'
export const SQUARE_ROOT_CHAR = '√'
export const NUMBER_REGEX = String.raw`\d+(?:\.\d+)?`
export const WORD_OPERATOR_REGEX = String.raw`(?:or|xor|and|lsh|rsh|mod)`
export const FUNCTION_REGEX = String.raw`(?:sqrt|not|abs|log|ln|ceil|floor|round|sin|cos|tan|csc|sec|cot|sinh|cosh|tanh|csch|sech|coth|asin|acos|atan|acsc|asec|acot|asinh|acosh|atanh|acsch|asech|acoth)`
export const CONVERTER_TYPES = [
	{ icon: IconCodes.remote, type: ConverterType.angle, text: 'Angle' },
	{ icon: IconCodes.square, type: ConverterType.area, text: 'Area' },
	{ icon: IconCodes.pulse, type: ConverterType.frequency, text: 'Frequency' },
	{ icon: IconCodes.ruler, type: ConverterType.length, text: 'Length' },
	{ icon: IconCodes.arrowMinimizeVertical, type: ConverterType.pressure, text: 'Pressure' },
	{ icon: IconCodes.temperature, type: ConverterType.temperature, text: 'Temperature' },
	{ icon: IconCodes.timer, type: ConverterType.time, text: 'Time' },
	{ icon: IconCodes.cube, type: ConverterType.volume, text: 'Volume' },
	{ icon: IconCodes.dumbell, type: ConverterType.weight, text: 'Weight & Mass' },
].sort((a,b) => a.text.localeCompare(b.text))