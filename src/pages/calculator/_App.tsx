import { createMemo, createSignal, onMount, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { CalculatorInput, CalculatorOutput, DateCalculatorInput, Settings } from "./_types"
import { _calculator, _basic, _point, _comma, _length, _RAD, _decimal, _difference, _scientific, _converter, _programmer, _date, _writeObjectStore, _miscellaneous, _put, _settings, _lastInput, _numberFormat, _grouping, _push, _scientificNotation, _memoryButtons, _from, _toISOString, _to, _year, _month, _day, _angle, _DEG, _GRAD, _type, _area, _volume, _temperature, _time, _weight, _frequency, _pressure, _JSON, _equals, _inputUnit, _outputUnit, _numberType, _test, _toString, _toUpperCase, _hexadecimal, _octal, _binary, _replace, _operation, _repeat, _replaceAll, _raw, _warn, _PI, _value, _add, _subtract, _not, _abs, _log, _ln, _ceil, _floor, _round, _sqrt, _sin, _cos, _tan, _csc, _sec, _cot, _sinh, _cosh, _tanh, _csch, _sech, _coth, _asin, _acos, _atan, _acsc, _asec, _acot, _asinh, _acosh, _atanh, _acsch, _asech, _acoth, _match, _pow, _lastOutput, _readObjectStore, _get, _then, _parseJSON, _parse, _open, _createObjectStore, _key, _remove, _splash, _animate, _finished, _spring } from "@/constants/string"
import { CalculatorType, Commands, DateOperation, DecimalNumberFormat, GroupingNumberFormat, NumberType, ScientificAngleType } from "./_enums"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, type ObjectStoreLastInput, type ObjectStoreLastOutput, type ObjectStoreMiscellaneous, ObjectStoreNames, type ObjectStoreSettings } from "./_storage"
import { dateDifferenceInDays, getCurrentDate, getDate_D, getDate_M, getDate_Y, getDateString_YMD } from "@/utils/datetime"
import { endTimeout, startTimeout } from "@/utils/timeout"
import { stringCount, stringReverse } from "@/utils/string"
import { KEY_DIVISION, KEY_MULTIPLY } from "./_constants"
import { floatToBinary, formatNumber, mathAbs, mathACos, mathACosH, mathACot, mathACotH, mathACsc, mathACscH, mathASec, mathASecH, mathASin, mathASinH, mathATan, mathATanH, mathCeil, mathCos, mathCosH, mathCot, mathCotH, mathCsc, mathCscH, mathFloor, mathLn, mathLog, mathNot, mathRound, mathSec, mathSecH, mathSin, mathSinH, mathSqrt, mathTan, mathTanH, numberParse, numberToRealDigit } from "@/utils/math"
import { getMath, mathE, mathPI } from "@/constants/math"
import { getConsole } from "@/constants/window"
import { ConverterType, ConverterUnit, UNIT_ANGLE, UNIT_ANGLE_DEGREE, UNIT_ANGLE_GRADIAN, UNIT_ANGLE_RADIAN, UNIT_AREA, UNIT_FREQUENCY, UNIT_LENGTH, UNIT_LENGTH_KILOMETER, UNIT_LENGTH_METER, UNIT_PRESSURE, UNIT_TEMPERATURE, UNIT_TEMPERATURE_CELCIUS, UNIT_TEMPERATURE_DELISLE, UNIT_TEMPERATURE_FAHRENHEIT, UNIT_TEMPERATURE_KELVIN, UNIT_TEMPERATURE_RANKINE, UNIT_TEMPERATURE_REAMUR, UNIT_TEMPERATURE_ROMER, UNIT_TIME, UNIT_VOLUME, UNIT_WEIGHT, type ConverterUnitType } from "./_converter"
import { FUNCTION_REGEX, NUMBER_REGEX } from "./_regex"
import { removeSplashScreen } from "@/scripts/splash"

import App from "@/components/App"
import AppBar from "./_AppBar"
import SideNavigation from './_SideNavigation'
import Notebook from './_Notebook'
import InputOutput from './_InputOutput'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames[_calculator])
	const [isSideNavigationExpanded, setIsSideNavigationExpanded] = createSignal<boolean>(true)
	const [isNotebookExpanded, setIsNotebookExpanded] = createSignal<boolean>(false)
	const [calculator, setCalculatorType] = createSignal<CalculatorType>(CalculatorType[_basic])
	const [note, setNote] = createSignal<string>('')
	const [memory, setMemory] = createSignal<number>(0)
	const [settings, setSettings] = createStore<Settings>({
		numberFormat: {
			decimal: DecimalNumberFormat[_point],
			grouping: GroupingNumberFormat[_comma]
		},
		converter: {
			type: ConverterType[_length],
			inputUnit: UNIT_LENGTH_METER,
			outputUnit: UNIT_LENGTH_KILOMETER
		},
		scientific: {
			angle: ScientificAngleType[_RAD]
		},
		programmer: {
			numberType: NumberType[_decimal]
		},
		date: {
			operation: DateOperation[_difference]
		},
		scientificNotation: false,
		memoryButtons: true
	})
	const [inputs, setInputs] = createStore<CalculatorInput>({
		basic: '',
		converter: '',
		scientific: '',
		programmer: '',
		date: {
			from: getCurrentDate(),
			to: getCurrentDate(),
			year: 0,
			day: 0,
			month: 0
		}
	})
	const [outputs, setOutputs] = createStore<CalculatorOutput>({
		basic: null,
		converter: null,
		scientific: null,
		programmer: null,
		date: null
	})
	const getOutput = createMemo<number | string | null>(() => {
		if (calculator() == CalculatorType[_basic]) return outputs[_basic]
		if (calculator() == CalculatorType[_scientific]) return outputs[_scientific]
		if (calculator() == CalculatorType[_converter]) return outputs[_converter]
		if (calculator() == CalculatorType[_programmer]) return outputs[_programmer]
		if (calculator() == CalculatorType[_date]) return outputs[_date]
		return null
	})
	const getInput = createMemo<string | {from: Date;to: Date}>(() => {
		if (calculator() == CalculatorType[_basic]) return inputs[_basic]
		if (calculator() == CalculatorType[_scientific]) return inputs[_scientific]
		if (calculator() == CalculatorType[_converter]) return inputs[_converter]
		if (calculator() == CalculatorType[_programmer]) return inputs[_programmer]
		if (calculator() == CalculatorType[_date]) return inputs[_date]
		return ''
	})
	let timeoutId: null | number = null
	let timeoutNoteId: null | number = null

	function onChangeCalculator(type: CalculatorType): void {
		setCalculatorType(type)
		const store_miscellaneous = db[_writeObjectStore](ObjectStoreNames[_miscellaneous])
		if (store_miscellaneous == null) return

		store_miscellaneous[_put]({
			key: ObjectStoreKeys.miscellaneous_lastPage,
			value: type
		})
	}

	function onNoteChanged(value: string): void {
		setNote(value)
		if (timeoutNoteId != null) endTimeout(timeoutNoteId)
		timeoutNoteId = startTimeout(() => {
			timeoutNoteId = null
			const store_miscellaneous = db[_writeObjectStore](ObjectStoreNames[_miscellaneous])
			if (store_miscellaneous == null) return

			store_miscellaneous[_put]({key: ObjectStoreKeys.miscellaneous_note, value})
		}, 1000)
	}

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_settings = db[_writeObjectStore](ObjectStoreNames[_settings])
		if (!store_settings) return;

		for (const item of items) {
			store_settings[_put]({ key: item[0], value: item[1] })
		}
	}

	function saveInputs(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_lastInput = db[_writeObjectStore](ObjectStoreNames[_lastInput])
		if (!store_lastInput) return;

		for (const item of items) {
			store_lastInput[_put]({ key: item[0], value: item[1] })
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown {

		// toggle_navigation_expand
		if (type == Commands.toggle_navigation_expand) {
			setIsSideNavigationExpanded(v => !v)
			if (isSideNavigationExpanded()) setIsNotebookExpanded(false)
		}

		// toggle_notebook_expand
		else if (type == Commands.toggle_notebook_expand) {
			setIsNotebookExpanded(v => !v)
			if (isNotebookExpanded()) setIsSideNavigationExpanded(false)
		}

		// change_settings_numberFormatGrouping
		else if (type == Commands.change_settings_numberFormatGrouping) {
			const items: [key: ObjectStoreKeys, value: unknown][] = [[ObjectStoreKeys.settings_numberFormat_grouping, args[0]]]

			setSettings(_numberFormat, _grouping, args[0] as GroupingNumberFormat)
			if (args[0] == settings[_numberFormat][_decimal]) {
				setSettings(
					_numberFormat,
					_decimal,
					args[0] == GroupingNumberFormat[_comma]
						? DecimalNumberFormat[_point]
						: DecimalNumberFormat[_comma]
				)
				items[_push]([ObjectStoreKeys.settings_numberFormat_decimal, settings[_numberFormat][_decimal]])
			}

			saveSettings(...items)
		}

		// change_settings_numberFormatDecimal
		else if (type == Commands.change_settings_numberFormatDecimal) {
			const items: [key: ObjectStoreKeys, value: unknown][] = [[ObjectStoreKeys.settings_numberFormat_decimal, args[0]]]

			setSettings(_numberFormat, _decimal, args[0] as DecimalNumberFormat)
			if (args[0] == settings[_numberFormat][_grouping]) {
				setSettings(_numberFormat, _grouping, args[0] == DecimalNumberFormat[_comma]? GroupingNumberFormat[_point] : GroupingNumberFormat[_comma])
				items[_push]([ObjectStoreKeys.settings_numberFormat_grouping, settings[_numberFormat][_grouping]])
			}

			saveSettings(...items)
		}

		// toggle_settings_scientificNotation
		else if (type == Commands.toggle_settings_scientificNotation) {
			setSettings(_scientificNotation, v => !v)
			saveSettings([ObjectStoreKeys.settings_scientificNotation, settings[_scientificNotation]])
		}

		// toggle_settings_memoryButtons
		else if (type == Commands.toggle_settings_memoryButtons) {
			setSettings(_memoryButtons, v => !v)
			saveSettings([ObjectStoreKeys.settings_memoryButtons, settings[_memoryButtons]])
		}

		// change_calculator_input
		else if (type == Commands.change_calculator_input) {
			if (timeoutId) endTimeout(timeoutId)
			const value = args[0]

			timeoutId = startTimeout(() => {
				if (calculator() == CalculatorType[_basic]) {
					setInputs(_basic, value as string)
					saveInputs([ObjectStoreKeys.lastInput_basic, value])
				}
				else if (calculator() == CalculatorType[_scientific]) {
					setInputs(_scientific, value as string)
					saveInputs([ObjectStoreKeys.lastInput_scientific, value])
				}
				else if (calculator() == CalculatorType[_converter]) {
					setInputs(_converter, value as string)
					saveInputs([ObjectStoreKeys.lastInput_converter, value])
				}
				else if (calculator() == CalculatorType[_programmer]) {
					setInputs(_programmer, value as string)
					saveInputs([ObjectStoreKeys.lastInput_programmer, value])
				}
				else if (calculator() == CalculatorType[_date]) {
					const $value = value as DateCalculatorInput
					setInputs(_date, {...$value})
					saveInputs(
						[ObjectStoreKeys.lastInput_date_from, $value[_from][_toISOString]()],
						[ObjectStoreKeys.lastInput_date_to, $value[_to][_toISOString]()],
						[ObjectStoreKeys.lastInput_date_year, $value[_year]],
						[ObjectStoreKeys.lastInput_date_month, $value[_month]],
						[ObjectStoreKeys.lastInput_date_day, $value[_day]],
					)
				}
				generateOutput()
				timeoutId = null
			}, 300)
		}

		// add_memory
		else if (type == Commands.add_memory) {
			if (getOutput() == null) return;
			setMemory(v => v + (getOutput() as number))
		}

		// subtract_memory
		else if (type == Commands.subtract_memory) {
			if (getOutput() == null) return;
			setMemory(v => v - (getOutput() as number))
		}

		// clear_memory
		else if (type == Commands.clear_memory) {
			setMemory(0)
		}

		// toggle_settings_scientific_angle
		else if (type == Commands.toggle_settings_scientific_angle) {
			let value: ScientificAngleType = ScientificAngleType[_RAD]
			const angle = settings[_scientific][_angle]
			if (angle == ScientificAngleType[_RAD]) value = ScientificAngleType[_DEG]
			else if (angle == ScientificAngleType[_DEG]) value = ScientificAngleType[_GRAD]
			else if (angle == ScientificAngleType[_GRAD]) value = ScientificAngleType[_RAD]
			setSettings(_scientific, _angle, value)
			saveSettings([ObjectStoreKeys.settings_scientific_angle, value])

			if (timeoutId) endTimeout(timeoutId)
			timeoutId = startTimeout(() => {
				generateOutput()
				timeoutId = null
			}, 300)
		}

		// change_settings_converter_type
		else if (type == Commands.change_settings_converter_type) {
			const converter = args[0] as ConverterType
			if (converter == settings[_converter][_type]) return;

			let units: ConverterUnit[] = UNIT_LENGTH
			if (converter == ConverterType[_length]) units = UNIT_LENGTH
			else if (converter == ConverterType[_area]) units = UNIT_AREA
			else if (converter == ConverterType[_volume]) units = UNIT_VOLUME
			else if (converter == ConverterType[_temperature]) units = UNIT_TEMPERATURE
			else if (converter == ConverterType[_time]) units = UNIT_TIME
			else if (converter == ConverterType[_weight]) units = UNIT_WEIGHT
			else if (converter == ConverterType[_frequency]) units = UNIT_FREQUENCY
			else if (converter == ConverterType[_pressure]) units = UNIT_PRESSURE
			else if (converter == ConverterType[_angle]) units = UNIT_ANGLE

			setSettings(_converter, {type: converter, inputUnit: units[0], outputUnit: units[1]})
			saveSettings(
				[ObjectStoreKeys.settings_converter_type, converter],
				[ObjectStoreKeys.settings_converter_inputUnit, units[0][_JSON]],
				[ObjectStoreKeys.settings_converter_outputUnit, units[1][_JSON]],
			)
			generateOutput()
		}

		// change_settings_converter_inputUnit
		else if (type == Commands.change_settings_converter_inputUnit) {
			const unit = args[0] as ConverterUnit
			if (unit[_equals](settings[_converter][_inputUnit])) return;

			setSettings(_converter, _inputUnit, unit)
			saveSettings([ObjectStoreKeys.settings_converter_inputUnit, unit[_JSON]])
			generateOutput()
		}

		// change_settings_converter_outputUnit
		else if (type == Commands.change_settings_converter_outputUnit) {
			const unit = args[0] as ConverterUnit
			if (unit[_equals](settings[_converter][_outputUnit])) return;

			setSettings(_converter, _outputUnit, unit)
			saveSettings([ObjectStoreKeys.settings_converter_outputUnit, unit[_JSON]])
			generateOutput()
		}

		// change_settings_converter_swapUnit
		else if (type == Commands.change_settings_converter_swapUnit) {
			const inputUnit = settings[_converter][_outputUnit]
			const outputUnit = settings[_converter][_inputUnit]
			setSettings(_converter, c => {return {...c, inputUnit, outputUnit}})
			saveSettings(
				[ObjectStoreKeys.settings_converter_inputUnit, inputUnit[_JSON]],
				[ObjectStoreKeys.settings_converter_outputUnit, outputUnit[_JSON]],
			)
			generateOutput()
		}

		// change_settings_programmer_numberType
		else if (type == Commands.change_settings_programmer_numberType) {
			const type = args[0] as NumberType
			const settingKeys: [key: ObjectStoreKeys, value: unknown][] = [
				[ObjectStoreKeys.settings_programmer_numberType, type]
			]
			if (type == settings[_programmer][_numberType]) return;

			let input: null | string = null
			if (outputs[_programmer] != null){
				if (type == NumberType[_decimal]) {
					if (settings[_scientificNotation] && /[eE]/[_test](outputs[_programmer][_toString]()))
						input = outputs[_programmer][_toString]()[_toUpperCase]()
					else input = formatNumber(outputs[_programmer], {
						decimalSeparator: settings[_numberFormat][_decimal],
						thousandSeparator: settings[_numberFormat][_grouping]
					})
				}
				else {
					if (type == NumberType[_hexadecimal]) input = numberParse(floatToBinary(outputs[_programmer]), true, 2)[_toString](16)[_toUpperCase]()
					else if (type == NumberType[_octal]) input = numberParse(floatToBinary(outputs[_programmer]), true, 2)[_toString](8)
					else if (type == NumberType[_binary]) input = floatToBinary(outputs[_programmer])

					input = input![_replace](/\./g, settings[_numberFormat][_decimal])
				}

				settingKeys[_push]([ObjectStoreKeys.lastInput_programmer, input ?? ''])
				setInputs(_programmer, input ?? '')
			}

			setSettings(_programmer, _numberType, type)
			saveSettings(...settingKeys)
		}

		// change_settings_date_operation
		else if (type == Commands.change_settings_date_operation) {
			setSettings(_date, _operation, args[0] as DateOperation)
			saveSettings([ObjectStoreKeys.settings_date_operation, args[0]])
			generateOutput()
		}
		return
	}

	/**
	 * Repair input before calculating. The `input` must follow these rules:
	 *
	 * * If `input` include `e` (e.g. 2.324e+34), the `e` must convert to capital `E`
	 *
	 * @param input
	 * @returns
	 */
	function repairInput(input: string): string {
		const openBracketsCount = stringCount(input, /\(/g)
		const closeBracketsCount = stringCount(input, /\)/g)

		// '234))' => '((234))'
		if (openBracketsCount < closeBracketsCount) input = "("[_repeat](closeBracketsCount - openBracketsCount) + input

		// '((234' => '((234))'
		else if (openBracketsCount > closeBracketsCount) input = input + ")"[_repeat](openBracketsCount - closeBracketsCount)

		// '123 456 789' => '123456789'
		input = input[_replace](/\s/g, '')

		// '123,456,789' => '123456789'
		input = input[_replaceAll](settings[_numberFormat][_grouping], '')

		// '123456,789' => '123456.789'
		input = input[_replaceAll](settings[_numberFormat][_decimal], '.')

		// '.234' => '0.234'
		input = input[_replace](/(?<!\d)\.\d+/g, (s) => '0' + s)

		// '123.' => '123'
		input = input[_replace](/(\d+)\.(?!\d)/g, (_, grp1) => grp1)

		// '1.23E+5' => '1.23×100000'
		input = input[_replace](/(\d+(?:\.\d+)?)E([+\-])?(\d+)/g, (_, group1, group2, group3) => {
			const isMinus = group2 == '-'
			const power = numberParse(group3, true)
			return group1 + (power > 0? (isMinus? KEY_DIVISION : KEY_MULTIPLY) + '1' + '0'[_repeat](power) : '')
		})

		// 'e×2×ceil(' => 'e×2×c\eil('
		const nonEulerEscapeRegex = [
			/(ceil|sec)\(/g,
			/\\e/g, // use in the last part
		]
		input = input[_replace](nonEulerEscapeRegex[0], (r) => r[_replace]('e', '\\e'))

		// '123(456)' => '123×(456)'
		const implicitMultiplyRegex = [
			new RegExp(String[_raw]`(${NUMBER_REGEX}|[\)%!π]|(?<!\\)e)([\(π√\\]|(?<!\\)e|${FUNCTION_REGEX}(?=\())`, 'g'),
			/([\)%π!]|(?<!\\)e)(\d+(?:\.\d+)?|[\(π√]|(?<!\\)e)/g,
		]
		let iterator = 0
		while (implicitMultiplyRegex[0][_test](input) || implicitMultiplyRegex[1][_test](input)) {
			input = input[_replace](implicitMultiplyRegex[0], (_, group1, group2) => group1 + KEY_MULTIPLY + group2)
			input = input[_replace](implicitMultiplyRegex[1], (_, group1, group2) => group1 + KEY_MULTIPLY + group2)

			++iterator

			// I think the iterator will less than 5. But this is just to catch error in regex
			if (iterator > 20) {
				getConsole()[_warn](
					'Iterator exceeded maximum value',
					'iterator:', iterator,
					'input:', input
				)
				break
			}
		}

		// 'e' => '2.718281828459045'
		input = input[_replace](/(?<!\\)e/g, mathE[_toString]())

		// 'π' => '3.141592653589793'
		input = input[_replace](/π/g, mathPI[_toString]())

		// 'c\eil(12)' => 'ceil(12)'
		input = input[_replace](nonEulerEscapeRegex[1], 'e')

		return input
	}

	function convertUnit(input: number, inputUnit: ConverterUnit, outputUnit: ConverterUnit, type: ConverterType): number {
		if (type == ConverterType[_angle]) {
			let degree: number = 0
			if (inputUnit[_equals](UNIT_ANGLE_DEGREE)) degree = input
			else if (inputUnit[_equals](UNIT_ANGLE_RADIAN)) degree = input * 180 / getMath[_PI]
			else if (inputUnit[_equals](UNIT_ANGLE_GRADIAN)) degree = input * 9 / 10

			if (outputUnit[_equals](UNIT_ANGLE_DEGREE)) return degree
			if (outputUnit[_equals](UNIT_ANGLE_RADIAN)) return degree * getMath[_PI] / 180
			if (outputUnit[_equals](UNIT_ANGLE_GRADIAN)) return degree * 10 / 9

			return input
		}
		if (type == ConverterType[_temperature]) {
			let celsius: number = 0
			if (inputUnit[_equals](UNIT_TEMPERATURE_CELCIUS)) celsius = input
			else if (inputUnit[_equals](UNIT_TEMPERATURE_KELVIN)) celsius = input - 273.15
			else if (inputUnit[_equals](UNIT_TEMPERATURE_REAMUR)) celsius = input * 5 / 4
			else if (inputUnit[_equals](UNIT_TEMPERATURE_FAHRENHEIT)) celsius = (input - 32) * 5 / 9
			else if (inputUnit[_equals](UNIT_TEMPERATURE_ROMER)) celsius = (input - 7.5) * 40 / 21
			else if (inputUnit[_equals](UNIT_TEMPERATURE_RANKINE)) celsius = (input - 491.67) * 5 / 9
			else if (inputUnit[_equals](UNIT_TEMPERATURE_DELISLE)) celsius = 100 - input * 2 / 3

			if (outputUnit[_equals](UNIT_TEMPERATURE_CELCIUS)) return celsius
			if (outputUnit[_equals](UNIT_TEMPERATURE_KELVIN)) return celsius + 273.15
			if (outputUnit[_equals](UNIT_TEMPERATURE_REAMUR)) return celsius * 4 / 5
			if (outputUnit[_equals](UNIT_TEMPERATURE_FAHRENHEIT)) return celsius * 9 / 5 + 32
			if (outputUnit[_equals](UNIT_TEMPERATURE_ROMER)) return celsius * 21 / 40 + 7.5
			if (outputUnit[_equals](UNIT_TEMPERATURE_RANKINE)) return (celsius + 273.15) * 9 / 5
			if (outputUnit[_equals](UNIT_TEMPERATURE_DELISLE)) return (100 - celsius) * 3 / 2

			return input
		}

		return input * outputUnit[_value] / inputUnit[_value]
	}

	function calculateDate(): void {
		const operation = settings[_date][_operation]
		if (operation == DateOperation[_add]) {
			const d = inputs[_date][_from]
			setOutputs(_date, getDateString_YMD(new Date(
				getDate_Y(d) + inputs[_date][_year],
				getDate_M(d) + inputs[_date][_month],
				getDate_D(d) + inputs[_date][_day]
			)))
		}
		else if (operation == DateOperation[_subtract]) {
			const d = inputs[_date][_from]
			setOutputs(_date, getDateString_YMD(new Date(
				getDate_Y(d) - inputs[_date][_year],
				getDate_M(d) - inputs[_date][_month],
				getDate_D(d) - inputs[_date][_day]
			)))
		}
		else if (operation == DateOperation[_difference]) {
			let output: string = ""
			let days: number = mathAbs(dateDifferenceInDays(inputs[_date][_from], inputs[_date][_to]))
			const diffInDays = days
			if (days >= 365.25){
				const n = mathFloor(days / 365.25)
				output = `${n} year${n > 1? "s" : ""}`
				days = mathFloor(days % 365.25)
			}
			if (days >= 30.437){
				if (output != '') output += ", "
				const n = mathFloor(days / 30.437)
				output += `${n} month${n > 1? "s" : ""}`
				days = mathFloor(days % 30.437);
			}
			if (days >= 7){
				if (output != '') output += ", "
				const n = mathFloor(days / 7)
				output += `${n} week${n > 1? "s" : ""}`
				days = mathFloor(days % 7)
			}
			if (days > 0){
				if (output != '') output += ", "
				output += `${days} day${days > 1? "s" : ""}`
			}
			if (diffInDays == 0) output = "Same date"
			else if (diffInDays >= 7) output += ` (${diffInDays} day${diffInDays > 1? "s" : ""})`

			setOutputs(_date, output)
		}
	}

	function programmerCalcToBase10(input: string): string {
		const type = settings[_programmer][_numberType]
		if (type != NumberType[_decimal]) input = input[_replace](/[,\.]+/g, '')

		if (type == NumberType[_hexadecimal]) {
			const re = /[0-9A-F]+/g
			input = input[_replace](re, (v) => numberParse(v, true, 16)[_toString]())
		}
		else if (type == NumberType[_octal]) {
			if (/[89]/[_test](input)) throw Error()

			const re = /[0-7]+/g
			input = input[_replace](re, (v) => numberParse(v, true, 8)[_toString]())
		}
		else if (type == NumberType[_binary]) {
			if (/[2-9]/[_test](input)) throw Error()

			const re = /[01]+/g
			input = input[_replace](re, (v) => numberParse(v, true, 2)[_toString]())
		}
		return input
	}

	function calculate(): void {
		if (calculator() == CalculatorType[_date]) return calculateDate()

		let input = getInput() as string
		if (calculator() == CalculatorType[_programmer]) input = programmerCalcToBase10(inputs[_programmer])

		input = repairInput(input)

		while (true) {
			let hasOperation = false

			// function operation
			const funRegex = new RegExp(String[_raw]`(${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
			while (funRegex[_test](input)) {
				hasOperation = true
				input = input[_replace](funRegex, (_, fn_name, value) => {
					let parsedValue: number = numberParse(value)
					const angleToRadian = (value: number) => {
						if (calculator() != CalculatorType[_scientific]) return value

						const angle = settings[_scientific][_angle]
						let unit: ConverterUnit = UNIT_ANGLE_RADIAN
						if (angle == ScientificAngleType[_DEG]) unit = UNIT_ANGLE_DEGREE
						else if (angle == ScientificAngleType[_GRAD]) unit = UNIT_ANGLE_GRADIAN

						return convertUnit(value, unit, UNIT_ANGLE_RADIAN, ConverterType[_angle])
					}

					const radianToAngle = (value: number) => {
						if (calculator() != CalculatorType[_scientific]) return value

						const angle = settings[_scientific][_angle]
						let unit: ConverterUnit = UNIT_ANGLE_RADIAN
						if (angle == ScientificAngleType[_DEG]) unit = UNIT_ANGLE_DEGREE
						else if (angle == ScientificAngleType[_GRAD]) unit = UNIT_ANGLE_GRADIAN

						return convertUnit(value, UNIT_ANGLE_RADIAN, unit, ConverterType[_angle])
					}

					if (fn_name == _not) parsedValue = mathNot(parsedValue)
					else if (fn_name == _abs) parsedValue = mathAbs(parsedValue)
					else if (fn_name == _log) parsedValue = mathLog(parsedValue)
					else if (fn_name == _ln) parsedValue = mathLn(parsedValue)
					else if (fn_name == _ceil) parsedValue = mathCeil(parsedValue)
					else if (fn_name == _floor) parsedValue = mathFloor(parsedValue)
					else if (fn_name == _round) parsedValue = mathRound(parsedValue)
					else if (fn_name == _sqrt) parsedValue = mathSqrt(parsedValue)
					else if (fn_name == _sin) parsedValue = mathSin(angleToRadian(parsedValue))
					else if (fn_name == _cos) parsedValue = mathCos(angleToRadian(parsedValue))
					else if (fn_name == _tan) parsedValue = mathTan(angleToRadian(parsedValue))
					else if (fn_name == _csc) parsedValue = mathCsc(angleToRadian(parsedValue))
					else if (fn_name == _sec) parsedValue = mathSec(angleToRadian(parsedValue))
					else if (fn_name == _cot) parsedValue = mathCot(angleToRadian(parsedValue))
					else if (fn_name == _sinh) parsedValue = mathSinH(angleToRadian(parsedValue))
					else if (fn_name == _cosh) parsedValue = mathCosH(angleToRadian(parsedValue))
					else if (fn_name == _tanh) parsedValue = mathTanH(angleToRadian(parsedValue))
					else if (fn_name == _csch) parsedValue = mathCscH(angleToRadian(parsedValue))
					else if (fn_name == _sech) parsedValue = mathSecH(angleToRadian(parsedValue))
					else if (fn_name == _coth) parsedValue = mathCotH(angleToRadian(parsedValue))
					else if (fn_name == _asin) parsedValue = radianToAngle(mathASin(parsedValue))
					else if (fn_name == _acos) parsedValue = radianToAngle(mathACos(parsedValue))
					else if (fn_name == _atan) parsedValue = radianToAngle(mathATan(parsedValue))
					else if (fn_name == _acsc) parsedValue = radianToAngle(mathACsc(parsedValue))
					else if (fn_name == _asec) parsedValue = radianToAngle(mathASec(parsedValue))
					else if (fn_name == _acot) parsedValue = radianToAngle(mathACot(parsedValue))
					else if (fn_name == _asinh) parsedValue = radianToAngle(mathASinH(parsedValue))
					else if (fn_name == _acosh) parsedValue = radianToAngle(mathACosH(parsedValue))
					else if (fn_name == _atanh) parsedValue = radianToAngle(mathATanH(parsedValue))
					else if (fn_name == _acsch) parsedValue = radianToAngle(mathACscH(parsedValue))
					else if (fn_name == _asech) parsedValue = radianToAngle(mathASecH(parsedValue))
					else if (fn_name == _acoth) parsedValue = radianToAngle(mathACotH(parsedValue))
					return numberToRealDigit(parsedValue)
				})
			}

			// remove brackets
			const bracketsRegex = new RegExp(String[_raw]`(?<!${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
			while (bracketsRegex[_test](input)) {
				hasOperation = true
				input = input[_replace](bracketsRegex, (_, num1) => num1)
			}

			// square root operation
			const sqrtRegex = /√([-+]?\d+(?:\.\d+)?)/g
			while (sqrtRegex[_test](input)){
				hasOperation = true
				input = input[_replace](sqrtRegex, (_, num1) => {
					const parsedValue = numberParse(num1)
					if (parsedValue < 0) throw Error()
					return numberToRealDigit(mathSqrt(parsedValue))
				})
			}

			// percentage operation
			const percentageRegex = /(\d+(?:\.\d+)?)%/g
			while (percentageRegex[_test](input)){
				hasOperation = true
				input = input[_replace](percentageRegex, (_, num1) => numberToRealDigit(numberParse(num1) / 100))
			}

			// factorial operation
			const factorialRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)!/g
			while (factorialRegex[_test](input)){
				hasOperation = true
				input = input[_replace](factorialRegex, (_, num1) => {
					let n = numberParse(num1)
					if (/\./[_test](numberToRealDigit(n)) || n < 0) throw Error()

					let result = 1
					while (n > 0) {
						result *= n
						n--
					}
					return numberToRealDigit(result)
				})
			}

			// exponential operation
			const expRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)\^([+-]?\d+(?:\.\d+)?)/
			const expReverseRegex = /((?:\d+\.)?\d+[+-]?)\^((?:\d+\.)?\d+(?:[-+](?!\d))?)/
			const match = input[_match](expRegex)
			if (match) {
				hasOperation = true
				input = stringReverse(input)

				while (expReverseRegex[_test](input)) {
					input = input[_replace](expReverseRegex, (_, num2, num1) => stringReverse(numberToRealDigit(getMath[_pow](
						numberParse(stringReverse(num1)),
						numberParse(stringReverse(num2))
					))))
				}
				input = stringReverse(input)
			}

			// division & multiplication & modulus operation
			const div_mul_mod_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([*×\/÷]|mod)([+-]?\d+(?:\.\d+)?)/
			while (div_mul_mod_regex[_test](input)) {
				hasOperation = true
				input = input[_replace](div_mul_mod_regex, (_, num1, operator, num2) => {
					if (operator == 'mod') return numberToRealDigit(numberParse(num1) % numberParse(num2))
					else if (/[*×]/[_test](operator)) return numberToRealDigit(numberParse(num1) * numberParse(num2))
					else if (/[\/÷]/[_test](operator)) return numberToRealDigit(numberParse(num1) / numberParse(num2))
					return _
				})
			}


			// addition & substraction operation
			const add_sub_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([+-])([+-]?\d+(?:\.\d+)?)/
			while (add_sub_regex[_test](input)) {
				hasOperation = true
				input = input[_replace](add_sub_regex, (_, num1, operator, num2) => {
					if (operator == '+') return numberToRealDigit(numberParse(num1) + numberParse(num2))
					if (operator == '-') return numberToRealDigit(numberParse(num1) - numberParse(num2))
					return _
				})
			}

			// shifting operation
			const lsh_rsh_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(lsh|rsh|<<|>>)([+-]?\d+(?:\.\d+)?)/
			while (lsh_rsh_regex[_test](input)) {
				hasOperation = true
				input = input[_replace](lsh_rsh_regex, (_, num1, operator, num2) => {
					const $num1: number = numberParse(num1)
					const $num2: number = numberParse(num2)
					if (/\./[_test](num1) || /\./[_test](num2)) throw Error()
					if (/^(lsh|<<)$/[_test](operator)) return numberToRealDigit($num1 << $num2)
					if (/^(rsh|>>)$/[_test](operator)) return numberToRealDigit($num1 >> $num2)
					return _
				})
			}

			// and operation
			const and_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:&|and)([+-]?\d+(?:\.\d+)?)/
			while (and_regex[_test](input)) {
				hasOperation = true
				input = input[_replace](and_regex, (_, num1, num2) =>  {
					if (/\./[_test](num1) || /\./[_test](num2)) throw Error()
					return numberToRealDigit(numberParse(num1) & numberParse(num2))
				})
			}

			// xor operation
			const xor_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)xor([+-]?\d+(?:\.\d+)?)/
			while (xor_regex[_test](input)) {
				hasOperation = true
				input = input[_replace](xor_regex, (_, num1, num2) => {
					if (/\./[_test](num1) || /\./[_test](num2)) throw Error()
					return numberToRealDigit(numberParse(num1) ^ numberParse(num2))
				})
			}

			// or operation
			const or_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:\||or)([+-]?\d+(?:\.\d+)?)/
			while (or_regex[_test](input)) {
				hasOperation = true
				input = input[_replace](or_regex, (_, num1, num2) => {
					if (/\./[_test](num1) || /\./[_test](num2)) throw Error()
					return numberToRealDigit(numberParse(num1) | numberParse(num2))
				})
			}

			if (!hasOperation) break
		}

		const isValidValue = (v: string) => /^[+-]?\d+(?:\.\d+)?$/[_test](v)

		if (calculator() == CalculatorType[_basic]) setOutputs(_basic, isValidValue(input)? numberParse(input) : null)
		else if (calculator() == CalculatorType[_scientific]) setOutputs(_scientific, isValidValue(input)? numberParse(input) : null)
		else if (calculator() == CalculatorType[_programmer]) setOutputs(_programmer, isValidValue(input)? numberParse(input) : null)
		else if (calculator() == CalculatorType[_converter]) {
			input = numberToRealDigit(convertUnit(
				numberParse(input),
				settings[_converter][_inputUnit],
				settings[_converter][_outputUnit],
				settings[_converter][_type]
			))
			setOutputs(_converter, isValidValue(input)? numberParse(input) : null)
		}
	}

	function saveOutput(): void {
		const store_lastOutput = db[_writeObjectStore](ObjectStoreNames[_lastOutput])
		if (store_lastOutput == null) return

		let key = ObjectStoreKeys.lastOutput_basic
		let value = null
		if (calculator() == CalculatorType[_basic]) {
			key = ObjectStoreKeys.lastOutput_basic
			value = outputs[_basic]
		}
		else if (calculator() == CalculatorType[_scientific]) {
			key = ObjectStoreKeys.lastOutput_scientific
			value = outputs[_scientific]
		}
		else if (calculator() == CalculatorType[_converter]) {
			key = ObjectStoreKeys.lastOutput_converter
			value = outputs[_converter]
		}
		else if (calculator() == CalculatorType[_programmer]) {
			key = ObjectStoreKeys.lastOutput_programmer
			value = outputs[_programmer]
		}
		else if (calculator() == CalculatorType[_date]) {
			key = ObjectStoreKeys.lastOutput_date
			value = outputs[_date]
		}

		store_lastOutput[_put]({key, value})
	}

	function generateOutput(): void {
		try { calculate() }
		catch (e) {
			let $calculator: 'basic' | 'scientific' | 'converter' | 'programmer' | 'date' = _basic
			if (calculator() == CalculatorType[_basic]) $calculator = _basic
			else if (calculator() == CalculatorType[_scientific]) $calculator = _scientific
			else if (calculator() == CalculatorType[_converter]) $calculator = _converter
			else if (calculator() == CalculatorType[_programmer]) $calculator = _programmer
			else if (calculator() == CalculatorType[_date]) $calculator = _date

			setOutputs($calculator, null)
		}
		saveOutput()
	}

	function initNote(): void {
		const store_miscellaneous = db[_readObjectStore](ObjectStoreNames[_miscellaneous])
		if (store_miscellaneous == null) return

		db[_get]<ObjectStoreMiscellaneous<string>>(store_miscellaneous, ObjectStoreKeys.miscellaneous_note)[_then](
			(v) => setNote(r => v? v[_value] : r)
		)
	}

	function initLastPage(): void {
		const store_miscellaneous = db[_readObjectStore](ObjectStoreNames[_miscellaneous])
		if (store_miscellaneous == null) return

		db[_get]<ObjectStoreMiscellaneous<CalculatorType>>(store_miscellaneous, ObjectStoreKeys.miscellaneous_lastPage)[_then](
			(v) => setCalculatorType(r => v? v[_value] : r)
		)
	}

	function initSettings(): void {
		const store_settings = db[_readObjectStore](ObjectStoreNames[_settings])
		if (store_settings == null) return;

		db[_get]<ObjectStoreSettings<DecimalNumberFormat>>(store_settings, ObjectStoreKeys.settings_numberFormat_decimal)[_then](
			(v) => setSettings(_numberFormat, _decimal, d => v? v[_value] : d)
		)
		db[_get]<ObjectStoreSettings<GroupingNumberFormat>>(store_settings, ObjectStoreKeys.settings_numberFormat_grouping)[_then](
			(v) => setSettings(_numberFormat, _grouping, d => v? v[_value] : d)
		)
		db[_get]<ObjectStoreSettings<boolean>>(store_settings, ObjectStoreKeys.settings_scientificNotation)[_then](
			(v) => setSettings(_scientificNotation, d => v? v[_value] : d)
		)
		db[_get]<ObjectStoreSettings<boolean>>(store_settings, ObjectStoreKeys.settings_memoryButtons)[_then](
			(v) => setSettings(_memoryButtons, d => v? v[_value] : d)
		)
		db[_get]<ObjectStoreSettings<ConverterType>>(store_settings, ObjectStoreKeys.settings_converter_type)[_then](
			(v) => setSettings(_converter, _type, d => v? v[_value] : d)
		)
		db[_get]<ObjectStoreSettings<ConverterUnitType>>(store_settings, ObjectStoreKeys.settings_converter_inputUnit)[_then](
			(v) => setSettings(_converter, _inputUnit, d => v? ConverterUnit[_parseJSON](v[_value]) : d)
		)
		db[_get]<ObjectStoreSettings<ConverterUnitType>>(store_settings, ObjectStoreKeys.settings_converter_outputUnit)[_then](
			(v) => setSettings(_converter, _outputUnit, d => v? ConverterUnit[_parseJSON](v[_value]) : d)
		)
		db[_get]<ObjectStoreSettings<ScientificAngleType>>(store_settings, ObjectStoreKeys.settings_scientific_angle)[_then](
			(v) => setSettings(_scientific, _angle, d => v? v[_value] : d)
		)
		db[_get]<ObjectStoreSettings<NumberType>>(store_settings, ObjectStoreKeys.settings_programmer_numberType)[_then](
			(v) => setSettings(_programmer, _numberType, d => v? v[_value] : d)
		)
		db[_get]<ObjectStoreSettings<DateOperation>>(store_settings, ObjectStoreKeys.settings_date_operation)[_then](
			(v) => setSettings(_date, _operation, d => v? v[_value] : d)
		)
	}

	function initLastOuptut(): void {
		const store_lastOutput = db[_readObjectStore](ObjectStoreNames[_lastOutput])
		if (store_lastOutput == null) return

		db[_get]<ObjectStoreLastOutput<number>>(store_lastOutput, ObjectStoreKeys.lastOutput_basic)[_then](
			(v) => setOutputs(_basic, o => v? v[_value] : o)
		)
		db[_get]<ObjectStoreLastOutput<number>>(store_lastOutput, ObjectStoreKeys.lastOutput_scientific)[_then](
			(v) => setOutputs(_scientific, o => v? v[_value] : o)
		)
		db[_get]<ObjectStoreLastOutput<number>>(store_lastOutput, ObjectStoreKeys.lastOutput_converter)[_then](
			(v) => setOutputs(_converter, o => v? v[_value] : o)
		)
		db[_get]<ObjectStoreLastOutput<number>>(store_lastOutput, ObjectStoreKeys.lastOutput_programmer)[_then](
			(v) => setOutputs(_programmer, o => v? v[_value] : o)
		)
		db[_get]<ObjectStoreLastOutput<string>>(store_lastOutput, ObjectStoreKeys.lastOutput_date)[_then](
			(v) => setOutputs(_date, o => v? v[_value] : o)
		)
	}

	function initLastInput(): void {
		const store_lastInput = db[_readObjectStore](ObjectStoreNames[_lastInput])
		if (store_lastInput == null) return;

		db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_basic)[_then](
			(v) => setInputs(_basic, b => v? v[_value] : b)
		)
		db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_scientific)[_then](
			(v) => setInputs(_scientific, b => v? v[_value] : b)
		)
		db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_converter)[_then](
			(v) => setInputs(_converter, b => v? v[_value] : b)
		)
		db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_programmer)[_then](
			(v) => setInputs(_programmer, b => v? v[_value] : b)
		)
		db[_get]<ObjectStoreLastInput<number>>(store_lastInput, ObjectStoreKeys.lastInput_date_year)[_then](
			(v) => setInputs(_date, _year, b => v? v[_value] : b)
		)
		db[_get]<ObjectStoreLastInput<number>>(store_lastInput, ObjectStoreKeys.lastInput_date_month)[_then](
			(v) => setInputs(_date, _month, b => v? v[_value] : b)
		)
		db[_get]<ObjectStoreLastInput<number>>(store_lastInput, ObjectStoreKeys.lastInput_date_day)[_then](
			(v) => setInputs(_date, _day, b => v? v[_value] : b)
		)
		db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_date_from)[_then](
			(v) => setInputs(_date, _from, b => v? new Date(Date[_parse](v[_value])) : b)
		)
		db[_get]<ObjectStoreLastInput<string>>(store_lastInput, ObjectStoreKeys.lastInput_date_to)[_then](
			(v) => setInputs(_date, _to, b => v? new Date(Date[_parse](v[_value])) : b)
		)
	}

	function initDatabase(): void {
		db[_open]({
			onSuccess() {
				initSettings()
				initLastInput()
				initLastOuptut()
				initNote()
				initLastPage()
			},
			onUpgradeNeeded(_, db) {
				db[_createObjectStore]<ObjectStoreSettings>({
					name: ObjectStoreNames[_settings],
					keyPath: _key,
					indexs: [_key, _value]
				})
				db[_createObjectStore]<ObjectStoreLastInput>({
					name: ObjectStoreNames[_lastInput],
					keyPath: _key,
					indexs: [_key, _value]
				})
				db[_createObjectStore]<ObjectStoreLastOutput>({
					name: ObjectStoreNames[_lastOutput],
					keyPath: _key,
					indexs: [_key, _value]
				})
				db[_createObjectStore]<ObjectStoreMiscellaneous>({
					name: ObjectStoreNames[_miscellaneous],
					keyPath: _key,
					indexs: [_key, _value]
				})
			},
		})
	}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
	})

	return (<App
		appBar={<AppBar
			onChangeCalculator={onChangeCalculator}
			calculator={calculator()}
			command={command}
			settings={settings}
			note={note()}
			onNoteChanged={onNoteChanged}
			isNotebookExpanded={isNotebookExpanded()}
		/>}
		leftSideBar={<SideNavigation
			calculator={calculator()}
			onChangeCalculator={onChangeCalculator}
			expand={isSideNavigationExpanded()}
		/>}
		rightSideBar={<Notebook
			expand={isNotebookExpanded()}
			note={note()}
			onNoteChanged={onNoteChanged}
		/>}>
		<InputOutput
			calculator={calculator()}
			settings={settings}
			memory={memory()}
			inputs={inputs}
			outputs={outputs}
			command={command}
		/>
	</App>)
}

export default _