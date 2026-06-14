import * as BrTheme from '@/web-components/components/br-theme.server.js'
import * as Icons from '@/enums/icons.enum.js'
import { APP_CALCULATOR } from "@/constants/apps"
import { ConverterTypes, DateOperation, DecimalNumberFormat, GroupingNumberFormat, ProgrammerNumTypes, ScientificAngleTypes } from "./calculator"
import { LengthUnits } from "./units"

export const APP = APP_CALCULATOR
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_DECIMAL_NUMBER_FORMAT: DecimalNumberFormat = DecimalNumberFormat.Point
export const DEFAULT_GROUPING_NUMBER_FORMAT: GroupingNumberFormat = GroupingNumberFormat.Comma
export const DEFAULT_BASIC_INPUT: string = ''
export const DEFAULT_BASIC_OUTPUT: number | null = null
export const DEFAULT_SCIENTIFIC_ANGLE: ScientificAngleTypes = ScientificAngleTypes.Radian
export const DEFAULT_SCIENTIFIC_INPUT: string = ''
export const DEFAULT_SCIENTIFIC_OUTPUT: number | null = null
export const DEFAULT_CONVERTER_INPUT: string = ''
export const DEFAULT_CONVERTER_OUTPUT: number | null = null
export const DEFAULT_CONVERTER_TYPE = ConverterTypes.Length
export const DEFAULT_CONVERTER_INPUT_UNIT = LengthUnits.meter
export const DEFAULT_CONVERTER_OUTPUT_UNIT = LengthUnits.kilometer
export const DEFAULT_PROGRAMMER_NUMBER_TYPE: ProgrammerNumTypes = ProgrammerNumTypes.Decimal
export const DEFAULT_PROGRAMMER_INPUT: string = ''
export const DEFAULT_PROGRAMMER_OUTPUT: number | null = null
export const DEFAULT_DATE_INPUT_YEARS = 0
export const DEFAULT_DATE_INPUT_MONTHS = 0
export const DEFAULT_DATE_INPUT_DAYS = 0
export const DEFAULT_DATE_INPUT_FROM = new Date()
export const DEFAULT_DATE_INPUT_TO = new Date()
export const DEFAULT_DATE_OPERATION: DateOperation = DateOperation.Difference
export const DEFAULT_DATE_OUTPUT: string = 'Same date'
export const DEFAULT_MEMORY = 0
export const DIVISION_CHAR = '÷'
export const MULTIPLY_CHAR = '×'
export const SQUARE_ROOT_CHAR = '√'
export const NUMBER_REGEX = String.raw`\d+(?:\.\d+)?`
export const WORD_OPERATOR_REGEX = String.raw`(?:or|xor|and|lsh|rsh|mod)`
export const FUNCTION_REGEX = String.raw`(?:sqrt|not|abs|log|ln|ceil|floor|round|sin|cos|tan|csc|sec|cot|sinh|cosh|tanh|csch|sech|coth|asin|acos|atan|acsc|asec|acot|asinh|acosh|atanh|acsch|asech|acoth)`
export const CONVERTER_TYPES = [
	{ icon: Icons.Remote, type: ConverterTypes.Angle, text: 'Angle' },
	{ icon: Icons.Square, type: ConverterTypes.Area, text: 'Area' },
	{ icon: Icons.Pulse, type: ConverterTypes.Frequency, text: 'Frequency' },
	{ icon: Icons.Ruler, type: ConverterTypes.Length, text: 'Length' },
	{ icon: Icons.ArrowMinimizeVertical, type: ConverterTypes.Pressure, text: 'Pressure' },
	{ icon: Icons.Temperature, type: ConverterTypes.Temperature, text: 'Temperature' },
	{ icon: Icons.Timer, type: ConverterTypes.Time, text: 'Time' },
	{ icon: Icons.Cube, type: ConverterTypes.Volume, text: 'Volume' },
	{ icon: Icons.Dumbbell, type: ConverterTypes.Weight, text: 'Weight & Mass' },
].sort((a,b) => a.text.localeCompare(b.text))