import { ElementIds, ID, RadioGroupNames } from "./_enums"
import { CButton } from "@/components/Button"
import { isValidEnumValue } from "@/utils/object"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { LocalStorageKeys } from "@/enums/storage"
import { RootAttributes } from "@/enums/attributes"
import { generateColorPalette, hexToRgb, isColorValid } from "@/utils/color"
import { GlobalElementIds } from "@/enums/ids"
import { CColorPicker } from "@/components/ColorPicker"
import type { RGBColor, HEXColor } from "@/types/color"

const $ = (id: string) => document.getElementById(id)
const $$ = (selector: string, from = document) => from.querySelector(selector)
const _ref_root = document.documentElement
const _ref_btn = $(ID + ElementIds.appbarSettingsButton) as HTMLButtonElement
const _ref_menu = $(ID + ElementIds.appbarSettingsMenu) as HTMLDivElement
const _ref_animationMenu = $(ID + ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement
const _ref_themeMenu = $(ID + ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
const _ref_colorPicker = $(ID + ElementIds.appbarColorPicker) as HTMLDivElement
const _ref_accentBtn = $(ID + ElementIds.appbarSettingsAccentButton) as HTMLButtonElement
const _ref_accentColor = $(GlobalElementIds.ColorAccent) as HTMLStyleElement
let _time_accent: number | NodeJS.Timeout | null = null

function _rgbToCSS (rgb: RGBColor) {
	return `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
}

function _initSettings(): void {
	function initTheme(): void {
		const theme = localStorage.getItem(LocalStorageKeys.PlatformTheme)
		if (!theme || !isValidEnumValue(theme, PlatformThemeMode)) return

		_ref_root.setAttribute(RootAttributes.Theme, theme)
		const ref_previous = $$(
			`input[name="${CSS.escape(RadioGroupNames.settingsTheme)}"]:checked`
		) as HTMLInputElement
		const ref_target = $$(
			`input[name="${CSS.escape(RadioGroupNames.settingsTheme)}"][value="${CSS.escape(theme)}"]`
		) as HTMLInputElement

		if (ref_previous === ref_target) return
		if (ref_previous) ref_previous.checked = false
		if (ref_target) ref_target.checked = true
	}

	function initAnimation(): void {
		const animation = localStorage.getItem(LocalStorageKeys.PlatformAnimation)
		if (!animation || !isValidEnumValue(animation, PlatformAnimationMode)) return

		_ref_root.setAttribute(RootAttributes.Animation, animation)
		const ref_previous = $$(
			`input[name="${CSS.escape(RadioGroupNames.settingsAnimation)}"]:checked`
		) as HTMLInputElement
		const ref_target = $$(
			`input[name="${CSS.escape(RadioGroupNames.settingsAnimation)}"][value="${CSS.escape(animation)}"]`
		) as HTMLInputElement

		if (ref_previous === ref_target) return
		if (ref_previous) ref_previous.checked = false
		if (ref_target) ref_target.checked = true
	}

	function initAccentColor(): void {
		const accent = localStorage.getItem(LocalStorageKeys.PlatformAccentColor)
		if (!accent || !isColorValid(accent)) return

		const rgbToCSS = (rgb: RGBColor) => `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
		const palette = generateColorPalette(accent as HEXColor)
		_ref_accentColor.innerHTML = `:root{--g-color-accent-light: ${rgbToCSS(hexToRgb(palette.color))};--g-color-accent-dark: ${rgbToCSS(hexToRgb(palette.colorDark))};--g-color-on-accent-light: ${rgbToCSS(hexToRgb(palette.onColor))};--g-color-on-accent-dark: ${rgbToCSS(hexToRgb(palette.onColorDark))};}`;
		CColorPicker.update(_ref_colorPicker, {ColorPicker: {value: accent as HEXColor}})
	}

	initTheme()
	initAnimation()
	initAccentColor()
}

function _initEvents(): void {
	_ref_menu.addEventListener('click', () => {
		switch (document.activeElement) {
		case _ref_accentBtn:
			_ref_menu.hidePopover()
			break
		}
	})

	_ref_menu.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.CIcon.update(_ref_btn, {
			Button: { focused: isOpen }
		})
	})

	_ref_animationMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) return

		localStorage.setItem(LocalStorageKeys.PlatformAnimation, value)
		_ref_root.setAttribute(RootAttributes.Animation, value)
		_ref_menu.hidePopover()
	})

	_ref_themeMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !isValidEnumValue(value, PlatformThemeMode)) return

		localStorage.setItem(LocalStorageKeys.PlatformTheme, value)
		_ref_root.setAttribute(RootAttributes.Theme, value)
		_ref_menu.hidePopover()
	})

	_ref_colorPicker.addEventListener(CColorPicker.Events.Input, () => {
		if (_time_accent !== null) clearTimeout(_time_accent)

		_time_accent = setTimeout(() => {
			const accent = CColorPicker.getValue(_ref_colorPicker)! as HEXColor
			const palette = generateColorPalette(accent)
			_ref_accentColor.innerHTML = `:root{--g-color-accent-light: ${_rgbToCSS(hexToRgb(palette.color))};--g-color-accent-dark: ${_rgbToCSS(hexToRgb(palette.colorDark))};--g-color-on-accent-light: ${_rgbToCSS(hexToRgb(palette.onColor))};--g-color-on-accent-dark: ${_rgbToCSS(hexToRgb(palette.onColorDark))};}`;
			localStorage.setItem(LocalStorageKeys.PlatformAccentColor, accent)
		}, 50)
	})
}

export default () => {
	_initSettings()
	_initEvents()
}