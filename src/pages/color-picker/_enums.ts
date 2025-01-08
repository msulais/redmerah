export const enum ColorPickerMode {
	image,
	rectangle,
	rectangle_hsl,
	palette,
	spectrum,
	wheel,
	slider_rgb,
	slider_hsl,
	slider_cmyk,
	slider_hex,
	slider_hsv,
	slider_hwb
}

export const enum Commands {
	/** @param mode `ColorPickerMode` */
	change_mode,

	/** @param input `HSLColor` */
	update_input,
}