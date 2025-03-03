import type { RGBColor, HSLColor, HSVColor, HEXColor, HWBColor, CMYKColor } from "@/types/color"
import { numberSafe } from "./number"
import { themeFromSourceColor } from "@material/material-color-utilities"

export function colorIsValidWithAlpha(hex: string): boolean {
	return /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/i.test(hex)
}

export function colorIsValid(hex: string): boolean {
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

export function colorHexToHwb(hex: HEXColor): HWBColor {
	return colorRgbToHwb(colorHexToRgb(hex))
}

export function colorHwbToHex(hwb: HWBColor): HEXColor {
	return colorRgbToHex(colorHwbToRgb(hwb))
}

export function colorHwbToRgb(hwb: HWBColor): RGBColor {
	let h = hwb.h * 6
	let w = hwb.w
	let blackness = hwb.b
	let v = 1 - blackness
	let i = Math.floor(h)
	let f = h - i
	if (i & 1) f = 1 - f

	let n = w + f * (v - w)
	let [r, g, b] = [0, 0, 0]

	if (i == 0) [r, g, b] = [v, n, w]
	else if (i == 1) [r, g, b] = [n, v, w]
	else if (i == 2) [r, g, b] = [w, v, n]
	else if (i == 3) [r, g, b] = [w, n, v]
	else if (i == 4) [r, g, b] = [n, w, v]
	else if (i == 5) [r, g, b] = [v, w, n]

	return {r, g, b}
}

export function colorRgbToHwb(rgb: RGBColor): HWBColor {
	const red = rgb.r
	const green = rgb.g
	const blue = rgb.b
	const w = Math.min(red, green, blue)
	const v = Math.max(red, green, blue)
	const b = 1 - v
	if (v == w) return {h: 0, w, b}

	const f = red == w
		? green - blue
		: ((green == w)? blue - red : red - green)
	const i = Math.floor(red == w
		? 3
		: ((green == w)? 5 : 1))
	const h = (i - f / (v - w)) / 6
	return {h, w, b}
}

export function colorHsvToHwb(hsv: HSVColor): HWBColor {
	const h = hsv.h
	const w = (1 - hsv.s) * hsv.v
	const b = 1 - hsv.v
	return {h, w, b}
}

export function colorHwbToHsv(hwb: HWBColor): HSVColor {
	const h = hwb.h
	const s = 1 - (hwb.w / (1 - hwb.b))
	const v = 1 - hwb.b
	return {h, s, v}
}

export function colorHslToHwb(hsl: HSLColor): HWBColor {
	return {...colorHsvToHwb(colorHslToHsv(hsl)), h: hsl.h}
}

export function colorHwbToHsl(hwb: HWBColor): HSLColor {
	return {...colorHsvToHsl(colorHwbToHsv(hwb)), h: hwb.h}
}

export function colorHslToCmyk(hsl: HSLColor): CMYKColor {
	return colorRgbToCmyk(colorHslToRgb(hsl))
}

export function colorCmykToHsl(cmyk: CMYKColor): HSLColor {
	return colorRgbToHsl(colorCmykToRgb(cmyk))
}

export function colorHexToCmyk(hex: HEXColor): CMYKColor {
	return colorRgbToCmyk(colorHexToRgb(hex))
}

export function colorCmykToHex(cmyk: CMYKColor): HEXColor {
	return colorRgbToHex(colorCmykToRgb(cmyk))
}

export function colorCmykToRgb(cmyk: CMYKColor): RGBColor {
	const r = (1 - cmyk.c) * (1 - cmyk.k)
	const g = (1 - cmyk.m) * (1 - cmyk.k)
	const b = (1 - cmyk.y) * (1 - cmyk.k)
	return {r, g, b}
}

export function colorRgbToCmyk(rgb: RGBColor): CMYKColor {
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

export function colorHexToHsl(hex: HEXColor): HSLColor {
	return colorRgbToHsl(colorHexToRgb(hex))
}

export function colorRgbToHsl(rgb: RGBColor): HSLColor {
	let h = 0, s = 0, l = 0
	const r = rgb.r
	const g = rgb.g
	const b = rgb.b

	const min = Math.min(r, g, b)
	const max = Math.max(r, g, b)
	const delta = max - min

	l = (max + min) / 2

	if (delta == 0) {
		h = 0
		s = 0
		return {h, s, l}
	}

	if (l < 0.5) s = delta / (max + min)
	else s = delta / (2 - max - min)

	const deltaR = (((max - r) / 6) + (delta / 2)) / delta
	const deltaG = (((max - g) / 6) + (delta / 2)) / delta
	const deltaB = (((max - b) / 6) + (delta / 2)) / delta

	if (r == max) h = deltaB - deltaG
	else if (g == max) h = (1 / 3) + deltaR - deltaB
	else if (b == max) h = (2 / 3) + deltaG - deltaR

	if (h < 0) h += 1
	if (h > 1) h -= 1

	return {h, s, l}
}

export function colorHexToRgb(hex: HEXColor): RGBColor {
	if (!colorIsValid(hex)) {
		throw new Error("Invalid hex color format!")
	}

	hex = hex.startsWith("#") ? hex.slice(1) : hex as any

	const r = numberSafe(Number.parseInt(hex.substring(0, 2), 16), 0) / 0xff
	const g = numberSafe(Number.parseInt(hex.substring(2, 4), 16), 0) / 0xff
	const b = numberSafe(Number.parseInt(hex.substring(4, 6), 16), 0) / 0xff
	return { r, g, b }
}

export function colorHslToRgb(hsl: HSLColor): RGBColor {
	let r, g, b

	function rgbValue(v1: number, v2: number, vH: number): number {
		while (vH < 0) vH += 1
		while (vH > 1) vH -= 1

		if (6 * vH < 1) return v1 + (v2 - v1) * 6 * vH
		if (2 * vH < 1) return v2
		if (3 * vH < 2) return v1 + (v2 - v1) * (2 / 3 - vH) * 6
		return v1
	}

	if (hsl.s == 0) r = g = b = hsl.l
	else {
		const v2 = hsl.l < 0.5
			? hsl.l * (1 + hsl.s)
			: hsl.l + hsl.s - hsl.s * hsl.l
		const v1 = 2 * hsl.l - v2

		r = rgbValue(v1, v2, hsl.h + 1 / 3)
		g = rgbValue(v1, v2, hsl.h)
		b = rgbValue(v1, v2, hsl.h - 1 / 3)
	}

	return {r, g, b}
}

export function colorHslToHex(hsl: HSLColor): HEXColor {
	return colorRgbToHex(colorHslToRgb(hsl))
}

export function colorRgbToHex(rgb: RGBColor): HEXColor {
	return ('#'
		+ Math.round(rgb.r * 0xff).toString(16).padStart(2, '0')
		+ Math.round(rgb.g * 0xff).toString(16).padStart(2, '0')
		+ Math.round(rgb.b * 0xff).toString(16).padStart(2, '0')
	) as HEXColor
}

export function colorHsvToHex(hsv: HSVColor): HEXColor {
	return colorRgbToHex(colorHsvToRgb(hsv))
}

export function colorHexToHsv(hex: HEXColor): HSVColor {
	return colorRgbToHsv(colorHexToRgb(hex))
}

export function colorRgbToHsv(rgb: RGBColor): HSVColor {
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

	if (delta == 0) {
		s = 0
		h = 0
		return {h, s, v}
	}

	s = delta / max

	const deltaR = (((max - r) / 6) + (delta / 2)) / delta
	const deltaG = (((max - g) / 6) + (delta / 2)) / delta
	const deltaB = (((max - b) / 6) + (delta / 2)) / delta

	if (r == max) h = deltaB - deltaG
	else if (g == max) h = (1 / 3) + deltaR - deltaB
	else if (b == max) h = (2 / 3) + deltaG - deltaR

	if (h < 0) h += 1
	if (h > 1) h -= 1

	return {h, s, v}
}

export function colorHsvToRgb(hsv: HSVColor): RGBColor {
	let r, g, b

	if (hsv.s == 0) {
		r = g = b = hsv.v
		return {r, g, b}
	}

	let h = hsv.h * 6
	if (h == 6) h = 0

	const i = Math.floor(h)
	const j = hsv.v * (1 - hsv.s)
	const k = hsv.v * (1 - hsv.s * (h - i))
	const l = hsv.v * (1 - hsv.s * (1 - (h - i)))

	if (i == 0) [r, g, b] = [hsv.v, l, j]
	else if (i == 1) [r, g, b] = [k, hsv.v, j]
	else if (i == 2) [r, g, b] = [j, hsv.v, l]
	else if (i == 3) [r, g, b] = [j, k, hsv.v]
	else if (i == 4) [r, g, b] = [l, j, hsv.v]
	else [r, g, b] = [hsv.v, j, k]

	return {r, g, b}
}

export function colorHslToHsv(hsl: HSLColor): HSVColor {
	const h = hsl.h
	const v = hsl.l + (hsl.s * Math.min(hsl.l, 1 - hsl.l))
	const s = v == 0
		? 0
		: (2 * (1 - (hsl.l / v)))
	return {h, s, v}
}

export function colorHsvToHsl(hsv: HSVColor): HSLColor {
	const h = hsv.h
	const l = hsv.v * (1 - (hsv.s / 2))
	const s = l == 0 || l == 1
		? 0
		: ((hsv.v - l) / Math.min(l, 1-l))
	return { h, s, l }
}

export function colorHexArgbToRgb(argb: HEXColor): RGBColor {
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
export function colorGeneratePalette(hex: HEXColor): GenerateColorResult {
	if (!colorIsValid(hex)) {
		throw new Error("Invalid hex color format!")
	}

	const theme = themeFromSourceColor(Number.parseInt(hex.substring(1), 16)).schemes
	const [color, onColor, colorDark, onColorDark] = [
		colorRgbToHex(colorHexArgbToRgb('#' + theme.light.primary  .toString(16) as HEXColor)),
		colorRgbToHex(colorHexArgbToRgb('#' + theme.light.onPrimary.toString(16) as HEXColor)),
		colorRgbToHex(colorHexArgbToRgb('#' + theme.dark.primary   .toString(16) as HEXColor)),
		colorRgbToHex(colorHexArgbToRgb('#' + theme.dark.onPrimary .toString(16) as HEXColor)),
	]

	return {color, onColor, colorDark, onColorDark}
}