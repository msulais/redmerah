import { createEffect, createMemo, createSignal, For, Match, Show, Switch, type JSX, type ParentComponent, type VoidComponent } from "solid-js"

import type { CalculatorInput, CalculatorOutput, DateCalculatorInput, Settings } from "./_types"
import { CalculatorType, Commands, DateOperation, DecimalNumberFormat, NumberType } from "./_enums"
import { _hide, _children, _settings, _memoryButtons, _memory, _currentTarget, _command, _onRecallMemory, _value, _substring, _length, _setSelectionRange, _focus, _output, _toString, _input, _none, _text, _code, _shiftKey, _selectionStart, _join, _scientificNotation, _numberFormat, _decimal, _grouping, _test, _toUpperCase, _tonal, _comma, _filled, _sin, _cos, _tan, _csc, _sec, _cot, _centerBottomToRight, _abs, _log, _ln, _ceil, _round, _floor, _scientific, _angle, _type, _converter, _icon, _area, _volume, _temperature, _time, _weight, _frequency, _pressure, _match, _trim, _inputUnit, _name, _symbol, _equals, _outputUnit, _programmer, _numberType, _hexadecimal, _octal, _binary, _right, _clipboard, _writeText, _date, _operation, _add, _subtract, _difference, _from, _year, _month, _day, _to, _calculator, _basic, _inputs, _outputs, _valueAsNumber } from "@/constants/string"
import { addClassListModule } from "@/utils/element"
import { setElementAttributeIfExist } from "@/utils/attributes"
import { CONVERTER_TYPES } from "./_constants"
import { ConverterType, UNIT_ANGLE, UNIT_AREA, UNIT_FREQUENCY, UNIT_LENGTH, UNIT_PRESSURE, UNIT_TEMPERATURE, UNIT_TIME, UNIT_VOLUME, UNIT_WEIGHT, type ConverterUnit } from "./_converter"
import { stringToTitleCase } from "@/utils/string"
import { eventPreventDefault } from "@/utils/event"
import { getNavigator } from "@/constants/window"
import { floatToBinary, formatNumber, numberParse, numberToRealDigit, safeNumber } from "@/utils/math"
import { getDate_Y, getDateString_YMD } from "@/utils/datetime"

import { TextTooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, IconButton } from "@/components/Button"
import { NumberTextField } from "@/components/TextField"
import Menu, { closeMenu, MenuDivider, MenuItem, MenuPosition, openMenu } from "@/components/Menu"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import DatePicker, { openDatePicker } from "@/components/DatePicker"
import CSSMiscellaneous from '@/styles/miscellaneous.module.scss'
import CSS from './_styles.module.scss'

const ActionButtons: ParentComponent<JSX.HTMLAttributes<HTMLDivElement> & {
	command: (type: Commands, ...args: unknown[]) => unknown
	memory: number
	settings: Settings
	onRecallMemory: (memory: number) => unknown
	hide?: boolean
}> = (props) => {
	const [is_menu_memory_open, setIs_menu_memory_open] = createSignal<boolean>(false)
	let menu_memory_ref: HTMLDialogElement

	return (<div class={CSS.input_output_action_buttons} data-hidden={setElementAttributeIfExist(props[_hide])}>
		{props[_children]}
		<div class={CSS.input_output_memory_buttons} data-hidden={setElementAttributeIfExist(!props[_settings][_memoryButtons])}>
			<TextTooltip text={"Memory value " + `(${props[_memory]})`}>
				<Button
					focused={is_menu_memory_open()}
					onClick={(ev) => openMenu(ev, menu_memory_ref, {
						anchor: ev[_currentTarget],
					})}>
					M
				</Button>
			</TextTooltip>
			<Menu
				classList={addClassListModule(CSS.input_output_memory_menu)}
				onToggleOpen={(v) => setIs_menu_memory_open(v)}
				ref={r => menu_memory_ref = r}>
				<p>Memory value:</p>
				<p>{props[_memory]}</p>
			</Menu>
			<TextTooltip text="Memory clear">
				<Button
					onClick={() => props[_command](Commands.clear_memory)}>
					MC
				</Button>
			</TextTooltip>
			<TextTooltip text="Memory recall">
				<Button
					onClick={() => props[_onRecallMemory](props[_memory])}>
					MR
				</Button>
			</TextTooltip>
			<TextTooltip text="Memory add">
				<Button
					onClick={() => props[_command](Commands.add_memory)}>
					M+
				</Button>
			</TextTooltip>
			<TextTooltip text="Memory subtract">
				<Button
					onClick={() => props[_command](Commands.subtract_memory)}>
					M-
				</Button>
			</TextTooltip>
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
	let input_ref: HTMLInputElement
	let caretPos: number = 0

	function addChar(char: string): void {
		const prefix = input_ref[_value][_substring](0, caretPos)
		const suffix = input_ref[_value][_substring](caretPos)
		const value = prefix + char + suffix
		input_ref[_value] = value
		caretPos += char[_length]
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, value)
	}

	function backspace(): void {
		const prefix = input_ref[_value][_substring](0, caretPos-1)
		const suffix = input_ref[_value][_substring](caretPos)
		const value = prefix + suffix
		input_ref[_value] = value
		--caretPos
		if (caretPos < 0) caretPos = 0
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, value)
	}

	function clear(): void {
		caretPos = 0
		input_ref[_value] = ''
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, '')
	}

	function equal(): void {
		if (!props[_output]) return;

		caretPos = props[_output][_toString]()[_length]
		input_ref[_value] = props[_output][_toString]()
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, numberToRealDigit(props[_output]))
	}

	createEffect(() => {
		input_ref[_value] = props[_input]
		input_ref[_focus]()
	})

	return (<>
		<input
			ref={r => input_ref = r}
			inputMode={_none}
			class={CSS.input_output_basic_text_input}
			type={_text}
			onKeyDown={ev => {
				if (!(ev[_code] == "Equal" && !ev[_shiftKey])) return
				equal()
				eventPreventDefault(ev)
			}}
			onFocus={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
			onBlur={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
			onInput={ev => props[_command](Commands.change_calculator_input, ev[_currentTarget][_value])}
		/>
		<div
			class={[
				CSS.input_output_basic_text_output,
				CSSMiscellaneous.no_scrollbar
			][_join](' ')}>
			<Show
				when={props[_settings][_scientificNotation]}
				fallback={props[_output] != null && formatNumber(props[_output], {
					decimalSeparator: props[_settings][_numberFormat][_decimal],
					thousandSeparator: props[_settings][_numberFormat][_grouping]
				})}>
				{props[_output] != null && (/[eE]/[_test](props[_output][_toString]())
					? props[_output][_toString]()[_toUpperCase]()
					: formatNumber(props[_output], {
						decimalSeparator: props[_settings][_numberFormat][_decimal],
						thousandSeparator: props[_settings][_numberFormat][_grouping]
					})
				)}
			</Show>
		</div>
		<ActionButtons
			command={props[_command]}
			memory={props[_memory]}
			onRecallMemory={(v) => addChar(numberToRealDigit(v))}
			settings={props[_settings]}
			hide={!props[_settings][_memoryButtons]}
		/>
		<div class={CSS.input_output_basic_buttons}>
			<Button onClick={() => addChar('%')}>%</Button>
			<Button onClick={() => addChar('√')}>√</Button>
			<Button onClick={() => clear()} classList={addClassListModule(CSS.input_output_remove_symbol)}>C</Button>
			<Button onClick={() => backspace()} classList={addClassListModule(CSS.input_output_remove_symbol)}><Icon code={0xE199} /></Button>

			<Button onClick={() => addChar('7')} variant={ButtonVariant[_tonal]}>7</Button>
			<Button onClick={() => addChar('8')} variant={ButtonVariant[_tonal]}>8</Button>
			<Button onClick={() => addChar('9')} variant={ButtonVariant[_tonal]}>9</Button>
			<Button onClick={() => addChar('÷')} ><Icon code={0xEE8F}/></Button>

			<Button onClick={() => addChar('4')} variant={ButtonVariant[_tonal]}>4</Button>
			<Button onClick={() => addChar('5')} variant={ButtonVariant[_tonal]}>5</Button>
			<Button onClick={() => addChar('6')} variant={ButtonVariant[_tonal]}>6</Button>
			<Button onClick={() => addChar('×')}><Icon code={0xE5E9}/></Button>

			<Button onClick={() => addChar('1')} variant={ButtonVariant[_tonal]}>1</Button>
			<Button onClick={() => addChar('2')} variant={ButtonVariant[_tonal]}>2</Button>
			<Button onClick={() => addChar('3')} variant={ButtonVariant[_tonal]}>3</Button>
			<Button onClick={() => addChar('-')}><Icon code={0xEF5D} /></Button>

			<Button onClick={() => addChar(props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]? ',' : '.')} ><Show when={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]} fallback=".">,</Show></Button>
			<Button onClick={() => addChar('0')} variant={ButtonVariant[_tonal]}>0</Button>
			<Button onClick={() => equal()} variant={ButtonVariant[_filled]}>=</Button>
			<Button onClick={() => addChar('+')}><Icon code={0xE007}/></Button>
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
	const [is_menu_function_open, setIs_menu_function_open] = createSignal<boolean>(false)
	const [isHyperbolic, setIsHyperbolic] = createSignal<boolean>(false)
	const [isInverse, setIsInverse] = createSignal<boolean>(false)
	const getTrigonometry = createMemo<string[]>(() => {
		const i = () => isInverse()? 'a' : ''
		const h = () => isHyperbolic()? 'h' : ''
		return [
			i() + _sin + h(),
			i() + _cos + h(),
			i() + _tan + h(),
			i() + _csc + h(),
			i() + _sec + h(),
			i() + _cot + h()
		]
	})
	let input_ref: HTMLInputElement
	let menu_function_ref: HTMLDialogElement
	let caretPos: number = 0

	function addChar(char: string): void {
		const prefix = input_ref[_value][_substring](0, caretPos)
		const suffix = input_ref[_value][_substring](caretPos)
		const value = prefix + char + suffix
		input_ref[_value] = value
		caretPos += char[_length]
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, value)
	}

	function backspace(): void {
		const prefix = input_ref[_value][_substring](0, caretPos-1)
		const suffix = input_ref[_value][_substring](caretPos)
		const value = prefix + suffix
		input_ref[_value] = value
		--caretPos
		if (caretPos < 0) caretPos = 0
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, value)
	}

	function clear(): void {
		caretPos = 0
		input_ref[_value] = ''
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, '')
	}

	function equal(): void {
		if (!props[_output]) return;

		caretPos = props[_output][_toString]()[_length]
		input_ref[_value] = props[_output][_toString]()
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, numberToRealDigit(props[_output]))
	}

	createEffect(() => {
		input_ref[_value] = props[_input]
		input_ref[_focus]()
	})

	return (<>
		<input
			ref={r => input_ref = r}
			inputMode={_none}
			class={CSS.input_output_scientific_text_input}
			type={_text}
			onKeyDown={ev => {
				if (!(ev[_code] == "Equal" && !ev[_shiftKey])) return
				equal()
				eventPreventDefault(ev)
			}}
			onFocus={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
			onBlur={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
			onInput={ev => props[_command](Commands.change_calculator_input, ev[_currentTarget][_value])}
		/>
		<div
			class={[
				CSS.input_output_scientific_text_output,
				CSSMiscellaneous.no_scrollbar
			][_join](' ')}>
			<Show
				when={props[_settings][_scientificNotation]}
				fallback={props[_output] != null && formatNumber(props[_output], {
					decimalSeparator: props[_settings][_numberFormat][_decimal],
					thousandSeparator: props[_settings][_numberFormat][_grouping]
				})}>
				{props[_output] != null && (/[eE]/[_test](props[_output][_toString]())
					? props[_output][_toString]()[_toUpperCase]()
					: formatNumber(props[_output], {
						decimalSeparator: props[_settings][_numberFormat][_decimal],
						thousandSeparator: props[_settings][_numberFormat][_grouping]
					})
				)}
			</Show>
		</div>
		<ActionButtons
			command={props[_command]}
			memory={props[_memory]}
			onRecallMemory={(v) => addChar(numberToRealDigit(v))}
			settings={props[_settings]}>
			<Button
				onClick={ev => openMenu(ev, menu_function_ref, {
					anchor: ev[_currentTarget],
					position: MenuPosition[_centerBottomToRight]
				})}
				focused={is_menu_function_open()}>
				<Icon code={0xEA95}/>
				Function
			</Button>
			<Menu
				classList={addClassListModule(CSS.input_output_scientific_function_menu)}
				ref={r => menu_function_ref = r}
				onToggleOpen={(v) => setIs_menu_function_open(v)}>
				<div class={CSS.input_output_trigonometry_options}>
					<MenuItem checked={isInverse()} onClick={() => setIsInverse(v => !v)}>Invers</MenuItem>
					<MenuItem checked={isHyperbolic()} onClick={() => setIsHyperbolic(v => !v)}>Hyperbolic</MenuItem>
				</div>
				<div class={CSS.input_output_grid_3}>
					<For each={getTrigonometry()}>{t => <MenuItem onClick={() => addChar(t + '(')}>{`${t}(x)`}</MenuItem>}</For>
				</div>
				<MenuDivider />
				<div class={CSS.input_output_grid_3}>
					<MenuItem onClick={() => addChar(_abs + '(')}>abs(x)</MenuItem>
					<MenuItem onClick={() => addChar(_log + '(')}>log(x)</MenuItem>
					<MenuItem onClick={() => addChar(_ln + '(')}>ln(x)</MenuItem>
					<MenuItem onClick={() => addChar(_ceil + '(')}>ceil(x)</MenuItem>
					<MenuItem onClick={() => addChar(_round + '(')}>round(x)</MenuItem>
					<MenuItem onClick={() => addChar(_floor + '(')}>floor(x)</MenuItem>
				</div>
			</Menu>

			<TextTooltip text="Angle mode">
				<Button
					style={{width: '68px'}}
					onClick={() => props[_command](Commands.toggle_settings_scientific_angle)}>
					{props[_settings][_scientific][_angle]}
				</Button>
			</TextTooltip>
		</ActionButtons>
		<div class={CSS.input_output_scientific_buttons}>
			<Button onClick={() => addChar('mod')}>mod</Button>
			<Button onClick={() => addChar('(')}>{'('}</Button>
			<Button onClick={() => addChar(')')}>{')'}</Button>
			<Button onClick={() => clear()} classList={addClassListModule(CSS.input_output_remove_symbol)}>C</Button>
			<Button onClick={() => backspace()} classList={addClassListModule(CSS.input_output_remove_symbol)}><Icon code={0xE199} /></Button>

			<Button onClick={() => addChar('%')}>%</Button>
			<Button onClick={() => addChar('10^')}>10^</Button>
			<Button onClick={() => addChar('^2')}>^2</Button>
			<Button onClick={() => addChar('e^')}>e^</Button>
			<Button onClick={() => addChar('^')}>^</Button>

			<Button onClick={() => addChar('!')}>!</Button>
			<Button onClick={() => addChar('7')} variant={ButtonVariant[_tonal]}>7</Button>
			<Button onClick={() => addChar('8')} variant={ButtonVariant[_tonal]}>8</Button>
			<Button onClick={() => addChar('9')} variant={ButtonVariant[_tonal]}>9</Button>
			<Button onClick={() => addChar('÷')} ><Icon code={0xEE8F}/></Button>

			<Button onClick={() => addChar('e')}>e</Button>
			<Button onClick={() => addChar('4')} variant={ButtonVariant[_tonal]}>4</Button>
			<Button onClick={() => addChar('5')} variant={ButtonVariant[_tonal]}>5</Button>
			<Button onClick={() => addChar('6')} variant={ButtonVariant[_tonal]}>6</Button>
			<Button onClick={() => addChar('×')}><Icon code={0xE5E9}/></Button>

			<Button onClick={() => addChar('π')}>π</Button>
			<Button onClick={() => addChar('1')} variant={ButtonVariant[_tonal]}>1</Button>
			<Button onClick={() => addChar('2')} variant={ButtonVariant[_tonal]}>2</Button>
			<Button onClick={() => addChar('3')} variant={ButtonVariant[_tonal]}>3</Button>
			<Button onClick={() => addChar('-')}><Icon code={0xEF5D} /></Button>

			<Button onClick={() => addChar('√')}>√</Button>
			<Button onClick={() => addChar(props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]? ',' : '.')} ><Show when={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]} fallback=".">,</Show></Button>
			<Button onClick={() => addChar('0')} variant={ButtonVariant[_tonal]}>0</Button>
			<Button onClick={() => equal()} variant={ButtonVariant[_filled]}>=</Button>
			<Button onClick={() => addChar('+')}><Icon code={0xE007}/></Button>
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
	const [is_menu_converterType_open, setIs_menu_converterType_open] = createSignal<boolean>(false)
	const [is_menu_inputUnit_open, setIs_menu_inputUnit_open] = createSignal<boolean>(false)
	const [is_menu_outputUnit_open, setIs_menu_outputUnit_open] = createSignal<boolean>(false)
	const getConverterIcon = createMemo<number>(() => {
		for (const c of CONVERTER_TYPES) {
			if (c[_type] == props[_settings][_converter][_type]) return c[_icon]
		}
		return 0
	})
	const getUnits = createMemo<ConverterUnit[]>(() => {
		const type = props[_settings][_converter][_type]
		if (type == ConverterType[_length]) return UNIT_LENGTH
		if (type == ConverterType[_area]) return UNIT_AREA
		if (type == ConverterType[_volume]) return UNIT_VOLUME
		if (type == ConverterType[_temperature]) return UNIT_TEMPERATURE
		if (type == ConverterType[_time]) return UNIT_TIME
		if (type == ConverterType[_weight]) return UNIT_WEIGHT
		if (type == ConverterType[_frequency]) return UNIT_FREQUENCY
		if (type == ConverterType[_pressure]) return UNIT_PRESSURE
		if (type == ConverterType[_angle]) return UNIT_ANGLE
		return []
	})
	const getConverterName = createMemo<string>(() => {
		const type = props[_settings][_converter][_type]
		if (type == ConverterType[_weight]) return 'Weight & mass'
		return stringToTitleCase(type)
	})
	let input_ref: HTMLInputElement
	let menu_converterType_ref: HTMLDialogElement
	let menu_inputUnit_ref: HTMLDialogElement
	let menu_outputUnit_ref: HTMLDialogElement
	let caretPos: number = 0

	function addChar(char: string): void {
		const prefix = input_ref[_value][_substring](0, caretPos)
		const suffix = input_ref[_value][_substring](caretPos)
		const value = prefix + char + suffix
		input_ref[_value] = value
		caretPos += char[_length]
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, value)
	}

	function backspace(): void {
		const prefix = input_ref[_value][_substring](0, caretPos-1)
		const suffix = input_ref[_value][_substring](caretPos)
		const value = prefix + suffix
		input_ref[_value] = value
		--caretPos
		if (caretPos < 0) caretPos = 0
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, value)
	}

	function clear(): void {
		caretPos = 0
		input_ref[_value] = ''
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, '')
	}

	function equal(): void {
		if (!props[_output]) return;

		caretPos = props[_output][_toString]()[_length]
		input_ref[_value] = props[_output][_toString]()
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, numberToRealDigit(props[_output]))
	}

	function plusMinus(): void {
		const re = /(.*?)([-+]{0,2})(\d*(?:\.\d*)?)$/s
		const match = props[_input][_substring](0, caretPos)[_match](re)
		let value: string = props[_input]
		if (props[_input][_trim]() == '') {
			value = '-'
			caretPos = 1
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

			const prefix = props[_input][_substring](0, pre[_length])
			const suffix = props[_input][_substring](caretPos)
			caretPos = prefix[_length] + value[_length]
			value = prefix + value + suffix
		}

		input_ref[_value] = value
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, value)
	}

	createEffect(() => {
		input_ref[_value] = props[_input]
		input_ref[_focus]()
	})

	return (<>
		<input
			ref={r => input_ref = r}
			inputMode={_none}
			class={CSS.input_output_converter_text_input}
			type={_text}
			onKeyDown={ev => {
				if (!(ev[_code] == "Equal" && !ev[_shiftKey])) return
				equal()
				eventPreventDefault(ev)
			}}
			onFocus={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
			onBlur={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
			onInput={ev => props[_command](Commands.change_calculator_input, ev[_currentTarget][_value])}
		/>
		<div
			class={[
				CSS.input_output_converter_text_output,
				CSSMiscellaneous.no_scrollbar
			][_join](' ')}>
			<Show
				when={props[_settings][_scientificNotation]}
				fallback={props[_output] != null && formatNumber(props[_output], {
					decimalSeparator: props[_settings][_numberFormat][_decimal],
					thousandSeparator: props[_settings][_numberFormat][_grouping]
				})}>
				{props[_output] != null && (/[eE]/[_test](props[_output][_toString]())
					? props[_output][_toString]()[_toUpperCase]()
					: formatNumber(props[_output], {
						decimalSeparator: props[_settings][_numberFormat][_decimal],
						thousandSeparator: props[_settings][_numberFormat][_grouping]
					})
				)}
			</Show>
		</div>
		<ActionButtons
			command={props[_command]}
			memory={props[_memory]}
			onRecallMemory={(v) => addChar(numberToRealDigit(v))}
			settings={props[_settings]}>
			<TextTooltip text="Select converter type">
				<Button
					focused={is_menu_converterType_open()}
					onClick={ev => openMenu(ev, menu_converterType_ref, {
						anchor: ev[_currentTarget],
						position: MenuPosition[_centerBottomToRight],
						allowHideAnchor: false
					})}
					variant={ButtonVariant[_tonal]}>
					<Icon code={getConverterIcon()}/>
					{getConverterName()}
				</Button>
			</TextTooltip>

			<Menu
				ref={r => menu_converterType_ref = r}
				onToggleOpen={v => setIs_menu_converterType_open(v)}>
				<For each={CONVERTER_TYPES}>{c =>
					<MenuItem
						selected={c[_type] == props[_settings][_converter][_type]}
						onClick={() => {
							props[_command](Commands.change_settings_converter_type, c[_type])
							closeMenu(menu_converterType_ref)
						}}
						leading={<Icon code={c[_icon]}/>}>
						{c[_text]}
					</MenuItem>
				}</For>
			</Menu>

			<div class={CSS.input_output_converter_units}>
				<TextTooltip text="Select input unit">
					<Button
						focused={is_menu_inputUnit_open()}
						onClick={ev => openMenu(ev, menu_inputUnit_ref, {
							anchor: ev[_currentTarget],
							position: MenuPosition[_centerBottomToRight],
							allowHideAnchor: false
						})}
						style={{color: 'rgb(var(--g-color-accent))'}}>
						{props[_settings][_converter][_inputUnit][_name] + ` (${props[_settings][_converter][_inputUnit][_symbol]})`}
					</Button>
				</TextTooltip>

				<Menu
					ref={r => menu_inputUnit_ref = r}
					onToggleOpen={v => setIs_menu_inputUnit_open(v)}>
					<For each={getUnits()}>{u =>
						<MenuItem
							onClick={() => {
								props[_command](Commands.change_settings_converter_inputUnit, u)
								closeMenu(menu_inputUnit_ref)
							}}
							selected={u[_equals](props[_settings][_converter][_inputUnit])}>
							{u[_name] + ` (${u[_symbol]})`}
						</MenuItem>
					}</For>
				</Menu>

				<TextTooltip text="Swap unit">
					<IconButton
						onClick={() => props[_command](Commands.change_settings_converter_swapUnit)}
						code={0xE115}
					/>
				</TextTooltip>

				<TextTooltip text="Select output unit">
					<Button
						focused={is_menu_outputUnit_open()}
						onClick={ev => openMenu(ev, menu_outputUnit_ref, {
							anchor: ev[_currentTarget],
							position: MenuPosition[_centerBottomToRight],
							allowHideAnchor: false
						})}
						style={{color: 'rgb(var(--g-color-accent))'}}>
						{props[_settings][_converter][_outputUnit][_name] + ` (${props[_settings][_converter][_outputUnit][_symbol]})`}
					</Button>
				</TextTooltip>
			</div>

			<Menu
				ref={r => menu_outputUnit_ref = r}
				onToggleOpen={v => setIs_menu_outputUnit_open(v)}>
				<For each={getUnits()}>{u =>
					<MenuItem
						onClick={() => {
							props[_command](Commands.change_settings_converter_outputUnit, u)
							closeMenu(menu_outputUnit_ref)
						}}
						selected={u[_equals](props[_settings][_converter][_outputUnit])}>
						{u[_name] + ` (${u[_symbol]})`}
					</MenuItem>
				}</For>
			</Menu>
		</ActionButtons>
		<div class={CSS.input_output_converter_buttons}>
			<Button onClick={() => plusMinus()}>±</Button>
			<Button onClick={() => clear()} classList={addClassListModule(CSS.input_output_remove_symbol)}>C</Button>
			<Button onClick={() => backspace()} classList={addClassListModule(CSS.input_output_remove_symbol)}><Icon code={0xE199} /></Button>

			<Button onClick={() => addChar('7')} variant={ButtonVariant[_tonal]}>7</Button>
			<Button onClick={() => addChar('8')} variant={ButtonVariant[_tonal]}>8</Button>
			<Button onClick={() => addChar('9')} variant={ButtonVariant[_tonal]}>9</Button>

			<Button onClick={() => addChar('4')} variant={ButtonVariant[_tonal]}>4</Button>
			<Button onClick={() => addChar('5')} variant={ButtonVariant[_tonal]}>5</Button>
			<Button onClick={() => addChar('6')} variant={ButtonVariant[_tonal]}>6</Button>

			<Button onClick={() => addChar('1')} variant={ButtonVariant[_tonal]}>1</Button>
			<Button onClick={() => addChar('2')} variant={ButtonVariant[_tonal]}>2</Button>
			<Button onClick={() => addChar('3')} variant={ButtonVariant[_tonal]}>3</Button>

			<Button onClick={() => addChar(props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]? ',' : '.')} ><Show when={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]} fallback=".">,</Show></Button>
			<Button onClick={() => addChar('0')} variant={ButtonVariant[_tonal]}>0</Button>
			<Button onClick={() => equal()} variant={ButtonVariant[_filled]}>=</Button>
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
	const getDecimalOutput = createMemo<string>(() => {
		if (props[_output] == null) return ''

		if (props[_settings][_scientificNotation]) return (/[eE]/[_test](props[_output][_toString]())
			? props[_output][_toString]()[_toUpperCase]()
			: formatNumber(props[_output], {
				decimalSeparator: props[_settings][_numberFormat][_decimal],
				thousandSeparator: props[_settings][_numberFormat][_grouping]
			})
		)

		return formatNumber(props[_output], {
			decimalSeparator: props[_settings][_numberFormat][_decimal],
			thousandSeparator: props[_settings][_numberFormat][_grouping]
		})
	})
	const getBinaryOutput = createMemo<string>(() => props[_output] != null? floatToBinary(props[_output]) : '')
	const getHexadecimalOutput = createMemo<string>(() => props[_output] != null? numberParse(getBinaryOutput(), true, 2)[_toString](16)[_toUpperCase]() : '')
	const getOctalOutput = createMemo<string>(() => props[_output] != null? numberParse(getBinaryOutput(), true, 2)[_toString](8) : '')
	const isDec = createMemo(() => props[_settings][_programmer][_numberType] == NumberType[_decimal])
	const isHex = createMemo(() => props[_settings][_programmer][_numberType] == NumberType[_hexadecimal])
	const isOct = createMemo(() => props[_settings][_programmer][_numberType] == NumberType[_octal])
	const isBin = createMemo(() => props[_settings][_programmer][_numberType] == NumberType[_binary])
	let menu_copy_ref: HTMLDialogElement
	let input_ref: HTMLInputElement
	let caretPos: number = 0
	let textToCopy: string = ''

	function addChar(char: string): void {
		const prefix = input_ref[_value][_substring](0, caretPos)
		const suffix = input_ref[_value][_substring](caretPos)
		const value = prefix + char + suffix
		input_ref[_value] = value
		caretPos += char[_length]
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, value)
	}

	function backspace(): void {
		const prefix = input_ref[_value][_substring](0, caretPos-1)
		const suffix = input_ref[_value][_substring](caretPos)
		const value = prefix + suffix
		input_ref[_value] = value
		--caretPos
		if (caretPos < 0) caretPos = 0
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, value)
	}

	function clear(): void {
		caretPos = 0
		input_ref[_value] = ''
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, '')
	}

	function equal(): void {
		if (!props[_output]) return;

		let output = props[_output][_toString]()
		const type = props[_settings][_programmer][_numberType]
		if (type == NumberType[_hexadecimal]) output = getHexadecimalOutput()
		else if (type == NumberType[_octal]) output = getOctalOutput()
		else if (type == NumberType[_binary]) output = getBinaryOutput()

		caretPos = output[_length]
		input_ref[_value] = output[_toString]()
		input_ref[_setSelectionRange](caretPos, caretPos)
		input_ref[_focus]()
		props[_command](Commands.change_calculator_input, output)
	}

	function onRecallMemory(value: number): void {
		const type = props[_settings][_programmer][_numberType]
		let $value = ''

		if (type == NumberType[_decimal]) $value = numberToRealDigit(value)
		else if (type == NumberType[_hexadecimal]) $value = numberParse(floatToBinary(value), true, 2)[_toString](16)[_toUpperCase]()
		else if (type == NumberType[_octal]) $value = numberParse(floatToBinary(value), true, 2)[_toString](8)
		else if (type == NumberType[_binary]) $value = floatToBinary(value)

		addChar($value)
	}

	createEffect(() => {
		input_ref[_value] = props[_input]
		input_ref[_focus]()
	})

	return (<>
		<input
			ref={r => input_ref = r}
			inputMode={_none}
			class={CSS.input_output_programmer_text_input}
			type={_text}
			onKeyDown={ev => {
				if (!(ev[_code] == "Equal" && !ev[_shiftKey])) return
				equal()
				eventPreventDefault(ev)
			}}
			onFocus={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
			onBlur={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
			onInput={ev => props[_command](Commands.change_calculator_input, ev[_currentTarget][_value])}
		/>
		<div
			class={[
				CSS.input_output_programmer_text_output,
				CSSMiscellaneous.no_scrollbar
			][_join](' ')}>
			<Button
				selected={props[_settings][_programmer][_numberType] == NumberType[_decimal]}
				compact
				indicatorPosition={ButtonIndicatorPosition[_right]}
				onClick={() => props[_command](Commands.change_settings_programmer_numberType, NumberType[_decimal])}
				onContextMenu={(ev) => {
					eventPreventDefault(ev)
					textToCopy = getDecimalOutput()
					openMenu(ev, menu_copy_ref)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}>{getDecimalOutput()}</div>
				<span>DEC</span>
			</Button>
			<Button
				selected={props[_settings][_programmer][_numberType] == NumberType[_hexadecimal]}
				compact
				indicatorPosition={ButtonIndicatorPosition[_right]}
				onClick={() => props[_command](Commands.change_settings_programmer_numberType, NumberType[_hexadecimal])}
				onContextMenu={(ev) => {
					eventPreventDefault(ev)
					if (props[_output] == null) return;

					textToCopy = getHexadecimalOutput()
					openMenu(ev, menu_copy_ref)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}>{getHexadecimalOutput()}</div>
				<span>HEX</span>
			</Button>
			<Button
				selected={props[_settings][_programmer][_numberType] == NumberType[_octal]}
				compact
				indicatorPosition={ButtonIndicatorPosition[_right]}
				onClick={() => props[_command](Commands.change_settings_programmer_numberType, NumberType[_octal])}
				onContextMenu={(ev) => {
					eventPreventDefault(ev)
					if (props[_output] == null) return;

					textToCopy = getOctalOutput()
					openMenu(ev, menu_copy_ref)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}>{getOctalOutput()}</div>
				<span>OCT</span>
			</Button>
			<Button
				selected={props[_settings][_programmer][_numberType] == NumberType[_binary]}
				compact
				indicatorPosition={ButtonIndicatorPosition[_right]}
				onClick={() => props[_command](Commands.change_settings_programmer_numberType, NumberType[_binary])}
				onContextMenu={(ev) => {
					eventPreventDefault(ev)
					if (props[_output] == null) return;

					textToCopy = getBinaryOutput()
					openMenu(ev, menu_copy_ref)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}><Show when={props[_output] != null}>{getBinaryOutput()}</Show></div>
				<span>BIN</span>
			</Button>

			<Menu ref={r => menu_copy_ref = r}>
				<MenuItem onClick={() => {
					getNavigator()[_clipboard][_writeText](textToCopy)
					closeMenu(menu_copy_ref)
				}} leading={<Icon code={0xE51B}/>}>Copy</MenuItem>
			</Menu>
		</div>
		<ActionButtons
			command={props[_command]}
			memory={props[_memory]}
			onRecallMemory={onRecallMemory}
			hide={!props[_settings][_memoryButtons]}
			settings={props[_settings]}
		/>
		<div class={CSS.input_output_programmer_buttons}>
			<div />
			<Button onClick={() => addChar('(')}>{'('}</Button>
			<Button onClick={() => addChar(')')}>{')'}</Button>
			<Button onClick={() => clear()} classList={addClassListModule(CSS.input_output_remove_symbol)}>C</Button>
			<Button onClick={() => backspace()} classList={addClassListModule(CSS.input_output_remove_symbol)}><Icon code={0xE199} /></Button>

			<Button disabled={!isHex()} onClick={() => addChar('F')} variant={ButtonVariant[_tonal]}>F</Button>
			<Button onClick={() => addChar('not(')}>not</Button>
			<Button onClick={() => addChar('mod')}>mod</Button>
			<Button onClick={() => addChar('lsh')}>lsh</Button>
			<Button onClick={() => addChar('rsh')}>rsh</Button>

			<Button disabled={!isHex()} onClick={() => addChar('E')} variant={ButtonVariant[_tonal]}>E</Button>
			<Button onClick={() => addChar('or')}>or</Button>
			<Button onClick={() => addChar('and')}>and</Button>
			<Button onClick={() => addChar('xor')}>xor</Button>
			<Button onClick={() => addChar('^')}>^</Button>

			<Button disabled={!isHex()} onClick={() => addChar('D')} variant={ButtonVariant[_tonal]}>D</Button>
			<Button disabled={isBin()} onClick={() => addChar('7')} variant={ButtonVariant[_tonal]}>7</Button>
			<Button disabled={isOct() || isBin()} onClick={() => addChar('8')} variant={ButtonVariant[_tonal]}>8</Button>
			<Button disabled={isOct() || isBin()} onClick={() => addChar('9')} variant={ButtonVariant[_tonal]}>9</Button>
			<Button onClick={() => addChar('÷')} ><Icon code={0xEE8F}/></Button>

			<Button disabled={!isHex()} onClick={() => addChar('C')} variant={ButtonVariant[_tonal]}>C</Button>
			<Button disabled={isBin()} onClick={() => addChar('4')} variant={ButtonVariant[_tonal]}>4</Button>
			<Button disabled={isBin()} onClick={() => addChar('5')} variant={ButtonVariant[_tonal]}>5</Button>
			<Button disabled={isBin()} onClick={() => addChar('6')} variant={ButtonVariant[_tonal]}>6</Button>
			<Button onClick={() => addChar('×')}><Icon code={0xE5E9}/></Button>

			<Button disabled={!isHex()} onClick={() => addChar('B')} variant={ButtonVariant[_tonal]}>B</Button>
			<Button onClick={() => addChar('1')} variant={ButtonVariant[_tonal]}>1</Button>
			<Button disabled={isBin()} onClick={() => addChar('2')} variant={ButtonVariant[_tonal]}>2</Button>
			<Button disabled={isBin()} onClick={() => addChar('3')} variant={ButtonVariant[_tonal]}>3</Button>
			<Button onClick={() => addChar('-')}><Icon code={0xEF5D} /></Button>

			<Button disabled={!isHex()} onClick={() => addChar('A')} variant={ButtonVariant[_tonal]}>A</Button>
			<Button disabled={!isDec()} onClick={() => addChar(props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]? ',' : '.')} ><Show when={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]} fallback=".">,</Show></Button>
			<Button onClick={() => addChar('0')} variant={ButtonVariant[_tonal]}>0</Button>
			<Button onClick={() => equal()} variant={ButtonVariant[_filled]}>=</Button>
			<Button onClick={() => addChar('+')}><Icon code={0xE007}/></Button>
		</div>
	</>)
}

const DateCalculator: VoidComponent<{
	settings: Settings
	input: DateCalculatorInput
	output: string | null
	command: (type: Commands, ...args: unknown[]) => unknown
}> = (props) => {
	let datePicker_from_ref: HTMLDialogElement
	let datePicker_to_ref: HTMLDialogElement

	return (<div class={CSS.input_output_date_calculator}>
		<Dropdown
			label="Operation"
			values={[props[_settings][_date][_operation]]}
			onChangeOptions={(options) => props[_command](Commands.change_settings_date_operation, options[0][_value])}>
			<For each={[
				[DateOperation[_add], 'Add'],
				[DateOperation[_subtract], 'Subtract'],
				[DateOperation[_difference], 'Difference'],
			]}>{option => <DropdownOption value={option[0]} text={option[1]}/>}</For>
		</Dropdown>
		<div>
			<p>From</p>
			<Button
				variant={ButtonVariant[_tonal]}
				onClick={(ev) => openDatePicker(ev, datePicker_from_ref, {
					anchor: ev[_currentTarget],
					position: MenuPosition[_centerBottomToRight]
				})}>
				<Icon code={0xE2CC}/>
				{getDateString_YMD(props[_input][_from])}
			</Button>
		</div>
		<div class={CSS.input_output_date_inputs} data-hide={setElementAttributeIfExist(props[_settings][_date][_operation] == DateOperation[_difference])}>
			<NumberTextField
				min={0}
				value={props[_input][_year] + ''}
				label="Year"
				onBlur={(ev) => props[_command](
					Commands.change_calculator_input,
					{	...props[_input],
						year: safeNumber(ev[_currentTarget][_valueAsNumber], props[_input][_year])
					}
				)}
			/>
			<NumberTextField
				min={0}
				value={props[_input][_month] + ''}
				label="Month"
				onBlur={(ev) => props[_command](
					Commands.change_calculator_input,
					{	...props[_input],
						month: safeNumber(ev[_currentTarget][_valueAsNumber], props[_input][_month])
					}
				)}
			/>
			<NumberTextField
				min={0}
				value={props[_input][_day] + ''}
				label="Day"
				onBlur={(ev) => props[_command](
					Commands.change_calculator_input,
					{	...props[_input],
						day: safeNumber(ev[_currentTarget][_valueAsNumber], props[_input][_day])
					}
				)}
			/>
		</div>
		<div data-hide={setElementAttributeIfExist(props[_settings][_date][_operation] != DateOperation[_difference])}>
			<p>To</p>
			<Button
				variant={ButtonVariant[_tonal]}
				onClick={(ev) => openDatePicker(ev, datePicker_to_ref, {
					anchor: ev[_currentTarget],
					position: MenuPosition[_centerBottomToRight]
				})}>
				<Icon code={0xE2CC}/>
				{getDateString_YMD(props[_input][_to])}
			</Button>
		</div>
		<div>
			<p><Show when={setElementAttributeIfExist(props[_settings][_date][_operation] != DateOperation[_difference])} fallback="Result">Difference</Show></p>
			<h2>{props[_output]}</h2>
		</div>
		<DatePicker
			ref={r => datePicker_from_ref = r}
			date={props[_input][_from]}
			firstDate={new Date(getDate_Y() - 1000, 0, 1)}
			lastDate={new Date(getDate_Y() + 1000, 11, 31)}
			onSelectDate={(value) => props[_command](Commands.change_calculator_input, {...props[_input], from: value})}
		/>
		<DatePicker
			ref={r => datePicker_to_ref = r}
			date={props[_input][_to]}
			firstDate={new Date(getDate_Y() - 1000, 0, 1)}
			lastDate={new Date(getDate_Y() + 1000, 11, 31)}
			onSelectDate={(value) => props[_command](Commands.change_calculator_input, {...props[_input], to: value})}
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
	return (<main class={CSS.input_output_main}>
		<Switch>
			<Match when={props[_calculator] == CalculatorType[_basic]}>
				<BasicCalculator
					settings={props[_settings]}
					input={props[_inputs][_basic]}
					output={props[_outputs][_basic]}
					command={props[_command]}
					memory={props[_memory]}
				/>
			</Match>
			<Match when={props[_calculator] == CalculatorType[_scientific]}>
				<ScientificCalculator
					settings={props[_settings]}
					input={props[_inputs][_scientific]}
					output={props[_outputs][_scientific]}
					command={props[_command]}
					memory={props[_memory]}
				/>
			</Match>
			<Match when={props[_calculator] == CalculatorType[_converter]}>
				<ConverterCalculator
					settings={props[_settings]}
					input={props[_inputs][_converter]}
					output={props[_outputs][_converter]}
					command={props[_command]}
					memory={props[_memory]}
				/>
			</Match>
			<Match when={props[_calculator] == CalculatorType[_programmer]}>
				<ProgrammerCalculator
					settings={props[_settings]}
					input={props[_inputs][_programmer]}
					output={props[_outputs][_programmer]}
					command={props[_command]}
					memory={props[_memory]}
				/>
			</Match>
			<Match when={props[_calculator] == CalculatorType[_date]}>
				<DateCalculator
					settings={props[_settings]}
					input={props[_inputs][_date]}
					output={props[_outputs][_date]}
					command={props[_command]}
				/>
			</Match>
		</Switch>
	</main>)
}

export default _