import { createEffect, createMemo, createSignal, For, Match, onMount, Show, Switch, type JSX, type ParentComponent, type VoidComponent } from "solid-js"

import { CalculatorType, Commands, DateOperation, DecimalNumberFormat, NumberType } from "./_enums"
import { _abs, _angle, _area, _basic, _calculator, _ceil, _CENTER_BOTTOM_TO_RIGHT, _CENTER_TOP, _children, _comma, _command, _converter, _cos, _cot, _csc, _currentTarget, _date, _decimal, _filled, _filledTonal, _floor, _focus, _frequency, _grouping, _hide, _icon, _index, _input, _inputs, _inputUnit, _equals, _join, _length, _ln, _log, _match, _memory, _memoryButtons, _name, _none, _number, _numberFormat, _onRecallMemory, _output, _outputs, _outputUnit, _pressure, _programmer, _replace, _round, _scientific, _scientificNotation, _sec, _selectionEnd, _selectionStart, _setSelectionRange, _settings, _sin, _substring, _symbol, _tan, _temperature, _test, _text, _time, _toExponential, _toString, _toUpperCase, _trim, _type, _value, _volume, _weight, _right, _clipboard, _writeText, _hexadecimal, _numberType, _octal, _binary, _code, _shiftKey, _to, _from, _radio, _operation, _add, _difference, _subtract, _year, _day, _month } from "@/data/string"
import type { CalculatorInput, CalculatorOutput, DateCalculatorInput, Settings } from "./_types"
import { addClassListModule } from "@/utils/element"
import { closePopover, openPopover } from "@/utils/popover"
import { PopoverPosition, Position } from "@/enums/position"
import { toggleAttribute } from "@/utils/attributes"
import { _add_memory, _change_calculator_input, _change_settings_converter_inputUnit, _change_settings_converter_outputUnit, _change_settings_converter_swapUnit, _change_settings_converter_type, _change_settings_date_operation, _change_settings_programmer_numberType, _clear_memory, _subtract_memory, _toggle_settings_scientific_angle, CONVERTER_TYPES } from "./_data"
import { ConverterType, UNIT_ANGLE, UNIT_AREA, UNIT_FREQUENCY, UNIT_LENGTH, UNIT_PRESSURE, UNIT_TEMPERATURE, UNIT_TIME, UNIT_VOLUME, UNIT_WEIGHT, type ConverterUnit } from "./_converter"
import { stringToTitleCase } from "@/utils/string"
import { preventDefault } from "@/utils/event"
import { getNavigator } from "@/data/window"
import { floatToBinary, formatNumber, mathFloor, numberParse, numberToRealDigit } from "@/utils/math"
import { getDate_Y, getDateString_YMD } from "@/utils/datetime"

import Tooltip from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import { changeTextFieldValue, NumberTextField } from "@/components/TextField"
import Menu, { MenuDivider, MenuItem } from "@/components/Menu"
import Dropdown from "@/components/Dropdown"
import DatePicker from "@/components/DatePicker"
import CSSMiscellaneous from '@/styles/miscellaneous.module.scss'
import CSS from './_InputOutput.module.scss'

type Props = {
    calculator: CalculatorType
    settings: Settings
    inputs: CalculatorInput
    outputs: CalculatorOutput
    memory: number
    command: (type: Commands, ...args: unknown[]) => unknown
}

type BasicCalculatorProps = {
    settings: Settings
    input: string
    memory: number
    output: number | null
    command: (type: Commands, ...args: unknown[]) => unknown
}

type ScientificCalculatorProps = {
    settings: Settings
    input: string
    memory: number
    output: number | null
    command: (type: Commands, ...args: unknown[]) => unknown
}

type ConverterCalculatorProps = {
    settings: Settings
    input: string
    memory: number
    output: number | null
    command: (type: Commands, ...args: unknown[]) => unknown
}

type ProgrammerCalculatorProps = {
    settings: Settings
    input: string
    memory: number
    output: number | null
    command: (type: Commands, ...args: unknown[]) => unknown
}

type DateCalculatorProps = {
    settings: Settings
    input: DateCalculatorInput
    output: string | null
    command: (type: Commands, ...args: unknown[]) => unknown
}

type ActionButtonsProps = JSX.HTMLAttributes<HTMLDivElement> & {
    command: (type: Commands, ...args: unknown[]) => unknown
    memory: number
    settings: Settings
    onRecallMemory: (memory: number) => unknown
    hide?: boolean
}

const ActionButtons: ParentComponent<ActionButtonsProps> = (props) => {
    const [button_memory_ref, set_button_memory_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_memoryClear_ref, set_button_memoryClear_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_memoryRecall_ref, set_button_memoryRecall_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_memoryAdd_ref, set_button_memoryAdd_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_memorySubtract_ref, set_button_memorySubtract_ref] = createSignal<HTMLButtonElement | null>(null)
    const [is_menu_memory_open, setIs_menu_memory_open] = createSignal<boolean>(false)
    let menu_memory_ref: HTMLDialogElement

    return (<div class={CSS.action_buttons} data-hidden={toggleAttribute(props[_hide])}>
        {props[_children]}
        <div class={CSS.memory_buttons} data-hidden={toggleAttribute(!props[_settings][_memoryButtons])}>
            <Tooltip anchor={button_memory_ref()} text={"Memory value " + `(${props[_memory]})`}/>
            <Button 
                ref={r => set_button_memory_ref(r)}
                focus={is_menu_memory_open()}
                onClick={(ev) => openPopover({
                    event: ev, 
                    popover: menu_memory_ref, 
                    anchor: button_memory_ref()!,
                })}>M</Button>

            <Menu classList={addClassListModule(CSS.memory_menu)} onToggle={(v) => setIs_menu_memory_open(v)} ref={r => menu_memory_ref = r}>
                <p>Memory value:</p>
                <p>{props[_memory]}</p>
            </Menu>

            <Tooltip anchor={button_memoryClear_ref()} text="Memory clear"/>
            <Button     
                ref={r => set_button_memoryClear_ref(r)} 
                onClick={() => props[_command](Commands[_clear_memory])}>
                MC
            </Button>

            <Tooltip anchor={button_memoryRecall_ref()} text="Memory recall"/>
            <Button 
                ref={r => set_button_memoryRecall_ref(r)} 
                onClick={() => props[_onRecallMemory](props[_memory])}>
                MR
            </Button>

            <Tooltip anchor={button_memoryAdd_ref()} text="Memory add"/>
            <Button 
                ref={r => set_button_memoryAdd_ref(r)} 
                onClick={() => props[_command](Commands[_add_memory])}>
                M+
            </Button>

            <Tooltip anchor={button_memorySubtract_ref()} text="Memory subtract"/>
            <Button 
                ref={r => set_button_memorySubtract_ref(r)} 
                onClick={() => props[_command](Commands[_subtract_memory])}>
                M-
            </Button>
        </div>
    </div>)
}

const BasicCalculator: VoidComponent<BasicCalculatorProps> = (props) => {
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
        props[_command](Commands[_change_calculator_input], value)
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
        props[_command](Commands[_change_calculator_input], value)
    }

    function clear(): void {
        caretPos = 0
        input_ref[_value] = ''
        input_ref[_setSelectionRange](caretPos, caretPos)
        input_ref[_focus]()
        props[_command](Commands[_change_calculator_input], '')
    }

    function equal(): void {
        if (!props[_output]) return;

        caretPos = props[_output][_toString]()[_length]
        input_ref[_value] = props[_output][_toString]()
        input_ref[_setSelectionRange](caretPos, caretPos)
        input_ref[_focus]()
        props[_command](Commands[_change_calculator_input], numberToRealDigit(props[_output]))
    }

    createEffect(() => {
        input_ref[_value] = props[_input]
        input_ref[_focus]()
    })

    return (<>
        <input 
            ref={r => input_ref = r}
            inputMode={_none}
            class={CSS.basic_text_input}
            type={_text}
            onKeyDown={ev => {
                if (!(ev[_code] == "Equal" && !ev[_shiftKey])) return
                equal()
                preventDefault(ev)
            }}
            onFocus={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
            onBlur={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
            onInput={ev => props[_command](Commands[_change_calculator_input], ev[_currentTarget][_value])}
        />
        <div 
            class={[
                CSS.basic_text_output, 
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
        <div class={CSS.basic_buttons}>
            <Button onClick={() => addChar('%')}>%</Button>
            <Button onClick={() => addChar('√')}>√</Button>
            <Button onClick={() => clear()} classList={addClassListModule(CSS.remove_symbol)}>C</Button>
            <Button onClick={() => backspace()} classList={addClassListModule(CSS.remove_symbol)}><Icon code={0xE199} /></Button>

            <Button onClick={() => addChar('7')} variant={ButtonVariant[_filledTonal]}>7</Button>
            <Button onClick={() => addChar('8')} variant={ButtonVariant[_filledTonal]}>8</Button>
            <Button onClick={() => addChar('9')} variant={ButtonVariant[_filledTonal]}>9</Button>
            <Button onClick={() => addChar('÷')} ><Icon code={0xEE8F}/></Button>

            <Button onClick={() => addChar('4')} variant={ButtonVariant[_filledTonal]}>4</Button>
            <Button onClick={() => addChar('5')} variant={ButtonVariant[_filledTonal]}>5</Button>
            <Button onClick={() => addChar('6')} variant={ButtonVariant[_filledTonal]}>6</Button>
            <Button onClick={() => addChar('×')}><Icon code={0xE5E9}/></Button>

            <Button onClick={() => addChar('1')} variant={ButtonVariant[_filledTonal]}>1</Button>
            <Button onClick={() => addChar('2')} variant={ButtonVariant[_filledTonal]}>2</Button>
            <Button onClick={() => addChar('3')} variant={ButtonVariant[_filledTonal]}>3</Button>
            <Button onClick={() => addChar('-')}><Icon code={0xEF5D} /></Button>

            <Button onClick={() => addChar(props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]? ',' : '.')} ><Show when={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]} fallback=".">,</Show></Button>
            <Button onClick={() => addChar('0')} variant={ButtonVariant[_filledTonal]}>0</Button>
            <Button onClick={() => equal()} variant={ButtonVariant[_filled]}>=</Button>
            <Button onClick={() => addChar('+')}><Icon code={0xE007}/></Button>
        </div>
    </>)
}

const ScientificCalculator: VoidComponent<ScientificCalculatorProps> = (props) => {
    const [button_angleMode_ref, set_button_angleMode_ref] = createSignal<HTMLButtonElement | null>(null)
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
        props[_command](Commands[_change_calculator_input], value)
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
        props[_command](Commands[_change_calculator_input], value)
    }

    function clear(): void {
        caretPos = 0
        input_ref[_value] = ''
        input_ref[_setSelectionRange](caretPos, caretPos)
        input_ref[_focus]()
        props[_command](Commands[_change_calculator_input], '')
    }

    function equal(): void {
        if (!props[_output]) return;

        caretPos = props[_output][_toString]()[_length]
        input_ref[_value] = props[_output][_toString]()
        input_ref[_setSelectionRange](caretPos, caretPos)
        input_ref[_focus]()
        props[_command](Commands[_change_calculator_input], numberToRealDigit(props[_output]))
    }

    createEffect(() => {
        input_ref[_value] = props[_input]
        input_ref[_focus]()
    })

    return (<>
        <input 
            ref={r => input_ref = r}
            inputMode={_none}
            class={CSS.scientific_text_input}
            type={_text}
            onKeyDown={ev => {
                if (!(ev[_code] == "Equal" && !ev[_shiftKey])) return
                equal()
                preventDefault(ev)
            }}
            onFocus={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
            onBlur={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
            onInput={ev => props[_command](Commands[_change_calculator_input], ev[_currentTarget][_value])}
        />
        <div 
            class={[
                CSS.scientific_text_output, 
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
                onClick={ev => openPopover({
                    event: ev, 
                    popover: menu_function_ref, 
                    anchor: ev[_currentTarget], 
                    position: PopoverPosition.CENTER_BOTTOM_TO_RIGHT
                })} 
                focus={is_menu_function_open()}><Icon code={0xEA95}/>Function</Button>
            <Menu classList={addClassListModule(CSS.scientific_function_menu)} ref={r => menu_function_ref = r} onToggle={(v) => setIs_menu_function_open(v)}>
                <div class={CSS.trigonometry_options}>
                    <MenuItem checked={isInverse()} onClick={() => setIsInverse(v => !v)}>Invers</MenuItem>
                    <MenuItem checked={isHyperbolic()} onClick={() => setIsHyperbolic(v => !v)}>Hyperbolic</MenuItem>
                </div>
                <div class={CSS.grid_3}>
                    <For each={getTrigonometry()}>{t => <MenuItem onClick={() => addChar(t + '(')}>{`${t}(x)`}</MenuItem>}</For>
                </div>
                <MenuDivider />
                <div class={CSS.grid_3}>
                    <MenuItem onClick={() => addChar(_abs + '(')}>abs(x)</MenuItem>
                    <MenuItem onClick={() => addChar(_log + '(')}>log(x)</MenuItem>
                    <MenuItem onClick={() => addChar(_ln + '(')}>ln(x)</MenuItem>
                    <MenuItem onClick={() => addChar(_ceil + '(')}>ceil(x)</MenuItem>
                    <MenuItem onClick={() => addChar(_round + '(')}>round(x)</MenuItem>
                    <MenuItem onClick={() => addChar(_floor + '(')}>floor(x)</MenuItem>
                </div>
            </Menu>

            <Tooltip anchor={button_angleMode_ref()} text="Angle mode"/>
            <Button ref={r => set_button_angleMode_ref(r)} style={{width: '68px'}} onClick={() => props[_command](Commands[_toggle_settings_scientific_angle])}>{props[_settings][_scientific][_angle]}</Button>
        </ActionButtons>
        <div class={CSS.scientific_buttons}>
            <Button onClick={() => addChar('mod')}>mod</Button>
            <Button onClick={() => addChar('(')}>{'('}</Button>
            <Button onClick={() => addChar(')')}>{')'}</Button>
            <Button onClick={() => clear()} classList={addClassListModule(CSS.remove_symbol)}>C</Button>
            <Button onClick={() => backspace()} classList={addClassListModule(CSS.remove_symbol)}><Icon code={0xE199} /></Button>

            <Button onClick={() => addChar('%')}>%</Button>
            <Button onClick={() => addChar('10^')}>10^</Button>
            <Button onClick={() => addChar('^2')}>^2</Button>
            <Button onClick={() => addChar('e^')}>e^</Button>
            <Button onClick={() => addChar('^')}>^</Button>

            <Button onClick={() => addChar('!')}>!</Button>
            <Button onClick={() => addChar('7')} variant={ButtonVariant[_filledTonal]}>7</Button>
            <Button onClick={() => addChar('8')} variant={ButtonVariant[_filledTonal]}>8</Button>
            <Button onClick={() => addChar('9')} variant={ButtonVariant[_filledTonal]}>9</Button>
            <Button onClick={() => addChar('÷')} ><Icon code={0xEE8F}/></Button>

            <Button onClick={() => addChar('e')}>e</Button>
            <Button onClick={() => addChar('4')} variant={ButtonVariant[_filledTonal]}>4</Button>
            <Button onClick={() => addChar('5')} variant={ButtonVariant[_filledTonal]}>5</Button>
            <Button onClick={() => addChar('6')} variant={ButtonVariant[_filledTonal]}>6</Button>
            <Button onClick={() => addChar('×')}><Icon code={0xE5E9}/></Button>

            <Button onClick={() => addChar('π')}>π</Button>
            <Button onClick={() => addChar('1')} variant={ButtonVariant[_filledTonal]}>1</Button>
            <Button onClick={() => addChar('2')} variant={ButtonVariant[_filledTonal]}>2</Button>
            <Button onClick={() => addChar('3')} variant={ButtonVariant[_filledTonal]}>3</Button>
            <Button onClick={() => addChar('-')}><Icon code={0xEF5D} /></Button>

            <Button onClick={() => addChar('√')}>√</Button>
            <Button onClick={() => addChar(props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]? ',' : '.')} ><Show when={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]} fallback=".">,</Show></Button>
            <Button onClick={() => addChar('0')} variant={ButtonVariant[_filledTonal]}>0</Button>
            <Button onClick={() => equal()} variant={ButtonVariant[_filled]}>=</Button>
            <Button onClick={() => addChar('+')}><Icon code={0xE007}/></Button>
        </div>
    </>)
}

const ConverterCalculator: VoidComponent<ConverterCalculatorProps> = (props) => {
    const [button_converterType_ref, set_button_converterType_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_inputUnit_ref, set_button_inputUnit_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_swapUnit_ref, set_button_swapUnit_ref] = createSignal<HTMLButtonElement | null>(null)
    const [button_outputUnit_ref, set_button_outputUnit_ref] = createSignal<HTMLButtonElement | null>(null)
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
        if (type == ConverterType[_length]) return [...UNIT_LENGTH]
        if (type == ConverterType[_area]) return [...UNIT_AREA]
        if (type == ConverterType[_volume]) return [...UNIT_VOLUME]
        if (type == ConverterType[_temperature]) return [...UNIT_TEMPERATURE]
        if (type == ConverterType[_time]) return [...UNIT_TIME]
        if (type == ConverterType[_weight]) return [...UNIT_WEIGHT]
        if (type == ConverterType[_frequency]) return [...UNIT_FREQUENCY]
        if (type == ConverterType[_pressure]) return [...UNIT_PRESSURE]
        if (type == ConverterType[_angle]) return [...UNIT_ANGLE]
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
        props[_command](Commands[_change_calculator_input], value)
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
        props[_command](Commands[_change_calculator_input], value)
    }

    function clear(): void {
        caretPos = 0
        input_ref[_value] = ''
        input_ref[_setSelectionRange](caretPos, caretPos)
        input_ref[_focus]()
        props[_command](Commands[_change_calculator_input], '')
    }

    function equal(): void {
        if (!props[_output]) return;

        caretPos = props[_output][_toString]()[_length]
        input_ref[_value] = props[_output][_toString]()
        input_ref[_setSelectionRange](caretPos, caretPos)
        input_ref[_focus]()
        props[_command](Commands[_change_calculator_input], numberToRealDigit(props[_output]))
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
        props[_command](Commands[_change_calculator_input], value)
    }

    createEffect(() => {
        input_ref[_value] = props[_input]
        input_ref[_focus]()
    })

    return (<>
        <input 
            ref={r => input_ref = r}
            inputMode={_none}
            class={CSS.converter_text_input}
            type={_text}
            onKeyDown={ev => {
                if (!(ev[_code] == "Equal" && !ev[_shiftKey])) return
                equal()
                preventDefault(ev)
            }}
            onFocus={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
            onBlur={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
            onInput={ev => props[_command](Commands[_change_calculator_input], ev[_currentTarget][_value])}
        />
        <div 
            class={[
                CSS.converter_text_output, 
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
        >
            <Tooltip anchor={button_converterType_ref()} text="Select converter type"/>
            <Button 
                focus={is_menu_converterType_open()}
                onClick={ev => openPopover({
                    event: ev, 
                    popover: menu_converterType_ref, 
                    anchor: ev[_currentTarget], 
                })}
                ref={r => set_button_converterType_ref(r)} 
                variant={ButtonVariant[_filledTonal]}>
                <Icon code={getConverterIcon()}/>{getConverterName()}
            </Button>

            <Menu ref={r => menu_converterType_ref = r} onToggle={v => setIs_menu_converterType_open(v)}><For each={CONVERTER_TYPES}>{c => 
                <MenuItem 
                    selected={c[_type] == props[_settings][_converter][_type]}
                    onClick={() => {
                        props[_command](Commands[_change_settings_converter_type], c[_type])
                        closePopover(menu_converterType_ref)
                    }}
                    leading={<Icon code={c[_icon]}/>}>
                    {c[_text]}
                </MenuItem>
            }</For></Menu>

            <div class={CSS.converter_units}>
                <Tooltip anchor={button_inputUnit_ref()} text="Select input unit"/>
                <Button 
                    focus={is_menu_inputUnit_open()}
                    onClick={ev => openPopover({
                        event: ev, 
                        popover: menu_inputUnit_ref, 
                        anchor: ev[_currentTarget],
                    })} 
                    style={{color: 'rgb(var(--color-accent))'}}
                    ref={r => set_button_inputUnit_ref(r)}>{props[_settings][_converter][_inputUnit][_name] + ` (${props[_settings][_converter][_inputUnit][_symbol]})`}</Button>

                <Menu ref={r => menu_inputUnit_ref = r} onToggle={v => setIs_menu_inputUnit_open(v)}><For each={getUnits()}>{u => 
                    <MenuItem 
                        onClick={() => {
                            props[_command](Commands[_change_settings_converter_inputUnit], u)
                            closePopover(menu_inputUnit_ref)
                        }}
                        selected={u[_equals](props[_settings][_converter][_inputUnit])}>
                        {u[_name] + ` (${u[_symbol]})`}
                    </MenuItem>
                }</For></Menu>

                <Tooltip anchor={button_swapUnit_ref()} text="Swap unit"/>
                <Button 
                    onClick={() => props[_command](Commands[_change_settings_converter_swapUnit])}
                    ref={r => set_button_swapUnit_ref(r)} 
                    iconOnly>
                    <Icon code={0xE115}/>
                </Button>

                <Tooltip anchor={button_outputUnit_ref()} text="Select output unit"/>
                <Button
                    focus={is_menu_outputUnit_open()}
                    onClick={ev => openPopover({
                        event: ev, 
                        popover: menu_outputUnit_ref, 
                        anchor: ev[_currentTarget],
                    })} 
                    style={{color: 'rgb(var(--color-accent))'}}
                    ref={r => set_button_outputUnit_ref(r)}>{props[_settings][_converter][_outputUnit][_name] + ` (${props[_settings][_converter][_outputUnit][_symbol]})`}</Button>
            </div>

            <Menu ref={r => menu_outputUnit_ref = r} onToggle={v => setIs_menu_outputUnit_open(v)}><For each={getUnits()}>{u => 
                <MenuItem 
                    onClick={() => {
                        props[_command](Commands[_change_settings_converter_outputUnit], u)
                        closePopover(menu_outputUnit_ref)
                    }}
                    selected={u[_equals](props[_settings][_converter][_outputUnit])}>
                    {u[_name] + ` (${u[_symbol]})`}
                </MenuItem>
            }</For></Menu>
        </ActionButtons>
        <div class={CSS.converter_buttons}>
            <Button onClick={() => plusMinus()}>±</Button>
            <Button onClick={() => clear()} classList={addClassListModule(CSS.remove_symbol)}>C</Button>
            <Button onClick={() => backspace()} classList={addClassListModule(CSS.remove_symbol)}><Icon code={0xE199} /></Button>

            <Button onClick={() => addChar('7')} variant={ButtonVariant[_filledTonal]}>7</Button>
            <Button onClick={() => addChar('8')} variant={ButtonVariant[_filledTonal]}>8</Button>
            <Button onClick={() => addChar('9')} variant={ButtonVariant[_filledTonal]}>9</Button>

            <Button onClick={() => addChar('4')} variant={ButtonVariant[_filledTonal]}>4</Button>
            <Button onClick={() => addChar('5')} variant={ButtonVariant[_filledTonal]}>5</Button>
            <Button onClick={() => addChar('6')} variant={ButtonVariant[_filledTonal]}>6</Button>

            <Button onClick={() => addChar('1')} variant={ButtonVariant[_filledTonal]}>1</Button>
            <Button onClick={() => addChar('2')} variant={ButtonVariant[_filledTonal]}>2</Button>
            <Button onClick={() => addChar('3')} variant={ButtonVariant[_filledTonal]}>3</Button>
            
            <Button onClick={() => addChar(props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]? ',' : '.')} ><Show when={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]} fallback=".">,</Show></Button>
            <Button onClick={() => addChar('0')} variant={ButtonVariant[_filledTonal]}>0</Button>
            <Button onClick={() => equal()} variant={ButtonVariant[_filled]}>=</Button>
        </div>
    </>)
}

const ProgrammerCalculator: VoidComponent<ProgrammerCalculatorProps> = (props) => {
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
        props[_command](Commands[_change_calculator_input], value)
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
        props[_command](Commands[_change_calculator_input], value)
    }

    function clear(): void {
        caretPos = 0
        input_ref[_value] = ''
        input_ref[_setSelectionRange](caretPos, caretPos)
        input_ref[_focus]()
        props[_command](Commands[_change_calculator_input], '')
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
        props[_command](Commands[_change_calculator_input], output)
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
            class={CSS.programmer_text_input}
            type={_text}
            onKeyDown={ev => {
                if (!(ev[_code] == "Equal" && !ev[_shiftKey])) return
                equal()
                preventDefault(ev)
            }}
            onFocus={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
            onBlur={ev => caretPos = ev[_currentTarget][_selectionStart] ?? caretPos}
            onInput={ev => props[_command](Commands[_change_calculator_input], ev[_currentTarget][_value])}
        />
        <div 
            class={[
                CSS.programmer_text_output, 
                CSSMiscellaneous.no_scrollbar
            ][_join](' ')}>
            <Button 
                selected={props[_settings][_programmer][_numberType] == NumberType[_decimal]} 
                compact 
                disableScale 
                indicatorPosition={Position[_right]} 
                onClick={() => props[_command](Commands[_change_settings_programmer_numberType], NumberType[_decimal])}
                onContextMenu={(ev) => {
                    preventDefault(ev)
                    textToCopy = getDecimalOutput()
                    openPopover({event: ev, popover: menu_copy_ref})
                }}>
                <div class={CSSMiscellaneous.no_scrollbar}>{getDecimalOutput()}</div>
                <span>DEC</span>
            </Button>
            <Button 
                selected={props[_settings][_programmer][_numberType] == NumberType[_hexadecimal]} 
                compact 
                disableScale 
                indicatorPosition={Position[_right]} 
                onClick={() => props[_command](Commands[_change_settings_programmer_numberType], NumberType[_hexadecimal])}
                onContextMenu={(ev) => {
                    preventDefault(ev)
                    if (props[_output] == null) return;

                    textToCopy = getHexadecimalOutput()
                    openPopover({event: ev, popover: menu_copy_ref})
                }}>
                <div class={CSSMiscellaneous.no_scrollbar}>{getHexadecimalOutput()}</div>
                <span>HEX</span>
            </Button>
            <Button 
                selected={props[_settings][_programmer][_numberType] == NumberType[_octal]} 
                compact 
                disableScale 
                indicatorPosition={Position[_right]}
                onClick={() => props[_command](Commands[_change_settings_programmer_numberType], NumberType[_octal])} 
                onContextMenu={(ev) => {
                    preventDefault(ev)
                    if (props[_output] == null) return;

                    textToCopy = getOctalOutput()
                    openPopover({event: ev, popover: menu_copy_ref})
                }}>
                <div class={CSSMiscellaneous.no_scrollbar}>{getOctalOutput()}</div>
                <span>OCT</span>
            </Button>
            <Button 
                selected={props[_settings][_programmer][_numberType] == NumberType[_binary]} 
                compact 
                disableScale 
                indicatorPosition={Position[_right]} 
                onClick={() => props[_command](Commands[_change_settings_programmer_numberType], NumberType[_binary])} 
                onContextMenu={(ev) => {
                    preventDefault(ev)
                    if (props[_output] == null) return;

                    textToCopy = getBinaryOutput()
                    openPopover({event: ev, popover: menu_copy_ref})
                }}>
                <div class={CSSMiscellaneous.no_scrollbar}><Show when={props[_output] != null}>{getBinaryOutput()}</Show></div>
                <span>BIN</span>
            </Button>

            <Menu ref={r => menu_copy_ref = r}>
                <MenuItem onClick={() => {
                    getNavigator()[_clipboard][_writeText](textToCopy)
                    closePopover(menu_copy_ref)
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
        <div class={CSS.programmer_buttons}>
            <div />
            <Button onClick={() => addChar('(')}>{'('}</Button>
            <Button onClick={() => addChar(')')}>{')'}</Button>
            <Button onClick={() => clear()} classList={addClassListModule(CSS.remove_symbol)}>C</Button>
            <Button onClick={() => backspace()} classList={addClassListModule(CSS.remove_symbol)}><Icon code={0xE199} /></Button>

            <Button disabled={!isHex()} onClick={() => addChar('F')} variant={ButtonVariant[_filledTonal]}>F</Button>
            <Button onClick={() => addChar('not(')}>not</Button>
            <Button onClick={() => addChar('mod')}>mod</Button>
            <Button onClick={() => addChar('lsh')}>lsh</Button>
            <Button onClick={() => addChar('rsh')}>rsh</Button>

            <Button disabled={!isHex()} onClick={() => addChar('E')} variant={ButtonVariant[_filledTonal]}>E</Button>
            <Button onClick={() => addChar('or')}>or</Button>
            <Button onClick={() => addChar('and')}>and</Button>
            <Button onClick={() => addChar('xor')}>xor</Button>
            <Button onClick={() => addChar('^')}>^</Button>

            <Button disabled={!isHex()} onClick={() => addChar('D')} variant={ButtonVariant[_filledTonal]}>D</Button>
            <Button disabled={isBin()} onClick={() => addChar('7')} variant={ButtonVariant[_filledTonal]}>7</Button>
            <Button disabled={isOct() || isBin()} onClick={() => addChar('8')} variant={ButtonVariant[_filledTonal]}>8</Button>
            <Button disabled={isOct() || isBin()} onClick={() => addChar('9')} variant={ButtonVariant[_filledTonal]}>9</Button>
            <Button onClick={() => addChar('÷')} ><Icon code={0xEE8F}/></Button>

            <Button disabled={!isHex()} onClick={() => addChar('C')} variant={ButtonVariant[_filledTonal]}>C</Button>
            <Button disabled={isBin()} onClick={() => addChar('4')} variant={ButtonVariant[_filledTonal]}>4</Button>
            <Button disabled={isBin()} onClick={() => addChar('5')} variant={ButtonVariant[_filledTonal]}>5</Button>
            <Button disabled={isBin()} onClick={() => addChar('6')} variant={ButtonVariant[_filledTonal]}>6</Button>
            <Button onClick={() => addChar('×')}><Icon code={0xE5E9}/></Button>

            <Button disabled={!isHex()} onClick={() => addChar('B')} variant={ButtonVariant[_filledTonal]}>B</Button>
            <Button onClick={() => addChar('1')} variant={ButtonVariant[_filledTonal]}>1</Button>
            <Button disabled={isBin()} onClick={() => addChar('2')} variant={ButtonVariant[_filledTonal]}>2</Button>
            <Button disabled={isBin()} onClick={() => addChar('3')} variant={ButtonVariant[_filledTonal]}>3</Button>
            <Button onClick={() => addChar('-')}><Icon code={0xEF5D} /></Button>

            <Button disabled={!isHex()} onClick={() => addChar('A')} variant={ButtonVariant[_filledTonal]}>A</Button>
            <Button disabled={!isDec()} onClick={() => addChar(props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]? ',' : '.')} ><Show when={props[_settings][_numberFormat][_decimal] == DecimalNumberFormat[_comma]} fallback=".">,</Show></Button>
            <Button onClick={() => addChar('0')} variant={ButtonVariant[_filledTonal]}>0</Button>
            <Button onClick={() => equal()} variant={ButtonVariant[_filled]}>=</Button>
            <Button onClick={() => addChar('+')}><Icon code={0xE007}/></Button>
        </div>
    </>)
}

const DateCalculator: VoidComponent<DateCalculatorProps> = (props) => {
    let numberTextField_year_ref: HTMLInputElement
    let numberTextField_month_ref: HTMLInputElement
    let numberTextField_day_ref: HTMLInputElement
    let datePicker_from_ref: HTMLDialogElement
    let datePicker_to_ref: HTMLDialogElement

    onMount(() => {
        changeTextFieldValue(numberTextField_year_ref, props[_input][_year] + '')
        changeTextFieldValue(numberTextField_month_ref, props[_input][_month] + '')
        changeTextFieldValue(numberTextField_day_ref, props[_input][_day] + '')
    })

    return (<div class={CSS.date_calculator}>
        <Dropdown 
            labelText="Operation" 
            selectedValues={[props[_settings][_date][_operation]]} 
            onValueChanged={(values) => props[_command](Commands[_change_settings_date_operation], values[0])}
            items={[
                [DateOperation[_add], 'Add'],
                [DateOperation[_subtract], 'Subtract'],
                [DateOperation[_difference], 'Difference'],
            ]}
        />
        <div>
            <p>From</p>
            <Button 
                variant={ButtonVariant[_filledTonal]}
                onClick={(ev) => openPopover({
                    event: ev, 
                    popover: datePicker_from_ref, 
                    anchor: ev[_currentTarget],
                    position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                })}>
                <Icon code={0xE2CC}/>
                {getDateString_YMD(props[_input][_from])}
            </Button>
        </div>
        <div class={CSS.date_inputs} data-hide={toggleAttribute(props[_settings][_date][_operation] == DateOperation[_difference])}>
            <NumberTextField 
                ref={r => numberTextField_year_ref = r} 
                min={0} 
                labelText="Year" 
                onFinalValueChanged={(v) => props[_command](Commands[_change_calculator_input], {...props[_input], year: v})}
            />
            <NumberTextField 
                ref={r => numberTextField_month_ref = r} 
                min={0} 
                labelText="Month" 
                onFinalValueChanged={(v) => props[_command](Commands[_change_calculator_input], {...props[_input], month: v})}
            />
            <NumberTextField 
                ref={r => numberTextField_day_ref = r} 
                min={0} 
                labelText="Day" 
                onFinalValueChanged={(v) => props[_command](Commands[_change_calculator_input], {...props[_input], day: v})}
            />
        </div>
        <div data-hide={toggleAttribute(props[_settings][_date][_operation] != DateOperation[_difference])}>
            <p>To</p>
            <Button 
                variant={ButtonVariant[_filledTonal]}
                onClick={(ev) => openPopover({
                    event: ev, 
                    popover: datePicker_to_ref, 
                    anchor: ev[_currentTarget], 
                    position: PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
                })}>
                <Icon code={0xE2CC}/>
                {getDateString_YMD(props[_input][_to])}
            </Button>
        </div>
        <div>
            <p><Show when={toggleAttribute(props[_settings][_date][_operation] != DateOperation[_difference])} fallback="Result">Difference</Show></p>
            <h2>{props[_output]}</h2>
        </div>
        <DatePicker 
            ref={r => datePicker_from_ref = r} 
            initialDate={props[_input][_from]} 
            firstDate={new Date(getDate_Y() - 1000, 0, 1)}
            lastDate={new Date(getDate_Y() + 1000, 11, 31)}
            onSelectDate={(value) => props[_command](Commands[_change_calculator_input], {...props[_input], from: value})}
        />
        <DatePicker 
            ref={r => datePicker_to_ref = r} 
            initialDate={props[_input][_to]}
            firstDate={new Date(getDate_Y() - 1000, 0, 1)}
            lastDate={new Date(getDate_Y() + 1000, 11, 31)} 
            onSelectDate={(value) => props[_command](Commands[_change_calculator_input], {...props[_input], to: value})}
        />
    </div>)
}

const _: VoidComponent<Props> = (props) => {
    return (<main class={CSS.main}>
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