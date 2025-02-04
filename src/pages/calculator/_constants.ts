import { CalculatorType } from "./_enums"
import { ConverterType } from "./_converter"
import { ICON_ARROW_MINIMIZE_VERTICAL, ICON_ARROW_SORT, ICON_BEAKER, ICON_CALCULATOR, ICON_CALENDAR, ICON_CODE, ICON_CUBE, ICON_DUMBELL, ICON_PULSE, ICON_REMOTE, ICON_RULER, ICON_SQUARE, ICON_TEMPERATURE, ICON_TIMER } from "@/constants/icons"

export const
	SIZE_SIDE_NAVIGATION_NONE = 640,
	SIZE_SIDE_NOTEBOOK_NONE = 760,
	CALCULATOR_TYPES = [
		{ icon: ICON_CALCULATOR, type: CalculatorType.basic, text: 'Basic' },
		{ icon: ICON_BEAKER, type: CalculatorType.scientific, text: 'Scientific' },
		{ icon: ICON_ARROW_SORT, type: CalculatorType.converter, text: 'Converter' },
		{ icon: ICON_CODE, type: CalculatorType.programmer, text: 'Programmer' },
		{ icon: ICON_CALENDAR, type: CalculatorType.date, text: 'Date' },
	],
	KEY_DIVISION = "÷",
	KEY_MULTIPLY = "×",
	KEY_SQUARE_ROOT = "√",
	CONVERTER_TYPES = [
		{ icon: ICON_REMOTE, type: ConverterType.angle, text: 'Angle' },
		{ icon: ICON_SQUARE, type: ConverterType.area, text: 'Area' },
		{ icon: ICON_PULSE, type: ConverterType.frequency, text: 'Frequency' },
		{ icon: ICON_RULER, type: ConverterType.length, text: 'Length' },
		{ icon: ICON_ARROW_MINIMIZE_VERTICAL, type: ConverterType.pressure, text: 'Pressure' },
		{ icon: ICON_TEMPERATURE, type: ConverterType.temperature, text: 'Temperature' },
		{ icon: ICON_TIMER, type: ConverterType.time, text: 'Time' },
		{ icon: ICON_CUBE, type: ConverterType.volume, text: 'Volume' },
		{ icon: ICON_DUMBELL, type: ConverterType.weight, text: 'Weight & Mass' },
	]
;