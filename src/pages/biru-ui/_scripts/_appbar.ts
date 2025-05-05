import { updateButtonRef } from "@/native-components/Button"
import { closeMenuRef } from "@/native-components/Menu"
import { ID, ElementIds, RadioGroupNames } from "./_enums"
import { LocalStorageKeys } from "@/enums/storage"
import { validEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ColorPickerAttributes, ColorPickerEvents, openColorPickerRef, updateColorPickerRef } from "@/native-components/ColorPicker"
import { colorGeneratePalette, colorHexToRgb, colorIsValid } from "@/utils/color"
import type { HEXColor, RGBColor } from "@/types/color"
import { GlobalElementIds } from "@/enums/ids"

const $ = (id: string) => document.getElementById(id)
const $$ = (selector: string, from = document) => from.querySelector(selector)
const root = document.documentElement
const infoButton = $(ID + ElementIds.appbarInfoButton) as HTMLButtonElement
const shareButton = $(ID + ElementIds.appbarInfoShareButton) as HTMLButtonElement
const infoMenu = $(ID + ElementIds.appbarInfoMenu) as HTMLDivElement
const settingsButton = $(ID + ElementIds.appbarSettingsButton) as HTMLButtonElement
const settingsMenu = $(ID + ElementIds.appbarSettingsMenu) as HTMLDivElement
const settingsThemeMenu = $(ID + ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
const settingsAnimationMenu = $(ID + ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement

function initSettingsMenu(): void {
	const rgbToCSS = (rgb: RGBColor) => `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
	const accentButtonRef = $(ID + ElementIds.appbarSettingsAccentButton) as HTMLButtonElement
	const colorPickerRef = $(ID + ElementIds.appbarColorPicker) as HTMLDivElement
	const accentColorElement = $(GlobalElementIds.colorAccent) as HTMLStyleElement
	let timeAccentId: number | NodeJS.Timeout | null = null

	settingsMenu.addEventListener('click', () => {
		switch (document.activeElement) {
		case accentButtonRef:
			openColorPickerRef(colorPickerRef)
			closeMenuRef(settingsMenu)
			break
		}
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

function initSettingsAnimationMenuEvents(): void {
	settingsAnimationMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformAnimationMode)) return

		localStorage.setItem(LocalStorageKeys.platformAnimation, value)
		root.setAttribute(RootAttributes.animation, value)
		closeMenuRef(settingsMenu)
	})
}

function initSettingsThemeMenuEvents(): void {
	settingsThemeMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformThemeMode)) return

		localStorage.setItem(LocalStorageKeys.platformTheme, value)
		root.setAttribute(RootAttributes.theme, value)
		closeMenuRef(settingsMenu)
	})
}

function initInfoMenuEvents(): void {
	shareButton.addEventListener('click', () => {
		navigator.share({
			title: 'BiruUI',
			url: document.URL,
			text: 'BiruUI'
		})
		closeMenuRef(infoMenu)
	})
}

function initGlobalMenuEvents(): void {
	settingsMenu.addEventListener('toggle', ev => {
		const open = (ev as ToggleEvent).newState === 'open'
		settingsButton.setAttribute('aria-expanded', String(open))
		updateButtonRef(settingsButton, {
			ButtonFocused: open
		})
	})

	infoMenu.addEventListener('toggle', ev => {
		const open = (ev as ToggleEvent).newState === 'open'
		infoButton.setAttribute('aria-expanded', String(open))
		updateButtonRef(infoButton, {
			ButtonFocused: open
		})
	})
}

const _ = () => {
	initGlobalMenuEvents()
	initInfoMenuEvents()
	initSettings()
	initSettingsAnimationMenuEvents()
	initSettingsThemeMenuEvents()
	initSettingsMenu()
}

export default _