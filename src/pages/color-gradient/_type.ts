import type { HEXColor } from "@/types/color"
import type { ColorSpace, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, RectangularColorSpace } from "./_enums"

export type Gradient = ConicGradient | LinearGradient | RadialGradient

export type GradientData = {
	id: number
	gradients: Gradient[]
}

export type ColorStopGradient = {
	/** only use to save/delete db */
	id: number

	/** only use to save/delete db */
	dataId: number

	/** only use to save/delete db */
	gradientId: number
	gradientType: GradientType
	color: HEXColor

	/** `0-100` in percentage `%` */
	size: number
}

export type LinearGradient = {
	/** only use to save/delete db */
	id: number

	/** only use to save/delete db */
	dataId: number
	type: GradientType.linear
	repeat: boolean

	/** in degree `deg` */
	angle: number
	colorInterpolationMethod: RectangularColorSpace | PolarColorSpace
	hueInterpolationMethod: HueInterpolationMethod
	colorStopList: ColorStopGradient[]
}

export type RadialGradient = {
	/** only use to save/delete db */
	id: number

	/** only use to save/delete db */
	dataId: number
	type: GradientType.radial
	repeat: boolean
	shape: RadialGradientShape

	/** in percentage `%` */
	positionX: number

	/** in percentage `%` */
	positionY: number

	/** in percentage `%` */
	sizeWidth: number

	/** in percentage `%` */
	sizeHeight: number

	/** in pixel `px` */
	sizeLength: number
	colorInterpolationMethod: RectangularColorSpace | PolarColorSpace
	hueInterpolationMethod: HueInterpolationMethod
	colorStopList: ColorStopGradient[]
}

export type ConicGradient = {
	/** only use to save/delete db */
	id: number

	/** only use to save/delete db */
	dataId: number
	type: GradientType.conic
	repeat: boolean

	/** in degree `deg` */
	angle: number

	/** in percentage `%` */
	positionX: number

	/** in percentage `%` */
	positionY: number
	colorInterpolationMethod: RectangularColorSpace | PolarColorSpace
	hueInterpolationMethod: HueInterpolationMethod
	colorStopList: ColorStopGradient[]
}

export type Settings = {
	borderRadius: number
	aspectRatio: number
	colorSpace: ColorSpace
}