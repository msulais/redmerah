import * as Constant from '../shared/constant.enum.js'
import * as Ids from '../shared/ids.enum.js'
import { type HEXColor } from "@/types/color"
import { saveStorageItem } from "./database.js"
import { signal } from "@/utils/signal"
import { $ } from './dom-utils.js'
import { generateColorAccent, hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from '@/utils/color.js'

export const sg_seed = signal(Constant.DEFAULT_COLOR)

const _ref_copy              = $(Ids.CopyButton) as HTMLButtonElement
const _ref_color             = $(Ids.ColorInput) as HTMLInputElement
const _ref_colorLabel        = $(Ids.ColorInputLabel) as HTMLSpanElement
const _ref_accentLight       = $(Ids.AccentLight) as HTMLDivElement
const _ref_accentLightText   = $(Ids.AccentLightText) as HTMLSpanElement
const _ref_onAccentLightText = $(Ids.OnAccentLightText) as HTMLSpanElement
const _ref_accentDark        = $(Ids.AccentDark) as HTMLDivElement
const _ref_accentDarkText    = $(Ids.AccentDarkText) as HTMLSpanElement
const _ref_onAccentDarkText  = $(Ids.OnAccentDarkText) as HTMLSpanElement

let _time_accent: ReturnType<typeof setTimeout> | undefined

function _initSubscriber(): void {
	sg_seed.subscribe(v => {
		_ref_colorLabel.textContent = v.toUpperCase()
		_ref_color.value = v
		saveStorageItem('seed', v, 250)
		clearTimeout(_time_accent)
		_time_accent = setTimeout(() => {
			const lightAccent   = generateColorAccent(hexToRgb(sg_seed()), hexToRgb('#ffffff'))
			const darkAccent    = generateColorAccent(hexToRgb(sg_seed()), hexToRgb('#000000'))
			const lightOnAccent = generateColorAccent(hslToRgb({h: rgbToHsl(lightAccent).h, l: .5, s: 1}), lightAccent)
			const darkOnAccent  = generateColorAccent(hslToRgb({h: rgbToHsl(darkAccent).h, l: .5, s: 1}), darkAccent)
			_ref_accentLight      .style.setProperty('background-color', rgbToHex(lightAccent))
			_ref_onAccentLightText.style.setProperty('background-color', rgbToHex(lightOnAccent))
			_ref_accentDark       .style.setProperty('background-color', rgbToHex(darkAccent))
			_ref_onAccentDarkText .style.setProperty('background-color', rgbToHex(darkOnAccent))
			_ref_accentLightText  .style.setProperty('color', rgbToHex(lightOnAccent))
			_ref_onAccentLightText.style.setProperty('color', rgbToHex(lightAccent))
			_ref_accentDarkText   .style.setProperty('color', rgbToHex(darkOnAccent))
			_ref_onAccentDarkText .style.setProperty('color', rgbToHex(darkAccent))
			_ref_accentLightText  .innerHTML = `Accent Light<br>${rgbToHex(lightAccent).toUpperCase()}`
			_ref_onAccentLightText.innerHTML = `On Accent Light<br>${rgbToHex(lightOnAccent).toUpperCase()}`
			_ref_accentDarkText   .innerHTML = `Accent Dark<br>${rgbToHex(darkAccent).toUpperCase()}`
			_ref_onAccentDarkText .innerHTML = `On Accent Dark<br>${rgbToHex(darkOnAccent).toUpperCase()}`
		}, 50)
	})
}

function _initEvents(): void {
	_ref_copy.addEventListener('click', () => {
		const lightAccent   = generateColorAccent(hexToRgb(sg_seed()), hexToRgb('#ffffff'))
		const darkAccent    = generateColorAccent(hexToRgb(sg_seed()), hexToRgb('#000000'))
		const lightOnAccent = generateColorAccent(hslToRgb({h: rgbToHsl(lightAccent).h, l: .5, s: 1}), lightAccent)
		const darkOnAccent  = generateColorAccent(hslToRgb({h: rgbToHsl(darkAccent).h, l: .5, s: 1}), darkAccent)
		const text = [
			'--seed           : ' + sg_seed()               .toUpperCase(),
			'--accent-light   : ' + rgbToHex(lightAccent  ).toUpperCase(),
			'--on-accent-light: ' + rgbToHex(lightOnAccent).toUpperCase(),
			'--accent-dark    : ' + rgbToHex(darkAccent   ).toUpperCase(),
			'--on-accent-dark : ' + rgbToHex(darkOnAccent ).toUpperCase(),
		].map(v => v + ';').join('\n')
		navigator.clipboard.writeText(text)
	})

	_ref_color.addEventListener('input', () => {
		sg_seed.set(_ref_color.value as HEXColor)
	})
}

export default () => {
	_initSubscriber()
	_initEvents()
	sg_seed.notify() // to init html
}