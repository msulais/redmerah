import type { ConicGradient, ColorStopGradient, GradientData, LinearGradient, RadialGradient } from "./_type"

export type ObjectStoreSettings<T = unknown> = {
	key: string
	value: T
}

export type ObjectStoreGradientData = Omit<GradientData, 'gradients'>
export type ObjectStoreLinearGradient = Omit<LinearGradient, 'colorStopList'>
export type ObjectStoreRadialGradient = Omit<RadialGradient, 'colorStopList'>
export type ObjectStoreConicGradient = Omit<ConicGradient, 'colorStopList'>
export type ObjectStoreColorStopGradient = ColorStopGradient

export enum ObjectStoreNames {
	settings = 'settings',
	gradientData = 'gradientData',
	linearGradient = 'linearGradient',
	radialGradient = 'radialGradient',
	conicGradient = 'conicGradient',
	colorStopGradient = 'colorStopGradient'
}

export enum ObjectStoreSettingsKeys {
	/** @param value `number` */
	borderRadius = 'borderRadius',

	/** @param value `number` */
	aspectRatio = 'aspectRatio',

	/** @param value `ColorModel` */
	colorModel = 'colorModel',
}