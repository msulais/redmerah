import { ElementIds, ID, RadioGroupNames } from "./_enums"
import { updateIconButtonRef } from "@/native-components/Button"
import { isValidEnumValue } from "@/utils/object"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { LocalStorageKeys } from "@/enums/storage"
import { RootAttributes } from "@/enums/attributes"
import { generateColorPalette, hexToRgb, isColorValid } from "@/utils/color"
import { GlobalElementIds } from "@/enums/ids"
import { ColorPickerAttributes, ColorPickerEvents, updateColorPickerRef } from "@/native-components/ColorPicker"
import type { RGBColor, HEXColor } from "@/types/color"

const $ = (id: string) => document.getElementById(id)
const $$ = (selector: string, from = document) => from.querySelector(selector)
const _rootRef = document.documentElement

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
		const colorPickerRef = $(ID + ElementIds.appbarColorPicker) as HTMLDivElement
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

function _initSettingsMenu(): void {
	const rgbToCSS = (rgb: RGBColor) => `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
	const buttonRef = $(ID + ElementIds.appbarSettingsButton) as HTMLButtonElement
	const menuRef = $(ID + ElementIds.appbarSettingsMenu) as HTMLDivElement
	const animationMenuRef = $(ID + ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement
	const themeMenuRef = $(ID + ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
	const colorPickerRef = $(ID + ElementIds.appbarColorPicker) as HTMLDivElement
	const accentButtonRef = $(ID + ElementIds.appbarSettingsAccentButton) as HTMLButtonElement
	const accentColorElement = $(GlobalElementIds.colorAccent) as HTMLStyleElement
	let timeAccentId: number | NodeJS.Timeout | null = null

	menuRef.addEventListener('click', () => {
		switch (document.activeElement) {
		case accentButtonRef:
			menuRef.hidePopover()
			break
		}
	})

	menuRef.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(buttonRef, {
			ButtonFocused: isOpen
		})
	})

	animationMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !isValidEnumValue(value, PlatformAnimationMode)) return

		localStorage.setItem(LocalStorageKeys.platformAnimation, value)
		_rootRef.setAttribute(RootAttributes.animation, value)
		menuRef.hidePopover()
	})

	themeMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !isValidEnumValue(value, PlatformThemeMode)) return

		localStorage.setItem(LocalStorageKeys.platformTheme, value)
		_rootRef.setAttribute(RootAttributes.theme, value)
		menuRef.hidePopover()
	})

	colorPickerRef.addEventListener(ColorPickerEvents.input, () => {
		if (timeAccentId !== null) clearTimeout(timeAccentId)

		timeAccentId = setTimeout(() => {
			const accent = colorPickerRef.getAttribute(ColorPickerAttributes.value)! as HEXColor
			const palette = generateColorPalette(accent)
			accentColorElement.innerHTML = `:root{--g-color-accent-light: ${rgbToCSS(hexToRgb(palette.color))};--g-color-accent-dark: ${rgbToCSS(hexToRgb(palette.colorDark))};--g-color-on-accent-light: ${rgbToCSS(hexToRgb(palette.onColor))};--g-color-on-accent-dark: ${rgbToCSS(hexToRgb(palette.onColorDark))};}`;
			localStorage.setItem(LocalStorageKeys.platformAccentColor, accent)
		}, 50)
	})
}

export default () => {
	_initSettings()
	_initSettingsMenu()
}