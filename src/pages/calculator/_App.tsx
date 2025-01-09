import { createMemo, createSignal, onMount, type VoidComponent } from "solid-js"
import { createStore } from "solid-js/store"

import type { CalculatorInput, CalculatorOutput, DateCalculatorInput, Settings } from "./_types"
import { CalculatorType, Commands, DateOperation, DecimalNumberFormat, GroupingNumberFormat, NumberType, ScientificAngleType } from "./_enums"
import { IDB, idb_store_put } from "@/utils/indexeddb"
import { DatabaseNames } from "@/enums/storage"
import { ObjectStoreKeys, type ObjectStoreLastInput, type ObjectStoreLastOutput, type ObjectStoreMiscellaneous, ObjectStoreNames, type ObjectStoreSettings } from "./_storage"
import { date_diff_in_days, get_current_date, date_date, date_month, date_year, date_text_YMD, date_iso, date_parse } from "@/utils/datetime"
import { timeout_clear, timeout_set } from "@/utils/timeout"
import { string_count, string_match, string_repeat, string_replace, string_replaceall, string_reverse, string_touppercase } from "@/utils/string"
import { KEY_DIVISION, KEY_MULTIPLY } from "./_constants"
import { math_abs, math_acos, math_acosh, math_acot, math_acoth, math_acsc, math_acsch, math_asec, math_asech, math_asin, math_asinh, math_atan, math_atanh, math_ceil, math_cos, math_cosh, math_cot, math_coth, math_csc, math_csch, math_floor, math_ln, math_log, math_not, math_pow, math_round, math_sec, math_sech, math_sin, math_sinh, math_sqrt, math_tan, math_tanh } from "@/utils/math"
import { ConverterType, ConverterUnit, UNIT_ANGLE, UNIT_ANGLE_DEGREE, UNIT_ANGLE_GRADIAN, UNIT_ANGLE_RADIAN, UNIT_AREA, UNIT_FREQUENCY, UNIT_LENGTH, UNIT_LENGTH_KILOMETER, UNIT_LENGTH_METER, UNIT_PRESSURE, UNIT_TEMPERATURE, UNIT_TEMPERATURE_CELCIUS, UNIT_TEMPERATURE_DELISLE, UNIT_TEMPERATURE_FAHRENHEIT, UNIT_TEMPERATURE_KELVIN, UNIT_TEMPERATURE_RANKINE, UNIT_TEMPERATURE_REAMUR, UNIT_TEMPERATURE_ROMER, UNIT_TIME, UNIT_VOLUME, UNIT_WEIGHT, type ConverterUnitType } from "./_converter"
import { FUNCTION_REGEX, NUMBER_REGEX } from "./_regex"
import { remove_splash_screen } from "@/scripts/splash"
import { array_push } from "@/utils/array"
import { regex_test } from "@/utils/regex"
import { number_format, number_parse, number_to_binary, number_to_real_digit, number_to_string } from "@/utils/number"
import { promise_done } from "@/utils/object"

import App from "@/components/App"
import AppBar from "./_AppBar"
import SideNavigation from './_SideNavigation'
import Notebook from './_Notebook'
import InputOutput from './_InputOutput'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.calculator)
	const [is_sidenavigation_expanded, set_is_sidenavigation_expanded] = createSignal<boolean>(true)
	const [is_notebook_expanded, set_is_notebook_expanded] = createSignal<boolean>(false)
	const [calculator, set_calculator] = createSignal<CalculatorType>(CalculatorType.basic)
	const [note, set_note] = createSignal<string>('')
	const [memory, set_memory] = createSignal<number>(0)
	const [settings, set_settings] = createStore<Settings>({
		number_format: {
			decimal: DecimalNumberFormat.point,
			grouping: GroupingNumberFormat.comma
		},
		converter: {
			type: ConverterType.length,
			unit_input: UNIT_LENGTH_METER,
			unit_output: UNIT_LENGTH_KILOMETER
		},
		scientific: {
			angle: ScientificAngleType.RAD
		},
		programmer: {
			number_type: NumberType.decimal
		},
		date: {
			operation: DateOperation.difference
		},
		scientific_notation: false,
		memory_buttons: true
	})
	const [inputs, set_inputs] = createStore<CalculatorInput>({
		basic: '',
		converter: '',
		scientific: '',
		programmer: '',
		date: {
			from: get_current_date(),
			to: get_current_date(),
			year: 0,
			day: 0,
			month: 0
		}
	})
	const [outputs, set_outputs] = createStore<CalculatorOutput>({
		basic: null,
		converter: null,
		scientific: null,
		programmer: null,
		date: null
	})
	const get_output = createMemo<number | string | null>(() => {
		switch (calculator()) {
			case CalculatorType.basic: return outputs.basic
			case CalculatorType.scientific: return outputs.scientific
			case CalculatorType.converter: return outputs.converter
			case CalculatorType.programmer: return outputs.programmer
			case CalculatorType.date: return outputs.date
		}
	})
	const get_input = createMemo<string | {from: Date;to: Date}>(() => {
		switch (calculator()) {
			case CalculatorType.basic: return inputs.basic
			case CalculatorType.scientific: return inputs.scientific
			case CalculatorType.converter: return inputs.converter
			case CalculatorType.programmer: return inputs.programmer
			case CalculatorType.date: return inputs.date
		}
	})
	let timeout_id: null | number = null
	let timeout_note_id: null | number = null

	function on_change_calculator(type: CalculatorType): void {
		set_calculator(type)
		const store_miscellaneous = db.write_store(ObjectStoreNames.miscellaneous)
		if (store_miscellaneous) idb_store_put(store_miscellaneous, {
			key: ObjectStoreKeys.miscellaneous_lastpage,
			value: type
		})
	}

	function on_note_changed(value: string): void {
		set_note(value)
		if (timeout_note_id != null) timeout_clear(timeout_note_id)
		timeout_note_id = timeout_set(() => {
			timeout_note_id = null
			const store_miscellaneous = db.write_store(ObjectStoreNames.miscellaneous)
			if (store_miscellaneous) idb_store_put(
				store_miscellaneous,
				{key: ObjectStoreKeys.miscellaneous_note, value}
			)
		}, 1000)
	}

	function save_settings(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_settings = db.write_store(ObjectStoreNames.settings)
		if (!store_settings) return;

		for (const item of items) {
			idb_store_put(store_settings, { key: item[0], value: item[1] })
		}
	}

	function save_inputs(...items: [key: ObjectStoreKeys, value: unknown][]): void {
		const store_lastinput = db.write_store(ObjectStoreNames.last_input)
		if (!store_lastinput) return;

		for (const item of items) {
			idb_store_put(store_lastinput, { key: item[0], value: item[1] })
		}
	}

	function command(type: Commands, ...args: unknown[]): unknown { switch (type) {
		case Commands.toggle_navigation_expand: {
			set_is_sidenavigation_expanded(v => !v)
			if (is_sidenavigation_expanded()) set_is_notebook_expanded(false)
			break
		}
		case Commands.toggle_notebook_expand: {
			set_is_notebook_expanded(v => !v)
			if (is_notebook_expanded()) set_is_sidenavigation_expanded(false)
			break
		}
		case Commands.change_settings_numberformatgrouping: {
			const items: [key: ObjectStoreKeys, value: unknown][] = [[ObjectStoreKeys.settings_numberformat_grouping, args[0]]]

			set_settings('number_format', 'grouping', args[0] as GroupingNumberFormat)
			if (args[0] == settings.number_format.decimal) {
				set_settings(
					'number_format',
					'decimal',
					args[0] == GroupingNumberFormat.comma
						? DecimalNumberFormat.point
						: DecimalNumberFormat.comma
				)
				array_push(items, [ObjectStoreKeys.settings_numberformat_decimal, settings.number_format.decimal])
			}

			save_settings(...items)
			break
		}
		case Commands.change_settings_numberformatdecimal: {
			const items: [key: ObjectStoreKeys, value: unknown][] = [[ObjectStoreKeys.settings_numberformat_decimal, args[0]]]

			set_settings('number_format', 'decimal', args[0] as DecimalNumberFormat)
			if (args[0] == settings.number_format.grouping) {
				set_settings('number_format', 'grouping', args[0] == DecimalNumberFormat.comma? GroupingNumberFormat.point : GroupingNumberFormat.comma)
				array_push(items, [ObjectStoreKeys.settings_numberformat_grouping, settings.number_format.grouping])
			}

			save_settings(...items)
			break
		}
		case Commands.toggle_settings_scientificnotation: {
			set_settings('scientific_notation', v => !v)
			save_settings([ObjectStoreKeys.settings_scientificnotation, settings.scientific_notation])
			break
		}
		case Commands.toggle_settings_memorybuttons: {
			set_settings('memory_buttons', v => !v)
			save_settings([ObjectStoreKeys.settings_memorybuttons, settings.memory_buttons])
			break
		}
		case Commands.change_calculator_input: {
			if (timeout_id) timeout_clear(timeout_id)
			const value = args[0]

			timeout_id = timeout_set(() => {
				if (calculator() == CalculatorType.basic) {
					set_inputs('basic', value as string)
					save_inputs([ObjectStoreKeys.lastinput_basic, value])
				}
				else if (calculator() == CalculatorType.scientific) {
					set_inputs('scientific', value as string)
					save_inputs([ObjectStoreKeys.lastinput_scientific, value])
				}
				else if (calculator() == CalculatorType.converter) {
					set_inputs('converter', value as string)
					save_inputs([ObjectStoreKeys.lastinput_converter, value])
				}
				else if (calculator() == CalculatorType.programmer) {
					set_inputs('programmer', value as string)
					save_inputs([ObjectStoreKeys.lastinput_programmer, value])
				}
				else if (calculator() == CalculatorType.date) {
					const $value = value as DateCalculatorInput
					set_inputs('date', {...$value})
					save_inputs(
						[ObjectStoreKeys.lastinput_date_from, date_iso($value.from)],
						[ObjectStoreKeys.lastinput_date_to, date_iso($value.to)],
						[ObjectStoreKeys.lastinput_date_year, $value.year],
						[ObjectStoreKeys.lastinput_date_month, $value.month],
						[ObjectStoreKeys.lastinput_date_day, $value.day],
					)
				}
				generate_output()
				timeout_id = null
			}, 200)
			break
		}
		case Commands.add_memory: {
			if (get_output() == null) return;
			set_memory(v => v + (get_output() as number))
			break
		}
		case Commands.subtract_memory: {
			if (get_output() == null) return;
			set_memory(v => v - (get_output() as number))
			break
		}
		case Commands.clear_memory: {
			set_memory(0)
			break
		}
		case Commands.toggle_settings_scientific_angle: {
			let value: ScientificAngleType = ScientificAngleType.RAD
			const angle = settings.scientific.angle
			if (angle == ScientificAngleType.RAD) value = ScientificAngleType.DEG
			else if (angle == ScientificAngleType.DEG) value = ScientificAngleType.GRAD
			else if (angle == ScientificAngleType.GRAD) value = ScientificAngleType.RAD
			set_settings('scientific', 'angle', value)
			save_settings([ObjectStoreKeys.settings_scientific_angle, value])

			if (timeout_id) timeout_clear(timeout_id)
			timeout_id = timeout_set(() => {
				generate_output()
				timeout_id = null
			}, 200)
			break
		}
		case Commands.change_settings_converter_type: {
			const converter = args[0] as ConverterType
			if (converter == settings.converter.type) return;

			let units: ConverterUnit[] = UNIT_LENGTH
			if (converter == ConverterType.length) units = UNIT_LENGTH
			else if (converter == ConverterType.area) units = UNIT_AREA
			else if (converter == ConverterType.volume) units = UNIT_VOLUME
			else if (converter == ConverterType.temperature) units = UNIT_TEMPERATURE
			else if (converter == ConverterType.time) units = UNIT_TIME
			else if (converter == ConverterType.weight) units = UNIT_WEIGHT
			else if (converter == ConverterType.frequency) units = UNIT_FREQUENCY
			else if (converter == ConverterType.pressure) units = UNIT_PRESSURE
			else if (converter == ConverterType.angle) units = UNIT_ANGLE

			set_settings('converter', {type: converter, unit_input: units[0], unit_output: units[1]})
			save_settings(
				[ObjectStoreKeys.settings_converter_type, converter],
				[ObjectStoreKeys.settings_converter_unitinput, units[0].json],
				[ObjectStoreKeys.settings_converter_unitoutput, units[1].json],
			)
			generate_output()
			break
		}
		case Commands.change_settings_converter_inputunit: {
			const unit = args[0] as ConverterUnit
			if (unit.equals(settings.converter.unit_input)) return;

			set_settings('converter', 'unit_input', unit)
			save_settings([ObjectStoreKeys.settings_converter_unitinput, unit.json])
			generate_output()
			break
		}
		case Commands.change_settings_converter_outputunit: {
			const unit = args[0] as ConverterUnit
			if (unit.equals(settings.converter.unit_output)) return;

			set_settings('converter', 'unit_output', unit)
			save_settings([ObjectStoreKeys.settings_converter_unitoutput, unit.json])
			generate_output()
			break
		}
		case Commands.change_settings_converter_swapunit: {
			const unit_input = settings.converter.unit_output
			const unit_output = settings.converter.unit_input
			set_settings('converter', c => ({...c, unit_input: unit_input, unit_output: unit_output}))
			save_settings(
				[ObjectStoreKeys.settings_converter_unitinput, unit_input.json],
				[ObjectStoreKeys.settings_converter_unitoutput, unit_output.json],
			)
			generate_output()
			break
		}
		case Commands.change_settings_programmer_numbertype: {
			const type = args[0] as NumberType
			const setting_keys: [key: ObjectStoreKeys, value: unknown][] = [
				[ObjectStoreKeys.settings_programmer_numbertype, type]
			]
			if (type == settings.programmer.number_type) return;

			let input: null | string = null
			if (outputs.programmer != null){
				if (type == NumberType.decimal) {
					if (settings.scientific_notation && regex_test(/[eE]/, number_to_string(outputs.programmer)))
						input = string_touppercase(number_to_string(outputs.programmer))
					else input = number_format(outputs.programmer, {
						decimal: settings.number_format.decimal,
						thousand: settings.number_format.grouping
					})
				}
				else {
					if (type == NumberType.hexadecimal) input = string_touppercase(number_to_string(number_parse(number_to_binary(outputs.programmer), true, 2), 16))
					else if (type == NumberType.octal) input = number_to_string(number_parse(number_to_binary(outputs.programmer), true, 2), 8)
					else if (type == NumberType.binary) input = number_to_binary(outputs.programmer)

					input = string_replace(input!, /\./g, settings.number_format.decimal)
				}

				array_push(setting_keys, [ObjectStoreKeys.lastinput_programmer, input ?? ''])
				set_inputs('programmer', input ?? '')
			}

			set_settings('programmer', 'number_type', type)
			save_settings(...setting_keys)
			break
		}
		case Commands.change_settings_date_operation: {
			set_settings('date', 'operation', args[0] as DateOperation)
			save_settings([ObjectStoreKeys.settings_date_operation, args[0]])
			generate_output()
			break
		}
		default: return
	}}

	/**
	 * Repair input before calculating. The `input` must follow these rules:
	 *
	 * * If `input` include `e` (e.g. 2.324e+34), the `e` must convert to capital `E`
	 *
	 * @param input
	 * @returns
	 */
	function repair_input(input: string): string {
		const count_openbracket = string_count(input, /\(/g)
		const count_closebracket = string_count(input, /\)/g)

		// '234))' => '((234))'
		if (count_openbracket < count_closebracket) input = string_repeat("(", count_closebracket - count_openbracket) + input

		// '((234' => '((234))'
		else if (count_openbracket > count_closebracket) input = input + string_repeat(")", count_openbracket - count_closebracket)

		// '123 456 789' => '123456789'
		input = string_replace(input, /\s/g, '')

		// '123,456,789' => '123456789'
		input = string_replaceall(input, settings.number_format.grouping, '')

		// '123456,789' => '123456.789'
		input = string_replaceall(input, settings.number_format.decimal, '.')

		// '.234' => '0.234'
		input = string_replace(input, /(?<!\d)\.\d+/g, (s) => '0' + s)

		// '123.' => '123'
		input = string_replace(input, /(\d+)\.(?!\d)/g, (_, grp1) => grp1)

		// '1.23E+5' => '1.23×100000'
		input = string_replace(input, /(\d+(?:\.\d+)?)E([+\-])?(\d+)/g, (_, group1, group2, group3) => {
			const is_minus = group2 == '-'
			const power = number_parse(group3, true)
			return group1 + (power > 0? (is_minus? KEY_DIVISION : KEY_MULTIPLY) + '1' + string_repeat('0', power) : '')
		})

		// 'e×2×ceil(' => 'e×2×c\eil('
		const non_euler_escape_regex = [
			/(ceil|sec)\(/g,
			/\\e/g, // use in the last part
		]
		input = string_replace(input, non_euler_escape_regex[0], (r) => string_replace(r, 'e', '\\e'))

		// '123(456)' => '123×(456)'
		const implicit_multiply_regex = [
			new RegExp(String.raw`(${NUMBER_REGEX}|[\)%!π]|(?<!\\)e)([\(π√\\]|(?<!\\)e|${FUNCTION_REGEX}(?=\())`, 'g'),
			/([\)%π!]|(?<!\\)e)(\d+(?:\.\d+)?|[\(π√]|(?<!\\)e)/g,
		]
		let iterator = 0
		while (regex_test(implicit_multiply_regex[0], input) || regex_test(implicit_multiply_regex[1], input)) {
			input = string_replace(input, implicit_multiply_regex[0], (_, group1, group2) => group1 + KEY_MULTIPLY + group2)
			input = string_replace(input, implicit_multiply_regex[1], (_, group1, group2) => group1 + KEY_MULTIPLY + group2)

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
		input = string_replace(input, /(?<!\\)e/g, number_to_string(Math.E))

		// 'π' => '3.141592653589793'
		input = string_replace(input, /π/g, number_to_string(Math.PI))

		// 'c\eil(12)' => 'ceil(12)'
		input = string_replace(input, non_euler_escape_regex[1], 'e')

		return input
	}

	function convert_unit(
		input: number,
		unit_input: ConverterUnit,
		unit_output: ConverterUnit,
		type: ConverterType
	): number {
		if (type == ConverterType.angle) {
			let degree: number = 0
			if (unit_input.equals(UNIT_ANGLE_DEGREE)) degree = input
			else if (unit_input.equals(UNIT_ANGLE_RADIAN)) degree = input * 180 / Math.PI
			else if (unit_input.equals(UNIT_ANGLE_GRADIAN)) degree = input * 9 / 10

			if (unit_output.equals(UNIT_ANGLE_DEGREE)) return degree
			if (unit_output.equals(UNIT_ANGLE_RADIAN)) return degree * Math.PI / 180
			if (unit_output.equals(UNIT_ANGLE_GRADIAN)) return degree * 10 / 9

			return input
		}
		if (type == ConverterType.temperature) {
			let celsius: number = 0
			if (unit_input.equals(UNIT_TEMPERATURE_CELCIUS)) celsius = input
			else if (unit_input.equals(UNIT_TEMPERATURE_KELVIN)) celsius = input - 273.15
			else if (unit_input.equals(UNIT_TEMPERATURE_REAMUR)) celsius = input * 5 / 4
			else if (unit_input.equals(UNIT_TEMPERATURE_FAHRENHEIT)) celsius = (input - 32) * 5 / 9
			else if (unit_input.equals(UNIT_TEMPERATURE_ROMER)) celsius = (input - 7.5) * 40 / 21
			else if (unit_input.equals(UNIT_TEMPERATURE_RANKINE)) celsius = (input - 491.67) * 5 / 9
			else if (unit_input.equals(UNIT_TEMPERATURE_DELISLE)) celsius = 100 - input * 2 / 3

			if (unit_output.equals(UNIT_TEMPERATURE_CELCIUS)) return celsius
			if (unit_output.equals(UNIT_TEMPERATURE_KELVIN)) return celsius + 273.15
			if (unit_output.equals(UNIT_TEMPERATURE_REAMUR)) return celsius * 4 / 5
			if (unit_output.equals(UNIT_TEMPERATURE_FAHRENHEIT)) return celsius * 9 / 5 + 32
			if (unit_output.equals(UNIT_TEMPERATURE_ROMER)) return celsius * 21 / 40 + 7.5
			if (unit_output.equals(UNIT_TEMPERATURE_RANKINE)) return (celsius + 273.15) * 9 / 5
			if (unit_output.equals(UNIT_TEMPERATURE_DELISLE)) return (100 - celsius) * 3 / 2

			return input
		}

		return input * unit_output.value / unit_input.value
	}

	function calculate_date(): void {
		const operation = settings.date.operation
		if (operation == DateOperation.add) {
			const d = inputs.date.from
			set_outputs('date', date_text_YMD(new Date(
				date_year(d) + inputs.date.year,
				date_month(d) + inputs.date.month,
				date_date(d) + inputs.date.day
			)))
		}
		else if (operation == DateOperation.subtract) {
			const d = inputs.date.from
			set_outputs('date', date_text_YMD(new Date(
				date_year(d) - inputs.date.year,
				date_month(d) - inputs.date.month,
				date_date(d) - inputs.date.day
			)))
		}
		else if (operation == DateOperation.difference) {
			let output: string = ""
			let days: number = math_abs(date_diff_in_days(inputs.date.from, inputs.date.to))
			const diff_in_days = days
			if (days >= 365.25){
				const n = math_floor(days / 365.25)
				output = `${n} year${n > 1? "s" : ""}`
				days = math_floor(days % 365.25)
			}
			if (days >= 30.437){
				if (output != '') output += ", "
				const n = math_floor(days / 30.437)
				output += `${n} month${n > 1? "s" : ""}`
				days = math_floor(days % 30.437);
			}
			if (days >= 7){
				if (output != '') output += ", "
				const n = math_floor(days / 7)
				output += `${n} week${n > 1? "s" : ""}`
				days = math_floor(days % 7)
			}
			if (days > 0){
				if (output != '') output += ", "
				output += `${days} day${days > 1? "s" : ""}`
			}
			if (diff_in_days == 0) output = "Same date"
			else if (diff_in_days >= 7) output += ` (${diff_in_days} day${diff_in_days > 1? "s" : ""})`

			set_outputs('date', output)
		}
	}

	function input_to_decimal(input: string): string {
		const type = settings.programmer.number_type
		if (type != NumberType.decimal) input = string_replace(input, /[,\.]+/g, '')

		if (type == NumberType.hexadecimal) {
			const re = /[0-9A-F]+/g
			input = string_replace(input, re, (v) => number_to_string(number_parse(v, true, 16)))
		}
		else if (type == NumberType.octal) {
			if (regex_test(/[89]/, input)) throw Error()

			const re = /[0-7]+/g
			input = string_replace(input, re, (v) => number_to_string(number_parse(v, true, 8)))
		}
		else if (type == NumberType.binary) {
			if (regex_test(/[2-9]/, input)) throw Error()

			const re = /[01]+/g
			input = string_replace(input, re, (v) => number_to_string(number_parse(v, true, 2)))
		}
		return input
	}

	function calculate(): void {
		if (calculator() == CalculatorType.date) return calculate_date()

		let input = get_input() as string
		if (calculator() == CalculatorType.programmer) input = input_to_decimal(inputs.programmer)

		input = repair_input(input)

		while (true) {
			let has_operation = false

			// function operation
			const function_regex = new RegExp(String.raw`(${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
			while (regex_test(function_regex, input)) {
				has_operation = true
				input = string_replace(input, function_regex, (_, fn_name, value) => {
					let parsed_value: number = number_parse(value)
					const angle_to_radian = (value: number) => {
						if (calculator() != CalculatorType.scientific) return value

						const angle = settings.scientific.angle
						let unit: ConverterUnit = UNIT_ANGLE_RADIAN
						if (angle == ScientificAngleType.DEG) unit = UNIT_ANGLE_DEGREE
						else if (angle == ScientificAngleType.GRAD) unit = UNIT_ANGLE_GRADIAN

						return convert_unit(value, unit, UNIT_ANGLE_RADIAN, ConverterType.angle)
					}

					const radian_to_angle = (value: number) => {
						if (calculator() != CalculatorType.scientific) return value

						const angle = settings.scientific.angle
						let unit: ConverterUnit = UNIT_ANGLE_RADIAN
						if (angle == ScientificAngleType.DEG) unit = UNIT_ANGLE_DEGREE
						else if (angle == ScientificAngleType.GRAD) unit = UNIT_ANGLE_GRADIAN

						return convert_unit(value, UNIT_ANGLE_RADIAN, unit, ConverterType.angle)
					}

					if (fn_name == 'not') parsed_value = math_not(parsed_value)
					else if (fn_name == 'abs') parsed_value = math_abs(parsed_value)
					else if (fn_name == 'log') parsed_value = math_log(parsed_value)
					else if (fn_name == 'ln') parsed_value = math_ln(parsed_value)
					else if (fn_name == 'ceil') parsed_value = math_ceil(parsed_value)
					else if (fn_name == 'floor') parsed_value = math_floor(parsed_value)
					else if (fn_name == 'round') parsed_value = math_round(parsed_value)
					else if (fn_name == 'sqrt') parsed_value = math_sqrt(parsed_value)
					else if (fn_name == 'sin') parsed_value = math_sin(angle_to_radian(parsed_value))
					else if (fn_name == 'cos') parsed_value = math_cos(angle_to_radian(parsed_value))
					else if (fn_name == 'tan') parsed_value = math_tan(angle_to_radian(parsed_value))
					else if (fn_name == 'csc') parsed_value = math_csc(angle_to_radian(parsed_value))
					else if (fn_name == 'sec') parsed_value = math_sec(angle_to_radian(parsed_value))
					else if (fn_name == 'cot') parsed_value = math_cot(angle_to_radian(parsed_value))
					else if (fn_name == 'sinh') parsed_value = math_sinh(angle_to_radian(parsed_value))
					else if (fn_name == 'cosh') parsed_value = math_cosh(angle_to_radian(parsed_value))
					else if (fn_name == 'tanh') parsed_value = math_tanh(angle_to_radian(parsed_value))
					else if (fn_name == 'csch') parsed_value = math_csch(angle_to_radian(parsed_value))
					else if (fn_name == 'sech') parsed_value = math_sech(angle_to_radian(parsed_value))
					else if (fn_name == 'coth') parsed_value = math_coth(angle_to_radian(parsed_value))
					else if (fn_name == 'asin') parsed_value = radian_to_angle(math_asin(parsed_value))
					else if (fn_name == 'acos') parsed_value = radian_to_angle(math_acos(parsed_value))
					else if (fn_name == 'atan') parsed_value = radian_to_angle(math_atan(parsed_value))
					else if (fn_name == 'acsc') parsed_value = radian_to_angle(math_acsc(parsed_value))
					else if (fn_name == 'asec') parsed_value = radian_to_angle(math_asec(parsed_value))
					else if (fn_name == 'acot') parsed_value = radian_to_angle(math_acot(parsed_value))
					else if (fn_name == 'asinh') parsed_value = radian_to_angle(math_asinh(parsed_value))
					else if (fn_name == 'acosh') parsed_value = radian_to_angle(math_acosh(parsed_value))
					else if (fn_name == 'atanh') parsed_value = radian_to_angle(math_atanh(parsed_value))
					else if (fn_name == 'acsch') parsed_value = radian_to_angle(math_acsch(parsed_value))
					else if (fn_name == 'asech') parsed_value = radian_to_angle(math_asech(parsed_value))
					else if (fn_name == 'acoth') parsed_value = radian_to_angle(math_acoth(parsed_value))
					return number_to_real_digit(parsed_value)
				})
			}

			// remove brackets
			const brackets_regex = new RegExp(String.raw`(?<!${FUNCTION_REGEX})\(([+-]?${NUMBER_REGEX})\)`)
			while (regex_test(brackets_regex, input)) {
				has_operation = true
				input = string_replace(input, brackets_regex, (_, num1) => num1)
			}

			// square root operation
			const sqrt_regex = /√([-+]?\d+(?:\.\d+)?)/g
			while (regex_test(sqrt_regex, input)){
				has_operation = true
				input = string_replace(input, sqrt_regex, (_, num1) => {
					const parsed_value = number_parse(num1)
					if (parsed_value < 0) throw Error()
					return number_to_real_digit(math_sqrt(parsed_value))
				})
			}

			// percentage operation
			const percentage_regex = /(\d+(?:\.\d+)?)%/g
			while (regex_test(percentage_regex, input)){
				has_operation = true
				input = string_replace(
					input,
					percentage_regex,
					(_, num1) => number_to_real_digit(number_parse(num1) / 100)
				)
			}

			// factorial operation
			const factorial_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)!/g
			while (regex_test(factorial_regex, input)){
				has_operation = true
				input = string_replace(input, factorial_regex, (_, num1) => {
					let n = number_parse(num1)
					if (regex_test(/\./, number_to_real_digit(n)) || n < 0) throw Error()

					let result = 1
					while (n > 0) {
						result *= n
						n--
					}
					return number_to_real_digit(result)
				})
			}

			// exponential operation
			const exp_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)\^([+-]?\d+(?:\.\d+)?)/
			const exp_reverse_regex = /((?:\d+\.)?\d+[+-]?)\^((?:\d+\.)?\d+(?:[-+](?!\d))?)/
			const match = string_match(input, exp_regex)
			if (match) {
				has_operation = true
				input = string_reverse(input)

				while (regex_test(exp_reverse_regex, input)) {
					input = string_replace(
						input,
						exp_reverse_regex,
						(_, num2, num1) => string_reverse(number_to_real_digit(math_pow(
							number_parse(string_reverse(num1)),
							number_parse(string_reverse(num2))
						)))
					)
				}
				input = string_reverse(input)
			}

			// division & multiplication & modulus operation
			const div_mul_mod_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([*×\/÷]|mod)([+-]?\d+(?:\.\d+)?)/
			while (regex_test(div_mul_mod_regex, input)) {
				has_operation = true
				input = string_replace(input, div_mul_mod_regex, (_, num1, operator, num2) => {
					if (operator == 'mod') return number_to_real_digit(number_parse(num1) % number_parse(num2))
					else if (regex_test(/[*×]/, operator)) return number_to_real_digit(number_parse(num1) * number_parse(num2))
					else if (regex_test(/[\/÷]/, operator)) return number_to_real_digit(number_parse(num1) / number_parse(num2))
					return _
				})
			}


			// addition & substraction operation
			const add_sub_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)([+-])([+-]?\d+(?:\.\d+)?)/
			while (regex_test(add_sub_regex, input)) {
				has_operation = true
				input = string_replace(input, add_sub_regex, (_, num1, operator, num2) => {
					if (operator == '+') return number_to_real_digit(number_parse(num1) + number_parse(num2))
					if (operator == '-') return number_to_real_digit(number_parse(num1) - number_parse(num2))
					return _
				})
			}

			// shifting operation
			const lsh_rsh_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(lsh|rsh|<<|>>)([+-]?\d+(?:\.\d+)?)/
			while (regex_test(lsh_rsh_regex, input)) {
				has_operation = true
				input = string_replace(input, lsh_rsh_regex, (_, num1, operator, num2) => {
					const $num1: number = number_parse(num1)
					const $num2: number = number_parse(num2)
					if (regex_test(/\./, num1) || regex_test(/\./, num2)) throw Error()
					if (regex_test(/^(lsh|<<)$/, operator)) return number_to_real_digit($num1 << $num2)
					if (regex_test(/^(rsh|>>)$/, operator)) return number_to_real_digit($num1 >> $num2)
					return _
				})
			}

			// and operation
			const and_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:&|and)([+-]?\d+(?:\.\d+)?)/
			while (regex_test(and_regex, input)) {
				has_operation = true
				input = string_replace(input, and_regex, (_, num1, num2) =>  {
					if (regex_test(/\./, num1) || regex_test(/\./, num2)) throw Error()
					return number_to_real_digit(number_parse(num1) & number_parse(num2))
				})
			}

			// xor operation
			const xor_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)xor([+-]?\d+(?:\.\d+)?)/
			while (regex_test(xor_regex, input)) {
				has_operation = true
				input = string_replace(input, xor_regex, (_, num1, num2) => {
					if (regex_test(/\./, num1) || regex_test(/\./, num2)) throw Error()
					return number_to_real_digit(number_parse(num1) ^ number_parse(num2))
				})
			}

			// or operation
			const or_regex = /((?:(?<!\d)[-+])?\d+(?:\.\d+)?)(?:\||or)([+-]?\d+(?:\.\d+)?)/
			while (regex_test(or_regex, input)) {
				has_operation = true
				input = string_replace(input, or_regex, (_, num1, num2) => {
					if (regex_test(/\./, num1) || regex_test(/\./, num2)) throw Error()
					return number_to_real_digit(number_parse(num1) | number_parse(num2))
				})
			}

			if (!has_operation) break
		}

		const is_valid_value = (v: string) => regex_test(/^[+-]?\d+(?:\.\d+)?$/, v)

		if (calculator() == CalculatorType.basic) set_outputs('basic', is_valid_value(input)? number_parse(input) : null)
		else if (calculator() == CalculatorType.scientific) set_outputs('scientific', is_valid_value(input)? number_parse(input) : null)
		else if (calculator() == CalculatorType.programmer) set_outputs('programmer', is_valid_value(input)? number_parse(input) : null)
		else if (calculator() == CalculatorType.converter) {
			const converter = settings.converter
			input = number_to_real_digit(convert_unit(
				number_parse(input),
				converter.unit_input,
				converter.unit_output,
				converter.type
			))
			set_outputs('converter', is_valid_value(input)? number_parse(input) : null)
		}
	}

	function save_output(): void {
		const store_lastoutput = db.write_store(ObjectStoreNames.last_output)
		if (store_lastoutput == null) return

		let key = ObjectStoreKeys.lastoutput_basic
		let value = null
		if (calculator() == CalculatorType.basic) {
			key = ObjectStoreKeys.lastoutput_basic
			value = outputs.basic
		}
		else if (calculator() == CalculatorType.scientific) {
			key = ObjectStoreKeys.lastoutput_scientific
			value = outputs.scientific
		}
		else if (calculator() == CalculatorType.converter) {
			key = ObjectStoreKeys.lastoutput_converter
			value = outputs.converter
		}
		else if (calculator() == CalculatorType.programmer) {
			key = ObjectStoreKeys.lastoutput_programmer
			value = outputs.programmer
		}
		else if (calculator() == CalculatorType.date) {
			key = ObjectStoreKeys.lastoutput_date
			value = outputs.date
		}

		idb_store_put(store_lastoutput, {key, value})
	}

	function generate_output(): void {
		try { calculate() }
		catch (e) {
			let $calculator: 'basic' | 'scientific' | 'converter' | 'programmer' | 'date' = 'basic'
			if (calculator() == CalculatorType.basic) $calculator = 'basic'
			else if (calculator() == CalculatorType.scientific) $calculator = 'scientific'
			else if (calculator() == CalculatorType.converter) $calculator = 'converter'
			else if (calculator() == CalculatorType.programmer) $calculator = 'programmer'
			else if (calculator() == CalculatorType.date) $calculator = 'date'

			set_outputs($calculator, null)
		}
		save_output()
	}

	function init_note(): void {
		const store_miscellaneous = db.read_store(ObjectStoreNames.miscellaneous)
		if (store_miscellaneous == null) return

		promise_done(db.get<ObjectStoreMiscellaneous<string>>(
			store_miscellaneous,
			ObjectStoreKeys.miscellaneous_note
		), (result) => set_note(r => result?.value ?? r))
	}

	function init_last_page(): void {
		const store_miscellaneous = db.read_store(ObjectStoreNames.miscellaneous)
		if (store_miscellaneous == null) return

		promise_done(db.get<ObjectStoreMiscellaneous<CalculatorType>>(
			store_miscellaneous,
			ObjectStoreKeys.miscellaneous_lastpage
		), (result) => set_calculator(r => result?.value ?? r))
	}

	function init_settings(): void {
		const store_settings = db.read_store(ObjectStoreNames.settings)
		if (store_settings == null) return;

		promise_done(db.get<ObjectStoreSettings<DecimalNumberFormat>>(
			store_settings,
			ObjectStoreKeys.settings_numberformat_decimal
		), (result) => set_settings('number_format', 'decimal', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<GroupingNumberFormat>>(
			store_settings,
			ObjectStoreKeys.settings_numberformat_grouping
		), (result) => set_settings('number_format', 'grouping', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<boolean>>(
			store_settings,
			ObjectStoreKeys.settings_scientificnotation
		), (result) => set_settings('scientific_notation', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<boolean>>(
			store_settings,
			ObjectStoreKeys.settings_memorybuttons
		), (result) => set_settings('memory_buttons', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<ConverterType>>(
			store_settings,
			ObjectStoreKeys.settings_converter_type
		), (result) => set_settings('converter', 'type', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<ConverterUnitType>>(
			store_settings,
			ObjectStoreKeys.settings_converter_unitinput
		), (result) => set_settings('converter', 'unit_input', d => result? ConverterUnit.parse_json(result.value) : d))

		promise_done(db.get<ObjectStoreSettings<ConverterUnitType>>(
			store_settings,
			ObjectStoreKeys.settings_converter_unitoutput
		), (result) => set_settings('converter', 'unit_output', d => result? ConverterUnit.parse_json(result.value) : d))

		promise_done(db.get<ObjectStoreSettings<ScientificAngleType>>(
			store_settings,
			ObjectStoreKeys.settings_scientific_angle
		), (result) => set_settings('scientific', 'angle', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<NumberType>>(
			store_settings,
			ObjectStoreKeys.settings_programmer_numbertype
		), (result) => set_settings('programmer', 'number_type', d => result?.value ?? d))

		promise_done(db.get<ObjectStoreSettings<DateOperation>>(
			store_settings,
			ObjectStoreKeys.settings_date_operation
		), (result) => set_settings('date', 'operation', d => result?.value ?? d))
	}

	function init_last_output(): void {
		const store_lastoutput = db.read_store(ObjectStoreNames.last_output)
		if (store_lastoutput == null) return

		promise_done(db.get<ObjectStoreLastOutput<number>>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_basic
		), (result) => set_outputs('basic', o => result?.value ?? o))

		promise_done(db.get<ObjectStoreLastOutput<number>>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_scientific
		), (result) => set_outputs('scientific', o => result?.value ?? o))

		promise_done(db.get<ObjectStoreLastOutput<number>>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_converter
		), (result) => set_outputs('converter', o => result?.value ?? o))

		promise_done(db.get<ObjectStoreLastOutput<number>>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_programmer
		), (result) => set_outputs('programmer', o => result?.value ?? o))

		promise_done(db.get<ObjectStoreLastOutput<string>>(
			store_lastoutput,
			ObjectStoreKeys.lastoutput_date
		), (result) => set_outputs('date', o => result?.value ?? o))
	}

	function init_last_input(): void {
		const store_lastinput = db.read_store(ObjectStoreNames.last_input)
		if (store_lastinput == null) return;

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_basic
		), (result) => set_inputs('basic', i => result?.value ?? i))

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_scientific
		), (result) => set_inputs('scientific', i => result?.value ?? i))

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_converter
		), (result) => set_inputs('converter', i => result?.value ?? i))

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_programmer
		), (result) => set_inputs('programmer', i => result?.value ?? i))

		promise_done(db.get<ObjectStoreLastInput<number>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_date_year
		), (result) => set_inputs('date', 'year', i => result?.value ?? i))

		promise_done(db.get<ObjectStoreLastInput<number>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_date_month
		), (result) => set_inputs('date', 'month', i => result?.value ?? i))

		promise_done(db.get<ObjectStoreLastInput<number>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_date_day
		), (result) => set_inputs('date', 'day', i => result?.value ?? i))

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_date_from
		), (result) => set_inputs('date', 'from', i => result? new Date(date_parse(result.value)) : i))

		promise_done(db.get<ObjectStoreLastInput<string>>(
			store_lastinput,
			ObjectStoreKeys.lastinput_date_to
		), (result) => set_inputs('date', 'to', i => result? new Date(date_parse(result.value)) : i))
	}

	function init_database(): void {
		db.open({
			on_success() {
				init_settings()
				init_last_input()
				init_last_output()
				init_note()
				init_last_page()
			},
			on_upgrade_needed(_, db) {
				db.create_store<ObjectStoreSettings>({
					name: ObjectStoreNames.settings,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				db.create_store<ObjectStoreLastInput>({
					name: ObjectStoreNames.last_input,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				db.create_store<ObjectStoreLastOutput>({
					name: ObjectStoreNames.last_output,
					key_path: 'key',
					indexs: ['key', 'value']
				})
				db.create_store<ObjectStoreMiscellaneous>({
					name: ObjectStoreNames.miscellaneous,
					key_path: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	onMount(() => {
		init_database()
		remove_splash_screen()
	})

	return (<App
		appbar={<AppBar
			on_change_calculator={on_change_calculator}
			calculator={calculator()}
			command={command}
			settings={settings}
			note={note()}
			on_note_changed={on_note_changed}
			is_notebook_expanded={is_notebook_expanded()}
		/>}
		left_sidebar={<SideNavigation
			calculator={calculator()}
			on_change_calculator={on_change_calculator}
			expanded={is_sidenavigation_expanded()}
		/>}
		right_sidebar={<Notebook
			expanded={is_notebook_expanded()}
			note={note()}
			on_note_changed={on_note_changed}
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