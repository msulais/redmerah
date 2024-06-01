import { type JSX, type ParentComponent, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps, type VoidComponent } from 'solid-js'

import { toggleAttribute } from '@/utils/attributes'
import { clearTimeDelayed, clearTimeInterval, setTimeDelayed, setTimeInterval } from '@/utils/timeout'
import { addEventListener, preventDefault, removeEventListener } from '@/utils/event'
import { openPopover } from '@/utils/popover'
import { PopoverPosition } from '@/enums/position'
import type { ComponentEvent } from '@/types/event'
import { _CENTER_BOTTOM, _CENTER_CENTER_LEFT, _autoHideLabel, _autocomplete, _changeValueTooltip, _checkValidity, _children, _classList, _currentTarget, _decreaseTooltip, _disabled, _focus, _id, _increaseTooltip, _isIntOnly, _isNaN, _labelElement, _labelText, _leading, _max, _messageText, _min, _onBlur, _onFinalValueChanged, _onFocus, _onInput, _onValueChanged, _placeholder, _readOnly, _ref, _step, _text, _trailing, _type, _value } from '@/data/string'
import { numberParse } from '@/utils/math'

import Icon from '@/components/Icon'
import Tooltip from '@/components/Tooltip'
import Button from '@/components/Button'
import Menu from '@/components/Menu'
import './index.scss'

type TextFieldProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    labelText?: JSX.Element
    messageText?: JSX.Element
    focus?: boolean
    autoHideLabel?: boolean
    type?: 'text' | 'password' | 'tel' | 'email' | 'url'
    ref?: (el: HTMLInputElement) => void
    labelElement?: JSX.LabelHTMLAttributes<HTMLLabelElement>
    onInput?: (ev: ComponentEvent<InputEvent, HTMLInputElement, HTMLInputElement>) => void
    onFocus?: (ev: ComponentEvent<FocusEvent, HTMLInputElement, HTMLInputElement>) => void
    onBlur?: (ev: ComponentEvent<FocusEvent, HTMLInputElement, HTMLInputElement>) => void
}

type NumberTextFieldProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'children'> & {
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

enum TextFieldEvents {
    valuechange = 'valuechange'
}

/**
 * I recommend using this function to change <TextField> value
 * when not in focus mode to trigger value change.
 *
 * @param el
 * @param value
 */
export function changeTextFieldValue(el: HTMLInputElement, value: string): void {
    el.value = value
    const event = new Event(TextFieldEvents.valuechange,{cancelable: true})
    el.dispatchEvent(event)
}

export const TextFieldTrailingButton: ParentComponent<JSX.ButtonHTMLAttributes<HTMLButtonElement>> = ($props) => {
    const [props, other] = splitProps($props, [_children, _classList])
    return (<Button {...other} compact classList={{'text-field-btn': true, ...props[_classList]}}>
        { props[_children] }
    </Button>)
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
            let n = value()
            switch (operator) {
                case '+':
                    n += (props[_step] ?? 1);
                    break;
                case '-':
                    n -= (props[_step] ?? 1);
                    break;
            }

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
                })}><Icon>&#xE406;</Icon></TextFieldTrailingButton>
                { props[_trailing] }
            </>}
            {...other}
        />
        <Menu ref={r => actionMenuRef = r} classList={{'number-text-field-menu': true}} onToggle={(v) => setIsActionMenuOpen(v)}>
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
                <Icon>&#xE404;</Icon>
            </Button>
            <Tooltip text={props[_decreaseTooltip]} position={PopoverPosition[_CENTER_BOTTOM]} anchor={decreaseBtnRef()}/>
            <Button
                iconOnly
                ref={r => setDecreaseBtnRef(r)}
                onMouseUp={() => stopContinuousChangeLength()}
                onContextMenu={(ev) => preventDefault(ev)}
                onMouseDown={() => changeLength('-', true)}
                onTouchEnd={() => stopContinuousChangeLength()}
                onTouchStart={() => changeLength('-', true)}
                onClick={() => changeLength('-')}>
                <Icon>&#xE3FC;</Icon>
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
        _value, _ref
    ])
    const [isFocus, setIsFocus] = createSignal<boolean>(false)
    const [isInvalid, setIsInvalid] = createSignal<boolean>(false)
    const [value, setValue] = createSignal<string>('')
    let textfieldRef!: HTMLInputElement

    onMount(() => {
        setValue(props[_value] as string ?? '')

        // custom listener
        addEventListener(textfieldRef, TextFieldEvents.valuechange, (ev) => {
            setValue((ev[_currentTarget] as HTMLInputElement)[_value])
        })

        onCleanup(() => {
            removeEventListener(textfieldRef, TextFieldEvents.valuechange, (ev) => {
                setValue((ev[_currentTarget] as HTMLInputElement)[_value])
            })
        })
    })

    return (<label
        class='text-field'
        for={props[_id]}
        data-focus={toggleAttribute(props[_focus] ?? isFocus())}
        data-invalid={toggleAttribute(isInvalid())}
        data-disabled={toggleAttribute(props[_disabled])}
        data-trailing={toggleAttribute(props[_trailing])}
        data-readonly={toggleAttribute(props[_readOnly])}
        {...props[_labelElement]}
    >
        <div class='text-field-message-text'>{props[_messageText]}</div>
        <div class='text-field-label-text'>{props[_autoHideLabel] && value().length == 0 && !props[_placeholder]? '' : props[_labelText]}</div>
        <div class='text-field-leading'>{props[_leading]}</div>
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
            autocomplete={props[_autocomplete] ?? 'off'}
            readOnly={props[_readOnly]}
            value={props[_value]}
            placeholder={props[_placeholder] ?? (props[_autoHideLabel] && props[_labelText]? `${props[_labelText]}` : undefined)}
            {...other}
        />
        <div class='text-field-trailing'>{props[_trailing]}</div>
    </label>)
}

export default TextField