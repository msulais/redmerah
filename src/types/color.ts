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