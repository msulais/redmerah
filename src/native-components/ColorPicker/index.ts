import {
	type HEXColor,
	type HSLColor
} from "@/types/color"
import {
	colorContrastRatio,
	colorHexToHsl,
	colorHslToHex,
	colorHslToHsv,
	colorHslToRgb,
	colorHsvToHsl,
	colorIsValidWithAlpha,
	colorRgbToHsl
} from "@/utils/color"
import { numberSafe } from "@/utils/number"
import { mathClamp } from "@/utils/math"
import { createId } from "@/utils/ids"
import { isAnimationAllowed } from "@/utils/animation"
import { AnimationEffectTiming } from "@/enums/animation"
import {
	type EyeDropper as EyeDropperInterface
} from "@/interfaces/eye-dropper"
import { validEnumValue } from "@/utils/object"
import {
	KEY_ARROW_DOWN,
	KEY_ARROW_LEFT,
	KEY_ARROW_RIGHT,
	KEY_ARROW_UP
} from "@/constants/keyboard-value"
import {
	ICON_CHEVRON_UP_DOWN,
	ICON_EYEDROPPER
} from "@/constants/icons"

import {
	type PopoverProps,
	type PopoverUpdateOptions,
	type PopoverOpenOptions,
	type PopoverCloseOptions,
	type PopoverToggleOpenEventDetail,
	PopoverEvents,
	PopoverPosition,
	openPopoverRef,
	closePopoverRef,
	repositionPopoverRef,
	isPopoverRefOpen,
	updatePopoverRef,
	registerPopoverRef
} from "@/native-components/Popover"
import {
	ButtonVariant,
	createIconButtonRef,
	type IconButtonProps
} from "@/native-components/Button"
import {
	createTextFieldRef,
	createTextFieldButtonRef,
	TextFieldClasses,
	updateTextFieldRef,
	updateTextFieldButtonRef,
	type TextFieldButtonProps,
	type TextFieldProps
} from "@/native-components/TextField"
import {
	createIconRef,
	type IconProps
} from "@/native-components/Icon"

type ColorPickerProps = PopoverProps & {
	ColorPickerValue               ?: HEXColor
	ColorPickerDisabledOpacity     ?: boolean
	ColorPickerHueOnly             ?: boolean
	ColorPickerColorSpace          ?: ColorPickerColorSpace
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

type ColorPickerUpdateOptions = Omit<PopoverUpdateOptions, 'PopoverChildren'> & {
	ColorPickerValue          ?: HEXColor | boolean
	ColorPickerDisabledOpacity?: boolean
	ColorPickerHueOnly        ?: boolean
	ColorPickerColorSpace     ?: ColorPickerColorSpace | boolean
	ColorPickerChildren       ?: (string | Node)[] | boolean
	ColorPickerRefs           ?: {
		colorpicker     ?(ref: HTMLDivElement   ): unknown
		content         ?(ref: HTMLDivElement   ): unknown
		eyedropper      ?(ref: HTMLButtonElement): unknown
		input           ?(ref: HTMLDivElement   ): unknown
		labelColor      ?(ref: HTMLLabelElement ): unknown
		labelOpacity    ?(ref: HTMLLabelElement ): unknown
		options         ?(ref: HTMLDivElement   ): unknown
		preview         ?(ref: HTMLDivElement   ): unknown
		rect            ?(ref: HTMLDivElement   ): unknown
		slider          ?(ref: HTMLDivElement   ): unknown
		sliderHue       ?(ref: HTMLInputElement ): unknown
		sliderOpacity   ?(ref: HTMLInputElement ): unknown
		swap            ?(ref: HTMLButtonElement): unknown
		swapIcon        ?(ref: HTMLElement      ): unknown
		textfield       ?(ref: HTMLDivElement   ): unknown
		textfieldColor  ?(ref: HTMLDivElement   ): unknown
		textfieldOpacity?(ref: HTMLDivElement   ): unknown
	}
}

enum ColorPickerAttributes {
	disabledOpacity = 'data-c-colorpicker-disabled-opacity',
	value           = 'data-c-colorpicker-value',
	hueOnly         = 'data-c-colorpicker-hueonly',
	colorSpace      = 'data-c-colorpicker-colorspace'
}

enum ColorPickerClasses {
	colorpicker      = 'c-colorpicker',
	content          = colorpicker + '-content',
	rect             = colorpicker + '-rect',
	options          = colorpicker + '-options',
	preview          = colorpicker + '-preview',
	eyedropper       = colorpicker + '-eyedropper',
	slider           = colorpicker + '-slider',
	input            = colorpicker + '-input',
	label            = colorpicker + '-label',
	textfield        = colorpicker + '-textfield',
	swap             = colorpicker + '-swap',
	swapIcon         = swap        + '-icon',
	sliderHue        = slider      + '-hue',
	sliderOpacity    = slider      + '-opacity',
	labelColor       = label       + '-color',
	labelOpacity     = label       + '-opacity',
	textfieldColor   = textfield   + '-color',
	textfieldOpacity = textfield   + '-opacity'
}

enum ColorPickerEvents {
	/** `!bubbles | !cancelable | !detail` */
	input  = 'colorpicker:input',

	/** `!bubbles | !cancelable | !detail` */
	change = 'colorpicker:change'
}

enum ColorPickerCSSVariables {
	sliderHueBorderColor = '--c-colorpicker-slider-hue-border-color',
	color                = '--c-colorpicker-color',
	colorWithAlpha       = '--c-colorpicker-color-with-alpha',
	hue                  = '--c-colorpicker-hue-color',
	rectBorderColor      = '--c-colorpicker-rect-border-color',
	rectX                = '--c-colorpicker-rect-x',
	rectY                = '--c-colorpicker-rect-y',
}

enum ColorPickerColorSpace {
	rgb = 'rgb',
	hsl = 'hsl',
	hex = 'hex'
}

const REGISTERED_COLORPICKER: Set<HTMLDivElement> = new Set<HTMLDivElement>()

function _initColorPickerRef(colorPickerRef: HTMLDivElement): void {
	const attributes = {
		get value(): HEXColor {
			return (colorPickerRef.getAttribute(ColorPickerAttributes.value) ?? '#FF0000') as HEXColor
		},
		get disabledOpacity(): boolean {
			return colorPickerRef.hasAttribute(ColorPickerAttributes.disabledOpacity)
		},
		get hueOnly(): boolean {
			return colorPickerRef.hasAttribute(ColorPickerAttributes.hueOnly)
		},
		get colorSpace(): ColorPickerColorSpace {
			const space = colorPickerRef.getAttribute(ColorPickerAttributes.colorSpace)
			return validEnumValue(space, ColorPickerColorSpace)
				? (space as ColorPickerColorSpace)
				: ColorPickerColorSpace.hex
		}
	}
	const hsla: (HSLColor & {a: number}) = {h: 0, s: 1, l: 0.5, a: 1}
	let startColor = '#FF0000'
	let isHueOnly = false
	let isDisabledOpacity = false
	let rectX = 0
	let rectY = 0
	let colorSpace: ColorPickerColorSpace = ColorPickerColorSpace.hex
	let rectRef: HTMLDivElement | null = null
	let rectRect: DOMRect | null = null
	let eyeDropperRef: HTMLButtonElement | null = null
	let labelColorRef: HTMLLabelElement | null = null
	let labelOpacityRef: HTMLLabelElement | null = null
	let inputColorRef: HTMLInputElement | null = null
	let inputOpacityRef: HTMLInputElement | null = null
	let swapRef: HTMLButtonElement | null = null
	let sliderHueRef: HTMLInputElement | null = null
	let sliderOpacityRef: HTMLInputElement | null = null
	let rectDragging = false

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

		const hexColor = colorHslToHex(hsla).toUpperCase()
		const hexColorWithAlpha = hexColor + Math.round(hsla.a * 0xff).toString(16).padStart(2, '0').toUpperCase()
		const hueHexColor = colorHslToHex({h: hsla.h, s: 1, l: 0.5}).toUpperCase()
		colorPickerRef.style.setProperty(ColorPickerCSSVariables.color, hexColor)
		colorPickerRef.style.setProperty(ColorPickerCSSVariables.colorWithAlpha, hexColorWithAlpha)
		colorPickerRef.style.setProperty(ColorPickerCSSVariables.hue, hueHexColor)
		colorPickerRef.style.setProperty(
			ColorPickerCSSVariables.rectBorderColor,
			colorContrastRatio(colorHslToRgb(hsla), {r: 0, g: 0, b: 0}) > 50
				? '#000' : '#fff'
		)
		colorPickerRef.style.setProperty(
			ColorPickerCSSVariables.sliderHueBorderColor,
			colorContrastRatio(colorHslToRgb({...hsla, s: 1, l: 0.5}), {r: 0, g: 0, b: 0}) > 50
				? '#000' : '#fff'
		)
		if (options?.rect ?? true) {
			rectX = 0
			rectY = 0
			if (colorSpace === ColorPickerColorSpace.hsl) {
				rectX = hsla.s * 100
				rectY = (1 - hsla.l) * 100
			} else {
				const hsv = colorHslToHsv(hsla)
				rectX = hsv.s * 100
				rectY = (1 - hsv.v) * 100
			}
			colorPickerRef.style.setProperty(ColorPickerCSSVariables.rectX, rectX + '%')
			colorPickerRef.style.setProperty(ColorPickerCSSVariables.rectY, rectY + '%')
		}
		if ((options?.sliderHue ?? true) && sliderHueRef) {
			const hue = Math.round(hsla.h * 360)
			sliderHueRef.value = hue + ''
		}

		if ((options?.sliderOpacity ?? true) && sliderOpacityRef) {
			const opacity = Math.round(hsla.a * 100)
			sliderOpacityRef.value = opacity + ''
		}

		if ((options?.inputColor ?? true) && inputColorRef) {
			let text = ''
			let placeholder = ''
			let name = ''
			switch (colorSpace) {
			case ColorPickerColorSpace.rgb:
				const rgb = colorHslToRgb(hsla)
				text = [
					Math.round(rgb.r * 0xff),
					Math.round(rgb.g * 0xff),
					Math.round(rgb.b * 0xff),
				].join(', ')
				placeholder = '0-255, 0-255, 0-255'
				name = 'RGB:'
				break
			case ColorPickerColorSpace.hsl:
				text = [
					Math.round(hsla.h * 360) + '°',
					Math.round(hsla.s * 100) + '%',
					Math.round(hsla.l * 100) + '%',
				].join(', ')
				placeholder = '0-360°, 0-100%, 0-100%'
				name = 'HSL:'
				break
			case ColorPickerColorSpace.hex:
				text = hexColor
				placeholder = '#RRGGBB'
				name = 'HEX:'
				break
			}

			inputColorRef.value = text
			inputColorRef.placeholder = placeholder
			if (labelColorRef && labelColorRef.textContent !== name) {
				labelColorRef.textContent = name
				if (isAnimationAllowed()) {
					labelColorRef.animate({
						opacity: [0, 1],
						transform: ['translateY(8px)', 'translateY(0)'],
					}, {duration: 300, easing: AnimationEffectTiming.spring})
				}
			}
		}

		if ((options?.inputOpacity ?? true) && inputOpacityRef) {
			const opacity = Math.round(hsla.a * 100)
			inputOpacityRef.value = opacity + '%'
		}

		if (options?.valueAttribute ?? true) {
			const hex = hsla.a < 1? hexColorWithAlpha : hexColor
			colorPickerRef.setAttribute(ColorPickerAttributes.value, hex)
		}

		if (options?.inputEvent ?? true) {
			colorPickerRef.dispatchEvent(new CustomEvent(ColorPickerEvents.input))
		}
	}

	function inputColorRefOnBlur(): void {
		updateColor({
			inputEvent: false,
			valueAttribute: false
		})
	}

	function inputColorRefOnInput(): void {
		let value = inputColorRef!.value
		let hsl: HSLColor = {h: 0, s: 1, l: 0.5}
		switch (colorSpace) {
		case ColorPickerColorSpace.rgb: {
			value = value.replace(/[^\d,]/g, '').trim()
			const rgbArr: number[] = (value
				.split(',')
				.map(v => mathClamp(numberSafe(Number.parseInt(v)), 0, 0xff) / 0xff)
			)
			while (rgbArr.length < 3) rgbArr.push(0)
			hsl = colorRgbToHsl({
				r: rgbArr[0],
				g: rgbArr[1],
				b: rgbArr[2],
			})
			break
		}
		case ColorPickerColorSpace.hsl:
			value = value.replace(/[^\d,]/g, '').trim()
			const hslArr: number[] = (value
				.split(',')
				.map((v, i) => mathClamp(
					numberSafe(Number.parseInt(v)),
					0,
					i === 0? 360 : 100
				) / (i === 0? 360 : 100))
			)
			while (hslArr.length < 3) hslArr.push(0)

			hsl.h = hslArr[0]
			hsl.s = hslArr[1]
			hsl.l = hslArr[2]
			break
		case ColorPickerColorSpace.hex:
			value = '#' + value.replace(/[^\da-fA-F]/g, '').padEnd(6, '0').substring(0, 6).trim()
			hsl = colorHexToHsl(value as HEXColor)
			break
		}

		hsla.h = hsl.h
		hsla.s = hsl.s
		hsla.l = hsl.l
		updateColor({inputColor: false})
	}

	function inputOpacityRefOnBlur(): void {
		inputOpacityRef!.value = Math.round(hsla.a * 100) + '%'
	}

	function inputOpacityRefOnInput(): void {
		const value = mathClamp(
			numberSafe(Number.parseInt(inputOpacityRef!.value), hsla.a * 100),
			0,
			100
		)
		hsla.a = value / 100
		updateColor({
			inputOpacity: false
		})
	}

	function updateRectPosition(x: number, y: number): void {
		x = (x - rectRect!.left) / rectRect!.width * 100
		y = (y - rectRect!.top) / rectRect!.height * 100
		rectX = mathClamp(x, 0, 100)
		rectY = mathClamp(y, 0, 100)
		colorPickerRef.style.setProperty(ColorPickerCSSVariables.rectX, rectX + '%')
		colorPickerRef.style.setProperty(ColorPickerCSSVariables.rectY, rectY + '%')

		if (colorSpace === ColorPickerColorSpace.hsl) {
			hsla.s = rectX / 100
			hsla.l = 1 - (rectY / 100)
		} else {
			const hsl = colorHsvToHsl({h: hsla.h, s: rectX / 100, v: 1 - (rectY / 100)})
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

	function rectRefOnKeyDown(ev: KeyboardEvent): void {
		const key = ev.key
		switch (key) {
		case KEY_ARROW_RIGHT:
			++rectX
			break
		case KEY_ARROW_LEFT:
			--rectX
			break
		case KEY_ARROW_DOWN:
			++rectY
			break
		case KEY_ARROW_UP:
			--rectY
			break
		}
		rectX = mathClamp(rectX, 0, 100)
		rectY = mathClamp(rectY, 0, 100)
		colorPickerRef.style.setProperty(ColorPickerCSSVariables.rectX, rectX + '%')
		colorPickerRef.style.setProperty(ColorPickerCSSVariables.rectY, rectY + '%')

		if (colorSpace === ColorPickerColorSpace.hsl) {
			hsla.s = rectX / 100
			hsla.l = 1 - (rectY / 100)
		} else {
			const hsl = colorHsvToHsl({h: hsla.h, s: rectX / 100, v: 1 - (rectY / 100)})
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

	function rectRefOnPointerDown(ev: PointerEvent): void {
		rectRef?.setPointerCapture(ev.pointerId)
		rectRect = rectRef!.getBoundingClientRect()
		updateRectPosition(ev.x, ev.y)
		rectDragging = true
	}

	function rectRefOnPointerMove(ev: PointerEvent): void {
		if (!rectDragging) return

		updateRectPosition(ev.x, ev.y)
	}

	function rectRefOnPointerUp(ev: PointerEvent): void {
		rectRef?.releasePointerCapture(ev.pointerId)
		rectDragging = false
	}

	function swapRefOnClick(): void {
		switch (colorSpace) {
		case ColorPickerColorSpace.rgb:
			colorSpace = ColorPickerColorSpace.hsl
			break
		case ColorPickerColorSpace.hsl:
			colorSpace = ColorPickerColorSpace.hex
			break
		case ColorPickerColorSpace.hex:
			colorSpace = ColorPickerColorSpace.rgb
			break
		}

		colorPickerRef.setAttribute(ColorPickerAttributes.colorSpace, colorSpace)
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

	function sliderHueRefOnInput(): void {
		const value = numberSafe(Number.parseInt(sliderHueRef?.value ?? ''))
		hsla.h = mathClamp(value / 360, 0, 1)
		updateColor({sliderHue: false})
	}

	function sliderOpacityRefOnInput(): void {
		const value = numberSafe(Number.parseInt(sliderOpacityRef?.value ?? ''))
		hsla.a = mathClamp(value / 100, 0, 1)
		updateColor({sliderOpacity: false})
	}

	function eyeDropperRefOnClick(): void {
		// @ts-ignore
		const eyeDropper: EyeDropperInterface = new EyeDropper()
		eyeDropper.open().then(result => {
			const hex = result.sRGBHex as HEXColor
			const hsl = colorHexToHsl(hex)
			hsla.h = hsl.h
			hsla.s = hsl.s
			hsla.l = hsl.l
			updateColor({inputOpacity: false})
		}).catch(() => {})
	}

	function checkEyeDropperAPI(): void {
		if ('EyeDropper' in window) return

		eyeDropperRef?.style.setProperty('display', 'none')
	}

	function initColor(): void {
		const value = colorPickerRef.getAttribute(ColorPickerAttributes.value)
		if (value && colorIsValidWithAlpha(value)) {
			let alpha = 1

			// '#RRGGBBAA'
			if (value.length === 9) {
				alpha = Number.parseInt(value.substring(7), 16) / 0xff
			}

			const hsl = colorHexToHsl(value.substring(0, 7) as HEXColor)
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
		updateColorPickerRef(colorPickerRef)
		rectRef = colorPickerRef.querySelector<HTMLDivElement>('.' + ColorPickerClasses.rect)
		eyeDropperRef = colorPickerRef.querySelector<HTMLButtonElement>('.' + ColorPickerClasses.eyedropper)
		sliderHueRef = colorPickerRef.querySelector<HTMLInputElement>('.' + ColorPickerClasses.sliderHue)
		sliderOpacityRef = colorPickerRef.querySelector<HTMLInputElement>('.' + ColorPickerClasses.sliderOpacity)
		labelColorRef = colorPickerRef.querySelector<HTMLLabelElement>('.' + ColorPickerClasses.labelColor)
		labelOpacityRef = colorPickerRef.querySelector<HTMLLabelElement>('.' + ColorPickerClasses.labelOpacity)
		swapRef = colorPickerRef.querySelector<HTMLButtonElement>('.' + ColorPickerClasses.swap)
		inputColorRef = colorPickerRef.querySelector<HTMLInputElement>(`.${ColorPickerClasses.textfieldColor} .${TextFieldClasses.input}`)
		inputOpacityRef = colorPickerRef.querySelector<HTMLInputElement>(`.${ColorPickerClasses.textfieldOpacity} .${TextFieldClasses.input}`)

		if (inputColorRef) {
			let id = inputColorRef.id
			if (!id) {
				id = createId()
				inputColorRef.id = id
			}

			labelColorRef?.setAttribute('for', id)
		}
		if (inputOpacityRef) {
			let id = inputOpacityRef.id
			if (!id) {
				id = createId()
				inputOpacityRef.id = id
			}

			labelOpacityRef?.setAttribute('for', id)
		}
	}

	function initEvents(): void {
		colorPickerRef.addEventListener(PopoverEvents.toggleOpen as any, (ev: CustomEvent<PopoverToggleOpenEventDetail>) => {
			const isOpen = ev.detail.open
			if (isOpen) {
				initColor()
				swapRef         ?.addEventListener('click', swapRefOnClick)
				sliderHueRef    ?.addEventListener('input', sliderHueRefOnInput)
				eyeDropperRef   ?.addEventListener('click', eyeDropperRefOnClick)
				sliderOpacityRef?.addEventListener('input', sliderOpacityRefOnInput)
				rectRef         ?.addEventListener('pointerdown', rectRefOnPointerDown)
				rectRef         ?.addEventListener('pointermove', rectRefOnPointerMove)
				rectRef         ?.addEventListener('pointerup', rectRefOnPointerUp)
				rectRef         ?.addEventListener('pointercancel', rectRefOnPointerUp)
				rectRef         ?.addEventListener('keydown', rectRefOnKeyDown)
				inputColorRef   ?.addEventListener('input', inputColorRefOnInput)
				inputOpacityRef ?.addEventListener('input', inputOpacityRefOnInput)
				inputColorRef   ?.addEventListener('blur', inputColorRefOnBlur)
				inputOpacityRef ?.addEventListener('blur', inputOpacityRefOnBlur)
			}
			else {
				swapRef         ?.removeEventListener('click', swapRefOnClick)
				sliderHueRef    ?.removeEventListener('input', sliderHueRefOnInput)
				eyeDropperRef   ?.removeEventListener('click', eyeDropperRefOnClick)
				sliderOpacityRef?.removeEventListener('input', sliderOpacityRefOnInput)
				rectRef         ?.removeEventListener('pointerdown', rectRefOnPointerDown)
				rectRef         ?.removeEventListener('pointermove', rectRefOnPointerMove)
				rectRef         ?.removeEventListener('pointerup', rectRefOnPointerUp)
				rectRef         ?.removeEventListener('pointercancel', rectRefOnPointerUp)
				rectRef         ?.removeEventListener('keydown', rectRefOnKeyDown)
				inputColorRef   ?.removeEventListener('input', inputColorRefOnInput)
				inputOpacityRef ?.removeEventListener('input', inputOpacityRefOnInput)
				inputColorRef   ?.removeEventListener('blur', inputColorRefOnBlur)
				inputOpacityRef ?.removeEventListener('blur', inputOpacityRefOnBlur)
				if (startColor !== attributes.value) {
					colorPickerRef.dispatchEvent(new CustomEvent(ColorPickerEvents.change))
				}
			}
		})
	}

	initStructure()
	initEvents()
	checkEyeDropperAPI()
}

function registerColorPickerRef(...colorPickerRefs: HTMLDivElement[]): void {
	if (colorPickerRefs.length === 0) {
		colorPickerRefs = [...document.querySelectorAll<HTMLDivElement>('.' + ColorPickerClasses.colorpicker)]
	}

	registerPopoverRef(...colorPickerRefs)
	for (const popover of colorPickerRefs){
		if (REGISTERED_COLORPICKER.has(popover)) {
			continue
		}

		REGISTERED_COLORPICKER.add(popover)
		_initColorPickerRef(popover)
	}
}

function unregisterColorPickerRef(...colorPickerRefs: HTMLDivElement[]): void {
	for (const colorpicker of colorPickerRefs) {
		REGISTERED_COLORPICKER.delete(colorpicker)
	}
}

function createColorPickerRef(options?: ColorPickerUpdateOptions): HTMLDivElement {
	const colorPickerRef = document.createElement('div')
	return updateColorPickerRef(colorPickerRef, options)
}

function updateColorPickerRef(
	colorPickerRef: HTMLDivElement,
	options?: ColorPickerUpdateOptions
): HTMLDivElement {
	const refs = options?.ColorPickerRefs
	updatePopoverRef(colorPickerRef, options)
	colorPickerRef.classList.add(ColorPickerClasses.colorpicker)

	const valueOption = options?.ColorPickerValue
	if (valueOption === false) {
		colorPickerRef.removeAttribute(ColorPickerAttributes.value)
	}
	else if (valueOption !== undefined && valueOption !== true) {
		colorPickerRef.setAttribute(ColorPickerAttributes.value, valueOption)
	}

	const colorSpaceOption = options?.ColorPickerColorSpace
	if (colorSpaceOption === false) {
		colorPickerRef.removeAttribute(ColorPickerAttributes.colorSpace)
	}
	else if (colorSpaceOption && colorSpaceOption !== true) {
		colorPickerRef.setAttribute(ColorPickerAttributes.colorSpace, colorSpaceOption)
	}

	const disabledOpacityOption = options?.ColorPickerDisabledOpacity
	if (disabledOpacityOption !== undefined) {
		colorPickerRef.toggleAttribute(ColorPickerAttributes.disabledOpacity, disabledOpacityOption)
	}

	const hueOnlyOption = options?.ColorPickerHueOnly
	if (hueOnlyOption !== undefined) {
		colorPickerRef.toggleAttribute(ColorPickerAttributes.hueOnly, hueOnlyOption)
	}

	// rect
	let rectRef = colorPickerRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.rect}`
	)
	if (!rectRef) {
		rectRef = document.createElement('div')
		rectRef.classList.add(ColorPickerClasses.rect)
		rectRef.tabIndex = 0
		rectRef.draggable = false
	}

	// options
	let optionsRef = colorPickerRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.options}`
	)
	if (!optionsRef) {
		optionsRef = document.createElement('div')
		optionsRef.classList.add(ColorPickerClasses.options)
	}

	// options -> preview
	let previewRef = optionsRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.preview}`
	)
	if (!previewRef) {
		previewRef = document.createElement('div')
		previewRef.classList.add(ColorPickerClasses.preview)
	}

	// options -> eyedropper
	let eyeDropperRef = optionsRef.querySelector<HTMLButtonElement>(
		`.${ColorPickerClasses.eyedropper}`
	)
	if (!eyeDropperRef) {
		eyeDropperRef = createIconButtonRef({
			IconButtonIcon: {
				IconCode: ICON_EYEDROPPER
			},
			ButtonVariant: ButtonVariant.tonal
		})
		eyeDropperRef.classList.add(ColorPickerClasses.eyedropper)
	}

	// options -> slider
	let sliderRef = optionsRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.slider}`
	)
	if (!sliderRef) {
		sliderRef = document.createElement('div')
		sliderRef.classList.add(ColorPickerClasses.slider)
	}

	// options -> slider -> hue
	let sliderHueRef = sliderRef.querySelector<HTMLInputElement>(
		`.${ColorPickerClasses.sliderHue}`
	)
	if (!sliderHueRef) {
		sliderHueRef = document.createElement('input')
		sliderHueRef.classList.add(ColorPickerClasses.sliderHue)
		sliderHueRef.type = 'range'
		sliderHueRef.name = 'Hue'
		sliderHueRef.min = '0'
		sliderHueRef.max = '360'
	}

	// options -> slider -> opacity
	let sliderOpacityRef = sliderRef.querySelector<HTMLInputElement>(
		`.${ColorPickerClasses.sliderOpacity}`
	)
	if (!sliderOpacityRef) {
		sliderOpacityRef = document.createElement('input')
		sliderOpacityRef.classList.add(ColorPickerClasses.sliderOpacity)
		sliderOpacityRef.type = 'range'
		sliderOpacityRef.name = 'Opacity'
		sliderOpacityRef.min = '0'
		sliderOpacityRef.max = '100'
	}

	sliderRef.replaceChildren(sliderHueRef, sliderOpacityRef)
	optionsRef.replaceChildren(previewRef, eyeDropperRef, sliderRef)

	// input
	let inputRef = colorPickerRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.input}`
	)
	if (!inputRef) {
		inputRef = document.createElement('div')
		inputRef.classList.add(ColorPickerClasses.input)
	}

	// input -> label
	let labelRef = inputRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.label}`
	)
	if (!labelRef) {
		labelRef = document.createElement('div')
		labelRef.classList.add(ColorPickerClasses.label)
	}

	// input -> label -> color
	let labelColorRef = labelRef.querySelector<HTMLLabelElement>(
		`.${ColorPickerClasses.labelColor}`
	)
	if (!labelColorRef) {
		labelColorRef = document.createElement('label')
		labelColorRef.classList.add(ColorPickerClasses.labelColor)
		labelColorRef.textContent = 'HEX:'
	}

	// input -> label -> opacity
	let labelOpacityRef = labelRef.querySelector<HTMLLabelElement>(
		`.${ColorPickerClasses.labelOpacity}`
	)
	if (!labelOpacityRef) {
		labelOpacityRef = document.createElement('label')
		labelOpacityRef.classList.add(ColorPickerClasses.labelOpacity)
		labelOpacityRef.textContent = 'Opacity:'
	}

	labelRef.replaceChildren(labelColorRef, labelOpacityRef)

	// input -> textfield
	let textfieldRef = inputRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.textfield}`
	)
	if (!textfieldRef) {
		textfieldRef = document.createElement('div')
		textfieldRef.classList.add(ColorPickerClasses.textfield)
	}

	// input -> textfield -> color
	let textfieldColorRef = textfieldRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.textfieldColor}`
	)
	if (!textfieldColorRef) {
		textfieldColorRef = createTextFieldRef()
		textfieldColorRef.classList.add(ColorPickerClasses.textfieldColor)
	}

	// input -> textfield -> color -> swap
	let swapRef = textfieldColorRef.querySelector<HTMLButtonElement>(
		`.${ColorPickerClasses.swap}`
	)
	if (!swapRef) {
		swapRef = createTextFieldButtonRef({ButtonVariant: ButtonVariant.tonal})
		swapRef.classList.add(ColorPickerClasses.swap)
	}

	// input -> textfield -> color -> swap -> icon
	let swapIconRef = swapRef.querySelector<HTMLElement>(
		`.${ColorPickerClasses.swapIcon}`
	)
	if (!swapIconRef) {
		swapIconRef = createIconRef({
			IconCode: ICON_CHEVRON_UP_DOWN
		})
		swapIconRef.classList.add(ColorPickerClasses.swapIcon)
	}

	updateTextFieldButtonRef(swapRef, {
		ButtonChildren: [swapIconRef]
	})

	updateTextFieldRef(textfieldColorRef, {
		TextFieldTrailing: [swapRef]
	})

	// input -> textfield -> opacity
	let textfieldOpacityRef = textfieldRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.textfieldOpacity}`
	)
	if (!textfieldOpacityRef) {
		textfieldOpacityRef = createTextFieldRef()
		textfieldOpacityRef.classList.add(ColorPickerClasses.textfieldOpacity)
	}

	textfieldRef.replaceChildren(textfieldColorRef, textfieldOpacityRef)
	inputRef.replaceChildren(labelRef, textfieldRef)

	// content
	let contentRef = colorPickerRef.querySelector<HTMLDivElement>(
		`.${ColorPickerClasses.content}`
	)
	if (!contentRef) {
		contentRef = document.createElement('div')
		contentRef.classList.add(ColorPickerClasses.content)
	}

	const children = options?.ColorPickerChildren
	if (children === false) {
		contentRef.replaceChildren()
	}
	else if (children !== undefined && children !== true) {
		contentRef.replaceChildren(...children)
	}

	updatePopoverRef(colorPickerRef, {
		PopoverChildren: [rectRef, optionsRef, inputRef, contentRef]
	})

	refs?.colorpicker?.(colorPickerRef)
	refs?.content?.(contentRef)
	refs?.eyedropper?.(eyeDropperRef)
	refs?.input?.(inputRef)
	refs?.labelColor?.(labelColorRef)
	refs?.labelOpacity?.(labelOpacityRef)
	refs?.options?.(optionsRef)
	refs?.preview?.(previewRef)
	refs?.rect?.(rectRef)
	refs?.slider?.(sliderRef)
	refs?.sliderHue?.(sliderHueRef)
	refs?.sliderOpacity?.(sliderOpacityRef)
	refs?.swap?.(swapRef)
	refs?.swapIcon?.(swapIconRef)
	refs?.textfield?.(textfieldRef)
	refs?.textfieldColor?.(textfieldColorRef)
	refs?.textfieldOpacity?.(textfieldOpacityRef)
	return colorPickerRef
}

export {
	type PopoverOpenOptions as ColorPickerOpenOptions,
	type PopoverCloseOptions as ColorPickerCloseOptions,
	type ColorPickerProps,
	type ColorPickerUpdateOptions,
	ColorPickerAttributes,
	ColorPickerEvents,
	ColorPickerCSSVariables,
	ColorPickerClasses,
	ColorPickerColorSpace,
	PopoverPosition as ColorPickerPosition,
	openPopoverRef as openColorPickerRef,
	closePopoverRef as closeColorPickerRef,
	repositionPopoverRef as repositionColorPickerRef,
	isPopoverRefOpen as isColorPickerRefOpen,
	registerColorPickerRef,
	unregisterColorPickerRef,
	createColorPickerRef,
	updateColorPickerRef
}