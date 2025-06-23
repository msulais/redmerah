export enum ColorSpace {
	hex = 'hex',
	rgba = 'rgba',
	hsla = 'hsla'
}

export enum GradientType {
	linear = 'linear',
	radial = 'radial',
	conic = 'conic'
}

export enum RadialGradientShape {
	ellipse = 'ellipse',
	circle = 'circle'
}

/**
 * This will crash if the browser not supported.
 * Currently not recommended to use in production.
*/
export enum RectangularColorSpace {
	auto = 'auto',
	srgb = 'srgb',
	srgbLinear = 'srgb-linear',
	displayP3 = 'display-p3',
	a98Rgb = 'a98-rgb',
	prophotoRgb = 'prophoto-rgb',
	rec2020 = 'rec2020',
	lab = 'lab',
	oklab = 'oklab',
	xyz = 'xyz',
	xyzD50 = 'xyz-d50',
	xyzD65 = 'xyz-d65',
}

export enum PolarColorSpace {
	auto = 'auto',
	hsl = 'hsl',
	hwb = 'hwb',
	lch = 'lch',
	oklch = 'oklch'
}

export enum HueInterpolationMethod {
	auto = 'auto',
	shorter = 'shorter',
	longer = 'longer',
	increasing = 'increasing',
	decreasing = 'decreasing'
}