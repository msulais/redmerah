import { ObservableStore } from "@/utils/store"
import { $, $$$ } from "../_core/_dom-utils"
import { ColorsRandomizerSpace } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { DEFAULT_COLORS_COUNT, DEFAULT_COLORS_HEX_MAX, DEFAULT_COLORS_HEX_MIN, DEFAULT_COLORS_HSL_H_MAX, DEFAULT_COLORS_HSL_H_MIN, DEFAULT_COLORS_HSL_L_MAX, DEFAULT_COLORS_HSL_L_MIN, DEFAULT_COLORS_HSL_S_MAX, DEFAULT_COLORS_HSL_S_MIN, DEFAULT_COLORS_OUTPUT, DEFAULT_COLORS_RGB_B_MAX, DEFAULT_COLORS_RGB_B_MIN, DEFAULT_COLORS_RGB_G_MAX, DEFAULT_COLORS_RGB_G_MIN, DEFAULT_COLORS_RGB_R_MAX, DEFAULT_COLORS_RGB_R_MIN, DEFAULT_COLORS_SPACE } from "../_shared/_constant"
import type { HEXColor } from "@/types/color"
import { Math_clamp } from "@/utils/math"
import { safeNumber } from "@/utils/number"
import type { ComboBoxElement } from "@/native-components/ComboBox"
import { isValidEnumValue } from "@/utils/object"
import { colorContrastRatio, hexToRgb, hslToHex, rgbToHex, rgbToHsl } from "@/utils/color"
import { saveStorageItem } from "../_core/_database"

export type ColorsStoreType = Readonly<{
	count: number
	colorSpace: ColorsRandomizerSpace
	hexMin: number
	hexMax: number
	rgbRMin: number
	rgbRMax: number
	rgbGMin: number
	rgbGMax: number
	rgbBMin: number
	rgbBMax: number
	hslHMin: number
	hslHMax: number
	hslSMin: number
	hslSMax: number
	hslLMin: number
	hslLMax: number
	output: HEXColor[]
}>

export const ColorsStore = new ObservableStore<ColorsStoreType>({
	colorSpace: DEFAULT_COLORS_SPACE,
	count: DEFAULT_COLORS_COUNT,
	hexMax: DEFAULT_COLORS_HEX_MAX,
	hexMin: DEFAULT_COLORS_HEX_MIN,
	hslHMax: DEFAULT_COLORS_HSL_H_MAX,
	hslHMin: DEFAULT_COLORS_HSL_H_MIN,
	hslSMax: DEFAULT_COLORS_HSL_S_MAX,
	hslSMin: DEFAULT_COLORS_HSL_S_MIN,
	hslLMax: DEFAULT_COLORS_HSL_L_MAX,
	hslLMin: DEFAULT_COLORS_HSL_L_MIN,
	rgbRMax: DEFAULT_COLORS_RGB_R_MAX,
	rgbRMin: DEFAULT_COLORS_RGB_R_MIN,
	rgbGMax: DEFAULT_COLORS_RGB_G_MAX,
	rgbGMin: DEFAULT_COLORS_RGB_G_MIN,
	rgbBMax: DEFAULT_COLORS_RGB_B_MAX,
	rgbBMin: DEFAULT_COLORS_RGB_B_MIN,
	output: DEFAULT_COLORS_OUTPUT
})

const _countRef = $(ElementIds.pgCol_count) as HTMLInputElement
const _spaceRef = $(ElementIds.pgCol_space) as ComboBoxElement
const _hexRef = $(ElementIds.pgCol_hex) as HTMLDivElement
const _hexMinRef = $(ElementIds.pgCol_hexMin) as HTMLInputElement
const _hexMaxRef = $(ElementIds.pgCol_hexMax) as HTMLInputElement
const _rgbRef = $(ElementIds.pgCol_rgb) as HTMLDivElement
const _redMinRef = $(ElementIds.pgCol_redMin) as HTMLInputElement
const _redMaxRef = $(ElementIds.pgCol_redMax) as HTMLInputElement
const _greenMinRef = $(ElementIds.pgCol_greenMin) as HTMLInputElement
const _greenMaxRef = $(ElementIds.pgCol_greenMax) as HTMLInputElement
const _blueMinRef = $(ElementIds.pgCol_blueMin) as HTMLInputElement
const _blueMaxRef = $(ElementIds.pgCol_blueMax) as HTMLInputElement
const _hslRef = $(ElementIds.pgCol_hsl) as HTMLDivElement
const _hueMinRef = $(ElementIds.pgCol_hueMin) as HTMLInputElement
const _hueMaxRef = $(ElementIds.pgCol_hueMax) as HTMLInputElement
const _saturationMinRef = $(ElementIds.pgCol_saturationMin) as HTMLInputElement
const _saturationMaxRef = $(ElementIds.pgCol_saturationMax) as HTMLInputElement
const _lightMinRef = $(ElementIds.pgCol_lightMin) as HTMLInputElement
const _lightMaxRef = $(ElementIds.pgCol_lightMax) as HTMLInputElement
const _outputRef = $(ElementIds.pgCol_output) as HTMLUListElement
let _timeStorageId: NodeJS.Timeout | number | undefined

export function updateOutput(): void {
	const store = ColorsStore.value
	const count = store.count
	const colors: HEXColor[] = []
	const random = (min: number, max: number): number => {
		const range = Math.max(max, min) - Math.min(min, max) + 1
		const value = Math.min(min, max) + Math.floor(Math.random() * range)
		return Math.round(value)
	}

	switch (store.colorSpace) {
	case ColorsRandomizerSpace.rgb: {
		for (let i = 0; i < count; i++) {
			const r = random(store.rgbRMin, store.rgbRMax) / 0xff
			const g = random(store.rgbGMin, store.rgbGMax) / 0xff
			const b = random(store.rgbBMin, store.rgbBMax) / 0xff
			colors.push(rgbToHex({r, g, b}).toUpperCase() as HEXColor)
		}
		break
	}
	case ColorsRandomizerSpace.hsl: {
		for (let i = 0; i < count; i++) {
			const h = random(store.hslHMin, store.hslHMax) / 360
			const s = random(store.hslSMin, store.hslSMax) / 100
			const l = random(store.hslLMin, store.hslLMax) / 100
			colors.push(hslToHex({h: h, s: s, l: l}).toUpperCase() as HEXColor)
		}
		break
	}
	case ColorsRandomizerSpace.hex: {
		for (let i = 0; i < count; i++) {
			const value = random(store.hexMin, store.hexMax)
			colors.push(('#' + value.toString(16).padStart(6, '0')).toUpperCase() as HEXColor)
		}
		break
	}}

	ColorsStore.update(v => v.output = colors)
}

function _subsStorage(v: ColorsStoreType): void {
	clearTimeout(_timeStorageId)
	_timeStorageId = setTimeout(() => {
		saveStorageItem('colors:color-space', v.colorSpace)
		saveStorageItem('colors:count', v.count)
		saveStorageItem('colors:hex-max', v.hexMax)
		saveStorageItem('colors:hex-min', v.hexMin)
		saveStorageItem('colors:hsl-h-max', v.hslHMax)
		saveStorageItem('colors:hsl-h-min', v.hslHMin)
		saveStorageItem('colors:hsl-s-max', v.hslSMax)
		saveStorageItem('colors:hsl-s-min', v.hslSMin)
		saveStorageItem('colors:hsl-l-max', v.hslLMax)
		saveStorageItem('colors:hsl-l-min', v.hslLMin)
		saveStorageItem('colors:rgb-r-max', v.rgbRMax)
		saveStorageItem('colors:rgb-r-min', v.rgbRMin)
		saveStorageItem('colors:rgb-g-max', v.rgbGMax)
		saveStorageItem('colors:rgb-g-min', v.rgbGMin)
		saveStorageItem('colors:rgb-b-max', v.rgbBMax)
		saveStorageItem('colors:rgb-b-min', v.rgbBMin)
		saveStorageItem('colors:output', v.output)
	}, 500)
}

function _subsOutputView(v: ColorsStoreType, o: ColorsStoreType): void {
	const output = v.output
	if (output === o.output) {return}

	const r = (v: number) => Math.round(v)
	const refs = $$$<HTMLLIElement>('li', _outputRef)
	const updateLIRef = (ref: HTMLLIElement, hex: HEXColor) => {
		const rgb = hexToRgb(hex)
		const hsl = rgbToHsl(rgb)
		const color = colorContrastRatio(rgb, {r: 0, g: 0, b: 0}) > 50? '#000' : '#fff'
		const br = () => document.createElement('br')
		ref.replaceChildren(
			hex, br(),
			`rgb(${r(rgb.r * 0xff)}, ${r(rgb.g * 0xff)}, ${r(rgb.b * 0xff)})`, br(),
			`hsl(${r(hsl.h * 360)}, ${r(hsl.s * 100)}%, ${r(hsl.l * 100)}%)`
		)
		requestAnimationFrame(() => {
			ref.style.setProperty('background-color', hex)
			ref.style.setProperty('color', color)
		})
	}

	for (let i = 0; i < refs.length; i++) {
		const ref = refs[i]
		if (i >= output.length) {
			ref.remove()
			continue
		}

		updateLIRef(ref, output[i])
	}

	for (let i = 0; i < output.length - refs.length; i++) {
		const index = refs.length + i
		const ref = document.createElement('li')
		updateLIRef(ref, output[index])
		_outputRef.append(ref)
	}
}

function _subsColorSpacesView(v: ColorsStoreType, o: ColorsStoreType): void {
	const colorSpace = v.colorSpace
	if (colorSpace === o.colorSpace) {return}

	_spaceRef.value = colorSpace
	let selectedRef = _hexRef
	switch (colorSpace) {
	case ColorsRandomizerSpace.rgb:
		selectedRef = _rgbRef
		break
	case ColorsRandomizerSpace.hsl:
		selectedRef = _hslRef
		break
	case ColorsRandomizerSpace.hex:
		selectedRef = _hexRef
		break
	}

	for (const ref of [_hexRef, _rgbRef, _hslRef]) {
		ref.style.setProperty(
			'display', selectedRef === ref? 'contents' : 'none'
		)
	}
}

function _subsView(v: ColorsStoreType): void {
	const isActive = (el: Element) => el === document.activeElement
	const count = v.count
	if (!isActive(_countRef)) {
		_countRef.valueAsNumber = count
	}

	// HEX
	const hexMax = v.hexMax
	_hexMinRef.max = hexMax.toString()
	if (!isActive(_hexMaxRef)) {
		_hexMaxRef.valueAsNumber = hexMax
	}

	const hexMin = v.hexMin
	_hexMaxRef.min = hexMin.toString()
	if (!isActive(_hexMinRef)) {
		_hexMinRef.valueAsNumber = hexMin
	}

	// RGB->R
	const rgbRMax = v.rgbRMax
	_redMinRef.max = rgbRMax.toString()
	if (!isActive(_redMaxRef)) {
		_redMaxRef.valueAsNumber = rgbRMax
	}

	const rgbRMin = v.rgbRMin
	_redMaxRef.min = rgbRMin.toString()
	if (!isActive(_redMinRef)) {
		_redMinRef.valueAsNumber = rgbRMin
	}

	// RGB->G
	const rgbGMax = v.rgbGMax
	_greenMinRef.max = rgbGMax.toString()
	if (!isActive(_greenMaxRef)) {
		_greenMaxRef.valueAsNumber = rgbGMax
	}

	const rgbGMin = v.rgbGMin
	_greenMaxRef.min = rgbGMin.toString()
	if (!isActive(_greenMinRef)) {
		_greenMinRef.valueAsNumber = rgbGMin
	}

	// RGB->B
	const rgbBMax = v.rgbBMax
	_blueMinRef.max = rgbBMax.toString()
	if (!isActive(_blueMaxRef)) {
		_blueMaxRef.valueAsNumber = rgbBMax
	}

	const rgbBMin = v.rgbBMin
	_blueMaxRef.min = rgbBMin.toString()
	if (!isActive(_blueMinRef)) {
		_blueMinRef.valueAsNumber = rgbBMin
	}

	// HSL->H
	const hslHMax = v.hslHMax
	_hueMinRef.max = hslHMax.toString()
	if (!isActive(_hueMaxRef)) {
		_hueMaxRef.valueAsNumber = hslHMax
	}

	const hslHMin = v.hslHMin
	_hueMaxRef.min = hslHMin.toString()
	if (!isActive(_hueMinRef)) {
		_hueMinRef.valueAsNumber = hslHMin
	}

	// HSL->S
	const hslSMax = v.hslSMax
	_saturationMinRef.max = hslSMax.toString()
	if (!isActive(_saturationMaxRef)) {
		_saturationMaxRef.valueAsNumber = hslSMax
	}

	const hslSMin = v.hslSMin
	_saturationMaxRef.min = hslSMin.toString()
	if (!isActive(_saturationMinRef)) {
		_saturationMinRef.valueAsNumber = hslSMin
	}

	// HSL->L
	const hslLMax = v.hslLMax
	_lightMinRef.max = hslLMax.toString()
	if (!isActive(_lightMaxRef)) {
		_lightMaxRef.valueAsNumber = hslLMax
	}

	const hslLMin = v.hslLMin
	_lightMaxRef.min = hslLMin.toString()
	if (!isActive(_lightMinRef)) {
		_lightMinRef.valueAsNumber = hslLMin
	}
}

function _initSubscriber(): void {
	ColorsStore.subscribe(_subsStorage)
	ColorsStore.subscribe(_subsView)
	ColorsStore.subscribe(_subsColorSpacesView)
	ColorsStore.subscribe(_subsOutputView)
}

function _initEvents(): void {
	_countRef.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_countRef.valueAsNumber), 1, Number.MAX_VALUE)
		ColorsStore.update(v => v.count = value)
	})

	_countRef.addEventListener('blur', () => {
		_countRef.valueAsNumber = ColorsStore.value.count
	})

	_spaceRef.addEventListener('change', () => {
		const value = _spaceRef.value
		if (!isValidEnumValue(value, ColorsRandomizerSpace)) {return}

		ColorsStore.update(v => v.colorSpace = value as ColorsRandomizerSpace)
	})

	_hexMinRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_hexMinRef.valueAsNumber), 0, ColorsStore.value.hexMax
		)
		ColorsStore.update(v => v.hexMin = value)
	})

	_hexMinRef.addEventListener('blur', () => {
		_hexMinRef.valueAsNumber = ColorsStore.value.hexMin
	})

	_hexMaxRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_hexMaxRef.valueAsNumber), ColorsStore.value.hexMin, 0xffffff
		)
		ColorsStore.update(v => v.hexMax = value)
	})

	_hexMaxRef.addEventListener('blur', () => {
		_hexMaxRef.valueAsNumber = ColorsStore.value.hexMax
	})

	_redMinRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_redMinRef.valueAsNumber), 0, ColorsStore.value.rgbRMax
		)
		ColorsStore.update(v => v.rgbRMin = value)
	})

	_redMinRef.addEventListener('blur', () => {
		_redMinRef.valueAsNumber = ColorsStore.value.rgbRMin
	})

	_redMaxRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_redMaxRef.valueAsNumber), ColorsStore.value.rgbRMin, 0xff
		)
		ColorsStore.update(v => v.rgbRMax = value)
	})

	_redMaxRef.addEventListener('blur', () => {
		_redMaxRef.valueAsNumber = ColorsStore.value.rgbRMax
	})

	_greenMinRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_greenMinRef.valueAsNumber), 0, ColorsStore.value.rgbGMax
		)
		ColorsStore.update(v => v.rgbGMin = value)
	})

	_greenMinRef.addEventListener('blur', () => {
		_greenMinRef.valueAsNumber = ColorsStore.value.rgbGMin
	})

	_greenMaxRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_greenMaxRef.valueAsNumber), ColorsStore.value.rgbGMin, 0xff
		)
		ColorsStore.update(v => v.rgbGMax = value)
	})

	_greenMaxRef.addEventListener('blur', () => {
		_greenMaxRef.valueAsNumber = ColorsStore.value.rgbGMax
	})

	_blueMinRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_blueMinRef.valueAsNumber), 0, ColorsStore.value.rgbBMax
		)
		ColorsStore.update(v => v.rgbBMin = value)
	})

	_blueMinRef.addEventListener('blur', () => {
		_blueMinRef.valueAsNumber = ColorsStore.value.rgbBMin
	})

	_blueMaxRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_blueMaxRef.valueAsNumber), ColorsStore.value.rgbBMin, 0xff
		)
		ColorsStore.update(v => v.rgbBMax = value)
	})

	_blueMaxRef.addEventListener('blur', () => {
		_blueMaxRef.valueAsNumber = ColorsStore.value.rgbBMax
	})

	_hueMinRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_hueMinRef.valueAsNumber), 0, ColorsStore.value.hslHMax
		)
		ColorsStore.update(v => v.hslHMin = value)
	})

	_hueMinRef.addEventListener('blur', () => {
		_hueMinRef.valueAsNumber = ColorsStore.value.hslHMin
	})

	_hueMaxRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_hueMaxRef.valueAsNumber), ColorsStore.value.hslHMin, 360
		)
		ColorsStore.update(v => v.hslHMax = value)
	})

	_hueMaxRef.addEventListener('blur', () => {
		_hueMaxRef.valueAsNumber = ColorsStore.value.hslHMax
	})

	_saturationMinRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_saturationMinRef.valueAsNumber), 0, ColorsStore.value.hslSMax
		)
		ColorsStore.update(v => v.hslSMin = value)
	})

	_saturationMinRef.addEventListener('blur', () => {
		_saturationMinRef.valueAsNumber = ColorsStore.value.hslSMin
	})

	_saturationMaxRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_saturationMaxRef.valueAsNumber), ColorsStore.value.hslSMin, 100
		)
		ColorsStore.update(v => v.hslSMax = value)
	})

	_saturationMaxRef.addEventListener('blur', () => {
		_saturationMaxRef.valueAsNumber = ColorsStore.value.hslSMax
	})

	_lightMinRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_lightMinRef.valueAsNumber), 0, ColorsStore.value.hslLMax
		)
		ColorsStore.update(v => v.hslLMin = value)
	})

	_lightMinRef.addEventListener('blur', () => {
		_lightMinRef.valueAsNumber = ColorsStore.value.hslLMin
	})

	_lightMaxRef.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_lightMaxRef.valueAsNumber), ColorsStore.value.hslLMin, 100
		)
		ColorsStore.update(v => v.hslLMax = value)
	})

	_lightMaxRef.addEventListener('blur', () => {
		_lightMaxRef.valueAsNumber = ColorsStore.value.hslLMax
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}