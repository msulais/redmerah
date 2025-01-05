import type { RGBColor, HSLColor, HSVColor, HEXColor, HWBColor, CMYKColor } from "@/types/color"
import { math_floor, math_max, math_min, math_pow, math_round } from "./math"
import { regex_test } from "./regex"
import { string_padstart, string_slice, string_starts_with, string_substring } from "./string"
import { number_parse, number_safe, number_to_string } from "./number"
import { themeFromSourceColor } from "@material/material-color-utilities"

export function is_color_with_alpha_valid(hex: string): boolean {
	return regex_test(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/i, hex)
}

export function is_color_valid(hex: string): boolean {
	return regex_test(/^#[0-9a-fA-F]{6}$/i, hex)
}

export function get_luminance(rgb: RGBColor): number {
	const r = math_pow(rgb.r, 2.2)
	const g = math_pow(rgb.g, 2.2)
	const b = math_pow(rgb.b, 2.2)
	const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722

	return luminance
}

/**
 * `Y` = Luminance
 */
export function y_to_lstar(Y: number): number {
	if (Y <= (216 / 24389)) return Y * (24389 / 27)
	return math_pow(Y, (1 / 3)) * 116 - 16
}

/**
 * Result value is between `0` (low contrast) to `100` (high contrast)
 */
export function get_contrast_ratio(rgb1: RGBColor, rgb2: RGBColor): number {
	const L1 = y_to_lstar(get_luminance(rgb1))
	const L2 = y_to_lstar(get_luminance(rgb2))
	const ratio = math_max(L1, L2) - math_min(L1, L2)
	return ratio
}

export function hex_to_hwb(hex: HEXColor): HWBColor {
	return rgb_to_hwb(hex_to_rgb(hex))
}

export function hwb_to_hex(hwb: HWBColor): HEXColor {
	return rgb_to_hex(hwb_to_rgb(hwb))
}

export function hwb_to_rgb(hwb: HWBColor): RGBColor {
	let h = hwb.h * 6
	let w = hwb.w
	let blackness = hwb.b
	let v = 1 - blackness
	let i = math_floor(h)
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

export function rgb_to_hwb(rgb: RGBColor): HWBColor {
	const red = rgb.r
	const green = rgb.g
	const blue = rgb.b
	const w = math_min(red, green, blue)
	const v = math_max(red, green, blue)
	const b = 1 - v
	if (v == w) return {h: 0, w, b}

	const f = red == w
		? green - blue
		: ((green == w)? blue - red : red - green)
	const i = math_floor(red == w
		? 3
		: ((green == w)? 5 : 1))
	const h = (i - f / (v - w)) / 6
	return {h, w, b}
}

export function hsv_to_hwb(hsv: HSVColor): HWBColor {
	const h = hsv.h
	const w = (1 - hsv.s) * hsv.v
	const b = 1 - hsv.v
	return {h, w, b}
}

export function hwb_to_hsv(hwb: HWBColor): HSVColor {
	const h = hwb.h
	const s = 1 - (hwb.w / (1 - hwb.b))
	const v = 1 - hwb.b
	return {h, s, v}
}

export function hsl_to_hwb(hsl: HSLColor): HWBColor {
	return {...hsv_to_hwb(hsl_to_hsv(hsl)), h: hsl.h}
}

export function hwb_to_hsl(hwb: HWBColor): HSLColor {
	return {...hsv_to_hsl(hwb_to_hsv(hwb)), h: hwb.h}
}

export function hsl_to_cmyk(hsl: HSLColor): CMYKColor {
	return rgb_to_cmyk(hsl_to_rgb(hsl))
}

export function cmyk_to_hsl(cmyk: CMYKColor): HSLColor {
	return rgb_to_hsl(cmyk_to_rgb(cmyk))
}

export function hex_to_cmyk(hex: HEXColor): CMYKColor {
	return rgb_to_cmyk(hex_to_rgb(hex))
}

export function cmyk_to_hex(cmyk: CMYKColor): HEXColor {
	return rgb_to_hex(cmyk_to_rgb(cmyk))
}

export function cmyk_to_rgb(cmyk: CMYKColor): RGBColor {
	const r = (1 - cmyk.c) * (1 - cmyk.k)
	const g = (1 - cmyk.m) * (1 - cmyk.k)
	const b = (1 - cmyk.y) * (1 - cmyk.k)
	return {r, g, b}
}

export function rgb_to_cmyk(rgb: RGBColor): CMYKColor {
	const r = rgb.r
	const g = rgb.g
	const b = rgb.b

	if (r == 0 && g == 0 && b == 0) return {
		c: 0, m: 0, y: 0, k: 1
	}

	let c = 1 - r
	let m = 1 - g
	let y = 1 - b
	let k = math_min(c, m, y)

	c = (c - k) / (1 - k)
	m = (m - k) / (1 - k)
	y = (y - k) / (1 - k)

	return {c, m, y, k}
}

export function hex_to_hsl(hex: HEXColor): HSLColor {
	return rgb_to_hsl(hex_to_rgb(hex))
}

export function rgb_to_hsl(rgb: RGBColor): HSLColor {
	let h = 0, s = 0, l = 0
	const r = rgb.r
	const g = rgb.g
	const b = rgb.b

	const min = math_min(r, g, b)
	const max = math_max(r, g, b)
	const delta = max - min

	l = (max + min) / 2

	if (delta == 0) {
		h = 0
		s = 0
		return {h, s, l}
	}

	if (l < 0.5) s = delta / (max + min)
	else s = delta / (2 - max - min)

	const delta_r = (((max - r) / 6) + (delta / 2)) / delta
	const delta_g = (((max - g) / 6) + (delta / 2)) / delta
	const delta_b = (((max - b) / 6) + (delta / 2)) / delta

	if (r == max) h = delta_b - delta_g
	else if (g == max) h = (1 / 3) + delta_r - delta_b
	else if (b == max) h = (2 / 3) + delta_g - delta_r

	if (h < 0) h += 1
	if (h > 1) h -= 1

	return {h, s, l}
}

export function hex_to_rgb(hex: HEXColor): RGBColor {
	if (!is_color_valid(hex)) {
		throw new Error("Invalid hex color format!")
	}

	hex = string_starts_with(hex, "#") ? string_slice(hex, 1) : hex as any

	const r = number_safe(number_parse(string_substring(hex, 0, 2), true, 16), 0) / 0xff
	const g = number_safe(number_parse(string_substring(hex, 2, 4), true, 16), 0) / 0xff
	const b = number_safe(number_parse(string_substring(hex, 4, 6), true, 16), 0) / 0xff
	return { r, g, b }
}

export function hsl_to_rgb(hsl: HSLColor): RGBColor {
	let r, g, b

	function get_rgb_value(v1: number, v2: number, vH: number): number {
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

		r = get_rgb_value(v1, v2, hsl.h + 1 / 3)
		g = get_rgb_value(v1, v2, hsl.h)
		b = get_rgb_value(v1, v2, hsl.h - 1 / 3)
	}

	return {r, g, b}
}

export function hsl_to_hex(hsl: HSLColor): HEXColor {
	return rgb_to_hex(hsl_to_rgb(hsl))
}

export function rgb_to_hex(rgb: RGBColor): HEXColor {
	return ('#'
		+ string_padstart(number_to_string(math_round(rgb.r * 0xff), 16), 2, '0')
		+ string_padstart(number_to_string(math_round(rgb.g * 0xff), 16), 2, '0')
		+ string_padstart(number_to_string(math_round(rgb.b * 0xff), 16), 2, '0')
	) as HEXColor
}

export function hsv_to_hex(hsv: HSVColor): HEXColor {
	return rgb_to_hex(hsv_to_rgb(hsv))
}

export function hex_to_hsv(hex: HEXColor): HSVColor {
	return rgb_to_hsv(hex_to_rgb(hex))
}

export function rgb_to_hsv(rgb: RGBColor): HSVColor {
	let h: number = 0
	let s: number = 0
	let v: number = 0

	const r = rgb.r
	const g = rgb.g
	const b = rgb.b

	const min = math_min(r, g, b)
	const max = math_max(r, g, b)
	const delta = max - min

	v = max

	if (delta == 0) {
		s = 0
		h = 0
		return {h, s, v}
	}

	s = delta / max

	const delta_r = (((max - r) / 6) + (delta / 2)) / delta
	const delta_g = (((max - g) / 6) + (delta / 2)) / delta
	const delta_b = (((max - b) / 6) + (delta / 2)) / delta

	if (r == max) h = delta_b - delta_g
	else if (g == max) h = (1 / 3) + delta_r - delta_b
	else if (b == max) h = (2 / 3) + delta_g - delta_r

	if (h < 0) h += 1
	if (h > 1) h -= 1

	return {h, s, v}
}

export function hsv_to_rgb(hsv: HSVColor): RGBColor {
	let r, g, b

	if (hsv.s == 0) {
		r = g = b = hsv.v
		return {r, g, b}
	}

	let h = hsv.h * 6
	if (h == 6) h = 0

	const i = math_floor(h)
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

export function hsl_to_hsv(hsl: HSLColor): HSVColor {
	const h = hsl.h
	const v = hsl.l + (hsl.s * math_min(hsl.l, 1 - hsl.l))
	const s = v == 0
		? 0
		: (2 * (1 - (hsl.l / v)))
	return {h, s, v}
}

export function hsv_to_hsl(hsv: HSVColor): HSLColor {
	const h = hsv.h
	const l = hsv.v * (1 - (hsv.s / 2))
	const s = l == 0 || l == 1
		? 0
		: ((hsv.v - l) / math_min(l, 1-l))
	return { h, s, l }
}

export function hex_argb_to_rgb(argb: HEXColor): RGBColor {
	const argb_hex = string_starts_with(argb, '#') ? string_slice(argb, 1) : argb
	const argb_int = number_parse(string_padstart(argb_hex, 8, '0'), true, 16)
	const r = ((argb_int >> 16) & 0xFF) / 0xff
	const g = ((argb_int >> 8) & 0xFF) / 0xff
	const b = (argb_int & 0xFF) / 0xff

	return {r, g, b}
  }

type GenerateColorResult = {
	color: HEXColor
	on_color: HEXColor
	color_dark: HEXColor
	on_color_dark: HEXColor
}

/**
 * Generate 4 different color from color source:
 * - Color
 * - On Color
 * - Color Dark
 * - On Color Dark
*/
export function generate_color(hex: HEXColor): GenerateColorResult {
	if (!is_color_valid(hex)) {
		throw new Error("Invalid hex color format!")
	}

	const theme = themeFromSourceColor(number_parse(string_substring(hex, 1), true, 16)).schemes
	const [color, on_color, color_dark, on_color_dark] = [
		rgb_to_hex(hex_argb_to_rgb('#' + number_to_string(theme.light.primary  , 16) as HEXColor)),
		rgb_to_hex(hex_argb_to_rgb('#' + number_to_string(theme.light.onPrimary, 16) as HEXColor)),
		rgb_to_hex(hex_argb_to_rgb('#' + number_to_string(theme.dark.primary   , 16) as HEXColor)),
		rgb_to_hex(hex_argb_to_rgb('#' + number_to_string(theme.dark.onPrimary , 16) as HEXColor)),
	]

	return {color, on_color, color_dark, on_color_dark}
}