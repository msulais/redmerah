import { updateIconButtonRef } from "@/native-components/Button"
import { elementValidTarget } from "@/utils/element"
import { ID, ElementIds, RadioGroupNames } from "./_enums"
import { LocalStorageKeys } from "@/enums/storage"
import { validEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { APP_BATTERY as APP } from "@/constants/apps"

const $ = (id: string) => document.getElementById(id)
const $$ = (selector: string, from = document) => from.querySelector(selector)
const rootRef = document.documentElement
const appbarInfoButtonRef = $(ID + ElementIds.appbarInfoButton) as HTMLButtonElement
const appbarInfoMenuShareButtonRef = $(ID + ElementIds.appbarInfoMenuShareButton) as HTMLButtonElement
const appbarInfoMenuRef = $(ID + ElementIds.appbarInfoMenu) as HTMLDivElement
const appbarSettingsButtonRef = $(ID + ElementIds.appbarSettingsButton) as HTMLButtonElement
const appbarSettingsMenuRef = $(ID + ElementIds.appbarSettingsMenu) as HTMLDivElement
const appbarSettingsThemeMenuRef = $(ID + ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
const appbarSettingsAnimationMenuRef = $(ID + ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement

function initSettings(): void {
	function initTheme(): void {
		const theme = localStorage.getItem(LocalStorageKeys.platformTheme)
		if (!theme || !validEnumValue(theme, PlatformThemeMode)) return

		rootRef.setAttribute(RootAttributes.theme, theme)
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

		rootRef.setAttribute(RootAttributes.animation, animation)
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

	initTheme()
	initAnimation()
}

function initSettingsMenu(): void {
	appbarSettingsMenuRef.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		appbarSettingsButtonRef.setAttribute('aria-expanded', String(isOpen))
		updateIconButtonRef(appbarSettingsButtonRef, {
			ButtonFocused: isOpen
		})
	})

	appbarSettingsAnimationMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformAnimationMode)) return

		localStorage.setItem(LocalStorageKeys.platformAnimation, value)
		rootRef.setAttribute(RootAttributes.animation, value)
		appbarSettingsMenuRef.hidePopover()
	})

	appbarSettingsThemeMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformThemeMode)) return

		localStorage.setItem(LocalStorageKeys.platformTheme, value)
		rootRef.setAttribute(RootAttributes.theme, value)
		appbarSettingsMenuRef.hidePopover()
	})
}

function initInfoMenu(): void {
	appbarInfoMenuRef.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		appbarInfoButtonRef.setAttribute('aria-expanded', String(isOpen))
		updateIconButtonRef(appbarInfoButtonRef, {
			ButtonFocused: isOpen
		})
	})

	appbarInfoMenuRef.addEventListener('click', () => {
		const button = document.activeElement as HTMLElement
		if (!elementValidTarget(appbarInfoMenuRef, button, el => el.tagName === 'BUTTON')) return

		switch (button) {
		case appbarInfoMenuShareButtonRef:
			navigator.share({
				title: APP.name,
				url: document.URL,
				text: APP.name
			})
			appbarInfoMenuRef.hidePopover()
		}
	})
}

const _ = () => {
	initSettings()
	initSettingsMenu()
	initInfoMenu()
}

export default _