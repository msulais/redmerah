import { updateButtonRef } from "@/native-components/Button"
import { closeMenuRef } from "@/native-components/Menu"
import { ElementIds, RadioGroupNames } from "./_enums"
import { LocalStorageKeys } from "@/enums/storage"
import { isValidEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ColorPickerAttributes, ColorPickerEvents, openColorPickerRef, updateColorPickerRef } from "@/native-components/ColorPicker"
import { generateColorPalette, hexToRgb, isColorValid } from "@/utils/color"
import type { HEXColor, RGBColor } from "@/types/color"
import { GlobalElementIds } from "@/enums/ids"

const $ = (id: string) => document.getElementById(id)
const $$ = (selector: string, from = document) => from.querySelector(selector)
const _rootRef = document.documentElement
const _infoButtonRef = $(ElementIds.appbarInfoButton) as HTMLButtonElement
const _shareButtonRef = $(ElementIds.appbarInfoShareButton) as HTMLButtonElement
const _infoMenuRef = $(ElementIds.appbarInfoMenu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.appbarSettingsButton) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.appbarSettingsMenu) as HTMLDivElement
const _settingsThemeMenuRef = $(ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
const _settingsAnimationMenuRef = $(ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement
const _accentButtonRef = $(ElementIds.appbarSettingsAccentButton) as HTMLButtonElement
const _colorPickerRef = $(ElementIds.appbarColorPicker) as HTMLDivElement
const _accentColorElement = $(GlobalElementIds.colorAccent) as HTMLStyleElement
let _timeAccentId: number | NodeJS.Timeout | null = null

function _rgbToCSS(rgb: RGBColor) {
	return `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
}

function _initSettings(): void {
	function initTheme(): void {
		const theme = localStorage.getItem(LocalStorageKeys.platformTheme)
		if (!theme || !isValidEnumValue(theme, PlatformThemeMode)) return

		_rootRef.setAttribute(RootAttributes.theme, theme)
		const previous = $$(
			`input[name="${CSS.escape(RadioGroupNames.settingsTheme)}"]:checked`
		) as HTMLInputElement
		const target = $$(
			`input[name="${CSS.escape(RadioGroupNames.settingsTheme)}"][value="${CSS.escape(theme)}"]`
		) as HTMLInputElement

		if (previous === target) return
		if (previous) previous.checked = false
		if (target) target.checked = true
	}

	function initAnimation(): void {
		const animation = localStorage.getItem(LocalStorageKeys.platformAnimation)
		if (!animation || !isValidEnumValue(animation, PlatformAnimationMode)) return

		_rootRef.setAttribute(RootAttributes.animation, animation)
		const previous = $$(
			`input[name="${CSS.escape(RadioGroupNames.settingsAnimation)}"]:checked`
		) as HTMLInputElement
		const target = $$(
			`input[name="${CSS.escape(RadioGroupNames.settingsAnimation)}"][value="${CSS.escape(animation)}"]`
		) as HTMLInputElement

		if (previous === target) return
		if (previous) previous.checked = false
		if (target) target.checked = true
	}

	function initAccentColor(): void {
		const accent = localStorage.getItem(LocalStorageKeys.platformAccentColor)
		if (!accent || !isColorValid(accent)) return

		const rgbToCSS = (rgb: RGBColor) => `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
		const accentColorElement = $(GlobalElementIds.colorAccent) as HTMLStyleElement
		const colorPickerRef = $(ElementIds.appbarColorPicker) as HTMLDivElement
		const palette = generateColorPalette(accent as HEXColor)
		accentColorElement.innerHTML = `:root{--g-color-accent-light: ${rgbToCSS(hexToRgb(palette.color))};--g-color-accent-dark: ${rgbToCSS(hexToRgb(palette.colorDark))};--g-color-on-accent-light: ${rgbToCSS(hexToRgb(palette.onColor))};--g-color-on-accent-dark: ${rgbToCSS(hexToRgb(palette.onColorDark))};}`;
		updateColorPickerRef(colorPickerRef, {
			ColorPickerValue: accent as HEXColor
		})
	}

	initTheme()
	initAnimation()
	initAccentColor()
}

function _initEvents(): void {
	_settingsMenuRef.addEventListener('click', () => {
		switch (document.activeElement) {
		case _accentButtonRef:
			openColorPickerRef(_colorPickerRef)
			closeMenuRef(_settingsMenuRef)
			break
		}
	})

	_colorPickerRef.addEventListener(ColorPickerEvents.input, () => {
		if (_timeAccentId !== null) clearTimeout(_timeAccentId)

		_timeAccentId = setTimeout(() => {
			const accent = _colorPickerRef.getAttribute(ColorPickerAttributes.value)! as HEXColor
			const palette = generateColorPalette(accent)
			_accentColorElement.innerHTML = `:root{--g-color-accent-light: ${_rgbToCSS(hexToRgb(palette.color))};--g-color-accent-dark: ${_rgbToCSS(hexToRgb(palette.colorDark))};--g-color-on-accent-light: ${_rgbToCSS(hexToRgb(palette.onColor))};--g-color-on-accent-dark: ${_rgbToCSS(hexToRgb(palette.onColorDark))};}`;
			localStorage.setItem(LocalStorageKeys.platformAccentColor, accent)
		}, 50)
	})

	_settingsMenuRef.addEventListener('toggle', ev => {
		const open = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_settingsButtonRef, {
			ButtonFocused: open
		})
	})

	_infoMenuRef.addEventListener('toggle', ev => {
		const open = (ev as ToggleEvent).newState === 'open'
		updateButtonRef(_infoButtonRef, {
			ButtonFocused: open
		})
	})

	_shareButtonRef.addEventListener('click', () => {
		navigator.share({
			title: 'BiruUI',
			url: document.URL,
			text: 'BiruUI'
		})
		closeMenuRef(_infoMenuRef)
	})

	_settingsThemeMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !isValidEnumValue(value, PlatformThemeMode)) return

		localStorage.setItem(LocalStorageKeys.platformTheme, value)
		_rootRef.setAttribute(RootAttributes.theme, value)
		closeMenuRef(_settingsMenuRef)
	})

	_settingsAnimationMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) return

		localStorage.setItem(LocalStorageKeys.platformAnimation, value)
		_rootRef.setAttribute(RootAttributes.animation, value)
		closeMenuRef(_settingsMenuRef)
	})
}

export default () => {
	_initEvents()
	_initSettings()
}