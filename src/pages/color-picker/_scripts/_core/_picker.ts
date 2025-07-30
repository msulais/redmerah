import { $, $$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { ObservableStore } from "@/utils/store"
import { DEFAULT_COLOR, DEFAULT_COLOR_IN_CMYK, DEFAULT_COLOR_IN_HSL, DEFAULT_COLOR_IN_HSV, DEFAULT_COLOR_IN_HWB, DEFAULT_COLOR_IN_RGB } from "../_shared/_constant"
import { cmykToRgb, colorContrastRatio, colorToRgb, hslToHsv, hslToRgb, hsvToHex, hsvToHsl, hsvToHwb, hsvToRgb, hwbToHsv, hwbToRgb, rgbToCmyk, rgbToColor, rgbToHex, rgbToHsl, rgbToHsv } from "@/utils/color"
import { safeNumber } from "@/utils/number"
import type { TooltipElement } from "@/components/Tooltip"
import { CSSClasses } from "../../_styles/_css"
import { Math_clamp } from "@/utils/math"
import type { CMYKColor, HEXColor, HSLColor, HSVColor, HWBColor, RGBColor } from "@/types/color"
import type { ButtonElement } from "@/components/Button"
import { pickFile } from "@/utils/file"
import { isTargetValidElement } from "@/utils/element"
import { Commands } from "../_shared/_commands"
import { ColorSpace } from "../_shared/_enums"
import type { ToastElement } from "@/components/Toast"
import { saveStorageItem } from "./_database"
import { pxToRem } from "@/utils/css"

export type PickerStoreType = Readonly<{
	hex: HEXColor
	hsl: HSLColor
	rgb: RGBColor
	hsv: HSVColor
	hwb: HWBColor
	cmyk: CMYKColor
}>

export const PickerStore = new ObservableStore<PickerStoreType>({
	hsl: DEFAULT_COLOR_IN_HSL,
	cmyk: DEFAULT_COLOR_IN_CMYK,
	hex: DEFAULT_COLOR,
	hsv: DEFAULT_COLOR_IN_HSV,
	hwb: DEFAULT_COLOR_IN_HWB,
	rgb: DEFAULT_COLOR_IN_RGB
})

const _previewRef = $(ElementIds.bd_preview) as HTMLOutputElement
const _inputsRef = $$<TooltipElement>('.' + CSSClasses.bodyInputs)
const _toastCopiedRef = $(ElementIds.toa_copied) as ToastElement

// inp = input
const _inp_hexRef = $(ElementIds.bdInp_hex) as HTMLInputElement
const _inp_rgbRef = $(ElementIds.bdInp_rgb) as HTMLInputElement
const _inp_hslRef = $(ElementIds.bdInp_hsl) as HTMLInputElement
const _inp_hsvRef = $(ElementIds.bdInp_hsv) as HTMLInputElement
const _inp_hwbRef = $(ElementIds.bdInp_hwb) as HTMLInputElement
const _inp_cmykRef = $(ElementIds.bdInp_cmyk) as HTMLInputElement

// pic = picker
const _pic_imageImageRef = $(ElementIds.bdPick_imageButton) as ButtonElement
const _pic_imageCanvasRef = $(ElementIds.bdPick_imageCanvas) as HTMLCanvasElement
const _pic_imageWrapperRef = $(ElementIds.bdPick_imageWrapper) as HTMLDivElement
const _pic_rectangleRectRef = $(ElementIds.bdPick_rectangleRect) as HTMLDivElement
const _pic_rectangleHueRef = $(ElementIds.bdPick_rectangleHue) as HTMLInputElement
const _pic_rectangleHslRectRef = $(ElementIds.bdPick_rectangleHslRect) as HTMLDivElement
const _pic_rectangleHslHueRef = $(ElementIds.bdPick_rectangleHslHue) as HTMLInputElement
const _pic_spectrumRectRef = $(ElementIds.bdPick_spectrumRect) as HTMLDivElement
const _pic_spectrumHueRef = $(ElementIds.bdPick_spectrumHue) as HTMLInputElement
const _pic_rgbRedRef = $(ElementIds.bdPick_rgbRed) as HTMLInputElement
const _pic_rgbLabelRedRef = $$(`[for="${CSS.escape(ElementIds.bdPick_rgbRed)}"]`) as HTMLLabelElement
const _pic_rgbGreenRef = $(ElementIds.bdPick_rgbGreen) as HTMLInputElement
const _pic_rgbLabelGreenRef = $$(`[for="${CSS.escape(ElementIds.bdPick_rgbGreen)}"]`) as HTMLLabelElement
const _pic_rgbBlueRef = $(ElementIds.bdPick_rgbBlue) as HTMLInputElement
const _pic_rgbLabelBlueRef = $$(`[for="${CSS.escape(ElementIds.bdPick_rgbBlue)}"]`) as HTMLLabelElement
const _pic_hslHueRef = $(ElementIds.bdPick_hslHue) as HTMLInputElement
const _pic_hslLabelHueRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hslHue)}"]`) as HTMLLabelElement
const _pic_hslSaturationRef = $(ElementIds.bdPick_hslSaturation) as HTMLInputElement
const _pic_hslLabelSaturationRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hslSaturation)}"]`) as HTMLLabelElement
const _pic_hslLightnessRef = $(ElementIds.bdPick_hslLightness) as HTMLInputElement
const _pic_hslLabelLightnessRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hslLightness)}"]`) as HTMLLabelElement
const _pic_cmykCyanRef = $(ElementIds.bdPick_cmykCyan) as HTMLInputElement
const _pic_cmykLabelCyanRef = $$(`[for="${CSS.escape(ElementIds.bdPick_cmykCyan)}"]`) as HTMLLabelElement
const _pic_cmykMagentaRef = $(ElementIds.bdPick_cmykMagenta) as HTMLInputElement
const _pic_cmykLabelMagentaRef = $$(`[for="${CSS.escape(ElementIds.bdPick_cmykMagenta)}"]`) as HTMLLabelElement
const _pic_cmykYellowRef = $(ElementIds.bdPick_cmykYellow) as HTMLInputElement
const _pic_cmykLabelYellowRef = $$(`[for="${CSS.escape(ElementIds.bdPick_cmykYellow)}"]`) as HTMLLabelElement
const _pic_cmykKeyRef = $(ElementIds.bdPick_cmykKey) as HTMLInputElement
const _pic_cmykLabelKeyRef = $$(`[for="${CSS.escape(ElementIds.bdPick_cmykKey)}"]`) as HTMLLabelElement
const _pic_hexRef = $(ElementIds.bdPick_hex) as HTMLInputElement
const _pic_hexLabelRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hex)}"]`) as HTMLLabelElement
const _pic_hsvHueRef = $(ElementIds.bdPick_hsvHue) as HTMLInputElement
const _pic_hsvLabelHueRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hsvHue)}"]`) as HTMLLabelElement
const _pic_hsvSaturationRef = $(ElementIds.bdPick_hsvSaturation) as HTMLInputElement
const _pic_hsvLabelSaturationRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hsvSaturation)}"]`) as HTMLLabelElement
const _pic_hsvValueRef = $(ElementIds.bdPick_hsvValue) as HTMLInputElement
const _pic_hsvLabelValueRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hsvValue)}"]`) as HTMLLabelElement
const _pic_hwbHueRef = $(ElementIds.bdPick_hwbHue) as HTMLInputElement
const _pic_hwbLabelHueRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hwbHue)}"]`) as HTMLLabelElement
const _pic_hwbWhitenessRef = $(ElementIds.bdPick_hwbWhiteness) as HTMLInputElement
const _pic_hwbLabelWhitenessRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hwbWhiteness)}"]`) as HTMLLabelElement
const _pic_hwbBlacknessRef = $(ElementIds.bdPick_hwbBlackness) as HTMLInputElement
const _pic_hwbLabelBlacknessRef = $$(`[for="${CSS.escape(ElementIds.bdPick_hwbBlackness)}"]`) as HTMLLabelElement

function _updatePickerRefsView(color: PickerStoreType): void {
	const isFocus = (el: Element) => el.matches(':focus')
	const round = (v: number) => Math.round(v)
	const hsl = color.hsl
	const hex = color.hex.toUpperCase()
	const hsv = color.hsv
	const rgb = color.rgb
	const value = rgbToColor(rgb)
	const hwb = color.hwb
	const cmyk = color.cmyk
	const contrast = (rgb: RGBColor) => colorContrastRatio(rgb, {r: 0, g: 0, b: 0}) > 50? '#000' : '#fff'
	const style = (ref: HTMLElement, property: string, value: string) => ref.style.setProperty(property, value)
	requestAnimationFrame(() => {
		RECTANGLE_RECT: {
			const ref = _pic_rectangleRectRef
			style(ref, '--color', hex)
			style(ref, '--hue', hsv.h * 360 + '')
			style(ref, '--border-color', contrast(rgb))
			if (isFocus(ref)) {break RECTANGLE_RECT}

			style(ref, '--position-x', hsv.s * 100 + '%')
			style(ref, '--position-y', (1-hsv.v) * 100 + '%')
		}
		RECTANGLE_HUE: {
			const ref = _pic_rectangleHueRef
			style(ref, '--color', `hsl(${round(hsl.h * 360)},100%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: hsl.h, s: 1, l: .5})))
			if (isFocus(ref)) {break RECTANGLE_HUE}

			ref.value = round(hsv.h * 360) + ''
		}
		RECTANGLE_HSL_RECT: {
			const ref = _pic_rectangleHslRectRef
			style(ref, '--color', hex)
			style(ref, '--hue', hsl.h * 360 + '')
			style(ref, '--border-color', contrast(rgb))
			if (isFocus(ref)) {break RECTANGLE_HSL_RECT}

			style(ref, '--position-x', hsl.s * 100 + '%')
			style(ref, '--position-y', (1-hsl.l) * 100 + '%')
		}
		RECTANGLE_HSL_HUE: {
			const ref = _pic_rectangleHslHueRef
			style(ref, '--color', `hsl(${round(hsl.h * 360)},100%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: hsl.h, s: 1, l: .5})))
			if (isFocus(ref)) {break RECTANGLE_HSL_HUE}

			ref.value = round(hsl.h * 360) + ''
		}
		SPECTRUM_RECT: {
			const ref = _pic_spectrumRectRef
			style(ref, '--color', hsvToHex({...hsv, v: 1}))
			style(ref, '--border-color', contrast(hsvToRgb({...hsv, v: 1})))
			if (isFocus(ref)) {break SPECTRUM_RECT}

			style(ref, '--position-x', hsv.h * 100 + '%')
			style(ref, '--position-y', (1-hsv.s) * 100 + '%')
		}
		SPECTRUM_HUE: {
			const ref = _pic_spectrumHueRef
			style(ref, '--max-value-color', hsvToHex({...hsv, v: 1}))
			style(ref, '--color', hex)
			style(ref, '--border-color', contrast(rgb))
			if (isFocus(ref)) {break SPECTRUM_HUE}

			ref.value = (1 - hsv.v) * 100 + ''
		}
		RGB_RED: {
			const ref = _pic_rgbRedRef
			style(ref, '--color', `rgb(${round(rgb.r * 0xff)},0,0)`)
			style(ref, '--border-color', contrast({...rgb, g: 0, b: 0}))
			_pic_rgbLabelRedRef.textContent = `Red: ${round(rgb.r * 0xff)} (${round(rgb.r * 100)}%)`
			if (isFocus(ref)) {break RGB_RED}

			ref.value = round(rgb.r * 0xff) + ''
		}
		RGB_GREEN: {
			const ref = _pic_rgbGreenRef
			style(ref, '--color', `rgb(0,${round(rgb.g * 0xff)},0)`)
			style(ref, '--border-color', contrast({...rgb, r: 0, b: 0}))
			_pic_rgbLabelGreenRef.textContent = `Green: ${round(rgb.g * 0xff)} (${round(rgb.g * 100)}%)`
			if (isFocus(ref)) {break RGB_GREEN}

			ref.value = round(rgb.g * 0xff) + ''
		}
		RGB_BLUE: {
			const ref = _pic_rgbBlueRef
			style(ref, '--color', `rgb(0,0,${round(rgb.b * 0xff)})`)
			style(ref, '--border-color', contrast({...rgb, r: 0, g: 0}))
			_pic_rgbLabelBlueRef.textContent = `Blue: ${round(rgb.b * 0xff)} (${round(rgb.b * 100)}%)`
			if (isFocus(ref)) {break RGB_BLUE}

			ref.value = round(rgb.b * 0xff) + ''
		}
		HSL_HUE: {
			const ref = _pic_hslHueRef
			style(ref, '--color', `hsl(${round(hsl.h * 360)},100%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({...hsl, s: 1, l: 0.5})))
			_pic_hslLabelHueRef.textContent = `Hue: ${round(hsl.h * 360)}° (${round(hsl.h * 100)}%)`
			if (isFocus(ref)) {break HSL_HUE}

			ref.value = round(hsl.h * 360) + ''
		}
		HSL_SATURATION: {
			const ref = _pic_hslSaturationRef
			style(ref, '--hue', round(hsl.h * 360) + '')
			style(ref, '--color', `hsl(${round(hsl.h * 360)},${round(hsl.s * 100)}%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({...hsl, l: 0.5})))
			_pic_hslLabelSaturationRef.textContent = `Saturation: ${round(hsl.s * 100)}%`
			if (isFocus(ref)) {break HSL_SATURATION}

			ref.value = round(hsl.s * 100) + ''
		}
		HUE_LIGHTNESS: {
			const ref = _pic_hslLightnessRef
			style(ref, '--color', `hsl(0,0%,${round(hsl.l * 100)}%)`)
			style(ref, '--border-color', contrast(hslToRgb({...hsl, h: 0, s: 0})))
			_pic_hslLabelLightnessRef.textContent = `Lightness: ${round(hsl.l * 100)}%`
			if (isFocus(ref)) {break HUE_LIGHTNESS}

			ref.value = round(hsl.l * 100) + ''
		}
		CMYK_CYAN: {
			const ref = _pic_cmykCyanRef
			style(ref, '--color', `hsl(180,100%,${cmyk.c * 50}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 180 / 360, s: 1, l: cmyk.c * 0.5})))
			_pic_cmykLabelCyanRef.textContent = `Cyan: ${round(cmyk.c * 100)}%`
			if (isFocus(ref)) {break CMYK_CYAN}

			ref.value = round(cmyk.c * 100) + ''
		}
		CMYK_MAGENTA: {
			const ref = _pic_cmykMagentaRef
			style(ref, '--color', `hsl(300,100%,${cmyk.m * 50}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 300 / 360, s: 1, l: cmyk.m * 0.5})))
			_pic_cmykLabelMagentaRef.textContent = `Magenta: ${round(cmyk.m * 100)}%`
			if (isFocus(ref)) {break CMYK_MAGENTA}

			ref.value = round(cmyk.m * 100) + ''
		}
		CMYK_YELLOW: {
			const ref = _pic_cmykYellowRef
			style(ref, '--color', `hsl(60,100%,${cmyk.y * 50}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 60 / 360, s: 1, l: cmyk.y * 0.5})))
			_pic_cmykLabelYellowRef.textContent = `Yellow: ${round(cmyk.y * 100)}%`
			if (isFocus(ref)) {break CMYK_YELLOW}

			ref.value = round(cmyk.y * 100) + ''
		}
		CMYK_KEY: {
			const ref = _pic_cmykKeyRef
			style(ref, '--color', `hsl(0,0%,${(1-cmyk.k) * 100}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 0, s: 0, l: (1-cmyk.k)})))
			_pic_cmykLabelKeyRef.textContent = `Key/Black: ${round(cmyk.k * 100)}%`
			if (isFocus(ref)) {break CMYK_KEY}

			ref.value = round(cmyk.k * 100) + ''
		}
		HEX: {
			const ref = _pic_hexRef
			style(ref, '--color', hex)
			style(ref, '--border-color', contrast(rgb))
			_pic_hexLabelRef.textContent = `Hex: ${hex} (${value})`
			if (isFocus(ref)) {break HEX}

			ref.value = value + ''
		}
		HSV_HUE: {
			const ref = _pic_hsvHueRef
			style(ref, '--color', hsvToHex({...hsv, s: 1, v: 1}))
			style(ref, '--border-color', contrast(hsvToRgb({...hsv, s: 1, v: 1})))
			_pic_hsvLabelHueRef.textContent = `Hue: ${round(hsv.h * 360)}° (${round(hsv.h * 100)}%)`
			if (isFocus(ref)) {break HSV_HUE}

			ref.value = round(hsv.h * 360) + ''
		}
		HSV_SATURATION: {
			const ref = _pic_hsvSaturationRef
			style(ref, '--hue', round(hsv.h * 360) + '')
			style(ref, '--color', hsvToHex({...hsv, v: 1}))
			style(ref, '--border-color', contrast(hsvToRgb({...hsv, v: 1})))
			_pic_hsvLabelSaturationRef.textContent = `Saturation: ${round(hsv.s * 100)}%`
			if (isFocus(ref)) {break HSV_SATURATION}

			ref.value = round(hsv.s * 100) + ''
		}
		HSV_VALUE: {
			const ref = _pic_hsvValueRef
			style(ref, '--max-value-color', hsvToHex({...hsv, v: 1}))
			style(ref, '--color', hex)
			style(ref, '--border-color', contrast(rgb))
			_pic_hsvLabelValueRef.textContent = `Value: ${round(hsv.v * 100)}%`
			if (isFocus(ref)) {break HSV_VALUE}

			ref.value = round(hsv.v * 100) + ''
		}
		HWB_HUE: {
			const ref = _pic_hwbHueRef
			style(ref, '--color', `hwb(${round(hwb.h * 360)} 0% 0%)`)
			style(ref, '--border-color', contrast(hwbToRgb({...hwb, w: 0, b: 0})))
			_pic_hwbLabelHueRef.textContent = `Hue: ${round(hwb.h * 360)}° (${round(hwb.h * 100)}%)`
			if (isFocus(ref)) {break HWB_HUE}

			ref.value = round(hwb.h * 360) + ''
		}
		HWB_WHITENESS: {
			const ref = _pic_hwbWhitenessRef
			style(ref, '--hue', round(hwb.h * 360) + '')
			style(ref, '--color', `hwb(${round(hwb.h * 360)} ${round(hwb.w * 100)}% 0%)`)
			style(ref, '--border-color', contrast(hwbToRgb({...hwb, b: 0})))
			_pic_hwbLabelWhitenessRef.textContent = `Whiteness: ${round(hwb.w * 100)}%`
			if (isFocus(ref)) {break HWB_WHITENESS}

			ref.value = round(hwb.w * 100) + ''
		}
		HWB_BLACKNESS: {
			const ref = _pic_hwbBlacknessRef
			style(ref, '--hue', round(hwb.h * 360) + '')
			style(ref, '--color', `hwb(${round(hwb.h * 360)} 0% ${round(hwb.b * 100)}%)`)
			style(ref, '--border-color', contrast(hwbToRgb({...hwb, w: 0})))
			_pic_hwbLabelBlacknessRef.textContent = `Blackness: ${round(hwb.b * 100)}%`
			if (isFocus(ref)) {break HWB_BLACKNESS}

			ref.value = round(hwb.b * 100) + ''
		}
	})
}

function _updateInputRefsView(color: PickerStoreType): void {
	const isFocus = (el: Element) => el.matches(':focus')
	const round = (v: number) => Math.round(v)
	if (!isFocus(_inp_hexRef)) {
		_inp_hexRef.value = color.hex.toUpperCase()
	}
	if (!isFocus(_inp_rgbRef)) {
		const rgb = color.rgb
		_inp_rgbRef.value = [
			round(rgb.r * 0xff),
			round(rgb.g * 0xff),
			round(rgb.b * 0xff),
		].join(', ')
	}
	if (!isFocus(_inp_hslRef)) {
		const hsl = color.hsl
		_inp_hslRef.value = [
			round(hsl.h * 360) + '°',
			round(hsl.s * 100) + '%',
			round(hsl.l * 100) + '%',
		].join(', ')
	}
	if (!isFocus(_inp_hsvRef)) {
		const hsv = color.hsv
		_inp_hsvRef.value = [
			round(hsv.h * 360) + '°',
			round(hsv.s * 100) + '%',
			round(hsv.v * 100) + '%',
		].join(', ')
	}
	if (!isFocus(_inp_hwbRef)) {
		const hwb = color.hwb
		_inp_hwbRef.value = [
			round(hwb.h * 360) + '°',
			round(hwb.w * 100) + '%',
			round(hwb.b * 100) + '%',
		].join(', ')
	}
	if (!isFocus(_inp_cmykRef)) {
		const cmyk = color.cmyk
		_inp_cmykRef.value = [
			round(cmyk.c * 100) + '%',
			round(cmyk.m * 100) + '%',
			round(cmyk.y * 100) + '%',
			round(cmyk.k * 100) + '%',
		].join(', ')
	}
}

function _subscribeColorRefView(v: PickerStoreType, o: PickerStoreType): void {
	if (v.hex === o.hex) {return}

	requestAnimationFrame(() => {
		_previewRef.style.setProperty('background-color', v.hex)
		_updateInputRefsView(v)
		_updatePickerRefsView(v)
	})
}

function _subscribeColorChanges(v: PickerStoreType, o: PickerStoreType): void {
	if (v.hex === o.hex) {return}

	saveStorageItem('color', rgbToColor(v.rgb))
}

function _initSubscriber(): void {
	PickerStore.subscribe(_subscribeColorRefView)
	PickerStore.subscribe(_subscribeColorChanges)
}

function _initEvents(): void {
	function inputs(): void {
		_inp_hexRef.addEventListener('input', () => {
			const value = safeNumber(Number.parseInt(_inp_hexRef.value.replace(/[^0-9A-Fa-f]/g, ''), 16))
			const rgb = colorToRgb(value)
			const hex = rgbToHex(rgb)
			const hsv = rgbToHsv(rgb)
			const hsl = hsvToHsl(hsv)
			const cmyk = rgbToCmyk(rgb)
			const hwb = hsvToHwb(hsv)
			PickerStore.update(v =>{
				v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
			})
		})

		_inp_rgbRef.addEventListener('input', () => {
			const v = _inp_rgbRef
				.value
				.replace(/[^0-9,.]/gs, '')
				.split(',')
				.map(v => Math_clamp(safeNumber(Number.parseInt(v)), 0, 0xff))
			while (v.length < 3) {
				v.push(0)
			}

			const rgb: RGBColor = {r: v[0] / 0xff, g: v[1] / 0xff, b: v[2] / 0xff}
			const hsl = rgbToHsl(rgb)
			const hex = rgbToHex(rgb)
			const hsv = hslToHsv(hsl)
			const cmyk = rgbToCmyk(rgb)
			const hwb = hsvToHwb(hsv)
			PickerStore.update(v =>{
				v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
			})
		})

		_inp_hslRef.addEventListener('input', () => {
			const v = _inp_hslRef
				.value
				.replace(/[^0-9,.]/gs, '')
				.split(',')
				.map((v, i) => Math_clamp(safeNumber(Number.parseFloat(v)), 0, i === 0? 360 : 100))
			while (v.length < 3) {
				v.push(0)
			}

			const hsl = {h: v[0] / 360, s: v[1] / 100, l: v[2] / 100}
			const rgb = hslToRgb(hsl)
			const hex = rgbToHex(rgb)
			const hsv = hslToHsv(hsl)
			const cmyk = rgbToCmyk(rgb)
			const hwb = hsvToHwb(hsv)
			PickerStore.update(v =>{
				v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
			})
		})

		_inp_hsvRef.addEventListener('input', () => {
			const v = _inp_hsvRef
				.value
				.replace(/[^0-9,.]/gs, '')
				.split(',')
				.map((v, i) => Math_clamp(safeNumber(Number.parseFloat(v)), 0, i === 0? 360 : 100))
			while (v.length < 3) {
				v.push(0)
			}

			const hsv: HSVColor = {h: v[0] / 360, s: v[1] / 100, v: v[2] / 100}
			const rgb = hsvToRgb(hsv)
			const hex = rgbToHex(rgb)
			const cmyk = rgbToCmyk(rgb)
			const hwb = hsvToHwb(hsv)
			const hsl = hsvToHsl(hsv)
			PickerStore.update(v =>{
				v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
			})
		})

		_inp_hwbRef.addEventListener('input', () => {
			const v = _inp_hwbRef
				.value
				.replace(/[^0-9,.]/gs, '')
				.split(',')
				.map((v, i) => Math_clamp(safeNumber(Number.parseFloat(v)), 0, i === 0? 360 : 100))
			while (v.length < 3) {
				v.push(0)
			}

			const hwb: HWBColor = {h: v[0] / 360, w: v[1] / 100, b: v[2] / 100}
			const rgb = hwbToRgb(hwb)
			const hex = rgbToHex(rgb)
			const cmyk = rgbToCmyk(rgb)
			const hsv = hwbToHsv(hwb)
			const hsl = hsvToHsl(hsv)
			PickerStore.update(v =>{
				v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
			})
		})

		_inp_cmykRef.addEventListener('input', () => {
			const v = _inp_cmykRef
				.value
				.replace(/[^0-9,.]/gs, '')
				.split(',')
				.map(v => Math_clamp(safeNumber(Number.parseFloat(v)), 0, 100))
			while (v.length < 4) {
				v.push(0)
			}

			const cmyk: CMYKColor = {c: v[0] / 100, m: v[1] / 100, y: v[2] / 100, k: v[3] / 100}
			const rgb = cmykToRgb(cmyk)
			const hex = rgbToHex(rgb)
			const hsv = rgbToHsv(rgb)
			const hsl = rgbToHsl(rgb)
			const hwb = hsvToHwb(hsv)
			PickerStore.update(v =>{
				v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
			})
		})
	}

	function pickers(): void {
		function rectangle(): void {
			let isDragging = false
			let rect: DOMRect = _pic_rectangleRectRef.getBoundingClientRect()
			const updateColor = (clientX: number, clientY: number) => {
				const x = Math_clamp((clientX - rect.left) / rect.width * 100, 0, 100)
				const y = Math_clamp((clientY - rect.top) / rect.height * 100, 0, 100)
				const hsv = {...PickerStore.value.hsv, s: x / 100, v: (100-y) / 100}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
				requestAnimationFrame(() => {
					_pic_rectangleRectRef.style.setProperty('--position-x', x + '%')
					_pic_rectangleRectRef.style.setProperty('--position-y', y + '%')
				})
			}
			const onPointerUp = (ev: PointerEvent) => {
				isDragging = false
				_pic_rectangleRectRef.releasePointerCapture(ev.pointerId)
			}
			_pic_rectangleRectRef.addEventListener('pointerdown', (ev) => {
				_pic_rectangleRectRef.setPointerCapture(ev.pointerId)
				rect = _pic_rectangleRectRef.getBoundingClientRect()
				isDragging = true
				updateColor(ev.clientX, ev.clientY)
			})

			_pic_rectangleRectRef.addEventListener('pointermove', (ev) => {
				if (!isDragging) {return}
				updateColor(ev.clientX, ev.clientY)
			})

			_pic_rectangleRectRef.addEventListener('pointerup', onPointerUp)
			_pic_rectangleRectRef.addEventListener('pointercancel', onPointerUp)

			_pic_rectangleHueRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_rectangleHueRef.valueAsNumber, 0, 360)
				const hsv = {...PickerStore.value.hsv, h: value / 360}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
		}

		function rectangleHsl(): void {
			let isDragging = false
			let rect: DOMRect = _pic_rectangleHslRectRef.getBoundingClientRect()
			const updateColor = (clientX: number, clientY: number) => {
				const x = Math_clamp((clientX - rect.left) / rect.width * 100, 0, 100)
				const y = Math_clamp((clientY - rect.top) / rect.height * 100, 0, 100)
				const hsl = {...PickerStore.value.hsl, s: x / 100, l: (100-y) / 100}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
				requestAnimationFrame(() => {
					_pic_rectangleHslRectRef.style.setProperty('--position-x', x + '%')
					_pic_rectangleHslRectRef.style.setProperty('--position-y', y + '%')
				})
			}
			const onPointerUp = (ev: PointerEvent) => {
				isDragging = false
				_pic_rectangleHslRectRef.releasePointerCapture(ev.pointerId)
			}

			_pic_rectangleHslRectRef.addEventListener('pointerdown', (ev) => {
				_pic_rectangleHslRectRef.setPointerCapture(ev.pointerId)
				rect = _pic_rectangleHslRectRef.getBoundingClientRect()
				isDragging = true
				updateColor(ev.clientX, ev.clientY)
			})

			_pic_rectangleHslRectRef.addEventListener('pointermove', (ev) => {
				if (!isDragging) {return}
				updateColor(ev.clientX, ev.clientY)
			})

			_pic_rectangleHslRectRef.addEventListener('pointerup', onPointerUp)
			_pic_rectangleHslRectRef.addEventListener('pointercancel', onPointerUp)

			_pic_rectangleHslHueRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_rectangleHslHueRef.valueAsNumber, 0, 360)
				const hsl = {...PickerStore.value.hsl, h: value / 360}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hsv = hslToHsv(hsl)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
		}

		function spectrum(): void {
			let isDragging = false
			let rect: DOMRect = _pic_spectrumRectRef.getBoundingClientRect()
			const updateColor = (clientX: number, clientY: number) => {
				const x = Math_clamp((clientX - rect.left) / rect.width * 100, 0, 100)
				const y = Math_clamp((clientY - rect.top) / rect.height * 100, 0, 100)
				const hsv = {...PickerStore.value.hsv, h: x / 100, s: (100 - y) / 100}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
				requestAnimationFrame(() => {
					_pic_spectrumRectRef.style.setProperty('--position-x', x + '%')
					_pic_spectrumRectRef.style.setProperty('--position-y', y + '%')
				})
			}
			const onPointerUp = (ev: PointerEvent) => {
				isDragging = false
				_pic_spectrumRectRef.releasePointerCapture(ev.pointerId)
			}

			_pic_spectrumRectRef.addEventListener('pointerdown', (ev) => {
				_pic_spectrumRectRef.setPointerCapture(ev.pointerId)
				rect = _pic_spectrumRectRef.getBoundingClientRect()
				isDragging = true
				updateColor(ev.clientX, ev.clientY)
			})

			_pic_spectrumRectRef.addEventListener('pointermove', (ev) => {
				if (!isDragging) {return}
				updateColor(ev.clientX, ev.clientY)
			})

			_pic_spectrumRectRef.addEventListener('pointerup', onPointerUp)
			_pic_spectrumRectRef.addEventListener('pointercancel', onPointerUp)

			_pic_spectrumHueRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_spectrumHueRef.valueAsNumber, 0, 100)
				const hsv = {...PickerStore.value.hsv, v: 1 - (value / 100)}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
		}

		function sliderRgb(): void {
			_pic_rgbRedRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_rgbRedRef.valueAsNumber, 0, 0xff)
				const rgb = {...PickerStore.value.rgb, r: value / 0xff}
				const hsl = rgbToHsl(rgb)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})

			_pic_rgbGreenRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_rgbGreenRef.valueAsNumber, 0, 0xff)
				const rgb = {...PickerStore.value.rgb, g: value / 0xff}
				const hsl = rgbToHsl(rgb)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})

			_pic_rgbBlueRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_rgbBlueRef.valueAsNumber, 0, 0xff)
				const rgb = {...PickerStore.value.rgb, b: value / 0xff}
				const hsl = rgbToHsl(rgb)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
		}

		function sliderHsl(): void {
			_pic_hslHueRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hslHueRef.valueAsNumber, 0, 360)
				const hsl = {...PickerStore.value.hsl, h: value / 360}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
			_pic_hslSaturationRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hslSaturationRef.valueAsNumber, 0, 100)
				const hsl = {...PickerStore.value.hsl, s: value / 100}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
			_pic_hslLightnessRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hslLightnessRef.valueAsNumber, 0, 100)
				const hsl = {...PickerStore.value.hsl, l: value / 100}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
		}

		function sliderCmyk(): void {
			_pic_cmykCyanRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_cmykCyanRef.valueAsNumber, 0, 100)
				const cmyk = {...PickerStore.value.cmyk, c: value / 100}
				const rgb = cmykToRgb(cmyk)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = rgbToHsl(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
			_pic_cmykMagentaRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_cmykMagentaRef.valueAsNumber, 0, 100)
				const cmyk = {...PickerStore.value.cmyk, m: value / 100}
				const rgb = cmykToRgb(cmyk)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = rgbToHsl(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
			_pic_cmykYellowRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_cmykYellowRef.valueAsNumber, 0, 100)
				const cmyk = {...PickerStore.value.cmyk, y: value / 100}
				const rgb = cmykToRgb(cmyk)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = rgbToHsl(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
			_pic_cmykKeyRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_cmykKeyRef.valueAsNumber, 0, 100)
				const cmyk = {...PickerStore.value.cmyk, k: value / 100}
				const rgb = cmykToRgb(cmyk)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = rgbToHsl(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
		}

		function sliderHex(): void {
			_pic_hexRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hexRef.valueAsNumber, 0, 0xffffff)
				const rgb = colorToRgb(value)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = hsvToHsl(hsv)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
		}

		function sliderHsv(): void {
			_pic_hsvHueRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hsvHueRef.valueAsNumber, 0, 360)
				const hsv = {...PickerStore.value.hsv, h: value / 360}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})

			_pic_hsvSaturationRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hsvSaturationRef.valueAsNumber, 0, 100)
				const hsv = {...PickerStore.value.hsv, s: value / 100}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})

			_pic_hsvValueRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hsvValueRef.valueAsNumber, 0, 100)
				const hsv = {...PickerStore.value.hsv, v: value / 100}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
		}

		function sliderHwb(): void {
			_pic_hwbHueRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hwbHueRef.valueAsNumber, 0, 360)
				const hwb = {...PickerStore.value.hwb, h: value / 360}
				const rgb = hwbToRgb(hwb)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hsv = hwbToHsv(hwb)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})

			_pic_hwbWhitenessRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hwbWhitenessRef.valueAsNumber, 0, 100)
				const hwb = {...PickerStore.value.hwb, w: value / 100}
				hwb.b = Math_clamp(hwb.b, 0, 1 - hwb.w)
				const rgb = hwbToRgb(hwb)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hsv = hwbToHsv(hwb)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})

			_pic_hwbBlacknessRef.addEventListener('input', () => {
				const value = Math_clamp(_pic_hwbBlacknessRef.valueAsNumber, 0, 100)
				const hwb = {...PickerStore.value.hwb, b: value / 100}
				hwb.w = Math_clamp(hwb.w, 0, 1 - hwb.b)
				const rgb = hwbToRgb(hwb)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hsv = hwbToHsv(hwb)
				const hsl = hsvToHsl(hsv)
				PickerStore.update(v =>{
					v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
				})
			})
		}

		rectangle()
		rectangleHsl()
		spectrum()
		sliderRgb()
		sliderHsl()
		sliderCmyk()
		sliderHex()
		sliderHsv()
		sliderHwb()
	}

	function init(): void {
		_inputsRef?.addEventListener('focusout', (ev) => {
			if (!(ev.target instanceof HTMLInputElement)) {return}

			_updateInputRefsView(PickerStore.value)
		})

		_inputsRef?.addEventListener('click', () => {
			const targetRef = document.activeElement as HTMLButtonElement
			if (!isTargetValidElement(_inputsRef, targetRef)) {return}

			const dataset = targetRef.dataset
			const command = dataset.command as Commands
			switch (command) {
			case Commands.copyColor: {
				const colorSpace = dataset.colorSpace as ColorSpace
				let text = ''
				sw2: switch (colorSpace) {
				case ColorSpace.hex : text = _inp_hexRef .value; break sw2
				case ColorSpace.rgb : text = _inp_rgbRef .value; break sw2
				case ColorSpace.hsl : text = _inp_hslRef .value; break sw2
				case ColorSpace.hsv : text = _inp_hsvRef .value; break sw2
				case ColorSpace.hwb : text = _inp_hwbRef .value; break sw2
				case ColorSpace.cmyk: text = _inp_cmykRef.value; break sw2
				}

				if (text.trim().length === 0) {break}

				navigator.clipboard.writeText(text).then(() => {
					_toastCopiedRef.showPopover()
				})
			} break }
		})
	}

	inputs()
	pickers()
	init()
}

function _initImageColorPicker(): void {
	const contrast = (rgb: RGBColor) => colorContrastRatio(rgb, {r: 0, g: 0, b: 0}) > 50? '#000000' : '#ffffff'
	let ctx: CanvasRenderingContext2D
	let posX: number = 0 // 0-100
	let posY: number = 0 // 0-100
	let image = new Image()
	let isDragging = false
	let rect: DOMRect = _pic_imageCanvasRef.getBoundingClientRect()

	function onPointerUp(ev: PointerEvent){
		isDragging = false
		_pic_spectrumRectRef.releasePointerCapture(ev.pointerId)
	}

	function initObserver(): void {
		const observer = new ResizeObserver(() => {
			_pic_imageWrapperRef.style.setProperty(
				'max-height',
				pxToRem(_pic_imageCanvasRef.getBoundingClientRect().height) + 'rem'
			)
		})

		observer.observe(_pic_imageCanvasRef, {box: 'border-box'})
	}

	function initEvents(): void {
		function updatePosition(x: number, y: number): void {
			posX = Math_clamp((x - rect.left) / rect.width * 100, 0, 100)
			posY = Math_clamp((y - rect.top) / rect.height * 100, 0, 100)
			updateColor(pickColor())
			requestAnimationFrame(() => {
				_pic_imageWrapperRef.style.setProperty('--position-x', posX + '%')
				_pic_imageWrapperRef.style.setProperty('--position-y', posY + '%')
			})
		}

		_pic_imageImageRef.addEventListener('click', () => {
			pickFile('image/*', false).then((files) => {
				if (!files || files?.length == 0) return;

				for (const file of files) {
					if (!/^image/.test(file.type)) continue

					URL.revokeObjectURL(image.src)
					image.src = URL.createObjectURL(file)
					break
				}
			})
		})

		_pic_imageCanvasRef.addEventListener('pointerdown', ev => {
			_pic_imageCanvasRef.setPointerCapture(ev.pointerId)
			rect = _pic_imageCanvasRef.getBoundingClientRect()
			isDragging = true
			updatePosition(ev.clientX, ev.clientY)
		})

		_pic_imageCanvasRef.addEventListener('pointermove', (ev) => {
			if (!isDragging) {return}

			updatePosition(ev.clientX, ev.clientY)
		})

		_pic_imageCanvasRef.addEventListener('pointerup', onPointerUp)
		_pic_imageCanvasRef.addEventListener('pointercancel', onPointerUp)
	}

	function updateColor(rgb: RGBColor): void {
		const hsl = rgbToHsl(rgb)
		const hex = rgbToHex(rgb)
		const hsv = hslToHsv(hsl)
		const cmyk = rgbToCmyk(rgb)
		const hwb = hsvToHwb(hsv)
		PickerStore.update(v =>{
			v.rgb = rgb; v.hex = hex; v.hsv = hsv; v.hsl = hsl; v.cmyk = cmyk; v.hwb = hwb
		})
		requestAnimationFrame(() => {
			_pic_imageWrapperRef.style.setProperty('--color', rgbToHex(rgb))
			_pic_imageWrapperRef.style.setProperty('--border-color', contrast(rgb))
		})
	}

	function pickColor(): RGBColor {
		const data = ctx.getImageData(
			posX / 100 * _pic_imageCanvasRef.width,
			posY / 100 * _pic_imageCanvasRef.height,
			1, 1
		).data
		return {
			r: data[0] / 0xff,
			g: data[1] / 0xff,
			b: data[2] / 0xff
		}
	}

	function initCanvas(): void {
		ctx = _pic_imageCanvasRef.getContext('2d', {
			willReadFrequently: true
		})!
		image.onload = () => {
			_pic_imageCanvasRef.width = image.naturalWidth
			_pic_imageCanvasRef.height = image.naturalHeight
			ctx.drawImage(image, 0, 0)
			_pic_imageWrapperRef.removeAttribute('data-no-image')
			updateColor(pickColor())
			_pic_imageWrapperRef.style.setProperty(
				'max-height',
				pxToRem(_pic_imageCanvasRef.getBoundingClientRect().height) + 'rem'
			)
		}
	}

	initObserver()
	initCanvas()
	initEvents()
}

export default () => {
	_initEvents()
	_initSubscriber()
	_initImageColorPicker()
}