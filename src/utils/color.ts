import type { RGBColor, HSLColor, HSVColor, HEXColor, HWBColor, CMYKColor } from "@/types/color"
import { safeNumber } from "./number"
import { themeFromSourceColor } from "@material/material-color-utilities"

export function isColorValidWithAlpha(hex: string): boolean {
	return /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/i.test(hex)
}

export function isColorValid(hex: string): boolean {
	return /^#[0-9a-fA-F]{6}$/i.test(hex)
}

export function colorLuminance(rgb: RGBColor): number {
	const r = Math.pow(rgb.r, 2.2)
	const g = Math.pow(rgb.g, 2.2)
	const b = Math.pow(rgb.b, 2.2)
	const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722

	return luminance
}

/**
 * Result value is between `0` (low contrast) to `100` (high contrast)
 */
export function colorContrastRatio(rgb1: RGBColor, rgb2: RGBColor): number {
	/**
	 * `Y` = Luminance
	 */
	function yToLStar(Y: number): number {
		if (Y <= (216 / 24389)) return Y * (24389 / 27)
		return Math.pow(Y, (1 / 3)) * 116 - 16
	}

	const L1 = yToLStar(colorLuminance(rgb1))
	const L2 = yToLStar(colorLuminance(rgb2))
	const ratio = Math.max(L1, L2) - Math.min(L1, L2)
	return ratio
}

export function rgbToColor(rgb: RGBColor): number {
	const r = Math.round(rgb.r * 0xff)
	const g = Math.round(rgb.g * 0xff)
	const b = Math.round(rgb.b * 0xff)
	return ((r << 16) | (g << 8) | b)
}

export function colorToRgb(value: number): RGBColor {
	value = Math.round(value)
	return {
		r: ((value >> 16) & 0xFF) / 0xff,
		g: ((value >> 8) & 0xFF) / 0xff,
		b: (value & 0xFF) / 0xff
	}
}

export function hexToColor(hex: HEXColor): number {
	return rgbToColor(hexToRgb(hex))
}

export function colorToHex(value: number): HEXColor {
	return rgbToHex(colorToRgb(value))
}

export function hslToColor(hsl: HSLColor): number {
	return rgbToColor(hslToRgb(hsl))
}

export function colorToHsl(value: number): HSLColor {
	return rgbToHsl(colorToRgb(value))
}

export function hsvToColor(hsv: HSVColor): number {
	return rgbToColor(hsvToRgb(hsv))
}

export function colorToHsv(value: number): HSVColor {
	return rgbToHsv(colorToRgb(value))
}

export function cmykToColor(cmyk: CMYKColor): number {
	return rgbToColor(cmykToRgb(cmyk))
}

export function colorToCmyk(value: number): CMYKColor {
	return rgbToCmyk(colorToRgb(value))
}

export function hwbToColor(hwb: HWBColor): number {
	return rgbToColor(hwbToRgb(hwb))
}

export function colorToHwb(value: number): HWBColor {
	return rgbToHwb(colorToRgb(value))
}

export function hexToHwb(hex: HEXColor): HWBColor {
	return rgbToHwb(hexToRgb(hex))
}

export function hwbToHex(hwb: HWBColor): HEXColor {
	return rgbToHex(hwbToRgb(hwb))
}

export function hwbToRgb(hwb: HWBColor): RGBColor {
	let h = hwb.h * 6
	let w = hwb.w
	let blackness = hwb.b
	let v = 1 - blackness
	let i = Math.floor(h)
	let f = h - i
	if (i & 1) f = 1 - f

	let n = w + f * (v - w)
	let [r, g, b] = [0, 0, 0]

	switch (i) {
	case 0: [r, g, b] = [v, n, w]; break
	case 1: [r, g, b] = [n, v, w]; break
	case 2: [r, g, b] = [w, v, n]; break
	case 3: [r, g, b] = [w, n, v]; break
	case 4: [r, g, b] = [n, w, v]; break
	case 5: [r, g, b] = [v, w, n]; break
	}

	return {r, g, b}
}

export function rgbToHwb(rgb: RGBColor): HWBColor {
	const red = rgb.r
	const green = rgb.g
	const blue = rgb.b
	const w = Math.min(red, green, blue)
	const v = Math.max(red, green, blue)
	const b = 1 - v
	if (v === w) return {h: 0, w, b}

	const f = red === w
		? green - blue
		: ((green === w)? blue - red : red - green)
	const i = Math.floor(red === w
		? 3
		: ((green === w)? 5 : 1))
	let h = (i - safeNumber(f / (v - w))) / 6
	return {h, w, b}
}

export function hsvToHwb(hsv: HSVColor): HWBColor {
	const h = hsv.h
	const w = (1 - hsv.s) * hsv.v
	const b = 1 - hsv.v
	return {h, w, b}
}

export function hwbToHsv(hwb: HWBColor): HSVColor {
	const h = hwb.h
	const s = 1 - safeNumber(hwb.w / (1 - hwb.b), 1)
	const v = 1 - hwb.b
	return {h, s, v}
}

export function hslToHwb(hsl: HSLColor): HWBColor {
	return {...hsvToHwb(hslToHsv(hsl)), h: hsl.h}
}

export function hwbToHsl(hwb: HWBColor): HSLColor {
	return {...hsvToHsl(hwbToHsv(hwb)), h: hwb.h}
}

export function hslToCmyk(hsl: HSLColor): CMYKColor {
	return rgbToCmyk(hslToRgb(hsl))
}

export function cmykToHsl(cmyk: CMYKColor): HSLColor {
	return rgbToHsl(cmykToRgb(cmyk))
}

export function hexToCmyk(hex: HEXColor): CMYKColor {
	return rgbToCmyk(hexToRgb(hex))
}

export function cmykToHex(cmyk: CMYKColor): HEXColor {
	return rgbToHex(cmykToRgb(cmyk))
}

export function cmykToRgb(cmyk: CMYKColor): RGBColor {
	const r = (1 - cmyk.c) * (1 - cmyk.k)
	const g = (1 - cmyk.m) * (1 - cmyk.k)
	const b = (1 - cmyk.y) * (1 - cmyk.k)
	return {r, g, b}
}


export function rgbToCmyk(rgb: RGBColor): CMYKColor {
	const r = rgb.r
	const g = rgb.g
	const b = rgb.b

	if (r == 0 && g == 0 && b == 0) return {
		c: 0, m: 0, y: 0, k: 1
	}

	let c = 1 - r
	let m = 1 - g
	let y = 1 - b
	let k = Math.min(c, m, y)

	c = (c - k) / (1 - k)
	m = (m - k) / (1 - k)
	y = (y - k) / (1 - k)

	return {c, m, y, k}
}

export function hexToHsl(hex: HEXColor): HSLColor {
	return rgbToHsl(hexToRgb(hex))
}

export function rgbToHsl(rgb: RGBColor): HSLColor {
	let h = 0, s = 0, l = 0
	const r = rgb.r
	const g = rgb.g
	const b = rgb.b

	const min = Math.min(r, g, b)
	const max = Math.max(r, g, b)
	const delta = max - min

	l = (max + min) / 2

	if (delta === 0) {
		h = 0
		s = 0
		return {h, s, l}
	}

	if (l < 0.5) s = delta / (max + min)
	else s = delta / (2 - max - min)

	const deltaR = (((max - r) / 6) + (delta / 2)) / delta
	const deltaG = (((max - g) / 6) + (delta / 2)) / delta
	const deltaB = (((max - b) / 6) + (delta / 2)) / delta

	if (r === max) h = deltaB - deltaG
	else if (g === max) h = (1 / 3) + deltaR - deltaB
	else if (b === max) h = (2 / 3) + deltaG - deltaR

	if (h < 0) h += 1
	if (h > 1) h -= 1

	return {h, s, l}
}

export function hexToRgb(hex: HEXColor): RGBColor {
	if (!isColorValid(hex)) {
		throw new Error("Invalid hex color format!")
	}

	hex = hex.startsWith("#") ? hex.slice(1) : hex as any

	const r = safeNumber(Number.parseInt(hex.substring(0, 2), 16), 0) / 0xff
	const g = safeNumber(Number.parseInt(hex.substring(2, 4), 16), 0) / 0xff
	const b = safeNumber(Number.parseInt(hex.substring(4, 6), 16), 0) / 0xff
	return { r, g, b }
}

export function hslToRgb(hsl: HSLColor): RGBColor {
	function hueToRgb(m1: number, m2: number, h: number): number {
		if (h < 0) h = h + 1
		if (h > 1) h = h - 1
		if (h * 6 < 1) return m1 + (m2 - m1) * 6 * h
		if (h * 2 < 1) return m2
		if (h * 3 < 2) return m1 + (m2 - m1) * (2 / 3 - h) * 6
		return m1
	}

	const m2 = hsl.l <= 0.5
		? hsl.l * (1 + hsl.s)
		: hsl.l + hsl.s - hsl.s * hsl.l
	const m1 = 2 * hsl.l - m2
	const r = hueToRgb(m1, m2, hsl.h + 1 / 3)
	const g = hueToRgb(m1, m2, hsl.h)
	const b = hueToRgb(m1, m2, hsl.h - 1 / 3)

	return {r, g, b}
}

export function hslToHex(hsl: HSLColor): HEXColor {
	return rgbToHex(hslToRgb(hsl))
}

export function rgbToHex(rgb: RGBColor): HEXColor {
	const pad = (v: number) => Math.round(v * 0xff).toString(16).padStart(2, '0')
	return ('#'
		+ pad(rgb.r)
		+ pad(rgb.g)
		+ pad(rgb.b)
	) as HEXColor
}

export function hsvToHex(hsv: HSVColor): HEXColor {
	return rgbToHex(hsvToRgb(hsv))
}

export function hexToHsv(hex: HEXColor): HSVColor {
	return rgbToHsv(hexToRgb(hex))
}

export function rgbToHsv(rgb: RGBColor): HSVColor {
	let h: number = 0
	let s: number = 0
	let v: number = 0

	const r = rgb.r
	const g = rgb.g
	const b = rgb.b

	const min = Math.min(r, g, b)
	const max = Math.max(r, g, b)
	const delta = max - min

	v = max

	if (delta === 0) {
		s = 0
		h = 0
		return {h, s, v}
	}

	s = delta / max

	const deltaR = (((max - r) / 6) + (delta / 2)) / delta
	const deltaG = (((max - g) / 6) + (delta / 2)) / delta
	const deltaB = (((max - b) / 6) + (delta / 2)) / delta

	if (r === max) h = deltaB - deltaG
	else if (g === max) h = (1 / 3) + deltaR - deltaB
	else if (b === max) h = (2 / 3) + deltaG - deltaR

	if (h < 0) h += 1
	if (h > 1) h -= 1

	return {h, s, v}
}

export function hsvToRgb(hsv: HSVColor): RGBColor {
	let r, g, b

	if (hsv.s === 0) {
		r = g = b = hsv.v
		return {r, g, b}
	}

	let h = hsv.h * 6
	if (h === 6) h = 0

	const i = Math.floor(h)
	const j = hsv.v * (1 - hsv.s)
	const k = hsv.v * (1 - hsv.s * (h - i))
	const l = hsv.v * (1 - hsv.s * (1 - (h - i)))

	if (i === 0) [r, g, b] = [hsv.v, l, j]
	else if (i === 1) [r, g, b] = [k, hsv.v, j]
	else if (i === 2) [r, g, b] = [j, hsv.v, l]
	else if (i === 3) [r, g, b] = [j, k, hsv.v]
	else if (i === 4) [r, g, b] = [l, j, hsv.v]
	else [r, g, b] = [hsv.v, j, k]

	return {r, g, b}
}

export function hslToHsv(hsl: HSLColor): HSVColor {
	const h = hsl.h
	const v = hsl.l + (hsl.s * Math.min(hsl.l, 1 - hsl.l))
	const s = v === 0
		? 0
		: (2 * (1 - (hsl.l / v)))
	return {h, s, v}
}

export function hsvToHsl(hsv: HSVColor): HSLColor {
	const h = hsv.h
	const l = hsv.v * (1 - (hsv.s / 2))
	const s = l === 0 || l === 1
		? 0
		: ((hsv.v - l) / Math.min(l, 1-l))
	return { h, s, l }
}

export function hexArgbToRgb(argb: HEXColor): RGBColor {
	const argbHex = argb.startsWith('#') ? argb.slice(1) : argb
	const argbInt = Number.parseInt(argbHex.padStart(8, '0'), 16)
	const r = ((argbInt >> 16) & 0xFF) / 0xff
	const g = ((argbInt >> 8) & 0xFF) / 0xff
	const b = (argbInt & 0xFF) / 0xff

	return {r, g, b}
  }

type GenerateColorResult = {
	color: HEXColor
	onColor: HEXColor
	colorDark: HEXColor
	onColorDark: HEXColor
}

/**
 * Generate 4 different color from color source:
 * - Color
 * - On Color
 * - Color Dark
 * - On Color Dark
*/
export function generateColorPalette(hex: HEXColor): GenerateColorResult {
	if (!isColorValid(hex)) {
		throw new Error("Invalid hex color format!")
	}

	const theme = themeFromSourceColor(Number.parseInt(hex.substring(1), 16)).schemes
	const [color, onColor, colorDark, onColorDark] = [
		rgbToHex(hexArgbToRgb('#' + theme.light.primary  .toString(16) as HEXColor)),
		rgbToHex(hexArgbToRgb('#' + theme.light.onPrimary.toString(16) as HEXColor)),
		rgbToHex(hexArgbToRgb('#' + theme.dark.primary   .toString(16) as HEXColor)),
		rgbToHex(hexArgbToRgb('#' + theme.dark.onPrimary .toString(16) as HEXColor)),
	]

	return {color, onColor, colorDark, onColorDark}
}