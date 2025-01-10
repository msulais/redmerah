export enum ColorPickerMode {
	image = 'image',
	rectangle = 'rectangle',
	rectangle_hsl = 'rectangle-hsl',
	palette = 'palette',
	spectrum = 'spectrum',
	wheel = 'wheel',
	slider_rgb = 'slider-rgb',
	slider_hsl = 'slider-hsl',
	slider_cmyk = 'slider-cmyk',
	slider_hex = 'slider-hex',
	slider_hsv = 'slider-hsv',
	slider_hwb = 'slider-hwb'
}

export enum Commands {
	/** @param mode `ColorPickerMode` */
	change_mode,

	/** @param input `HSLColor` */
	update_input,
}