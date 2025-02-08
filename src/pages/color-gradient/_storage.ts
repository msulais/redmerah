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
	gradientData = 'gradient-data',
	linearGradient = 'linear-gradient',
	radialGradient = 'radial-gradient',
	conicGradient = 'conic-gradient',
	colorStopGradient = 'color-stop-gradient'
}

export enum ObjectStoreSettingsKeys {
	/** @param value `number` */
	borderRadius = 'border-radius',

	/** @param value `number` */
	aspectRatio = 'aspect-ratio',

	/** @param value `ColorSpace` */
	colorSpace = 'color-space',
}