import * as Ids from '../shared/ids.enum.js'
import * as RandomizerColors from '../shared/randomizer-colors.js'
import * as AnimationEasing from '@/enums/animation-easing.enum.js'
import * as BrIcon from '@/web-components/components/br-icon.js'
import * as BrTheme from '@/web-components/components/br-theme.js'
import * as Settings from '../core/settings.js'
import * as Constant from '../shared/constant.enum.js'
import { signal } from '@/utils/signal'
import { $, $$ } from '../core/dom-utils.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { Math_clamp } from '@/utils/math'
import { safeNumber } from '@/utils/number'
import { isValidEnumValue } from '@/utils/object'
import { saveStorageItem } from '../core/database'
import { updateElementList } from '@/utils/element.js'
import { colorContrastPercentage, hexToHsl, hexToRgb, hslToHex, rgbToHex, rgbToHsl } from '@/utils/color.js'
import type { HEXColor } from '@/types/color.js'

export const sg_colorSpace   = signal(Constant.DEFAULT_COLORS_SPACE)
export const sg_count        = signal(Constant.DEFAULT_COLORS_COUNT)
export const sg_hexMax       = signal(Constant.DEFAULT_COLORS_HEX_MAX)
export const sg_hexMin       = signal(Constant.DEFAULT_COLORS_HEX_MIN)
export const sg_hslHMax      = signal(Constant.DEFAULT_COLORS_HSL_H_MAX)
export const sg_hslHMin      = signal(Constant.DEFAULT_COLORS_HSL_H_MIN)
export const sg_hslSMax      = signal(Constant.DEFAULT_COLORS_HSL_S_MAX)
export const sg_hslSMin      = signal(Constant.DEFAULT_COLORS_HSL_S_MIN)
export const sg_hslLMax      = signal(Constant.DEFAULT_COLORS_HSL_L_MAX)
export const sg_hslLMin      = signal(Constant.DEFAULT_COLORS_HSL_L_MIN)
export const sg_rgbRMax      = signal(Constant.DEFAULT_COLORS_RGB_R_MAX)
export const sg_rgbRMin      = signal(Constant.DEFAULT_COLORS_RGB_R_MIN)
export const sg_rgbGMax      = signal(Constant.DEFAULT_COLORS_RGB_G_MAX)
export const sg_rgbGMin      = signal(Constant.DEFAULT_COLORS_RGB_G_MIN)
export const sg_rgbBMax      = signal(Constant.DEFAULT_COLORS_RGB_B_MAX)
export const sg_rgbBMin      = signal(Constant.DEFAULT_COLORS_RGB_B_MIN)
export const sg_output       = signal(Constant.DEFAULT_COLORS_OUTPUT)
export const sg_isGenerating = signal(false)

const _ref_count         = $(Ids.PageColorsCount) as HTMLInputElement
const _ref_space         = $(Ids.PageColorsSpace) as HTMLSelectElement
const _ref_hex           = $(Ids.PageColorsHex) as HTMLDivElement
const _ref_hexMin        = $(Ids.PageColorsHexMin) as HTMLInputElement
const _ref_hexMax        = $(Ids.PageColorsHexMax) as HTMLInputElement
const _ref_rgb           = $(Ids.PageColorsRgb) as HTMLDivElement
const _ref_redMin        = $(Ids.PageColorsRgbRedMin) as HTMLInputElement
const _ref_redMax        = $(Ids.PageColorsRgbRedMax) as HTMLInputElement
const _ref_greenMin      = $(Ids.PageColorsRgbGreenMin) as HTMLInputElement
const _ref_greenMax      = $(Ids.PageColorsRgbGreenMax) as HTMLInputElement
const _ref_blueMin       = $(Ids.PageColorsRgbBlueMin) as HTMLInputElement
const _ref_blueMax       = $(Ids.PageColorsRgbBlueMax) as HTMLInputElement
const _ref_hsl           = $(Ids.PageColorsHsl) as HTMLDivElement
const _ref_hueMin        = $(Ids.PageColorsHslHueMin) as HTMLInputElement
const _ref_hueMax        = $(Ids.PageColorsHslHueMax) as HTMLInputElement
const _ref_saturationMin = $(Ids.PageColorsHslSaturationMin) as HTMLInputElement
const _ref_saturationMax = $(Ids.PageColorsHslSaturationMax) as HTMLInputElement
const _ref_lightMin      = $(Ids.PageColorsHslLightnessMin) as HTMLInputElement
const _ref_lightMax      = $(Ids.PageColorsHslLightnessMax) as HTMLInputElement
const _ref_output        = $(Ids.PageColorsOutput) as HTMLUListElement
const _ref_generate      = $(Ids.PageColorsGenerate) as HTMLButtonElement
const _ref_generateIcon  = $$(BrIcon.TAGNAME, _ref_generate) as BrIcon.BiruIconElement
const _ref_generateText  = $$('span', _ref_generate) as HTMLSpanElement
const _ref_theme         = $$(BrTheme.TAGNAME) as BrTheme.BiruThemeElement
const _ref_copyAll       = $(Ids.PageColorsCopyAll) as HTMLButtonElement
const _ref_copyHex       = $(Ids.PageColorsCopyHex) as HTMLButtonElement
const _ref_copyRgb       = $(Ids.PageColorsCopyRgb) as HTMLButtonElement
const _ref_copyHsl       = $(Ids.PageColorsCopyHsl) as HTMLButtonElement

let _time_generate: ReturnType<typeof setInterval> | undefined

function _updateOutput(): void {
	const count = sg_count()
	const colors: HEXColor[] = []
	const random = (min: number, max: number): number => {
		const range = Math.max(max, min) - Math.min(min, max) + 1
		const value = Math.min(min, max) + Math.floor(Math.random() * range)
		return Math.round(value)
	}

	switch (sg_colorSpace()) {
	case RandomizerColors.ColorSpaces.RGB: {
		for (let i = 0; i < count; i++) {
			const r = random(sg_rgbRMin(), sg_rgbRMax()) / 0xff
			const g = random(sg_rgbGMin(), sg_rgbGMax()) / 0xff
			const b = random(sg_rgbBMin(), sg_rgbBMax()) / 0xff
			colors.push(rgbToHex({r, g, b}).toUpperCase() as HEXColor)
		}
		break
	}
	case RandomizerColors.ColorSpaces.HSL: {
		for (let i = 0; i < count; i++) {
			const h = random(sg_hslHMin(), sg_hslHMax()) / 360
			const s = random(sg_hslSMin(), sg_hslSMax()) / 100
			const l = random(sg_hslLMin(), sg_hslLMax()) / 100
			colors.push(hslToHex({h: h, s: s, l: l}).toUpperCase() as HEXColor)
		}
		break
	}
	case RandomizerColors.ColorSpaces.HEX: {
		for (let i = 0; i < count; i++) {
			const value = random(sg_hexMin(), sg_hexMax())
			colors.push(('#' + value.toString(16).padStart(6, '0')).toUpperCase() as HEXColor)
		}
		break
	}}

	sg_output.set(colors)
}

function _generate(): void {
	_updateOutput()
	const duration = 3000
	const step = Settings.sg_instantResult()? 0 : 250
	let i = 0
	_time_generate = setInterval(() => {
		if (Settings.sg_instantResult() || !sg_isGenerating()) {
			sg_isGenerating.set(false)
			return
		}

		_updateOutput()
		if (i >= duration / step) {
			sg_isGenerating.set(false)
			return
		}

		++i
	}, step)
}

function _initSubscriber(): void {
	sg_isGenerating.subscribe(v => {
		const fn_isAnimationAllowed = () => _ref_theme.biru.transitionDuration > 0
		const width = _ref_generate.getBoundingClientRect().width

		clearInterval(_time_generate)
		_ref_generateIcon.getAnimations().forEach(v => v.cancel())
		_ref_generateText.textContent = v? 'Generating' : 'Generate'

		// animation for button, icon, and text
		if (fn_isAnimationAllowed()) {
			const opt = {duration: 250, easing: AnimationEasing.Spring}
			_ref_generateText.animate({
				opacity: [0, 1],
				scale: [0, 1],
			}, opt)
			_ref_generateIcon.animate({
				opacity: [0, 1],
				scale: [0, 1],
			}, opt)
			_ref_generate.animate({
				width: [width + 'px', _ref_generate.getBoundingClientRect().width + 'px']
			}, opt)
		}

		// !!important!! to avoid recursion
		if (!v) {
			return
		}

		// animation for icon rotation
		if (fn_isAnimationAllowed()) {
			_ref_generateIcon.animate({
				rotate: '180deg'
			}, {
				duration: 500,
				iterations: Infinity,
				easing: AnimationEasing.Spring
			})
		}

		_generate()
	})

	sg_colorSpace.subscribe(v => {
		_ref_space.value = v
		_ref_rgb.hidden = v !== RandomizerColors.ColorSpaces.RGB
		_ref_hsl.hidden = v !== RandomizerColors.ColorSpaces.HSL
		_ref_hex.hidden = v !== RandomizerColors.ColorSpaces.HEX
		saveStorageItem('page-colors-color-space', v)
	})

	sg_count.subscribe(v => {
		if (!_ref_count.matches(':focus')) {
			_ref_count.valueAsNumber = v
		}

		saveStorageItem('page-colors-count', v)
	})

	sg_hexMax.subscribe(v => {
		if (!_ref_hexMax.matches(':focus')) {
			_ref_hexMax.valueAsNumber = v
		}

		saveStorageItem('page-colors-hex-max', v)
	})

	sg_hexMin.subscribe(v => {
		if (!_ref_hexMin.matches(':focus')) {
			_ref_hexMin.valueAsNumber = v
		}

		saveStorageItem('page-colors-hex-min', v)
	})

	sg_hslHMax.subscribe(v => {
		if (!_ref_hueMax.matches(':focus')) {
			_ref_hueMax.valueAsNumber = v
		}

		saveStorageItem('page-colors-hsl-h-max', v)
	})

	sg_hslHMin.subscribe(v => {
		if (!_ref_hueMin.matches(':focus')) {
			_ref_hueMin.valueAsNumber = v
		}

		saveStorageItem('page-colors-hsl-h-min', v)
	})

	sg_hslSMax.subscribe(v => {
		if (!_ref_saturationMax.matches(':focus')) {
			_ref_saturationMax.valueAsNumber = v
		}

		saveStorageItem('page-colors-hsl-s-max', v)
	})

	sg_hslSMin.subscribe(v => {
		if (!_ref_saturationMin.matches(':focus')) {
			_ref_saturationMin.valueAsNumber = v
		}

		saveStorageItem('page-colors-hsl-s-min', v)
	})

	sg_hslLMax.subscribe(v => {
		if (!_ref_hueMax.matches(':focus')) {
			_ref_hueMax.valueAsNumber = v
		}

		saveStorageItem('page-colors-hsl-l-max', v)
	})

	sg_hslLMin.subscribe(v => {
		if (!_ref_hueMin.matches(':focus')) {
			_ref_hueMin.valueAsNumber = v
		}

		saveStorageItem('page-colors-hsl-l-min', v)
	})

	sg_rgbRMax.subscribe(v => {
		if (!_ref_redMax.matches(':focus')) {
			_ref_redMax.valueAsNumber = v
		}

		saveStorageItem('page-colors-rgb-r-max', v)
	})

	sg_rgbRMin.subscribe(v => {
		if (!_ref_redMin.matches(':focus')) {
			_ref_redMin.valueAsNumber = v
		}

		saveStorageItem('page-colors-rgb-r-min', v)
	})

	sg_rgbGMax.subscribe(v => {
		if (!_ref_greenMax.matches(':focus')) {
			_ref_greenMax.valueAsNumber = v
		}

		saveStorageItem('page-colors-rgb-g-max', v)
	})

	sg_rgbGMin.subscribe(v => {
		if (!_ref_greenMin.matches(':focus')) {
			_ref_greenMin.valueAsNumber = v
		}

		saveStorageItem('page-colors-rgb-g-min', v)
	})

	sg_rgbBMax.subscribe(v => {
		if (!_ref_blueMax.matches(':focus')) {
			_ref_blueMax.valueAsNumber = v
		}

		saveStorageItem('page-colors-rgb-b-max', v)
	})

	sg_rgbBMin.subscribe(v => {
		if (!_ref_blueMin.matches(':focus')) {
			_ref_blueMin.valueAsNumber = v
		}

		saveStorageItem('page-colors-rgb-b-min', v)
	})

	sg_output.subscribe(v => {
		saveStorageItem('page-colors-output', v)
		updateElementList(_ref_output, v,
			() => document.createElement('li'),
			(ref, hex) => {
				const rgb = hexToRgb(hex)
				const hsl = rgbToHsl(rgb)
				const r = (v: number) => Math.round(v)
				const color = colorContrastPercentage(rgb, {r: 0, g: 0, b: 0}) > 50? '#000' : '#fff'
				ref.style.setProperty('background-color', hex)
				ref.style.setProperty('color', color)
				ref.replaceChildren(
					hex,
					document.createElement('br'),
					`rgb(${r(rgb.r * 0xff)}, ${r(rgb.g * 0xff)}, ${r(rgb.b * 0xff)})`,
					document.createElement('br'),
					`hsl(${r(hsl.h * 360)}, ${r(hsl.s * 100)}%, ${r(hsl.l * 100)}%)`
				)
			}
		)
	})
}

function _initEvents(): void {
	delegateEvent(_ref_generate, 'click', () => {
		sg_isGenerating.set(v => !v)
	})

	delegateEvent(_ref_count, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_count.valueAsNumber), 1, Number.MAX_VALUE)
		sg_count.set(value)
	})

	delegateEvent(_ref_count, 'blur', () => {
		_ref_count.valueAsNumber = sg_count()
	})

	delegateEvent(_ref_space, 'change', () => {
		const value = _ref_space.value as RandomizerColors.ColorSpaces
		if (!isValidEnumValue(value, RandomizerColors.ColorSpaces)) {
			return
		}

		sg_colorSpace.set(value)
	})

	delegateEvent(_ref_hexMin, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_hexMin.valueAsNumber), 0, sg_hexMax())
		sg_hexMin.set(value)
	})

	delegateEvent(_ref_hexMin, 'blur', () => {
		_ref_hexMin.valueAsNumber = sg_hexMin()
	})

	delegateEvent(_ref_hexMax, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_hexMax.valueAsNumber), sg_hexMin(), 0xffffff)
		sg_hexMax.set(value)
	})

	delegateEvent(_ref_hexMax, 'blur', () => {
		_ref_hexMax.valueAsNumber = sg_hexMax()
	})

	delegateEvent(_ref_redMin, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_redMin.valueAsNumber), 0, sg_rgbRMax())
		sg_rgbRMin.set(value)
	})

	delegateEvent(_ref_redMin, 'blur', () => {
		_ref_redMin.valueAsNumber = sg_rgbRMin()
	})

	delegateEvent(_ref_redMax, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_redMax.valueAsNumber), sg_rgbRMin(), 0xff)
		sg_rgbRMax.set(value)
	})

	delegateEvent(_ref_redMax, 'blur', () => {
		_ref_redMax.valueAsNumber = sg_rgbRMax()
	})

	delegateEvent(_ref_greenMin, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_greenMin.valueAsNumber), 0, sg_rgbGMax())
		sg_rgbGMin.set(value)
	})

	delegateEvent(_ref_greenMin, 'blur', () => {
		_ref_greenMin.valueAsNumber = sg_rgbGMin()
	})

	delegateEvent(_ref_greenMax, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_greenMax.valueAsNumber), sg_rgbGMin(), 0xff)
		sg_rgbGMax.set(value)
	})

	delegateEvent(_ref_greenMax, 'blur', () => {
		_ref_greenMax.valueAsNumber = sg_rgbGMax()
	})

	delegateEvent(_ref_blueMin, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_blueMin.valueAsNumber), 0, sg_rgbBMax())
		sg_rgbBMin.set(value)
	})

	delegateEvent(_ref_blueMin, 'blur', () => {
		_ref_blueMin.valueAsNumber = sg_rgbBMin()
	})

	delegateEvent(_ref_blueMax, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_blueMax.valueAsNumber), sg_rgbBMin(), 0xff)
		sg_rgbBMax.set(value)
	})

	delegateEvent(_ref_blueMax, 'blur', () => {
		_ref_blueMax.valueAsNumber = sg_rgbBMax()
	})

	delegateEvent(_ref_hueMin, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_hueMin.valueAsNumber), 0, sg_hslHMax())
		sg_hslHMin.set(value)
	})

	delegateEvent(_ref_hueMin, 'blur', () => {
		_ref_hueMin.valueAsNumber = sg_hslHMin()
	})

	delegateEvent(_ref_hueMax, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_hueMax.valueAsNumber), sg_hslHMin(), 360)
		sg_hslHMax.set(value)
	})

	delegateEvent(_ref_hueMax, 'blur', () => {
		_ref_hueMax.valueAsNumber = sg_hslHMax()
	})

	delegateEvent(_ref_saturationMin, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_saturationMin.valueAsNumber), 0, sg_hslSMax())
		sg_hslSMin.set(value)
	})

	delegateEvent(_ref_saturationMin, 'blur', () => {
		_ref_saturationMin.valueAsNumber = sg_hslSMin()
	})

	delegateEvent(_ref_saturationMax, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_saturationMax.valueAsNumber), sg_hslSMin(), 100)
		sg_hslSMax.set(value)
	})

	delegateEvent(_ref_saturationMax, 'blur', () => {
		_ref_saturationMax.valueAsNumber = sg_hslSMax()
	})

	delegateEvent(_ref_lightMin, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_lightMin.valueAsNumber), 0, sg_hslLMax())
		sg_hslLMin.set(value)
	})

	delegateEvent(_ref_lightMin, 'blur', () => {
		_ref_lightMin.valueAsNumber = sg_hslLMin()
	})

	delegateEvent(_ref_lightMax, 'input', () => {
		const value = Math_clamp(safeNumber(_ref_lightMax.valueAsNumber), sg_hslLMin(), 100)
		sg_hslLMax.set(value)
	})

	delegateEvent(_ref_lightMax, 'blur', () => {
		_ref_lightMax.valueAsNumber = sg_hslLMax()
	})

	delegateEvent(_ref_copyAll, 'click', () => {
		navigator.clipboard.writeText(sg_output().map(hex => {
			const rgb = hexToRgb(hex)
			const hsl = rgbToHsl(rgb)
			const r = (v: number) => Math.round(v)
			return [
				hex,
				`rgb(${r(rgb.r * 0xff)}, ${r(rgb.g * 0xff)}, ${r(rgb.b * 0xff)})`,
				`hsl(${r(hsl.h * 360)}, ${r(hsl.s * 100)}%, ${r(hsl.l * 100)}%)`
			].join('\t')
		}).join('\n'))
	})

	delegateEvent(_ref_copyHex, 'click', () => {
		navigator.clipboard.writeText(sg_output().join('\n'))
	})

	delegateEvent(_ref_copyRgb, 'click', () => {
		navigator.clipboard.writeText(sg_output().map(v => {
			const rgb = hexToRgb(v)
			return `rgb(${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)})`
		}).join('\n'))
	})

	delegateEvent(_ref_copyHsl, 'click', () => {
		navigator.clipboard.writeText(sg_output().map(v => {
			const hsl = hexToHsl(v)
			return `hsl(${Math.round(hsl.h * 360)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`
		}).join('\n'))
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}