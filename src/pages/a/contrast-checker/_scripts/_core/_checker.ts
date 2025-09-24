import { CColorPicker } from "@/components/ColorPicker"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import type { HEXColor } from "@/types/color"
import { ObservableStore } from "@/utils/store"
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_FOREGROUND_COLOR } from "../_shared/_constant"
import { colorContrastPercentage, colorContrastRatio, hexToRgb } from "@/utils/color"
import { adjustDecimalNumber } from "@/utils/number"
import { saveStorageItem } from "./_database"
import { CButton } from "@/components/Button"

export type CheckerStoreType = {
	foreground: HEXColor
	background: HEXColor
}

export const CheckerStore = new ObservableStore<CheckerStoreType>({
	background: DEFAULT_BACKGROUND_COLOR,
	foreground: DEFAULT_FOREGROUND_COLOR
})

const _ref_foreground = $(ElementIds.bd_foreground) as CButton.CElement
const _ref_background = $(ElementIds.bd_background) as CButton.CElement
const _ref_forePicker = $(ElementIds.bd_forePicker) as CColorPicker.CElement
const _ref_backPicker = $(ElementIds.bd_backPicker) as CColorPicker.CElement
const _ref_ratio = $(ElementIds.bd_ratio) as HTMLSpanElement
const _ref_percentage = $(ElementIds.bd_percentage) as HTMLSpanElement
const _ref_preview = $(ElementIds.bd_preview) as HTMLDivElement
const _ref_normalAA = $(ElementIds.bd_normalAA) as HTMLSpanElement
const _ref_normalAAA = $(ElementIds.bd_normalAAA) as HTMLSpanElement
const _ref_largeAA = $(ElementIds.bd_largeAA) as HTMLSpanElement
const _ref_largeAAA = $(ElementIds.bd_largeAAA) as HTMLSpanElement
let _time_storage: ReturnType<typeof setTimeout> | undefined

function _contrast(hex1: HEXColor, hex2: HEXColor){
	return colorContrastPercentage(hexToRgb(hex1), hexToRgb(hex2))
}

function _subsStorage(v: CheckerStoreType, o: CheckerStoreType): void {
	const foreground = v.foreground
	const background = v.background
	if (foreground === o.foreground && background === o.background) {return}

	clearTimeout(_time_storage)
	_time_storage = setTimeout(() => {
		saveStorageItem('background-color', background)
		saveStorageItem('foreground-color', foreground)
	}, 1000)
}

function _subsOutput(v: CheckerStoreType, o: CheckerStoreType): void {
	const foreground = v.foreground
	const background = v.background
	if (foreground === o.foreground && background === o.background) {return}

	const ratio = adjustDecimalNumber(colorContrastRatio(hexToRgb(foreground), hexToRgb(background)), 2)
	_ref_ratio.textContent = ratio.toString()
	_ref_percentage.textContent = adjustDecimalNumber(_contrast(foreground, background), 2) + '%'
	_ref_normalAA.setAttribute('data-pass', String(ratio > 4.5))
	_ref_normalAAA.setAttribute('data-pass', String(ratio > 7))
	_ref_largeAA.setAttribute('data-pass', String(ratio > 3))
	_ref_largeAAA.setAttribute('data-pass', String(ratio > 4.5))
}

function _subsView(v: CheckerStoreType): void {
	const foreground = v.foreground
	_ref_foreground.textContent = foreground.toUpperCase()

	const background = v.background
	_ref_background.textContent = background.toUpperCase()

	requestAnimationFrame(() => {
		const style = (el: HTMLElement, name: string, value: string) => el.style.setProperty(name, value)
		style(_ref_foreground, 'background-color', foreground)
		style(_ref_foreground, 'color', _contrast(foreground, '#000000') > 50? '#000' : '#FFF')
		style(_ref_foreground, '--outline-color', _contrast(foreground, '#000000') > 50? '#000' : '#FFF')

		style(_ref_background, 'background-color', background)
		style(_ref_background, 'color', _contrast(background, '#000000') > 50? '#000' : '#FFF')
		style(_ref_background, '--outline-color', _contrast(background, '#000000') > 50? '#000' : '#FFF')

		style(_ref_preview, '--color', foreground)
		style(_ref_preview, '--background-color', background)
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
	_ref_forePicker.addEventListener(CColorPicker.Events.input, () => {
		CheckerStore.update(v => v.foreground = CColorPicker.getValue(_ref_forePicker))
	})

	_ref_forePicker.addEventListener('beforetoggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		_ref_foreground.toggleAttribute('data-focused', isOpen)
		if (!isOpen) {return}

		CColorPicker.update(_ref_forePicker, {
			ColorPicker: {value: CheckerStore.value.foreground}
		})
	})

	_ref_backPicker.addEventListener(CColorPicker.Events.input, () => {
		CheckerStore.update(v => v.background = CColorPicker.getValue(_ref_backPicker))
	})

	_ref_backPicker.addEventListener('beforetoggle', (ev) => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		_ref_background.toggleAttribute('data-focused', isOpen)
		if (!isOpen) {return}

		CColorPicker.update(_ref_backPicker, {
			ColorPicker: {value: CheckerStore.value.background}
		})
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
}