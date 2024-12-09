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
	change_color_stop_length = 'a',

	/** @param { number } gradient_index `number` */
	toggle_gradient_repeat = 'b',

	/**
	@param { number } gradient_index `number`
	@param { number } angle `number` from `0` to `360` */
	change_gradient_angle = 'c',

	/**
	@param { number } gradient_index `number`
	@param { RectangularColorSpace | PolarColorSpace } colorspace `RectangularColorSpace | PolarColorSpace`*/
	change_color_interpolation_method = 'd',

	/**
	@param { number } gradient_index `number`
	@param { HueInterpolationMethod } method `HueInterpolationMethod` */
	change_hue_interpolation_method = 'e',

	/**
	@param { number } gradient_index `number`
	@param { number } color_stop_index `number`
	@param { HEXColor } color `HEXColor` */
	change_color_stop_color = 'f',

	/** @param { number } gradient_index `number` */
	add_color_stop = 'g',

	/**
	@param { number } gradient_index `number`
	@param { number } color_stop_index `number` */
	remove_color_stop = 'h',

	add_gradient = 'i',

	/** @param { number } gradient_index `number` */
	remove_gradient = 'j',

	/** @param { ColorModel } model `ColorModel` */
	change_settings_colormodel = 'k',

	/** @param { number } value `number` */
	change_settings_aspect_ratio = 'l',

	/** @param { number } value `number` */
	change_settings_border_radius = 'm',

	/**
	@param { number } gradient_index `number`
	@param { GradientType } type `GradientType` */
	change_gradient_type = 'n',

	/**
	@param { number } gradient_index `number`
	@param { RadialGradientShape } shape `RadialGradientShape` */
	change_radial_gradient_shape = 'o',

	/**
	@param { number } gradient_index `number`
	@param { number } x `number` from `0` to `100` */
	change_gradient_position_x = 'p',

	/**
	@param { number } gradient_index `number`
	@param { number } y `number` from `0` to `100` */
	change_gradient_position_y = 'q',

	/**
	@param { number } gradient_index `number`
	@param { number } size `number` */
	change_radial_gradient_size = 'r',

	/**
	@param { number } gradient_index `number`
	@param { number } width `number` from `0` to `100` */
	change_radial_gradient_width = 's',

	/**
	@param { number } gradient_index `number`
	@param { number } height `number` from `0` to `100` */
	change_radial_gradient_height = 't',

	save_gradient = 'u',

	/** @param { number } index `number` */
	view_gradient_data = 'v',

	/** @param { number } index `number` */
	delete_gradient_data = 'w',
}

export enum ColorModel {
	hex = 'hex',
	rgba = 'rgba',
	hsla = 'hsla'
}