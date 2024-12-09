/**
 * Resources:
 * http://www.easyrgb.com/en/math.php
 * https://www.myndex.com/WEB/LuminanceContrast
 */

import type { RGBColor, HSLColor, HSVColor, HEXColor } from "@/types/color"
import { math_floor, math_max, math_min, math_pow, math_round } from "./math"
import { regex_test } from "./regex"
import { string_padstart, string_slice, string_starts_with, string_substring } from "./string"
import { number_parse, number_to_string } from "./number"

export function is_color_with_alpha_valid(hex: string): boolean {
	return regex_test(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/i, hex)
}

export function is_color_valid(hex: string): boolean {
	return regex_test(/^#[0-9a-fA-F]{6}$/i, hex)
}

export function get_luminance(rgb: RGBColor): number {
	const r = math_pow(rgb.r / 255, 2.2)
	const g = math_pow(rgb.g / 255, 2.2)
	const b = math_pow(rgb.b / 255, 2.2)
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

export function hex_to_hsl(hex: HEXColor): HSLColor {
	return rgb_to_hsl(hex_to_rgb(hex))
}

export function rgb_to_hsl(rgb: RGBColor): HSLColor {
	let h = 0, s = 0, l = 0
	const r = rgb.r / 255
	const g = rgb.g / 255
	const b = rgb.b / 255

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

	const r = number_parse(string_substring(hex, 0, 2), true, 16)
	const g = number_parse(string_substring(hex, 2, 4), true, 16)
	const b = number_parse(string_substring(hex, 4, 6), true, 16)
	return { r, g, b }
}

export function hue_to_rgb(v1: number, v2: number, vH: number) {
	while (vH < 0) vH += 1
	while (vH > 1) vH -= 1

	if (6 * vH < 1) return v1 + (v2 - v1) * 6 * vH
	if (2 * vH < 1) return v2
	if (3 * vH < 2) return v1 + (v2 - v1) * (2 / 3 - vH) * 6
	return v1
}

export function hsl_to_rgb(hsl: HSLColor): RGBColor {
	let r, g, b

	if (hsl.s == 0) r = g = b = hsl.l
	else {
		const v2 = hsl.l < 0.5
			? hsl.l * (1 + hsl.s)
			: hsl.l + hsl.s - hsl.s * hsl.l
		const v1 = 2 * hsl.l - v2

		r = hue_to_rgb(v1, v2, hsl.h + 1 / 3)
		g = hue_to_rgb(v1, v2, hsl.h)
		b = hue_to_rgb(v1, v2, hsl.h - 1 / 3)
	}

	return {
		r: math_round(r * 255),
		g: math_round(g * 255),
		b: math_round(b * 255)
	}
}

export function hsl_to_hex(hsl: HSLColor): HEXColor {
	return rgb_to_hex(hsl_to_rgb(hsl))
}

export function rgb_to_hex(rgb: RGBColor): HEXColor {
	return ('#'
		+ string_padstart(number_to_string(rgb.r, 16), 2, '0')
		+ string_padstart(number_to_string(rgb.g, 16), 2, '0')
		+ string_padstart(number_to_string(rgb.b, 16), 2, '0')
	) as HEXColor
}

export function rgb_to_hsv(rgb: RGBColor): HSVColor {
	let h: number = 0
	let s: number = 0
	let v: number = 0

	const r = rgb.r / 255
	const g = rgb.g / 255
	const b = rgb.b / 255

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
		r = g = b = math_round(hsv.v * 255)
		return {r, g, b}
	}

	let h = hsv.h * 6
	if (h == 6) h = 0

	const i = math_floor(h)
	const j = hsv.v * (1 - hsv.s)
	const k = hsv.v * (1 - hsv.s * (h - i))
	const l = hsv.v * (1 - hsv.s * (1 - (h - i)))

	if (i == 0){
		r = hsv.v
		g = l
		b = j
	}
	else if (i == 1){
		r = k
		g = hsv.v
		b = j
	}
	else if (i == 2){
		r = j
		g = hsv.v
		b = l
	}
	else if (i == 3){
		r = j
		g = k
		b = hsv.v
	}
	else if (i == 4){
		r = l
		g = j
		b = hsv.v
	}
	else {
		r = hsv.v
		g = j
		b = k
	}

	r = math_round(r * 255)
	g = math_round(g * 255)
	b = math_round(b * 255)

	return {r, g, b}
}

export function hsl_to_hsv(hsl: HSLColor): HSVColor {
	return rgb_to_hsv(hsl_to_rgb(hsl))
}

export function hsv_to_hsl(hsv: HSVColor): HSLColor {
	return rgb_to_hsl(hsv_to_rgb(hsv))
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
	const hsl = {...hex_to_hsl(hex), s: 1}

	/**
	 * `contrast` must be a value between `0 (bad) => 100 (best (high contrast))`.
	 */
	function getLightness(hsl: HSLColor, contrast: number){
		let lightness = 0
		const brightness = y_to_lstar(get_luminance(hsl_to_rgb(hsl)))

		for (let i = 0; i < 101; i++){
			if (brightness > 50) lightness = i / 100
			else lightness = 1 - (i / 100)

			if (get_contrast_ratio(hsl_to_rgb(hsl), hsl_to_rgb({...hsl, l: lightness})) <= contrast) break
		}

		return math_max(0, math_min(1, lightness))
	}

	/**
	 * @param hsl
	 * @param contrast Range from `0` to `100` (`0`=darkest, `100`=lightest)
	 */
	function getColor(hsl: HSLColor, contrast: number): HSLColor {
		const high_to_low: boolean = contrast <= 50 ? true : false
		const brightness = (c: HSLColor) => y_to_lstar(get_luminance(hsl_to_rgb(c)))
		let lightness: number = 0

		for (let i = 0; i < 101; i++){
			if (high_to_low) {
				lightness = 1 - (i / 100)
				hsl = {...hsl, l: lightness}
				if (brightness(hsl) <= contrast) break;
				continue
			}

			lightness = i / 100
			hsl = {...hsl, l: lightness}
			if (brightness(hsl) >= contrast) break
		}

		return hsl
	}

	const color = getColor(hsl, 88 - get_contrast_ratio(hsl_to_rgb(hsl), {r: 255, g: 255, b: 255}))
	const on_color = {...color, l: getLightness(color, 100)}
	const color_dark = getColor(color, 72)
	const on_color_dark = {...color_dark, l: getLightness(color_dark, 100)}

	return {
		color        : hsl_to_hex(color        ),
		on_color     : hsl_to_hex(on_color     ),
		color_dark   : hsl_to_hex(color_dark   ),
		on_color_dark: hsl_to_hex(on_color_dark)
	}
}