import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import * as Styles from '../../_styles/styles.enum.js'
import { batch, signal } from "@/utils/signal"
import { $, $$ } from './dom-utils.js'
import { cmykToRgb, colorContrastPercentage, colorToRgb, hexToColor, hslToHsv, hslToRgb, hsvToHex, hsvToHsl, hsvToHwb, hsvToRgb, hwbToHsv, hwbToRgb, rgbToCmyk, rgbToColor, rgbToHex, rgbToHsl, rgbToHsv } from '@/utils/color'
import type { CMYKColor, HEXColor, HSLColor, HSVColor, HWBColor, RGBColor } from '@/types/color'
import { Math_clamp } from '@/utils/math'
import { pxToRem } from '@/utils/css'
import { safeNumber } from '@/utils/number.js'
import { saveStorageItem } from './database.js'
import { pickFile } from '@/utils/file.js'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_hsl  = signal(Constant.DEFAULT_COLOR_IN_HSL)
export const sg_hex  = signal(Constant.DEFAULT_COLOR)
export const sg_hsv  = signal(Constant.DEFAULT_COLOR_IN_HSV)
export const sg_hwb  = signal(Constant.DEFAULT_COLOR_IN_HWB)
export const sg_rgb  = signal(Constant.DEFAULT_COLOR_IN_RGB)
export const sg_cmyk = signal(Constant.DEFAULT_COLOR_IN_CMYK)

const _ref_preview   = $(Ids.Preview) as HTMLOutputElement
const _ref_inputs    = $$<HTMLDivElement>('.' + Styles.Inputs)

const _ref_inputHex  = $(Ids.InputHex) as HTMLInputElement
const _ref_inputRgb  = $(Ids.InputRgb) as HTMLInputElement
const _ref_inputHsl  = $(Ids.InputHsl) as HTMLInputElement
const _ref_inputHsv  = $(Ids.InputHsv) as HTMLInputElement
const _ref_inputHwb  = $(Ids.InputHwb) as HTMLInputElement
const _ref_inputCmyk = $(Ids.InputCmyk) as HTMLInputElement

const _ref_pickerImageImage   = $(Ids.PickerImageButton) as HTMLButtonElement
const _ref_pickerImageCanvas  = $(Ids.PickerImageCanvas) as HTMLCanvasElement
const _ref_pickerImageWrapper = $(Ids.PickerimageWrapper) as HTMLDivElement

const _ref_pickerRectangleRect    = $(Ids.PickerRectangleRect) as HTMLDivElement
const _ref_pickerRectangleHue     = $(Ids.PickerRectangleHue) as HTMLInputElement
const _ref_pickerRectangleHslRect = $(Ids.PickerRectangleHslRect) as HTMLDivElement
const _ref_pickerRectangleHslHue  = $(Ids.PickerRectangleHslHue) as HTMLInputElement

const _ref_pickerSpectrumRect = $(Ids.PickerSpectrumRect) as HTMLDivElement
const _ref_pickerSpectrumHue  = $(Ids.PickerSpectrumHue) as HTMLInputElement

const _ref_pickerRgbRed        = $(Ids.PickerRgbRed) as HTMLInputElement
const _ref_pickerRgbLabelRed   = $$(`[for="${Ids.PickerRgbRed}"]`) as HTMLLabelElement
const _ref_pickerRgbGreen      = $(Ids.PickerRgbGreen) as HTMLInputElement
const _ref_pickerRgbLabelGreen = $$(`[for="${Ids.PickerRgbGreen}"]`) as HTMLLabelElement
const _ref_pickerRgbBlue       = $(Ids.PickerRgbBlue) as HTMLInputElement
const _ref_pickerRgbLabelBlue  = $$(`[for="${Ids.PickerRgbBlue}"]`) as HTMLLabelElement

const _ref_pickerHslHue             = $(Ids.PickerHslHue) as HTMLInputElement
const _ref_pickerHslLabelHue        = $$(`[for="${Ids.PickerHslHue}"]`) as HTMLLabelElement
const _ref_pickerHslSaturation      = $(Ids.PickerHslSaturation) as HTMLInputElement
const _ref_pickerHslLabelSaturation = $$(`[for="${Ids.PickerHslSaturation}"]`) as HTMLLabelElement
const _ref_pickerHslLightness       = $(Ids.PickerHslLightness) as HTMLInputElement
const _ref_pickerHslLabelLightness  = $$(`[for="${Ids.PickerHslLightness}"]`) as HTMLLabelElement

const _ref_pickerCmykCyan         = $(Ids.PickerCmykCyan) as HTMLInputElement
const _ref_pickerCmykLabelCyan    = $$(`[for="${Ids.PickerCmykCyan}"]`) as HTMLLabelElement
const _ref_pickerCmykMagenta      = $(Ids.PickerCmykMagenta) as HTMLInputElement
const _ref_pickerCmykLabelMagenta = $$(`[for="${Ids.PickerCmykMagenta}"]`) as HTMLLabelElement
const _ref_pickerCmykYellow       = $(Ids.PickerCmykYellow) as HTMLInputElement
const _ref_pickerCmykLabelYellow  = $$(`[for="${Ids.PickerCmykYellow}"]`) as HTMLLabelElement
const _ref_pickerCmykKey          = $(Ids.PickerCmykKey) as HTMLInputElement
const _ref_pickerCmykLabelKey     = $$(`[for="${Ids.PickerCmykKey}"]`) as HTMLLabelElement

const _ref_pickerHex      = $(Ids.PickerHex) as HTMLInputElement
const _ref_pickerHexLabel = $$(`[for="${Ids.PickerHex}"]`) as HTMLLabelElement

const _ref_pickerHsvHue             = $(Ids.PickerHsvHue) as HTMLInputElement
const _ref_pickerHsvLabelHue        = $$(`[for="${Ids.PickerHsvHue}"]`) as HTMLLabelElement
const _ref_pickerHsvSaturation      = $(Ids.PickerHsvSaturation) as HTMLInputElement
const _ref_pickerHsvLabelSaturation = $$(`[for="${Ids.PickerHsvSaturation}"]`) as HTMLLabelElement
const _ref_pickerHsvValue           = $(Ids.PickerHsvValue) as HTMLInputElement
const _ref_pickerHsvLabelValue      = $$(`[for="${Ids.PickerHsvValue}"]`) as HTMLLabelElement

const _ref_pickerHwbHue            = $(Ids.PickerHwbHue) as HTMLInputElement
const _ref_pickerHwbLabelHue       = $$(`[for="${Ids.PickerHwbHue}"]`) as HTMLLabelElement
const _ref_pickerHwbWhiteness      = $(Ids.PickerHwbWhiteness) as HTMLInputElement
const _ref_pickerHwbLabelWhiteness = $$(`[for="${Ids.PickerHwbWhiteness}"]`) as HTMLLabelElement
const _ref_pickerHwbBlackness      = $(Ids.PickerHwbBlackness) as HTMLInputElement
const _ref_pickerHwbLabelBlackness = $$(`[for="${Ids.PickerHwbBlackness}"]`) as HTMLLabelElement

function _updatePickerRefsView(): void {
	const isFocus = (el: Element) => el.matches(':focus')
	const round = (v: number) => Math.round(v)
	const hsl = sg_hsl()
	const hex = sg_hex().toUpperCase()
	const hsv = sg_hsv()
	const rgb = sg_rgb()
	const value = rgbToColor(rgb)
	const hwb  = sg_hwb()
	const cmyk = sg_cmyk()
	const contrast = (rgb: RGBColor) => colorContrastPercentage(rgb, {r: 0, g: 0, b: 0}) > 50? '#000' : '#fff'
	const style = (ref: HTMLElement, property: string, value: string) => ref.style.setProperty(property, value)
	requestAnimationFrame(() => {
		RECTANGLE_RECT: {
			const ref = _ref_pickerRectangleRect
			style(ref, '--color', hex)
			style(ref, '--hue', hsv.h * 360 + '')
			style(ref, '--border-color', contrast(rgb))
			if (isFocus(ref)) {break RECTANGLE_RECT}

			style(ref, '--position-x', hsv.s * 100 + '%')
			style(ref, '--position-y', (1-hsv.v) * 100 + '%')
		}
		RECTANGLE_HUE: {
			const ref = _ref_pickerRectangleHue
			style(ref, '--color', `hsl(${round(hsl.h * 360)},100%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: hsl.h, s: 1, l: .5})))
			if (isFocus(ref)) {break RECTANGLE_HUE}

			ref.value = round(hsv.h * 360) + ''
		}
		RECTANGLE_HSL_RECT: {
			const ref = _ref_pickerRectangleHslRect
			style(ref, '--color', hex)
			style(ref, '--hue', hsl.h * 360 + '')
			style(ref, '--border-color', contrast(rgb))
			if (isFocus(ref)) {break RECTANGLE_HSL_RECT}

			style(ref, '--position-x', hsl.s * 100 + '%')
			style(ref, '--position-y', (1-hsl.l) * 100 + '%')
		}
		RECTANGLE_HSL_HUE: {
			const ref = _ref_pickerRectangleHslHue
			style(ref, '--color', `hsl(${round(hsl.h * 360)},100%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: hsl.h, s: 1, l: .5})))
			if (isFocus(ref)) {break RECTANGLE_HSL_HUE}

			ref.value = round(hsl.h * 360) + ''
		}
		SPECTRUM_RECT: {
			const ref = _ref_pickerSpectrumRect
			style(ref, '--color', hsvToHex({...hsv, v: 1}))
			style(ref, '--border-color', contrast(hsvToRgb({...hsv, v: 1})))
			if (isFocus(ref)) {break SPECTRUM_RECT}

			style(ref, '--position-x', hsv.h * 100 + '%')
			style(ref, '--position-y', (1-hsv.s) * 100 + '%')
		}
		SPECTRUM_HUE: {
			const ref = _ref_pickerSpectrumHue
			style(ref, '--max-value-color', hsvToHex({...hsv, v: 1}))
			style(ref, '--color', hex)
			style(ref, '--border-color', contrast(rgb))
			if (isFocus(ref)) {break SPECTRUM_HUE}

			ref.value = (1 - hsv.v) * 100 + ''
		}
		RGB_RED: {
			const ref = _ref_pickerRgbRed
			style(ref, '--color', `rgb(${round(rgb.r * 0xff)},0,0)`)
			style(ref, '--border-color', contrast({...rgb, g: 0, b: 0}))
			_ref_pickerRgbLabelRed.textContent = `Red: ${round(rgb.r * 0xff)} (${round(rgb.r * 100)}%)`
			if (isFocus(ref)) {break RGB_RED}

			ref.value = round(rgb.r * 0xff) + ''
		}
		RGB_GREEN: {
			const ref = _ref_pickerRgbGreen
			style(ref, '--color', `rgb(0,${round(rgb.g * 0xff)},0)`)
			style(ref, '--border-color', contrast({...rgb, r: 0, b: 0}))
			_ref_pickerRgbLabelGreen.textContent = `Green: ${round(rgb.g * 0xff)} (${round(rgb.g * 100)}%)`
			if (isFocus(ref)) {break RGB_GREEN}

			ref.value = round(rgb.g * 0xff) + ''
		}
		RGB_BLUE: {
			const ref = _ref_pickerRgbBlue
			style(ref, '--color', `rgb(0,0,${round(rgb.b * 0xff)})`)
			style(ref, '--border-color', contrast({...rgb, r: 0, g: 0}))
			_ref_pickerRgbLabelBlue.textContent = `Blue: ${round(rgb.b * 0xff)} (${round(rgb.b * 100)}%)`
			if (isFocus(ref)) {break RGB_BLUE}

			ref.value = round(rgb.b * 0xff) + ''
		}
		HSL_HUE: {
			const ref = _ref_pickerHslHue
			style(ref, '--color', `hsl(${round(hsl.h * 360)},100%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({...hsl, s: 1, l: 0.5})))
			_ref_pickerHslLabelHue.textContent = `Hue: ${round(hsl.h * 360)}° (${round(hsl.h * 100)}%)`
			if (isFocus(ref)) {break HSL_HUE}

			ref.value = round(hsl.h * 360) + ''
		}
		HSL_SATURATION: {
			const ref = _ref_pickerHslSaturation
			style(ref, '--hue', round(hsl.h * 360) + '')
			style(ref, '--color', `hsl(${round(hsl.h * 360)},${round(hsl.s * 100)}%,50%)`)
			style(ref, '--border-color', contrast(hslToRgb({...hsl, l: 0.5})))
			_ref_pickerHslLabelSaturation.textContent = `Saturation: ${round(hsl.s * 100)}%`
			if (isFocus(ref)) {break HSL_SATURATION}

			ref.value = round(hsl.s * 100) + ''
		}
		HUE_LIGHTNESS: {
			const ref = _ref_pickerHslLightness
			style(ref, '--color', `hsl(0,0%,${round(hsl.l * 100)}%)`)
			style(ref, '--border-color', contrast(hslToRgb({...hsl, h: 0, s: 0})))
			_ref_pickerHslLabelLightness.textContent = `Lightness: ${round(hsl.l * 100)}%`
			if (isFocus(ref)) {break HUE_LIGHTNESS}

			ref.value = round(hsl.l * 100) + ''
		}
		CMYK_CYAN: {
			const ref = _ref_pickerCmykCyan
			style(ref, '--color', `hsl(180,100%,${cmyk.c * 50}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 180 / 360, s: 1, l: cmyk.c * 0.5})))
			_ref_pickerCmykLabelCyan.textContent = `Cyan: ${round(cmyk.c * 100)}%`
			if (isFocus(ref)) {break CMYK_CYAN}

			ref.value = round(cmyk.c * 100) + ''
		}
		CMYK_MAGENTA: {
			const ref = _ref_pickerCmykMagenta
			style(ref, '--color', `hsl(300,100%,${cmyk.m * 50}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 300 / 360, s: 1, l: cmyk.m * 0.5})))
			_ref_pickerCmykLabelMagenta.textContent = `Magenta: ${round(cmyk.m * 100)}%`
			if (isFocus(ref)) {break CMYK_MAGENTA}

			ref.value = round(cmyk.m * 100) + ''
		}
		CMYK_YELLOW: {
			const ref = _ref_pickerCmykYellow
			style(ref, '--color', `hsl(60,100%,${cmyk.y * 50}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 60 / 360, s: 1, l: cmyk.y * 0.5})))
			_ref_pickerCmykLabelYellow.textContent = `Yellow: ${round(cmyk.y * 100)}%`
			if (isFocus(ref)) {break CMYK_YELLOW}

			ref.value = round(cmyk.y * 100) + ''
		}
		CMYK_KEY: {
			const ref = _ref_pickerCmykKey
			style(ref, '--color', `hsl(0,0%,${(1-cmyk.k) * 100}%)`)
			style(ref, '--border-color', contrast(hslToRgb({h: 0, s: 0, l: (1-cmyk.k)})))
			_ref_pickerCmykLabelKey.textContent = `Key/Black: ${round(cmyk.k * 100)}%`
			if (isFocus(ref)) {break CMYK_KEY}

			ref.value = round(cmyk.k * 100) + ''
		}
		HEX: {
			const ref = _ref_pickerHex
			style(ref, '--color', hex)
			style(ref, '--border-color', contrast(rgb))
			_ref_pickerHexLabel.textContent = `Hex: ${hex} (${value})`
			if (isFocus(ref)) {break HEX}

			ref.value = value + ''
		}
		HSV_HUE: {
			const ref = _ref_pickerHsvHue
			style(ref, '--color', hsvToHex({...hsv, s: 1, v: 1}))
			style(ref, '--border-color', contrast(hsvToRgb({...hsv, s: 1, v: 1})))
			_ref_pickerHsvLabelHue.textContent = `Hue: ${round(hsv.h * 360)}° (${round(hsv.h * 100)}%)`
			if (isFocus(ref)) {break HSV_HUE}

			ref.value = round(hsv.h * 360) + ''
		}
		HSV_SATURATION: {
			const ref = _ref_pickerHsvSaturation
			style(ref, '--hue', round(hsv.h * 360) + '')
			style(ref, '--color', hsvToHex({...hsv, v: 1}))
			style(ref, '--border-color', contrast(hsvToRgb({...hsv, v: 1})))
			_ref_pickerHsvLabelSaturation.textContent = `Saturation: ${round(hsv.s * 100)}%`
			if (isFocus(ref)) {break HSV_SATURATION}

			ref.value = round(hsv.s * 100) + ''
		}
		HSV_VALUE: {
			const ref = _ref_pickerHsvValue
			style(ref, '--max-value-color', hsvToHex({...hsv, v: 1}))
			style(ref, '--color', hex)
			style(ref, '--border-color', contrast(rgb))
			_ref_pickerHsvLabelValue.textContent = `Value: ${round(hsv.v * 100)}%`
			if (isFocus(ref)) {break HSV_VALUE}

			ref.value = round(hsv.v * 100) + ''
		}
		HWB_HUE: {
			const ref = _ref_pickerHwbHue
			style(ref, '--color', `hwb(${round(hwb.h * 360)} 0% 0%)`)
			style(ref, '--border-color', contrast(hwbToRgb({...hwb, w: 0, b: 0})))
			_ref_pickerHwbLabelHue.textContent = `Hue: ${round(hwb.h * 360)}° (${round(hwb.h * 100)}%)`
			if (isFocus(ref)) {break HWB_HUE}

			ref.value = round(hwb.h * 360) + ''
		}
		HWB_WHITENESS: {
			const ref = _ref_pickerHwbWhiteness
			style(ref, '--hue', round(hwb.h * 360) + '')
			style(ref, '--color', `hwb(${round(hwb.h * 360)} ${round(hwb.w * 100)}% 0%)`)
			style(ref, '--border-color', contrast(hwbToRgb({...hwb, b: 0})))
			_ref_pickerHwbLabelWhiteness.textContent = `Whiteness: ${round(hwb.w * 100)}%`
			if (isFocus(ref)) {break HWB_WHITENESS}

			ref.value = round(hwb.w * 100) + ''
		}
		HWB_BLACKNESS: {
			const ref = _ref_pickerHwbBlackness
			style(ref, '--hue', round(hwb.h * 360) + '')
			style(ref, '--color', `hwb(${round(hwb.h * 360)} 0% ${round(hwb.b * 100)}%)`)
			style(ref, '--border-color', contrast(hwbToRgb({...hwb, w: 0})))
			_ref_pickerHwbLabelBlackness.textContent = `Blackness: ${round(hwb.b * 100)}%`
			if (isFocus(ref)) {break HWB_BLACKNESS}

			ref.value = round(hwb.b * 100) + ''
		}
	})
}

function _updateInputRefsView(): void {
	const isFocus = (el: Element) => el.matches(':focus')
	const round = (v: number) => Math.round(v)
	if (!isFocus(_ref_inputHex)) {
		_ref_inputHex.value = sg_hex().toUpperCase()
	}
	if (!isFocus(_ref_inputRgb)) {
		const rgb = sg_rgb()
		_ref_inputRgb.value = [
			round(rgb.r * 0xff),
			round(rgb.g * 0xff),
			round(rgb.b * 0xff),
		].join(', ')
	}
	if (!isFocus(_ref_inputHsl)) {
		const hsl = sg_hsl()
		_ref_inputHsl.value = [
			round(hsl.h * 360) + '°',
			round(hsl.s * 100) + '%',
			round(hsl.l * 100) + '%',
		].join(', ')
	}
	if (!isFocus(_ref_inputHsv)) {
		const hsv = sg_hsv()
		_ref_inputHsv.value = [
			round(hsv.h * 360) + '°',
			round(hsv.s * 100) + '%',
			round(hsv.v * 100) + '%',
		].join(', ')
	}
	if (!isFocus(_ref_inputHwb)) {
		const hwb = sg_hwb()
		_ref_inputHwb.value = [
			round(hwb.h * 360) + '°',
			round(hwb.w * 100) + '%',
			round(hwb.b * 100) + '%',
		].join(', ')
	}
	if (!isFocus(_ref_inputCmyk)) {
		const cmyk = sg_cmyk()
		_ref_inputCmyk.value = [
			round(cmyk.c * 100) + '%',
			round(cmyk.m * 100) + '%',
			round(cmyk.y * 100) + '%',
			round(cmyk.k * 100) + '%',
		].join(', ')
	}
}

function batchUpdateColors(
	rgb: RGBColor,
	hex: HEXColor,
	hsv: HSVColor,
	hsl: HSLColor,
	cmyk: CMYKColor,
	hwb: HWBColor
): void {
	batch(() => {
		sg_rgb.set(rgb)
		sg_hex.set(hex)
		sg_hsv.set(hsv)
		sg_hsl.set(hsl)
		sg_cmyk.set(cmyk)
		sg_hwb.set(hwb)
	})
}

function _initSubscriber(): void {
	sg_hex.subscribe(v => {
		saveStorageItem('color', hexToColor(v))
		requestAnimationFrame(() => {
			_ref_preview.style.setProperty('background-color', v)
			_updateInputRefsView()
			_updatePickerRefsView()
		})
	})
}

function _initEvents(): void {
	function inputs(): void {
		delegateEvent(_ref_inputHex, 'input', () => {
			const value = safeNumber(Number.parseInt(_ref_inputHex.value.replace(/[^0-9A-Fa-f]/g, ''), 16))
			const rgb = colorToRgb(value)
			const hex = rgbToHex(rgb)
			const hsv = rgbToHsv(rgb)
			const hsl = hsvToHsl(hsv)
			const cmyk = rgbToCmyk(rgb)
			const hwb = hsvToHwb(hsv)
			batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
		})

		delegateEvent(_ref_inputRgb, 'input', () => {
			const v = _ref_inputRgb
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
			batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
		})

		delegateEvent(_ref_inputHsl, 'input', () => {
			const v = _ref_inputHsl
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
			batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
		})

		delegateEvent(_ref_inputHsv, 'input', () => {
			const v = _ref_inputHsv
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
			batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
		})

		delegateEvent(_ref_inputHwb, 'input', () => {
			const v = _ref_inputHwb
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
			batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
		})

		delegateEvent(_ref_inputCmyk, 'input', () => {
			const v = _ref_inputCmyk
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
			batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
		})
	}

	function pickers(): void {
		function rectangle(): void {
			let isDragging = false
			let rect: DOMRect = _ref_pickerRectangleRect.getBoundingClientRect()
			const updateColor = (clientX: number, clientY: number) => {
				const x = Math_clamp((clientX - rect.left) / rect.width * 100, 0, 100)
				const y = Math_clamp((clientY - rect.top) / rect.height * 100, 0, 100)
				const hsv = {...sg_hsv(), s: x / 100, v: (100-y) / 100}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
				requestAnimationFrame(() => {
					_ref_pickerRectangleRect.style.setProperty('--position-x', x + '%')
					_ref_pickerRectangleRect.style.setProperty('--position-y', y + '%')
				})
			}
			const onPointerUp = (ev: PointerEvent) => {
				isDragging = false
				_ref_pickerRectangleRect.releasePointerCapture(ev.pointerId)
			}
			delegateEvent(_ref_pickerRectangleRect, 'pointerdown', (ev: PointerEvent) => {
				_ref_pickerRectangleRect.setPointerCapture(ev.pointerId)
				rect = _ref_pickerRectangleRect.getBoundingClientRect()
				isDragging = true
				updateColor(ev.clientX, ev.clientY)
			})

			delegateEvent(_ref_pickerRectangleRect, 'pointermove', (ev: PointerEvent) => {
				if (!isDragging) {return}
				updateColor(ev.clientX, ev.clientY)
			})

			delegateEvent(_ref_pickerRectangleRect, 'pointerup', onPointerUp)
			delegateEvent(_ref_pickerRectangleRect, 'pointercancel', onPointerUp)

			delegateEvent(_ref_pickerRectangleHue, 'input', () => {
				const value = Math_clamp(_ref_pickerRectangleHue.valueAsNumber, 0, 360)
				const hsv = {...sg_hsv(), h: value / 360}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
		}

		function rectangleHsl(): void {
			let isDragging = false
			let rect: DOMRect = _ref_pickerRectangleHslRect.getBoundingClientRect()
			const updateColor = (clientX: number, clientY: number) => {
				const x = Math_clamp((clientX - rect.left) / rect.width * 100, 0, 100)
				const y = Math_clamp((clientY - rect.top) / rect.height * 100, 0, 100)
				const hsl = {...sg_hsl(), s: x / 100, l: (100-y) / 100}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
				requestAnimationFrame(() => {
					_ref_pickerRectangleHslRect.style.setProperty('--position-x', x + '%')
					_ref_pickerRectangleHslRect.style.setProperty('--position-y', y + '%')
				})
			}
			const onPointerUp = (ev: PointerEvent) => {
				isDragging = false
				_ref_pickerRectangleHslRect.releasePointerCapture(ev.pointerId)
			}

			delegateEvent(_ref_pickerRectangleHslRect, 'pointerdown', (ev: PointerEvent) => {
				_ref_pickerRectangleHslRect.setPointerCapture(ev.pointerId)
				rect = _ref_pickerRectangleHslRect.getBoundingClientRect()
				isDragging = true
				updateColor(ev.clientX, ev.clientY)
			})

			delegateEvent(_ref_pickerRectangleHslRect, 'pointermove', (ev: PointerEvent) => {
				if (!isDragging) {return}
				updateColor(ev.clientX, ev.clientY)
			})

			delegateEvent(_ref_pickerRectangleHslRect, 'pointerup', onPointerUp)
			delegateEvent(_ref_pickerRectangleHslRect, 'pointercancel', onPointerUp)

			delegateEvent(_ref_pickerRectangleHslHue, 'input', () => {
				const value = Math_clamp(_ref_pickerRectangleHslHue.valueAsNumber, 0, 360)
				const hsl = {...sg_hsl(), h: value / 360}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hsv = hslToHsv(hsl)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
		}

		function spectrum(): void {
			let isDragging = false
			let rect: DOMRect = _ref_pickerSpectrumRect.getBoundingClientRect()
			const updateColor = (clientX: number, clientY: number) => {
				const x = Math_clamp((clientX - rect.left) / rect.width * 100, 0, 100)
				const y = Math_clamp((clientY - rect.top) / rect.height * 100, 0, 100)
				const hsv = {...sg_hsv(), h: x / 100, s: (100 - y) / 100}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
				requestAnimationFrame(() => {
					_ref_pickerSpectrumRect.style.setProperty('--position-x', x + '%')
					_ref_pickerSpectrumRect.style.setProperty('--position-y', y + '%')
				})
			}
			const onPointerUp = (ev: PointerEvent) => {
				isDragging = false
				_ref_pickerSpectrumRect.releasePointerCapture(ev.pointerId)
			}

			delegateEvent(_ref_pickerSpectrumRect, 'pointerdown', (ev: PointerEvent) => {
				_ref_pickerSpectrumRect.setPointerCapture(ev.pointerId)
				rect = _ref_pickerSpectrumRect.getBoundingClientRect()
				isDragging = true
				updateColor(ev.clientX, ev.clientY)
			})

			delegateEvent(_ref_pickerSpectrumRect, 'pointermove', (ev: PointerEvent) => {
				if (!isDragging) {return}
				updateColor(ev.clientX, ev.clientY)
			})

			delegateEvent(_ref_pickerSpectrumRect, 'pointerup', onPointerUp)
			delegateEvent(_ref_pickerSpectrumRect, 'pointercancel', onPointerUp)

			delegateEvent(_ref_pickerSpectrumHue, 'input', () => {
				const value = Math_clamp(_ref_pickerSpectrumHue.valueAsNumber, 0, 100)
				const hsv = {...sg_hsv(), v: 1 - (value / 100)}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
		}

		function sliderRgb(): void {
			delegateEvent(_ref_pickerRgbRed, 'input', () => {
				const value = Math_clamp(_ref_pickerRgbRed.valueAsNumber, 0, 0xff)
				const rgb = {...sg_rgb(), r: value / 0xff}
				const hsl = rgbToHsl(rgb)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})

			delegateEvent(_ref_pickerRgbGreen, 'input', () => {
				const value = Math_clamp(_ref_pickerRgbGreen.valueAsNumber, 0, 0xff)
				const rgb = {...sg_rgb(), g: value / 0xff}
				const hsl = rgbToHsl(rgb)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})

			delegateEvent(_ref_pickerRgbBlue, 'input', () => {
				const value = Math_clamp(_ref_pickerRgbBlue.valueAsNumber, 0, 0xff)
				const rgb = {...sg_rgb(), b: value / 0xff}
				const hsl = rgbToHsl(rgb)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
		}

		function sliderHsl(): void {
			delegateEvent(_ref_pickerHslHue, 'input', () => {
				const value = Math_clamp(_ref_pickerHslHue.valueAsNumber, 0, 360)
				const hsl = {...sg_hsl(), h: value / 360}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
			delegateEvent(_ref_pickerHslSaturation, 'input', () => {
				const value = Math_clamp(_ref_pickerHslSaturation.valueAsNumber, 0, 100)
				const hsl = {...sg_hsl(), s: value / 100}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
			delegateEvent(_ref_pickerHslLightness, 'input', () => {
				const value = Math_clamp(_ref_pickerHslLightness.valueAsNumber, 0, 100)
				const hsl = {...sg_hsl(), l: value / 100}
				const rgb = hslToRgb(hsl)
				const hex = rgbToHex(rgb)
				const hsv = hslToHsv(hsl)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
		}

		function sliderCmyk(): void {
			delegateEvent(_ref_pickerCmykCyan, 'input', () => {
				const value = Math_clamp(_ref_pickerCmykCyan.valueAsNumber, 0, 100)
				const cmyk = {...sg_cmyk(), c: value / 100}
				const rgb = cmykToRgb(cmyk)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = rgbToHsl(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
			delegateEvent(_ref_pickerCmykMagenta, 'input', () => {
				const value = Math_clamp(_ref_pickerCmykMagenta.valueAsNumber, 0, 100)
				const cmyk = {...sg_cmyk(), m: value / 100}
				const rgb = cmykToRgb(cmyk)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = rgbToHsl(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
			delegateEvent(_ref_pickerCmykYellow, 'input', () => {
				const value = Math_clamp(_ref_pickerCmykYellow.valueAsNumber, 0, 100)
				const cmyk = {...sg_cmyk(), y: value / 100}
				const rgb = cmykToRgb(cmyk)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = rgbToHsl(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
			delegateEvent(_ref_pickerCmykKey, 'input', () => {
				const value = Math_clamp(_ref_pickerCmykKey.valueAsNumber, 0, 100)
				const cmyk = {...sg_cmyk(), k: value / 100}
				const rgb = cmykToRgb(cmyk)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = rgbToHsl(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
		}

		function sliderHex(): void {
			delegateEvent(_ref_pickerHex, 'input', () => {
				const value = Math_clamp(_ref_pickerHex.valueAsNumber, 0, 0xffffff)
				const rgb = colorToRgb(value)
				const hex = rgbToHex(rgb)
				const hsv = rgbToHsv(rgb)
				const hsl = hsvToHsl(hsv)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
		}

		function sliderHsv(): void {
			delegateEvent(_ref_pickerHsvHue, 'input', () => {
				const value = Math_clamp(_ref_pickerHsvHue.valueAsNumber, 0, 360)
				const hsv = {...sg_hsv(), h: value / 360}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})

			delegateEvent(_ref_pickerHsvSaturation, 'input', () => {
				const value = Math_clamp(_ref_pickerHsvSaturation.valueAsNumber, 0, 100)
				const hsv = {...sg_hsv(), s: value / 100}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})

			delegateEvent(_ref_pickerHsvValue, 'input', () => {
				const value = Math_clamp(_ref_pickerHsvValue.valueAsNumber, 0, 100)
				const hsv = {...sg_hsv(), v: value / 100}
				const rgb = hsvToRgb(hsv)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hwb = hsvToHwb(hsv)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})
		}

		function sliderHwb(): void {
			delegateEvent(_ref_pickerHwbHue, 'input', () => {
				const value = Math_clamp(_ref_pickerHwbHue.valueAsNumber, 0, 360)
				const hwb = {...sg_hwb(), h: value / 360}
				const rgb = hwbToRgb(hwb)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hsv = hwbToHsv(hwb)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})

			delegateEvent(_ref_pickerHwbWhiteness, 'input', () => {
				const value = Math_clamp(_ref_pickerHwbWhiteness.valueAsNumber, 0, 100)
				const hwb = {...sg_hwb(), w: value / 100}
				hwb.b = Math_clamp(hwb.b, 0, 1 - hwb.w)
				const rgb = hwbToRgb(hwb)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hsv = hwbToHsv(hwb)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
			})

			delegateEvent(_ref_pickerHwbBlackness, 'input', () => {
				const value = Math_clamp(_ref_pickerHwbBlackness.valueAsNumber, 0, 100)
				const hwb = {...sg_hwb(), b: value / 100}
				hwb.w = Math_clamp(hwb.w, 0, 1 - hwb.b)
				const rgb = hwbToRgb(hwb)
				const hex = rgbToHex(rgb)
				const cmyk = rgbToCmyk(rgb)
				const hsv = hwbToHsv(hwb)
				const hsl = hsvToHsl(hsv)
				batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
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
			if (!(ev.target instanceof HTMLInputElement)) {
				return
			}

			_updateInputRefsView()
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
	let rect: DOMRect = _ref_pickerImageCanvas.getBoundingClientRect()

	function onPointerUp(ev: PointerEvent){
		isDragging = false
		_ref_pickerSpectrumRect.releasePointerCapture(ev.pointerId)
	}

	function initObserver(): void {
		const observer = new ResizeObserver(() => {
			_ref_pickerImageWrapper.style.setProperty(
				'max-height',
				pxToRem(_ref_pickerImageCanvas.getBoundingClientRect().height) + 'rem'
			)
		})

		observer.observe(_ref_pickerImageCanvas, {box: 'border-box'})
	}

	function initEvents(): void {
		function updatePosition(x: number, y: number): void {
			posX = Math_clamp((x - rect.left) / rect.width * 100, 0, 100)
			posY = Math_clamp((y - rect.top) / rect.height * 100, 0, 100)
			updateColor(pickColor())
			requestAnimationFrame(() => {
				_ref_pickerImageWrapper.style.setProperty('--position-x', posX + '%')
				_ref_pickerImageWrapper.style.setProperty('--position-y', posY + '%')
			})
		}

		delegateEvent(_ref_pickerImageImage, 'click', () => {
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

		delegateEvent(_ref_pickerImageCanvas, 'pointerdown', (ev: PointerEvent) => {
			_ref_pickerImageCanvas.setPointerCapture(ev.pointerId)
			rect = _ref_pickerImageCanvas.getBoundingClientRect()
			isDragging = true
			updatePosition(ev.clientX, ev.clientY)
		})

		delegateEvent(_ref_pickerImageCanvas, 'pointermove', (ev: PointerEvent) => {
			if (!isDragging) {return}

			updatePosition(ev.clientX, ev.clientY)
		})

		delegateEvent(_ref_pickerImageCanvas, 'pointerup', onPointerUp)
		delegateEvent(_ref_pickerImageCanvas, 'pointercancel', onPointerUp)
	}

	function updateColor(rgb: RGBColor): void {
		const hsl = rgbToHsl(rgb)
		const hex = rgbToHex(rgb)
		const hsv = hslToHsv(hsl)
		const cmyk = rgbToCmyk(rgb)
		const hwb = hsvToHwb(hsv)
		batchUpdateColors(rgb, hex, hsv, hsl, cmyk, hwb)
		requestAnimationFrame(() => {
			_ref_pickerImageWrapper.style.setProperty('--color', rgbToHex(rgb))
			_ref_pickerImageWrapper.style.setProperty('--border-color', contrast(rgb))
		})
	}

	function pickColor(): RGBColor {
		const data = ctx.getImageData(
			posX / 100 * _ref_pickerImageCanvas.width,
			posY / 100 * _ref_pickerImageCanvas.height,
			1, 1
		).data
		return {
			r: data[0] / 0xff,
			g: data[1] / 0xff,
			b: data[2] / 0xff
		}
	}

	function initCanvas(): void {
		ctx = _ref_pickerImageCanvas.getContext('2d', {
			willReadFrequently: true
		})!
		image.onload = () => {
			_ref_pickerImageCanvas.width = image.naturalWidth
			_ref_pickerImageCanvas.height = image.naturalHeight
			ctx.drawImage(image, 0, 0)
			_ref_pickerImageWrapper.removeAttribute('data-no-image')
			updateColor(pickColor())
			_ref_pickerImageWrapper.style.setProperty(
				'max-height',
				pxToRem(_ref_pickerImageCanvas.getBoundingClientRect().height) + 'rem'
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