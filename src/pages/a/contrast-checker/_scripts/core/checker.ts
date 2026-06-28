import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import { signal } from '@/utils/signal'
import { $, $$ } from './dom-utils.js'
import { colorContrastPercentage, colorContrastRatio, hexToRgb, isColorValid } from '@/utils/color'
import type { HEXColor } from '@/types/color'
import { adjustDecimalNumber } from '@/utils/number'
import { saveStorageItem } from './database.js'
import { delegateEvent } from '@/utils/event-registry.js'

export const sg_backgroundColor = signal(Constant.DEFAULT_BACKGROUND_COLOR)
export const sg_foregroundColor = signal(Constant.DEFAULT_FOREGROUND_COLOR)

const _ref_foreground      = $(Ids.ColorInputForeground) as HTMLInputElement
const _ref_foregroundLabel = $$(`[for="${Ids.ColorInputForeground}"]`) as HTMLLabelElement
const _ref_background      = $(Ids.ColorInputBackground) as HTMLInputElement
const _ref_backgroundLabel = $$(`[for="${Ids.ColorInputBackground}"]`) as HTMLLabelElement
const _ref_ratio           = $(Ids.InfoRatio) as HTMLSpanElement
const _ref_percentage      = $(Ids.InfoPercentage) as HTMLSpanElement
const _ref_preview         = $(Ids.Preview) as HTMLDivElement
const _ref_normalAA        = $(Ids.WCAGNormalAA) as HTMLSpanElement
const _ref_normalAAA       = $(Ids.WCAGNormalAAA) as HTMLSpanElement
const _ref_largeAA         = $(Ids.WCAGLargeAA) as HTMLSpanElement
const _ref_largeAAA        = $(Ids.WCAGLargeAAA) as HTMLSpanElement

function _calculate(): void {
	const ratio = adjustDecimalNumber(colorContrastRatio(hexToRgb(sg_foregroundColor()), hexToRgb(sg_backgroundColor())), 2)
	_ref_ratio.textContent = ratio.toString()
	_ref_percentage.textContent = adjustDecimalNumber(colorContrastPercentage(hexToRgb(sg_foregroundColor()), hexToRgb(sg_backgroundColor())), 2) + '%'
	_ref_normalAA.textContent = ratio > 4.5? 'PASS' : 'FAIL'
	_ref_normalAAA.textContent = ratio > 7? 'PASS' : 'FAIL'
	_ref_largeAA.textContent = ratio > 3? 'PASS' : 'FAIL'
	_ref_largeAAA.textContent = ratio > 4.5? 'PASS' : 'FAIL'
	_ref_largeAAA.setAttribute('data-pass', String(ratio > 4.5))
}

function _initSubscriber(): void {
	sg_foregroundColor.subscribe(v => {
		_calculate()
		_ref_foreground.value = v
		_ref_foregroundLabel.textContent = `Color 2 (${v.toUpperCase()})`
		_ref_preview.style.setProperty('--color', v)
		saveStorageItem('foreground-color', v)
	})

	sg_backgroundColor.subscribe(v => {
		_calculate()
		_ref_background.value = v
		_ref_backgroundLabel.textContent = `Color 1 (${v.toUpperCase()})`
		_ref_preview.style.setProperty('--background-color', v)
		saveStorageItem('background-color', v)
	})
}

function _initEvents(): void {
	delegateEvent(_ref_background, 'input', () => {
		const color = _ref_background.value
		if (!isColorValid(color)) {
			return
		}

		sg_backgroundColor.set(color as HEXColor)
	})

	delegateEvent(_ref_foreground, 'input', () => {
		const color = _ref_foreground.value
		if (!isColorValid(color)) {
			return
		}

		sg_foregroundColor.set(color as HEXColor)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
	sg_backgroundColor.notify() // init view
}