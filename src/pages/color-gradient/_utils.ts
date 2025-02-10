import { RectangularColorSpace, PolarColorSpace, HueInterpolationMethod, GradientType, RadialGradientShape, ColorSpace } from "./_enums"
import type { Gradient } from "./_type"
import type { HEXColor } from "@/types/color"
import { mathRound } from "@/utils/math"
import { colorHexToHsl, colorHexToRgb } from "@/utils/color"
import { stringLength, stringPadStart, stringSubstring } from "@/utils/string"
import { numberParse, numberToFixed } from "@/utils/number"
import { arrayIncludes, arrayJoin, arrayMap, arraySort } from "@/utils/array"

export function convertColorByColorSpace(color: HEXColor, space: ColorSpace, keepOpacity: boolean = false): string {
	const opacity = (stringLength(color) > 7
		? numberParse(stringPadStart(stringSubstring(color, 7), 2, '0'), true, 16) / 255
		: 1
	)
	switch (space) {
	case ColorSpace.hex: break
	case ColorSpace.rgba:
		const rgb = colorHexToRgb(stringSubstring(color, 0, 7) as HEXColor)
		return arrayJoin([
			'rgb',
			opacity < 1 || keepOpacity? 'a' : '',
			'(',
			mathRound(rgb.r * 0xff), ', ',
			mathRound(rgb.g * 0xff), ', ',
			mathRound(rgb.b * 0xff),
			opacity < 1 || keepOpacity? ', ' + numberParse(numberToFixed(opacity, 2)) : '',
			')'
		], '')
	case ColorSpace.hsla:
		const hsl = colorHexToHsl(stringSubstring(color, 0, 7) as HEXColor)
		return arrayJoin([
			'hsl',
			opacity < 1 || keepOpacity? 'a' : '',
			'(',
			mathRound(hsl.h * 360),
			', ',
			mathRound(hsl.s * 100),
			'%, ',
			mathRound(hsl.l * 100),
			'%',
			opacity < 1 || keepOpacity? ', ' + numberParse(numberToFixed(opacity, 2)) : '',
			')'
		], '')
	}
	return color
}

export function gradientToCSSText(
	gradient: Gradient,
	model: ColorSpace = ColorSpace.hex,
	format: boolean = false
): string {
	const repeat = gradient.repeat ? 'repeating-' : ''
	const type = gradient.type
	let colorInterpolationMethod = ''
	if (gradient.colorInterpolationMethod != RectangularColorSpace.auto) {
		colorInterpolationMethod = ` in ${gradient.colorInterpolationMethod}`

		const is_polar_colorspace = arrayIncludes([
			PolarColorSpace.hsl, PolarColorSpace.hwb,
			PolarColorSpace.lch, PolarColorSpace.oklch
		], gradient.colorInterpolationMethod as PolarColorSpace)

		if (is_polar_colorspace && gradient.hueInterpolationMethod != HueInterpolationMethod.auto) {
			colorInterpolationMethod += ` ${gradient.hueInterpolationMethod} hue`
		}
	}

	let text = ''
	switch (type) {
	case GradientType.linear: {
		const angle = gradient.angle
		const colorStopList = arrayJoin(
			arrayMap(
				arraySort([...gradient.colorStopList], (a, b) => a.size - b.size),
				v => `${convertColorByColorSpace(v.color, model, false)} ${v.size}%`
			),
			format? ',\n    ' : ', '
		)

		text = `${repeat}linear-gradient(${format? '\n    ' : ''}${angle}deg${colorInterpolationMethod},${format? '\n    ' : ' '}${colorStopList}${format? '\n' : ''})`
		break
	}
	case GradientType.radial: {
		const shape = gradient.shape
		const position = `${gradient.positionX}% ${gradient.positionY}%`
		const size = shape == RadialGradientShape.circle ? `${gradient.sizeLength}px` : `${gradient.sizeWidth}% ${gradient.sizeHeight}%`
		const colorStopList = arrayJoin(
			arrayMap(
				arraySort([...gradient.colorStopList], (a, b) => a.size - b.size),
				v => `${convertColorByColorSpace(v.color, model, false)} ${v.size}%`
			),
			format? ',\n    ' : ', '
		)

		text = `${repeat}radial-gradient(${format? '\n    ' : ''}${shape} ${size} at ${position}${colorInterpolationMethod},${format? '\n    ' : ' '}${colorStopList}${format? '\n' : ''})`
		break
	}
	case GradientType.conic: {
		const angle = gradient.angle
		const position = `${gradient.positionX}% ${gradient.positionY}%`
		const colorStopList = arrayJoin(
			arrayMap(
				arraySort([...gradient.colorStopList], (a, b) => a.size - b.size),
				v => `${convertColorByColorSpace(v.color, model, false)} ${mathRound(v.size * 360 / 100)}deg`
			),
			format? ',\n    ' : ', '
		)

		text = `${repeat}conic-gradient(${format? '\n    ' : ''}from ${angle}deg at ${position}${colorInterpolationMethod},${format? '\n    ' : ' '}${colorStopList}${format? '\n' : ''})`
		break
	}}

	return text
}