export enum ColorSpace {
	HEX = 'hex',
	RGBA = 'rgba',
	HSLA = 'hsla'
}

export enum GradientType {
	Linear = 'linear',
	Radial = 'radial',
	Conic = 'conic'
}

export enum RadialGradientShape {
	Ellipse = 'ellipse',
	Circle = 'circle'
}

/**
 * This will crash if the browser not supported.
 * Currently not recommended to use in production.
*/
export enum RectangularColorSpace {
	Auto = 'auto',
	Srgb = 'srgb',
	SrgbLinear = 'srgb-linear',
	DisplayP3 = 'display-p3',
	A98Rgb = 'a98-rgb',
	ProphotoRgb = 'prophoto-rgb',
	Rec2020 = 'rec2020',
	Lab = 'lab',
	Oklab = 'oklab',
	Xyz = 'xyz',
	XyzD50 = 'xyz-d50',
	XyzD65 = 'xyz-d65',
}

export enum PolarColorSpace {
	Auto = 'auto',
	Hsl = 'hsl',
	Hwb = 'hwb',
	Lch = 'lch',
	Oklch = 'oklch'
}

export enum HueInterpolationMethod {
	Auto = 'auto',
	Shorter = 'shorter',
	Longer = 'longer',
	Increasing = 'increasing',
	Decreasing = 'decreasing'
}