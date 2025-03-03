import { RectangularColorSpace, PolarColorSpace, HueInterpolationMethod, GradientType, RadialGradientShape, ColorSpace } from "./_enums"
import type { Gradient } from "./_type"
import type { HEXColor } from "@/types/color"
import { colorHexToHsl, colorHexToRgb } from "@/utils/color"

export function convertColorByColorSpace(color: HEXColor, space: ColorSpace, keepOpacity: boolean = false): string {
	const opacity = (color.length > 7
		? Number.parseInt(color.substring(7).padStart(2, '0'), 16) / 0xff
		: 1
	)
	switch (space) {
	case ColorSpace.hex: break
	case ColorSpace.rgba:
		const rgb = colorHexToRgb(color.substring(0, 7) as HEXColor)
		return [
			'rgb',
			opacity < 1 || keepOpacity? 'a' : '',
			'(',
			Math.round(rgb.r * 0xff), ', ',
			Math.round(rgb.g * 0xff), ', ',
			Math.round(rgb.b * 0xff),
			opacity < 1 || keepOpacity? ', ' + Number.parseFloat(opacity.toFixed(2)) : '',
			')'
		].join('')
	case ColorSpace.hsla:
		const hsl = colorHexToHsl(color.substring(0, 7) as HEXColor)
		return [
			'hsl',
			opacity < 1 || keepOpacity? 'a' : '',
			'(',
			Math.round(hsl.h * 360),
			', ',
			Math.round(hsl.s * 100),
			'%, ',
			Math.round(hsl.l * 100),
			'%',
			opacity < 1 || keepOpacity? ', ' + Number.parseFloat(opacity.toFixed(2)) : '',
			')'
		].join('')
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

		const isPolarColorSpace = [
			PolarColorSpace.hsl, PolarColorSpace.hwb,
			PolarColorSpace.lch, PolarColorSpace.oklch
		].includes(gradient.colorInterpolationMethod as PolarColorSpace)
		if (isPolarColorSpace && gradient.hueInterpolationMethod != HueInterpolationMethod.auto) {
			colorInterpolationMethod += ` ${gradient.hueInterpolationMethod} hue`
		}
	}

	let text = ''
	switch (type) {
	case GradientType.linear: {
		const angle = gradient.angle
		const colorStopList = [...gradient.colorStopList]
			.sort((a, b) => a.size - b.size)
			.map(v => `${convertColorByColorSpace(v.color, model, false)} ${v.size}%`)
			.join(format? ',\n    ' : ', ')

		text = `${repeat}linear-gradient(${format? '\n    ' : ''}${angle}deg${colorInterpolationMethod},${format? '\n    ' : ' '}${colorStopList}${format? '\n' : ''})`
		break
	}
	case GradientType.radial: {
		const shape = gradient.shape
		const position = `${gradient.positionX}% ${gradient.positionY}%`
		const size = shape == RadialGradientShape.circle ? `${gradient.sizeLength}px` : `${gradient.sizeWidth}% ${gradient.sizeHeight}%`
		const colorStopList = [...gradient.colorStopList]
			.sort((a, b) => a.size - b.size)
			.map(v => `${convertColorByColorSpace(v.color, model, false)} ${v.size}%`)
			.join(format? ',\n    ' : ', ')

		text = `${repeat}radial-gradient(${format? '\n    ' : ''}${shape} ${size} at ${position}${colorInterpolationMethod},${format? '\n    ' : ' '}${colorStopList}${format? '\n' : ''})`
		break
	}
	case GradientType.conic: {
		const angle = gradient.angle
		const position = `${gradient.positionX}% ${gradient.positionY}%`
		const colorStopList = [...gradient.colorStopList]
			.sort((a, b) => a.size - b.size)
			.map(v => `${convertColorByColorSpace(v.color, model, false)} ${Math.round(v.size * 360 / 100)}deg`)
			.join(format? ',\n    ' : ', ')

		text = `${repeat}conic-gradient(${format? '\n    ' : ''}from ${angle}deg at ${position}${colorInterpolationMethod},${format? '\n    ' : ' '}${colorStopList}${format? '\n' : ''})`
		break
	}}

	return text
}