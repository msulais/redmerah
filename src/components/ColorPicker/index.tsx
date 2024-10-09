import { type Component, type ParentComponent, Show, createEffect, createMemo, createSignal, mergeProps, onCleanup, onMount, splitProps } from "solid-js"
import { createStore } from "solid-js/store"

import type { HEXColor, HSLColor, RGBColor } from "@/types/color"
import { _children, _disabledOpacityControl, _onSelectColor, _disabledColorControl, _ref, _classList, _color, _HEX, _toString, _padStart, _toUpperCase, _hue, _position, _opacity, _HSL, _RGB, _value, _toFixed, _join, _substring, _isDrag, _rect, _left, _top, _touchmove, _touches, _clientX, _clientY, _touchend, _noPointerEvent, _mousemove, _mouseup, _length, _replace, _split, _push, _isNaN, _isFinite, _trim, _currentTarget, _px, _tonal, _filled, _onUpdateColor, _disabledAction, _dispatchEvent, _onChangeColor, _detail, _onToggleOpen } from "@/constants/string"
import { HEX_to_HSL, HEX_to_RGB, HSL_to_HEX, HSL_to_HSV, HSL_to_RGB, HSV_to_HSL, RGB_to_HSL, testHexColorWithAlpha } from "@/utils/color"
import { setTimeDelayed } from "@/utils/timeout"
import { removeAttribute, setAttribute, toggleAttribute } from "@/utils/attributes"
import { getBoundingClientRect } from "@/utils/element"
import { addEventListener, removeEventListener } from '@/utils/event'
import { BodyAttributes } from "@/enums/attributes"
import { getDocument, getDocumentBody } from "@/constants/window"
import { mathMax, mathMin, mathRound, numberParse } from "@/utils/math"

import Button, { ButtonVariant } from "@/components/Button"
import TextField, { changeTextFieldValue } from "@/components/TextField"
import Modal, {
	type ModalProps,
	closeModal,
	openModal,
	repositionModal,
	focusModal,
	ModalPosition as ColorPickerPosition,
	type ModalOpenDetail
} from "@/components/Modal"
import './index.scss'

const COLOR_BOX_WIDTH: number = 260
const COLOR_BOX_HEIGHT: number = 200
const DEFAULT_HEX_COLOR: HEXColor = '#FF0000'

enum ColorPickerEvents {
	/** @param {HEXColor} color `HEXColor` */
	onChangeColor = 'on-change-color'
}

function openColorPicker(event: Event, colorPicker: HTMLDialogElement, options?: Omit<ModalOpenDetail, 'event'> & {color?: HEXColor}): void {
	if (options?.[_color] != null) changeColorPickerValue(colorPicker, options[_color])

	openModal(event, colorPicker, options)
}

function changeColorPickerValue(colorPicker: HTMLDialogElement, color: HEXColor): void {
	colorPicker[_dispatchEvent](new CustomEvent(
		ColorPickerEvents[_onChangeColor],
		{detail: color}
	))
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


type ColorPickerProps = ModalProps & {
	color?: HEXColor
	disabledOpacityControl?: boolean
	disabledColorControl?: boolean
	disabledAction?: boolean
	onUpdateColor?: (color: HEXColor) => unknown
	onSelectColor?: (color: HEXColor) => unknown
}
const ColorPicker: ParentComponent<ColorPickerProps> = ($props) => {
	const $$props = mergeProps({color: DEFAULT_HEX_COLOR, disabledColorControl: false}, $props)
	const [props, other] = splitProps($$props, [
		_children, _disabledOpacityControl, _onSelectColor,
		_disabledColorControl, _ref, _classList, _color,
		_onUpdateColor, _disabledAction, _onToggleOpen
	])
	let is_colorPicker_open: boolean = false
	const [colorModel, setColorMode] = createSignal<'HEX' | 'RGB' | 'HSL'>(_HEX)
	const [hslColor, setHslColor] = createSignal<HSLColor>({h: 0, s: 1, l: 0.5})
	const [hexColor, setHexColor] = createSignal<HEXColor>(DEFAULT_HEX_COLOR)
	const [opacity, setOpacity] = createSignal<number>(100) // 0 - 100
	const [color, setColor] = createSignal<HEXColor>(DEFAULT_HEX_COLOR)
	const [isDisabledColorControl, setIsDisabledColorControl] = createSignal<boolean>(false)
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
		const hexColor = (HSL_to_HEX(hslColor()) + $opacity)[_toUpperCase]()
		if (props[_onUpdateColor] && is_colorPicker_open) props[_onUpdateColor](hexColor as HEXColor)
		return hexColor
	})
	const getSliderSize = createMemo<number>(() => props[_disabledColorControl]? 260 : 144)
	const getHexColorForCanvas = createMemo(() => HSL_to_HEX({h: hslColor().h, s: 1, l: 0.5}))
	let textfield_opacity_ref: HTMLInputElement | undefined
	let textfield_color_ref!: HTMLInputElement
	let colorPicker_ref: HTMLDialogElement

	function updatePosition(): void {
		setPicker(_hue, _position, hslColor().h * getSliderSize())
		setPicker(_opacity, _position, (1 - opacity() / 100) * getSliderSize())

		if (colorModel() == _HSL) return setPicker(_color, _position, {
			left: COLOR_BOX_WIDTH * hslColor().s,
			top: COLOR_BOX_HEIGHT * (1 - hslColor().l)
		})

		const hsv = HSL_to_HSV(hslColor())
		setPicker(_color, _position, {
			left: COLOR_BOX_WIDTH * hsv.s,
			top: COLOR_BOX_HEIGHT * (1 - hsv.v)
		})
	}

	function changeColorModel(): void {
		const c = colorModel()
		if (c == _RGB) setColorMode(_HSL)
		else if (c == _HSL) setColorMode(_HEX)
		else if (c == _HEX) setColorMode(_RGB)

		updateInputs()
		updatePosition()
	}

	function updateInputs(onBeforeUpdate?: () => void): void {
		if (onBeforeUpdate) onBeforeUpdate()

		if (colorModel() == _RGB){
			const rgb = HSL_to_RGB(hslColor())
			changeTextFieldValue(textfield_color_ref, `${rgb.r}, ${rgb.g}, ${rgb.b}`)
		}
		else if (colorModel() == _HSL){
			changeTextFieldValue(textfield_color_ref, [
				mathRound(hslColor().h * 360),
				numberParse((hslColor().s * 100)[_toFixed](2)) + '%',
				numberParse((hslColor().l * 100)[_toFixed](2)) + '%'
			][_join](', '))
		}
		else if (colorModel() == _HEX) {
			changeTextFieldValue(textfield_color_ref, getHexColor()[_substring](0, 7))
		}

		if (textfield_opacity_ref) changeTextFieldValue(textfield_opacity_ref, opacity() + '%')
	}

	function setPosition(clientX: number, clientY: number): void {
		if (picker[_color][_isDrag]) setPicker(_color, _position, {
			left: mathMax(mathMin(clientX - picker[_color][_rect]![_left], COLOR_BOX_WIDTH), 0),
			top: mathMax(mathMin(clientY - picker[_color][_rect]![_top], COLOR_BOX_HEIGHT), 0)
		})
		else if (picker[_hue][_isDrag]) setPicker(_hue, _position, mathMax(mathMin(props[_disabledColorControl]
			? clientX - picker[_hue][_rect]![_left]
			: clientY - picker[_hue][_rect]![_top],
		getSliderSize()), 0))
		else if (picker[_opacity][_isDrag]) setPicker(_opacity, _position, mathMax(mathMin(props[_disabledColorControl]
			? clientX - picker[_opacity][_rect]![_left]
			: clientY - picker[_opacity][_rect]![_top],
		getSliderSize()), 0))

		if (!(picker[_color][_isDrag] || picker[_hue][_isDrag] || picker[_opacity][_isDrag])) return

		updateInputs(() => {
			const hsl: HSLColor = {
				h: picker[_hue][_position] / getSliderSize(),
				s: picker[_color][_position][_left] / COLOR_BOX_WIDTH,
				l: 1 - picker[_color][_position][_top] / COLOR_BOX_HEIGHT
			}

			if (colorModel() != _HSL) {
				const _hsl: HSLColor = HSV_to_HSL({
					h: hsl.h,
					s: hsl.s,
					v: hsl.l
				})

				// i don't even know this can be here
				hsl.s = _hsl.s
				hsl.l = _hsl.l
			}

			setHslColor(hsl)
			setOpacity(mathRound(100 - (picker[_opacity][_position] / getSliderSize() * 100)))
		})
	}

	function onTouchMove(ev: TouchEvent): void {
		setPosition(ev[_touches][0][_clientX], ev[_touches][0][_clientY])
	}

	function onTouchEnd(): void {
		setPicker(_color, _isDrag, false)
		setPicker(_hue, _isDrag, false)
		setPicker(_opacity, _isDrag, false)

		// should be run last because <Modal> will mark this to close
		// when mouse position outside
		setTimeDelayed(() => {
			removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
		})
	}

	function onMouseMove(ev: MouseEvent): void {
		setPosition(ev[_clientX], ev[_clientY])
	}

	function onMouseUp(): void {
		setPicker(_color, _isDrag, false)
		setPicker(_hue, _isDrag, false)
		setPicker(_opacity, _isDrag, false)

		// should be run last because <Modal> will mark this to close
		// when mouse position outside
		setTimeDelayed(() => {
			removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
		})
	}

	function onChangeColor(ev: CustomEvent): void {
		const color = ev[_detail] as HEXColor
		if (!testHexColorWithAlpha(color)) return;
		setColor(color)
		setHexColor(color)
		updateColor()
	}

	function initListener() {
		addEventListener<CustomEvent>(colorPicker_ref, ColorPickerEvents[_onChangeColor], onChangeColor)
		addEventListener<TouchEvent>(getDocument(), _touchmove, onTouchMove)
		addEventListener<TouchEvent>(getDocument(), _touchend, onTouchEnd)
		addEventListener<MouseEvent>(getDocument(), _mousemove, onMouseMove)
		addEventListener<MouseEvent>(getDocument(), _mouseup, onMouseUp)

		onCleanup(() => {
			removeEventListener<CustomEvent>(colorPicker_ref, ColorPickerEvents[_onChangeColor], onChangeColor)
			removeEventListener<TouchEvent>(getDocument(), _touchmove, onTouchMove)
			removeEventListener<TouchEvent>(getDocument(), _touchend, onTouchEnd)
			removeEventListener<MouseEvent>(getDocument(), _mousemove, onMouseMove)
			removeEventListener<MouseEvent>(getDocument(), _mouseup, onMouseUp)
		})
	}

	function updateColor(): void {
		if (!testHexColorWithAlpha(hexColor())) return;
		setHslColor(HEX_to_HSL(hexColor()[_substring](0, 7) as HEXColor))

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

			const hsl = RGB_to_HSL(rgb)
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

			const hsl = RGB_to_HSL(HEX_to_RGB(('#' + value) as HEXColor))
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
		initListener()
	})

	createEffect(() => {
		const $isDisabledColorControl = props[_disabledColorControl]
		const $$isDisabledColorControl = isDisabledColorControl()
		const $hexColor = hexColor()
		const $color = props[_color]
		const $$color = color()

		if ($isDisabledColorControl != $$isDisabledColorControl) {
			let color = HSL_to_HEX({...HEX_to_HSL($hexColor), l: 1.0})
			setHexColor(color)
			updateColor()
			setIsDisabledColorControl($isDisabledColorControl)
		}
		if ($color != $$color) {
			if (!testHexColorWithAlpha($color)) return;
			setColor($color)
			setHexColor($color)
			updateColor()
		}
	})

	const Control: Component = () => {
		return (<div class="color-picker-control" data-hide-color={toggleAttribute(props[_disabledColorControl])}>
			<div
				class="color-picker-color"
				style={{'--color-picker-color': getHexColorForCanvas()}}
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
					data-hide-opacity={toggleAttribute(props[_disabledOpacityControl])}
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
							getSliderSize()), 0))
						}}
						onMouseDown={(ev) => {
							// BUG: unable to scroll when color is #000000 or #FFFFFF
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
							getSliderSize()), 0))
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
				ref={r => textfield_color_ref = r}
				onInput={(ev) => onColorInputChange(ev[_currentTarget][_value])}
				onBlur={() => updateInputs()}
				labelText={colorModel() == _RGB? _RGB : colorModel() == _HEX? 'Hex' : _HSL}
				placeholder={colorModel() == _RGB? "0-255, 0-255, 0-255" : colorModel() == _HEX? '#FF0000' : '0-360, 0-100%, 0-100%'}
			/>
			<TextField
				onInput={(ev) => onOpacityInputChange(ev[_currentTarget][_value])}
				onBlur={() => updateInputs()}
				ref={r => textfield_opacity_ref = r}
				labelText="Opacity"
				value="100%"
				placeholder="0-100%"
			/>
		</div>)
	}

	const Actions: Component = () => {
		return (<div class="color-picker-actions" data-disabled={toggleAttribute(props[_disabledAction])}>
			<Button onClick={changeColorModel} variant={ButtonVariant[_tonal]}>{colorModel()}</Button>
			<Show when={!props[_disabledAction]}>
				<Button
					variant={ButtonVariant[_tonal]}
					onClick={() => {
						setHexColor(color())
						updateColor()
						closeModal(colorPicker_ref)
					}}>
					Cancel
				</Button>
				<Button
					variant={ButtonVariant[_filled]}
					onClick={() => {
						if (props[_onSelectColor]) props[_onSelectColor](getHexColor() as HEXColor)
						closeModal(colorPicker_ref)
					}}>
					Select
				</Button>
			</Show>
		</div>)
	}

	return (<Modal
		ref={r => {
			colorPicker_ref = r
			if (props[_ref]) props[_ref](r)
		}}
		onToggleOpen={o => {
			is_colorPicker_open = o
			if (props[_onToggleOpen]) props[_onToggleOpen](o)
		}}
		classList={{
			'color-picker': true,
			...props[_classList]
		}}
		{...other}>
		<Control/>
		<Input/>
		<div class="color-picker-content">{ props[_children] }</div>
		<Actions/>
	</Modal>)
}

export {
	ColorPicker,
	closeModal as closeColorPicker,
	openColorPicker,
	repositionModal as repositionColorPicker,
	focusModal as focusColorPicker,
	changeColorPickerValue,
	ColorPickerPosition,
	ColorPickerEvents
}
export type {
	ColorPickerProps,
}
export default ColorPicker