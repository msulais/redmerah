import { type Component, type ParentComponent, Show, batch, createEffect, createMemo, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps } from "solid-js"
import { mergeRefs } from "@solid-primitives/refs"

import type { HEXColor, HSLColor, RGBColor } from "@/types/color"
import { setAttrIfExist } from "@/utils/attributes"
import { isTargetValidElement } from "@/utils/element"
import { BodyAttributes } from "@/enums/attributes"
import { Math_clamp } from "@/utils/math"
import { isNumberNotDefined, safeNumber } from "@/utils/number"
import { colorContrastRatio, hexToHsl, hexToRgb, hslToHex, hslToHsv, hslToRgb, hsvToHsl, isColorValidWithAlpha, rgbToHsl } from "@/utils/color"
import { KEY_ARROW_DOWN, KEY_ARROW_LEFT, KEY_ARROW_RIGHT, KEY_ARROW_UP } from "@/constants/key-code"

import Button, { ButtonVariant } from "@/components/Button"
import TextField from "@/components/TextField"
import Modal, { type ModalProps, ModalPosition as ColorPickerPosition, type ModalOpenOptions, openModal, closeModal, focusModal, isModalOpen, repositionModal } from "@/components/Modal"
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
	options?: Omit<ModalOpenOptions, 'event'> & { color?: HEXColor }
): void {
	if (options?.color != null) updateColorPickerValue(colorPicker, options.color)

	openModal(colorPicker, options)
}

function openPopoverColorPicker(
	colorPicker: HTMLDivElement,
	options?: Omit<ModalOpenOptions, 'event'> & { color?: HEXColor }
): void {
	if (options?.color != null) updateColorPickerValue(colorPicker, options.color)

	openPopover(colorPicker, options)
}

function updateColorPickerValue(
	colorPicker: HTMLDivElement | HTMLDialogElement,
	color: HEXColor
): void {
	colorPicker.dispatchEvent(new CustomEvent(
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
	const body = document.body
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
				const hsl = hsvToHsl({
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
			: Math.round(opacity() / 100 * 255).toString(16).padStart(2, '0')
		;
		const hex_color = (hslToHex(getHSLColor()) + $opacity).toUpperCase()
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
			const {s, v} = hslToHsv(hsl())
			left = s * 100
			top = (1 - v) * 100
		}

		if (opacity) setOpacity(Math_clamp(opacity, 0, 1) * 100)

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
			const rgb = hslToRgb(getHSLColor())
			textFieldColorRef.value = `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
			break
		case "HSL":
			textFieldColorRef.value = [
				Math.round(getHSLColor().h * 360),
				Math.round(getHSLColor().s * 100) + '%',
				Math.round(getHSLColor().l * 100) + '%',
			].join(', ')
			break
		case "HEX":
			textFieldColorRef.value = getHexColor().substring(0, 7)
			break
		}

		if (textFieldOpacityRef) textFieldOpacityRef.value = Math.round(opacity()) + '%'
	}

	function setPosition(x: number, y: number): void {
		if (colorDragged) {
			x = (x - colorRect.left) / colorRect.width * 100
			x = Math_clamp(x, 0, 100)
			setLeft(x)

			y = (y - colorRect.top) / colorRect.height * 100
			y = Math_clamp(y, 0, 100)
			setTop(y)
		}
		else if (hueDragged) {
			let v = isDisabledColorControl()? x : y
			let rectOffset = isDisabledColorControl()? hueRect.left : hueRect.top
			let rectSize = isDisabledColorControl()? hueRect.width : hueRect.height
			v = (v - rectOffset) / rectSize * 100
			v = Math_clamp(v, 0, 100)
			setHue(v)
		}
		else if (opacityDragged) {
			let v = isDisabledColorControl()? x : y
			let rect_offset = isDisabledColorControl()? opacityRect.left : opacityRect.top
			let rect_size = isDisabledColorControl()? opacityRect.width : opacityRect.height
			v = (v - rect_offset) / rect_size * 100
			v = Math_clamp(v, 0, 100)
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
		if (colorDragged) colorRef?.releasePointerCapture(pointerId)
		if (opacityDragged) opacityRef?.releasePointerCapture(pointerId)
		if (hueDragged) hueRef?.releasePointerCapture(pointerId)

		colorDragged = hueDragged = opacityDragged = false
		// should be run last because <Modal> will mark this to close
		// when mouse position outside
		setTimeout(() => body.removeAttribute(BodyAttributes.noPointerEvent))
	}

	function onChangeColor(ev: CustomEvent<HEXColor>): void {
		const color = ev.detail
		if (!isColorValidWithAlpha(color)) return;
		updateColor(color)
	}

	function initEvents() {
		props.element.addEventListener(ColorPickerEvents.changecolor as any, onChangeColor)

		onCleanup(() => {
			props.element.removeEventListener(ColorPickerEvents.changecolor as any, onChangeColor)
		})
	}

	function updateColor(color: HEXColor): void {
		if (!isColorValidWithAlpha(color)) return;
		const hsl = hexToHsl(
			color.substring(0, 7) as HEXColor
		)
		setHsl({...hsl})

		if (color.length == 9 && !isDisabledOpacityControl()) {
			const opacity = Number.parseInt(color.substring(7, 9), 16) / 255
			setOpacity(Math.round(opacity * 100))
		}

		if (isDisabledColorControl()) setHsl({ h: hsl.h, s: 1, l: 0.5 })

		updateInputs()
		updatePosition()
	}

	function onColorInputChange(value: string): void {
		switch (colorSpace()) {
		case "RGB": {
			const rgb: RGBColor = { r: 0, g: 0, b: 0 }
			const rgbArray: string[] = value.replace(/[^0-9,.]/g, '').split(',')
			while (rgbArray.length < 3) rgbArray.push('0')

			const parse = (value: string | number): number => {
				value = Number.parseInt(`${value}`)
				value = safeNumber(value, 0)
				value = Math_clamp(value, 0, 255)
				value = value / 0xff
				return value as number
			}

			rgb.r = parse(rgbArray[0])
			rgb.g = parse(rgbArray[1])
			rgb.b = parse(rgbArray[2])

			const hsl = rgbToHsl(rgb)
			if (isDisabledColorControl()) {
				hsl.s = 1
				hsl.l = 0.5
			}

			setHsl(hsl)
			break
		}
		case "HSL": {
			const hsl: HSLColor = { h: 0, s: 0, l: 0 }
			const hslArray: string[] = value.replace(/[^0-9,.]/g, '').split(',')
			while (hslArray.length < 3) hslArray.push("0")

			let $value: number = Number.parseFloat(hslArray[0])
			$value = safeNumber($value, 0)
			$value = Math_clamp($value, 0, 360)

			hsl.h = $value / 360

			$value = Number.parseFloat(hslArray[1])
			$value = safeNumber($value, 0)
			$value = Math_clamp($value, 0, 100)

			hsl.s = $value / 100

			$value = Number.parseFloat(hslArray[2])
			$value = safeNumber($value, 0)
			$value = Math_clamp($value, 0, 100)

			hsl.l = $value / 100

			if (isDisabledColorControl()) {
				hsl.s = 1
				hsl.l = 0.5
			}
			setHsl(hsl)
			break
		}
		case "HEX": {
			value = value.replace(/[^0-9a-fA-F]/g, '')
			if (value.trim().length == 0) value = '0'

			const $value: number = Math_clamp(
				safeNumber(Number.parseInt(value, 16), 0),
				0, 0xffffff
			)
			value = `${$value.toString(16)}`.padStart(6, '0').substring(0, 6)

			const hsl = rgbToHsl(hexToRgb(('#' + value) as HEXColor))
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
		let $opacity: number = Number.parseFloat(value)
		if (isNumberNotDefined($opacity)) return

		$opacity = Math.round(Math_clamp($opacity, 0, 100))
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
			if (!isColorValidWithAlpha(localColor)) return

			let hsl = hexToHsl(localColor)
			let opacity = 100
			if ($isDisabledColorControl) {
				hsl = {h: hsl.h, s: 1, l: 0.5}
			}

			if (localColor.length > 7 && !$isDisabledOpacityControl) {
				opacity = safeNumber(Number.parseInt(localColor.substring(7, 9), 16))
				opacity = opacity / 0xff * 100
				opacity = Math_clamp(opacity, 0, 100)
			}

			if (textFieldColorRef) {
				let text = ''
				if (localColorSpace == 'HSL') text = [
					Math.round(hsl.h * 360),
					Math.round(hsl.s * 100) + '%',
					Math.round(hsl.l * 100) + '%',
				].join(', ')
				else if (localColorSpace == 'HEX') {
					text = hslToHex(hsl).toUpperCase()
				}
				else if (localColorSpace == 'RGB') {
					const {r, g, b} = hslToRgb(hsl)
					text = [
						Math.round(r * 0xff),
						Math.round(g * 0xff),
						Math.round(b * 0xff),
					].join(', ')
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
				if (localColorSpace == 'HSL') text = [
					Math.round(hsl.h * 360),
					Math.round(hsl.s * 100) + '%',
					Math.round(hsl.l * 100) + '%',
				].join(', ')
				else if (localColorSpace == 'HEX') {
					text = hslToHex(hsl).toUpperCase()
				}
				else if (localColorSpace == 'RGB') {
					const {r, g, b} = hslToRgb(hsl)
					text = [
						Math.round(r * 0xff),
						Math.round(g * 0xff),
						Math.round(b * 0xff),
					].join(', ')
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

		batch(() => {
			handleColor()
			handleDisableColorControl()
			handleDisableOpacityControl()
		})
	})

	const Control: Component = () => {
		return (<div
			class="c-color-picker-control"
			data-c-hide-color={setAttrIfExist(isDisabledColorControl())}>
			<div
				class="c-color-picker-color"
				ref={colorRef}
				style={{ '--c-color-picker-color': hslToHex({...hsl(), s: 1, l: .5}) }}
				onPointerDown={(ev) => {
					const self = ev.currentTarget
					colorDragged = true
					colorRect = self.getBoundingClientRect()
					self.setPointerCapture(ev.pointerId)
					setPosition(ev.clientX, ev.clientY)
					body.setAttribute(BodyAttributes.noPointerEvent, '')
				}}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
				data-c-hsl={setAttrIfExist(colorSpace() == 'HSL')}
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
					colorRect = ev.currentTarget.getBoundingClientRect()
					const onePercentX = colorRect.width / 100
					const onePercentY = colorRect.height / 100
					let x = colorRect.left + (left() * onePercentX)
					let y = colorRect.top + (top() * onePercentY)

					if (keyUpPressed) y -= onePercentY
					if (keyDownPressed) y += onePercentY
					if (keyLeftPressed) x -= onePercentX
					if (keyRightPressed) x += onePercentX

					ev.preventDefault()
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
						"background-color": hslToHex(hsl()),
						top: top() + '%',
						left: left() + '%',
						"border-color": colorContrastRatio(hslToRgb(getHSLColor()), {r: 0, g: 0, b: 0}) > 50
							? '#000'
							: '#fff',
						transform: 'translate(-12px, -12px)',
					}}
				/>
			</div>
			<div>
				<div
					data-c-hide-color={setAttrIfExist(isDisabledColorControl())}
					data-c-hide-opacity={setAttrIfExist(isDisabledOpacityControl())}
					class="c-color-picker-selected-color"
					style={{ 'background-color': getHexColor() }}
				/>
				<div
					class="c-color-picker-range"
					data-c-hide-color={setAttrIfExist(isDisabledColorControl())}
					data-c-hide-opacity={setAttrIfExist(isDisabledOpacityControl())}>
					<div
						class="c-color-picker-hue"
						ref={hueRef}
						onPointerDown={(ev) => {
							const self = ev.currentTarget
							hueDragged = true
							hueRect = self.getBoundingClientRect()
							self.setPointerCapture(ev.pointerId)
							setPosition(ev.clientX, ev.clientY)
							body.setAttribute(BodyAttributes.noPointerEvent, '')
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
							hueRect = ev.currentTarget.getBoundingClientRect()
							const one_percent_x = hueRect.width / 100
							const one_percent_y = hueRect.height / 100
							let x = hueRect.left + (hue() * one_percent_x)
							let y = hueRect.top + (hue() * one_percent_y)

							if (code == KEY_ARROW_UP) y -= one_percent_y
							else if (code == KEY_ARROW_DOWN) y += one_percent_y
							else if (code == KEY_ARROW_LEFT) x -= one_percent_x
							else if (code == KEY_ARROW_RIGHT) x += one_percent_x

							ev.preventDefault()
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
								"border-color": colorContrastRatio(hslToRgb({h: hue() / 100, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
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
							const self = ev.currentTarget
							opacityDragged = true
							opacityRect = self.getBoundingClientRect()
							self.setPointerCapture(ev.pointerId)
							setPosition(ev.clientX, ev.clientY)
							body.setAttribute(BodyAttributes.noPointerEvent, '')
						}}
						onPointerMove={onPointerMove}
						onPointerUp={onPointerUp}
						onPointerCancel={onPointerUp}
						onKeyDown={(ev) => {
							const code = ev.code
							const isArrowKey = (isDisabledColorControl()
								? code == KEY_ARROW_LEFT || code == KEY_ARROW_RIGHT
								: code == KEY_ARROW_UP || code == KEY_ARROW_DOWN
							)

							if (!isArrowKey) return;

							opacityDragged = true
							opacityRect = ev.currentTarget.getBoundingClientRect()
							const onePercentX = opacityRect.width / 100
							const onePercentY = opacityRect.height / 100
							let x = opacityRect.left + ((100 - opacity()) * onePercentX)
							let y = opacityRect.top + ((100 - opacity()) * onePercentY)

							if (code == KEY_ARROW_UP) y -= onePercentY
							else if (code == KEY_ARROW_DOWN) y += onePercentY
							else if (code == KEY_ARROW_LEFT) x -= onePercentX
							else if (code == KEY_ARROW_RIGHT) x += onePercentX

							ev.preventDefault()
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
								"border-color": colorContrastRatio(hslToRgb({h: 0, s: 0, l: opacity() / 100}), {r: 0, g: 0, b: 0}) > 50
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
			data-c-hide-opacity={setAttrIfExist(isDisabledOpacityControl())}
			onFocusOut={() => updateInputs()}>
			<TextField
				ref={r => textFieldColorRef = r}
				onInput={(ev) => onColorInputChange(ev.currentTarget.value)}
				c:label={colorSpace() == 'RGB' ? 'RGB' : colorSpace() == 'HEX' ? 'Hex' : 'HSL'}
				placeholder={colorSpace() == 'RGB' ? "0-255, 0-255, 0-255" : colorSpace() == 'HEX' ? '#FF0000' : '0-360, 0-100%, 0-100%'}
			/>
			<TextField
				onInput={(ev) => onOpacityInputChange(ev.currentTarget.value)}
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
			data-c-disabled={setAttrIfExist(props.disabledActions)}
			onClick={(ev) => {
				const button = document.activeElement!
				if (!isTargetValidElement(
					ev.currentTarget,
					button,
					el => el.tagName == 'BUTTON'
				)) return

				switch (button.id) {
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
	updateColorPickerValue as updateColorPickerValue,
	updateColorPickerValue as updatePopoverColorPickerValue,
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