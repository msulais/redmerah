import { ObservableStore } from "@/utils/signal"
import { $, $$$ } from "../_core/_dom-utils"
import { ColorsRandomizerSpace } from "../_shared/_enums"
import { ElementIds } from "../_shared/_ids"
import { DEFAULT_COLORS_COUNT, DEFAULT_COLORS_HEX_MAX, DEFAULT_COLORS_HEX_MIN, DEFAULT_COLORS_HSL_H_MAX, DEFAULT_COLORS_HSL_H_MIN, DEFAULT_COLORS_HSL_L_MAX, DEFAULT_COLORS_HSL_L_MIN, DEFAULT_COLORS_HSL_S_MAX, DEFAULT_COLORS_HSL_S_MIN, DEFAULT_COLORS_OUTPUT, DEFAULT_COLORS_RGB_B_MAX, DEFAULT_COLORS_RGB_B_MIN, DEFAULT_COLORS_RGB_G_MAX, DEFAULT_COLORS_RGB_G_MIN, DEFAULT_COLORS_RGB_R_MAX, DEFAULT_COLORS_RGB_R_MIN, DEFAULT_COLORS_SPACE } from "../_shared/_constant"
import type { HEXColor } from "@/types/color"
import { Math_clamp } from "@/utils/math"
import { safeNumber } from "@/utils/number"
import { CComboBox } from "@/components/ComboBox"
import { isValidEnumValue } from "@/utils/object"
import { colorContrastPercentage, hexToRgb, hslToHex, rgbToHex, rgbToHsl } from "@/utils/color"
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

const _ref_count = $(ElementIds.pgCol_count) as HTMLInputElement
const _ref_space = $(ElementIds.pgCol_space) as CComboBox.CElement
const _ref_hex = $(ElementIds.pgCol_hex) as HTMLDivElement
const _ref_hexMin = $(ElementIds.pgCol_hexMin) as HTMLInputElement
const _ref_hexMax = $(ElementIds.pgCol_hexMax) as HTMLInputElement
const _ref_rgb = $(ElementIds.pgCol_rgb) as HTMLDivElement
const _ref_redMin = $(ElementIds.pgCol_redMin) as HTMLInputElement
const _ref_redMax = $(ElementIds.pgCol_redMax) as HTMLInputElement
const _ref_greenMin = $(ElementIds.pgCol_greenMin) as HTMLInputElement
const _ref_greenMax = $(ElementIds.pgCol_greenMax) as HTMLInputElement
const _ref_blueMin = $(ElementIds.pgCol_blueMin) as HTMLInputElement
const _ref_blueMax = $(ElementIds.pgCol_blueMax) as HTMLInputElement
const _ref_hsl = $(ElementIds.pgCol_hsl) as HTMLDivElement
const _ref_hueMin = $(ElementIds.pgCol_hueMin) as HTMLInputElement
const _ref_hueMax = $(ElementIds.pgCol_hueMax) as HTMLInputElement
const _ref_saturationMin = $(ElementIds.pgCol_saturationMin) as HTMLInputElement
const _ref_saturationMax = $(ElementIds.pgCol_saturationMax) as HTMLInputElement
const _ref_lightMin = $(ElementIds.pgCol_lightMin) as HTMLInputElement
const _ref_lightMax = $(ElementIds.pgCol_lightMax) as HTMLInputElement
const _ref_output = $(ElementIds.pgCol_output) as HTMLUListElement
let _time_storage: NodeJS.Timeout | number | undefined

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
	case ColorsRandomizerSpace.RGB: {
		for (let i = 0; i < count; i++) {
			const r = random(store.rgbRMin, store.rgbRMax) / 0xff
			const g = random(store.rgbGMin, store.rgbGMax) / 0xff
			const b = random(store.rgbBMin, store.rgbBMax) / 0xff
			colors.push(rgbToHex({r, g, b}).toUpperCase() as HEXColor)
		}
		break
	}
	case ColorsRandomizerSpace.HSL: {
		for (let i = 0; i < count; i++) {
			const h = random(store.hslHMin, store.hslHMax) / 360
			const s = random(store.hslSMin, store.hslSMax) / 100
			const l = random(store.hslLMin, store.hslLMax) / 100
			colors.push(hslToHex({h: h, s: s, l: l}).toUpperCase() as HEXColor)
		}
		break
	}
	case ColorsRandomizerSpace.HEX: {
		for (let i = 0; i < count; i++) {
			const value = random(store.hexMin, store.hexMax)
			colors.push(('#' + value.toString(16).padStart(6, '0')).toUpperCase() as HEXColor)
		}
		break
	}}

	ColorsStore.update(v => v.output = colors)
}

function _subsStorage(v: ColorsStoreType): void {
	clearTimeout(_time_storage)
	_time_storage = setTimeout(() => {
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
	const refs = $$$<HTMLLIElement>('li', _ref_output)
	const update_ref_li = (ref: HTMLLIElement, hex: HEXColor) => {
		const rgb = hexToRgb(hex)
		const hsl = rgbToHsl(rgb)
		const color = colorContrastPercentage(rgb, {r: 0, g: 0, b: 0}) > 50? '#000' : '#fff'
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
		const ref = refs[i]!
		if (i >= output.length) {
			ref.remove()
			continue
		}

		update_ref_li(ref, output[i]!)
	}

	for (let i = 0; i < output.length - refs.length; i++) {
		const index = refs.length + i
		const ref = document.createElement('li')
		update_ref_li(ref, output[index]!)
		_ref_output.append(ref)
	}
}

function _subsColorSpacesView(v: ColorsStoreType, o: ColorsStoreType): void {
	const colorSpace = v.colorSpace
	if (colorSpace === o.colorSpace) {return}

	_ref_space.value = colorSpace
	let ref_selected = _ref_hex
	switch (colorSpace) {
	case ColorsRandomizerSpace.RGB:
		ref_selected = _ref_rgb
		break
	case ColorsRandomizerSpace.HSL:
		ref_selected = _ref_hsl
		break
	case ColorsRandomizerSpace.HEX:
		ref_selected = _ref_hex
		break
	}

	for (const ref of [_ref_hex, _ref_rgb, _ref_hsl]) {
		ref.style.setProperty(
			'display', ref_selected === ref? 'contents' : 'none'
		)
	}
}

function _subsView(v: ColorsStoreType): void {
	const isActive = (el: Element) => el === document.activeElement
	const count = v.count
	if (!isActive(_ref_count)) {
		_ref_count.valueAsNumber = count
	}

	// HEX
	const hexMax = v.hexMax
	_ref_hexMin.max = hexMax.toString()
	if (!isActive(_ref_hexMax)) {
		_ref_hexMax.valueAsNumber = hexMax
	}

	const hexMin = v.hexMin
	_ref_hexMax.min = hexMin.toString()
	if (!isActive(_ref_hexMin)) {
		_ref_hexMin.valueAsNumber = hexMin
	}

	// RGB->R
	const rgbRMax = v.rgbRMax
	_ref_redMin.max = rgbRMax.toString()
	if (!isActive(_ref_redMax)) {
		_ref_redMax.valueAsNumber = rgbRMax
	}

	const rgbRMin = v.rgbRMin
	_ref_redMax.min = rgbRMin.toString()
	if (!isActive(_ref_redMin)) {
		_ref_redMin.valueAsNumber = rgbRMin
	}

	// RGB->G
	const rgbGMax = v.rgbGMax
	_ref_greenMin.max = rgbGMax.toString()
	if (!isActive(_ref_greenMax)) {
		_ref_greenMax.valueAsNumber = rgbGMax
	}

	const rgbGMin = v.rgbGMin
	_ref_greenMax.min = rgbGMin.toString()
	if (!isActive(_ref_greenMin)) {
		_ref_greenMin.valueAsNumber = rgbGMin
	}

	// RGB->B
	const rgbBMax = v.rgbBMax
	_ref_blueMin.max = rgbBMax.toString()
	if (!isActive(_ref_blueMax)) {
		_ref_blueMax.valueAsNumber = rgbBMax
	}

	const rgbBMin = v.rgbBMin
	_ref_blueMax.min = rgbBMin.toString()
	if (!isActive(_ref_blueMin)) {
		_ref_blueMin.valueAsNumber = rgbBMin
	}

	// HSL->H
	const hslHMax = v.hslHMax
	_ref_hueMin.max = hslHMax.toString()
	if (!isActive(_ref_hueMax)) {
		_ref_hueMax.valueAsNumber = hslHMax
	}

	const hslHMin = v.hslHMin
	_ref_hueMax.min = hslHMin.toString()
	if (!isActive(_ref_hueMin)) {
		_ref_hueMin.valueAsNumber = hslHMin
	}

	// HSL->S
	const hslSMax = v.hslSMax
	_ref_saturationMin.max = hslSMax.toString()
	if (!isActive(_ref_saturationMax)) {
		_ref_saturationMax.valueAsNumber = hslSMax
	}

	const hslSMin = v.hslSMin
	_ref_saturationMax.min = hslSMin.toString()
	if (!isActive(_ref_saturationMin)) {
		_ref_saturationMin.valueAsNumber = hslSMin
	}

	// HSL->L
	const hslLMax = v.hslLMax
	_ref_lightMin.max = hslLMax.toString()
	if (!isActive(_ref_lightMax)) {
		_ref_lightMax.valueAsNumber = hslLMax
	}

	const hslLMin = v.hslLMin
	_ref_lightMax.min = hslLMin.toString()
	if (!isActive(_ref_lightMin)) {
		_ref_lightMin.valueAsNumber = hslLMin
	}
}

function _initSubscriber(): void {
	ColorsStore.subscribe(_subsStorage)
	ColorsStore.subscribe(_subsView)
	ColorsStore.subscribe(_subsColorSpacesView)
	ColorsStore.subscribe(_subsOutputView)
}

function _initEvents(): void {
	_ref_count.addEventListener('input', () => {
		const value = Math_clamp(safeNumber(_ref_count.valueAsNumber), 1, Number.MAX_VALUE)
		ColorsStore.update(v => v.count = value)
	})

	_ref_count.addEventListener('blur', () => {
		_ref_count.valueAsNumber = ColorsStore.value.count
	})

	_ref_space.addEventListener('change', () => {
		const value = _ref_space.value
		if (!isValidEnumValue(value, ColorsRandomizerSpace)) {return}

		ColorsStore.update(v => v.colorSpace = value as ColorsRandomizerSpace)
	})

	_ref_hexMin.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_hexMin.valueAsNumber), 0, ColorsStore.value.hexMax
		)
		ColorsStore.update(v => v.hexMin = value)
	})

	_ref_hexMin.addEventListener('blur', () => {
		_ref_hexMin.valueAsNumber = ColorsStore.value.hexMin
	})

	_ref_hexMax.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_hexMax.valueAsNumber), ColorsStore.value.hexMin, 0xffffff
		)
		ColorsStore.update(v => v.hexMax = value)
	})

	_ref_hexMax.addEventListener('blur', () => {
		_ref_hexMax.valueAsNumber = ColorsStore.value.hexMax
	})

	_ref_redMin.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_redMin.valueAsNumber), 0, ColorsStore.value.rgbRMax
		)
		ColorsStore.update(v => v.rgbRMin = value)
	})

	_ref_redMin.addEventListener('blur', () => {
		_ref_redMin.valueAsNumber = ColorsStore.value.rgbRMin
	})

	_ref_redMax.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_redMax.valueAsNumber), ColorsStore.value.rgbRMin, 0xff
		)
		ColorsStore.update(v => v.rgbRMax = value)
	})

	_ref_redMax.addEventListener('blur', () => {
		_ref_redMax.valueAsNumber = ColorsStore.value.rgbRMax
	})

	_ref_greenMin.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_greenMin.valueAsNumber), 0, ColorsStore.value.rgbGMax
		)
		ColorsStore.update(v => v.rgbGMin = value)
	})

	_ref_greenMin.addEventListener('blur', () => {
		_ref_greenMin.valueAsNumber = ColorsStore.value.rgbGMin
	})

	_ref_greenMax.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_greenMax.valueAsNumber), ColorsStore.value.rgbGMin, 0xff
		)
		ColorsStore.update(v => v.rgbGMax = value)
	})

	_ref_greenMax.addEventListener('blur', () => {
		_ref_greenMax.valueAsNumber = ColorsStore.value.rgbGMax
	})

	_ref_blueMin.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_blueMin.valueAsNumber), 0, ColorsStore.value.rgbBMax
		)
		ColorsStore.update(v => v.rgbBMin = value)
	})

	_ref_blueMin.addEventListener('blur', () => {
		_ref_blueMin.valueAsNumber = ColorsStore.value.rgbBMin
	})

	_ref_blueMax.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_blueMax.valueAsNumber), ColorsStore.value.rgbBMin, 0xff
		)
		ColorsStore.update(v => v.rgbBMax = value)
	})

	_ref_blueMax.addEventListener('blur', () => {
		_ref_blueMax.valueAsNumber = ColorsStore.value.rgbBMax
	})

	_ref_hueMin.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_hueMin.valueAsNumber), 0, ColorsStore.value.hslHMax
		)
		ColorsStore.update(v => v.hslHMin = value)
	})

	_ref_hueMin.addEventListener('blur', () => {
		_ref_hueMin.valueAsNumber = ColorsStore.value.hslHMin
	})

	_ref_hueMax.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_hueMax.valueAsNumber), ColorsStore.value.hslHMin, 360
		)
		ColorsStore.update(v => v.hslHMax = value)
	})

	_ref_hueMax.addEventListener('blur', () => {
		_ref_hueMax.valueAsNumber = ColorsStore.value.hslHMax
	})

	_ref_saturationMin.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_saturationMin.valueAsNumber), 0, ColorsStore.value.hslSMax
		)
		ColorsStore.update(v => v.hslSMin = value)
	})

	_ref_saturationMin.addEventListener('blur', () => {
		_ref_saturationMin.valueAsNumber = ColorsStore.value.hslSMin
	})

	_ref_saturationMax.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_saturationMax.valueAsNumber), ColorsStore.value.hslSMin, 100
		)
		ColorsStore.update(v => v.hslSMax = value)
	})

	_ref_saturationMax.addEventListener('blur', () => {
		_ref_saturationMax.valueAsNumber = ColorsStore.value.hslSMax
	})

	_ref_lightMin.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_lightMin.valueAsNumber), 0, ColorsStore.value.hslLMax
		)
		ColorsStore.update(v => v.hslLMin = value)
	})

	_ref_lightMin.addEventListener('blur', () => {
		_ref_lightMin.valueAsNumber = ColorsStore.value.hslLMin
	})

	_ref_lightMax.addEventListener('input', () => {
		const value = Math_clamp(
			safeNumber(_ref_lightMax.valueAsNumber), ColorsStore.value.hslLMin, 100
		)
		ColorsStore.update(v => v.hslLMax = value)
	})

	_ref_lightMax.addEventListener('blur', () => {
		_ref_lightMax.valueAsNumber = ColorsStore.value.hslLMax
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}