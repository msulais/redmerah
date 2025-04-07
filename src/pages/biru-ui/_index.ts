import { openPopover, registerPopover, type PopoverToggleOpenDetail } from "@/native-components/Popover"
import { registerSelect } from "@/native-components/Select"
import { ElementIds } from "./_enums"
import { ButtonVariant, updateButton } from "@/native-components/Button"
import { MenuEvents } from "@/native-components/Menu"
import { AppBarClasses } from "@/native-components/AppBar"
import { elementValidTarget } from "@/utils/element"

function registerAllComponents(): void {
	registerPopover()
	registerSelect()
}

function buttonPanel(): void {
	const btn = document.getElementById(ElementIds.panel_buttons_preview) as HTMLButtonElement
	const selectVariant = document.getElementById(ElementIds.panel_buttons_options_variant)
	selectVariant?.addEventListener('change', ev => {
		const value = (ev.currentTarget as HTMLDivElement).dataset.value
		updateButton(btn, {
			variant: value as ButtonVariant
		})
	})
}

function panel(): void {
	buttonPanel()
}

function appBar(): void {
	const $ = (id: string) => document.getElementById(id)
	const appbar = document.querySelector('.' + AppBarClasses.appbar) as HTMLElement
	const infoButton = $(ElementIds.appbar_info_button) as HTMLButtonElement
	const infoMenu = $(ElementIds.appbar_info_menu) as HTMLDivElement
	const settingsButton = $(ElementIds.appbar_settings_button) as HTMLButtonElement
	const settingsMenu = $(ElementIds.appbar_settings_menu) as HTMLDivElement

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

	document.body.addEventListener(MenuEvents.toggleOpen, ev => {
		const open = (ev as CustomEvent<PopoverToggleOpenDetail>).detail.open
		const popover = ev.target as HTMLDivElement

		switch (popover) {
		case settingsMenu:
			settingsButton.setAttribute('aria-expanded', String(open))
			updateButton(settingsButton, {
				focused: open
			})
			break
		case infoMenu:
			infoButton.setAttribute('aria-expanded', String(open))
			updateButton(infoButton, {
				focused: open
			})
			break
		}
	})
}

function main(): void {
	registerAllComponents()
	panel()
	appBar()
}

main()