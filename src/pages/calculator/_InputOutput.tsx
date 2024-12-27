import { createEffect, createMemo, createSignal, For, Match, Show, Switch, type JSX, type ParentComponent, type VoidComponent } from "solid-js"

import type { CalculatorInput, CalculatorOutput, DateCalculatorInput, Settings } from "./_types"
import { CalculatorType, Commands, DateOperation, DecimalNumberFormat, NumberType } from "./_enums"
import { add_classlist_module, element_focus } from "@/utils/element"
import { attr_set_if_exist, classlist } from "@/utils/attributes"
import { CONVERTER_TYPES } from "./_constants"
import { ConverterType, UNIT_ANGLE, UNIT_AREA, UNIT_FREQUENCY, UNIT_LENGTH, UNIT_PRESSURE, UNIT_TEMPERATURE, UNIT_TIME, UNIT_VOLUME, UNIT_WEIGHT, type ConverterUnit } from "./_converter"
import { string_length, string_match, string_substring, string_totitlecase, string_touppercase, string_trim } from "@/utils/string"
import { event_current_target, event_prevent_default } from "@/utils/event"
import { date_year, date_text_YMD } from "@/utils/datetime"
import { number_to_binary, number_format, number_parse, number_to_real_digit, number_to_string, number_safe } from "@/utils/number"
import { regex_test } from "@/utils/regex"
import { navigator_clipboard_writetext } from "@/utils/navigator"

import { TextTooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, IconButton } from "@/components/Button"
import { NumberTextField } from "@/components/TextField"
import Menu, { close_menu, MenuDivider, MenuItem, MenuPosition, open_menu } from "@/components/Menu"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import DatePicker, { open_datepicker } from "@/components/DatePicker"
import CSSMiscellaneous from '@/styles/miscellaneous.module.scss'
import CSS from './_styles.module.scss'

const ActionButtons: ParentComponent<JSX.HTMLAttributes<HTMLDivElement> & {
	command: (type: Commands, ...args: unknown[]) => unknown
	memory: number
	settings: Settings
	on_recall_memory: (memory: number) => unknown
	hide?: boolean
}> = (props) => {
	const [is_menu_memory_open, set_is_menu_memory_open] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings)
	let menu_memory_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<div class={CSS.input_output_action_buttons} data-hidden={attr_set_if_exist(props.hide)}>
		{props.children}
		<div class={CSS.input_output_memory_buttons} data-hidden={attr_set_if_exist(!settings().memory_buttons)}>
			<Button
				data-tooltip={"Memory value " + `(${props.memory})`}
				focused={is_menu_memory_open()}
				onClick={(ev) => open_menu(ev, menu_memory_ref, {
					anchor: event_current_target(ev),
				})}>
				M
			</Button>
			<Menu
				classList={add_classlist_module(CSS.input_output_memory_menu)}
				on_toggle_open={(v) => set_is_menu_memory_open(v)}
				ref={r => menu_memory_ref = r}>
				<p>Memory value:</p>
				<p>{props.memory}</p>
			</Menu>
			<Button
				data-tooltip="Memory clear"
				onClick={() => command(Commands.clear_memory)}>
				MC
			</Button>
			<Button
				data-tooltip="Memory recall"
				onClick={() => props.on_recall_memory(props.memory)}>
				MR
			</Button>
			<Button
				data-tooltip="Memory add"
				onClick={() => command(Commands.add_memory)}>
				M+
			</Button>
			<Button
				data-tooltip="Memory subtract"
				onClick={() => command(Commands.subtract_memory)}>
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
		<div class={CSS.input_output_basic_buttons}>
			<Button onClick={() => add_char('%')}>%</Button>
			<Button onClick={() => add_char('√')}>√</Button>
			<Button onClick={() => clear()} classList={add_classlist_module(CSS.input_output_remove_symbol)}>C</Button>
			<Button onClick={() => backspace()} classList={add_classlist_module(CSS.input_output_remove_symbol)}><Icon code={0xE199} /></Button>

			<Button onClick={() => add_char('7')} variant={ButtonVariant.tonal}>7</Button>
			<Button onClick={() => add_char('8')} variant={ButtonVariant.tonal}>8</Button>
			<Button onClick={() => add_char('9')} variant={ButtonVariant.tonal}>9</Button>
			<Button onClick={() => add_char('÷')} ><Icon code={0xEE8F}/></Button>

			<Button onClick={() => add_char('4')} variant={ButtonVariant.tonal}>4</Button>
			<Button onClick={() => add_char('5')} variant={ButtonVariant.tonal}>5</Button>
			<Button onClick={() => add_char('6')} variant={ButtonVariant.tonal}>6</Button>
			<Button onClick={() => add_char('×')}><Icon code={0xE5E9}/></Button>

			<Button onClick={() => add_char('1')} variant={ButtonVariant.tonal}>1</Button>
			<Button onClick={() => add_char('2')} variant={ButtonVariant.tonal}>2</Button>
			<Button onClick={() => add_char('3')} variant={ButtonVariant.tonal}>3</Button>
			<Button onClick={() => add_char('-')}><Icon code={0xEF5D} /></Button>

			<Button onClick={() => add_char(settings().number_format.decimal == DecimalNumberFormat.comma? ',' : '.')} ><Show when={settings().number_format.decimal == DecimalNumberFormat.comma} fallback=".">,</Show></Button>
			<Button onClick={() => add_char('0')} variant={ButtonVariant.tonal}>0</Button>
			<Button onClick={() => equal()} variant={ButtonVariant.filled}>=</Button>
			<Button onClick={() => add_char('+')}><Icon code={0xE007}/></Button>
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
				focused={is_menu_function_open()}>
				<Icon code={0xEA95}/>
				Function
			</Button>
			<Menu
				classList={add_classlist_module(CSS.input_output_scientific_function_menu)}
				ref={r => menu_function_ref = r}
				on_toggle_open={(v) => set_is_menu_function_open(v)}>
				<div class={CSS.input_output_trigonometry_options}>
					<MenuItem checked={is_inverse()} onClick={() => set_is_inverse(v => !v)}>Invers</MenuItem>
					<MenuItem checked={is_hyperbolic()} onClick={() => set_is_hyperbolic(v => !v)}>Hyperbolic</MenuItem>
				</div>
				<div class={CSS.input_output_grid_3}>
					<For each={get_trigonometry()}>{t => <MenuItem onClick={() => add_char(t + '(')}>{`${t}(x)`}</MenuItem>}</For>
				</div>
				<MenuDivider />
				<div class={CSS.input_output_grid_3}>
					<MenuItem onClick={() => add_char('abs(')}>abs(x)</MenuItem>
					<MenuItem onClick={() => add_char('log(')}>log(x)</MenuItem>
					<MenuItem onClick={() => add_char('ln(')}>ln(x)</MenuItem>
					<MenuItem onClick={() => add_char('ceil(')}>ceil(x)</MenuItem>
					<MenuItem onClick={() => add_char('round(')}>round(x)</MenuItem>
					<MenuItem onClick={() => add_char('floor(')}>floor(x)</MenuItem>
				</div>
			</Menu>
			<Button
				data-tooltip="Angle mode"
				style={{width: '68px'}}
				onClick={() => command(Commands.toggle_settings_scientific_angle)}>
				{settings().scientific.angle}
			</Button>
		</ActionButtons>
		<div class={CSS.input_output_scientific_buttons}>
			<Button onClick={() => add_char('mod')}>mod</Button>
			<Button onClick={() => add_char('(')}>{'('}</Button>
			<Button onClick={() => add_char(')')}>{')'}</Button>
			<Button onClick={() => clear()} classList={add_classlist_module(CSS.input_output_remove_symbol)}>C</Button>
			<Button onClick={() => backspace()} classList={add_classlist_module(CSS.input_output_remove_symbol)}><Icon code={0xE199} /></Button>

			<Button onClick={() => add_char('%')}>%</Button>
			<Button onClick={() => add_char('10^')}>10^</Button>
			<Button onClick={() => add_char('^2')}>^2</Button>
			<Button onClick={() => add_char('e^')}>e^</Button>
			<Button onClick={() => add_char('^')}>^</Button>

			<Button onClick={() => add_char('!')}>!</Button>
			<Button onClick={() => add_char('7')} variant={ButtonVariant.tonal}>7</Button>
			<Button onClick={() => add_char('8')} variant={ButtonVariant.tonal}>8</Button>
			<Button onClick={() => add_char('9')} variant={ButtonVariant.tonal}>9</Button>
			<Button onClick={() => add_char('÷')} ><Icon code={0xEE8F}/></Button>

			<Button onClick={() => add_char('e')}>e</Button>
			<Button onClick={() => add_char('4')} variant={ButtonVariant.tonal}>4</Button>
			<Button onClick={() => add_char('5')} variant={ButtonVariant.tonal}>5</Button>
			<Button onClick={() => add_char('6')} variant={ButtonVariant.tonal}>6</Button>
			<Button onClick={() => add_char('×')}><Icon code={0xE5E9}/></Button>

			<Button onClick={() => add_char('π')}>π</Button>
			<Button onClick={() => add_char('1')} variant={ButtonVariant.tonal}>1</Button>
			<Button onClick={() => add_char('2')} variant={ButtonVariant.tonal}>2</Button>
			<Button onClick={() => add_char('3')} variant={ButtonVariant.tonal}>3</Button>
			<Button onClick={() => add_char('-')}><Icon code={0xEF5D} /></Button>

			<Button onClick={() => add_char('√')}>√</Button>
			<Button onClick={() => add_char(settings().number_format.decimal == DecimalNumberFormat.comma? ',' : '.')} ><Show when={settings().number_format.decimal == DecimalNumberFormat.comma} fallback=".">,</Show></Button>
			<Button onClick={() => add_char('0')} variant={ButtonVariant.tonal}>0</Button>
			<Button onClick={() => equal()} variant={ButtonVariant.filled}>=</Button>
			<Button onClick={() => add_char('+')}><Icon code={0xE007}/></Button>
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
				focused={is_menu_convertertype_open()}
				onClick={ev => open_menu(ev, menu_convertertype_ref, {
					anchor: event_current_target(ev),
					position: MenuPosition.center_bottom_to_right,
					allow_hide_anchor: false
				})}
				variant={ButtonVariant.tonal}>
				<Icon code={get_converter_icon()}/>
				{get_converter_name()}
			</Button>

			<Menu
				ref={r => menu_convertertype_ref = r}
				on_toggle_open={v => set_is_menu_convertertype_open(v)}>
				<For each={CONVERTER_TYPES}>{c =>
					<MenuItem
						selected={c.type == settings().converter.type}
						onClick={() => {
							command(Commands.change_settings_converter_type, c.type)
							close_menu(menu_convertertype_ref)
						}}
						leading={<Icon code={c.icon}/>}>
						{c.text}
					</MenuItem>
				}</For>
			</Menu>

			<div class={CSS.input_output_converter_units}>
				<Button
					data-tooltip="Select input unit"
					focused={is_menu_inputunit_open()}
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
					on_toggle_open={v => set_is_menu_inputunit_open(v)}>
					<For each={get_units()}>{u =>
						<MenuItem
							onClick={() => {
								command(Commands.change_settings_converter_inputunit, u)
								close_menu(menu_inputunit_ref)
							}}
							selected={u.equals(settings().converter.unit_input)}>
							{u.name + ` (${u.symbol})`}
						</MenuItem>
					}</For>
				</Menu>
				<IconButton
					data-tooltip="Swap unit"
					onClick={() => command(Commands.change_settings_converter_swapunit)}
					code={0xE115}
				/>
				<Button
					data-tooltip="Select output unit"
					focused={is_menu_outputunit_open()}
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
				on_toggle_open={v => set_is_menu_outputunit_open(v)}>
				<For each={get_units()}>{u =>
					<MenuItem
						onClick={() => {
							command(Commands.change_settings_converter_outputunit, u)
							close_menu(menu_outputunit_ref)
						}}
						selected={u.equals(settings().converter.unit_output)}>
						{u.name + ` (${u.symbol})`}
					</MenuItem>
				}</For>
			</Menu>
		</ActionButtons>
		<div class={CSS.input_output_converter_buttons}>
			<Button onClick={() => plus_minus()}>±</Button>
			<Button onClick={() => clear()} classList={add_classlist_module(CSS.input_output_remove_symbol)}>C</Button>
			<Button onClick={() => backspace()} classList={add_classlist_module(CSS.input_output_remove_symbol)}><Icon code={0xE199} /></Button>

			<Button onClick={() => add_char('7')} variant={ButtonVariant.tonal}>7</Button>
			<Button onClick={() => add_char('8')} variant={ButtonVariant.tonal}>8</Button>
			<Button onClick={() => add_char('9')} variant={ButtonVariant.tonal}>9</Button>

			<Button onClick={() => add_char('4')} variant={ButtonVariant.tonal}>4</Button>
			<Button onClick={() => add_char('5')} variant={ButtonVariant.tonal}>5</Button>
			<Button onClick={() => add_char('6')} variant={ButtonVariant.tonal}>6</Button>

			<Button onClick={() => add_char('1')} variant={ButtonVariant.tonal}>1</Button>
			<Button onClick={() => add_char('2')} variant={ButtonVariant.tonal}>2</Button>
			<Button onClick={() => add_char('3')} variant={ButtonVariant.tonal}>3</Button>

			<Button onClick={() => add_char(settings().number_format.decimal == DecimalNumberFormat.comma? ',' : '.')} ><Show when={settings().number_format.decimal == DecimalNumberFormat.comma} fallback=".">,</Show></Button>
			<Button onClick={() => add_char('0')} variant={ButtonVariant.tonal}>0</Button>
			<Button onClick={() => equal()} variant={ButtonVariant.filled}>=</Button>
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
				selected={settings().programmer.number_type == NumberType.decimal}
				indicator_position={ButtonIndicatorPosition.right}
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
				selected={settings().programmer.number_type == NumberType.hexadecimal}
				indicator_position={ButtonIndicatorPosition.right}
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
				selected={settings().programmer.number_type == NumberType.octal}
				indicator_position={ButtonIndicatorPosition.right}
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
				selected={settings().programmer.number_type == NumberType.binary}
				indicator_position={ButtonIndicatorPosition.right}
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
				}} leading={<Icon code={0xE51B}/>}>Copy</MenuItem>
			</Menu>
		</div>
		<ActionButtons
			command={command}
			memory={props.memory}
			on_recall_memory={on_recall_memory}
			hide={!settings().memory_buttons}
			settings={settings()}
		/>
		<div class={CSS.input_output_programmer_buttons}>
			<div />
			<Button onClick={() => add_char('(')}>{'('}</Button>
			<Button onClick={() => add_char(')')}>{')'}</Button>
			<Button onClick={() => clear()} classList={add_classlist_module(CSS.input_output_remove_symbol)}>C</Button>
			<Button onClick={() => backspace()} classList={add_classlist_module(CSS.input_output_remove_symbol)}><Icon code={0xE199} /></Button>

			<Button disabled={!is_hex()} onClick={() => add_char('F')} variant={ButtonVariant.tonal}>F</Button>
			<Button onClick={() => add_char('not(')}>not</Button>
			<Button onClick={() => add_char('mod')}>mod</Button>
			<Button onClick={() => add_char('lsh')}>lsh</Button>
			<Button onClick={() => add_char('rsh')}>rsh</Button>

			<Button disabled={!is_hex()} onClick={() => add_char('E')} variant={ButtonVariant.tonal}>E</Button>
			<Button onClick={() => add_char('or')}>or</Button>
			<Button onClick={() => add_char('and')}>and</Button>
			<Button onClick={() => add_char('xor')}>xor</Button>
			<Button onClick={() => add_char('^')}>^</Button>

			<Button disabled={!is_hex()} onClick={() => add_char('D')} variant={ButtonVariant.tonal}>D</Button>
			<Button disabled={is_bin()} onClick={() => add_char('7')} variant={ButtonVariant.tonal}>7</Button>
			<Button disabled={is_oct() || is_bin()} onClick={() => add_char('8')} variant={ButtonVariant.tonal}>8</Button>
			<Button disabled={is_oct() || is_bin()} onClick={() => add_char('9')} variant={ButtonVariant.tonal}>9</Button>
			<Button onClick={() => add_char('÷')} ><Icon code={0xEE8F}/></Button>

			<Button disabled={!is_hex()} onClick={() => add_char('C')} variant={ButtonVariant.tonal}>C</Button>
			<Button disabled={is_bin()} onClick={() => add_char('4')} variant={ButtonVariant.tonal}>4</Button>
			<Button disabled={is_bin()} onClick={() => add_char('5')} variant={ButtonVariant.tonal}>5</Button>
			<Button disabled={is_bin()} onClick={() => add_char('6')} variant={ButtonVariant.tonal}>6</Button>
			<Button onClick={() => add_char('×')}><Icon code={0xE5E9}/></Button>

			<Button disabled={!is_hex()} onClick={() => add_char('B')} variant={ButtonVariant.tonal}>B</Button>
			<Button onClick={() => add_char('1')} variant={ButtonVariant.tonal}>1</Button>
			<Button disabled={is_bin()} onClick={() => add_char('2')} variant={ButtonVariant.tonal}>2</Button>
			<Button disabled={is_bin()} onClick={() => add_char('3')} variant={ButtonVariant.tonal}>3</Button>
			<Button onClick={() => add_char('-')}><Icon code={0xEF5D} /></Button>

			<Button disabled={!is_hex()} onClick={() => add_char('A')} variant={ButtonVariant.tonal}>A</Button>
			<Button disabled={!is_dec()} onClick={() => add_char(settings().number_format.decimal == DecimalNumberFormat.comma? ',' : '.')} ><Show when={settings().number_format.decimal == DecimalNumberFormat.comma} fallback=".">,</Show></Button>
			<Button onClick={() => add_char('0')} variant={ButtonVariant.tonal}>0</Button>
			<Button onClick={() => equal()} variant={ButtonVariant.filled}>=</Button>
			<Button onClick={() => add_char('+')}><Icon code={0xE007}/></Button>
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
	let datePicker_from_ref: HTMLDialogElement
	let datePicker_to_ref: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<div class={CSS.input_output_date_calculator}>
		<Dropdown
			label="Operation"
			values={[settings().date.operation]}
			on_change_options={(options) => command(Commands.change_settings_date_operation, options[0].value)}>
			<For each={[
				[DateOperation.add, 'Add'],
				[DateOperation.subtract, 'Subtract'],
				[DateOperation.difference, 'Difference'],
			]}>{option => <DropdownOption value={option[0]} text={option[1]}/>}</For>
		</Dropdown>
		<div>
			<p>From</p>
			<Button
				variant={ButtonVariant.tonal}
				onClick={(ev) => open_datepicker(ev, datePicker_from_ref, {
					anchor: event_current_target(ev),
					position: MenuPosition.center_bottom_to_right
				})}>
				<Icon code={0xE2CC}/>
				{date_text_YMD(input().from)}
			</Button>
		</div>
		<div class={CSS.input_output_date_inputs} data-hide={attr_set_if_exist(settings().date.operation == DateOperation.difference)}>
			<NumberTextField
				min={0}
				value={input().year + ''}
				label="Year"
				onBlur={(ev) => command(
					Commands.change_calculator_input,
					{	...input(),
						year: number_safe(event_current_target(ev).valueAsNumber, input().year)
					}
				)}
			/>
			<NumberTextField
				min={0}
				value={input().month + ''}
				label="Month"
				onBlur={(ev) => command(
					Commands.change_calculator_input,
					{	...input(),
						month: number_safe(event_current_target(ev).valueAsNumber, input().month)
					}
				)}
			/>
			<NumberTextField
				min={0}
				value={input().day + ''}
				label="Day"
				onBlur={(ev) => command(
					Commands.change_calculator_input,
					{	...input(),
						day: number_safe(event_current_target(ev).valueAsNumber, input().day)
					}
				)}
			/>
		</div>
		<div data-hide={attr_set_if_exist(settings().date.operation != DateOperation.difference)}>
			<p>To</p>
			<Button
				variant={ButtonVariant.tonal}
				onClick={(ev) => open_datepicker(ev, datePicker_to_ref, {
					anchor: event_current_target(ev),
					position: MenuPosition.center_bottom_to_right
				})}>
				<Icon code={0xE2CC}/>
				{date_text_YMD(input().to)}
			</Button>
		</div>
		<div>
			<p><Show when={attr_set_if_exist(settings().date.operation != DateOperation.difference)} fallback="Result">Difference</Show></p>
			<h2>{props.output}</h2>
		</div>
		<DatePicker
			ref={r => datePicker_from_ref = r}
			date={input().from}
			first_date={new Date(date_year() - 1000, 0, 1)}
			last_date={new Date(date_year() + 1000, 11, 31)}
			on_select_date={(value) => command(Commands.change_calculator_input, {...input(), from: value})}
		/>
		<DatePicker
			ref={r => datePicker_to_ref = r}
			date={input().to}
			first_date={new Date(date_year() - 1000, 0, 1)}
			last_date={new Date(date_year() + 1000, 11, 31)}
			on_select_date={(value) => command(Commands.change_calculator_input, {...input(), to: value})}
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
		<TextTooltip>
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
		</TextTooltip>
	</main>)
}

export default _