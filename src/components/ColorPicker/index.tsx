import { type Component, type ParentComponent, Show, createEffect, createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import type { HEXColor, HSLColor, RGBColor } from "@/types/color"
import { timeTimerSet } from "@/utils/time"
import { attrRemove, attrSet, attrSetIfExist } from "@/utils/attributes"
import { elementDispatchEvent, elementRect, elementTagName, elementId, elementPointerCaptureSet, elementPointerCaptureRelease, elementValidTarget } from "@/utils/element"
import { eventListenerAdd, eventCurrentTarget, eventPreventDefault, eventListenerRemove } from '@/utils/event'
import { BodyAttributes } from "@/enums/attributes"
import { mathClamp, mathRound } from "@/utils/math"
import { numberIsNotDefined, numberParse, numberSafe, numberToString } from "@/utils/number"
import { stringLength, stringPadStart, stringReplace, stringSplit, stringSubstring, stringToUpperCase, stringTrim } from "@/utils/string"
import { colorContrastRatio, colorHexToHsl, colorHexToRgb, colorHslToHex, colorHslToHsv, colorHslToRgb, colorHsvToHsl, colorIsValidWithAlpha, colorRgbToHsl } from "@/utils/color"
import { documentActive, documentBody } from "@/utils/document"
import { arrayJoin, arrayLength, arrayPush } from "@/utils/array"
import { rectHeight, rectLeft, rectTop, rectWidth } from "@/utils/rect"
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP } from "@/constants/key_code"

import Button, { ButtonVariant } from "@/components/Button"
import TextField from "@/components/TextField"
import Modal, { type ModalProps, ModalPosition as ColorPickerPosition, type ModalOpenDetail, openModal, closeModal, focusModal, isModalOpen, repositionModal } from "@/components/Modal"
import Popover, { closePopover, isPopoverOpen, openPopover, repositionPopover, type PopoverProps } from "@/components/Popover"
import FocusableGroup from "@/components/FocusableGroup"
import './index.scss'

const DEFAULT_HEX_COLOR: HEXColor = '#FF0000'

enum ColorPickerEvents {
	/** @param {HEXColor} color `HEXColor` */
	changecolor = 'custom:colorpicker-changecolor'
}

function openColorPicker(
	colorPicker: HTMLDialogElement,
	options?: Omit<ModalOpenDetail, 'event'> & { color?: HEXColor }
): void {
	if (options?.color != null) changeColorPickerValue(colorPicker, options.color)

	openModal(colorPicker, options)
}

function openPopoverColorPicker(
	colorPicker: HTMLDivElement,
	options?: Omit<ModalOpenDetail, 'event'> & { color?: HEXColor }
): void {
	if (options?.color != null) changeColorPickerValue(colorPicker, options.color)

	openPopover(colorPicker, options)
}

function changeColorPickerValue(
	colorPicker: HTMLDivElement | HTMLDialogElement,
	color: HEXColor
): void {
	elementDispatchEvent(colorPicker, new CustomEvent(
		ColorPickerEvents.changecolor,
		{ detail: color }
	))
}

const ColorPickerBody: ParentComponent<{
	color?: HEXColor
	element: HTMLElement
	disabledOpacityControl?: boolean
	disabledColorControl?: boolean
	disabledActions?: boolean
	isColorPickerOpen: boolean
	onUpdateColor?(color: HEXColor): unknown
	onSelectColor?(color: HEXColor): unknown
	onClose(): unknown
}> = $props => {
	const props = mergeProps({
		color: DEFAULT_HEX_COLOR,
		disabledColorControl: false,
		disabledOpacityControl: false
	}, $props)
	let textFieldOpacityRef: HTMLInputElement | undefined
	let textFieldColorRef!: HTMLInputElement
	let colorRef: HTMLDivElement | undefined
	let hueRef: HTMLDivElement | undefined
	let opacityRef: HTMLDivElement | undefined
	let colorRect: DOMRect
	let hueRect: DOMRect
	let opacityRect: DOMRect
	let colorDragged: boolean = false
	let hueDragged: boolean = false
	let opacityDragged: boolean = false
	let localColor: HEXColor | null = null
	let localColorSpace: 'HEX' | 'RGB' | 'HSL' = 'HEX'
	let localHSL: HSLColor = {h: 0, s: 1, l: 0.5}
	let [keyLeftPressed, keyRightPressed, keyUpPressed, keyDownPressed] = [false, false, false, false]
	const body = documentBody()
	const [colorSpace, setColorSpace2] = createSignal<'HEX' | 'RGB' | 'HSL'>('HEX')
	const [hsl, setHsl2] = createSignal<HSLColor>({h: 0, s: 1, l: .5})
	const [opacity, setOpacity] = createSignal<number>(1) // [0-100]
	const [hue, setHue] = createSignal<number>(1) // [0-100]
	const [left, setLeft] = createSignal<number>(1) // [0-100]
	const [top, setTop] = createSignal<number>(1) // [0-100]
	const isDisabledOpacityControl = createMemo(() => props.disabledOpacityControl)
	const isDisabledColorControl = createMemo(() => props.disabledColorControl)
	const getHSLColor = createMemo<HSLColor>(() => {
		let h = hue() / 100
		let s = 1
		let l = 0.5
		if (!isDisabledColorControl()) {
			if (colorSpace() != 'HSL') {
				const hsl = colorHsvToHsl({
					h, s: left() / 100, v: (100 - top()) / 100
				})
				s = hsl.s
				l = hsl.l
			}
			else {
				s = left() / 100
				l = (100 - top()) / 100
			}
		}
		return {h, s, l}
	})
	const getHexColor = createMemo<HEXColor>(() => {
		const $opacity: string = opacity() == 100 || isDisabledOpacityControl()
			? ''
			: stringPadStart(numberToString(mathRound(opacity() / 100 * 255), 16), 2, '0')
		;
		const hex_color = stringToUpperCase(colorHslToHex(getHSLColor()) + $opacity)
		localColor = hex_color as HEXColor
		return hex_color as HEXColor
	})

	function setHsl(hsl: HSLColor): void {
		setHsl2({...hsl})
		localHSL = {...hsl}
	}

	function setColorSpace(space: 'HEX' | 'RGB' | 'HSL'): void {
		setColorSpace2(space)
		localColorSpace = space
	}

	/**
	 * @param opacity value from [0-1]
	 */
	function updatePosition(opacity?: number): void {
		const {h, s, l} = hsl()
		setHue(h * 100)

		let left = s * 100
		let top = (1 - l) * 100
		if (colorSpace() != 'HSL') {
			const {s, v} = colorHslToHsv(hsl())
			left = s * 100
			top = (1 - v) * 100
		}

		if (opacity) setOpacity(mathClamp(opacity, 0, 1) * 100)

		setLeft(left)
		setTop(top)
	}

	function changeColorSpace(): void {
		switch (colorSpace()) {
		case 'RGB': setColorSpace('HSL'); break
		case 'HSL': setColorSpace('HEX'); break
		case 'HEX': setColorSpace('RGB'); break
		}

		updateInputs()
		updatePosition()
	}

	// don't trigger input event
	function updateInputs(): void {
		switch (colorSpace()) {
		case "RGB":
			const rgb = colorHslToRgb(getHSLColor())
			textFieldColorRef.value = `${mathRound(rgb.r * 0xff)}, ${mathRound(rgb.g * 0xff)}, ${mathRound(rgb.b * 0xff)}`
			break
		case "HSL":
			textFieldColorRef.value = arrayJoin([
				mathRound(getHSLColor().h * 360),
				mathRound(getHSLColor().s * 100) + '%',
				mathRound(getHSLColor().l * 100) + '%',
			], ', ')
			break
		case "HEX":
			textFieldColorRef.value = stringSubstring(getHexColor(), 0, 7)
			break
		}

		if (textFieldOpacityRef) textFieldOpacityRef.value = mathRound(opacity()) + '%'
	}

	function setPosition(x: number, y: number): void {
		if (colorDragged) {
			x = (x - rectLeft(colorRect)) / rectWidth(colorRect) * 100
			x = mathClamp(x, 0, 100)
			setLeft(x)

			y = (y - rectTop(colorRect)) / rectHeight(colorRect) * 100
			y = mathClamp(y, 0, 100)
			setTop(y)
		}
		else if (hueDragged) {
			let v = isDisabledColorControl()? x : y
			let rect_offset = isDisabledColorControl()? rectLeft(hueRect) : rectTop(hueRect)
			let rect_size = isDisabledColorControl()? rectWidth(hueRect) : rectHeight(hueRect)
			v = (v - rect_offset) / rect_size * 100
			v = mathClamp(v, 0, 100)
			setHue(v)
		}
		else if (opacityDragged) {
			let v = isDisabledColorControl()? x : y
			let rect_offset = isDisabledColorControl()? rectLeft(opacityRect) : rectTop(opacityRect)
			let rect_size = isDisabledColorControl()? rectWidth(opacityRect) : rectHeight(opacityRect)
			v = (v - rect_offset) / rect_size * 100
			v = mathClamp(v, 0, 100)
			setOpacity(100 - v)
		}

		const dragged = colorDragged || hueDragged || opacityDragged
		if (!dragged) return

		setHsl({...getHSLColor()})
		updateInputs()
		if (props.isColorPickerOpen) props.onUpdateColor?.(getHexColor())
	}

	function onPointerMove(ev: PointerEvent): void {
		setPosition(ev.clientX, ev.clientY)
	}

	function onPointerUp(ev: PointerEvent): void {
		const pointerId = ev.pointerId
		if (colorDragged) elementPointerCaptureRelease(colorRef!, pointerId)
		if (opacityDragged) elementPointerCaptureRelease(opacityRef!, pointerId)
		if (hueDragged) elementPointerCaptureRelease(hueRef!, pointerId)

		colorDragged = hueDragged = opacityDragged = false
		// should be run last because <Modal> will mark this to close
		// when mouse position outside
		timeTimerSet(() => attrRemove(body, BodyAttributes.noPointerEvent))
	}

	function onChangeColor(ev: CustomEvent<HEXColor>): void {
		const color = ev.detail
		if (!colorIsValidWithAlpha(color)) return;
		updateColor(color)
	}

	function initEvents() {
		eventListenerAdd<CustomEvent>(props.element, ColorPickerEvents.changecolor, onChangeColor)

		onCleanup(() => {
			eventListenerRemove<CustomEvent>(props.element, ColorPickerEvents.changecolor, onChangeColor)
		})
	}

	function updateColor(color: HEXColor): void {
		if (!colorIsValidWithAlpha(color)) return;
		const hsl = colorHexToHsl(
			stringSubstring(color, 0, 7) as HEXColor
		)
		setHsl({...hsl})

		if (stringLength(color) == 9 && !isDisabledOpacityControl()) {
			const opacity = numberParse(stringSubstring(color, 7, 9), true, 16) / 255
			setOpacity(mathRound(opacity * 100))
		}

		if (isDisabledColorControl()) setHsl({ h: hsl.h, s: 1, l: 0.5 })

		updateInputs()
		updatePosition()
	}

	function onColorInputChange(value: string): void {
		switch (colorSpace()) {
		case "RGB": {
			const rgb: RGBColor = { r: 0, g: 0, b: 0 }
			const rgbArray: string[] = stringSplit(stringReplace(value, /[^0-9,.]/g, ''), ',')
			while (arrayLength(rgbArray) < 3) arrayPush(rgbArray, '0')

			const parse = (value: string | number): number => {
				value = numberParse(`${value}`, true)
				value = numberSafe(value, 0)
				value = mathClamp(value, 0, 255)
				value = value / 0xff
				return value as number
			}

			rgb.r = parse(rgbArray[0])
			rgb.g = parse(rgbArray[1])
			rgb.b = parse(rgbArray[2])

			const hsl = colorRgbToHsl(rgb)
			if (isDisabledColorControl()) {
				hsl.s = 1
				hsl.l = 0.5
			}

			setHsl(hsl)
			break
		}
		case "HSL": {
			const hsl: HSLColor = { h: 0, s: 0, l: 0 }
			const hslArray: string[] = stringSplit(stringReplace(value, /[^0-9,.]/g, ''), ',')
			while (arrayLength(hslArray) < 3) arrayPush(hslArray, "0")

			let $value: number = numberParse(hslArray[0])
			$value = numberSafe($value, 0)
			$value = mathClamp($value, 0, 360)

			hsl.h = $value / 360

			$value = numberParse(hslArray[1])
			$value = numberSafe($value, 0)
			$value = mathClamp($value, 0, 100)

			hsl.s = $value / 100

			$value = numberParse(hslArray[2])
			$value = numberSafe($value, 0)
			$value = mathClamp($value, 0, 100)

			hsl.l = $value / 100

			if (isDisabledColorControl()) {
				hsl.s = 1
				hsl.l = 0.5
			}
			setHsl(hsl)
			break
		}
		case "HEX": {
			value = stringReplace(value, /[^0-9a-fA-F]/g, '')
			if (stringLength(stringTrim(value)) == 0) value = '0'

			const $value: number = mathClamp(
				numberSafe(numberParse(value, true, 16), 0),
				0,
				0xffffff
			)

			value = stringSubstring(
				stringPadStart(`${numberToString($value, 16)}`, 6, '0'),
				0, 6
			)

			const hsl = colorRgbToHsl(colorHexToRgb(('#' + value) as HEXColor))
			if (isDisabledColorControl()) {
				hsl.s = 1
				hsl.l = 0.5
			}
			setHsl(hsl)
			break
		}}

		updatePosition()
		if (props.isColorPickerOpen) props.onUpdateColor?.(getHexColor())
	}

	function onOpacityInputChange(value: string): void {
		let $opacity: number = numberParse(value)

		if (numberIsNotDefined($opacity)) return

		$opacity = mathRound(mathClamp($opacity, 0, 100))
		setOpacity($opacity)
		updatePosition()
		if (props.isColorPickerOpen) props.onUpdateColor?.(getHexColor())
	}

	onMount(() => {
		initEvents()
	})

	createEffect(() => {
		const $isDisabledColorControl = isDisabledColorControl()
		const $isDisabledOpacityControl = isDisabledOpacityControl()
		const color = '#FFFFFF'
		const handleColor = () => {
			if (color == localColor) return

			localColor = color
			if (!colorIsValidWithAlpha(localColor)) return

			let hsl = colorHexToHsl(localColor)
			let opacity = 100
			if ($isDisabledColorControl) {
				hsl = {h: hsl.h, s: 1, l: 0.5}
			}

			if (stringLength(localColor) > 7 && !$isDisabledOpacityControl) {
				opacity = numberSafe(numberParse(stringSubstring(localColor, 7, 9), true, 16))
				opacity = opacity / 0xff * 100
				opacity = mathClamp(opacity, 0, 100)
			}

			if (textFieldColorRef) {
				let text = ''
				if (localColorSpace == 'HSL') text = arrayJoin([
					mathRound(hsl.h * 360),
					mathRound(hsl.s * 100) + '%',
					mathRound(hsl.l * 100) + '%',
				], ', ')
				else if (localColorSpace == 'HEX') {
					text = stringToUpperCase(colorHslToHex(hsl))
				}
				else if (localColorSpace == 'RGB') {
					const {r, g, b} = colorHslToRgb(hsl)
					text = arrayJoin([
						mathRound(r * 0xff),
						mathRound(g * 0xff),
						mathRound(b * 0xff),
					], ', ')
				}

				textFieldColorRef.value = text
			}

			if (textFieldOpacityRef) {
				textFieldOpacityRef.value = opacity + '%'
			}

			setHue(hsl.h * 100)
			setHsl(hsl)
			setOpacity(opacity)
		}

		const handleDisableColorControl = () => {
			if (!$isDisabledColorControl) return

			const hsl: HSLColor = {h: localHSL.h, s: 1, l: 0.5}
			if (textFieldColorRef) {
				let text = ''
				if (localColorSpace == 'HSL') text = arrayJoin([
					mathRound(hsl.h * 360),
					mathRound(hsl.s * 100) + '%',
					mathRound(hsl.l * 100) + '%',
				], ', ')
				else if (localColorSpace == 'HEX') {
					text = stringToUpperCase(colorHslToHex(hsl))
				}
				else if (localColorSpace == 'RGB') {
					const {r, g, b} = colorHslToRgb(hsl)
					text = arrayJoin([
						mathRound(r * 0xff),
						mathRound(g * 0xff),
						mathRound(b * 0xff),
					], ', ')
				}

				textFieldColorRef.value = text
			}

			setHsl(hsl)
		}

		const handleDisableOpacityControl = () => {
			if (!$isDisabledOpacityControl) return

			if (textFieldOpacityRef) {
				textFieldOpacityRef.value = '100%'
			}

			setOpacity(100)
		}

		handleColor()
		handleDisableColorControl()
		handleDisableOpacityControl()
	})

	const Control: Component = () => {
		return (<div
			class="c-color-picker-control"
			data-c-hide-color={attrSetIfExist(isDisabledColorControl())}>
			<div
				class="c-color-picker-color"
				ref={colorRef}
				style={{ '--c-color-picker-color': colorHslToHex({...hsl(), s: 1, l: .5}) }}
				onPointerDown={(ev) => {
					const self = eventCurrentTarget(ev)
					colorDragged = true
					colorRect = elementRect(self)
					elementPointerCaptureSet(self, ev.pointerId)
					setPosition(ev.clientX, ev.clientY)
					attrSet(body, BodyAttributes.noPointerEvent)
				}}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
				data-c-hsl={attrSetIfExist(colorSpace() == 'HSL')}
				onKeyDown={(ev) => {
					const code = ev.code
					if (code == KEY_ARROW_UP) {
						keyUpPressed = true
						keyDownPressed = false
					}
					else if (code == KEY_ARROW_DOWN) {
						keyDownPressed = true
						keyUpPressed = false
					}
					else if (code == KEY_ARROW_LEFT) {
						keyLeftPressed = true
						keyRightPressed = false
					}
					else if (code == KEY_ARROW_RIGHT) {
						keyRightPressed = true
						keyLeftPressed = false
					}

					if (
						!keyLeftPressed
						&& !keyRightPressed
						&& !keyUpPressed
						&& !keyDownPressed
					) return;


					colorDragged = true
					colorRect = elementRect(eventCurrentTarget(ev))
					const onePercentX = rectWidth(colorRect) / 100
					const onePercentY = rectHeight(colorRect) / 100
					let x = rectLeft(colorRect) + (left() * onePercentX)
					let y = rectTop(colorRect) + (top() * onePercentY)

					if (keyUpPressed) y -= onePercentY
					if (keyDownPressed) y += onePercentY
					if (keyLeftPressed) x -= onePercentX
					if (keyRightPressed) x += onePercentX

					eventPreventDefault(ev)
					setPosition(x, y)
				}}
				onKeyUp={(ev) => {
					const code = ev.code
					if (code == KEY_ARROW_UP) keyUpPressed = false
					if (code == KEY_ARROW_DOWN) keyDownPressed = false
					if (code == KEY_ARROW_LEFT) keyLeftPressed = false
					if (code == KEY_ARROW_RIGHT) keyRightPressed = false

					if (
						!keyUpPressed
						&& !keyDownPressed
						&& !keyLeftPressed
						&& !keyRightPressed
					) colorDragged = false
				}}
				draggable={false}>
				<div
					draggable={false}
					tabindex="0"
					class="c-color-picker-indicator"
					style={{
						"background-color": colorHslToHex(hsl()),
						top: top() + '%',
						left: left() + '%',
						"border-color": colorContrastRatio(colorHslToRgb(getHSLColor()), {r: 0, g: 0, b: 0}) > 50
							? '#000'
							: '#fff',
						transform: 'translate(-12px, -12px)',
					}}
				/>
			</div>
			<div>
				<div
					data-c-hide-color={attrSetIfExist(isDisabledColorControl())}
					data-c-hide-opacity={attrSetIfExist(isDisabledOpacityControl())}
					class="c-color-picker-selected-color"
					style={{ 'background-color': getHexColor() }}
				/>
				<div
					class="c-color-picker-range"
					data-c-hide-color={attrSetIfExist(isDisabledColorControl())}
					data-c-hide-opacity={attrSetIfExist(isDisabledOpacityControl())}>
					<div
						class="c-color-picker-hue"
						ref={hueRef}
						onPointerDown={(ev) => {
							const self = eventCurrentTarget(ev)
							hueDragged = true
							hueRect = elementRect(self)
							elementPointerCaptureSet(self, ev.pointerId)
							setPosition(ev.clientX, ev.clientY)
							attrSet(body, BodyAttributes.noPointerEvent)
						}}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerUp}
						onPointerCancel={onPointerUp}
						onKeyDown={(ev) => {
							const code = ev.code
							const is_arrow_key = (isDisabledColorControl()
								? code == KEY_ARROW_LEFT || code == KEY_ARROW_RIGHT
								: code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
							)

							if (!is_arrow_key) return;

							hueDragged = true
							hueRect = elementRect(eventCurrentTarget(ev))
							const one_percent_x = rectWidth(hueRect) / 100
							const one_percent_y = rectHeight(hueRect) / 100
							let x = rectLeft(hueRect) + (hue() * one_percent_x)
							let y = rectTop(hueRect) + (hue() * one_percent_y)

							if (code == KEY_ARROW_UP) y -= one_percent_y
							else if (code == KEY_ARROW_DOWN) y += one_percent_y
							else if (code == KEY_ARROW_LEFT) x -= one_percent_x
							else if (code == KEY_ARROW_RIGHT) x += one_percent_x

							eventPreventDefault(ev)
							setPosition(x, y)
						}}
						onKeyUp={(ev) => {
							const code = ev.code
							const is_arrow_key = (isDisabledColorControl()
								? code == KEY_ARROW_LEFT || code == KEY_ARROW_RIGHT
								: code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
							)
							if (is_arrow_key) hueDragged = false
						}}
						draggable={false}>
						<div
							tabindex="0"
							draggable={false}
							class="c-color-picker-indicator"
							style={{
								"background-color": `hsl(${hue() / 100 * 360}, 100%, 50%)`,
								top: isDisabledColorControl()? undefined : hue() + '%',
								left: isDisabledColorControl()? hue() + '%' : undefined,
								"border-color": colorContrastRatio(colorHslToRgb({h: hue() / 100, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
									? '#000'
									: '#fff',
								transform: isDisabledColorControl()? 'translate(-50%, -4px)' : 'translate(-4px, -50%)'
							}}
						/>
					</div>
					<div
						class="c-color-picker-opacity"
						ref={opacityRef}
						onPointerDown={(ev) => {
							const self = eventCurrentTarget(ev)
							opacityDragged = true
							opacityRect = elementRect(self)
							elementPointerCaptureSet(self, ev.pointerId)
							setPosition(ev.clientX, ev.clientY)
							attrSet(body, BodyAttributes.noPointerEvent)
						}}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerUp}
						onPointerCancel={onPointerUp}
						onKeyDown={(ev) => {
							const code = ev.code
							const is_arrow_key = (isDisabledColorControl()
								? code == KEY_ARROW_LEFT || code == KEY_ARROW_RIGHT
								: code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
							)

							if (!is_arrow_key) return;

							opacityDragged = true
							opacityRect = elementRect(eventCurrentTarget(ev))
							const one_percent_x = rectWidth(opacityRect) / 100
							const one_percent_y = rectHeight(opacityRect) / 100
							let x = rectLeft(opacityRect) + ((100 - opacity()) * one_percent_x)
							let y = rectTop(opacityRect) + ((100 - opacity()) * one_percent_y)

							if (code == KEY_ARROW_UP) y -= one_percent_y
							else if (code == KEY_ARROW_DOWN) y += one_percent_y
							else if (code == KEY_ARROW_LEFT) x -= one_percent_x
							else if (code == KEY_ARROW_RIGHT) x += one_percent_x

							eventPreventDefault(ev)
							setPosition(x, y)
						}}
						onKeyUp={(ev) => {
							const code = ev.code
							const is_arrow_key = (isDisabledColorControl()
								? code == KEY_ARROW_LEFT || code == KEY_ARROW_RIGHT
								: code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
							)
							if (is_arrow_key) opacityDragged = false
						}}
						draggable={false}>
						<div
							tabindex="0"
							draggable={false}
							class="c-color-picker-indicator"
							style={{
								"background-color": `hsla(0, 0%, ${opacity()}%)`,
								top: isDisabledColorControl()? undefined : (100 - opacity()) + '%',
								left: isDisabledColorControl()? (100 - opacity()) + '%' : undefined,
								"border-color": colorContrastRatio(colorHslToRgb({h: 0, s: 0, l: opacity() / 100}), {r: 0, g: 0, b: 0}) > 50
									? '#000'
									: '#fff',
								transform: isDisabledColorControl()? 'translate(-50%, -4px)' : 'translate(-4px, -50%)'
							}}
						/>
					</div>
				</div>
			</div>
		</div>)
	}

	const Input: Component = () => {
		return (<div
			class="c-color-picker-input"
			data-c-hide-opacity={attrSetIfExist(isDisabledOpacityControl())}
			onFocusOut={() => updateInputs()}>
			<TextField
				ref={r => textFieldColorRef = r}
				onInput={(ev) => onColorInputChange(eventCurrentTarget(ev).value)}
				c:label={colorSpace() == 'RGB' ? 'RGB' : colorSpace() == 'HEX' ? 'Hex' : 'HSL'}
				placeholder={colorSpace() == 'RGB' ? "0-255, 0-255, 0-255" : colorSpace() == 'HEX' ? '#FF0000' : '0-360, 0-100%, 0-100%'}
			/>
			<TextField
				onInput={(ev) => onOpacityInputChange(eventCurrentTarget(ev).value)}
				ref={r => textFieldOpacityRef = r}
				c:label="Opacity"
				value="100%"
				placeholder="0-100%"
			/>
		</div>)
	}

	const Actions: Component = () => {
		const button_colormodel_id = createUniqueId()
		const button_cancel_id = createUniqueId()
		const button_select_id = createUniqueId()

		return (<FocusableGroup
			class="c-color-picker-actions"
			c:arrowOptions={{ right: 'next', left: 'prev' }}
			data-c-disabled={attrSetIfExist(props.disabledActions)}
			onClick={(ev) => {
				const button = documentActive()!
				if (!elementValidTarget(
					eventCurrentTarget(ev),
					button,
					el => elementTagName(el) == 'BUTTON'
				)) return

				switch (elementId(button)) {
					case button_colormodel_id:
						changeColorSpace()
						break
					case button_cancel_id:
						updateColor(props.color)
						props.onClose()
						break
					case button_select_id:
						props.onSelectColor?.(getHexColor() as HEXColor)
						props.onClose()
						break
				}
			}}>
			<Button
				id={button_colormodel_id}
				c:variant={ButtonVariant.tonal}>
				{colorSpace()}
			</Button>
			<Show when={!props.disabledActions}>
				<Button
					id={button_cancel_id}
					c:variant={ButtonVariant.tonal}>
					Cancel
				</Button>
				<Button
					id={button_select_id}
					c:variant={ButtonVariant.filled}>
					Select
				</Button>
			</Show>
		</FocusableGroup>)
	}

	return (<>
		<Control />
		<Input />
		<div class="c-color-picker-content">{props.children}</div>
		<Actions />
	</>)
}

type ColorPickerProps = ModalProps & {
	'c:color'?: HEXColor
	'c:disabledOpacityControl'?: boolean
	'c:disabledColorControl'?: boolean
	'c:disabledAction'?: boolean
	'c:onUpdateColor'?(color: HEXColor): unknown
	'c:onSelectColor'?(color: HEXColor): unknown
}
const ColorPicker: ParentComponent<ColorPickerProps> = ($props) => {
	const $$props = mergeProps({
		'c:color': DEFAULT_HEX_COLOR,
		'c:disabledColorControl': false
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'c:disabledOpacityControl', 'c:onSelectColor',
		'c:disabledColorControl', 'ref', 'classList', 'c:color',
		'c:onUpdateColor', 'c:disabledAction', 'c:onToggleOpen'
	])
	const [colorPickerRef, setColorPickerRef] = createSignal<HTMLDialogElement | null>(null)
	const [isColorPickerOpen, setIsColorPickerOpen] = createSignal<boolean>(false)

	return (<Modal
		ref={mergeRefs(props.ref, r => setColorPickerRef(r))}
		c:onToggleOpen={o => {
			setIsColorPickerOpen(o)
			props["c:onToggleOpen"]?.(o)
		}}
		classList={{
			'c-color-picker': true,
			...props.classList
		}}
		{...other}>
		<Show when={colorPickerRef() != null}>
			<ColorPickerBody
				element={colorPickerRef()!}
				isColorPickerOpen={isColorPickerOpen()}
				onClose={() => closeModal(colorPickerRef()!)}
				color={props['c:color']}
				disabledActions={props['c:disabledAction']}
				disabledColorControl={props['c:disabledColorControl']}
				disabledOpacityControl={props['c:disabledOpacityControl']}
				onSelectColor={props['c:onSelectColor']}
				onUpdateColor={props['c:onUpdateColor']}>
				{props.children}
			</ColorPickerBody>
		</Show>
	</Modal>)
}

type PopoverColorPickerProps = PopoverProps & {
	'c:color'?: HEXColor
	'c:disabledOpacityControl'?: boolean
	'c:disabledColorControl'?: boolean
	'c:disabledAction'?: boolean
	'c:onUpdateColor'?(color: HEXColor): unknown
	'c:onSelectColor'?(color: HEXColor): unknown
}
const PopoverColorPicker: ParentComponent<PopoverColorPickerProps> = ($props) => {
	const $$props = mergeProps({
		'c:color': DEFAULT_HEX_COLOR,
		'c:disabledColorControl': false
	}, $props)
	const [props, other] = splitProps($$props, [
		'children', 'c:disabledOpacityControl', 'c:onSelectColor',
		'c:disabledColorControl', 'ref', 'classList', 'c:color',
		'c:onUpdateColor', 'c:disabledAction', 'c:onToggleOpen'
	])
	const [colorPickerRef, setColorPickerRef] = createSignal<HTMLDivElement | null>(null)
	const [isColorPickerOpen, setIsColorPickerOpen] = createSignal<boolean>(false)

	return (<Popover
		ref={mergeRefs(props.ref, r => setColorPickerRef(r))}
		c:onToggleOpen={o => {
			setIsColorPickerOpen(o)
			props["c:onToggleOpen"]?.(o)
		}}
		classList={{
			'c-color-picker': true,
			...props.classList
		}}
		{...other}>
		<Show when={colorPickerRef() != null}>
			<ColorPickerBody
				element={colorPickerRef()!}
				isColorPickerOpen={isColorPickerOpen()}
				onClose={() => closePopover(colorPickerRef()!)}
				color={props['c:color']}
				disabledActions={props['c:disabledAction']}
				disabledColorControl={props['c:disabledColorControl']}
				disabledOpacityControl={props['c:disabledOpacityControl']}
				onSelectColor={props['c:onSelectColor']}
				onUpdateColor={props['c:onUpdateColor']}>
				{props.children}
			</ColorPickerBody>
		</Show>
	</Popover>)
}

export {
	ColorPicker,
	PopoverColorPicker,
	changeColorPickerValue as changeColorPickerValue,
	changeColorPickerValue as changePopoverColorPickerValue,
	openColorPicker,
	openPopoverColorPicker,
	isModalOpen as isColorPickerOpen,
	focusModal as focusColorPicker,
	closeModal as closeColorPicker,
	repositionModal as repositionColorPicker,
	isPopoverOpen as isPopoverColorPickerOpen,
	closePopover as closePopoverColorPicker,
	repositionPopover as repositionPopoverColorPicker,
	ColorPickerPosition,
	ColorPickerPosition as PopoverColorPickerPosition,
	ColorPickerEvents
}
export type {
	ColorPickerProps,
	PopoverColorPickerProps,
}
export default ColorPicker