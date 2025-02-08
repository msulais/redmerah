export enum ColorPickerMode {
	image = 'image',
	rectangle = 'rectangle',
	rectangleHsl = 'rectangle-hsl',
	palette = 'palette',
	spectrum = 'spectrum',
	wheel = 'wheel',
	sliderRgb = 'slider-rgb',
	sliderHsl = 'slider-hsl',
	sliderCmyk = 'slider-cmyk',
	sliderHex = 'slider-hex',
	sliderHsv = 'slider-hsv',
	sliderHwb = 'slider-hwb'
}

export enum Commands {
	/** @param mode `ColorPickerMode` */
	updateMode,

	/** @param input `HSLColor` */
	updateInput,
}