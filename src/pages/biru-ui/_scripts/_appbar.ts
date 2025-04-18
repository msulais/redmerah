import { openPopover } from "@/native-components/Popover"
import { updateButton } from "@/native-components/Button"
import { closeMenu, MenuEvents } from "@/native-components/Menu"
import type { PopoverToggleOpenDetail } from "@/native-components/Popover"
import { elementValidTarget } from "@/utils/element"
import { ELEMENT_ID_PREFIX, ElementIds, RadioGroupNames } from "./_enums"
import { LocalStorageKeys } from "@/enums/storage"
import { validEnumValue } from "@/utils/object"
import { RootAttributes } from "@/enums/attributes"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"

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

	initTheme()
	initAnimation()
}

function initSettingsAnimationMenuEvents(): void {
	settingsAnimationMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformAnimationMode)) return

		localStorage.setItem(LocalStorageKeys.platformAnimation, value)
		root.setAttribute(RootAttributes.animation, value)
		closeMenu(settingsMenu)
	})
}

function initSettingsThemeMenuEvents(): void {
	settingsThemeMenu.addEventListener('change', ev => {
		const target = ev.target as HTMLInputElement
		const value = target?.value
		if (!value || !validEnumValue(value, PlatformThemeMode)) return

		localStorage.setItem(LocalStorageKeys.platformTheme, value)
		root.setAttribute(RootAttributes.theme, value)
		closeMenu(settingsMenu)
	})
}

function initInfoMenuEvents(): void {
	shareButton.addEventListener('click', () => {
		navigator.share({
			title: 'BiruUI',
			url: document.URL,
			text: 'BiruUI'
		})
		closeMenu(infoMenu)
	})
}

function initAppBarEvents(): void {
	appbar.addEventListener('click', () => {
		const button = document.activeElement
		if (!elementValidTarget(appbar, button, el => el.tagName === 'BUTTON')) return

		switch (button) {
		case settingsButton: return openPopover(settingsMenu, {
			anchor: settingsButton
		})
		case infoButton: return openPopover(infoMenu, {
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
			updateButton(settingsButton, {
				ButtonFocused: open
			})
			break
		case infoMenu:
			infoButton.setAttribute('aria-expanded', String(open))
			updateButton(infoButton, {
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
}

export default _