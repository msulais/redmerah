import { ColorPickerEvents, getColorPickerRefValue, updateColorPickerRef, type ColorPickerElement } from "@/components/ColorPicker"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import type { HEXColor } from "@/types/color"
import { ObservableStore } from "@/utils/store"
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_FOREGROUND_COLOR } from "../_shared/_constant"
import { colorContrastPercentage, colorContrastRatio, hexToRgb } from "@/utils/color"
import { adjustDecimalNumber } from "@/utils/number"
import { saveStorageItem } from "./_database"

export type CheckerStoreType = {
	foreground: HEXColor
	background: HEXColor
}

export const CheckerStore = new ObservableStore<CheckerStoreType>({
	background: DEFAULT_BACKGROUND_COLOR,
	foreground: DEFAULT_FOREGROUND_COLOR
})

const _foregroundRef = $(ElementIds.bd_foreground) as HTMLButtonElement
const _backgroundRef = $(ElementIds.bd_background) as HTMLButtonElement
const _forePickerRef = $(ElementIds.bd_forePicker) as ColorPickerElement
const _backPickerRef = $(ElementIds.bd_backPicker) as ColorPickerElement
const _ratioRef = $(ElementIds.bd_ratio) as HTMLSpanElement
const _percentageRef = $(ElementIds.bd_percentage) as HTMLSpanElement
const _previewRef = $(ElementIds.bd_preview) as HTMLDivElement
const _normalAARef = $(ElementIds.bd_normalAA) as HTMLSpanElement
const _normalAAARef = $(ElementIds.bd_normalAAA) as HTMLSpanElement
const _largeAARef = $(ElementIds.bd_largeAA) as HTMLSpanElement
const _largeAAARef = $(ElementIds.bd_largeAAA) as HTMLSpanElement
let _timeStorageId: ReturnType<typeof setTimeout> | undefined

function _contrast(hex1: HEXColor, hex2: HEXColor){
	return colorContrastPercentage(hexToRgb(hex1), hexToRgb(hex2))
}

function _subsStorage(v: CheckerStoreType, o: CheckerStoreType): void {
	const foreground = v.foreground
	const background = v.background
	if (foreground === o.foreground && background === o.background) {return}

	clearTimeout(_timeStorageId)
	_timeStorageId = setTimeout(() => {
		saveStorageItem('background-color', background)
		saveStorageItem('foreground-color', foreground)
	}, 1000)
}

function _subsOutput(v: CheckerStoreType, o: CheckerStoreType): void {
	const foreground = v.foreground
	const background = v.background
	if (foreground === o.foreground && background === o.background) {return}

	const ratio = adjustDecimalNumber(colorContrastRatio(hexToRgb(foreground), hexToRgb(background)), 2)
	_ratioRef.textContent = ratio.toString()
	_percentageRef.textContent = adjustDecimalNumber(_contrast(foreground, background), 2) + '%'
	_normalAARef.setAttribute('data-pass', String(ratio > 4.5))
	_normalAAARef.setAttribute('data-pass', String(ratio > 7))
	_largeAARef.setAttribute('data-pass', String(ratio > 3))
	_largeAAARef.setAttribute('data-pass', String(ratio > 4.5))
}

function _subsView(v: CheckerStoreType): void {
	const foreground = v.foreground
	_foregroundRef.textContent = foreground.toUpperCase()

	const background = v.background
	_backgroundRef.textContent = background.toUpperCase()

	requestAnimationFrame(() => {
		const style = (el: HTMLElement, name: string, value: string) => el.style.setProperty(name, value)
		style(_foregroundRef, 'background-color', foreground)
		style(_foregroundRef, 'color', _contrast(foreground, '#000000') > 50? '#000' : '#FFF')
		style(_foregroundRef, '--outline-color', _contrast(foreground, '#000000') > 50? '#000' : '#FFF')

		style(_backgroundRef, 'background-color', background)
		style(_backgroundRef, 'color', _contrast(background, '#000000') > 50? '#000' : '#FFF')
		style(_backgroundRef, '--outline-color', _contrast(background, '#000000') > 50? '#000' : '#FFF')

		style(_previewRef, '--color', foreground)
		style(_previewRef, '--background-color', background)
	})
}

function _initSubscriber(): void {
	CheckerStore.subscribeAll([
		_subsStorage,
		_subsView,
		_subsOutput
	])
}

function _initEvents(): void {
	_forePickerRef.addEventListener(ColorPickerEvents.input, () => {
		CheckerStore.update(v => v.foreground = getColorPickerRefValue(_forePickerRef))
	})

	_forePickerRef.addEventListener('beforetoggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		_foregroundRef.toggleAttribute('data-focused', isOpen)
		if (!isOpen) {return}

		updateColorPickerRef(_forePickerRef, {ColorPickerValue: CheckerStore.value.foreground})
	})

	_backPickerRef.addEventListener(ColorPickerEvents.input, () => {
		CheckerStore.update(v => v.background = getColorPickerRefValue(_backPickerRef))
	})

	_backPickerRef.addEventListener('beforetoggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		_backgroundRef.toggleAttribute('data-focused', isOpen)
		if (!isOpen) {return}

		updateColorPickerRef(_backPickerRef, {ColorPickerValue: CheckerStore.value.background})
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}