import { createEffect, createMemo, createSignal, createUniqueId, For, Match, Show, Switch, type JSX, type ParentComponent, type VoidComponent } from "solid-js"

import type { CalculatorInput, CalculatorOutput, DateCalculatorInput, Settings } from "./_types"
import { CalculatorType, Commands, DateOperation, NumberType } from "./_enums"
import { element_dataset, element_focus, element_id, element_tagname, element_valid_target } from "@/utils/element"
import { classlist_module, attr_set_if_exist, classlist } from "@/utils/attributes"
import { CONVERTER_TYPES } from "./_constants"
import { ConverterType, UNIT_ANGLE, UNIT_AREA, UNIT_FREQUENCY, UNIT_LENGTH, UNIT_PRESSURE, UNIT_TEMPERATURE, UNIT_TIME, UNIT_VOLUME, UNIT_WEIGHT, type ConverterUnit } from "./_converter"
import { string_length, string_match, string_substring, string_totitlecase, string_touppercase, string_trim } from "@/utils/string"
import { event_current_target, event_prevent_default, event_target } from "@/utils/event"
import { date_year, date_text_YMD } from "@/utils/datetime"
import { number_to_binary, number_format, number_parse, number_to_real_digit, number_to_string, number_safe, number_is_not_defined } from "@/utils/number"
import { regex_test } from "@/utils/regex"
import { navigator_clipboard_writetext } from "@/utils/navigator"
import { ICON_ADD, ICON_ARROW_RIGHT, ICON_BACKSPACE, ICON_CALENDAR, ICON_COPY, ICON_DISMISS, ICON_LINE_HORIZONTAL_1, ICON_MATH_FORMULA, ICON_SLASH_FORWARD } from "@/constants/icons"

import { Tooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, IconButton } from "@/components/Button"
import { NumberTextField } from "@/components/TextField"
import Menu, { close_menu, MenuDivider, MenuItem, MenuPosition, open_menu } from "@/components/Menu"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import DatePicker, { open_datepicker } from "@/components/DatePicker"
import CSSMiscellaneous from '@/styles/miscellaneous.module.scss'
import CSS from './_styles.module.scss'
import { document_active } from "@/utils/document"
import { valid_enum_value } from "@/utils/object"

const ActionButtons: ParentComponent<JSX.HTMLAttributes<HTMLDivElement> & {
	command: (type: Commands, ...args: unknown[]) => unknown
	memory: number
	settings: Settings
	on_recall_memory: (memory: number) => unknown
	hide?: boolean
}> = (props) => {
	const [is_menu_memory_open, set_is_menu_memory_open] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings)
	const button_memory_id = createUniqueId()
	const button_clear_id = createUniqueId()
	const button_recall_id = createUniqueId()
	const button_add_id = createUniqueId()
	const button_subtract_id = createUniqueId()
	let menu_memory_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<div class={CSS.input_output_action_buttons} data-hidden={attr_set_if_exist(props.hide)}>
		{props.children}
		<div
			class={CSS.input_output_memory_buttons}
			data-hidden={attr_set_if_exist(!settings().memory_buttons)}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
				case button_memory_id:
					open_menu(ev, menu_memory_ref, { anchor: button })
					break
				case button_clear_id:
					command(Commands.clear_memory)
					break
				case button_recall_id:
					props.on_recall_memory(props.memory)
					break
				case button_add_id:
					command(Commands.add_memory)
					break
				case button_subtract_id:
					command(Commands.subtract_memory)
					break
				}
			}}>
			<Button
				data-tooltip={"Memory value " + `(${props.memory})`}
				id={button_memory_id}
				c_focused={is_menu_memory_open()}>
				M
			</Button>
			<Menu
				classList={classlist_module(CSS.input_output_memory_menu)}
				c_on_toggleopen={(v) => set_is_menu_memory_open(v)}
				ref={r => menu_memory_ref = r}>
				<p>Memory value:</p>
				<p>{props.memory}</p>
			</Menu>
			<Button
				data-tooltip="Memory clear"
				id={button_clear_id}>
				MC
			</Button>
			<Button
				data-tooltip="Memory recall"
				id={button_recall_id}>
				MR
			</Button>
			<Button
				data-tooltip="Memory add"
				id={button_add_id}>
				M+
			</Button>
			<Button
				data-tooltip="Memory subtract"
				id={button_subtract_id}>
				M-
			</Button>
		</div>
	</div>)
}

const BasicCalculator: VoidComponent<{
	settings: Settings
	input: string
	memory: number
	output: number | null
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const settings = createMemo(() => props.settings)
	const output = createMemo(() => props.output)
	const button_clear_id = createUniqueId()
	const button_backspace_id = createUniqueId()
	const button_equal_id = createUniqueId()
	let input_ref: HTMLInputElement
	let caret_pos: number = 0

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function add_char(char: string): void {
		let value = input_ref.value
		const prefix = string_substring(value, 0, caret_pos)
		const suffix = string_substring(value, caret_pos)
		value = prefix + char + suffix
		input_ref.value = value
		caret_pos += string_length(char)
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, value)
	}

	function backspace(): void {
		let value = input_ref.value
		const prefix = string_substring(value, 0, caret_pos-1)
		const suffix = string_substring(value, caret_pos)
		value = prefix + suffix
		input_ref.value = value
		--caret_pos
		if (caret_pos < 0) caret_pos = 0
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, value)
	}

	function clear(): void {
		caret_pos = 0
		input_ref.value = ''
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, '')
	}

	function equal(): void {
		if (output() == null) return;

		caret_pos = string_length(number_to_string(output()!))
		input_ref.value = number_to_string(output()!)
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, number_to_real_digit(output()!))
	}

	createEffect(() => {
		input_ref.value = props.input
		element_focus(input_ref)
	})

	return (<>
		<input
			ref={r => input_ref = r}
			inputMode="none"
			class={CSS.input_output_basic_text_input}
			type="text"
			onKeyDown={ev => {
				if (!(ev.code == "Equal" && !ev.shiftKey)) return
				equal()
				event_prevent_default(ev)
			}}
			onFocus={ev => caret_pos = event_current_target(ev).selectionStart ?? caret_pos}
			onBlur={ev => caret_pos = event_current_target(ev).selectionStart ?? caret_pos}
			onInput={ev => command(Commands.change_calculator_input, event_current_target(ev).value)}
		/>
		<div
			class={classlist(CSS.input_output_basic_text_output, CSSMiscellaneous.no_scrollbar)}>
			<Show
				when={settings().scientific_notation}
				fallback={output() != null && number_format(output()!, {
					decimal: settings().number_format.decimal,
					thousand: settings().number_format.grouping
				})}>
				{output() != null && (regex_test(/[eE]/, number_to_string(output()!))
					? string_touppercase(number_to_string(output()!))
					: number_format(output()!, {
						decimal: settings().number_format.decimal,
						thousand: settings().number_format.grouping
					})
				)}
			</Show>
		</div>
		<ActionButtons
			command={command}
			memory={props.memory}
			on_recall_memory={(v) => add_char(number_to_real_digit(v))}
			settings={settings()}
			hide={!settings().memory_buttons}
		/>
		<div
			class={CSS.input_output_basic_buttons}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
				case button_clear_id:
					clear()
					break
				case button_backspace_id:
					backspace()
					break
				case button_equal_id:
					equal()
					break
				default:
					const data_char = element_dataset(button, 'char')
					if (data_char) return add_char(data_char)
				}
			}}>
			<Button data-char="%">%</Button>
			<Button data-char="√">√</Button>
			<Button id={button_clear_id} classList={classlist_module(CSS.input_output_remove_symbol)}>C</Button>
			<Button id={button_backspace_id} classList={classlist_module(CSS.input_output_remove_symbol)}><Icon c_code={ICON_BACKSPACE} /></Button>

			<Button data-char="7" c_variant={ButtonVariant.tonal}>7</Button>
			<Button data-char="8" c_variant={ButtonVariant.tonal}>8</Button>
			<Button data-char="9" c_variant={ButtonVariant.tonal}>9</Button>
			<Button data-char="÷"><Icon c_code={ICON_SLASH_FORWARD}/></Button>

			<Button data-char="4" c_variant={ButtonVariant.tonal}>4</Button>
			<Button data-char="5" c_variant={ButtonVariant.tonal}>5</Button>
			<Button data-char="6" c_variant={ButtonVariant.tonal}>6</Button>
			<Button data-char="×"><Icon c_code={ICON_DISMISS}/></Button>

			<Button data-char="1" c_variant={ButtonVariant.tonal}>1</Button>
			<Button data-char="2" c_variant={ButtonVariant.tonal}>2</Button>
			<Button data-char="3" c_variant={ButtonVariant.tonal}>3</Button>
			<Button data-char="-"><Icon c_code={ICON_LINE_HORIZONTAL_1} /></Button>

			<Button data-char={settings().number_format.decimal}>{settings().number_format.decimal}</Button>
			<Button data-char="0" c_variant={ButtonVariant.tonal}>0</Button>
			<Button id={button_equal_id} c_variant={ButtonVariant.filled}>=</Button>
			<Button data-char="+"><Icon c_code={ICON_ADD}/></Button>
		</div>
	</>)
}

const ScientificCalculator: VoidComponent<{
	settings: Settings
	input: string
	memory: number
	output: number | null
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [is_menu_function_open, set_is_menu_function_open] = createSignal<boolean>(false)
	const [is_hyperbolic, set_is_hyperbolic] = createSignal<boolean>(false)
	const [is_inverse, set_is_inverse] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings)
	const output = createMemo(() => props.output)
	const get_trigonometry = createMemo<string[]>(() => {
		const i = () => is_inverse()? 'a' : ''
		const h = () => is_hyperbolic()? 'h' : ''
		return [
			i() + 'sin' + h(),
			i() + 'cos' + h(),
			i() + 'tan' + h(),
			i() + 'csc' + h(),
			i() + 'sec' + h(),
			i() + 'cot' + h()
		]
	})
	const button_clear_id = createUniqueId()
	const button_backspace_id = createUniqueId()
	const button_equal_id = createUniqueId()
	const button_inverse_id = createUniqueId()
	const button_hyperbolic_id = createUniqueId()
	let input_ref: HTMLInputElement
	let menu_function_ref: HTMLDialogElement
	let caret_pos: number = 0

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function add_char(char: string): void {
		let value = input_ref.value
		const prefix = string_substring(value, 0, caret_pos)
		const suffix = string_substring(value, caret_pos)
		value = prefix + char + suffix
		input_ref.value = value
		caret_pos += string_length(char)
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, value)
	}

	function backspace(): void {
		let value = input_ref.value
		const prefix = string_substring(value, 0, caret_pos-1)
		const suffix = string_substring(value, caret_pos)
		value = prefix + suffix
		input_ref.value = value
		--caret_pos
		if (caret_pos < 0) caret_pos = 0
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, value)
	}

	function clear(): void {
		caret_pos = 0
		input_ref.value = ''
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, '')
	}

	function equal(): void {
		if (output() == null) return;

		caret_pos = string_length(number_to_string(output()!))
		input_ref.value = number_to_string(output()!)
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, number_to_real_digit(output()!))
	}

	createEffect(() => {
		input_ref.value = props.input
		element_focus(input_ref)
	})

	return (<>
		<input
			ref={r => input_ref = r}
			inputMode="none"
			class={CSS.input_output_scientific_text_input}
			type="text"
			onKeyDown={ev => {
				if (!(ev.code == "Equal" && !ev.shiftKey)) return
				equal()
				event_prevent_default(ev)
			}}
			onFocus={ev => caret_pos = event_current_target(ev).selectionStart ?? caret_pos}
			onBlur={ev => caret_pos = event_current_target(ev).selectionStart ?? caret_pos}
			onInput={ev => command(Commands.change_calculator_input, event_current_target(ev).value)}
		/>
		<div
			class={classlist(
				CSS.input_output_scientific_text_output,
				CSSMiscellaneous.no_scrollbar
			)}>
			<Show
				when={settings().scientific_notation}
				fallback={output() != null && number_format(output()!, {
					decimal: settings().number_format.decimal,
					thousand: settings().number_format.grouping
				})}>
				{output() != null && (regex_test(/[eE]/, number_to_string(output()!))
					? string_touppercase(number_to_string(output()!))
					: number_format(output()!, {
						decimal: settings().number_format.decimal,
						thousand: settings().number_format.grouping
					})
				)}
			</Show>
		</div>
		<ActionButtons
			command={command}
			memory={props.memory}
			on_recall_memory={(v) => add_char(number_to_real_digit(v))}
			settings={settings()}>
			<Button
				onClick={ev => open_menu(ev, menu_function_ref, {
					anchor: event_current_target(ev),
					position: MenuPosition.center_bottom_to_right
				})}
				c_focused={is_menu_function_open()}>
				<Icon c_code={ICON_MATH_FORMULA}/>
				Function
			</Button>
			<Menu
				classList={classlist_module(CSS.input_output_scientific_function_menu)}
				ref={r => menu_function_ref = r}
				c_on_toggleopen={(v) => set_is_menu_function_open(v)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					switch (element_id(button)) {
					case button_inverse_id:
						set_is_inverse(v => !v)
						break
					case button_hyperbolic_id:
						set_is_hyperbolic(v => !v)
						break
					default:
						const data_char = element_dataset(button, 'char')
						if (data_char) return add_char(data_char)
					}
				}}>
				<div class={CSS.input_output_trigonometry_options}>
					<MenuItem c_checked={is_inverse()} id={button_inverse_id}>Invers</MenuItem>
					<MenuItem c_checked={is_hyperbolic()} id={button_hyperbolic_id}>Hyperbolic</MenuItem>
				</div>
				<div class={CSS.input_output_grid_3}>
					<For each={get_trigonometry()}>{t => <MenuItem data-char={t + '('}>{`${t}(x)`}</MenuItem>}</For>
				</div>
				<MenuDivider />
				<div class={CSS.input_output_grid_3}>
					<MenuItem data-char="abs(">abs(x)</MenuItem>
					<MenuItem data-char="log(">log(x)</MenuItem>
					<MenuItem data-char="ln(">ln(x)</MenuItem>
					<MenuItem data-char="ceil(">ceil(x)</MenuItem>
					<MenuItem data-char="round(">round(x)</MenuItem>
					<MenuItem data-char="floor(">floor(x)</MenuItem>
				</div>
			</Menu>
			<Button
				data-tooltip="Angle mode"
				style={{width: '68px'}}
				onClick={() => command(Commands.toggle_settings_scientific_angle)}>
				{settings().scientific.angle}
			</Button>
		</ActionButtons>
		<div
			class={CSS.input_output_scientific_buttons}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
				case button_clear_id:
					clear()
					break
				case button_backspace_id:
					backspace()
					break
				case button_equal_id:
					equal()
					break
				default:
					const data_char = element_dataset(button, 'char')
					if (data_char) return add_char(data_char)
				}
			}}>
			<Button data-char="mod">mod</Button>
			<Button data-char="(">{'('}</Button>
			<Button data-char=")">{')'}</Button>
			<Button id={button_clear_id} classList={classlist_module(CSS.input_output_remove_symbol)}>C</Button>
			<Button id={button_backspace_id} classList={classlist_module(CSS.input_output_remove_symbol)}><Icon c_code={ICON_BACKSPACE} /></Button>

			<Button data-char="%">%</Button>
			<Button data-char="10^">10^</Button>
			<Button data-char="^2">^2</Button>
			<Button data-char="e^">e^</Button>
			<Button data-char="^">^</Button>

			<Button data-char="!">!</Button>
			<Button data-char="7" c_variant={ButtonVariant.tonal}>7</Button>
			<Button data-char="8" c_variant={ButtonVariant.tonal}>8</Button>
			<Button data-char="9" c_variant={ButtonVariant.tonal}>9</Button>
			<Button data-char="÷" ><Icon c_code={ICON_SLASH_FORWARD}/></Button>

			<Button data-char="e">e</Button>
			<Button data-char="4" c_variant={ButtonVariant.tonal}>4</Button>
			<Button data-char="5" c_variant={ButtonVariant.tonal}>5</Button>
			<Button data-char="6" c_variant={ButtonVariant.tonal}>6</Button>
			<Button data-char="×"><Icon c_code={ICON_DISMISS}/></Button>

			<Button data-char="π">π</Button>
			<Button data-char="1" c_variant={ButtonVariant.tonal}>1</Button>
			<Button data-char="2" c_variant={ButtonVariant.tonal}>2</Button>
			<Button data-char="3" c_variant={ButtonVariant.tonal}>3</Button>
			<Button data-char="-"><Icon c_code={ICON_LINE_HORIZONTAL_1} /></Button>

			<Button data-char="√">√</Button>
			<Button data-char={settings().number_format.decimal}>{settings().number_format.decimal}</Button>
			<Button data-char="0" c_variant={ButtonVariant.tonal}>0</Button>
			<Button id={button_equal_id} c_variant={ButtonVariant.filled}>=</Button>
			<Button data-char="+"><Icon c_code={ICON_ADD}/></Button>
		</div>
	</>)
}

const ConverterCalculator: VoidComponent<{
	settings: Settings
	input: string
	memory: number
	output: number | null
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const [is_menu_convertertype_open, set_is_menu_convertertype_open] = createSignal<boolean>(false)
	const [is_menu_inputunit_open, set_is_menu_inputunit_open] = createSignal<boolean>(false)
	const [is_menu_outputunit_open, set_is_menu_outputunit_open] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings)
	const output = createMemo(() => props.output)
	const input = createMemo(() => props.input)
	const get_converter_icon = createMemo<number>(() => {
		for (const c of CONVERTER_TYPES) {
			if (c.type == settings().converter.type) return c.icon
		}
		return 0
	})
	const get_units = createMemo<ConverterUnit[]>(() => {
		const type = settings().converter.type
		if (type == ConverterType.length) return UNIT_LENGTH
		if (type == ConverterType.area) return UNIT_AREA
		if (type == ConverterType.volume) return UNIT_VOLUME
		if (type == ConverterType.temperature) return UNIT_TEMPERATURE
		if (type == ConverterType.time) return UNIT_TIME
		if (type == ConverterType.weight) return UNIT_WEIGHT
		if (type == ConverterType.frequency) return UNIT_FREQUENCY
		if (type == ConverterType.pressure) return UNIT_PRESSURE
		if (type == ConverterType.angle) return UNIT_ANGLE
		return []
	})
	const get_converter_name = createMemo<string>(() => {
		const type = settings().converter.type
		if (type == ConverterType.weight) return 'Weight & mass'
		return string_totitlecase(type)
	})
	const button_clear_id = createUniqueId()
	const button_backspace_id = createUniqueId()
	const button_equal_id = createUniqueId()
	const button_plusminus_id = createUniqueId()
	let input_ref: HTMLInputElement
	let menu_convertertype_ref: HTMLDialogElement
	let menu_inputunit_ref: HTMLDialogElement
	let menu_outputunit_ref: HTMLDialogElement
	let caret_pos: number = 0

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function add_char(char: string): void {
		let value = input_ref.value
		const prefix = string_substring(value, 0, caret_pos)
		const suffix = string_substring(value, caret_pos)
		value = prefix + char + suffix
		input_ref.value = value
		caret_pos += string_length(char)
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, value)
	}

	function backspace(): void {
		let value = input_ref.value
		const prefix = string_substring(value, 0, caret_pos-1)
		const suffix = string_substring(value, caret_pos)
		value = prefix + suffix
		input_ref.value = value
		--caret_pos
		if (caret_pos < 0) caret_pos = 0
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, value)
	}

	function clear(): void {
		caret_pos = 0
		input_ref.value = ''
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, '')
	}

	function equal(): void {
		if (output() == null) return;

		caret_pos = string_length(number_to_string(output()!))
		input_ref.value = number_to_string(output()!)
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, number_to_real_digit(output()!))
	}

	function plus_minus(): void {
		const re = /(.*?)([-+]{0,2})(\d*(?:\.\d*)?)$/s
		const match = string_match(string_substring(input(), 0, caret_pos), re)
		let value: string = input()
		if (string_trim(input()) == '') {
			value = '-'
			caret_pos = 1
		}
		else if (match) {
			const pre = match[1] ?? ''
			const sign = match[2] ?? ''
			const number = match[3] ?? ''

			if (
				sign == '+-'
				|| sign == '-'
				|| sign == '-+'
			) {
				value = '+' + number
				if (pre == '') value = number
			}
			else if (
				sign == '--'
				|| sign == '+'
				|| sign == '++'
				|| sign == ''
			) value = '-' + number

			const prefix = string_substring(input(), 0, string_length(pre))
			const suffix = string_substring(input(), caret_pos)
			caret_pos = string_length(prefix) + string_length(value)
			value = prefix + value + suffix
		}

		input_ref.value = value
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, value)
	}

	createEffect(() => {
		input_ref.value = input()
		element_focus(input_ref)
	})

	return (<>
		<input
			ref={r => input_ref = r}
			inputMode="none"
			class={CSS.input_output_converter_text_input}
			type="text"
			onKeyDown={ev => {
				if (!(ev.code == "Equal" && !ev.shiftKey)) return
				equal()
				event_prevent_default(ev)
			}}
			onFocus={ev => caret_pos = event_current_target(ev).selectionStart ?? caret_pos}
			onBlur={ev => caret_pos = event_current_target(ev).selectionStart ?? caret_pos}
			onInput={ev => command(Commands.change_calculator_input, event_current_target(ev).value)}
		/>
		<div
			class={classlist(
				CSS.input_output_converter_text_output,
				CSSMiscellaneous.no_scrollbar
			)}>
			<Show
				when={settings().scientific_notation}
				fallback={output() != null && number_format(output()!, {
					decimal: settings().number_format.decimal,
					thousand: settings().number_format.grouping
				})}>
				{output() != null && (regex_test(/[eE]/, number_to_string(output()!))
					? string_touppercase(number_to_string(output()!))
					: number_format(output()!, {
						decimal: settings().number_format.decimal,
						thousand: settings().number_format.grouping
					})
				)}
			</Show>
		</div>
		<ActionButtons
			command={command}
			memory={props.memory}
			on_recall_memory={(v) => add_char(number_to_real_digit(v))}
			settings={settings()}>
			<Button
				data-tooltip="Select converter type"
				c_focused={is_menu_convertertype_open()}
				onClick={ev => open_menu(ev, menu_convertertype_ref, {
					anchor: event_current_target(ev),
					position: MenuPosition.center_bottom_to_right,
					allow_hide_anchor: false
				})}
				c_variant={ButtonVariant.tonal}>
				<Icon c_code={get_converter_icon()}/>
				{get_converter_name()}
			</Button>

			<Menu
				ref={r => menu_convertertype_ref = r}
				c_on_toggleopen={v => set_is_menu_convertertype_open(v)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == 'BUTTON'
					)) return

					const data_type = element_dataset(button, 'type')
					if (data_type
						&& valid_enum_value(data_type, ConverterType)
					) {
						command(Commands.change_settings_converter_type, data_type)
						close_menu(menu_convertertype_ref)
						return
					}
				}}>
				<For each={CONVERTER_TYPES}>{c =>
					<MenuItem
						c_selected={c.type == settings().converter.type}
						data-type={c.type}
						c_leading={<Icon c_code={c.icon}/>}>
						{c.text}
					</MenuItem>
				}</For>
			</Menu>

			<div class={CSS.input_output_converter_units}>
				<Button
					data-tooltip="Select input unit"
					c_focused={is_menu_inputunit_open()}
					onClick={ev => open_menu(ev, menu_inputunit_ref, {
						anchor: event_current_target(ev),
						position: MenuPosition.center_bottom_to_right,
						allow_hide_anchor: false
					})}
					style={{color: 'rgb(var(--g-color-accent))'}}>
					{settings().converter.unit_input.name + ` (${settings().converter.unit_input.symbol})`}
				</Button>

				<Menu
					ref={r => menu_inputunit_ref = r}
					c_on_toggleopen={v => set_is_menu_inputunit_open(v)}
					onClick={ev => {
						const button = document_active()!
						if (!element_valid_target(
							event_current_target(ev),
							button,
							el => element_tagname(el) == "BUTTON"
						)) return

						const data_index = element_dataset(button, 'index')
						if (data_index) {
							const index = number_parse(data_index, true)
							if (number_is_not_defined(index)) return

							const unit = get_units()[index]
							if (!unit) return

							command(Commands.change_settings_converter_inputunit, unit)
							close_menu(menu_inputunit_ref)
							return
						}
					}}>
					<For each={get_units()}>{(u, i) =>
						<MenuItem
							data-index={i()}
							c_selected={u.equals(settings().converter.unit_input)}>
							{u.name + ` (${u.symbol})`}
						</MenuItem>
					}</For>
				</Menu>
				<IconButton
					data-tooltip="Swap unit"
					onClick={() => command(Commands.change_settings_converter_swapunit)}
					c_code={ICON_ARROW_RIGHT}
				/>
				<Button
					data-tooltip="Select output unit"
					c_focused={is_menu_outputunit_open()}
					onClick={ev => open_menu(ev, menu_outputunit_ref, {
						anchor: event_current_target(ev),
						position: MenuPosition.center_bottom_to_right,
						allow_hide_anchor: false
					})}
					style={{color: 'rgb(var(--g-color-accent))'}}>
					{settings().converter.unit_output.name + ` (${settings().converter.unit_output.symbol})`}
				</Button>
			</div>

			<Menu
				ref={r => menu_outputunit_ref = r}
				c_on_toggleopen={v => set_is_menu_outputunit_open(v)}
				onClick={ev => {
					const button = document_active()!
					if (!element_valid_target(
						event_current_target(ev),
						button,
						el => element_tagname(el) == "BUTTON"
					)) return

					const data_index = element_dataset(button, 'index')
					if (data_index) {
						const index = number_parse(data_index, true)
						if (number_is_not_defined(index)) return

						const unit = get_units()[index]
						if (!unit) return

						command(Commands.change_settings_converter_outputunit, unit)
						close_menu(menu_inputunit_ref)
						return
					}
				}}>
				<For each={get_units()}>{(u, i) =>
					<MenuItem
						data-index={i()}
						c_selected={u.equals(settings().converter.unit_output)}>
						{u.name + ` (${u.symbol})`}
					</MenuItem>
				}</For>
			</Menu>
		</ActionButtons>
		<div
			class={CSS.input_output_converter_buttons}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
				case button_clear_id:
					clear()
					break
				case button_backspace_id:
					backspace()
					break
				case button_equal_id:
					equal()
					break
				case button_plusminus_id:
					plus_minus()
					break
				default:
					const data_char = element_dataset(button, 'char')
					if (data_char) return add_char(data_char)
				}
			}}>
			<Button id={button_plusminus_id}>±</Button>
			<Button id={button_clear_id} classList={classlist_module(CSS.input_output_remove_symbol)}>C</Button>
			<Button id={button_backspace_id} classList={classlist_module(CSS.input_output_remove_symbol)}><Icon c_code={ICON_BACKSPACE} /></Button>

			<Button data-char="7" c_variant={ButtonVariant.tonal}>7</Button>
			<Button data-char="8" c_variant={ButtonVariant.tonal}>8</Button>
			<Button data-char="9" c_variant={ButtonVariant.tonal}>9</Button>

			<Button data-char="4" c_variant={ButtonVariant.tonal}>4</Button>
			<Button data-char="5" c_variant={ButtonVariant.tonal}>5</Button>
			<Button data-char="6" c_variant={ButtonVariant.tonal}>6</Button>

			<Button data-char="1" c_variant={ButtonVariant.tonal}>1</Button>
			<Button data-char="2" c_variant={ButtonVariant.tonal}>2</Button>
			<Button data-char="3" c_variant={ButtonVariant.tonal}>3</Button>

			<Button data-char={settings().number_format.decimal}>{settings().number_format.decimal}</Button>
			<Button data-char="0" c_variant={ButtonVariant.tonal}>0</Button>
			<Button id={button_equal_id} c_variant={ButtonVariant.filled}>=</Button>
		</div>
	</>)
}

const ProgrammerCalculator: VoidComponent<{
	settings: Settings
	input: string
	memory: number
	output: number | null
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const settings = createMemo(() => props.settings)
	const output = createMemo(() => props.output)
	const output_decimal = createMemo<string>(() => {
		if (output() == null) return ''

		if (settings().scientific_notation) return (regex_test(/[eE]/, number_to_string(output()!))
			? string_touppercase(number_to_string(output()!))
			: number_format(output()!, {
				decimal: settings().number_format.decimal,
				thousand: settings().number_format.grouping
			})
		)

		return number_format(output()!, {
			decimal: settings().number_format.decimal,
			thousand: settings().number_format.grouping
		})
	})
	const output_binary = createMemo<string>(() => output() != null
		? number_to_binary(output()!)
		: ''
	)
	const output_hexadecimal = createMemo<string>(() => output() != null
		? string_touppercase(number_to_string(number_parse(output_binary(), true, 2), 16))
		: ''
	)
	const output_octal = createMemo<string>(() => output() != null
		? number_to_string(number_parse(output_binary(), true, 2), 8)
		: ''
	)
	const is_dec = createMemo(() => settings().programmer.number_type == NumberType.decimal)
	const is_hex = createMemo(() => settings().programmer.number_type == NumberType.hexadecimal)
	const is_oct = createMemo(() => settings().programmer.number_type == NumberType.octal)
	const is_bin = createMemo(() => settings().programmer.number_type == NumberType.binary)
	const button_clear_id = createUniqueId()
	const button_backspace_id = createUniqueId()
	const button_equal_id = createUniqueId()
	let menu_copy_ref: HTMLDialogElement
	let input_ref: HTMLInputElement
	let caret_pos: number = 0
	let text_to_copy: string = ''

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function add_char(char: string): void {
		let value = input_ref.value
		const prefix = string_substring(value, 0, caret_pos)
		const suffix = string_substring(value, caret_pos)
		value = prefix + char + suffix
		input_ref.value = value
		caret_pos += string_length(char)
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, value)
	}

	function backspace(): void {
		let value = input_ref.value
		const prefix = string_substring(value, 0, caret_pos-1)
		const suffix = string_substring(value, caret_pos)
		value = prefix + suffix
		input_ref.value = value
		--caret_pos
		if (caret_pos < 0) caret_pos = 0
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, value)
	}

	function clear(): void {
		caret_pos = 0
		input_ref.value = ''
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, '')
	}

	function equal(): void {
		if (output() == null) return;

		let $output = number_to_string(output()!)
		const type = settings().programmer.number_type
		if (type == NumberType.hexadecimal) $output = output_hexadecimal()
		else if (type == NumberType.octal) $output = output_octal()
		else if (type == NumberType.binary) $output = output_binary()

		caret_pos = string_length($output)
		input_ref.value = $output
		input_ref.setSelectionRange(caret_pos, caret_pos)
		element_focus(input_ref)
		command(Commands.change_calculator_input, $output)
	}

	function on_recall_memory(value: number): void {
		const type = settings().programmer.number_type
		let $value = ''

		if (type == NumberType.decimal) $value = number_to_real_digit(value)
		else if (type == NumberType.hexadecimal) $value = string_touppercase(number_to_string(number_parse(number_to_binary(value), true, 2), 16))
		else if (type == NumberType.octal) $value = number_to_string(number_parse(number_to_binary(value), true, 2), 8)
		else if (type == NumberType.binary) $value = number_to_binary(value)

		add_char($value)
	}

	createEffect(() => {
		input_ref.value = props.input
		element_focus(input_ref)
	})

	return (<>
		<input
			ref={r => input_ref = r}
			inputMode="none"
			class={CSS.input_output_programmer_text_input}
			type="text"
			onKeyDown={ev => {
				if (!(ev.code == "Equal" && !ev.shiftKey)) return
				equal()
				event_prevent_default(ev)
			}}
			onFocus={ev => caret_pos = event_current_target(ev).selectionStart ?? caret_pos}
			onBlur={ev => caret_pos = event_current_target(ev).selectionStart ?? caret_pos}
			onInput={ev => command(Commands.change_calculator_input, event_current_target(ev).value)}
		/>
		<div
			class={classlist(
				CSS.input_output_programmer_text_output,
				CSSMiscellaneous.no_scrollbar
			)}>
			<Button
				c_selected={settings().programmer.number_type == NumberType.decimal}
				c_indicator_position={ButtonIndicatorPosition.right}
				onClick={() => command(Commands.change_settings_programmer_numbertype, NumberType.decimal)}
				onContextMenu={(ev) => {
					event_prevent_default(ev)
					text_to_copy = output_decimal()
					open_menu(ev, menu_copy_ref)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}>{output_decimal()}</div>
				<span>DEC</span>
			</Button>
			<Button
				c_selected={settings().programmer.number_type == NumberType.hexadecimal}
				c_indicator_position={ButtonIndicatorPosition.right}
				onClick={() => command(Commands.change_settings_programmer_numbertype, NumberType.hexadecimal)}
				onContextMenu={(ev) => {
					event_prevent_default(ev)
					if (output() == null) return;

					text_to_copy = output_hexadecimal()
					open_menu(ev, menu_copy_ref)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}>{output_hexadecimal()}</div>
				<span>HEX</span>
			</Button>
			<Button
				c_selected={settings().programmer.number_type == NumberType.octal}
				c_indicator_position={ButtonIndicatorPosition.right}
				onClick={() => command(Commands.change_settings_programmer_numbertype, NumberType.octal)}
				onContextMenu={(ev) => {
					event_prevent_default(ev)
					if (output() == null) return;

					text_to_copy = output_octal()
					open_menu(ev, menu_copy_ref)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}>{output_octal()}</div>
				<span>OCT</span>
			</Button>
			<Button
				c_selected={settings().programmer.number_type == NumberType.binary}
				c_indicator_position={ButtonIndicatorPosition.right}
				onClick={() => command(Commands.change_settings_programmer_numbertype, NumberType.binary)}
				onContextMenu={(ev) => {
					event_prevent_default(ev)
					if (output() == null) return;

					text_to_copy = output_binary()
					open_menu(ev, menu_copy_ref)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}><Show when={output() != null}>{output_binary()}</Show></div>
				<span>BIN</span>
			</Button>

			<Menu ref={r => menu_copy_ref = r}>
				<MenuItem onClick={() => {
					navigator_clipboard_writetext(text_to_copy)
					close_menu(menu_copy_ref)
				}} c_leading={<Icon c_code={ICON_COPY}/>}>Copy</MenuItem>
			</Menu>
		</div>
		<ActionButtons
			command={command}
			memory={props.memory}
			on_recall_memory={on_recall_memory}
			hide={!settings().memory_buttons}
			settings={settings()}
		/>
		<div
			class={CSS.input_output_programmer_buttons}
			onClick={ev => {
				const button = document_active()!
				if (!element_valid_target(
					event_current_target(ev),
					button,
					el => element_tagname(el) == 'BUTTON'
				)) return

				switch (element_id(button)) {
				case button_clear_id:
					clear()
					break
				case button_backspace_id:
					backspace()
					break
				case button_equal_id:
					equal()
					break
				default:
					const data_char = element_dataset(button, 'char')
					if (data_char) return add_char(data_char)
				}
			}}>
			<div />
			<Button data-char="(">{'('}</Button>
			<Button data-char=")">{')'}</Button>
			<Button id={button_clear_id} classList={classlist_module(CSS.input_output_remove_symbol)}>C</Button>
			<Button id={button_backspace_id} classList={classlist_module(CSS.input_output_remove_symbol)}><Icon c_code={ICON_BACKSPACE} /></Button>

			<Button data-char="F" disabled={!is_hex()} c_variant={ButtonVariant.tonal}>F</Button>
			<Button data-char="not(">not</Button>
			<Button data-char="mod">mod</Button>
			<Button data-char="lsh">lsh</Button>
			<Button data-char="rsh">rsh</Button>

			<Button data-char="E" disabled={!is_hex()} c_variant={ButtonVariant.tonal}>E</Button>
			<Button data-char="or">or</Button>
			<Button data-char="and">and</Button>
			<Button data-char="xor">xor</Button>
			<Button data-char="^">^</Button>

			<Button data-char="D" disabled={!is_hex()} c_variant={ButtonVariant.tonal}>D</Button>
			<Button data-char="7" disabled={is_bin()} c_variant={ButtonVariant.tonal}>7</Button>
			<Button data-char="8" disabled={is_oct() || is_bin()} c_variant={ButtonVariant.tonal}>8</Button>
			<Button data-char="9" disabled={is_oct() || is_bin()} c_variant={ButtonVariant.tonal}>9</Button>
			<Button data-char="÷" ><Icon c_code={ICON_SLASH_FORWARD}/></Button>

			<Button data-char="C" disabled={!is_hex()} c_variant={ButtonVariant.tonal}>C</Button>
			<Button data-char="4" disabled={is_bin()} c_variant={ButtonVariant.tonal}>4</Button>
			<Button data-char="5" disabled={is_bin()} c_variant={ButtonVariant.tonal}>5</Button>
			<Button data-char="6" disabled={is_bin()} c_variant={ButtonVariant.tonal}>6</Button>
			<Button data-char="×"><Icon c_code={ICON_DISMISS}/></Button>

			<Button data-char="B" disabled={!is_hex()} c_variant={ButtonVariant.tonal}>B</Button>
			<Button data-char="1" c_variant={ButtonVariant.tonal}>1</Button>
			<Button data-char="2" disabled={is_bin() } c_variant={ButtonVariant.tonal}>2</Button>
			<Button data-char="3" disabled={is_bin() } c_variant={ButtonVariant.tonal}>3</Button>
			<Button data-char="-"><Icon c_code={ICON_LINE_HORIZONTAL_1} /></Button>

			<Button data-char="A" disabled={!is_hex()} c_variant={ButtonVariant.tonal}>A</Button>
			<Button data-char={settings().number_format.decimal} disabled={!is_dec()}>{settings().number_format.decimal}</Button>
			<Button data-char="0" c_variant={ButtonVariant.tonal}>0</Button>
			<Button id={button_equal_id} c_variant={ButtonVariant.filled}>=</Button>
			<Button data-char="+"><Icon c_code={ICON_ADD}/></Button>
		</div>
	</>)
}

const DateCalculator: VoidComponent<{
	settings: Settings
	input: DateCalculatorInput
	output: string | null
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const settings = createMemo(() => props.settings)
	const input = createMemo(() => props.input)
	const button_from_id = createUniqueId()
	const button_to_id = createUniqueId()
	const input_year_id = createUniqueId()
	const input_month_id = createUniqueId()
	const input_day_id = createUniqueId()
	let datePicker_from_ref: HTMLDialogElement
	let datePicker_to_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<div
		class={CSS.input_output_date_calculator}
		onClick={ev => {
			const button = document_active()!
			if (!element_valid_target(
				event_current_target(ev),
				button,
				el => element_tagname(el) == 'BUTTON'
			)) return

			switch (element_id(button)) {
			case button_from_id:
				open_datepicker(ev, datePicker_from_ref, {
					anchor: button,
					position: MenuPosition.center_bottom_to_right
				})
				break
			case button_to_id:
				open_datepicker(ev, datePicker_to_ref, {
					anchor: button,
					position: MenuPosition.center_bottom_to_right
				})
				break
			}
		}}
		onFocusOut={ev => {
			const target = event_target(ev) as HTMLInputElement

			switch (element_id(target)) {
			case input_year_id:
				command(Commands.change_calculator_input, {
					...input(),
					year: number_safe(target.valueAsNumber, input().year)
				})
				break
			case input_month_id:
				command(Commands.change_calculator_input, {
					...input(),
					month: number_safe(target.valueAsNumber, input().month)
				})
				break
			case input_day_id:
				command(Commands.change_calculator_input, {
					...input(),
					day: number_safe(target.valueAsNumber, input().day)
				})
				break
			}
		}}>
		<Dropdown
			c_label="Operation"
			c_values={[settings().date.operation]}
			c_on_change={(options) => command(Commands.change_settings_date_operation, options[0].value)}>
			<For each={[
				[DateOperation.add, 'Add'],
				[DateOperation.subtract, 'Subtract'],
				[DateOperation.difference, 'Difference'],
			]}>{option => <DropdownOption c_value={option[0]} c_text={option[1]}/>}</For>
		</Dropdown>
		<div>
			<p>From</p>
			<Button
				c_variant={ButtonVariant.tonal}
				id={button_from_id}>
				<Icon c_code={ICON_CALENDAR}/>
				{date_text_YMD(input().from)}
			</Button>
		</div>
		<div class={CSS.input_output_date_inputs} data-hide={attr_set_if_exist(settings().date.operation == DateOperation.difference)}>
			<NumberTextField
				min={0}
				value={input().year + ''}
				c_label="Year"
				id={input_year_id}
			/>
			<NumberTextField
				min={0}
				value={input().month + ''}
				c_label="Month"
				id={input_month_id}
			/>
			<NumberTextField
				min={0}
				value={input().day + ''}
				c_label="Day"
				id={input_day_id}
			/>
		</div>
		<div data-hide={attr_set_if_exist(settings().date.operation != DateOperation.difference)}>
			<p>To</p>
			<Button
				c_variant={ButtonVariant.tonal}
				id={button_to_id}>
				<Icon c_code={ICON_CALENDAR}/>
				{date_text_YMD(input().to)}
			</Button>
		</div>
		<div>
			<p><Show when={attr_set_if_exist(settings().date.operation != DateOperation.difference)} fallback="Result">Difference</Show></p>
			<h2>{props.output}</h2>
		</div>
		<DatePicker
			ref={r => datePicker_from_ref = r}
			c_date={input().from}
			c_first_date={new Date(date_year() - 1000, 0, 1)}
			c_last_date={new Date(date_year() + 1000, 11, 31)}
			c_on_selectdate={(value) => command(Commands.change_calculator_input, {...input(), from: value})}
		/>
		<DatePicker
			ref={r => datePicker_to_ref = r}
			c_date={input().to}
			c_first_date={new Date(date_year() - 1000, 0, 1)}
			c_last_date={new Date(date_year() + 1000, 11, 31)}
			c_on_selectdate={(value) => command(Commands.change_calculator_input, {...input(), to: value})}
		/>
	</div>)
}

const _: VoidComponent<{
	calculator: CalculatorType
	settings: Settings
	inputs: CalculatorInput
	outputs: CalculatorOutput
	memory: number
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	const calculator = createMemo(() => props.calculator)
	const inputs = createMemo(() => props.inputs)
	const outputs = createMemo(() => props.outputs)
	const command = createMemo(() => props.command)
	const settings = createMemo(() => props.settings)
	const memory = createMemo(() => props.memory)
	return (<main class={CSS.input_output_main}>
		<Tooltip>
			<Switch>
				<Match when={calculator() == CalculatorType.basic}>
					<BasicCalculator
						settings={settings()}
						input={inputs().basic}
						output={outputs().basic}
						command={command()}
						memory={memory()}
					/>
				</Match>
				<Match when={calculator() == CalculatorType.scientific}>
					<ScientificCalculator
						settings={settings()}
						input={inputs().scientific}
						output={outputs().scientific}
						command={command()}
						memory={memory()}
					/>
				</Match>
				<Match when={calculator() == CalculatorType.converter}>
					<ConverterCalculator
						settings={settings()}
						input={inputs().converter}
						output={outputs().converter}
						command={command()}
						memory={memory()}
					/>
				</Match>
				<Match when={calculator() == CalculatorType.programmer}>
					<ProgrammerCalculator
						settings={settings()}
						input={inputs().programmer}
						output={outputs().programmer}
						command={command()}
						memory={memory()}
					/>
				</Match>
				<Match when={calculator() == CalculatorType.date}>
					<DateCalculator
						settings={settings()}
						input={inputs().date}
						output={outputs().date}
						command={command()}
					/>
				</Match>
			</Switch>
		</Tooltip>
	</main>)
}

export default _