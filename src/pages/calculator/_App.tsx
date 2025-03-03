import { createMemo, createSignal, onMount, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { CalculatorInput, CalculatorOutput, DateCalculatorInput, Settings } from "./_types"
import { CalculatorType, Commands, DateOperation, DecimalNumberFormat, GroupingNumberFormat, NumberType, ScientificAngleType } from "./_enums"
import { IDB } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, type ObjectStoreLastInput, type ObjectStoreLastOutput, type ObjectStoreMiscellaneous, ObjectStoreNames, type ObjectStoreSettings } from "./_storage"
import { dateDiffInDays } from "@/utils/datetime"
import { KEY_DIVISION, KEY_MULTIPLY } from "./_constants"
import { mathACot, mathACotH, mathACsc, mathACscH, mathASec, mathASecH, mathCot, mathCotH, mathCsc, mathCscH, mathSec, mathSecH } from "@/utils/math"
import { ConverterType, ConverterUnit, UNIT_ANGLE, UNIT_ANGLE_DEGREE, UNIT_ANGLE_GRADIAN, UNIT_ANGLE_RADIAN, UNIT_AREA, UNIT_FREQUENCY, UNIT_LENGTH, UNIT_LENGTH_KILOMETER, UNIT_LENGTH_METER, UNIT_PRESSURE, UNIT_TEMPERATURE, UNIT_TEMPERATURE_CELCIUS, UNIT_TEMPERATURE_DELISLE, UNIT_TEMPERATURE_FAHRENHEIT, UNIT_TEMPERATURE_KELVIN, UNIT_TEMPERATURE_RANKINE, UNIT_TEMPERATURE_REAMUR, UNIT_TEMPERATURE_ROMER, UNIT_TIME, UNIT_VOLUME, UNIT_WEIGHT, type ConverterUnitType } from "./_converter"
import { FUNCTION_REGEX, NUMBER_REGEX } from "./_regex"
import { removeSplashScreen } from "@/utils/splash"
import { numberFormat, numberToBinary, numberToRealDigits } from "@/utils/number"
import { stringCount, stringReverse } from "@/utils/string"

import App from "@/components/App"
import AppBar from "./_AppBar"
import SideNavigation from './_SideNavigation'
import Notebook from './_Notebook'
import InputOutput from './_InputOutput'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.calculator)
	const [isSideNavigationExpanded, setIsSideNavigationExpanded] = createSignal<boolean>(true)
	const [isNotebookExpanded, setIsNotebookExpanded] = createSignal<boolean>(false)
	const [calculator, setCalculator] = createSignal<CalculatorType>(CalculatorType.basic)
	const [note, setNote] = createSignal<string>('')
	const [memory, setMemory] = createSignal<number>(0)
	const [settings, setSettings] = createStore<Settings>({
		numberFormat: {
			decimal: DecimalNumberFormat.point,
			grouping: GroupingNumberFormat.comma
		},
		converter: {
			type: ConverterType.length,
			unitInput: UNIT_LENGTH_METER,
			unitOutput: UNIT_LENGTH_KILOMETER
		},
		scientific: {
			angle: ScientificAngleType.RAD
		},
		programmer: {
			numberType: NumberType.decimal
		},
		date: {
			operation: DateOperation.difference
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
			from: new Date(),
			to: new Date(),
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
		switch (calculator()) {
		case CalculatorType.basic: return outputs.basic
		case CalculatorType.scientific: return outputs.scientific
		case CalculatorType.converter: return outputs.converter
		case CalculatorType.programmer: return outputs.programmer
		case CalculatorType.date: return outputs.date
		}
	})
	const getInput = createMemo<string | {from: Date;to: Date}>(() => {
		switch (calculator()) {
		case CalculatorType.basic: return inputs.basic
		case CalculatorType.scientific: return inputs.scientific
		case CalculatorType.converter: return inputs.converter
		case CalculatorType.programmer: return inputs.programmer
		case CalculatorType.date: return inputs.date
		}
	})
	let timeId: null | NodeJS.Timeout | number = null
	let timeNoteId: null | NodeJS.Timeout | number = null

	function onChangeCalculator(type: CalculatorType): void {
		setCalculator(type)
		const store = db.writeStore(ObjectStoreNames.miscellaneous)
		store?.put({
			key: ObjectStoreKeys.miscellaneous_lastPage,
			value: type
		})
	}

	function onNoteChanged(value: string): void {
		setNote(value)
		if (timeNoteId != null) clearTimeout(timeNoteId)
		timeNoteId = setTimeout(() => {
			timeNoteId = null
			const store = db.writeStore(ObjectStoreNames.miscellaneous)
			store?.put({key: ObjectStoreKeys.miscellaneous_note, value})
		}, 1000)
	}

	function saveSettings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.settings)
		if (!store) return;

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	function saveInputs(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store = db.writeStore(ObjectStoreNames.lastInput)
		if (!store) return;

		for (const item of items) {
			store.put({ key: item[0], value: item[1] })
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.toggleNavigationExpand:
			setIsSideNavigationExpanded(v => !v)
			if (isSideNavigationExpanded()) setIsNotebookExpanded(false)
			break
		case Commands.toggleNotebookExpand:
			setIsNotebookExpanded(v => !v)
			if (isNotebookExpanded()) setIsSideNavigationExpanded(false)
			break
		case Commands.updateSettingsNumberFormatGrouping: {
			const [type] = args as [GroupingNumberFormat]
			const items: [key: ObjectStoreKeys, value: unknown][] = [
				[ObjectStoreKeys.settings_numberFormatGrouping, type]
			]

			setSettings('numberFormat', 'grouping', type)
			if ((type as any) == settings.numberFormat.decimal) {
				setSettings('numberFormat', 'decimal', type == GroupingNumberFormat.comma
						? DecimalNumberFormat.point
						: DecimalNumberFormat.comma
				)
				items.push([
					ObjectStoreKeys.settings_numberFormatDecimal,
					settings.numberFormat.decimal
				])
			}

			saveSettings(...items)
			break
		}
		case Commands.updateSettingsNumberFormatDecimal: {
			const [type] = args as [DecimalNumberFormat]
			const items: [key: ObjectStoreKeys, value: unknown][] = [
				[ObjectStoreKeys.settings_numberFormatDecimal, type]
			]

			setSettings('numberFormat', 'decimal', type)
			if ((type as any) == settings.numberFormat.grouping) {
				setSettings('numberFormat', 'grouping', type == DecimalNumberFormat.comma
					? GroupingNumberFormat.point
					: GroupingNumberFormat.comma
				)
				items.push([
					ObjectStoreKeys.settings_numberFormatGrouping,
					settings.numberFormat.grouping
				])
			}

			saveSettings(...items)
			break
		}
		case Commands.toggleSettingsScientificNotation:
			setSettings('scientificNotation', v => !v)
			saveSettings([ObjectStoreKeys.settings_scientificNotation, settings.scientificNotation])
			break
		case Commands.toggleSettingsMemoryButtons:
			setSettings('memoryButtons', v => !v)
			saveSettings([ObjectStoreKeys.settings_memoryButtons, settings.memoryButtons])
			break
		case Commands.updateCalculatorInput: {
			const [value] = args as [string | DateCalculatorInput]
			if (timeId) clearTimeout(timeId)

			timeId = setTimeout(() => {
				switch (calculator()) {
				case CalculatorType.basic:
					setInputs('basic', value as string)
					saveInputs([ObjectStoreKeys.lastInput_basic, value])
					break
				case CalculatorType.scientific:
					setInputs('scientific', value as string)
					saveInputs([ObjectStoreKeys.lastInput_scientific, value])
					break
				case CalculatorType.converter:
					setInputs('converter', value as string)
					saveInputs([ObjectStoreKeys.lastInput_converter, value])
					break
				case CalculatorType.programmer:
					setInputs('programmer', value as string)
					saveInputs([ObjectStoreKeys.lastInput_programmer, value])
					break
				case CalculatorType.date:
					const $value = value as DateCalculatorInput
					setInputs('date', {...$value})
					saveInputs(
						[ObjectStoreKeys.lastInput_dateFrom, $value.from.toISOString()],
						[ObjectStoreKeys.lastInput_dateTo, $value.to.toISOString()],
						[ObjectStoreKeys.lastInput_dateYear, $value.year],
						[ObjectStoreKeys.lastInput_date_month, $value.month],
						[ObjectStoreKeys.lastInput_date_day, $value.day],
					)
				}
				generateOutput()
				timeId = null
			}, 200)
			break
		}
		case Commands.addMemory:
			if (getOutput() == null) return;
			setMemory(v => v + (getOutput() as number))
			break
		case Commands.subtractMemory:
			if (getOutput() == null) return;
			setMemory(v => v - (getOutput() as number))
			break
		case Commands.clearMemory:
			setMemory(0)
			break
		case Commands.toggleSettingsScientificAngle:
			let value: ScientificAngleType = ScientificAngleType.RAD
			const angle = settings.scientific.angle
			if (angle == ScientificAngleType.RAD) value = ScientificAngleType.DEG
			else if (angle == ScientificAngleType.DEG) value = ScientificAngleType.GRAD
			else if (angle == ScientificAngleType.GRAD) value = ScientificAngleType.RAD
			setSettings('scientific', 'angle', value)
			saveSettings([ObjectStoreKeys.settings_scientificAngle, value])

			if (timeId) clearTimeout(timeId)
			timeId = setTimeout(() => {
				generateOutput()
				timeId = null
			}, 200)
			break
		case Commands.updateSettingsConverterType: {
			const [converter] = args as [ConverterType]
			if (converter == settings.converter.type) return;

			let units: ConverterUnit[] = UNIT_LENGTH
			switch (converter) {
			case ConverterType.length     : units = UNIT_LENGTH; break
			case ConverterType.area       : units = UNIT_AREA; break
			case ConverterType.volume     : units = UNIT_VOLUME; break
			case ConverterType.temperature: units = UNIT_TEMPERATURE; break
			case ConverterType.time       : units = UNIT_TIME; break
			case ConverterType.weight     : units = UNIT_WEIGHT; break
			case ConverterType.frequency  : units = UNIT_FREQUENCY; break
			case ConverterType.pressure   : units = UNIT_PRESSURE; break
			case ConverterType.angle      : units = UNIT_ANGLE; break
			}

			setSettings('converter', {type: converter, unitInput: units[0], unitOutput: units[1]})
			saveSettings(
				[ObjectStoreKeys.settings_converterType, converter],
				[ObjectStoreKeys.settings_converterUnitInput, units[0].json],
				[ObjectStoreKeys.settings_converterUnitOutput, units[1].json],
			)
			generateOutput()
			break
		}
		case Commands.updateSettingsConverterInputUnit: {
			const [unit] = args as [ConverterUnit]
			if (unit.equals(settings.converter.unitInput)) return;

			setSettings('converter', 'unitInput', unit)
			saveSettings([ObjectStoreKeys.settings_converterUnitInput, unit.json])
			generateOutput()
			break
		}
		case Commands.updateSettingsConverterOutputUnit: {
			const [unit] = args as [ConverterUnit]
			if (unit.equals(settings.converter.unitOutput)) return;

			setSettings('converter', 'unitOutput', unit)
			saveSettings([ObjectStoreKeys.settings_converterUnitOutput, unit.json])
			generateOutput()
			break
		}
		case Commands.swapConverterUnits: {
			const unitInput = settings.converter.unitOutput
			const unitOutput = settings.converter.unitInput
			setSettings('converter', c => ({...c, unitInput: unitInput, unitOutput: unitOutput}))
			saveSettings(
				[ObjectStoreKeys.settings_converterUnitInput, unitInput.json],
				[ObjectStoreKeys.settings_converterUnitOutput, unitOutput.json],
			)
			generateOutput()
			break
		}
		case Commands.updateSettingsProgrammerNumberType: {
			const [type] = args as [NumberType]
			const settingsKeys: [key: ObjectStoreKeys, value: unknown][] = [
				[ObjectStoreKeys.settings_programmerNumberType, type]
			]
			if (type == settings.programmer.numberType) return;

			let input: null | string = null
			if (outputs.programmer != null){
				if (type == NumberType.decimal) {
					if (settings.scientificNotation && /[eE]/.test(outputs.programmer.toString()))
						input = outputs.programmer.toString().toString()
					else input = numberFormat(outputs.programmer, {
						decimal: settings.numberFormat.decimal,
						thousand: settings.numberFormat.grouping
					})
				}
				else {
					if (type == NumberType.hexadecimal) input = (Number
						.parseInt(numberToBinary(outputs.programmer), 2)
						.toString(16)
						.toUpperCase())
					else if (type == NumberType.octal) input = (Number
						.parseInt(numberToBinary(outputs.programmer), 2)
						.toString(8))
					else if (type == NumberType.binary) input = numberToBinary(outputs.programmer)

					input = input!.replace(/\./g, settings.numberFormat.decimal)
				}

				settingsKeys.push([ObjectStoreKeys.lastInput_programmer, input ?? ''])
				setInputs('programmer', input ?? '')
			}

			setSettings('programmer', 'numberType', type)
			saveSettings(...settingsKeys)
			break
		}
		case Commands.updateSettingsDateOperation: {
			const [operation] = args as [DateOperation]
			setSettings('date', 'operation', operation)
			saveSettings([ObjectStoreKeys.settings_dateOperation, operation])
			generateOutput()
			break
		}}

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
		const openBracketCount = stringCount(input, /\(/g)
		const closeBracketCount = stringCount(input, /\)/g)

		// '234))' => '((234))'
		if (openBracketCount < closeBracketCount) {
			input = "(".repeat(closeBracketCount - openBracketCount) + input
		}

		// '((234' => '((234))'
		else if (openBracketCount > closeBracketCount) {
			input = input + ")".repeat(openBracketCount - closeBracketCount)
		}

		// '123 456 789' => '123456789'
		input = input.replace(/\s/g, '')

		// '123,456,789' => '123456789'
		input = input.replaceAll(settings.numberFormat.grouping, '')

		// '123456,789' => '123456.789'
		input = input.replaceAll(settings.numberFormat.decimal, '.')

		// '.234' => '0.234'
		input = input.replace(/(?<!\d)\.\d+/g, (s) => '0' + s)

		// '123.' => '123'
		input = input.replace(/(\d+)\.(?!\d)/g, (_, grp1) => grp1)

		// '1.23E+5' => '1.23×100000'
		input = input.replace(
			/(\d+(?:\.\d+)?)E([+\-])?(\d+)/g,
			(_, group1, group2, group3) => {
				const isMinus = group2 == '-'
				const power = Number.parseInt(group3)
				return group1
					+ (power > 0
						? (isMinus
							? KEY_DIVISION
							: KEY_MULTIPLY
						) + '1' + '0'.repeat(power)
						: ''
					)
			}
		)

		// 'e×2×ceil(' => 'e×2×c\eil('
		const nonEulerEscapeRegex = [
			/(ceil|sec)\(/g,
			/\\e/g, // use in the last part
		]
		input = input.replace(nonEulerEscapeRegex[0], (r) => r.replace('e', '\\e'))

		// '123(456)' => '123×(456)'
		const implicitMultiplyRegex = [
			new RegExp(String.raw`(${NUMBER_REGEX}|[\)%!π]|(?<!\\)e)([\(π√\\]|(?<!\\)e|${FUNCTION_REGEX}(?=\())`, 'g'),
			/([\)%π!]|(?<!\\)e)(\d+(?:\.\d+)?|[\(π√]|(?<!\\)e)/g,
		]
		let iterator = 0
		while (
			implicitMultiplyRegex[0].test(input)
			|| implicitMultiplyRegex[1].test(input)
		) {
			input = input.replace(
				implicitMultiplyRegex[0],
				(_, group1, group2) => group1 + KEY_MULTIPLY + group2
			)
			input = input.replace(
				implicitMultiplyRegex[1],
				(_, group1, group2) => group1 + KEY_MULTIPLY + group2
			)

			++iterator

			// I think the iterator will less than 5. But this is just to catch error in regex
			if (iterator > 20) {
				console.warn(
					'Iterator exceeded maximum value',
					'iterator:', iterator,
					'input:', input
				)
				break
			}
		}

		// 'e' => '2.718281828459045'
		input = input.replace(/(?<!\\)e/g, Math.E.toString())

		// 'π' => '3.141592653589793'
		input = input.replace(/π/g, Math.PI.toString())

		// 'c\eil(12)' => 'ceil(12)'
		input = input.replace(nonEulerEscapeRegex[1], 'e')

		return input
	}

	function convertUnit(
		input: number,
		unitInput: ConverterUnit,
		unitOutput: ConverterUnit,
		type: ConverterType
	): number {
		if (type == ConverterType.angle) {
			let degree: number = 0
			if (unitInput.equals(UNIT_ANGLE_DEGREE)) degree = input
			else if (unitInput.equals(UNIT_ANGLE_RADIAN)) degree = input * 180 / Math.PI
			else if (unitInput.equals(UNIT_ANGLE_GRADIAN)) degree = input * 9 / 10

			if (unitOutput.equals(UNIT_ANGLE_DEGREE)) return degree
			if (unitOutput.equals(UNIT_ANGLE_RADIAN)) return degree * Math.PI / 180
			if (unitOutput.equals(UNIT_ANGLE_GRADIAN)) return degree * 10 / 9

			return input
		}
		if (type == ConverterType.temperature) {
			let celsius: number = 0
			if (unitInput.equals(UNIT_TEMPERATURE_CELCIUS)) celsius = input
			else if (unitInput.equals(UNIT_TEMPERATURE_KELVIN)) celsius = input - 273.15
			else if (unitInput.equals(UNIT_TEMPERATURE_REAMUR)) celsius = input * 5 / 4
			else if (unitInput.equals(UNIT_TEMPERATURE_FAHRENHEIT)) celsius = (input - 32) * 5 / 9
			else if (unitInput.equals(UNIT_TEMPERATURE_ROMER)) celsius = (input - 7.5) * 40 / 21
			else if (unitInput.equals(UNIT_TEMPERATURE_RANKINE)) celsius = (input - 491.67) * 5 / 9
			else if (unitInput.equals(UNIT_TEMPERATURE_DELISLE)) celsius = 100 - input * 2 / 3

			if (unitOutput.equals(UNIT_TEMPERATURE_CELCIUS)) return celsius
			if (unitOutput.equals(UNIT_TEMPERATURE_KELVIN)) return celsius + 273.15
			if (unitOutput.equals(UNIT_TEMPERATURE_REAMUR)) return celsius * 4 / 5
			if (unitOutput.equals(UNIT_TEMPERATURE_FAHRENHEIT)) return celsius * 9 / 5 + 32
			if (unitOutput.equals(UNIT_TEMPERATURE_ROMER)) return celsius * 21 / 40 + 7.5
			if (unitOutput.equals(UNIT_TEMPERATURE_RANKINE)) return (celsius + 273.15) * 9 / 5
			if (unitOutput.equals(UNIT_TEMPERATURE_DELISLE)) return (100 - celsius) * 3 / 2

			return input
		}

		return input * unitOutput.value / unitInput.value
	}

	function calculateDate(): void {
		const operation = settings.date.operation
		switch (operation) {
		case DateOperation.add: {
			const d = inputs.date.from
			setOutputs('date', new Date(
				d.getFullYear() + inputs.date.year,
				d.getMonth() + inputs.date.month,
				d.getDate() + inputs.date.day
			).toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			}))
			break
		}
		case DateOperation.subtract: {
			const d = inputs.date.from
			setOutputs('date', new Date(
				d.getFullYear() - inputs.date.year,
				d.getMonth() - inputs.date.month,
				d.getDate() - inputs.date.day
			).toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			}))
			break
		}
		case DateOperation.difference: {
			let output: string = ""
			let days: number = Math.abs(dateDiffInDays(inputs.date.from, inputs.date.to))
			const diff_in_days = days
			if (days >= 365.25){
				const n = Math.floor(days / 365.25)
				output = `${n} year${n > 1? "s" : ""}`
				days = Math.floor(days % 365.25)
			}
			if (days >= 30.437){
				if (output != '') output += ", "
				const n = Math.floor(days / 30.437)
				output += `${n} month${n > 1? "s" : ""}`
				days = Math.floor(days % 30.437);
			}
			if (days >= 7){
				if (output != '') output += ", "
				const n = Math.floor(days / 7)
				output += `${n} week${n > 1? "s" : ""}`
				days = Math.floor(days % 7)
			}
			if (days > 0){
				if (output != '') output += ", "
				output += `${days} day${days > 1? "s" : ""}`
			}
			if (diff_in_days == 0) output = "Same date"
			else if (diff_in_days >= 7) output += ` (${diff_in_days} day${diff_in_days > 1? "s" : ""})`

			setOutputs('date', output)
			break
		}}
	}

	function inputToDecimal(input: string): string {
		const type = settings.programmer.numberType
		if (type != NumberType.decimal) input = input.replace(/[,\.]+/g, '')

		if (type == NumberType.hexadecimal) {
			const re = /[0-9A-F]+/g
			input = input.replace(re, (v) => Number.parseInt(v, 16).toString())
		}
		else if (type == NumberType.octal) {
			if (/[89]/.test(input)) throw Error()

			const re = /[0-7]+/g
			input = input.replace(re, (v) => Number.parseInt(v, 8).toString())
		}
		else if (type == NumberType.binary) {
			if (/[2-9]/.test(input)) throw Error()

			const re = /[01]+/g
			input = input.replace(re, (v) => Number.parseInt(v, 2).toString())
		}
		return input
	}

	function calculate(): void {
		if (calculator() == CalculatorType.date) return calculateDate()

		let input = getInput() as string
		if (calculator() == CalculatorType.programmer) input = inputToDecimal(inputs.programmer)

		input = repairInput(input)

		while (true) {
			let hasOperation = false

			// function operation
			const functionRegex = new RegExp(String.raw`(${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
			while (functionRegex.test(input)) {
				hasOperation = true
				input = input.replace(functionRegex, (_, fnName, value) => {
					let parsedValue: number = Number.parseFloat(value)
					const angleToRadian = (value: number) => {
						if (calculator() != CalculatorType.scientific) return value

						const angle = settings.scientific.angle
						let unit: ConverterUnit = UNIT_ANGLE_RADIAN
						if (angle == ScientificAngleType.DEG) unit = UNIT_ANGLE_DEGREE
						else if (angle == ScientificAngleType.GRAD) unit = UNIT_ANGLE_GRADIAN

						return convertUnit(value, unit, UNIT_ANGLE_RADIAN, ConverterType.angle)
					}
					const radianToAngle = (value: number) => {
						if (calculator() != CalculatorType.scientific) return value

						const angle = settings.scientific.angle
						let unit: ConverterUnit = UNIT_ANGLE_RADIAN
						if (angle == ScientificAngleType.DEG) unit = UNIT_ANGLE_DEGREE
						else if (angle == ScientificAngleType.GRAD) unit = UNIT_ANGLE_GRADIAN

						return convertUnit(value, UNIT_ANGLE_RADIAN, unit, ConverterType.angle)
					}

					switch (fnName) {
					case 'not': parsedValue = ~parsedValue; break
					case 'abs': parsedValue = Math.abs(parsedValue); break
					case 'log': parsedValue = Math.log10(parsedValue); break
					case 'ln': parsedValue = Math.log(parsedValue); break
					case 'ceil': parsedValue = Math.ceil(parsedValue); break
					case 'floor': parsedValue = Math.floor(parsedValue); break
					case 'round': parsedValue = Math.round(parsedValue); break
					case 'sqrt': parsedValue = Math.sqrt(parsedValue); break
					case 'sin': parsedValue = Math.sin(angleToRadian(parsedValue)); break
					case 'cos': parsedValue = Math.cos(angleToRadian(parsedValue)); break
					case 'tan': parsedValue = Math.tan(angleToRadian(parsedValue)); break
					case 'csc': parsedValue = mathCsc(angleToRadian(parsedValue)); break
					case 'sec': parsedValue = mathSec(angleToRadian(parsedValue)); break
					case 'cot': parsedValue = mathCot(angleToRadian(parsedValue)); break
					case 'sinh': parsedValue = Math.sinh(angleToRadian(parsedValue)); break
					case 'cosh': parsedValue = Math.cosh(angleToRadian(parsedValue)); break
					case 'tanh': parsedValue = Math.tanh(angleToRadian(parsedValue)); break
					case 'csch': parsedValue = mathCscH(angleToRadian(parsedValue)); break
					case 'sech': parsedValue = mathSecH(angleToRadian(parsedValue)); break
					case 'coth': parsedValue = mathCotH(angleToRadian(parsedValue)); break
					case 'asin': parsedValue = radianToAngle(Math.asin(parsedValue)); break
					case 'acos': parsedValue = radianToAngle(Math.acos(parsedValue)); break
					case 'atan': parsedValue = radianToAngle(Math.atan(parsedValue)); break
					case 'acsc': parsedValue = radianToAngle(mathACsc(parsedValue)); break
					case 'asec': parsedValue = radianToAngle(mathASec(parsedValue)); break
					case 'acot': parsedValue = radianToAngle(mathACot(parsedValue)); break
					case 'asinh': parsedValue = radianToAngle(Math.asinh(parsedValue)); break
					case 'acosh': parsedValue = radianToAngle(Math.acosh(parsedValue)); break
					case 'atanh': parsedValue = radianToAngle(Math.atanh(parsedValue)); break
					case 'acsch': parsedValue = radianToAngle(mathACscH(parsedValue)); break
					case 'asech': parsedValue = radianToAngle(mathASecH(parsedValue)); break
					case 'acoth': parsedValue = radianToAngle(mathACotH(parsedValue)); break
					}
					return numberToRealDigits(parsedValue)
				})
			}

			// remove brackets
			const bracketsRegex = new RegExp(String.raw`(?<!${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
			while (bracketsRegex.test(input)) {
				hasOperation = true
				input = input.replace(bracketsRegex, (_, num1) => num1)
			}

			// square root operation
			const sqrtRegex = /√([-+]?\d+(?:\.\d+)?)/g
			while (sqrtRegex.test(input)){
				hasOperation = true
				input = input.replace(sqrtRegex, (_, num1) => {
					const parsedValue = Number.parseFloat(num1)
					if (parsedValue < 0) throw Error()
					return numberToRealDigits(Math.sqrt(parsedValue))
				})
			}

			// percentage operation
			const percentageRegex = /(\d+(?:\.\d+)?)%/g
			while (percentageRegex.test(input)){
				hasOperation = true
				input = input.replace(
					percentageRegex,
					(_, num1) => numberToRealDigits(Number.parseFloat(num1) / 100)
				)
			}

			// factorial operation
			const factorialRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)!/g
			while (factorialRegex.test(input)){
				hasOperation = true
				input = input.replace(factorialRegex, (_, num1) => {
					let n = Number.parseFloat(num1)
					if (/\./.test(numberToRealDigits(n)) || n < 0) throw Error()

					let result = 1
					while (n > 0) {
						result *= n
						n--
					}
					return numberToRealDigits(result)
				})
			}

			// exponential operation
			const expRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)\^([+-]?\d+(?:\.\d+)?)/
			const expReverseRegex = /((?:\d+\.)?\d+[+-]?)\^((?:\d+\.)?\d+(?:[-+](?!\d))?)/
			const match = input.match(expRegex)
			if (match) {
				hasOperation = true
				input = stringReverse(input)

				while (expReverseRegex.test(input)) {
					input = input.replace(
						expReverseRegex,
						(_, num2, num1) => stringReverse(numberToRealDigits(Math.pow(
							Number.parseFloat(stringReverse(num1)),
							Number.parseFloat(stringReverse(num2))
						)))
					)
				}
				input = stringReverse(input)
			}

			// division & multiplication & modulus operation
			const divMulModRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([*×\/÷]|mod)([+-]?\d+(?:\.\d+)?)/
			while (divMulModRegex.test(input)) {
				hasOperation = true
				input = input.replace(divMulModRegex, (_, num1, operator, num2) => {
					if (operator == 'mod') return numberToRealDigits(Number.parseFloat(num1) % Number.parseFloat(num2))
					else if (/[*×]/.test(operator)) return numberToRealDigits(Number.parseFloat(num1) * Number.parseFloat(num2))
					else if (/[\/÷]/.test(operator)) return numberToRealDigits(Number.parseFloat(num1) / Number.parseFloat(num2))
					return _
				})
			}


			// addition & substraction operation
			const addSubRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([+-])([+-]?\d+(?:\.\d+)?)/
			while (addSubRegex.test(input)) {
				hasOperation = true
				input = input.replace(addSubRegex, (_, num1, operator, num2) => {
					if (operator == '+') return numberToRealDigits(Number.parseFloat(num1) + Number.parseFloat(num2))
					if (operator == '-') return numberToRealDigits(Number.parseFloat(num1) - Number.parseFloat(num2))
					return _
				})
			}

			// shifting operation
			const lshRshRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(lsh|rsh|<<|>>)([+-]?\d+(?:\.\d+)?)/
			while (lshRshRegex.test(input)) {
				hasOperation = true
				input = input.replace(lshRshRegex, (_, num1, operator, num2) => {
					const $num1: number = Number.parseFloat(num1)
					const $num2: number = Number.parseFloat(num2)
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					if (/^(lsh|<<)$/.test(operator)) return numberToRealDigits($num1 << $num2)
					if (/^(rsh|>>)$/.test(operator)) return numberToRealDigits($num1 >> $num2)
					return _
				})
			}

			// and operation
			const andRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:&|and)([+-]?\d+(?:\.\d+)?)/
			while (andRegex.test(input)) {
				hasOperation = true
				input = input.replace(andRegex, (_, num1, num2) =>  {
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					return numberToRealDigits(Number.parseFloat(num1) & Number.parseFloat(num2))
				})
			}

			// xor operation
			const xorRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)xor([+-]?\d+(?:\.\d+)?)/
			while (xorRegex.test(input)) {
				hasOperation = true
				input = input.replace(xorRegex, (_, num1, num2) => {
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					return numberToRealDigits(Number.parseFloat(num1) ^ Number.parseFloat(num2))
				})
			}

			// or operation
			const orRegex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:\||or)([+-]?\d+(?:\.\d+)?)/
			while (orRegex.test(input)) {
				hasOperation = true
				input = input.replace(orRegex, (_, num1, num2) => {
					if (/\./.test(num1) || /\./.test(num2)) throw Error()
					return numberToRealDigits(Number.parseFloat(num1) | Number.parseFloat(num2))
				})
			}

			if (!hasOperation) break
		}

		const isValidValue = (v: string) => /^[+-]?\d+(?:\.\d+)?$/.test(v)

		if (calculator() == CalculatorType.basic) setOutputs('basic', isValidValue(input)? Number.parseFloat(input) : null)
		else if (calculator() == CalculatorType.scientific) setOutputs('scientific', isValidValue(input)? Number.parseFloat(input) : null)
		else if (calculator() == CalculatorType.programmer) setOutputs('programmer', isValidValue(input)? Number.parseFloat(input) : null)
		else if (calculator() == CalculatorType.converter) {
			const converter = settings.converter
			input = numberToRealDigits(convertUnit(
				Number.parseFloat(input),
				converter.unitInput,
				converter.unitOutput,
				converter.type
			))
			setOutputs('converter', isValidValue(input)? Number.parseFloat(input) : null)
		}
	}

	function saveOutput(): void {
		const store = db.writeStore(ObjectStoreNames.lastOutput)
		if (store == null) return

		let key = ObjectStoreKeys.lastOutput_basic
		let value = null
		switch (calculator()) {
		case CalculatorType.basic:
			key = ObjectStoreKeys.lastOutput_basic
			value = outputs.basic
			break
		case CalculatorType.scientific:
			key = ObjectStoreKeys.lastOutput_scientific
			value = outputs.scientific
			break
		case CalculatorType.converter:
			key = ObjectStoreKeys.lastOutput_converter
			value = outputs.converter
			break
		case CalculatorType.programmer:
			key = ObjectStoreKeys.lastOutput_programmer
			value = outputs.programmer
			break
		case CalculatorType.date:
			key = ObjectStoreKeys.lastOutput_date
			value = outputs.date
			break
		}

		store.put({key, value})
	}

	function generateOutput(): void {
		try { calculate() }
		catch (e) {
			let $calculator: 'basic' | 'scientific' | 'converter' | 'programmer' | 'date' = 'basic'
			switch (calculator()) {
			case CalculatorType.basic     : $calculator = 'basic'; break
			case CalculatorType.scientific: $calculator = 'scientific'; break
			case CalculatorType.converter : $calculator = 'converter'; break
			case CalculatorType.programmer: $calculator = 'programmer'; break
			case CalculatorType.date      : $calculator = 'date'; break
			}

			setOutputs($calculator, null)
		}
		saveOutput()
	}

	function initNote(): void {
		const store = db.readStore(ObjectStoreNames.miscellaneous)
		if (store == null) return

		db.get<ObjectStoreMiscellaneous<string>>(
			store,
			ObjectStoreKeys.miscellaneous_note
		).then((result) => setNote(r => result?.value ?? r))
	}

	function initLastPage(): void {
		const store = db.readStore(ObjectStoreNames.miscellaneous)
		if (store == null) return

		db.get<ObjectStoreMiscellaneous<CalculatorType>>(
			store,
			ObjectStoreKeys.miscellaneous_lastPage
		).then((result) => setCalculator(r => result?.value ?? r))
	}

	function initSettings(): void {
		const store = db.readStore(ObjectStoreNames.settings)
		if (store == null) return;

		db.get<ObjectStoreSettings<DecimalNumberFormat>>(
			store,
			ObjectStoreKeys.settings_numberFormatDecimal
		).then((result) => setSettings('numberFormat', 'decimal', d => result?.value ?? d))

		db.get<ObjectStoreSettings<GroupingNumberFormat>>(
			store,
			ObjectStoreKeys.settings_numberFormatGrouping
		).then((result) => setSettings('numberFormat', 'grouping', d => result?.value ?? d))

		db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_scientificNotation
		).then((result) => setSettings('scientificNotation', d => result?.value ?? d))

		db.get<ObjectStoreSettings<boolean>>(
			store,
			ObjectStoreKeys.settings_memoryButtons
		).then((result) => setSettings('memoryButtons', d => result?.value ?? d))

		db.get<ObjectStoreSettings<ConverterType>>(
			store,
			ObjectStoreKeys.settings_converterType
		).then((result) => setSettings('converter', 'type', d => result?.value ?? d))

		db.get<ObjectStoreSettings<ConverterUnitType>>(
			store,
			ObjectStoreKeys.settings_converterUnitInput
		).then((result) => setSettings('converter', 'unitInput', d => result? ConverterUnit.parseJSON(result.value) : d))

		db.get<ObjectStoreSettings<ConverterUnitType>>(
			store,
			ObjectStoreKeys.settings_converterUnitOutput
		).then((result) => setSettings('converter', 'unitOutput', d => result? ConverterUnit.parseJSON(result.value) : d))

		db.get<ObjectStoreSettings<ScientificAngleType>>(
			store,
			ObjectStoreKeys.settings_scientificAngle
		).then((result) => setSettings('scientific', 'angle', d => result?.value ?? d))

		db.get<ObjectStoreSettings<NumberType>>(
			store,
			ObjectStoreKeys.settings_programmerNumberType
		).then((result) => setSettings('programmer', 'numberType', d => result?.value ?? d))

		db.get<ObjectStoreSettings<DateOperation>>(
			store,
			ObjectStoreKeys.settings_dateOperation
		).then((result) => setSettings('date', 'operation', d => result?.value ?? d))
	}

	function initLastOutput(): void {
		const storeLastOutput = db.readStore(ObjectStoreNames.lastOutput)
		if (storeLastOutput == null) return

		db.get<ObjectStoreLastOutput<number>>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_basic
		).then((result) => setOutputs('basic', o => result?.value ?? o))

		db.get<ObjectStoreLastOutput<number>>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_scientific
		).then((result) => setOutputs('scientific', o => result?.value ?? o))

		db.get<ObjectStoreLastOutput<number>>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_converter
		).then((result) => setOutputs('converter', o => result?.value ?? o))

		db.get<ObjectStoreLastOutput<number>>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_programmer
		).then((result) => setOutputs('programmer', o => result?.value ?? o))

		db.get<ObjectStoreLastOutput<string>>(
			storeLastOutput,
			ObjectStoreKeys.lastOutput_date
		).then((result) => setOutputs('date', o => result?.value ?? o))
	}

	function initLastInput(): void {
		const store = db.readStore(ObjectStoreNames.lastInput)
		if (store == null) return;

		db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastInput_basic
		).then((result) => setInputs('basic', i => result?.value ?? i))

		db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastInput_scientific
		).then((result) => setInputs('scientific', i => result?.value ?? i))

		db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastInput_converter
		).then((result) => setInputs('converter', i => result?.value ?? i))

		db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastInput_programmer
		).then((result) => setInputs('programmer', i => result?.value ?? i))

		db.get<ObjectStoreLastInput<number>>(
			store,
			ObjectStoreKeys.lastInput_dateYear
		).then((result) => setInputs('date', 'year', i => result?.value ?? i))

		db.get<ObjectStoreLastInput<number>>(
			store,
			ObjectStoreKeys.lastInput_date_month
		).then((result) => setInputs('date', 'month', i => result?.value ?? i))

		db.get<ObjectStoreLastInput<number>>(
			store,
			ObjectStoreKeys.lastInput_date_day
		).then((result) => setInputs('date', 'day', i => result?.value ?? i))

		db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastInput_dateFrom
		).then((result) => setInputs('date', 'from', i => result? new Date(Date.parse(result.value)) : i))

		db.get<ObjectStoreLastInput<string>>(
			store,
			ObjectStoreKeys.lastInput_dateTo
		).then((result) => setInputs('date', 'to', i => result? new Date(Date.parse(result.value)) : i))
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initSettings()
				initLastInput()
				initLastOutput()
				initNote()
				initLastPage()
			},
			onUpgrade(_, db) {
				db.createStore<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore<ObjectStoreLastInput>({
					name: ObjectStoreNames.lastInput,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore<ObjectStoreLastOutput>({
					name: ObjectStoreNames.lastOutput,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
				db.createStore<ObjectStoreMiscellaneous>({
					name: ObjectStoreNames.miscellaneous,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
	})

	return (<App
		c:appBar={<AppBar
			onChangeCalculator={onChangeCalculator}
			calculator={calculator()}
			command={command}
			settings={settings}
			note={note()}
			onNoteChanged={onNoteChanged}
			isNotebookExpanded={isNotebookExpanded()}
		/>}
		c:leftSideBar={<SideNavigation
			calculator={calculator()}
			onChangeCalculator={onChangeCalculator}
			expanded={isSideNavigationExpanded()}
		/>}
		c:rightSideBar={<Notebook
			expanded={isNotebookExpanded()}
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