import { $, $$ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { ObservableStore } from "@/utils/store"
import { DEFAULT_COLOR, DEFAULT_COLOR_IN_CMYK, DEFAULT_COLOR_IN_HSL, DEFAULT_COLOR_IN_HSV, DEFAULT_COLOR_IN_HWB, DEFAULT_COLOR_IN_RGB } from "../_shared/_constant"
import { cmykToRgb, colorContrastPercentage, colorToRgb, hslToHsv, hslToRgb, hsvToHex, hsvToHsl, hsvToHwb, hsvToRgb, hwbToHsv, hwbToRgb, rgbToCmyk, rgbToColor, rgbToHex, rgbToHsl, rgbToHsv } from "@/utils/color"
import { safeNumber } from "@/utils/number"
import { CTooltip } from "@/components/Tooltip"
import { CSSClasses } from "../../_styles/_css"
import { Math_clamp } from "@/utils/math"
import type { CMYKColor, HEXColor, HSLColor, HSVColor, HWBColor, RGBColor } from "@/types/color"
import { CButton } from "@/components/Button"
import { pickFile } from "@/utils/file"
import { isTargetValidElement } from "@/utils/element"
import { Commands } from "../_shared/_commands"
import { ColorSpace } from "../_shared/_enums"
import { CToast } from "@/components/Toast"
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

const _ref_preview = $(ElementIds.bd_preview) as HTMLOutputElement
const _ref_inputs = $$<CTooltip.CElement>('.' + CSSClasses.bodyInputs)
const _ref_toastCopied = $(ElementIds.toa_copied) as CToast.CElement

// inp = input
const _ref_inp_hex = $(ElementIds.bdInp_hex) as HTMLInputElement
const _ref_inp_rgb = $(ElementIds.bdInp_rgb) as HTMLInputElement
const _ref_inp_hsl = $(ElementIds.bdInp_hsl) as HTMLInputElement
const _ref_inp_hsv = $(ElementIds.bdInp_hsv) as HTMLInputElement
const _ref_inp_hwb = $(ElementIds.bdInp_hwb) as HTMLInputElement
const _ref_inp_cmyk = $(ElementIds.bdInp_cmyk) as HTMLInputElement

// pic = picker
const _ref_pic_imageImage = $(ElementIds.bdPick_imageButton) as CButton.CElement
const _ref_pic_imageCanvas = $(ElementIds.bdPick_imageCanvas) as HTMLCanvasElement
const _ref_pic_imageWrapper = $(ElementIds.bdPick_imageWrapper) as HTMLDivElement
const _ref_pic_rectangleRect = $(ElementIds.bdPick_rectangleRect) as HTMLDivElement
const _ref_pic_rectangleHue = $(ElementIds.bdPick_rectangleHue) as HTMLInputElement
const _ref_pic_rectangleHslRect = $(ElementIds.bdPick_rectangleHslRect) as HTMLDivElement
const _ref_pic_rectangleHslHue = $(ElementIds.bdPick_rectangleHslHue) as HTMLInputElement
const _ref_pic_spectrumRect = $(ElementIds.bdPick_spectrumRect) as HTMLDivElement
const _ref_pic_spectrumHue = $(ElementIds.bdPick_spectrumHue) as HTMLInputElement
const _ref_pic_rgbRed = $(ElementIds.bdPick_rgbRed) as HTMLInputElement
const _ref_pic_rgbLabelRed = $$(`[for="${CSS.escape(ElementIds.bdPick_rgbRed)}"]`) as HTMLLabelElement
const _ref_pic_rgbGreen = $(ElementIds.bdPick_rgbGreen) as HTMLInputElement
const _ref_pic_rgbLabelGreen = $$(`[for="${CSS.escape(ElementIds.bdPick_rgbGreen)}"]`) as HTMLLabelElement
const _ref_pic_rgbBlue = $(ElementIds.bdPick_rgbBlue) as HTMLInputElement
const _ref_pic_rgbLabelBlue = $$(`[for="${CSS.escape(ElementIds.bdPick_rgbBlue)}"]`) as HTMLLabelElement
const _ref_pic_hslHue = $(ElementIds.bdPick_hslHue) as HTMLInputElement
const _ref_pic_hslLabelHue = $$(`[for="${CSS.escape(ElementIds.bdPick_hslHue)}"]`) as HTMLLabelElement
const _ref_pic_hslSaturation = $(ElementIds.bdPick_hslSaturation) as HTMLInputElement
const _ref_pic_hslLabelSaturation = $$(`[for="${CSS.escape(ElementIds.bdPick_hslSaturation)}"]`) as HTMLLabelElement
const _ref_pic_hslLightness = $(ElementIds.bdPick_hslLightness) as HTMLInputElement
const _ref_pic_hslLabelLightness = $$(`[for="${CSS.escape(ElementIds.bdPick_hslLightness)}"]`) as HTMLLabelElement
const _ref_pic_cmykCyan = $(ElementIds.bdPick_cmykCyan) as HTMLInputElement
const _ref_pic_cmykLabelCyan = $$(`[for="${CSS.escape(ElementIds.bdPick_cmykCyan)}"]`) as HTMLLabelElement
const _ref_pic_cmykMagenta = $(ElementIds.bdPick_cmykMagenta) as HTMLInputElement
const _ref_pic_cmykLabelMagenta = $$(`[for="${CSS.escape(ElementIds.bdPick_cmykMagenta)}"]`) as HTMLLabelElement
const _ref_pic_cmykYellow = $(ElementIds.bdPick_cmykYellow) as HTMLInputElement
const _ref_pic_cmykLabelYellow = $$(`[for="${CSS.escape(ElementIds.bdPick_cmykYellow)}"]`) as HTMLLabelElement
const _ref_pic_cmykKey = $(ElementIds.bdPick_cmykKey) as HTMLInputElement
const _ref_pic_cmykLabelKey = $$(`[for="${CSS.escape(ElementIds.bdPick_cmykKey)}"]`) as HTMLLabelElement
const _ref_pic_hex = $(ElementIds.bdPick_hex) as HTMLInputElement
const _ref_pic_hexLabel = $$(`[for="${CSS.escape(ElementIds.bdPick_hex)}"]`) as HTMLLabelElement
const _ref_pic_hsvHue = $(ElementIds.bdPick_hsvHue) as HTMLInputElement
const _ref_pic_hsvLabelHue = $$(`[for="${CSS.escape(ElementIds.bdPick_hsvHue)}"]`) as HTMLLabelElement
const _ref_pic_hsvSaturation = $(ElementIds.bdPick_hsvSaturation) as HTMLInputElement
const _ref_pic_hsvLabelSaturation = $$(`[for="${CSS.escape(ElementIds.bdPick_hsvSaturation)}"]`) as HTMLLabelElement
const _ref_pic_hsvValue = $(ElementIds.bdPick_hsvValue) as HTMLInputElement
const _ref_pic_hsvLabelValue = $$(`[for="${CSS.escape(ElementIds.bdPick_hsvValue)}"]`) as HTMLLabelElement
const _ref_pic_hwbHue = $(ElementIds.bdPick_hwbHue) as HTMLInputElement
const _ref_pic_hwbLabelHue = $$(`[for="${CSS.escape(ElementIds.bdPick_hwbHue)}"]`) as HTMLLabelElement
const _ref_pic_hwbWhiteness = $(ElementIds.bdPick_hwbWhiteness) as HTMLInputElement
const _ref_pic_hwbLabelWhiteness = $$(`[for="${CSS.escape(ElementIds.bdPick_hwbWhiteness)}"]`) as HTMLLabelElement
const _ref_pic_hwbBlackness = $(ElementIds.bdPick_hwbBlackness) as HTMLInputElement
const _ref_pic_hwbLabelBlackness = $$(`[for="${CSS.escape(ElementIds.bdPick_hwbBlackness)}"]`) as HTMLLabelElement

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
	const contrast = (rgb: RGBColor) => colorContrastPercentage(rgb, {r: 0, g: 0, b: 0}) > 50? '#000' : '#fff'
	const style = (ref: HTMLElement, property: string, value: string) => ref.style.setProperty(property, value)
	requestAnimationFrame(() => {
		RECTANGLE_RECT: {
			const ref = _ref_pic_rectangleRect
			style(ref, '--color', hex)
			style(ref, '--hue', hsv.h * 360 + '')
			style(ref, '--border-color', contrast(rgb))
			if (isFocus(ref)) {break RECTANGLE_RECT}

			style(ref, '--position-x', hsv.s * 100 + '%')
			style(ref, '--position-y', (1-hsv.v) * 100 + '%')
		}
		RECTANGLE_HUE: {
			const ref = _ref_pic_rectangleHue
			style(ref, '--color', `hsl(${round(hsl.h * 360)},100%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: hsl.h, s: 1, l: .5})))
			if (isFocus(ref)) {break RECTANGLE_HUE}

			ref.value = round(hsv.h * 360) + ''
		}
		RECTANGLE_HSL_RECT: {
			const ref = _ref_pic_rectangleHslRect
			style(ref, '--color', hex)
			style(ref, '--hue', hsl.h * 360 + '')
			style(ref, '--border-color', contrast(rgb))
			if (isFocus(ref)) {break RECTANGLE_HSL_RECT}

			style(ref, '--position-x', hsl.s * 100 + '%')
			style(ref, '--position-y', (1-hsl.l) * 100 + '%')
		}
		RECTANGLE_HSL_HUE: {
			const ref = _ref_pic_rectangleHslHue
			style(ref, '--color', `hsl(${round(hsl.h * 360)},100%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: hsl.h, s: 1, l: .5})))
			if (isFocus(ref)) {break RECTANGLE_HSL_HUE}

			ref.value = round(hsl.h * 360) + ''
		}
		SPECTRUM_RECT: {
			const ref = _ref_pic_spectrumRect
			style(ref, '--color', hsvToHex({...hsv, v: 1}))
			style(ref, '--border-color', contrast(hsvToRgb({...hsv, v: 1})))
			if (isFocus(ref)) {break SPECTRUM_RECT}

			style(ref, '--position-x', hsv.h * 100 + '%')
			style(ref, '--position-y', (1-hsv.s) * 100 + '%')
		}
		SPECTRUM_HUE: {
			const ref = _ref_pic_spectrumHue
			style(ref, '--max-value-color', hsvToHex({...hsv, v: 1}))
			style(ref, '--color', hex)
			style(ref, '--border-color', contrast(rgb))
			if (isFocus(ref)) {break SPECTRUM_HUE}

			ref.value = (1 - hsv.v) * 100 + ''
		}
		RGB_RED: {
			const ref = _ref_pic_rgbRed
			style(ref, '--color', `rgb(${round(rgb.r * 0xff)},0,0)`)
			style(ref, '--border-color', contrast({...rgb, g: 0, b: 0}))
			_ref_pic_rgbLabelRed.textContent = `Red: ${round(rgb.r * 0xff)} (${round(rgb.r * 100)}%)`
			if (isFocus(ref)) {break RGB_RED}

			ref.value = round(rgb.r * 0xff) + ''
		}
		RGB_GREEN: {
			const ref = _ref_pic_rgbGreen
			style(ref, '--color', `rgb(0,${round(rgb.g * 0xff)},0)`)
			style(ref, '--border-color', contrast({...rgb, r: 0, b: 0}))
			_ref_pic_rgbLabelGreen.textContent = `Green: ${round(rgb.g * 0xff)} (${round(rgb.g * 100)}%)`
			if (isFocus(ref)) {break RGB_GREEN}

			ref.value = round(rgb.g * 0xff) + ''
		}
		RGB_BLUE: {
			const ref = _ref_pic_rgbBlue
			style(ref, '--color', `rgb(0,0,${round(rgb.b * 0xff)})`)
			style(ref, '--border-color', contrast({...rgb, r: 0, g: 0}))
			_ref_pic_rgbLabelBlue.textContent = `Blue: ${round(rgb.b * 0xff)} (${round(rgb.b * 100)}%)`
			if (isFocus(ref)) {break RGB_BLUE}

			ref.value = round(rgb.b * 0xff) + ''
		}
		HSL_HUE: {
			const ref = _ref_pic_hslHue
			style(ref, '--color', `hsl(${round(hsl.h * 360)},100%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({...hsl, s: 1, l: 0.5})))
			_ref_pic_hslLabelHue.textContent = `Hue: ${round(hsl.h * 360)}° (${round(hsl.h * 100)}%)`
			if (isFocus(ref)) {break HSL_HUE}

			ref.value = round(hsl.h * 360) + ''
		}
		HSL_SATURATION: {
			const ref = _ref_pic_hslSaturation
			style(ref, '--hue', round(hsl.h * 360) + '')
			style(ref, '--color', `hsl(${round(hsl.h * 360)},${round(hsl.s * 100)}%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({...hsl, l: 0.5})))
			_ref_pic_hslLabelSaturation.textContent = `Saturation: ${round(hsl.s * 100)}%`
			if (isFocus(ref)) {break HSL_SATURATION}

			ref.value = round(hsl.s * 100) + ''
		}
		HUE_LIGHTNESS: {
			const ref = _ref_pic_hslLightness
			style(ref, '--color', `hsl(0,0%,${round(hsl.l * 100)}%)`)
			style(ref, '--border-color', contrast(hslToRgb({...hsl, h: 0, s: 0})))
			_ref_pic_hslLabelLightness.textContent = `Lightness: ${round(hsl.l * 100)}%`
			if (isFocus(ref)) {break HUE_LIGHTNESS}

			ref.value = round(hsl.l * 100) + ''
		}
		CMYK_CYAN: {
			const ref = _ref_pic_cmykCyan
			style(ref, '--color', `hsl(180,100%,${cmyk.c * 50}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 180 / 360, s: 1, l: cmyk.c * 0.5})))
			_ref_pic_cmykLabelCyan.textContent = `Cyan: ${round(cmyk.c * 100)}%`
			if (isFocus(ref)) {break CMYK_CYAN}

			ref.value = round(cmyk.c * 100) + ''
		}
		CMYK_MAGENTA: {
			const ref = _ref_pic_cmykMagenta
			style(ref, '--color', `hsl(300,100%,${cmyk.m * 50}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 300 / 360, s: 1, l: cmyk.m * 0.5})))
			_ref_pic_cmykLabelMagenta.textContent = `Magenta: ${round(cmyk.m * 100)}%`
			if (isFocus(ref)) {break CMYK_MAGENTA}

			ref.value = round(cmyk.m * 100) + ''
		}
		CMYK_YELLOW: {
			const ref = _ref_pic_cmykYellow
			style(ref, '--color', `hsl(60,100%,${cmyk.y * 50}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 60 / 360, s: 1, l: cmyk.y * 0.5})))
			_ref_pic_cmykLabelYellow.textContent = `Yellow: ${round(cmyk.y * 100)}%`
			if (isFocus(ref)) {break CMYK_YELLOW}

			ref.value = round(cmyk.y * 100) + ''
		}
		CMYK_KEY: {
			const ref = _ref_pic_cmykKey
			style(ref, '--color', `hsl(0,0%,${(1-cmyk.k) * 100}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 0, s: 0, l: (1-cmyk.k)})))
			_ref_pic_cmykLabelKey.textContent = `Key/Black: ${round(cmyk.k * 100)}%`
			if (isFocus(ref)) {break CMYK_KEY}

			ref.value = round(cmyk.k * 100) + ''
		}
		HEX: {
			const ref = _ref_pic_hex
			style(ref, '--color', hex)
			style(ref, '--border-color', contrast(rgb))
			_ref_pic_hexLabel.textContent = `Hex: ${hex} (${value})`
			if (isFocus(ref)) {break HEX}

			ref.value = value + ''
		}
		HSV_HUE: {
			const ref = _ref_pic_hsvHue
			style(ref, '--color', hsvToHex({...hsv, s: 1, v: 1}))
			style(ref, '--border-color', contrast(hsvToRgb({...hsv, s: 1, v: 1})))
			_ref_pic_hsvLabelHue.textContent = `Hue: ${round(hsv.h * 360)}° (${round(hsv.h * 100)}%)`
			if (isFocus(ref)) {break HSV_HUE}

			ref.value = round(hsv.h * 360) + ''
		}
		HSV_SATURATION: {
			const ref = _ref_pic_hsvSaturation
			style(ref, '--hue', round(hsv.h * 360) + '')
			style(ref, '--color', hsvToHex({...hsv, v: 1}))
			style(ref, '--border-color', contrast(hsvToRgb({...hsv, v: 1})))
			_ref_pic_hsvLabelSaturation.textContent = `Saturation: ${round(hsv.s * 100)}%`
			if (isFocus(ref)) {break HSV_SATURATION}

			ref.value = round(hsv.s * 100) + ''
		}
		HSV_VALUE: {
			const ref = _ref_pic_hsvValue
			style(ref, '--max-value-color', hsvToHex({...hsv, v: 1}))
			style(ref, '--color', hex)
			style(ref, '--border-color', contrast(rgb))
			_ref_pic_hsvLabelValue.textContent = `Value: ${round(hsv.v * 100)}%`
			if (isFocus(ref)) {break HSV_VALUE}

			ref.value = round(hsv.v * 100) + ''
		}
		HWB_HUE: {
			const ref = _ref_pic_hwbHue
			style(ref, '--color', `hwb(${round(hwb.h * 360)} 0% 0%)`)
			style(ref, '--border-color', contrast(hwbToRgb({...hwb, w: 0, b: 0})))
			_ref_pic_hwbLabelHue.textContent = `Hue: ${round(hwb.h * 360)}° (${round(hwb.h * 100)}%)`
			if (isFocus(ref)) {break HWB_HUE}

			ref.value = round(hwb.h * 360) + ''
		}
		HWB_WHITENESS: {
			const ref = _ref_pic_hwbWhiteness
			style(ref, '--hue', round(hwb.h * 360) + '')
			style(ref, '--color', `hwb(${round(hwb.h * 360)} ${round(hwb.w * 100)}% 0%)`)
			style(ref, '--border-color', contrast(hwbToRgb({...hwb, b: 0})))
			_ref_pic_hwbLabelWhiteness.textContent = `Whiteness: ${round(hwb.w * 100)}%`
			if (isFocus(ref)) {break HWB_WHITENESS}

			ref.value = round(hwb.w * 100) + ''
		}
		HWB_BLACKNESS: {
			const ref = _ref_pic_hwbBlackness
			style(ref, '--hue', round(hwb.h * 360) + '')
			style(ref, '--color', `hwb(${round(hwb.h * 360)} 0% ${round(hwb.b * 100)}%)`)
			style(ref, '--border-color', contrast(hwbToRgb({...hwb, w: 0})))
			_ref_pic_hwbLabelBlackness.textContent = `Blackness: ${round(hwb.b * 100)}%`
			if (isFocus(ref)) {break HWB_BLACKNESS}

			ref.value = round(hwb.b * 100) + ''
		}
	})
}

function _updateInputRefsView(color: PickerStoreType): void {
	const isFocus = (el: Element) => el.matches(':focus')
	const round = (v: number) => Math.round(v)
	if (!isFocus(_ref_inp_hex)) {
		_ref_inp_hex.value = color.hex.toUpperCase()
	}
	if (!isFocus(_ref_inp_rgb)) {
		const rgb = color.rgb
		_ref_inp_rgb.value = [
			round(rgb.r * 0xff),
			round(rgb.g * 0xff),
			round(rgb.b * 0xff),
		].join(', ')
	}
	if (!isFocus(_ref_inp_hsl)) {
		const hsl = color.hsl
		_ref_inp_hsl.value = [
			round(hsl.h * 360) + '°',
			round(hsl.s * 100) + '%',
			round(hsl.l * 100) + '%',
		].join(', ')
	}
	if (!isFocus(_ref_inp_hsv)) {
		const hsv = color.hsv
		_ref_inp_hsv.value = [
			round(hsv.h * 360) + '°',
			round(hsv.s * 100) + '%',
			round(hsv.v * 100) + '%',
		].join(', ')
	}
	if (!isFocus(_ref_inp_hwb)) {
		const hwb = color.hwb
		_ref_inp_hwb.value = [
			round(hwb.h * 360) + '°',
			round(hwb.w * 100) + '%',
			round(hwb.b * 100) + '%',
		].join(', ')
	}
	if (!isFocus(_ref_inp_cmyk)) {
		const cmyk = color.cmyk
		_ref_inp_cmyk.value = [
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
		_ref_preview.style.setProperty('background-color', v.hex)
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
		_ref_inp_hex.addEventListener('input', () => {
			const value = safeNumber(Number.parseInt(_ref_inp_hex.value.replace(/[^0-9A-Fa-f]/g, ''), 16))
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

		_ref_inp_rgb.addEventListener('input', () => {
			const v = _ref_inp_rgb
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

		_ref_inp_hsl.addEventListener('input', () => {
			const v = _ref_inp_hsl
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

		_ref_inp_hsv.addEventListener('input', () => {
			const v = _ref_inp_hsv
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

		_ref_inp_hwb.addEventListener('input', () => {
			const v = _ref_inp_hwb
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

		_ref_inp_cmyk.addEventListener('input', () => {
			const v = _ref_inp_cmyk
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
			let rect: DOMRect = _ref_pic_rectangleRect.getBoundingClientRect()
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
					_ref_pic_rectangleRect.style.setProperty('--position-x', x + '%')
					_ref_pic_rectangleRect.style.setProperty('--position-y', y + '%')
				})
			}
			const onPointerUp = (ev: PointerEvent) => {
				isDragging = false
				_ref_pic_rectangleRect.releasePointerCapture(ev.pointerId)
			}
			_ref_pic_rectangleRect.addEventListener('pointerdown', (ev) => {
				_ref_pic_rectangleRect.setPointerCapture(ev.pointerId)
				rect = _ref_pic_rectangleRect.getBoundingClientRect()
				isDragging = true
				updateColor(ev.clientX, ev.clientY)
			})

			_ref_pic_rectangleRect.addEventListener('pointermove', (ev) => {
				if (!isDragging) {return}
				updateColor(ev.clientX, ev.clientY)
			})

			_ref_pic_rectangleRect.addEventListener('pointerup', onPointerUp)
			_ref_pic_rectangleRect.addEventListener('pointercancel', onPointerUp)

			_ref_pic_rectangleHue.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_rectangleHue.valueAsNumber, 0, 360)
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
			let rect: DOMRect = _ref_pic_rectangleHslRect.getBoundingClientRect()
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
					_ref_pic_rectangleHslRect.style.setProperty('--position-x', x + '%')
					_ref_pic_rectangleHslRect.style.setProperty('--position-y', y + '%')
				})
			}
			const onPointerUp = (ev: PointerEvent) => {
				isDragging = false
				_ref_pic_rectangleHslRect.releasePointerCapture(ev.pointerId)
			}

			_ref_pic_rectangleHslRect.addEventListener('pointerdown', (ev) => {
				_ref_pic_rectangleHslRect.setPointerCapture(ev.pointerId)
				rect = _ref_pic_rectangleHslRect.getBoundingClientRect()
				isDragging = true
				updateColor(ev.clientX, ev.clientY)
			})

			_ref_pic_rectangleHslRect.addEventListener('pointermove', (ev) => {
				if (!isDragging) {return}
				updateColor(ev.clientX, ev.clientY)
			})

			_ref_pic_rectangleHslRect.addEventListener('pointerup', onPointerUp)
			_ref_pic_rectangleHslRect.addEventListener('pointercancel', onPointerUp)

			_ref_pic_rectangleHslHue.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_rectangleHslHue.valueAsNumber, 0, 360)
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
			let rect: DOMRect = _ref_pic_spectrumRect.getBoundingClientRect()
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
					_ref_pic_spectrumRect.style.setProperty('--position-x', x + '%')
					_ref_pic_spectrumRect.style.setProperty('--position-y', y + '%')
				})
			}
			const onPointerUp = (ev: PointerEvent) => {
				isDragging = false
				_ref_pic_spectrumRect.releasePointerCapture(ev.pointerId)
			}

			_ref_pic_spectrumRect.addEventListener('pointerdown', (ev) => {
				_ref_pic_spectrumRect.setPointerCapture(ev.pointerId)
				rect = _ref_pic_spectrumRect.getBoundingClientRect()
				isDragging = true
				updateColor(ev.clientX, ev.clientY)
			})

			_ref_pic_spectrumRect.addEventListener('pointermove', (ev) => {
				if (!isDragging) {return}
				updateColor(ev.clientX, ev.clientY)
			})

			_ref_pic_spectrumRect.addEventListener('pointerup', onPointerUp)
			_ref_pic_spectrumRect.addEventListener('pointercancel', onPointerUp)

			_ref_pic_spectrumHue.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_spectrumHue.valueAsNumber, 0, 100)
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
			_ref_pic_rgbRed.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_rgbRed.valueAsNumber, 0, 0xff)
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

			_ref_pic_rgbGreen.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_rgbGreen.valueAsNumber, 0, 0xff)
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

			_ref_pic_rgbBlue.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_rgbBlue.valueAsNumber, 0, 0xff)
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
			_ref_pic_hslHue.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hslHue.valueAsNumber, 0, 360)
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
			_ref_pic_hslSaturation.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hslSaturation.valueAsNumber, 0, 100)
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
			_ref_pic_hslLightness.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hslLightness.valueAsNumber, 0, 100)
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
			_ref_pic_cmykCyan.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_cmykCyan.valueAsNumber, 0, 100)
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
			_ref_pic_cmykMagenta.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_cmykMagenta.valueAsNumber, 0, 100)
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
			_ref_pic_cmykYellow.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_cmykYellow.valueAsNumber, 0, 100)
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
			_ref_pic_cmykKey.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_cmykKey.valueAsNumber, 0, 100)
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
			_ref_pic_hex.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hex.valueAsNumber, 0, 0xffffff)
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
			_ref_pic_hsvHue.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hsvHue.valueAsNumber, 0, 360)
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

			_ref_pic_hsvSaturation.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hsvSaturation.valueAsNumber, 0, 100)
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

			_ref_pic_hsvValue.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hsvValue.valueAsNumber, 0, 100)
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
			_ref_pic_hwbHue.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hwbHue.valueAsNumber, 0, 360)
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

			_ref_pic_hwbWhiteness.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hwbWhiteness.valueAsNumber, 0, 100)
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

			_ref_pic_hwbBlackness.addEventListener('input', () => {
				const value = Math_clamp(_ref_pic_hwbBlackness.valueAsNumber, 0, 100)
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
		_ref_inputs?.addEventListener('focusout', (ev) => {
			if (!(ev.target instanceof HTMLInputElement)) {return}

			_updateInputRefsView(PickerStore.value)
		})

		_ref_inputs?.addEventListener('click', () => {
			const ref_target = document.activeElement as CButton.CElement
			if (!isTargetValidElement(_ref_inputs, ref_target)) {return}

			const dataset = ref_target.dataset
			const command = dataset.command as Commands
			switch (command) {
			case Commands.copyColor: {
				const colorSpace = dataset.colorSpace as ColorSpace
				let text = ''
				sw2: switch (colorSpace) {
				case ColorSpace.hex : text = _ref_inp_hex .value; break sw2
				case ColorSpace.rgb : text = _ref_inp_rgb .value; break sw2
				case ColorSpace.hsl : text = _ref_inp_hsl .value; break sw2
				case ColorSpace.hsv : text = _ref_inp_hsv .value; break sw2
				case ColorSpace.hwb : text = _ref_inp_hwb .value; break sw2
				case ColorSpace.cmyk: text = _ref_inp_cmyk.value; break sw2
				}

				if (text.trim().length === 0) {break}

				navigator.clipboard.writeText(text).then(() => {
					_ref_toastCopied.showPopover()
				})
			} break }
		})
	}

	inputs()
	pickers()
	init()
}

function _initImageColorPicker(): void {
	const contrast = (rgb: RGBColor) => colorContrastPercentage(rgb, {r: 0, g: 0, b: 0}) > 50? '#000000' : '#ffffff'
	let ctx: CanvasRenderingContext2D
	let posX: number = 0 // 0-100
	let posY: number = 0 // 0-100
	let image = new Image()
	let isDragging = false
	let rect: DOMRect = _ref_pic_imageCanvas.getBoundingClientRect()

	function onPointerUp(ev: PointerEvent){
		isDragging = false
		_ref_pic_spectrumRect.releasePointerCapture(ev.pointerId)
	}

	function initObserver(): void {
		const observer = new ResizeObserver(() => {
			_ref_pic_imageWrapper.style.setProperty(
				'max-height',
				pxToRem(_ref_pic_imageCanvas.getBoundingClientRect().height) + 'rem'
			)
		})

		observer.observe(_ref_pic_imageCanvas, {box: 'border-box'})
	}

	function initEvents(): void {
		function updatePosition(x: number, y: number): void {
			posX = Math_clamp((x - rect.left) / rect.width * 100, 0, 100)
			posY = Math_clamp((y - rect.top) / rect.height * 100, 0, 100)
			updateColor(pickColor())
			requestAnimationFrame(() => {
				_ref_pic_imageWrapper.style.setProperty('--position-x', posX + '%')
				_ref_pic_imageWrapper.style.setProperty('--position-y', posY + '%')
			})
		}

		_ref_pic_imageImage.addEventListener('click', () => {
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

		_ref_pic_imageCanvas.addEventListener('pointerdown', ev => {
			_ref_pic_imageCanvas.setPointerCapture(ev.pointerId)
			rect = _ref_pic_imageCanvas.getBoundingClientRect()
			isDragging = true
			updatePosition(ev.clientX, ev.clientY)
		})

		_ref_pic_imageCanvas.addEventListener('pointermove', (ev) => {
			if (!isDragging) {return}

			updatePosition(ev.clientX, ev.clientY)
		})

		_ref_pic_imageCanvas.addEventListener('pointerup', onPointerUp)
		_ref_pic_imageCanvas.addEventListener('pointercancel', onPointerUp)
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
			_ref_pic_imageWrapper.style.setProperty('--color', rgbToHex(rgb))
			_ref_pic_imageWrapper.style.setProperty('--border-color', contrast(rgb))
		})
	}

	function pickColor(): RGBColor {
		const data = ctx.getImageData(
			posX / 100 * _ref_pic_imageCanvas.width,
			posY / 100 * _ref_pic_imageCanvas.height,
			1, 1
		).data
		return {
			r: data[0] / 0xff,
			g: data[1] / 0xff,
			b: data[2] / 0xff
		}
	}

	function initCanvas(): void {
		ctx = _ref_pic_imageCanvas.getContext('2d', {
			willReadFrequently: true
		})!
		image.onload = () => {
			_ref_pic_imageCanvas.width = image.naturalWidth
			_ref_pic_imageCanvas.height = image.naturalHeight
			ctx.drawImage(image, 0, 0)
			_ref_pic_imageWrapper.removeAttribute('data-no-image')
			updateColor(pickColor())
			_ref_pic_imageWrapper.style.setProperty(
				'max-height',
				pxToRem(_ref_pic_imageCanvas.getBoundingClientRect().height) + 'rem'
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