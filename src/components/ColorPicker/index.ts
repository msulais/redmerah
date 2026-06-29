import {
	type HEXColor,
	type HSLColor
} from "@/types/color"
import {
	colorContrastPercentage,
	hexToHsl,
	hslToHex,
	hslToHsv,
	hslToRgb,
	hsvToHsl,
	isColorValidWithAlpha,
	rgbToHsl
} from "@/utils/color"
import { safeNumber } from "@/utils/number"
import { Math_clamp } from "@/utils/math"
import { createElementId } from "@/utils/ids"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEasing } from "@/enums/animation"
import {
	type EyeDropper as EyeDropperInterface
} from "@/interfaces/eye-dropper"
import { isValidEnumValue } from "@/utils/object"
import {
	CPopover as GCPopover,
	type PopoverProps,
} from "@/components/Popover"
import { IconCodes } from "@/enums/icons"
import { KeyboardValue } from "@/enums/keyboard"
import { pxToRem } from "@/utils/css"
import { CButton as GCButton, type IconButtonProps } from "../Button"
import { CTextField as GCTextField, type TextFieldButtonProps, type TextFieldProps } from "../TextField"
import { CIcon as GCIcon, type IconProps } from "../Icon"
import { $add_event, $children, $classlist, $create, $get_attr, $has_attr, $is_array, $is_bool, $is_false, $is_string, $parse_int, $query, $rm_attr, $rm_event, $round, $set_attr, $set_style, $toggle_attr } from "../utils"

// type Nullable<T> = T | null
// const $is_string = (e: any) => typeof e === 'string'
// const $is_array = (e: any) => Array.isArray(e)
// const $is_false = (e: any) => e === false
// const $is_bool = (e: any) => typeof e === 'boolean'
// const $rm_attr = (ref?: Element, name?: string) => name && ref?.removeAttribute(name)
// const $get_attr = (ref?: Element, name?: string) => name && ref?.getAttribute(name)
// const $has_attr = (ref?: Element, name?: string) => Boolean(name && ref?.hasAttribute(name))
// const $set_attr = (
// 	(ref?: Nullable<Element>, name?: string, value?: string) =>
// 	name && value && ref?.setAttribute(name, value)
// )
// const $toggle_attr = (
// 	(ref?: Element, name?: string, force?: boolean) =>
// 	name && $is_bool(force) && ref?.toggleAttribute(name, force)
// )
// const $query = (
// 	<T extends HTMLElement>(selector: string, from?: Element) =>
// 	(from ?? document).querySelector<T>(selector)
// )
// const $create = (
// 	<T extends keyof HTMLElementTagNameMap>(tagName: T) =>
// 	document.createElement(tagName)
// )
// const $children = (
// 	(ref?: Nullable<Element>, ...children: (Node | string)[]) =>
// 	ref?.replaceChildren(...children)
// )
// const $classlist = (
// 	(ref?: Nullable<Element>, ...classes: string[]) =>
// 	ref?.classList.add(...classes)
// )
// const $round = (v: number) => Math.round(v)
// const $add_event = (
// 	<T extends Event = Event>(ref?: any, type?: string, callback?: (e: T) => unknown) =>
// 	ref.addEventListener(type, callback)
// )
// const $rm_event = (
// 	<T extends Event = Event>(ref?: any, type?: string, callback?: (e: T) => unknown) =>
// 	ref.removeEventListener(type, callback)
// )
// const $parse_int = (v: string, radix?: number) => Number.parseInt(v, radix)
// const $set_style = (
// 	(ref?: Nullable<HTMLElement>, name?: string, value?: string) =>
// 	name && value && ref?.style.setProperty(name, value)
// )

export type ColorPickerProps = PopoverProps & {
	ColorPickerValue               ?: HEXColor
	ColorPickerDisabledOpacity     ?: boolean
	ColorPickerHueOnly             ?: boolean
	ColorPickerColorSpace          ?: CColorPicker.ColorSpace
	ColorPickerContentAttr         ?: astroHTML.JSX.HTMLAttributes
	ColorPickerRectAttr            ?: astroHTML.JSX.HTMLAttributes
	ColorPickerOptionsAttr         ?: astroHTML.JSX.HTMLAttributes
	ColorPickerPreviewAttr         ?: astroHTML.JSX.HTMLAttributes
	ColorPickerEyeDropperAttr      ?: IconButtonProps
	ColorPickerSliderAttr          ?: astroHTML.JSX.HTMLAttributes
	ColorPickerSliderHueAttr       ?: astroHTML.JSX.InputHTMLAttributes
	ColorPickerSliderOpacityAttr   ?: astroHTML.JSX.InputHTMLAttributes
	ColorPickerInputAttr           ?: astroHTML.JSX.HTMLAttributes
	ColorPickerLabelAttr           ?: astroHTML.JSX.HTMLAttributes
	ColorPickerLabelColorAttr      ?: astroHTML.JSX.LabelHTMLAttributes
	ColorPickerLabelOpacityAttr    ?: astroHTML.JSX.LabelHTMLAttributes
	ColorPickerTextFieldAttr       ?: astroHTML.JSX.HTMLAttributes
	ColorPickerTextFieldColorAttr  ?: TextFieldProps
	ColorPickerTextFieldOpacityAttr?: TextFieldProps
	ColorPickerSwapAttr            ?: TextFieldButtonProps
	ColorPickerSwapIconAttr        ?: IconProps
}

export namespace CColorPicker {
	export type CElement = GCPopover.CElement
	export type UpdateOptions = GCPopover.UpdateOptions & {
		ColorPicker?: {
			value          ?: HEXColor | boolean
			disabledOpacity?: boolean
			hueOnly        ?: boolean
			colorSpace     ?: ColorSpace | boolean
			children       ?: (string | Node)[] | boolean
			refs           ?: {
				colorpicker     ?(ref: HTMLDivElement): unknown
				content         ?(ref: HTMLDivElement): unknown
				eyedropper      ?(ref: GCButton.CIcon.CElement): unknown
				input           ?(ref: HTMLDivElement): unknown
				labelColor      ?(ref: HTMLLabelElement): unknown
				labelOpacity    ?(ref: HTMLLabelElement): unknown
				options         ?(ref: HTMLDivElement): unknown
				preview         ?(ref: HTMLDivElement): unknown
				rect            ?(ref: HTMLDivElement): unknown
				slider          ?(ref: HTMLDivElement): unknown
				sliderHue       ?(ref: HTMLInputElement): unknown
				sliderOpacity   ?(ref: HTMLInputElement): unknown
				swap            ?(ref: GCTextField.CButton.CElement): unknown
				swapIcon        ?(ref: GCIcon.CElement): unknown
				textfield       ?(ref: HTMLDivElement): unknown
				textfieldColor  ?(ref: GCTextField.CElement): unknown
				textfieldOpacity?(ref: GCTextField.CElement): unknown
			}
		}
	}

	type EventDetails = {
		update: {
			color: HEXColor
		}
	}

	export enum Attributes {
		DisabledOpacity = 'data-c-colorpicker-disabled-opacity',
		Value           = 'data-c-colorpicker-value',
		HueOnly         = 'data-c-colorpicker-hueonly',
		ColorSpace      = 'data-c-colorpicker-colorspace'
	}

	export enum Classes {
		Colorpicker      = 'c-colorpicker',
		Content          = Colorpicker + '-content',
		Rect             = Colorpicker + '-rect',
		Options          = Colorpicker + '-options',
		Preview          = Colorpicker + '-preview',
		Eyedropper       = Colorpicker + '-eyedropper',
		Slider           = Colorpicker + '-slider',
		Input            = Colorpicker + '-input',
		Label            = Colorpicker + '-label',
		Textfield        = Colorpicker + '-textfield',
		Swap             = Colorpicker + '-swap',
		SwapIcon         = Swap        + '-icon',
		SliderHue        = Slider      + '-hue',
		SliderOpacity    = Slider      + '-opacity',
		LabelColor       = Label       + '-color',
		LabelOpacity     = Label       + '-opacity',
		TextfieldColor   = Textfield   + '-color',
		TextfieldOpacity = Textfield   + '-opacity'
	}

	export enum Events {
		/** `!bubbles | !cancelable | !detail` */
		Input  = 'colorpicker:input',

		/** `!bubbles | !cancelable | !detail` */
		Change = 'colorpicker:change',

		/** ATTENTION: Don't use this event. It was meant for update in
		 * `updateColorPickerRef()`.
		 *
		 * `!bubbles | !cancelable | detail` */
		Update = 'colorpicker:update'
	}

	export enum CSSVars {
		SliderHueBorderColor = '--c-colorpicker-slider-hue-border-color',
		Color                = '--c-colorpicker-color',
		ColorWithAlpha       = '--c-colorpicker-color-with-alpha',
		Hue                  = '--c-colorpicker-hue-color',
		RectBorderColor      = '--c-colorpicker-rect-border-color',
		RectX                = '--c-colorpicker-rect-x',
		RectY                = '--c-colorpicker-rect-y',
	}

	export enum ColorSpace {
		RGB = 'rgb',
		HSL = 'hsl',
		HEX = 'hex'
	}

	const REGISTERED_COLORPICKER: Set<CElement> = new Set<CElement>()

	function initColorPicker(ref_colorPicker: CElement): void {
		const attributes = {
			get value(): HEXColor {
				return ($get_attr(ref_colorPicker, Attributes.Value) ?? '#FF0000') as HEXColor
			},
			get disabledOpacity(): boolean {
				return $has_attr(ref_colorPicker, Attributes.DisabledOpacity)
			},
			get hueOnly(): boolean {
				return $has_attr(ref_colorPicker, Attributes.HueOnly)
			},
			get colorSpace(): ColorSpace {
				const space = $get_attr(ref_colorPicker, Attributes.ColorSpace)
				return isValidEnumValue(space, ColorSpace)
					? (space as ColorSpace)
					: ColorSpace.HEX
			}
		}
		const hsla: (HSLColor & {a: number}) = {h: 0, s: 1, l: 0.5, a: 1}
		let startColor = '#FF0000'
		let isHueOnly = false
		let isDisabledOpacity = false
		let rectX = 0
		let rectY = 0
		let colorSpace: ColorSpace = ColorSpace.HEX
		let rectRect: DOMRect | null = null
		let rectDragging = false
		let ref_rect: HTMLDivElement | null = null
		let ref_eyeDropper: GCButton.CIcon.CElement | null = null
		let ref_labelColor: HTMLLabelElement | null = null
		let ref_labelOpacity: HTMLLabelElement | null = null
		let ref_inputColor: HTMLInputElement | null = null
		let ref_inputOpacity: HTMLInputElement | null = null
		let ref_swap: GCTextField.CButton.CElement | null = null
		let ref_sliderHue: HTMLInputElement | null = null
		let ref_sliderOpacity: HTMLInputElement | null = null

		function updateColor(options?: {
			rect?: boolean
			sliderHue?: boolean
			sliderOpacity?: boolean
			inputColor?: boolean
			inputOpacity?: boolean
			inputEvent?: boolean
			valueAttribute?: boolean
		}): void {
			if (isDisabledOpacity) {
				hsla.a = 1
			}
			if (isHueOnly) {
				hsla.s = 1
				hsla.l = 0.5
			}

			const hexColor = hslToHex(hsla).toUpperCase()
			const hexColorWithAlpha = hexColor + $round(hsla.a * 0xff).toString(16).padStart(2, '0').toUpperCase()
			const hueHexColor = hslToHex({h: hsla.h, s: 1, l: 0.5}).toUpperCase()
			requestAnimationFrame(() => {
				$set_style(ref_colorPicker, CSSVars.Color, hexColor)
				$set_style(ref_colorPicker, CSSVars.ColorWithAlpha, hexColorWithAlpha)
				$set_style(ref_colorPicker, CSSVars.Hue, hueHexColor)
				$set_style(ref_colorPicker,
					CSSVars.RectBorderColor,
					colorContrastPercentage(hslToRgb(hsla), {r: 0, g: 0, b: 0}) > 50
						? '#000' : '#fff'
				)
				$set_style(ref_colorPicker,
					CSSVars.SliderHueBorderColor,
					colorContrastPercentage(hslToRgb({...hsla, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
						? '#000' : '#fff'
				)
			})
			if (options?.rect ?? true) {
				rectX = 0
				rectY = 0
				if (colorSpace === ColorSpace.HSL) {
					rectX = hsla.s * 100
					rectY = (1 - hsla.l) * 100
				} else {
					const hsv = hslToHsv(hsla)
					rectX = hsv.s * 100
					rectY = (1 - hsv.v) * 100
				}

				requestAnimationFrame(() => {
					$set_style(ref_colorPicker, CSSVars.RectX, rectX + '%')
					$set_style(ref_colorPicker, CSSVars.RectY, rectY + '%')
				})
			}
			if ((options?.sliderHue ?? true) && ref_sliderHue) {
				const hue = $round(hsla.h * 360)
				ref_sliderHue.value = hue + ''
			}

			if ((options?.sliderOpacity ?? true) && ref_sliderOpacity) {
				const opacity = $round(hsla.a * 100)
				ref_sliderOpacity.value = opacity + ''
			}

			if ((options?.inputColor ?? true) && ref_inputColor) {
				let text = ''
				let placeholder = ''
				let name = ''
				switch (colorSpace) {
				case ColorSpace.RGB:
					const rgb = hslToRgb(hsla)
					text = [
						$round(rgb.r * 0xff),
						$round(rgb.g * 0xff),
						$round(rgb.b * 0xff),
					].join(', ')
					placeholder = '0-255, 0-255, 0-255'
					name = 'RGB:'
					break
				case ColorSpace.HSL:
					text = [
						$round(hsla.h * 360) + '°',
						$round(hsla.s * 100) + '%',
						$round(hsla.l * 100) + '%',
					].join(', ')
					placeholder = '0-360°, 0-100%, 0-100%'
					name = 'HSL:'
					break
				case ColorSpace.HEX:
					text = hexColor
					placeholder = '#RRGGBB'
					name = 'HEX:'
					break
				}

				ref_inputColor.value = text
				ref_inputColor.placeholder = placeholder
				if (ref_labelColor && ref_labelColor.textContent !== name) {
					ref_labelColor.textContent = name
					if (isAnimationAllowed()) {
						ref_labelColor.animate({
							opacity: [0, 1],
							translate: [`0 ${pxToRem(8)}rem`, '0 0'],
						}, {duration: 300, easing: AnimationEasing.Spring})
					}
				}
			}

			if ((options?.inputOpacity ?? true) && ref_inputOpacity) {
				const opacity = $round(hsla.a * 100)
				ref_inputOpacity.value = opacity + '%'
			}

			if (options?.valueAttribute ?? true) {
				const hex = hsla.a < 1? hexColorWithAlpha : hexColor
				$set_attr(ref_colorPicker, Attributes.Value, hex)
			}

			if (options?.inputEvent ?? true) {
				ref_colorPicker.dispatchEvent(new CustomEvent(Events.Input))
			}
		}

		function updateRectPosition(x: number, y: number): void {
			x = (x - rectRect!.left) / rectRect!.width * 100
			y = (y - rectRect!.top) / rectRect!.height * 100
			rectX = Math_clamp(x, 0, 100)
			rectY = Math_clamp(y, 0, 100)
			requestAnimationFrame(() => {
				$set_style(ref_colorPicker, CSSVars.RectX, rectX + '%')
				$set_style(ref_colorPicker, CSSVars.RectY, rectY + '%')
			})

			if (colorSpace === ColorSpace.HSL) {
				hsla.s = rectX / 100
				hsla.l = 1 - (rectY / 100)
			} else {
				const hsl = hsvToHsl({h: hsla.h, s: rectX / 100, v: 1 - (rectY / 100)})
				hsla.s = hsl.s
				hsla.l = hsl.l
			}

			updateColor({
				rect: false,
				inputOpacity: false,
				sliderOpacity: false,
				sliderHue: false,
			})
		}

		function ref_inputColor_onBlur(): void {
			updateColor({
				inputEvent: false,
				valueAttribute: false
			})
		}

		function ref_inputColor_onInput(): void {
			let value = ref_inputColor!.value
			let hsl: HSLColor = {h: 0, s: 1, l: 0.5}
			switch (colorSpace) {
			case ColorSpace.RGB: {
				value = value.replace(/[^\d,]/g, '').trim()
				const rgbArr: number[] = (value
					.split(',')
					.map(v => Math_clamp(safeNumber($parse_int(v)), 0, 0xff) / 0xff)
				)
				while (rgbArr.length < 3) rgbArr.push(0)
				hsl = rgbToHsl({
					r: rgbArr[0]!,
					g: rgbArr[1]!,
					b: rgbArr[2]!,
				})
				break
			}
			case ColorSpace.HSL:
				value = value.replace(/[^\d,]/g, '').trim()
				const hslArr: number[] = (value
					.split(',')
					.map((v, i) => Math_clamp(
						safeNumber($parse_int(v)),
						0,
						i === 0? 360 : 100
					) / (i === 0? 360 : 100))
				)
				while (hslArr.length < 3) hslArr.push(0)

				hsl.h = hslArr[0]!
				hsl.s = hslArr[1]!
				hsl.l = hslArr[2]!
				break
			case ColorSpace.HEX:
				value = '#' + value.replace(/[^\da-fA-F]/g, '').padEnd(6, '0').substring(0, 6).trim()
				hsl = hexToHsl(value as HEXColor)
				break
			}

			hsla.h = hsl.h
			hsla.s = hsl.s
			hsla.l = hsl.l
			updateColor({inputColor: false})
		}

		function ref_inputOpacity_onBlur(): void {
			ref_inputOpacity!.value = $round(hsla.a * 100) + '%'
		}

		function ref_inputOpacity_onInput(): void {
			const value = Math_clamp(
				safeNumber($parse_int(ref_inputOpacity!.value), hsla.a * 100),
				0,
				100
			)
			hsla.a = value / 100
			updateColor({
				inputOpacity: false
			})
		}

		function ref_rect_onKeyDown(ev: KeyboardEvent): void {
			const key = ev.key
			switch (key) {
			case KeyboardValue.ArrowRight:
				++rectX
				break
			case KeyboardValue.ArrowLeft:
				--rectX
				break
			case KeyboardValue.ArrowDown:
				++rectY
				break
			case KeyboardValue.ArrowUp:
				--rectY
				break
			}
			rectX = Math_clamp(rectX, 0, 100)
			rectY = Math_clamp(rectY, 0, 100)
			requestAnimationFrame(() => {
				$set_style(ref_colorPicker, CSSVars.RectX, rectX + '%')
				$set_style(ref_colorPicker, CSSVars.RectY, rectY + '%')
			})

			if (colorSpace === ColorSpace.HSL) {
				hsla.s = rectX / 100
				hsla.l = 1 - (rectY / 100)
			} else {
				const hsl = hsvToHsl({h: hsla.h, s: rectX / 100, v: 1 - (rectY / 100)})
				hsla.s = hsl.s
				hsla.l = hsl.l
			}

			updateColor({
				rect: false,
				inputOpacity: false,
				sliderOpacity: false,
				sliderHue: false,
			})
		}

		function ref_rect_onPointerDown(ev: PointerEvent): void {
			ref_rect?.setPointerCapture(ev.pointerId)
			rectRect = ref_rect!.getBoundingClientRect()
			updateRectPosition(ev.x, ev.y)
			rectDragging = true
		}

		function ref_rect_onPointerMove(ev: PointerEvent): void {
			if (!rectDragging) return

			updateRectPosition(ev.x, ev.y)
		}

		function ref_rect_onPointerUp(ev: PointerEvent): void {
			ref_rect?.releasePointerCapture(ev.pointerId)
			rectDragging = false
		}

		function ref_swap_onClick(): void {
			switch (colorSpace) {
			case ColorSpace.RGB:
				colorSpace = ColorSpace.HSL
				break
			case ColorSpace.HSL:
				colorSpace = ColorSpace.HEX
				break
			case ColorSpace.HEX:
				colorSpace = ColorSpace.RGB
				break
			}

			$set_attr(ref_colorPicker, Attributes.ColorSpace, colorSpace)
			updateColor({
				inputColor: true,
				inputEvent: false,
				inputOpacity: false,
				rect: true,
				sliderHue: false,
				sliderOpacity: false,
				valueAttribute: false
			})
		}

		function ref_sliderHue_onInput(): void {
			const value = safeNumber($parse_int(ref_sliderHue?.value ?? ''))
			hsla.h = Math_clamp(value / 360, 0, 1)
			updateColor({sliderHue: false})
		}

		function ref_sliderOpacity_onInput(): void {
			const value = safeNumber($parse_int(ref_sliderOpacity?.value ?? ''))
			hsla.a = Math_clamp(value / 100, 0, 1)
			updateColor({sliderOpacity: false})
		}

		function ref_eyeDropper_onClick(): void {
			// @ts-ignore
			const eyeDropper: EyeDropperInterface = new EyeDropper()
			eyeDropper.open().then(result => {
				const hex = result.sRGBHex as HEXColor
				const hsl = hexToHsl(hex)
				hsla.h = hsl.h
				hsla.s = hsl.s
				hsla.l = hsl.l
				updateColor({inputOpacity: false})
			}).catch(() => {})
		}

		function checkEyeDropperAPI(): void {
			if ('EyeDropper' in window) return

			$set_style(ref_eyeDropper, 'display', 'none')
		}

		function initColor(): void {
			const value = $get_attr(ref_colorPicker, Attributes.Value)
			if (value && isColorValidWithAlpha(value)) {
				let alpha = 1

				// '#RRGGBBAA'
				if (value.length === 9) {
					alpha = $parse_int(value.substring(7), 16) / 0xff
				}

				const hsl = hexToHsl(value.substring(0, 7) as HEXColor)
				hsla.h = hsl.h
				hsla.s = hsl.s
				hsla.l = hsl.l
				hsla.a = alpha
			}

			isHueOnly = attributes.hueOnly
			isDisabledOpacity = attributes.disabledOpacity
			colorSpace = attributes.colorSpace
			updateColor({inputEvent: false})
		}

		function initStructure(): void {
			update(ref_colorPicker)
			ref_rect = $query<HTMLDivElement>('.' + Classes.Rect, ref_colorPicker)
			ref_eyeDropper = $query<GCButton.CIcon.CElement>('.' + Classes.Eyedropper, ref_colorPicker)
			ref_sliderHue = $query<HTMLInputElement>('.' + Classes.SliderHue, ref_colorPicker)
			ref_sliderOpacity = $query<HTMLInputElement>('.' + Classes.SliderOpacity, ref_colorPicker)
			ref_labelColor = $query<HTMLLabelElement>('.' + Classes.LabelColor, ref_colorPicker)
			ref_labelOpacity = $query<HTMLLabelElement>('.' + Classes.LabelOpacity, ref_colorPicker)
			ref_swap = $query<GCButton.CIcon.CElement>('.' + Classes.Swap, ref_colorPicker)
			ref_inputColor = $query<HTMLInputElement>(`.${Classes.TextfieldColor} .${GCTextField.Classes.Input}`, ref_colorPicker)
			ref_inputOpacity = $query<HTMLInputElement>(`.${Classes.TextfieldOpacity} .${GCTextField.Classes.Input}`, ref_colorPicker)

			if (ref_inputColor) {
				let id = ref_inputColor.id
				if (!id) {
					id = createElementId()
					ref_inputColor.id = id
				}

				$set_attr(ref_labelColor, 'for', id)
			}
			if (ref_inputOpacity) {
				let id = ref_inputOpacity.id
				if (!id) {
					id = createElementId()
					ref_inputOpacity.id = id
				}

				$set_attr(ref_labelOpacity, 'for', id)
			}
		}

		function initEvents(): void {
			$add_event(ref_colorPicker, Events.Update, () => initColor())

			$add_event<ToggleEvent>(ref_colorPicker, 'toggle', ev => {
				const isOpen = ev.newState === 'open'
				if (isOpen) {
					initColor()
					$add_event(ref_swap, 'click', ref_swap_onClick)
					$add_event(ref_sliderHue, 'input', ref_sliderHue_onInput)
					$add_event(ref_eyeDropper, 'click', ref_eyeDropper_onClick)
					$add_event(ref_sliderOpacity, 'input', ref_sliderOpacity_onInput)
					$add_event(ref_rect, 'pointerdown', ref_rect_onPointerDown)
					$add_event(ref_rect, 'pointermove', ref_rect_onPointerMove)
					$add_event(ref_rect, 'pointerup', ref_rect_onPointerUp)
					$add_event(ref_rect, 'pointercancel', ref_rect_onPointerUp)
					$add_event(ref_rect, 'keydown', ref_rect_onKeyDown)
					$add_event(ref_inputColor, 'input', ref_inputColor_onInput)
					$add_event(ref_inputOpacity, 'input', ref_inputOpacity_onInput)
					$add_event(ref_inputColor, 'blur', ref_inputColor_onBlur)
					$add_event(ref_inputOpacity, 'blur', ref_inputOpacity_onBlur)
				}
				else {
					$rm_event(ref_swap, 'click', ref_swap_onClick)
					$rm_event(ref_sliderHue, 'input', ref_sliderHue_onInput)
					$rm_event(ref_eyeDropper, 'click', ref_eyeDropper_onClick)
					$rm_event(ref_sliderOpacity, 'input', ref_sliderOpacity_onInput)
					$rm_event(ref_rect, 'pointerdown', ref_rect_onPointerDown)
					$rm_event(ref_rect, 'pointermove', ref_rect_onPointerMove)
					$rm_event(ref_rect, 'pointerup', ref_rect_onPointerUp)
					$rm_event(ref_rect, 'pointercancel', ref_rect_onPointerUp)
					$rm_event(ref_rect, 'keydown', ref_rect_onKeyDown)
					$rm_event(ref_inputColor, 'input', ref_inputColor_onInput)
					$rm_event(ref_inputOpacity, 'input', ref_inputOpacity_onInput)
					$rm_event(ref_inputColor, 'blur', ref_inputColor_onBlur)
					$rm_event(ref_inputOpacity, 'blur', ref_inputOpacity_onBlur)
					if (startColor !== attributes.value) {
						ref_colorPicker.dispatchEvent(new CustomEvent(Events.Change))
					}
				}
			})
		}

		initStructure()
		initEvents()
		checkEyeDropperAPI()
	}

	export function register(...refs_colorPicker: CElement[]): void {
		if (refs_colorPicker.length === 0) {
			refs_colorPicker = [...document.querySelectorAll<CElement>('.' + Classes.Colorpicker)]
		}

		GCPopover.register(...refs_colorPicker)
		for (const popover of refs_colorPicker){
			if (REGISTERED_COLORPICKER.has(popover)) {
				continue
			}

			REGISTERED_COLORPICKER.add(popover)
			initColorPicker(popover)
		}
	}

	export function unregister(...colorPickerRefs: CElement[]): void {
		for (const colorpicker of colorPickerRefs) {
			REGISTERED_COLORPICKER.delete(colorpicker)
		}
	}

	export function create(options?: UpdateOptions): CElement {
		const ref_colorpicker = update($create('div'), options)
		register(ref_colorpicker)
		return ref_colorpicker
	}

	export function update(
		ref_colorpicker: CElement,
		options?: UpdateOptions
	): CElement {
		const opt = options?.ColorPicker
		const refs = opt?.refs
		GCPopover.update(ref_colorpicker, options)
		$classlist(ref_colorpicker, Classes.Colorpicker)

		const opt_value = opt?.value
		if ($is_false(opt_value)) {
			$rm_attr(ref_colorpicker, Attributes.Value)
		}
		else if ($is_string(opt_value) && isColorValidWithAlpha(opt_value)) {
			$set_attr(ref_colorpicker, Attributes.Value, opt_value)
			ref_colorpicker.dispatchEvent(new CustomEvent<EventDetails['update']>(Events.Update, {
				bubbles: false, cancelable: false,
				detail: {
					color: opt_value as HEXColor
				}
			}))
		}

		const opt_colorSpace = opt?.colorSpace
		if ($is_false(opt_colorSpace)) {
			$rm_attr(ref_colorpicker, Attributes.ColorSpace)
		}
		else if ($is_string(opt_colorSpace) && isValidEnumValue(opt_colorSpace, ColorSpace)) {
			$set_attr(ref_colorpicker, Attributes.ColorSpace, opt_colorSpace)
		}

		const opt_disabledOpacity = opt?.disabledOpacity
		if ($is_bool(opt_disabledOpacity)) {
			$toggle_attr(ref_colorpicker, Attributes.DisabledOpacity, opt_disabledOpacity)
		}

		const opt_hueOnly = opt?.hueOnly
		if ($is_bool(opt_hueOnly)) {
			$toggle_attr(ref_colorpicker, Attributes.HueOnly, opt_hueOnly)
		}

		// rect
		let ref_rect = $query<HTMLDivElement>(`.${Classes.Rect}`, ref_colorpicker)
		if (!ref_rect) {
			ref_rect = $create('div')
			$classlist(ref_rect, Classes.Rect)
			ref_rect.tabIndex = 0
			ref_rect.draggable = false
		}

		// options
		let ref_options = $query<HTMLDivElement>(`.${Classes.Options}`, ref_colorpicker)
		if (!ref_options) {
			ref_options = $create('div')
			$classlist(ref_options, Classes.Options)
		}

		// options -> preview
		let ref_preview = $query<HTMLDivElement>(`.${Classes.Preview}`, ref_options)
		if (!ref_preview) {
			ref_preview = $create('div')
			$classlist(ref_preview, Classes.Preview)
		}

		// options -> eyedropper
		let ref_eyeDropper = $query<GCButton.CIcon.CElement>(`.${Classes.Eyedropper}`, ref_options)
		if (!ref_eyeDropper) {
			ref_eyeDropper = GCButton.CIcon.create({
				Button: {
					variant: GCButton.Variant.Tonal
				},
				IconButton: {
					Icon: {
						code: IconCodes.Eyedropper
					},
				},
			})
			$classlist(ref_eyeDropper, Classes.Eyedropper)
		}

		// options -> slider
		let ref_slider = $query<HTMLDivElement>(`.${Classes.Slider}`, ref_options)
		if (!ref_slider) {
			ref_slider = $create('div')
			$classlist(ref_slider, Classes.Slider)
		}

		// options -> slider -> hue
		let ref_sliderHue = $query<HTMLInputElement>(`.${Classes.SliderHue}`, ref_slider)
		if (!ref_sliderHue) {
			ref_sliderHue = $create('input')
			$classlist(ref_sliderHue, Classes.SliderHue)
			ref_sliderHue.type = 'range'
			ref_sliderHue.name = 'Hue'
			ref_sliderHue.min = '0'
			ref_sliderHue.max = '360'
		}

		// options -> slider -> opacity
		let ref_sliderOpacity = $query<HTMLInputElement>(`.${Classes.SliderOpacity}`, ref_slider)
		if (!ref_sliderOpacity) {
			ref_sliderOpacity = $create('input')
			$classlist(ref_sliderOpacity, Classes.SliderOpacity)
			ref_sliderOpacity.type = 'range'
			ref_sliderOpacity.name = 'Opacity'
			ref_sliderOpacity.min = '0'
			ref_sliderOpacity.max = '100'
		}

		$children(ref_slider, ref_sliderHue, ref_sliderOpacity)
		$children(ref_options, ref_preview, ref_eyeDropper, ref_slider)

		// input
		let ref_input = $query<HTMLDivElement>(`.${Classes.Input}`, ref_colorpicker)
		if (!ref_input) {
			ref_input = $create('div')
			$classlist(ref_input, Classes.Input)
		}

		// input -> label
		let ref_label = $query<HTMLDivElement>(`.${Classes.Label}`, ref_input)
		if (!ref_label) {
			ref_label = $create('div')
			$classlist(ref_label, Classes.Label)
		}

		// input -> label -> color
		let ref_labelColor = $query<HTMLLabelElement>(`.${Classes.LabelColor}`, ref_label)
		if (!ref_labelColor) {
			ref_labelColor = $create('label')
			$classlist(ref_labelColor, Classes.LabelColor)
			ref_labelColor.textContent = 'HEX:'
		}

		// input -> label -> opacity
		let ref_labelOpacity = $query<HTMLLabelElement>(`.${Classes.LabelOpacity}`, ref_label)
		if (!ref_labelOpacity) {
			ref_labelOpacity = $create('label')
			$classlist(ref_labelOpacity, Classes.LabelOpacity)
			ref_labelOpacity.textContent = 'Opacity:'
		}

		$children(ref_label, ref_labelColor, ref_labelOpacity)

		// input -> textfield
		let ref_textfield = $query<HTMLDivElement>(`.${Classes.Textfield}`, ref_input)
		if (!ref_textfield) {
			ref_textfield = $create('div')
			$classlist(ref_textfield, Classes.Textfield)
		}

		// input -> textfield -> color
		let ref_textfieldColor = $query<GCTextField.CElement>(`.${Classes.TextfieldColor}`, ref_textfield)
		if (!ref_textfieldColor) {
			ref_textfieldColor = GCTextField.create()
			$classlist(ref_textfieldColor, Classes.TextfieldColor)
		}

		// input -> textfield -> color -> swap
		let ref_swap = $query<GCTextField.CButton.CElement>(`.${Classes.Swap}`, ref_textfieldColor)
		if (!ref_swap) {
			ref_swap = GCTextField.CButton.create({Button: {variant: GCButton.Variant.Tonal}})
			$classlist(ref_swap, Classes.Swap)
		}

		// input -> textfield -> color -> swap -> icon
		let ref_swapIcon = $query<GCIcon.CElement>(`.${Classes.SwapIcon}`, ref_swap)
		if (!ref_swapIcon) {
			ref_swapIcon = GCIcon.create({Icon: {code: IconCodes.ChevronUpDown}})
			$classlist(ref_swapIcon, Classes.SwapIcon)
		}

		GCTextField.CButton.update(ref_swap, {
			Button: {children: [ref_swapIcon]}
		})

		GCTextField.update(ref_textfieldColor, {
			TextField: {trailing: [ref_swap]}
		})

		// input -> textfield -> opacity
		let ref_textfieldOpacity = $query<GCTextField.CElement>(`.${Classes.TextfieldOpacity}`, ref_textfield)
		if (!ref_textfieldOpacity) {
			ref_textfieldOpacity = GCTextField.create()
			$classlist(ref_textfieldOpacity, Classes.TextfieldOpacity)
		}

		$children(ref_textfield, ref_textfieldColor, ref_textfieldOpacity)
		$children(ref_input, ref_label, ref_textfield)

		// content
		let ref_content = $query<HTMLDivElement>(`.${Classes.Content}`, ref_colorpicker)
		if (!ref_content) {
			ref_content = $create('div')
			$classlist(ref_content, Classes.Content)
		}

		const opt_children = opt?.children
		if ($is_false(opt_children)) {
			$children(ref_content)
		}
		else if ($is_array(opt_children)) {
			$children(ref_content, ...opt_children)
		}

		GCPopover.update(ref_colorpicker, {
			Popover: {children: [ref_rect, ref_options, ref_input, ref_content]}
		})

		refs?.colorpicker?.(ref_colorpicker)
		refs?.content?.(ref_content)
		refs?.eyedropper?.(ref_eyeDropper)
		refs?.input?.(ref_input)
		refs?.labelColor?.(ref_labelColor)
		refs?.labelOpacity?.(ref_labelOpacity)
		refs?.options?.(ref_options)
		refs?.preview?.(ref_preview)
		refs?.rect?.(ref_rect)
		refs?.slider?.(ref_slider)
		refs?.sliderHue?.(ref_sliderHue)
		refs?.sliderOpacity?.(ref_sliderOpacity)
		refs?.swap?.(ref_swap)
		refs?.swapIcon?.(ref_swapIcon)
		refs?.textfield?.(ref_textfield)
		refs?.textfieldColor?.(ref_textfieldColor)
		refs?.textfieldOpacity?.(ref_textfieldOpacity)
		return ref_colorpicker
	}

	export function getValue(ref_colorpicker: CElement): HEXColor {
		return (ref_colorpicker.getAttribute(Attributes.Value) as HEXColor) ?? '#FFFFFF'
	}
}
