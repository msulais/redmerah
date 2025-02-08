import { createEffect, createMemo, createSignal, createUniqueId, For, Match, Show, Switch, type JSX, type ParentComponent, type VoidComponent } from "solid-js"

import type { CalculatorInput, CalculatorOutput, DateCalculatorInput, Settings } from "./_types"
import { CalculatorType, Commands, DateOperation, NumberType } from "./_enums"
import { elementDataset, elementFocus, elementId, elementTagName, elementValidTarget } from "@/utils/element"
import { attrClassListModule, attrSetIfExist, attrClassList } from "@/utils/attributes"
import { CONVERTER_TYPES } from "./_constants"
import { ConverterType, UNIT_ANGLE, UNIT_AREA, UNIT_FREQUENCY, UNIT_LENGTH, UNIT_PRESSURE, UNIT_TEMPERATURE, UNIT_TIME, UNIT_VOLUME, UNIT_WEIGHT, type ConverterUnit } from "./_converter"
import { stringLength, stringMatch, stringSubstring, stringToTitleCase, stringToUpperCase, stringTrim } from "@/utils/string"
import { eventCurrentTarget, eventPreventDefault, eventTarget } from "@/utils/event"
import { dateYear, dateTextYMD } from "@/utils/datetime"
import { numberToBinary, numberFormat, numberParse, numberToRealDigits, numberToString, numberSafe, numberIsNotDefined } from "@/utils/number"
import { regexTest } from "@/utils/regex"
import { navigatorClipboardWriteText } from "@/utils/navigator"
import { ICON_ADD, ICON_ARROW_RIGHT, ICON_BACKSPACE, ICON_CALENDAR, ICON_COPY, ICON_DISMISS, ICON_LINE_HORIZONTAL_1, ICON_MATH_FORMULA, ICON_SLASH_FORWARD } from "@/constants/icons"

import { Tooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, IconButton } from "@/components/Button"
import { NumberTextField } from "@/components/TextField"
import Menu, { closeMenu, MenuDivider, MenuItem, MenuPosition, openMenu } from "@/components/Menu"
import Dropdown, { DropdownOption } from "@/components/Dropdown"
import DatePicker, { openDatePicker } from "@/components/DatePicker"
import CSSMiscellaneous from '@/styles/miscellaneous.module.scss'
import CSS from './_styles.module.scss'
import { documentActive } from "@/utils/document"
import { validEnumValue } from "@/utils/object"

const ActionButtons: ParentComponent<JSX.HTMLAttributes<HTMLDivElement> & {
	command: (type: Commands, ...args: unknown[]) => unknown
	memory: number
	settings: Settings
	onRecallMemory: (memory: number) => unknown
	hide?: boolean
}> = (props) => {
	const [isMenuMemoryOpen, setIsMenuMemoryOpen] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings)
	const buttonMemoryId = createUniqueId()
	const buttonClearId = createUniqueId()
	const buttonRecallId = createUniqueId()
	const buttonAddId = createUniqueId()
	const buttonSubtractId = createUniqueId()
	let menuMemoryRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<div class={CSS.input_output_action_buttons} data-hidden={attrSetIfExist(props.hide)}>
		{props.children}
		<div
			class={CSS.input_output_memory_buttons}
			data-hidden={attrSetIfExist(!settings().memoryButtons)}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonMemoryId:
					openMenu(menuMemoryRef, { anchor: button })
					break
				case buttonClearId:
					command(Commands.clearMemory)
					break
				case buttonRecallId:
					props.onRecallMemory(props.memory)
					break
				case buttonAddId:
					command(Commands.addMemory)
					break
				case buttonSubtractId:
					command(Commands.subtractMemory)
					break
				}
			}}>
			<Button
				data-tooltip={"Memory value " + `(${props.memory})`}
				id={buttonMemoryId}
				c:focused={isMenuMemoryOpen()}>
				M
			</Button>
			<Menu
				classList={attrClassListModule(CSS.input_output_memory_menu)}
				c:onToggleOpen={(v) => setIsMenuMemoryOpen(v)}
				ref={r => menuMemoryRef = r}>
				<p>Memory value:</p>
				<p>{props.memory}</p>
			</Menu>
			<Button
				data-tooltip="Memory clear"
				id={buttonClearId}>
				MC
			</Button>
			<Button
				data-tooltip="Memory recall"
				id={buttonRecallId}>
				MR
			</Button>
			<Button
				data-tooltip="Memory add"
				id={buttonAddId}>
				M+
			</Button>
			<Button
				data-tooltip="Memory subtract"
				id={buttonSubtractId}>
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
	const buttonClearId = createUniqueId()
	const buttonBackspaceId = createUniqueId()
	const buttonEqualId = createUniqueId()
	let inputRef: HTMLInputElement
	let caretPos: number = 0

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function addChar(char: string): void {
		let value = inputRef.value
		const prefix = stringSubstring(value, 0, caretPos)
		const suffix = stringSubstring(value, caretPos)
		value = prefix + char + suffix
		inputRef.value = value
		caretPos += stringLength(char)
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, value)
	}

	function backspace(): void {
		let value = inputRef.value
		const prefix = stringSubstring(value, 0, caretPos-1)
		const suffix = stringSubstring(value, caretPos)
		value = prefix + suffix
		inputRef.value = value
		--caretPos
		if (caretPos < 0) caretPos = 0
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, value)
	}

	function clear(): void {
		caretPos = 0
		inputRef.value = ''
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, '')
	}

	function equal(): void {
		if (output() == null) return;

		caretPos = stringLength(numberToString(output()!))
		inputRef.value = numberToString(output()!)
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, numberToRealDigits(output()!))
	}

	createEffect(() => {
		inputRef.value = props.input
		elementFocus(inputRef)
	})

	return (<>
		<input
			ref={r => inputRef = r}
			inputMode="none"
			class={CSS.input_output_basic_text_input}
			type="text"
			onKeyDown={ev => {
				if (!(ev.code == "Equal" && !ev.shiftKey)) return
				equal()
				eventPreventDefault(ev)
			}}
			onFocus={ev => caretPos = eventCurrentTarget(ev).selectionStart ?? caretPos}
			onBlur={ev => caretPos = eventCurrentTarget(ev).selectionStart ?? caretPos}
			onInput={ev => command(Commands.updateCalculatorInput, eventCurrentTarget(ev).value)}
		/>
		<div
			class={attrClassList(CSS.input_output_basic_text_output, CSSMiscellaneous.no_scrollbar)}>
			<Show
				when={settings().scientificNotation}
				fallback={output() != null && numberFormat(output()!, {
					decimal: settings().numberFormat.decimal,
					thousand: settings().numberFormat.grouping
				})}>
				{output() != null && (regexTest(/[eE]/, numberToString(output()!))
					? stringToUpperCase(numberToString(output()!))
					: numberFormat(output()!, {
						decimal: settings().numberFormat.decimal,
						thousand: settings().numberFormat.grouping
					})
				)}
			</Show>
		</div>
		<ActionButtons
			command={command}
			memory={props.memory}
			onRecallMemory={(v) => addChar(numberToRealDigits(v))}
			settings={settings()}
			hide={!settings().memoryButtons}
		/>
		<div
			class={CSS.input_output_basic_buttons}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonClearId:
					clear()
					break
				case buttonBackspaceId:
					backspace()
					break
				case buttonEqualId:
					equal()
					break
				default:
					const dataChar = elementDataset(button, 'char')
					if (dataChar) return addChar(dataChar)
				}
			}}>
			<Button data-char="%">%</Button>
			<Button data-char="√">√</Button>
			<Button id={buttonClearId} classList={attrClassListModule(CSS.input_output_remove_symbol)}>C</Button>
			<Button id={buttonBackspaceId} classList={attrClassListModule(CSS.input_output_remove_symbol)}><Icon c:code={ICON_BACKSPACE} /></Button>

			<Button data-char="7" c:variant={ButtonVariant.tonal}>7</Button>
			<Button data-char="8" c:variant={ButtonVariant.tonal}>8</Button>
			<Button data-char="9" c:variant={ButtonVariant.tonal}>9</Button>
			<Button data-char="÷"><Icon c:code={ICON_SLASH_FORWARD}/></Button>

			<Button data-char="4" c:variant={ButtonVariant.tonal}>4</Button>
			<Button data-char="5" c:variant={ButtonVariant.tonal}>5</Button>
			<Button data-char="6" c:variant={ButtonVariant.tonal}>6</Button>
			<Button data-char="×"><Icon c:code={ICON_DISMISS}/></Button>

			<Button data-char="1" c:variant={ButtonVariant.tonal}>1</Button>
			<Button data-char="2" c:variant={ButtonVariant.tonal}>2</Button>
			<Button data-char="3" c:variant={ButtonVariant.tonal}>3</Button>
			<Button data-char="-"><Icon c:code={ICON_LINE_HORIZONTAL_1} /></Button>

			<Button data-char={settings().numberFormat.decimal}>{settings().numberFormat.decimal}</Button>
			<Button data-char="0" c:variant={ButtonVariant.tonal}>0</Button>
			<Button id={buttonEqualId} c:variant={ButtonVariant.filled}>=</Button>
			<Button data-char="+"><Icon c:code={ICON_ADD}/></Button>
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
	const [isMenuFunctionOpen, setIsMenuFunctionOpen] = createSignal<boolean>(false)
	const [isHyperbolic, setIsHyperbolic] = createSignal<boolean>(false)
	const [isInverse, setIsInverse] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings)
	const output = createMemo(() => props.output)
	const getTrigonometry = createMemo<string[]>(() => {
		const i = () => isInverse()? 'a' : ''
		const h = () => isHyperbolic()? 'h' : ''
		return [
			i() + 'sin' + h(),
			i() + 'cos' + h(),
			i() + 'tan' + h(),
			i() + 'csc' + h(),
			i() + 'sec' + h(),
			i() + 'cot' + h()
		]
	})
	const buttonClearId = createUniqueId()
	const buttonBackspaceId = createUniqueId()
	const buttonEqualId = createUniqueId()
	const button_inverse_id = createUniqueId()
	const button_hyperbolic_id = createUniqueId()
	let inputRef: HTMLInputElement
	let menuFunctionRef: HTMLDialogElement
	let caretPos: number = 0

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function addChar(char: string): void {
		let value = inputRef.value
		const prefix = stringSubstring(value, 0, caretPos)
		const suffix = stringSubstring(value, caretPos)
		value = prefix + char + suffix
		inputRef.value = value
		caretPos += stringLength(char)
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, value)
	}

	function backspace(): void {
		let value = inputRef.value
		const prefix = stringSubstring(value, 0, caretPos-1)
		const suffix = stringSubstring(value, caretPos)
		value = prefix + suffix
		inputRef.value = value
		--caretPos
		if (caretPos < 0) caretPos = 0
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, value)
	}

	function clear(): void {
		caretPos = 0
		inputRef.value = ''
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, '')
	}

	function equal(): void {
		if (output() == null) return;

		caretPos = stringLength(numberToString(output()!))
		inputRef.value = numberToString(output()!)
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, numberToRealDigits(output()!))
	}

	createEffect(() => {
		inputRef.value = props.input
		elementFocus(inputRef)
	})

	return (<>
		<input
			ref={r => inputRef = r}
			inputMode="none"
			class={CSS.input_output_scientific_text_input}
			type="text"
			onKeyDown={ev => {
				if (!(ev.code == "Equal" && !ev.shiftKey)) return
				equal()
				eventPreventDefault(ev)
			}}
			onFocus={ev => caretPos = eventCurrentTarget(ev).selectionStart ?? caretPos}
			onBlur={ev => caretPos = eventCurrentTarget(ev).selectionStart ?? caretPos}
			onInput={ev => command(Commands.updateCalculatorInput, eventCurrentTarget(ev).value)}
		/>
		<div
			class={attrClassList(
				CSS.input_output_scientific_text_output,
				CSSMiscellaneous.no_scrollbar
			)}>
			<Show
				when={settings().scientificNotation}
				fallback={output() != null && numberFormat(output()!, {
					decimal: settings().numberFormat.decimal,
					thousand: settings().numberFormat.grouping
				})}>
				{output() != null && (regexTest(/[eE]/, numberToString(output()!))
					? stringToUpperCase(numberToString(output()!))
					: numberFormat(output()!, {
						decimal: settings().numberFormat.decimal,
						thousand: settings().numberFormat.grouping
					})
				)}
			</Show>
		</div>
		<ActionButtons
			command={command}
			memory={props.memory}
			onRecallMemory={(v) => addChar(numberToRealDigits(v))}
			settings={settings()}>
			<Button
				onClick={ev => openMenu(menuFunctionRef, {
					anchor: eventCurrentTarget(ev),
					position: MenuPosition.centerBottomToRight
				})}
				c:focused={isMenuFunctionOpen()}>
				<Icon c:code={ICON_MATH_FORMULA}/>
				Function
			</Button>
			<Menu
				classList={attrClassListModule(CSS.input_output_scientific_function_menu)}
				ref={r => menuFunctionRef = r}
				c:onToggleOpen={(v) => setIsMenuFunctionOpen(v)}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					switch (elementId(button)) {
					case button_inverse_id:
						setIsInverse(v => !v)
						break
					case button_hyperbolic_id:
						setIsHyperbolic(v => !v)
						break
					default:
						const dataChar = elementDataset(button, 'char')
						if (dataChar) return addChar(dataChar)
					}
				}}>
				<div class={CSS.input_output_trigonometry_options}>
					<MenuItem c:checked={isInverse()} id={button_inverse_id}>Invers</MenuItem>
					<MenuItem c:checked={isHyperbolic()} id={button_hyperbolic_id}>Hyperbolic</MenuItem>
				</div>
				<div class={CSS.input_output_grid_3}>
					<For each={getTrigonometry()}>{t => <MenuItem data-char={t + '('}>{`${t}(x)`}</MenuItem>}</For>
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
				onClick={() => command(Commands.toggleSettingsScientificAngle)}>
				{settings().scientific.angle}
			</Button>
		</ActionButtons>
		<div
			class={CSS.input_output_scientific_buttons}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonClearId:
					clear()
					break
				case buttonBackspaceId:
					backspace()
					break
				case buttonEqualId:
					equal()
					break
				default:
					const dataChar = elementDataset(button, 'char')
					if (dataChar) return addChar(dataChar)
				}
			}}>
			<Button data-char="mod">mod</Button>
			<Button data-char="(">{'('}</Button>
			<Button data-char=")">{')'}</Button>
			<Button id={buttonClearId} classList={attrClassListModule(CSS.input_output_remove_symbol)}>C</Button>
			<Button id={buttonBackspaceId} classList={attrClassListModule(CSS.input_output_remove_symbol)}><Icon c:code={ICON_BACKSPACE} /></Button>

			<Button data-char="%">%</Button>
			<Button data-char="10^">10^</Button>
			<Button data-char="^2">^2</Button>
			<Button data-char="e^">e^</Button>
			<Button data-char="^">^</Button>

			<Button data-char="!">!</Button>
			<Button data-char="7" c:variant={ButtonVariant.tonal}>7</Button>
			<Button data-char="8" c:variant={ButtonVariant.tonal}>8</Button>
			<Button data-char="9" c:variant={ButtonVariant.tonal}>9</Button>
			<Button data-char="÷" ><Icon c:code={ICON_SLASH_FORWARD}/></Button>

			<Button data-char="e">e</Button>
			<Button data-char="4" c:variant={ButtonVariant.tonal}>4</Button>
			<Button data-char="5" c:variant={ButtonVariant.tonal}>5</Button>
			<Button data-char="6" c:variant={ButtonVariant.tonal}>6</Button>
			<Button data-char="×"><Icon c:code={ICON_DISMISS}/></Button>

			<Button data-char="π">π</Button>
			<Button data-char="1" c:variant={ButtonVariant.tonal}>1</Button>
			<Button data-char="2" c:variant={ButtonVariant.tonal}>2</Button>
			<Button data-char="3" c:variant={ButtonVariant.tonal}>3</Button>
			<Button data-char="-"><Icon c:code={ICON_LINE_HORIZONTAL_1} /></Button>

			<Button data-char="√">√</Button>
			<Button data-char={settings().numberFormat.decimal}>{settings().numberFormat.decimal}</Button>
			<Button data-char="0" c:variant={ButtonVariant.tonal}>0</Button>
			<Button id={buttonEqualId} c:variant={ButtonVariant.filled}>=</Button>
			<Button data-char="+"><Icon c:code={ICON_ADD}/></Button>
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
	const [isMenuConverterTypeOpen, setIsMenuConverterTypeOpen] = createSignal<boolean>(false)
	const [isMenuInputUnitOpen, setIsMenuInputUnitOpen] = createSignal<boolean>(false)
	const [isMenuOutputUnitOpen, setIsMenuOutputUnitOpen] = createSignal<boolean>(false)
	const settings = createMemo(() => props.settings)
	const output = createMemo(() => props.output)
	const input = createMemo(() => props.input)
	const getConverterIcon = createMemo<number>(() => {
		for (const c of CONVERTER_TYPES) {
			if (c.type == settings().converter.type) return c.icon
		}
		return 0
	})
	const getUnits = createMemo<ConverterUnit[]>(() => {
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
	const getConverterName = createMemo<string>(() => {
		const type = settings().converter.type
		if (type == ConverterType.weight) return 'Weight & mass'
		return stringToTitleCase(type)
	})
	const buttonClearId = createUniqueId()
	const buttonBackspaceId = createUniqueId()
	const buttonEqualId = createUniqueId()
	const button_plusminus_id = createUniqueId()
	let inputRef: HTMLInputElement
	let menuConverterTypeRef: HTMLDialogElement
	let menuInputUnitRef: HTMLDialogElement
	let menuOutputUnitRef: HTMLDialogElement
	let caretPos: number = 0

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function addChar(char: string): void {
		let value = inputRef.value
		const prefix = stringSubstring(value, 0, caretPos)
		const suffix = stringSubstring(value, caretPos)
		value = prefix + char + suffix
		inputRef.value = value
		caretPos += stringLength(char)
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, value)
	}

	function backspace(): void {
		let value = inputRef.value
		const prefix = stringSubstring(value, 0, caretPos-1)
		const suffix = stringSubstring(value, caretPos)
		value = prefix + suffix
		inputRef.value = value
		--caretPos
		if (caretPos < 0) caretPos = 0
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, value)
	}

	function clear(): void {
		caretPos = 0
		inputRef.value = ''
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, '')
	}

	function equal(): void {
		if (output() == null) return;

		caretPos = stringLength(numberToString(output()!))
		inputRef.value = numberToString(output()!)
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, numberToRealDigits(output()!))
	}

	function plusMinus(): void {
		const re = /(.*?)([-+]{0,2})(\d*(?:\.\d*)?)$/s
		const match = stringMatch(stringSubstring(input(), 0, caretPos), re)
		let value: string = input()
		if (stringTrim(input()) == '') {
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

			const prefix = stringSubstring(input(), 0, stringLength(pre))
			const suffix = stringSubstring(input(), caretPos)
			caretPos = stringLength(prefix) + stringLength(value)
			value = prefix + value + suffix
		}

		inputRef.value = value
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, value)
	}

	createEffect(() => {
		inputRef.value = input()
		elementFocus(inputRef)
	})

	return (<>
		<input
			ref={r => inputRef = r}
			inputMode="none"
			class={CSS.input_output_converter_text_input}
			type="text"
			onKeyDown={ev => {
				if (!(ev.code == "Equal" && !ev.shiftKey)) return
				equal()
				eventPreventDefault(ev)
			}}
			onFocus={ev => caretPos = eventCurrentTarget(ev).selectionStart ?? caretPos}
			onBlur={ev => caretPos = eventCurrentTarget(ev).selectionStart ?? caretPos}
			onInput={ev => command(Commands.updateCalculatorInput, eventCurrentTarget(ev).value)}
		/>
		<div
			class={attrClassList(
				CSS.input_output_converter_text_output,
				CSSMiscellaneous.no_scrollbar
			)}>
			<Show
				when={settings().scientificNotation}
				fallback={output() != null && numberFormat(output()!, {
					decimal: settings().numberFormat.decimal,
					thousand: settings().numberFormat.grouping
				})}>
				{output() != null && (regexTest(/[eE]/, numberToString(output()!))
					? stringToUpperCase(numberToString(output()!))
					: numberFormat(output()!, {
						decimal: settings().numberFormat.decimal,
						thousand: settings().numberFormat.grouping
					})
				)}
			</Show>
		</div>
		<ActionButtons
			command={command}
			memory={props.memory}
			onRecallMemory={(v) => addChar(numberToRealDigits(v))}
			settings={settings()}>
			<Button
				data-tooltip="Select converter type"
				c:focused={isMenuConverterTypeOpen()}
				onClick={ev => openMenu(menuConverterTypeRef, {
					anchor: eventCurrentTarget(ev),
					position: MenuPosition.centerBottomToRight,
					allowHideAnchor: false
				})}
				c:variant={ButtonVariant.tonal}>
				<Icon c:code={getConverterIcon()}/>
				{getConverterName()}
			</Button>

			<Menu
				ref={r => menuConverterTypeRef = r}
				c:onToggleOpen={v => setIsMenuConverterTypeOpen(v)}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == 'BUTTON'
					)) return

					const dataType = elementDataset(button, 'type')
					if (dataType
						&& validEnumValue(dataType, ConverterType)
					) {
						command(Commands.updateSettingsConverterType, dataType)
						closeMenu(menuConverterTypeRef)
						return
					}
				}}>
				<For each={CONVERTER_TYPES}>{c =>
					<MenuItem
						c:selected={c.type == settings().converter.type}
						data-type={c.type}
						c:leading={<Icon c:code={c.icon}/>}>
						{c.text}
					</MenuItem>
				}</For>
			</Menu>

			<div class={CSS.input_output_converter_units}>
				<Button
					data-tooltip="Select input unit"
					c:focused={isMenuInputUnitOpen()}
					onClick={ev => openMenu(menuInputUnitRef, {
						anchor: eventCurrentTarget(ev),
						position: MenuPosition.centerBottomToRight,
						allowHideAnchor: false
					})}
					style={{color: 'rgb(var(--g-color-accent))'}}>
					{settings().converter.unitInput.name + ` (${settings().converter.unitInput.symbol})`}
				</Button>

				<Menu
					ref={r => menuInputUnitRef = r}
					c:onToggleOpen={v => setIsMenuInputUnitOpen(v)}
					onClick={ev => {
						const button = documentActive()!
						if (!elementValidTarget(
							eventCurrentTarget(ev),
							button,
							el => elementTagName(el) == "BUTTON"
						)) return

						const dataIndex = elementDataset(button, 'index')
						if (dataIndex) {
							const index = numberParse(dataIndex, true)
							if (numberIsNotDefined(index)) return

							const unit = getUnits()[index]
							if (!unit) return

							command(Commands.updateSettingsConverterInputUnit, unit)
							closeMenu(menuInputUnitRef)
							return
						}
					}}>
					<For each={getUnits()}>{(u, i) =>
						<MenuItem
							data-index={i()}
							c:selected={u.equals(settings().converter.unitInput)}>
							{u.name + ` (${u.symbol})`}
						</MenuItem>
					}</For>
				</Menu>
				<IconButton
					data-tooltip="Swap unit"
					onClick={() => command(Commands.swapConverterUnits)}
					c:code={ICON_ARROW_RIGHT}
				/>
				<Button
					data-tooltip="Select output unit"
					c:focused={isMenuOutputUnitOpen()}
					onClick={ev => openMenu(menuOutputUnitRef, {
						anchor: eventCurrentTarget(ev),
						position: MenuPosition.centerBottomToRight,
						allowHideAnchor: false
					})}
					style={{color: 'rgb(var(--g-color-accent))'}}>
					{settings().converter.unitOutput.name + ` (${settings().converter.unitOutput.symbol})`}
				</Button>
			</div>

			<Menu
				ref={r => menuOutputUnitRef = r}
				c:onToggleOpen={v => setIsMenuOutputUnitOpen(v)}
				onClick={ev => {
					const button = documentActive()!
					if (!elementValidTarget(
						eventCurrentTarget(ev),
						button,
						el => elementTagName(el) == "BUTTON"
					)) return

					const dataIndex = elementDataset(button, 'index')
					if (dataIndex) {
						const index = numberParse(dataIndex, true)
						if (numberIsNotDefined(index)) return

						const unit = getUnits()[index]
						if (!unit) return

						command(Commands.updateSettingsConverterOutputUnit, unit)
						closeMenu(menuInputUnitRef)
						return
					}
				}}>
				<For each={getUnits()}>{(u, i) =>
					<MenuItem
						data-index={i()}
						c:selected={u.equals(settings().converter.unitOutput)}>
						{u.name + ` (${u.symbol})`}
					</MenuItem>
				}</For>
			</Menu>
		</ActionButtons>
		<div
			class={CSS.input_output_converter_buttons}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonClearId:
					clear()
					break
				case buttonBackspaceId:
					backspace()
					break
				case buttonEqualId:
					equal()
					break
				case button_plusminus_id:
					plusMinus()
					break
				default:
					const dataChar = elementDataset(button, 'char')
					if (dataChar) return addChar(dataChar)
				}
			}}>
			<Button id={button_plusminus_id}>±</Button>
			<Button id={buttonClearId} classList={attrClassListModule(CSS.input_output_remove_symbol)}>C</Button>
			<Button id={buttonBackspaceId} classList={attrClassListModule(CSS.input_output_remove_symbol)}><Icon c:code={ICON_BACKSPACE} /></Button>

			<Button data-char="7" c:variant={ButtonVariant.tonal}>7</Button>
			<Button data-char="8" c:variant={ButtonVariant.tonal}>8</Button>
			<Button data-char="9" c:variant={ButtonVariant.tonal}>9</Button>

			<Button data-char="4" c:variant={ButtonVariant.tonal}>4</Button>
			<Button data-char="5" c:variant={ButtonVariant.tonal}>5</Button>
			<Button data-char="6" c:variant={ButtonVariant.tonal}>6</Button>

			<Button data-char="1" c:variant={ButtonVariant.tonal}>1</Button>
			<Button data-char="2" c:variant={ButtonVariant.tonal}>2</Button>
			<Button data-char="3" c:variant={ButtonVariant.tonal}>3</Button>

			<Button data-char={settings().numberFormat.decimal}>{settings().numberFormat.decimal}</Button>
			<Button data-char="0" c:variant={ButtonVariant.tonal}>0</Button>
			<Button id={buttonEqualId} c:variant={ButtonVariant.filled}>=</Button>
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
	const outputDecimal = createMemo<string>(() => {
		if (output() == null) return ''

		if (settings().scientificNotation) return (regexTest(/[eE]/, numberToString(output()!))
			? stringToUpperCase(numberToString(output()!))
			: numberFormat(output()!, {
				decimal: settings().numberFormat.decimal,
				thousand: settings().numberFormat.grouping
			})
		)

		return numberFormat(output()!, {
			decimal: settings().numberFormat.decimal,
			thousand: settings().numberFormat.grouping
		})
	})
	const outputBinary = createMemo<string>(() => output() != null
		? numberToBinary(output()!)
		: ''
	)
	const outputHex = createMemo<string>(() => output() != null
		? stringToUpperCase(numberToString(numberParse(outputBinary(), true, 2), 16))
		: ''
	)
	const outputOctal = createMemo<string>(() => output() != null
		? numberToString(numberParse(outputBinary(), true, 2), 8)
		: ''
	)
	const isDec = createMemo(() => settings().programmer.numberType == NumberType.decimal)
	const isHex = createMemo(() => settings().programmer.numberType == NumberType.hexadecimal)
	const isOct = createMemo(() => settings().programmer.numberType == NumberType.octal)
	const isBin = createMemo(() => settings().programmer.numberType == NumberType.binary)
	const buttonClearId = createUniqueId()
	const buttonBackspaceId = createUniqueId()
	const buttonEqualId = createUniqueId()
	let menuCopyRef: HTMLDialogElement
	let inputRef: HTMLInputElement
	let caretPos: number = 0
	let textToCopy: string = ''

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	function addChar(char: string): void {
		let value = inputRef.value
		const prefix = stringSubstring(value, 0, caretPos)
		const suffix = stringSubstring(value, caretPos)
		value = prefix + char + suffix
		inputRef.value = value
		caretPos += stringLength(char)
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, value)
	}

	function backspace(): void {
		let value = inputRef.value
		const prefix = stringSubstring(value, 0, caretPos-1)
		const suffix = stringSubstring(value, caretPos)
		value = prefix + suffix
		inputRef.value = value
		--caretPos
		if (caretPos < 0) caretPos = 0
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, value)
	}

	function clear(): void {
		caretPos = 0
		inputRef.value = ''
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, '')
	}

	function equal(): void {
		if (output() == null) return;

		let $output = numberToString(output()!)
		const type = settings().programmer.numberType
		if (type == NumberType.hexadecimal) $output = outputHex()
		else if (type == NumberType.octal) $output = outputOctal()
		else if (type == NumberType.binary) $output = outputBinary()

		caretPos = stringLength($output)
		inputRef.value = $output
		inputRef.setSelectionRange(caretPos, caretPos)
		elementFocus(inputRef)
		command(Commands.updateCalculatorInput, $output)
	}

	function onRecallMemory(value: number): void {
		const type = settings().programmer.numberType
		let $value = ''

		if (type == NumberType.decimal) $value = numberToRealDigits(value)
		else if (type == NumberType.hexadecimal) $value = stringToUpperCase(numberToString(numberParse(numberToBinary(value), true, 2), 16))
		else if (type == NumberType.octal) $value = numberToString(numberParse(numberToBinary(value), true, 2), 8)
		else if (type == NumberType.binary) $value = numberToBinary(value)

		addChar($value)
	}

	createEffect(() => {
		inputRef.value = props.input
		elementFocus(inputRef)
	})

	return (<>
		<input
			ref={r => inputRef = r}
			inputMode="none"
			class={CSS.input_output_programmer_text_input}
			type="text"
			onKeyDown={ev => {
				if (!(ev.code == "Equal" && !ev.shiftKey)) return
				equal()
				eventPreventDefault(ev)
			}}
			onFocus={ev => caretPos = eventCurrentTarget(ev).selectionStart ?? caretPos}
			onBlur={ev => caretPos = eventCurrentTarget(ev).selectionStart ?? caretPos}
			onInput={ev => command(Commands.updateCalculatorInput, eventCurrentTarget(ev).value)}
		/>
		<div
			class={attrClassList(
				CSS.input_output_programmer_text_output,
				CSSMiscellaneous.no_scrollbar
			)}>
			<Button
				c:selected={settings().programmer.numberType == NumberType.decimal}
				c:indicatorPosition={ButtonIndicatorPosition.right}
				onClick={() => command(Commands.updateSettingsProgrammerNumberType, NumberType.decimal)}
				onContextMenu={(ev) => {
					eventPreventDefault(ev)
					textToCopy = outputDecimal()
					openMenu(menuCopyRef)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}>{outputDecimal()}</div>
				<span>DEC</span>
			</Button>
			<Button
				c:selected={settings().programmer.numberType == NumberType.hexadecimal}
				c:indicatorPosition={ButtonIndicatorPosition.right}
				onClick={() => command(Commands.updateSettingsProgrammerNumberType, NumberType.hexadecimal)}
				onContextMenu={(ev) => {
					eventPreventDefault(ev)
					if (output() == null) return;

					textToCopy = outputHex()
					openMenu(menuCopyRef)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}>{outputHex()}</div>
				<span>HEX</span>
			</Button>
			<Button
				c:selected={settings().programmer.numberType == NumberType.octal}
				c:indicatorPosition={ButtonIndicatorPosition.right}
				onClick={() => command(Commands.updateSettingsProgrammerNumberType, NumberType.octal)}
				onContextMenu={(ev) => {
					eventPreventDefault(ev)
					if (output() == null) return;

					textToCopy = outputOctal()
					openMenu(menuCopyRef)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}>{outputOctal()}</div>
				<span>OCT</span>
			</Button>
			<Button
				c:selected={settings().programmer.numberType == NumberType.binary}
				c:indicatorPosition={ButtonIndicatorPosition.right}
				onClick={() => command(Commands.updateSettingsProgrammerNumberType, NumberType.binary)}
				onContextMenu={(ev) => {
					eventPreventDefault(ev)
					if (output() == null) return;

					textToCopy = outputBinary()
					openMenu(menuCopyRef)
				}}>
				<div class={CSSMiscellaneous.no_scrollbar}><Show when={output() != null}>{outputBinary()}</Show></div>
				<span>BIN</span>
			</Button>

			<Menu ref={r => menuCopyRef = r}>
				<MenuItem onClick={() => {
					navigatorClipboardWriteText(textToCopy)
					closeMenu(menuCopyRef)
				}} c:leading={<Icon c:code={ICON_COPY}/>}>Copy</MenuItem>
			</Menu>
		</div>
		<ActionButtons
			command={command}
			memory={props.memory}
			onRecallMemory={onRecallMemory}
			hide={!settings().memoryButtons}
			settings={settings()}
		/>
		<div
			class={CSS.input_output_programmer_buttons}
			onClick={ev => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
				case buttonClearId:
					clear()
					break
				case buttonBackspaceId:
					backspace()
					break
				case buttonEqualId:
					equal()
					break
				default:
					const dataChar = elementDataset(button, 'char')
					if (dataChar) return addChar(dataChar)
				}
			}}>
			<div />
			<Button data-char="(">{'('}</Button>
			<Button data-char=")">{')'}</Button>
			<Button id={buttonClearId} classList={attrClassListModule(CSS.input_output_remove_symbol)}>C</Button>
			<Button id={buttonBackspaceId} classList={attrClassListModule(CSS.input_output_remove_symbol)}><Icon c:code={ICON_BACKSPACE} /></Button>

			<Button data-char="F" disabled={!isHex()} c:variant={ButtonVariant.tonal}>F</Button>
			<Button data-char="not(">not</Button>
			<Button data-char="mod">mod</Button>
			<Button data-char="lsh">lsh</Button>
			<Button data-char="rsh">rsh</Button>

			<Button data-char="E" disabled={!isHex()} c:variant={ButtonVariant.tonal}>E</Button>
			<Button data-char="or">or</Button>
			<Button data-char="and">and</Button>
			<Button data-char="xor">xor</Button>
			<Button data-char="^">^</Button>

			<Button data-char="D" disabled={!isHex()} c:variant={ButtonVariant.tonal}>D</Button>
			<Button data-char="7" disabled={isBin()} c:variant={ButtonVariant.tonal}>7</Button>
			<Button data-char="8" disabled={isOct() || isBin()} c:variant={ButtonVariant.tonal}>8</Button>
			<Button data-char="9" disabled={isOct() || isBin()} c:variant={ButtonVariant.tonal}>9</Button>
			<Button data-char="÷" ><Icon c:code={ICON_SLASH_FORWARD}/></Button>

			<Button data-char="C" disabled={!isHex()} c:variant={ButtonVariant.tonal}>C</Button>
			<Button data-char="4" disabled={isBin()} c:variant={ButtonVariant.tonal}>4</Button>
			<Button data-char="5" disabled={isBin()} c:variant={ButtonVariant.tonal}>5</Button>
			<Button data-char="6" disabled={isBin()} c:variant={ButtonVariant.tonal}>6</Button>
			<Button data-char="×"><Icon c:code={ICON_DISMISS}/></Button>

			<Button data-char="B" disabled={!isHex()} c:variant={ButtonVariant.tonal}>B</Button>
			<Button data-char="1" c:variant={ButtonVariant.tonal}>1</Button>
			<Button data-char="2" disabled={isBin() } c:variant={ButtonVariant.tonal}>2</Button>
			<Button data-char="3" disabled={isBin() } c:variant={ButtonVariant.tonal}>3</Button>
			<Button data-char="-"><Icon c:code={ICON_LINE_HORIZONTAL_1} /></Button>

			<Button data-char="A" disabled={!isHex()} c:variant={ButtonVariant.tonal}>A</Button>
			<Button data-char={settings().numberFormat.decimal} disabled={!isDec()}>{settings().numberFormat.decimal}</Button>
			<Button data-char="0" c:variant={ButtonVariant.tonal}>0</Button>
			<Button id={buttonEqualId} c:variant={ButtonVariant.filled}>=</Button>
			<Button data-char="+"><Icon c:code={ICON_ADD}/></Button>
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
	const buttonFromId = createUniqueId()
	const buttonToId = createUniqueId()
	const inputYearId = createUniqueId()
	const inputMonthId = createUniqueId()
	const inputDayId = createUniqueId()
	let datePickerFromRef: HTMLDialogElement
	let datePickerToRef: HTMLDialogElement

	function command(type: Commands, ...args: unknown[]): unknown {
		return props.command(type, ...args)
	}

	return (<div
		class={CSS.input_output_date_calculator}
		onClick={ev => {
			const button = documentActive()!
			if (!elementValidTarget(
				eventCurrentTarget(ev),
				button,
				el => elementTagName(el) == 'BUTTON'
			)) return

			switch (elementId(button)) {
			case buttonFromId:
				openDatePicker(datePickerFromRef, {
					anchor: button,
					position: MenuPosition.centerBottomToRight
				})
				break
			case buttonToId:
				openDatePicker(datePickerToRef, {
					anchor: button,
					position: MenuPosition.centerBottomToRight
				})
				break
			}
		}}
		onFocusOut={ev => {
			const target = eventTarget(ev) as HTMLInputElement

			switch (elementId(target)) {
			case inputYearId:
				command(Commands.updateCalculatorInput, {
					...input(),
					year: numberSafe(target.valueAsNumber, input().year)
				})
				break
			case inputMonthId:
				command(Commands.updateCalculatorInput, {
					...input(),
					month: numberSafe(target.valueAsNumber, input().month)
				})
				break
			case inputDayId:
				command(Commands.updateCalculatorInput, {
					...input(),
					day: numberSafe(target.valueAsNumber, input().day)
				})
				break
			}
		}}>
		<Dropdown
			c:label="Operation"
			c:values={[settings().date.operation]}
			c:onChange={(options) => command(Commands.updateSettingsDateOperation, options[0].value)}>
			<For each={[
				[DateOperation.add, 'Add'],
				[DateOperation.subtract, 'Subtract'],
				[DateOperation.difference, 'Difference'],
			]}>{option => <DropdownOption c:value={option[0]} c:text={option[1]}/>}</For>
		</Dropdown>
		<div>
			<p>From</p>
			<Button
				c:variant={ButtonVariant.tonal}
				id={buttonFromId}>
				<Icon c:code={ICON_CALENDAR}/>
				{dateTextYMD(input().from)}
			</Button>
		</div>
		<div class={CSS.input_output_date_inputs} data-hide={attrSetIfExist(settings().date.operation == DateOperation.difference)}>
			<NumberTextField
				min={0}
				value={input().year + ''}
				c:label="Year"
				id={inputYearId}
			/>
			<NumberTextField
				min={0}
				value={input().month + ''}
				c:label="Month"
				id={inputMonthId}
			/>
			<NumberTextField
				min={0}
				value={input().day + ''}
				c:label="Day"
				id={inputDayId}
			/>
		</div>
		<div data-hide={attrSetIfExist(settings().date.operation != DateOperation.difference)}>
			<p>To</p>
			<Button
				c:variant={ButtonVariant.tonal}
				id={buttonToId}>
				<Icon c:code={ICON_CALENDAR}/>
				{dateTextYMD(input().to)}
			</Button>
		</div>
		<div>
			<p><Show when={attrSetIfExist(settings().date.operation != DateOperation.difference)} fallback="Result">Difference</Show></p>
			<h2>{props.output}</h2>
		</div>
		<DatePicker
			ref={r => datePickerFromRef = r}
			c:date={input().from}
			c:firstDate={new Date(dateYear() - 1000, 0, 1)}
			c:lastDate={new Date(dateYear() + 1000, 11, 31)}
			c:onSelectDate={(value) => command(Commands.updateCalculatorInput, {...input(), from: value})}
		/>
		<DatePicker
			ref={r => datePickerToRef = r}
			c:date={input().to}
			c:firstDate={new Date(dateYear() - 1000, 0, 1)}
			c:lastDate={new Date(dateYear() + 1000, 11, 31)}
			c:onSelectDate={(value) => command(Commands.updateCalculatorInput, {...input(), to: value})}
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