import { updateIconButtonRef } from "@/native-components/Button"
import { elementValidTarget } from "@/utils/element"
import { Commands, DecimalNumberFormat, ElementIds, GroupingNumberFormat, RadioGroupNames } from "./_enums"
import { LocalStorageKeys } from "@/enums/storage"
import { validEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import { APP_BATTERY as APP } from "@/constants/apps"
import { SideBarAttributes, updateSideBarRef } from "@/native-components/SideBar"
import { SCREEN_WIDTH_SMALL } from "./_constant"
import { command } from "./_utils"
import type { CommandChangeDecimalFormatDetail, CommandChangeGroupingFormatDetail } from "./_types"

const $ = (id: string) => document.getElementById(id)
const $$ = (selector: string, from = document) => from.querySelector(selector)
const _rootRef = document.documentElement
const _navigationSideBarRef = $(ElementIds.navigationSideBar) as HTMLDivElement
const _navigationDrawerRef = $(ElementIds.navigationDrawer) as HTMLDivElement
const _appbarSideBarButtonRef = $(ElementIds.appbarSideBarButton) as HTMLButtonElement
const _appbarInfoButtonRef = $(ElementIds.appbarInfoButton) as HTMLButtonElement
const _appbarInfoMenuShareButtonRef = $(ElementIds.appbarInfoMenuShareButton) as HTMLButtonElement
const _appbarInfoMenuRef = $(ElementIds.appbarInfoMenu) as HTMLDivElement
const _appbarSettingsButtonRef = $(ElementIds.appbarSettingsButton) as HTMLButtonElement
const _appbarSettingsMenuRef = $(ElementIds.appbarSettingsMenu) as HTMLDivElement
const _appbarSettingsThemeMenuRef = $(ElementIds.appbarSettingsThemeMenu) as HTMLDivElement
const _appbarSettingsAnimationMenuRef = $(ElementIds.appbarSettingsAnimationMenu) as HTMLDivElement
const _appbarSettingsDecimalMenuRef = $(ElementIds.appbarSettingsDecimalMenu) as HTMLDivElement
const _appbarSettingsGroupMenuRef = $(ElementIds.appbarSettingsGroupMenu) as HTMLDivElement

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

function _initSettingsMenu(): void {
	_appbarSettingsMenuRef.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		_appbarSettingsButtonRef.setAttribute('aria-expanded', String(isOpen))
		updateIconButtonRef(_appbarSettingsButtonRef, {
			ButtonFocused: isOpen
		})
	})

	_appbarSettingsDecimalMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, DecimalNumberFormat)) return

		command<CommandChangeDecimalFormatDetail>(Commands.changeDecimalFormat, {
			format: value as DecimalNumberFormat
		})
		_appbarSettingsMenuRef.hidePopover()
	})

	_appbarSettingsGroupMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, GroupingNumberFormat)) return

		command<CommandChangeGroupingFormatDetail>(Commands.changeGroupingFormat, {
			format: value as GroupingNumberFormat
		})
		_appbarSettingsMenuRef.hidePopover()
	})

	_appbarSettingsAnimationMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformAnimationMode)) return

		localStorage.setItem(LocalStorageKeys.platformAnimation, value)
		_rootRef.setAttribute(RootAttributes.animation, value)
		_appbarSettingsMenuRef.hidePopover()
	})

	_appbarSettingsThemeMenuRef.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformThemeMode)) return

		localStorage.setItem(LocalStorageKeys.platformTheme, value)
		_rootRef.setAttribute(RootAttributes.theme, value)
		_appbarSettingsMenuRef.hidePopover()
	})
}

function _initInfoMenu(): void {
	_appbarInfoMenuRef.addEventListener('toggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		_appbarInfoButtonRef.setAttribute('aria-expanded', String(isOpen))
		updateIconButtonRef(_appbarInfoButtonRef, {
			ButtonFocused: isOpen
		})
	})

	_appbarInfoMenuRef.addEventListener('click', () => {
		const button = document.activeElement as HTMLElement
		if (!elementValidTarget(_appbarInfoMenuRef, button, el => el.tagName === 'BUTTON')) return

		switch (button) {
		case _appbarInfoMenuShareButtonRef:
			navigator.share({
				title: APP.name,
				url: document.URL,
				text: APP.name
			})
			_appbarInfoMenuRef.hidePopover()
		}
	})
}

function _initNavigation(): void {
	_appbarSideBarButtonRef.addEventListener('click', () => {
		if (window.matchMedia(`(max-width: ${SCREEN_WIDTH_SMALL}px)`).matches) {
			_navigationDrawerRef.togglePopover()
			return
		}

		updateSideBarRef(_navigationSideBarRef, {
			SideBarMinimized: !_navigationSideBarRef.hasAttribute(SideBarAttributes.minimized)
		})
	})
}

export default function _(): void {
	_initSettings()
	_initSettingsMenu()
	_initInfoMenu()
	_initNavigation()
}