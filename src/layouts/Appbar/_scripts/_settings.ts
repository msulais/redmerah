import { closeMenuRef, MenuEvents, openMenuRef, type MenuToggleOpenEventDetail } from "@/native-components/Menu"
import { ElementIds, ID, RadioGroupNames } from "./_enums"
import { updateIconButtonRef } from "@/native-components/Button"
import { validEnumValue } from "@/utils/object"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { LocalStorageKeys } from "@/enums/storage"
import { RootAttributes } from "@/enums/attributes"
import { colorGeneratePalette, colorHexToRgb, colorIsValid } from "@/utils/color"
import { GlobalElementIds } from "@/enums/ids"
import { ColorPickerAttributes, ColorPickerEvents, openColorPickerRef, updateColorPickerRef } from "@/native-components/ColorPicker"
import type { RGBColor, HEXColor } from "@/types/color"

const $ = (id: string) => document.getElementById(id)
const $$ = (selector: string, from = document) => from.querySelector(selector)
const root = document.documentElement

function initSettings(): void {
	function initTheme(): void {
		const theme = localStorage.getItem(LocalStorageKeys.platformTheme)
		if (!theme || !validEnumValue(theme, PlatformThemeMode)) return

		root.setAttribute(RootAttributes.theme, theme)
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
		if (!animation || !validEnumValue(animation, PlatformAnimationMode)) return

		root.setAttribute(RootAttributes.animation, animation)
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
		if (!accent || !colorIsValid(accent)) return

		const rgbToCSS = (rgb: RGBColor) => `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
		const accentColorElement = $(GlobalElementIds.colorAccent) as HTMLStyleElement
		const colorPickerRef = $(ID + ElementIds.appbarColorPicker) as HTMLDivElement
		const palette = colorGeneratePalette(accent as HEXColor)
		accentColorElement.innerHTML = `:root{--g-color-accent-light: ${rgbToCSS(colorHexToRgb(palette.color))};--g-color-accent-dark: ${rgbToCSS(colorHexToRgb(palette.colorDark))};--g-color-on-accent-light: ${rgbToCSS(colorHexToRgb(palette.onColor))};--g-color-on-accent-dark: ${rgbToCSS(colorHexToRgb(palette.onColorDark))};}`;
		updateColorPickerRef(colorPickerRef, {
			ColorPickerValue: accent as HEXColor
		})
	}

	initTheme()
	initAnimation()
	initAccentColor()
}

function initSettingsMenu(): void {const rgbToCSS = (rgb: RGBColor) => `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
	const buttonRef = $(ID + ElementIds.appbarSettingsButton) as HTMLButtonElement
	const menuRef = $(ID + ElementIds.appbarSettingsMenu) as HTMLDivElement
	const animationMenuRef = $(ID + ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement
	const themeMenuRef = $(ID + ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
	const colorPickerRef = $(ID + ElementIds.appbarColorPicker) as HTMLDivElement
	const accentButtonRef = $(ID + ElementIds.appbarSettingsAccentButton) as HTMLButtonElement
	const accentColorElement = $(GlobalElementIds.colorAccent) as HTMLStyleElement
	let timeAccentId: number | NodeJS.Timeout | null = null

	buttonRef.addEventListener('click', () => openMenuRef(menuRef, {
		anchor: buttonRef
	}))

	menuRef.addEventListener('click', () => {
		switch (document.activeElement) {
		case accentButtonRef:
			openColorPickerRef(colorPickerRef, {
				anchor: buttonRef,
			}).then(() => closeMenuRef(menuRef))
			break
		}
	})

	menuRef.addEventListener(MenuEvents.toggleOpen as any, (ev: CustomEvent<MenuToggleOpenEventDetail>) => {
		const isOpen = ev.detail.open
		buttonRef.setAttribute('aria-expanded', String(isOpen))
		updateIconButtonRef(buttonRef, {
			ButtonFocused: isOpen
		})
	})

	animationMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformAnimationMode)) return

		localStorage.setItem(LocalStorageKeys.platformAnimation, value)
		root.setAttribute(RootAttributes.animation, value)
		closeMenuRef(menuRef)
	})

	themeMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformThemeMode)) return

		localStorage.setItem(LocalStorageKeys.platformTheme, value)
		root.setAttribute(RootAttributes.theme, value)
		closeMenuRef(menuRef)
	})

	colorPickerRef.addEventListener(ColorPickerEvents.input, () => {
		if (timeAccentId !== null) clearTimeout(timeAccentId)

		timeAccentId = setTimeout(() => {
			const accent = colorPickerRef.getAttribute(ColorPickerAttributes.value)! as HEXColor
			const palette = colorGeneratePalette(accent)
			accentColorElement.innerHTML = `:root{--g-color-accent-light: ${rgbToCSS(colorHexToRgb(palette.color))};--g-color-accent-dark: ${rgbToCSS(colorHexToRgb(palette.colorDark))};--g-color-on-accent-light: ${rgbToCSS(colorHexToRgb(palette.onColor))};--g-color-on-accent-dark: ${rgbToCSS(colorHexToRgb(palette.onColorDark))};}`;
			localStorage.setItem(LocalStorageKeys.platformAccentColor, accent)
		}, 10)
	})
}

function _(): void {
	initSettings()
	initSettingsMenu()
}

export default _