import type { HEXColor } from "@/types/color"
import type { ColorModel, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, RectangularColorSpace } from "./_enums"

export type Gradient = ConicGradient | LinearGradient | RadialGradient

export type GradientData = {
	id: number
	gradients: Gradient[]
}

export type ColorStopGradient = {
	/** only use to save/delete db */
	id: number

	/** only use to save/delete db */
	data_id: number

	/** only use to save/delete db */
	gradient_id: number
	gradient_type: GradientType
	color: HEXColor

	/** `0-100` in percentage `%` */
	size: number
}

export type LinearGradient = {
	/** only use to save/delete db */
	id: number

	/** only use to save/delete db */
	data_id: number
	type: GradientType.linear
	repeat: boolean

	/** in degree `deg` */
	angle: number
	color_interpolation_method: RectangularColorSpace | PolarColorSpace
	hue_interpolation_method: HueInterpolationMethod
	color_stop_list: ColorStopGradient[]
}

export type RadialGradient = {
	/** only use to save/delete db */
	id: number

	/** only use to save/delete db */
	data_id: number
	type: GradientType.radial
	repeat: boolean
	shape: RadialGradientShape

	/** in percentage `%` */
	position_x: number

	/** in percentage `%` */
	position_y: number

	/** in percentage `%` */
	size_width: number

	/** in percentage `%` */
	size_height: number

	/** in pixel `px` */
	size_length: number
	color_interpolation_method: RectangularColorSpace | PolarColorSpace
	hue_interpolation_method: HueInterpolationMethod
	color_stop_list: ColorStopGradient[]
}

export type ConicGradient = {
	/** only use to save/delete db */
	id: number

	/** only use to save/delete db */
	data_id: number
	type: GradientType.conic
	repeat: boolean

	/** in degree `deg` */
	angle: number

	/** in percentage `%` */
	position_x: number

	/** in percentage `%` */
	position_y: number
	color_interpolation_method: RectangularColorSpace | PolarColorSpace
	hue_interpolation_method: HueInterpolationMethod
	color_stop_list: ColorStopGradient[]
}

export type Settings = {
	border_radius: number
	aspect_ratio: number
	color_model: ColorModel
}