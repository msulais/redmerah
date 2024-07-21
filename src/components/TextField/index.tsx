import { type JSX, type ParentComponent, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps, type VoidComponent, children, createEffect, Show } from 'solid-js'

import type { ComponentEvent } from '@/types/event'
import { toggleAttribute } from '@/utils/attributes'
import { clearTimeDelayed, clearTimeInterval, setTimeDelayed, setTimeInterval } from '@/utils/timeout'
import { addEventListener, preventDefault, removeEventListener, stopImmediatePropagation, stopPropagation } from '@/utils/event'
import { openPopover } from '@/utils/popover'
import { PopoverPosition } from '@/enums/position'
import { _CENTER_BOTTOM, _CENTER_CENTER_LEFT, _autoHideLabel, _autoShowClearBtn, _autocomplete, _button, _changeValueTooltip, _checkValidity, _children, _classList, _clearTooltip, _currentTarget, _decreaseTooltip, _disabled, _dispatchEvent, _focus, _id, _increaseTooltip, _input, _isIntOnly, _isNaN, _labelElement, _labelText, _leading, _length, _max, _maxLine, _messageText, _min, _minLine, _off, _onBlur, _onFinalValueChanged, _onFocus, _onInput, _onValueChanged, _placeholder, _px, _readOnly, _ref, _resize, _rows, _scrollHeight, _step, _text, _trailing, _type, _value, _valuechange } from '@/data/string'
import { mathMax, mathMin, numberParse } from '@/utils/math'

import Icon from '@/components/Icon'
import Tooltip from '@/components/Tooltip'
import Button from '@/components/Button'
import Menu from '@/components/Menu'
import './index.scss'

const HEIGHT_TEXT_INPUT_PER_LINE = 18

export type TextFieldProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'ref' | 'onInput' | 'onFocus' | 'onBlur' | 'children'> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    labelText?: JSX.Element
    messageText?: JSX.Element
    focus?: boolean
    autoShowClearBtn?: boolean
    autoHideLabel?: boolean
    clearTooltip?: string
    type?: 'text' | 'password' | 'tel' | 'email' | 'url'
    ref?: (el: HTMLInputElement) => void
    labelElement?: JSX.LabelHTMLAttributes<HTMLLabelElement>
    onInput?: (ev: ComponentEvent<InputEvent, HTMLInputElement, HTMLInputElement>) => void
    onFocus?: (ev: ComponentEvent<FocusEvent, HTMLInputElement, HTMLInputElement>) => void
    onBlur?: (ev: ComponentEvent<FocusEvent, HTMLInputElement, HTMLInputElement>) => void
}

export type TextAreaFieldProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, 'ref' | 'onInput' | 'onFocus' | 'onBlur' | 'children' | 'rows' | 'columns'> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    labelText?: JSX.Element
    messageText?: JSX.Element
    focus?: boolean
    minLine?: number
    maxLine?: number
    resize?: boolean
    autoShowClearBtn?: boolean
    autoHideLabel?: boolean
    clearTooltip?: string
    ref?: (el: HTMLTextAreaElement) => void
    labelElement?: JSX.LabelHTMLAttributes<HTMLLabelElement>
    onInput?: (ev: ComponentEvent<InputEvent, HTMLTextAreaElement, HTMLTextAreaElement>) => void
    onFocus?: (ev: ComponentEvent<FocusEvent, HTMLTextAreaElement, HTMLTextAreaElement>) => void
    onBlur?: (ev: ComponentEvent<FocusEvent, HTMLTextAreaElement, HTMLTextAreaElement>) => void
}

type NumberTextFieldProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'ref' | 'onInput' | 'onFocus' | 'onBlur' | 'children'> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    labelText?: JSX.Element
    messageText?: JSX.Element
    ref?: (el: HTMLInputElement) => void
    focus?: boolean
    type?: undefined
    step?: number
    min?: number
    max?: number
    isIntOnly?: boolean
    decreaseTooltip?: string
    increaseTooltip?: string
    changeValueTooltip?: string
    autoHideLabel?: boolean
    labelElement?: JSX.LabelHTMLAttributes<HTMLLabelElement>
    onValueChanged?: (value: number ) => unknown // value change listener
    onFinalValueChanged?: (value: number) => unknown // final value change listener
    onInput?: (ev: ComponentEvent<InputEvent, HTMLInputElement, HTMLInputElement>) => void
    onFocus?: (ev: ComponentEvent<FocusEvent, HTMLInputElement, HTMLInputElement>) => void
    onBlur?: (ev: ComponentEvent<FocusEvent, HTMLInputElement, HTMLInputElement>) => void
}

/**
 * I recommend using this function to change <TextField> value
 * when not in focus mode to trigger value change.
 *
 * @param el
 * @param value
 */
export function changeTextFieldValue(el: HTMLInputElement, value: string): void {
    el[_value] = value
    const event = new Event(_input, { bubbles: true });
    el[_dispatchEvent](event)
}

export function changeTextAreaFieldValue(el: HTMLTextAreaElement, value: string): void {
    el[_value] = value
    const event = new Event(_input, { bubbles: true });
    el[_dispatchEvent](event)
}

export const TextFieldTrailingButton: ParentComponent<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = ($props) => {
    const [props, other] = splitProps($props, [_children, _classList])
    return (<Button {...other} compact classList={{'textfield-btn': true, ...props[_classList]}}>
        { props[_children] }
    </Button>)
}

export const TextAreaField: VoidComponent<TextAreaFieldProps> = ($props) => {
    const $$props = mergeProps({autoHideLabel: true, id: createUniqueId()}, $props)
    const [props, other] = splitProps($$props, [
        _leading, _onInput, _labelText, _focus,
        _autocomplete, _id, _messageText, _trailing,
        _labelElement, _disabled, _readOnly, _resize,
        _onFocus, _onBlur, _placeholder, _autoHideLabel,
        _value, _ref, _autoShowClearBtn, _clearTooltip, 
        _minLine, _maxLine
    ])
    const [isFocus, setIsFocus] = createSignal<boolean>(false)
    const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
    const [clearBtnRef, setClearBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [value, setValue] = createSignal<string>('')
    const [height, setHeight] = createSignal<number>(HEIGHT_TEXT_INPUT_PER_LINE)
    const trailingComponents = children(() => props[_trailing])
    let textareafieldRef!: HTMLTextAreaElement

    createEffect(() => {
        setValue(props[_value] as string ?? '')
        setHeight(h => props[_minLine]? (HEIGHT_TEXT_INPUT_PER_LINE * props[_minLine]) : h)
    })

    return (<label
        class='textareafield'
        for={props[_id]}
        {...props[_labelElement]}
    >
        <div
            data-focus={toggleAttribute(props[_focus] ?? isFocus())}
            data-invalid={toggleAttribute(isInvalid())}
            data-disabled={toggleAttribute(props[_disabled])}
            data-trailing={toggleAttribute(trailingComponents() || (props[_clearTooltip] ?? 'Clear'))}
            data-readonly={toggleAttribute(props[_readOnly])}>
            <div class='textareafield-label-text'>{props[_autoHideLabel] && value()[_length] == 0 && !props[_placeholder]? '' : props[_labelText]}</div>
            <div class='textareafield-leading'>{props[_leading]}</div>
            <textarea
                id={props[_id]}
                ref={(r) => {
                    textareafieldRef = r
                    if (props[_ref]) props[_ref](r)
                }}
                onInput={(ev) => {
                    setValue(ev[_currentTarget][_value])
                    setIsInvalid(!ev[_currentTarget][_checkValidity]())
                    if (props[_onInput]) props[_onInput](ev)
                    setHeight(HEIGHT_TEXT_INPUT_PER_LINE)
                    setHeight(mathMax(ev[_currentTarget][_scrollHeight], HEIGHT_TEXT_INPUT_PER_LINE))
                }}
                onFocus={(ev) => {
                    setValue(ev[_currentTarget][_value])
                    setIsInvalid(!ev[_currentTarget][_checkValidity]())
                    setIsFocus(true)
                    if (props[_onFocus]) props[_onFocus](ev)
                }}
                onBlur={(ev) => {
                    setValue(ev[_currentTarget][_value])
                    setIsFocus(false)
                    if (props[_onBlur]) props[_onBlur](ev)
                }}
                rows={props[_minLine] ?? 1}
                data-resize={toggleAttribute(props[_resize])}
                disabled={props[_disabled]}
                autocomplete={props[_autocomplete] ?? _off}
                readOnly={props[_readOnly]}
                value={props[_value]}
                style={{
                    "height": height() + _px,
                    "min-height": props[_minLine]? ((HEIGHT_TEXT_INPUT_PER_LINE * props[_minLine]) + _px) : undefined,
                    "max-height": props[_maxLine] && props[_maxLine] >= (props[_minLine] ?? 1)? ((HEIGHT_TEXT_INPUT_PER_LINE * props[_maxLine]) + _px) : undefined
                }}
                placeholder={props[_placeholder] ?? (props[_autoHideLabel] && props[_labelText]? `${props[_labelText]}` : undefined)}
                {...other}></textarea>
            <div class='textareafield-trailing'>
                {trailingComponents()}
                <Show when={props[_autoShowClearBtn] && value()[_length] > 0}>
                    <Tooltip text={props[_clearTooltip] ?? 'Clear'} anchor={clearBtnRef()}/>
                    <TextFieldTrailingButton ref={r => setClearBtnRef(r)} type={_button} onClick={(ev) => {
                        textareafieldRef[_value] = ''
                        setValue('')
                        preventDefault(ev)
                    }}><Icon code={0xE5E9}/></TextFieldTrailingButton>
                </Show>
            </div>
        </div>
        <div class='textareafield-message-text'>{props[_messageText]}</div>
    </label>)
}

export const NumberTextField: ParentComponent<NumberTextFieldProps> = ($props) => {
    const $$props = mergeProps({
        increaseTooltip: 'Increase',
        decreaseTooltip: 'Decrease',
        changeValueTooltip: 'Change value', 
    }, $props)
    const [props, other] = splitProps($$props, [
        _max, _min, _type, _trailing, _onValueChanged, _isIntOnly,
        _step, _onBlur, _value, _ref, _focus, _onFinalValueChanged,
        _decreaseTooltip, _increaseTooltip, _changeValueTooltip
    ])

    const [value, setValue] = createSignal<number>(0)
    const [isActionMenuOpen, setIsActionMenuOpen] = createSignal<boolean>(false)
    const [changeValueBtnRef, setChangeValueBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [increaseBtnRef, setIncreaseBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [decreaseBtnRef, setDecreaseBtnRef] = createSignal<HTMLButtonElement | null>(null)
    let timeoutId: number | null = null
    let timeoutId2: number | null = null
    let intervalId: number | null = null
    let inputRef!: HTMLInputElement
    let actionMenuRef: HTMLElement

    function changeLength(operator: '+' | '-', continuous: boolean = false): void {
        const changeValue = () => {
            let n = value() + (operator == '+'
                ? (props[_step] ?? 1) 
                : -(props[_step] ?? 1)
            )

            if (props[_min] != undefined && n < props[_min]) n = props[_min]
            if (props[_max] != undefined && n > props[_max]) n = props[_max]
            
            setValue(n)
            if (props[_onValueChanged]) props[_onValueChanged](n)
            changeTextFieldValue(inputRef, `${n}`)

            if (timeoutId2 != null) {
                clearTimeDelayed(timeoutId2)
                timeoutId2 = null
            }

            timeoutId2 = setTimeDelayed(() => {
                if (props[_onFinalValueChanged])
                    props[_onFinalValueChanged](value())
            }, 100)
        }

        stopContinuousChangeLength()
        if (continuous){
            timeoutId = (setTimeDelayed(() => {
                intervalId = setTimeInterval(() => changeValue(), 30)
                timeoutId = null
            }, 300))
        }

        if (continuous) return;
        changeValue()
    }

    function stopContinuousChangeLength(): void {
        if (intervalId != null) {
            clearTimeInterval(intervalId)
            intervalId = null
        }
        if (timeoutId != null) {
            clearTimeDelayed(timeoutId)
            timeoutId = null
        }
    }

    onMount(() => {
        let v = numberParse(`${props[_value]}`, props[_isIntOnly])

        if (Number[_isNaN](v)) v = value()
        if (props[_min] != undefined && v < props[_min]) v = props[_min]
        if (props[_max] != undefined && v > props[_max]) v = props[_max]

        setValue(v)
    })

    return (<>
        <TextField
            focus={props[_focus] ?? (isActionMenuOpen()? true : undefined)}
            ref={(r) => {
                if (props[_ref]) props[_ref](r)
                inputRef = r
            }}
            value={(() => {
                let v = numberParse(`${props[_value]}`, props[_isIntOnly])

                if (Number[_isNaN](v)) v = 0
                if (props[_min] != undefined && v < props[_min]) v = props[_min]
                if (props[_max] != undefined && v > props[_max]) v = props[_max]

                return v
            })()}
            onBlur={(ev) => {
                let v = numberParse(ev[_currentTarget][_value], props[_isIntOnly])

                if (Number[_isNaN](v)) v = value()
                if (props[_min] != undefined && v < props[_min]) v = props[_min]
                if (props[_max] != undefined && v > props[_max]) v = props[_max]

                const va = value()
                const isChanged = va != v
                changeTextFieldValue(ev[_currentTarget], `${v}`)
                setValue(v)

                if (isChanged && props[_onFinalValueChanged]) props[_onFinalValueChanged](v)
                if (isChanged && props[_onValueChanged]) props[_onValueChanged](v)
                if (props[_onBlur]) props[_onBlur](ev)
            }}
            trailing={<>
                <Tooltip text={props[_changeValueTooltip]} anchor={changeValueBtnRef()}/>
                <TextFieldTrailingButton ref={r => setChangeValueBtnRef(r)} onClick={(ev) => openPopover({
                    event: ev,
                    anchor: ev[_currentTarget],
                    popover: actionMenuRef,
                    position: PopoverPosition[_CENTER_CENTER_LEFT]
                })}><Icon code={0xE406}/></TextFieldTrailingButton>
                { props[_trailing] }
            </>}
            {...other}
        />
        <Menu ref={r => actionMenuRef = r} classList={{'number-textfield-menu': true}} onToggle={(v) => setIsActionMenuOpen(v)}>
            <Tooltip text={props[_increaseTooltip]} anchor={increaseBtnRef()}/>
            <Button
                iconOnly
                ref={r => setIncreaseBtnRef(r)}
                onMouseUp={() => stopContinuousChangeLength()}
                onContextMenu={(ev) => preventDefault(ev)}
                onMouseDown={() => changeLength('+', true)}
                onTouchEnd={() => stopContinuousChangeLength()}
                onTouchStart={() => changeLength('+', true)}
                onClick={() => changeLength('+')}>
                <Icon code={0xE404} />
            </Button>
            <Tooltip text={props[_decreaseTooltip]} anchor={decreaseBtnRef()}/>
            <Button
                iconOnly
                ref={r => setDecreaseBtnRef(r)}
                onMouseUp={() => stopContinuousChangeLength()}
                onContextMenu={(ev) => preventDefault(ev)}
                onMouseDown={() => changeLength('-', true)}
                onTouchEnd={() => stopContinuousChangeLength()}
                onTouchStart={() => changeLength('-', true)}
                onClick={() => changeLength('-')}>
                <Icon code={0xE3FC} />
            </Button>
        </Menu>
    </>)
}

const TextField: ParentComponent<TextFieldProps> = ($props) => {
    const $$props = mergeProps({type: _text, autoHideLabel: true, id: createUniqueId()}, $props)
    const [props, other] = splitProps($$props, [
        _leading, _onInput, _labelText, _focus,
        _autocomplete, _id, _messageText, _trailing,
        _type, _labelElement, _disabled, _readOnly,
        _onFocus, _onBlur, _placeholder, _autoHideLabel,
        _value, _ref, _autoShowClearBtn, _clearTooltip
    ])
    const [isFocus, setIsFocus] = createSignal<boolean>(false)
    const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
    const [clearBtnRef, setClearBtnRef] = createSignal<HTMLButtonElement | null>(null)
    const [value, setValue] = createSignal<string>('')
    const trailingComponents = children(() => props[_trailing])
    let textfieldRef!: HTMLInputElement

    onMount(() => setValue(props[_value] as string ?? ''))
    createEffect(() => setValue(props[_value] as string ?? ''))

    return (<label
        class='textfield'
        for={props[_id]}
        {...props[_labelElement]}
    >
        <div
            data-focus={toggleAttribute(props[_focus] ?? isFocus())}
            data-invalid={toggleAttribute(isInvalid())}
            data-disabled={toggleAttribute(props[_disabled])}
            data-trailing={toggleAttribute(trailingComponents() || (props[_clearTooltip] ?? 'Clear'))}
            data-readonly={toggleAttribute(props[_readOnly])}>
            <div class='textfield-label-text'>{props[_autoHideLabel] && value()[_length] == 0 && !props[_placeholder]? '' : props[_labelText]}</div>
            <div class='textfield-leading'>{props[_leading]}</div>
            <input
                id={props[_id]}
                ref={(r) => {
                    textfieldRef = r
                    if (props[_ref]) props[_ref](r)
                }}
                onInput={(ev) => {
                    setValue(ev[_currentTarget][_value])
                    setIsInvalid(!ev[_currentTarget][_checkValidity]())
                    if (props[_onInput]) props[_onInput](ev)
                }}
                onFocus={(ev) => {
                    setValue(ev[_currentTarget][_value])
                    setIsInvalid(!ev[_currentTarget][_checkValidity]())
                    setIsFocus(true)
                        if (props[_onFocus]) props[_onFocus](ev)
                    }}
                onBlur={(ev) => {
                    setValue(ev[_currentTarget][_value])
                    setIsFocus(false)
                    if (props[_onBlur]) props[_onBlur](ev)
                }}
                type={props[_type]}
                disabled={props[_disabled]}
                autocomplete={props[_autocomplete] ?? _off}
                readOnly={props[_readOnly]}
                value={props[_value]}
                placeholder={props[_placeholder] ?? (props[_autoHideLabel] && props[_labelText]? `${props[_labelText]}` : undefined)}
                {...other}
            />
            <div class='textfield-trailing'>
                {trailingComponents()}
                <Show when={props[_autoShowClearBtn] && value()[_length] > 0}>
                    <Tooltip text={props[_clearTooltip] ?? 'Clear'} anchor={clearBtnRef()}/>
                    <TextFieldTrailingButton ref={r => setClearBtnRef(r)} type={_button} onClick={(ev) => {
                        changeTextFieldValue(textfieldRef, '')
                        preventDefault(ev)
                    }}><Icon code={0xE5E9}/></TextFieldTrailingButton>
                </Show>
            </div>
        </div>
        <div class='textfield-message-text'>{props[_messageText]}</div>
    </label>)
}

export default TextField