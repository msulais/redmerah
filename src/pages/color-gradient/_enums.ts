export const enum GradientType {
	linear = 'linear',
	radial = 'radial',
	conic = 'conic'
}

export const enum RadialGradientShape {
	ellipse = 'ellipse',
	circle = 'circle'
}

/**
 * This will crash if the browser not supported.
 * Currenty not recommended to use in production.
*/
export const enum RectangularColorSpace {
	auto = 'auto',
	srgb = 'srgb',
	srgb_linear = 'srgb-linear',
	display_p3 = 'display-p3',
	a98_rgb = 'a98-rgb',
	prophoto_rgb = 'prophoto-rgb',
	rec2020 = 'rec2020',
	lab = 'lab',
	oklab = 'oklab',
	xyz = 'xyz',
	xyz_d50 = 'xyz-d50',
	xyz_d65 = 'xyz-d65',
}

export const enum PolarColorSpace {
	auto = 'auto',
	hsl = 'hsl',
	hwb = 'hwb',
	lch = 'lch',
	oklch = 'oklch'
}

export const enum HueInterpolationMethod {
	auto = 'auto',
	shorter = 'shorter',
	longer = 'longer',
	increasing = 'increasing',
	decreasing = 'decreasing'
}

export const enum Commands {
	/**
	@param { number } gradient_index `number`
	@param { number } color_stop_index `number`
	@param { number } length `number` from `0` to `100` */
	change_color_stop_length,

	/** @param { number } gradient_index `number` */
	toggle_gradient_repeat,

	/**
	@param { number } gradient_index `number`
	@param { number } angle `number` from `0` to `360` */
	change_gradient_angle,

	/**
	@param { number } gradient_index `number`
	@param { RectangularColorSpace | PolarColorSpace } colorspace `RectangularColorSpace | PolarColorSpace`*/
	change_color_interpolation_method,

	/**
	@param { number } gradient_index `number`
	@param { HueInterpolationMethod } method `HueInterpolationMethod` */
	change_hue_interpolation_method,

	/**
	@param { number } gradient_index `number`
	@param { number } color_stop_index `number`
	@param { HEXColor } color `HEXColor` */
	change_color_stop_color,

	/** @param { number } gradient_index `number` */
	add_color_stop,

	/**
	@param { number } gradient_index `number`
	@param { number } color_stop_index `number` */
	remove_color_stop,

	add_gradient,

	/** @param { number } gradient_index `number` */
	remove_gradient,

	/** @param { ColorModel } model `ColorModel` */
	change_settings_colormodel,

	/** @param { number } value `number` */
	change_settings_aspect_ratio,

	/** @param { number } value `number` */
	change_settings_border_radius,

	/**
	@param { number } gradient_index `number`
	@param { GradientType } type `GradientType` */
	change_gradient_type,

	/**
	@param { number } gradient_index `number`
	@param { RadialGradientShape } shape `RadialGradientShape` */
	change_radial_gradient_shape,

	/**
	@param { number } gradient_index `number`
	@param { number } x `number` from `0` to `100` */
	change_gradient_position_x,

	/**
	@param { number } gradient_index `number`
	@param { number } y `number` from `0` to `100` */
	change_gradient_position_y,

	/**
	@param { number } gradient_index `number`
	@param { number } size `number` */
	change_radial_gradient_size,

	/**
	@param { number } gradient_index `number`
	@param { number } width `number` from `0` to `100` */
	change_radial_gradient_width,

	/**
	@param { number } gradient_index `number`
	@param { number } height `number` from `0` to `100` */
	change_radial_gradient_height,

	save_gradient,

	/** @param { number } index `number` */
	view_gradient_data,

	/** @param { number } index `number` */
	delete_gradient_data,
}

export const enum ColorModel {
	hex = 'hex',
	rgba = 'rgba',
	hsla = 'hsla'
}