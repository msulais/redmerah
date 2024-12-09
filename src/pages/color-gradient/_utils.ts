import { RectangularColorSpace, PolarColorSpace, HueInterpolationMethod, GradientType, RadialGradientShape, ColorModel } from "./_enums"
import type { Gradient } from "./_type"
import type { HEXColor } from "@/types/color"
import { math_round } from "@/utils/math"
import { hex_to_hsl, hex_to_rgb } from "@/utils/color"
import { string_length, string_padstart, string_substring } from "@/utils/string"
import { number_parse, number_tofixed } from "@/utils/number"
import { array_includes, array_join, array_map, array_sort } from "@/utils/array"

export function convert_color_by_color_model(color: HEXColor, model: ColorModel, keep_opacity: boolean = false): string {
	const get_opacity = (): number => (string_length(color) > 7
		? number_parse(string_padstart(string_substring(color, 7), 2, '0'), true, 16) / 255
		: 1
	)

	if (model == ColorModel.hsla) {
		const opacity = get_opacity()
		const hsl = hex_to_hsl(string_substring(color, 0, 7) as HEXColor)
		return array_join([
			'hsl',
			opacity < 1 || keep_opacity? 'a' : '',
			'(',
			math_round(hsl.h * 360),
			', ',
			math_round(hsl.s * 100),
			'%, ',
			math_round(hsl.l * 100),
			'%',
			opacity < 1 || keep_opacity? ', ' + number_parse(number_tofixed(opacity, 2)) : '',
			')'
		], '')
	}
	else if (model == ColorModel.rgba) {
		const opacity = get_opacity()
		const rgb = hex_to_rgb(string_substring(color, 0, 7) as HEXColor)
		return array_join([
			'rgb',
			opacity < 1 || keep_opacity? 'a' : '',
			'(',
			rgb.r,
			', ',
			rgb.g,
			', ',
			rgb.b,
			opacity < 1 || keep_opacity? ', ' + number_parse(number_tofixed(opacity, 2)) : '',
			')'
		], '')
	}
	return color
}

export function gradient_to_css_text(gradient: Gradient, model: ColorModel = ColorModel.hex, format: boolean = false): string {
	const repeat = gradient.repeat ? 'repeating-' : ''
	const type = gradient.type
	let color_interpolation_method = ''
	if (gradient.color_interpolation_method != RectangularColorSpace.auto) {
		color_interpolation_method = ` in ${gradient.color_interpolation_method}`

		const is_polar_colorspace = array_includes([
			PolarColorSpace.hsl, PolarColorSpace.hwb,
			PolarColorSpace.lch, PolarColorSpace.oklch
		], gradient.color_interpolation_method as PolarColorSpace)

		if (is_polar_colorspace && gradient.hue_interpolation_method != HueInterpolationMethod.auto) {
			color_interpolation_method += ` ${gradient.hue_interpolation_method} hue`
		}
	}

	let text = ''
	if (type == GradientType.linear) {
		const angle = gradient.angle
		const color_stop_list = array_join(
			array_map(
				array_sort([...gradient.color_stop_list], (a, b) => a.size - b.size),
				v => `${convert_color_by_color_model(v.color, model, false)} ${v.size}%`
			),
			format? ',\n    ' : ', '
		)

		text = `${repeat}linear-gradient(${format? '\n    ' : ''}${angle}deg${color_interpolation_method},${format? '\n    ' : ' '}${color_stop_list}${format? '\n' : ''})`
	}
	else if (type == GradientType.radial) {
		const shape = gradient.shape
		const position = `${gradient.position_x}% ${gradient.position_y}%`
		const size = shape == RadialGradientShape.circle ? `${gradient.size_length}px` : `${gradient.size_width}% ${gradient.size_height}%`
		const color_stop_list = array_join(
			array_map(
				array_sort([...gradient.color_stop_list], (a, b) => a.size - b.size),
				v => `${convert_color_by_color_model(v.color, model, false)} ${v.size}%`
			),
			format? ',\n    ' : ', '
		)

		text = `${repeat}radial-gradient(${format? '\n    ' : ''}${shape} ${size} at ${position}${color_interpolation_method},${format? '\n    ' : ' '}${color_stop_list}${format? '\n' : ''})`
	}
	else if (type == GradientType.conic) {
		const angle = gradient.angle
		const position = `${gradient.position_x}% ${gradient.position_y}%`
		const color_stop_list = array_join(
			array_map(
				array_sort([...gradient.color_stop_list], (a, b) => a.size - b.size),
				v => `${convert_color_by_color_model(v.color, model, false)} ${math_round(v.size * 360 / 100)}deg`
			),
			format? ',\n    ' : ', '
		)

		text = `${repeat}conic-gradient(${format? '\n    ' : ''}from ${angle}deg at ${position}${color_interpolation_method},${format? '\n    ' : ' '}${color_stop_list}${format? '\n' : ''})`
	}

	return text
}