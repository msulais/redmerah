import type { HEXColor } from "@/types/color"
import { hexToHsl, hexToRgb } from "@/utils/color"
import { ColorSpace, GradientType, HueInterpolationMethod, PolarColorSpace, RadialGradientShape, RectangularColorSpace } from "../_shared/_enums"
import type { GradientItem } from "./_gradients"

export function convertColorByColorSpace(
	color: HEXColor,
	space: ColorSpace,
	keepOpacity: boolean = false
): string {
	const opacity = (color.length > 7
		? Number.parseInt(color.substring(7).padStart(2, '0'), 16) / 0xff
		: 1
	)
	switch (space) {
	case ColorSpace.hex: break
	case ColorSpace.rgba:
		const rgb = hexToRgb(color.substring(0, 7) as HEXColor)
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
		const hsl = hexToHsl(color.substring(0, 7) as HEXColor)
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
	gradient: GradientItem,
	model: ColorSpace = ColorSpace.hex,
	format: boolean = false
): string {
	const repeat = gradient.repeat ? 'repeating-' : ''
	const type = gradient.type
	let colorInterpolationMethod = ''
	if (gradient.colorMethod !== RectangularColorSpace.auto) {
		colorInterpolationMethod = ` in ${gradient.colorMethod}`

		const isPolarColorSpace = [
			PolarColorSpace.hsl, PolarColorSpace.hwb,
			PolarColorSpace.lch, PolarColorSpace.oklch
		].includes(gradient.colorMethod as PolarColorSpace)
		if (isPolarColorSpace && gradient.hueMethod != HueInterpolationMethod.auto) {
			colorInterpolationMethod += ` ${gradient.hueMethod} hue`
		}
	}

	let text = ''
	switch (type) {
	case GradientType.linear: {
		const angle = gradient.angle
		const colorStopList = [...gradient.stops]
			.sort((a, b) => a.size - b.size)
			.map(v => `${convertColorByColorSpace(v.color, model, false)} ${v.size}%`)
			.join(format? ',\n\t' : ', ')

		text = `${repeat}linear-gradient(${format? '\n\t' : ''}${angle}deg${colorInterpolationMethod},${format? '\n\t' : ' '}${colorStopList}${format? '\n' : ''})`
		break
	}
	case GradientType.radial: {
		const shape = gradient.shape
		const position = `${gradient.positionX}% ${gradient.positionY}%`
		const size = shape == RadialGradientShape.circle ? `${gradient.size}px` : `${gradient.width}% ${gradient.height}%`
		const colorStopList = [...gradient.stops]
			.sort((a, b) => a.size - b.size)
			.map(v => `${convertColorByColorSpace(v.color, model, false)} ${v.size}%`)
			.join(format? ',\n\t' : ', ')

		text = `${repeat}radial-gradient(${format? '\n\t' : ''}${shape} ${size} at ${position}${colorInterpolationMethod},${format? '\n\t' : ' '}${colorStopList}${format? '\n' : ''})`
		break
	}
	case GradientType.conic: {
		const angle = gradient.angle
		const position = `${gradient.positionX}% ${gradient.positionY}%`
		const colorStopList = [...gradient.stops]
			.sort((a, b) => a.size - b.size)
			.map(v => `${convertColorByColorSpace(v.color, model, false)} ${v.size * 360 / 100}deg`)
			.join(format? ',\n\t' : ', ')

		text = `${repeat}conic-gradient(${format? '\n\t' : ''}from ${angle}deg at ${position}${colorInterpolationMethod},${format? '\n\t' : ' '}${colorStopList}${format? '\n' : ''})`
		break
	}}

	return text
}