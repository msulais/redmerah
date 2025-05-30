import { updateIconButtonRef } from "@/native-components/Button"
import { elementValidTarget } from "@/utils/element"
import { ElementIds, RadioGroupNames } from "./_enums"
import { LocalStorageKeys } from "@/enums/storage"
import { validEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { APP_BATTERY as APP } from "@/constants/apps"

const $ = (id: string) => document.getElementById(id)
const $$ = (selector: string, from = document) => from.querySelector(selector)
const _rootRef = document.documentElement
const _infoButtonRef = $(ElementIds.appbarInfoButton) as HTMLButtonElement
const _infoMenuShareButtonRef = $(ElementIds.appbarInfoMenuShareButton) as HTMLButtonElement
const _infoMenuRef = $(ElementIds.appbarInfoMenu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.appbarSettingsButton) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.appbarSettingsMenu) as HTMLDivElement
const _settingsThemeMenuRef = $(ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
const _settingsAnimationMenuRef = $(ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement

function _initSettings(): void {
	function initTheme(): void {
		const theme = localStorage.getItem(LocalStorageKeys.platformTheme)
		if (!theme || !validEnumValue(theme, PlatformThemeMode)) return

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
		if (!animation || !validEnumValue(animation, PlatformAnimationMode)) return

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

	initTheme()
	initAnimation()
}

function _initEvents(): void {
	_infoMenuRef.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_infoButtonRef, {
			ButtonFocused: isOpen
		})
	})

	_infoMenuRef.addEventListener('click', () => {
		const button = document.activeElement as HTMLElement
		if (!elementValidTarget(_infoMenuRef, button, el => el.tagName === 'BUTTON')) return

		switch (button) {
		case _infoMenuShareButtonRef:
			navigator.share({
				title: APP.name,
				url: document.URL,
				text: APP.name
			})
			_infoMenuRef.hidePopover()
		}
	})
	_settingsMenuRef.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_settingsButtonRef, {
			ButtonFocused: isOpen
		})
	})

	_settingsAnimationMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformAnimationMode)) return

		localStorage.setItem(LocalStorageKeys.platformAnimation, value)
		_rootRef.setAttribute(RootAttributes.animation, value)
		_settingsMenuRef.hidePopover()
	})

	_settingsThemeMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformThemeMode)) return

		localStorage.setItem(LocalStorageKeys.platformTheme, value)
		_rootRef.setAttribute(RootAttributes.theme, value)
		_settingsMenuRef.hidePopover()
	})
}

const _ = () => {
	_initSettings()
	_initEvents()
}

export default _