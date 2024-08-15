import { type Component, type JSX, type ParentComponent, createMemo, createSignal, mergeProps, onCleanup, onMount, splitProps } from "solid-js"
import { createStore } from "solid-js/store"
import { Portal } from "solid-js/web"

import type { HEXColor, HSLColor, RGBColor } from "@/types/color"
import type { ComponentEvent } from "@/types/event"
import { hexToHSL, hexToRgb, hslToHex, hslToHsv, hslToRgb, hsvToHsl, rgbToHsl, testHexColorWithAlpha } from "@/utils/color"
import { getAttribute, hasAttribute, removeAttribute, setAttribute, toggleAttribute } from "@/utils/attributes"
import { getBoundingClientRect } from "@/utils/element"
import { addEventListener, preventDefault, removeEventListener } from '@/utils/event'
import { BodyAttributes, PopoverAttributes } from "@/enums/attributes"
import { closePopover, initPopover } from "@/utils/popover"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { _body, _onCancel, _children, _disabledOpacityControl, _onToggle, _onSelectColor, _initialColor, _disabledColorControl, _ref, _onClose, _HEX, _round, _toString, _padStart, _toUpperCase, _hue, _position, _opacity, _HSL, _color, _RGB, _value, _parseFloat, _toFixed, _join, _substring, _isDrag, _max, _min, _rect, _left, _top, _touchmove, _touches, _clientX, _clientY, _touchend, _noPointerEvent, _mousemove, _mouseup, _length, _parseInt, _replace, _split, _push, _isNaN, _isFinite, _trim, _open, _observe, _disconnect, _currentTarget, _px, _filledTonal, _filled, _auto, _dispatchEvent, _ariaValueText, _valuechange } from "@/data/string"
import { getDocument, getDocumentBody } from "@/data/window"
import { mathMax, mathMin, mathRound, numberParse } from "@/utils/math"

import Button, { ButtonVariant } from "@/components/Button"
import TextField from "@/components/TextField"
import './index.scss'

const COLOR_BOX_WIDTH: number = 260
const COLOR_BOX_HEIGHT: number = 200
const DEFAULT_HEX_COLOR: HEXColor = '#FF0000'

type ColorPickerProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'ref' | 'onToggle' | 'onClose' | 'onCancel'> & {
    ref?: (el: HTMLDialogElement) => void
    initialColor?: HEXColor
    disabledOpacityControl?: boolean
    disabledColorControl?: boolean
    onToggle?: (value: boolean) => unknown
    onClose?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
    onSelectColor?: (color: HEXColor) => unknown
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
}

type Picker = {
    color: {
        rect: DOMRect | null
        isDrag: boolean
        position: {
            /** `0 -> COLOR_BOX_HEIGHT` */
            top: number

            /** `0 -> COLOR_BOX_WIDTH` */
            left: number
        }
    }
    hue: {
        rect: DOMRect | null
        isDrag: boolean

        /** `0 -> slider` */
        position: number
    }
    opacity: {
        rect: DOMRect | null
        isDrag: boolean

        /** `0 -> slider` */
        position: number
    }
}

enum ColorPickerEvents {
    valuechange = 'valuechange'
}

enum ColorPickerAttributes {
    value = 'data-value'
}

/**
 * I recommend using this function to change `<ColorPicker>` value
 * when not in open state.
 *
 * @param colorPicker
 * @param value
 */
export function changeColorPickerValue(colorPicker: HTMLElement, value: HEXColor): void {
    
    // To avoid being called before the event initiated
    setTimeDelayed(() => {
        setAttribute(colorPicker, ColorPickerAttributes[_value], value)
        const event = new Event(ColorPickerEvents[_valuechange], {bubbles: true})
        colorPicker[_dispatchEvent](event)
    })
}

const ColorPicker: ParentComponent<ColorPickerProps> = ($props) => {
    const $$props = mergeProps({initialColor: DEFAULT_HEX_COLOR}, $props)
    const [props, other] = splitProps($$props, [
        _onCancel, _children, _disabledOpacityControl, _onToggle,
        _onSelectColor, _initialColor, _disabledColorControl, _ref,
        _onClose
    ])
    const [colorModel, setColorMode] = createSignal<'HEX' | 'RGB' | 'HSL'>(_HEX)
    const [hslColor, setHslColor] = createSignal<HSLColor>({h: 0, s: 1, l: 0.5})
    const [hexColor, setHexColor] = createSignal<HEXColor>(DEFAULT_HEX_COLOR)
    const [opacity, setOpacity] = createSignal<number>(100) // 0 - 100
    const [picker, setPicker] = createStore<Picker>({
        color: {
            rect: null,
            isDrag: false,
            position: {left: COLOR_BOX_WIDTH, top: 0},
        },
        hue: {
            rect: null,
            isDrag: false,
            position: 0,
        },
        opacity: {
            rect: null,
            isDrag: false,
            position: 0,
        }
    })
    const getHexColor = createMemo(() => {
        const $opacity: string = opacity() == 100 || props[_disabledOpacityControl]
            ? ''
            : mathRound(opacity() / 100 * 255)[_toString](16)[_padStart](2, '0')
        ;
        return (hslToHex(hslColor()) + $opacity)[_toUpperCase]()
    })
    const sliderSize = createMemo<number>(() => props[_disabledColorControl]? 260 : 144)
    const hexColorCanvas = createMemo(() => hslToHex({h: hslColor().h, s: 1, l: 0.5}))
    let opacityInputRef: HTMLInputElement | undefined
    let colorInputRef!: HTMLInputElement
    let colorPickerRef: HTMLDialogElement

    function updatePosition(): void {
        setPicker(_hue, _position, hslColor().h * sliderSize())
        setPicker(_opacity, _position, (1 - opacity() / 100) * sliderSize())

        if (colorModel() == _HSL){
            setPicker(_color, _position, {
                left: COLOR_BOX_WIDTH * hslColor().s,
                top: COLOR_BOX_HEIGHT * (1 - hslColor().l)
            })
            return
        }

        const hsv = hslToHsv(hslColor())
        setPicker(_color, _position, {
            left: COLOR_BOX_WIDTH * hsv.s,
            top: COLOR_BOX_HEIGHT * (1 - hsv.v)
        })
    }

    function changeColorModel(): void {
        if (colorModel() == _RGB) setColorMode(_HSL)
        else if (colorModel() == _HSL) setColorMode(_HEX)
        else if (colorModel() == _HEX) setColorMode(_RGB)

        updateInputs()
        updatePosition()
    }

    function updateInputs(onBeforeUpdate?: () => void): void {
        if (onBeforeUpdate) onBeforeUpdate()

        if (colorModel() == _RGB){
            const rgb = hslToRgb(hslColor())
            colorInputRef[_value] = `${rgb.r}, ${rgb.g}, ${rgb.b}`
        }
        else if (colorModel() == _HSL){
            colorInputRef[_value] = [
                mathRound(hslColor().h * 360),
                numberParse((hslColor().s * 100)[_toFixed](2)) + '%',
                numberParse((hslColor().l * 100)[_toFixed](2)) + '%'
            ][_join](', ')
        }
        else if (colorModel() == _HEX) {
            colorInputRef[_value] = `${getHexColor()[_substring](0, 7)}`
        }

        if (opacityInputRef) opacityInputRef[_value] = opacity() + '%'
    }

    function setPosition(clientX: number, clientY: number): void {
        if (picker[_color][_isDrag]) setPicker(_color, _position, {
            left: mathMax(mathMin(clientX - picker[_color][_rect]![_left], COLOR_BOX_WIDTH), 0),
            top: mathMax(mathMin(clientY - picker[_color][_rect]![_top], COLOR_BOX_HEIGHT), 0)
        })
        else if (picker[_hue][_isDrag]) setPicker(_hue, _position, mathMax(mathMin(props[_disabledColorControl]
            ? clientX - picker[_hue][_rect]![_left]
            : clientY - picker[_hue][_rect]![_top],
        sliderSize()), 0))
        else if (picker[_opacity][_isDrag]) setPicker(_opacity, _position, mathMax(mathMin(props[_disabledColorControl]
            ? clientX - picker[_opacity][_rect]![_left]
            : clientY - picker[_opacity][_rect]![_top],
        sliderSize()), 0))

        if (!(picker[_color][_isDrag] || picker[_hue][_isDrag] || picker[_opacity][_isDrag])) return

        updateInputs(() => {
            const hsl: HSLColor = {
                h: picker[_hue][_position] / sliderSize(),
                s: picker[_color][_position][_left] / COLOR_BOX_WIDTH,
                l: 1 - picker[_color][_position][_top] / COLOR_BOX_HEIGHT
            }

            if (colorModel() != _HSL) {
                const _hsl: HSLColor = hsvToHsl({
                    h: hsl.h,
                    s: hsl.s,
                    v: hsl.l
                })

                hsl.s = _hsl.s
                hsl.l = _hsl.l
            }

            setHslColor(hsl)
            setOpacity(mathRound(100 - (picker[_opacity][_position] / sliderSize() * 100)))
        })
    }

    function initListener() {
        addEventListener(getDocument(), _touchmove, (ev) => setPosition(
            (ev as TouchEvent)[_touches][0][_clientX],
            (ev as TouchEvent)[_touches][0][_clientY]
        ))

        addEventListener(getDocument(), _touchend, () => {
            removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
            setPicker(_color, _isDrag, false)
            setPicker(_hue, _isDrag, false)
            setPicker(_opacity, _isDrag, false)
        })

        addEventListener(getDocument(), _mousemove, ev => setPosition(
            (ev as MouseEvent)[_clientX],
            (ev as MouseEvent)[_clientY]
        ))

        addEventListener(getDocument(), _mouseup, () => {
            removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
            setPicker(_color, _isDrag, false)
            setPicker(_hue, _isDrag, false)
            setPicker(_opacity, _isDrag, false)
        })

        addEventListener(colorPickerRef, ColorPickerEvents[_valuechange], ev => {
            const color = getAttribute(colorPickerRef, ColorPickerAttributes[_value]) ?? props[_initialColor]
            testHexColorWithAlpha(color)
            setHexColor(color as HEXColor)
            initColor()
        })
        
        onCleanup(() => {
            removeEventListener(colorPickerRef, ColorPickerEvents[_valuechange], ev => {
                const color = getAttribute(colorPickerRef, ColorPickerAttributes[_value]) ?? props[_initialColor]
                testHexColorWithAlpha(color)
                setHexColor(color as HEXColor)
                initColor()
            })

            removeEventListener(getDocument(), _touchmove, (ev) => setPosition(
                (ev as TouchEvent)[_touches][0][_clientX],
                (ev as TouchEvent)[_touches][0][_clientY]
            ))

            removeEventListener(getDocument(), _touchend, () => {
                removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                setPicker(_color, _isDrag, false)
                setPicker(_hue, _isDrag, false)
                setPicker(_opacity, _isDrag, false)
            })

            removeEventListener(getDocument(), _mousemove, ev => setPosition(
                (ev as MouseEvent)[_clientX],
                (ev as MouseEvent)[_clientY]
            ))

            removeEventListener(getDocument(), _mouseup, () => {
                removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                setPicker(_color, _isDrag, false)
                setPicker(_hue, _isDrag, false)
                setPicker(_opacity, _isDrag, false)
            })
        })
    }

    function initColor(): void {
        testHexColorWithAlpha(hexColor())
        setHslColor(hexToHSL(hexColor()[_substring](0, 7)))

        if (hexColor()[_length] == 9 && !props[_disabledOpacityControl]) {
            const opacity = numberParse(hexColor()[_substring](7, 9), true, 16) / 255
            setOpacity(mathRound(opacity * 100))
        }

        if (props[_disabledColorControl]) setHslColor(hsl => ({...hsl, s: 1, l: 0.5}))

        updateInputs()
        updatePosition()
    }

    function onColorInputChange(value: string): void {
        if (colorModel() == _RGB){
            const rgb: RGBColor = { r: 0, g: 0, b: 0 }
            const rgbArr: string[] = value[_replace](/[^0-9,.]/g, '')[_split](',')
            while (rgbArr[_length] < 3) rgbArr[_push]('0')

            const parse = (value: string | number): number => {
                value = numberParse(`${value}` as string, true)
                if (Number[_isNaN](value) || !Number[_isFinite](value)) value = 0
                if (value < 0) value = 0
                if (value > 255) value = 255
                return value as number
            }

            rgb.r = parse(rgbArr[0])
            rgb.g = parse(rgbArr[1])
            rgb.b = parse(rgbArr[2])

            const hsl = rgbToHsl(rgb)
            if (props[_disabledColorControl]){
                hsl.s = 1
                hsl.l = 0.5
            }

            setHslColor(hsl)
        }
        else if (colorModel() == _HSL){
            const hsl: HSLColor = {h: 0, s: 0, l: 0}
            const hslArr: string[] = value[_replace](/[^0-9,.]/g, '')[_split](',')
            while (hslArr[_length] < 3) hslArr[_push]("0")

            let $value: number = numberParse(hslArr[0])
            if (Number[_isNaN]($value) || !Number[_isFinite]($value)) $value = 0
            if ($value < 0) $value = 0
            if ($value > 360) $value = 360

            hsl.h = $value / 360

            $value = numberParse(hslArr[1])
            if (Number[_isNaN]($value) || !Number[_isFinite]($value)) $value = 0
            if ($value < 0) $value = 0
            if ($value > 100) $value = 100

            hsl.s = $value / 100

            $value = numberParse(hslArr[2])
            if (Number[_isNaN]($value) || !Number[_isFinite]($value)) $value = 0
            if ($value < 0) $value = 0
            if ($value > 100) $value = 100

            hsl.l = $value / 100

            if (props[_disabledColorControl]){
                hsl.s = 1
                hsl.l = 0.5
            }
            setHslColor(hsl)
        }
        else if (colorModel() == _HEX) {
            value = value[_replace](/[^0-9a-fA-F]/g, '')
            if (value[_trim]()[_length] == 0) value = '0'

            let $value: number = numberParse(value, true, 16)
            if (Number[_isNaN]($value) || !Number[_isFinite]($value)) $value = 0
            if ($value < 0) $value = 0
            if ($value > 0xffffff) $value = 0xffffff

            value = `${$value[_toString](16)}`[_padStart](6, '0')[_substring](0, 6)

            const hsl = rgbToHsl(hexToRgb('#' + value))
            if (props[_disabledColorControl]){
                hsl.s = 1
                hsl.l = 0.5
            }
            setHslColor(hsl)
        }

        updatePosition()
    }

    function onOpacityInputChange(value: string): void {
        let $opacity: number = numberParse(value)

        if (Number[_isNaN]($opacity) || !Number[_isFinite]($opacity)) return
        if ($opacity < 0) $opacity = 0
        if ($opacity > 100) $opacity = 100

        setOpacity($opacity)
        updatePosition()
    }

    onMount(() => {
        setHexColor(props[_initialColor] as HEXColor)
        initListener()
        initColor()

        let timeout: null | number = null
        const observer = initPopover(colorPickerRef)
        const isOpenObserver = new MutationObserver(() => {
            if (timeout) clearTimeDelayed(timeout)

            // [data-open] is not the only attribute that trigger this callback
            timeout = setTimeDelayed(() => {
                const isOpen = hasAttribute(colorPickerRef, PopoverAttributes[_open])
                if (props[_onToggle]) props[_onToggle](isOpen)
                timeout = null
            }, 50)
        })
        isOpenObserver[_observe](colorPickerRef, {attributes: true})
        onCleanup(() => {
            if (observer) observer[_disconnect]();
            isOpenObserver[_disconnect]();
        })
    })

    const Control: Component = () => {
        return (<div class="color-picker-control" data-hide-color={toggleAttribute(props[_disabledColorControl])}>
            <div
                class="color-picker-color"
                style={{'--color-picker-color': hexColorCanvas()}}
                onMouseDown={(ev) => {
                    setPicker(_color, _isDrag, true)
                    setPicker(_color, _rect, getBoundingClientRect(ev[_currentTarget]))
                    setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                    setPosition(ev[_clientX], ev[_clientY])
                }}
                onTouchStart={(ev) => {
                    setPicker(_color, _isDrag, true)
                    setPicker(_color, _rect, getBoundingClientRect(ev[_currentTarget]))
                    setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                    setPosition(ev[_touches][0][_clientX], ev[_touches][0][_clientY])
                }}
                data-hsl={toggleAttribute(colorModel() == _HSL)}>
                <div style={{
                    top: mathMax(mathMin(picker[_color][_position][_top] - 10, 184), -4) + _px,
                    left: mathMax(mathMin(picker[_color][_position][_left] - 10, 244), -4) + _px
                }}/>
            </div>
            <div>
                <div
                    data-hide-color={toggleAttribute(props[_disabledColorControl])}
                    class="color-picker-selected-color"
                    style={{'background-color': getHexColor()}}
                />
                <div
                    class="color-picker-range"
                    data-hide-color={toggleAttribute(props[_disabledColorControl])}
                    data-hide-opacity={toggleAttribute(props[_disabledOpacityControl])}>
                    <div
                        class="color-picker-hue"
                        onClick={(ev) => {
                            if (!picker[_hue][_rect]) throw Error()

                            setPicker(_hue, _position, mathMax(mathMin(props[_disabledColorControl]
                                ? ev[_clientX] - picker[_hue][_rect]![_left]
                                : ev[_clientY] - picker[_hue][_rect]![_top],
                            sliderSize()), 0))
                        }}
                        onMouseDown={(ev) => {
                            setPicker(_hue, _isDrag, true)
                            setPicker(_hue, _rect, getBoundingClientRect(ev[_currentTarget]))
                            setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                            setPosition(ev[_clientX], ev[_clientY])
                        }}
                        onTouchStart={(ev) => {
                            setPicker(_hue, _isDrag, true)
                            setPicker(_hue, _rect, getBoundingClientRect(ev[_currentTarget]))
                            setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                            setPosition(ev[_touches][0][_clientX], ev[_touches][0][_clientY])
                        }}>
                        <div style={{
                            top: (props[_disabledColorControl]? -4 : mathMax(mathMin(picker[_hue][_position] - 10, 128), -4)) + _px,
                            left: (props[_disabledColorControl]? mathMax(mathMin(picker[_hue][_position] - 10, 244), -4) : -4) + _px
                        }}/>
                    </div>
                    <div
                        class="color-picker-opacity"
                        onClick={(ev) => {
                            if (!picker[_opacity][_rect]) throw Error()

                            setPicker(_opacity, _position, mathMax(mathMin(props[_disabledColorControl]
                                ? ev[_clientX] - picker[_opacity][_rect]![_left]
                                : ev[_clientY] - picker[_opacity][_rect]![_top],
                            sliderSize()), 0))
                        }}
                        onTouchStart={(ev) => {
                            setPicker(_opacity, _isDrag, true)
                            setPicker(_opacity, _rect, getBoundingClientRect(ev[_currentTarget]))
                            setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                            setPosition(ev[_touches][0][_clientX], ev[_touches][0][_clientY])
                        }}
                        onMouseDown={(ev) => {
                            setPicker(_opacity, _isDrag, true)
                            setPicker(_opacity, _rect, getBoundingClientRect(ev[_currentTarget]))
                            setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                            setPosition(ev[_clientX], ev[_clientY])
                        }}>
                        <div style={{
                            top: (props[_disabledColorControl]? -4 : mathMax(mathMin(picker[_opacity][_position] - 10, 128), -4)) + _px,
                            left: (props[_disabledColorControl]? mathMax(mathMin(picker[_opacity][_position] - 10, 244), -4) : -4) + _px
                        }}/>
                    </div>
                </div>
            </div>
        </div>)
    }

    const Input: Component = () => {
        return (<div class="color-picker-input" data-hide-opacity={toggleAttribute(props[_disabledOpacityControl])}>
            <TextField
                ref={r => colorInputRef = r}
                onInput={(ev) => onColorInputChange(ev[_currentTarget][_value])}
                onBlur={() => updateInputs()}
                labelText={colorModel() == _RGB? _RGB : colorModel() == _HEX? 'Hex' : _HSL}
                placeholder={colorModel() == _RGB? "0-255, 0-255, 0-255" : colorModel() == _HEX? '#FF0000' : '0-360, 0-100%, 0-100%'}
            />
            <TextField
                onInput={(ev) => onOpacityInputChange(ev[_currentTarget][_value])}
                onBlur={() => updateInputs()}
                ref={r => opacityInputRef = r}
                labelText="Opacity"
                value="100%"
                placeholder="0-100%"
            />
        </div>)
    }

    const Actions: Component = () => {
        return (<div class="color-picker-actions">
            <Button onClick={changeColorModel} variant={ButtonVariant[_filledTonal]}>{colorModel()}</Button>
            <Button
                variant={ButtonVariant[_filledTonal]}
                onClick={() => {
                    initColor()
                    closePopover(colorPickerRef)
                }}>
                Cancel
            </Button>
            <Button
                variant={ButtonVariant[_filled]}
                onClick={() => {
                    if (props[_onSelectColor]) props[_onSelectColor](getHexColor() as HEXColor)
                    closePopover(colorPickerRef)
                }}>
                Select
            </Button>
        </div>)
    }

    return (<Portal><dialog
        ref={r => {
            colorPickerRef = r
            if (props[_ref]) props[_ref](r)
        }}
        // TODO: implement onKeyDown
        class="color-picker"
        data-popover
        data-dismiss={_auto}
        onClose={(ev) => {
            if (props[_onClose]) props[_onClose](ev)
            if (props[_onToggle]) props[_onToggle](false)
        }}
        onCancel={(ev) => {
            preventDefault(ev)
            if (props[_onCancel]) props[_onCancel](ev)
            if (props[_onToggle]) props[_onToggle](false)
            closePopover(ev[_currentTarget])
        }}
        {...other}>
        <div>
            <Control/>
            <Input/>
            <div class="color-picker-content">{ props[_children] }</div>
            <Actions/>
        </div>
    </dialog></Portal>)
}

export default ColorPicker