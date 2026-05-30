export type HSLColor = {
	/** 0-1 */
	h: number

	/** 0-1 */
	s: number

	/** 0-1 */
	l: number
}

export type CMYKColor = {
	/** 0-1 */
	c: number

	/** 0-1 */
	m: number

	/** 0-1 */
	y: number

	/** 0-1 */
	k: number
}

export type HWBColor = {
	/** 0-1 */
	h: number

	/** 0-1 */
	w: number

	/** 0-1 */
	b: number
}

export type RGBColor = {
	/** 0-1 */
	r: number

	/** 0-1 */
	g: number

	/** 0-1 */
	b: number
}

export type HSVColor = {
	/** 0-1 */
	h: number

	/** 0-1 */
	s: number

	/** 0-1 */
	v: number
}

export type HEXColor = `#${string}`

export function colorLuminance(rgb: RGBColor): number {
	let r = rgb.r
	r = r <= 0.03928? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4

	let g = rgb.g
	g = g <= 0.03928? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4

	let b = rgb.b
	b = b <= 0.03928? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4

	return r * 0.2126 + g * 0.7152 + b * 0.0722
}

export function colorContrastPercentage(rgb1: RGBColor, rgb2: RGBColor): number {
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

export function isColorValid(hex: string): boolean {
	return /^#[0-9a-fA-F]{6}$/i.test(hex)
}

export function colorToHex(value: number): HEXColor {
	return rgbToHex(colorToRgb(value))
}

export function rgbToHex(rgb: RGBColor): HEXColor {
	const pad = (v: number) => Math.round(v * 0xff).toString(16).padStart(2, '0')
	return ('#'
		+ pad(rgb.r)
		+ pad(rgb.g)
		+ pad(rgb.b)
	) as HEXColor
}

export function colorToRgb(value: number): RGBColor {
	value = Math.round(value)
	return {
		r: ((value >> 16) & 0xFF) / 0xff,
		g: ((value >> 8) & 0xFF) / 0xff,
		b: (value & 0xFF) / 0xff
	}
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

export function colorContrastRatio(rgb1: RGBColor, rgb2: RGBColor): number {
	const L1 = colorLuminance(rgb1)
	const L2 = colorLuminance(rgb2)
	return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
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

export function hexToRgb(hex: HEXColor): RGBColor {
	if (!isColorValid(hex)) {
		throw new Error("Invalid hex color format!")
	}

	hex = hex.startsWith("#") ? hex.slice(1) : hex as any
	const fn_safeParse = (num: number, fallback: number = 0): number => {
		return (Number.isNaN(num) as boolean || !Number.isFinite(num))? fallback : num
	}

	const r = fn_safeParse(Number.parseInt(hex.substring(0, 2), 16), 0) / 0xff
	const g = fn_safeParse(Number.parseInt(hex.substring(2, 4), 16), 0) / 0xff
	const b = fn_safeParse(Number.parseInt(hex.substring(4, 6), 16), 0) / 0xff
	return { r, g, b }
}