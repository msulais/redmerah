import type { ConicGradient, ColorStopGradient, GradientData, LinearGradient, RadialGradient } from "./_type"

export type ObjectStoreSettings<T = unknown> = {
	key: string
	value: T
}

export type ObjectStoreGradientData = Omit<GradientData, 'gradients'>
export type ObjectStoreLinearGradient = Omit<LinearGradient, 'color_stop_list'>
export type ObjectStoreRadialGradient = Omit<RadialGradient, 'color_stop_list'>
export type ObjectStoreConicGradient = Omit<ConicGradient, 'color_stop_list'>
export type ObjectStoreColorStopGradient = ColorStopGradient

export enum ObjectStoreNames {
	settings = 'settings',
	gradient_data = 'gradient_data',
	linear_gradient = 'linear_gradient',
	radial_gradient = 'radial_gradient',
	conic_gradient = 'conic_gradient',
	color_stop_gradient = 'color_stop_gradient'
}

export enum ObjectStoreSettingsKeys {
	/** @param value `number` */
	border_radius = 'border_radius',

	/** @param value `number` */
	aspect_ratio = 'aspect_ratio',

	/** @param value `ColorModel` */
	color_model = 'color_model',
}