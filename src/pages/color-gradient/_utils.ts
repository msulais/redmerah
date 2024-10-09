import { _repeat, _type, _colorInterpolationMethod, _auto, _hsl, _hwb, _lch, _oklch, _includes, _hueInterpolationMethod, _linear, _angle, _colorStopList, _sort, _size, _map, _color, _join, _radial, _shape, _positionX, _positionY, _circle, _sizeLength, _sizeWidth, _sizeHeight, _conic, _rgba, _hsla, _length, _substring, _padStart, _hex, _toFixed } from "@/constants/string"
import { RectangularColorSpace, PolarColorSpace, HueInterpolationMethod, GradientType, RadialGradientShape, ColorModel } from "./_enums"
import type { Gradient } from "./_type"
import type { HEXColor } from "@/types/color"
import { mathRound, numberParse } from "@/utils/math"
import { HEX_to_HSL, HEX_to_RGB } from "@/utils/color"

export function convertColorByColorModel(color: HEXColor, colorModel: ColorModel, keepOpacity: boolean = false): string {
	const getOpacity = (): number => (color[_length] > 7
		? numberParse(color[_substring](7)[_padStart](2, '0'), true, 16) / 255
		: 1
	)

	if (colorModel == ColorModel[_hsla]) {
		const opacity = getOpacity()
		const hsl = HEX_to_HSL(color[_substring](0, 7) as HEXColor)
		return [
			'hsl',
			opacity < 1 || keepOpacity? 'a' : '',
			'(',
			mathRound(hsl.h * 360),
			', ',
			mathRound(hsl.s * 100),
			'%, ',
			mathRound(hsl.l * 100),
			'%',
			opacity < 1 || keepOpacity? ', ' + numberParse(opacity[_toFixed](2)) : '',
			')'
		][_join]('')
	}
	else if (colorModel == ColorModel[_rgba]) {
		const opacity = getOpacity()
		const rgb = HEX_to_RGB(color[_substring](0, 7) as HEXColor)
		return [
			'rgb',
			opacity < 1 || keepOpacity? 'a' : '',
			'(',
			rgb.r,
			', ',
			rgb.g,
			', ',
			rgb.b,
			opacity < 1 || keepOpacity? ', ' + numberParse(opacity[_toFixed](2)) : '',
			')'
		][_join]('')
	}
	return color
}

export function gradientToCSSText(gradient: Gradient, colorModel: ColorModel = ColorModel[_hex], format: boolean = false): string {
	const repeat = gradient[_repeat] ? 'repeating-' : ''
	const type = gradient[_type]
	let colorInterpolationMethod = ''
	if (gradient[_colorInterpolationMethod] != RectangularColorSpace[_auto]) {
		colorInterpolationMethod = ` in ${gradient[_colorInterpolationMethod]}`

		const isPolarColorSpace = [
			PolarColorSpace[_hsl], PolarColorSpace[_hwb],
			PolarColorSpace[_lch], PolarColorSpace[_oklch]
		][_includes](gradient[_colorInterpolationMethod] as PolarColorSpace)

		if (isPolarColorSpace && gradient[_hueInterpolationMethod] != HueInterpolationMethod[_auto]) {
			colorInterpolationMethod += ` ${gradient[_hueInterpolationMethod]} hue`
		}
	}

	let text = ''
	if (type == GradientType[_linear]) {
		const angle = gradient[_angle]
		const colorStopList = [...gradient[_colorStopList]]
			[_sort]((a, b) => a[_size] - b[_size])
			[_map](v => `${convertColorByColorModel(v[_color], colorModel, false)} ${v[_size]}%`)
			[_join](format? ',\n    ' : ', ')

		text = `${repeat}linear-gradient(${format? '\n    ' : ''}${angle}deg${colorInterpolationMethod},${format? '\n    ' : ' '}${colorStopList}${format? '\n' : ''})`
	}
	else if (type == GradientType[_radial]) {
		const shape = gradient[_shape]
		const position = `${gradient[_positionX]}% ${gradient[_positionY]}%`
		const size = shape == RadialGradientShape[_circle] ? `${gradient[_sizeLength]}px` : `${gradient[_sizeWidth]}% ${gradient[_sizeHeight]}%`
		const colorStopList = [...gradient[_colorStopList]]
			[_sort]((a, b) => a[_size] - b[_size])
			[_map](v => `${convertColorByColorModel(v[_color], colorModel, false)} ${v[_size]}%`)
			[_join](format? ',\n    ' : ', ')

		text = `${repeat}radial-gradient(${format? '\n    ' : ''}${shape} ${size} at ${position}${colorInterpolationMethod},${format? '\n    ' : ' '}${colorStopList}${format? '\n' : ''})`
	}
	else if (type == GradientType[_conic]) {
		const angle = gradient[_angle]
		const position = `${gradient[_positionX]}% ${gradient[_positionY]}%`
		const colorStopList = [...gradient[_colorStopList]]
			[_sort]((a, b) => a[_size] - b[_size])
			[_map](v => `${convertColorByColorModel(v[_color], colorModel, false)} ${mathRound(v[_size] * 360 / 100)}deg`)
			[_join](format? ',\n    ' : ', ')

		text = `${repeat}conic-gradient(${format? '\n    ' : ''}from ${angle}deg at ${position}${colorInterpolationMethod},${format? '\n    ' : ' '}${colorStopList}${format? '\n' : ''})`
	}

	return text
}