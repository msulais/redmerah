import { CalculatorType } from "./_enums"
import { ConverterType } from "./_converter"

export const
	SIZE_SIDE_NAVIGATION_NONE = 640,
	SIZE_SIDE_NOTEBOOK_NONE = 760,
	CALCULATOR_TYPES = [
		{ icon: 0xE2C6, type: CalculatorType.basic, text: 'Basic' },
		{ icon: 0xE1C1, type: CalculatorType.scientific, text: 'Scientific' },
		{ icon: 0xE123, type: CalculatorType.converter, text: 'Converter' },
		{ icon: 0xE4A8, type: CalculatorType.programmer, text: 'Programmer' },
		{ icon: 0xE2CC, type: CalculatorType.date, text: 'Date' },
	],
	KEY_DIVISION = "÷",
	KEY_MULTIPLY = "×",
	KEY_SQUARE_ROOT = "√",
	CONVERTER_TYPES = [
		{ icon: 0xED6B, type: ConverterType.angle, text: 'Angle' },
		{ icon: 0xE82F, type: ConverterType.area, text: 'Area' },
		{ icon: 0xED15, type: ConverterType.frequency, text: 'Frequency' },
		{ icon: 0xED9B, type: ConverterType.length, text: 'Length' },
		{ icon: 0xE0F5, type: ConverterType.pressure, text: 'Pressure' },
		{ icon: 0xF048, type: ConverterType.temperature, text: 'Temperature' },
		{ icon: 0xF1DD, type: ConverterType.time, text: 'Time' },
		{ icon: 0xE252, type: ConverterType.volume, text: 'Volume' },
		{ icon: 0xE731, type: ConverterType.weight, text: 'Weight & Mass' },
	]
;