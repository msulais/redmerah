import { openPopoverRef } from "@/native-components/Popover"
import { updateButtonRef } from "@/native-components/Button"
import { closeMenuRef, MenuEvents } from "@/native-components/Menu"
import type { PopoverToggleOpenDetail } from "@/native-components/Popover"
import { elementValidTarget } from "@/utils/element"
import { ELEMENT_ID_PREFIX, ElementIds, RadioGroupNames } from "./_enums"
import { LocalStorageKeys } from "@/enums/storage"
import { validEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { ColorPickerAttributes, ColorPickerEvents, ColorPickerPosition, openColorPickerRef, updateColorPickerRef } from "@/native-components/ColorPicker"
import { colorGeneratePalette, colorHexToRgb, colorIsValid } from "@/utils/color"
import type { HEXColor, RGBColor } from "@/types/color"
import { GlobalElementIds } from "@/enums/ids"

const $ = (id: string) => document.getElementById(id)
const $$ = (selector: string, from = document) => from.querySelector(selector)
const root = document.documentElement
const appbar = $(ELEMENT_ID_PREFIX + ElementIds.appbar) as HTMLElement
const infoButton = $(ELEMENT_ID_PREFIX + ElementIds.appbarInfoButton) as HTMLButtonElement
const shareButton = $(ELEMENT_ID_PREFIX + ElementIds.appbarInfoShareButton) as HTMLButtonElement
const infoMenu = $(ELEMENT_ID_PREFIX + ElementIds.appbarInfoMenu) as HTMLDivElement
const settingsButton = $(ELEMENT_ID_PREFIX + ElementIds.appbarSettingsButton) as HTMLButtonElement
const settingsMenu = $(ELEMENT_ID_PREFIX + ElementIds.appbarSettingsMenu) as HTMLDivElement
const settingsThemeMenu = $(ELEMENT_ID_PREFIX + ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
const settingsAnimationMenu = $(ELEMENT_ID_PREFIX + ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement

function initSettingsMenu(): void {
	const rgbToCSS = (rgb: RGBColor) => `${Math.round(rgb.r * 0xff)}, ${Math.round(rgb.g * 0xff)}, ${Math.round(rgb.b * 0xff)}`
	const accentButtonRef = $(ELEMENT_ID_PREFIX + ElementIds.appbarSettingsAccentButton) as HTMLButtonElement
	const colorPickerRef = $(ELEMENT_ID_PREFIX + ElementIds.appbarColorPicker) as HTMLDivElement
	const accentColorElement = $(GlobalElementIds.colorAccent) as HTMLStyleElement
	let timeAccentId: number | NodeJS.Timeout | null = null

	settingsMenu.addEventListener('click', () => {
		switch (document.activeElement) {
		case accentButtonRef:
			openColorPickerRef(colorPickerRef, {
				anchor: document.body,
				position: ColorPickerPosition.centerCenterRightTop
			}).then(() => closeMenuRef(settingsMenu))
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
		const colorPickerRef = $(ELEMENT_ID_PREFIX + ElementIds.appbarColorPicker) as HTMLDivElement
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

function initAppBarEvents(): void {
	appbar.addEventListener('click', () => {
		const button = document.activeElement
		if (!elementValidTarget(appbar, button, el => el.tagName === 'BUTTON')) return

		switch (button) {
		case settingsButton: return openPopoverRef(settingsMenu, {
			anchor: settingsButton
		})
		case infoButton: return openPopoverRef(infoMenu, {
			anchor: infoButton
		})
		}
	})
}

function initGlobalMenuEvents(): void {
	document.body.addEventListener(MenuEvents.toggleOpen, ev => {
		const open = (ev as CustomEvent<PopoverToggleOpenDetail>).detail.open
		const popover = ev.target as HTMLDivElement

		switch (popover) {
		case settingsMenu:
			settingsButton.setAttribute('aria-expanded', String(open))
			updateButtonRef(settingsButton, {
				ButtonFocused: open
			})
			break
		case infoMenu:
			infoButton.setAttribute('aria-expanded', String(open))
			updateButtonRef(infoButton, {
				ButtonFocused: open
			})
			break
		}
	})
}

const _ = () => {
	initAppBarEvents()
	initGlobalMenuEvents()
	initInfoMenuEvents()
	initSettings()
	initSettingsAnimationMenuEvents()
	initSettingsThemeMenuEvents()
	initSettingsMenu()
}

export default _