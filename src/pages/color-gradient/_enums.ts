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
 * Currenty not recommended to use in production.
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

export enum Commands {
	/**
	@param { number } gradient_index `number`
	@param { number } color_stop_index `number`
	@param { number } length `number` from `0` to `100` */
	updateColorStopLength,

	/** @param { number } gradient_index `number` */
	toggleGradientRepeat,

	/**
	@param { number } gradient_index `number`
	@param { number } angle `number` from `0` to `360` */
	updateGradientAngle,

	/**
	@param { number } gradient_index `number`
	@param { RectangularColorSpace | PolarColorSpace } colorspace `RectangularColorSpace | PolarColorSpace`*/
	updateColorInterpolationMethod,

	/**
	@param { number } gradient_index `number`
	@param { HueInterpolationMethod } method `HueInterpolationMethod` */
	updateHueInterpolationMethod,

	/**
	@param { number } gradient_index `number`
	@param { number } color_stop_index `number`
	@param { HEXColor } color `HEXColor` */
	updateColorStopColor,

	/** @param { number } gradient_index `number` */
	addColorStop,

	/**
	@param { number } gradient_index `number`
	@param { number } color_stop_index `number` */
	removeColorStop,

	addGradient,

	/** @param { number } gradient_index `number` */
	removeGradient,

	/** @param { ColorSpace } space `ColorSpace` */
	updateSettingsColorSpace,

	/** @param { number } value `number` */
	updateSettingsAspectRatio,

	/** @param { number } value `number` */
	updateSettingsBorderRadius,

	/**
	@param { number } gradient_index `number`
	@param { GradientType } type `GradientType` */
	updateGradientType,

	/**
	@param { number } gradient_index `number`
	@param { RadialGradientShape } shape `RadialGradientShape` */
	updateRadialGradientShape,

	/**
	@param { number } gradient_index `number`
	@param { number } x `number` from `0` to `100` */
	updateGradientPositionX,

	/**
	@param { number } gradient_index `number`
	@param { number } y `number` from `0` to `100` */
	updateGradientPositionY,

	/**
	@param { number } gradient_index `number`
	@param { number } size `number` */
	updateRadialGradientSize,

	/**
	@param { number } gradient_index `number`
	@param { number } width `number` from `0` to `100` */
	updateRadialGradientWidth,

	/**
	@param { number } gradient_index `number`
	@param { number } height `number` from `0` to `100` */
	updateRadialGradientHeight,

	saveGradient,

	/** @param { number } index `number` */
	viewGradientData,

	/** @param { number } index `number` */
	deleteGradientData,
}

export enum ColorSpace {
	hex = 'hex',
	rgba = 'rgba',
	hsla = 'hsla'
}