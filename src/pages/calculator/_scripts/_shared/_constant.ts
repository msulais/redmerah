import { IconCodes } from "@/enums/icons"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ConverterType, DateOperation, DecimalNumberFormat, GroupingNumberFormat, NumberType, Pages, ScientificAngleType } from "./_enums"
import { LengthUnits } from "./_units"
import { pxToRem } from "@/utils/css"

export const SCREEN_WIDTH_SMALL = pxToRem(650)
export const DEFAULT_MEMORY = 0
export const DEFAULT_PAGE: Pages = Pages.basic
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_DECIMAL_NUMBER_FORMAT = DecimalNumberFormat.point
export const DEFAULT_GROUPING_NUMBER_FORMAT = GroupingNumberFormat.comma
export const DEFAULT_BASIC_INPUT: string = ''
export const DEFAULT_BASIC_OUTPUT: number | null = null
export const DEFAULT_SCIENTIFIC_ANGLE: ScientificAngleType = ScientificAngleType.RAD
export const DEFAULT_SCIENTIFIC_INPUT: string = ''
export const DEFAULT_SCIENTIFIC_OUTPUT: number | null = null
export const DEFAULT_CONVERTER_INPUT: string = ''
export const DEFAULT_CONVERTER_OUTPUT: number | null = null
export const DEFAULT_CONVERTER_TYPE = ConverterType.length
export const DEFAULT_CONVERTER_INPUT_UNIT = LengthUnits.meter
export const DEFAULT_CONVERTER_OUTPUT_UNIT = LengthUnits.kilometer
export const DEFAULT_PROGRAMMER_NUMBER_TYPE: NumberType = NumberType.decimal
export const DEFAULT_PROGRAMMER_INPUT: string = ''
export const DEFAULT_PROGRAMMER_OUTPUT: number | null = null
export const DEFAULT_DATE_INPUT_YEAR = 0
export const DEFAULT_DATE_INPUT_MONTHS = 0
export const DEFAULT_DATE_INPUT_DAYS = 0
export const DEFAULT_DATE_INPUT_FROM = new Date()
export const DEFAULT_DATE_INPUT_TO = new Date()
export const DEFAULT_DATE_OPERATION: DateOperation = DateOperation.difference
export const DEFAULT_DATE_OUTPUT: string = 'Same date'
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