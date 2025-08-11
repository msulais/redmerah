import { updateIconButtonRef } from "@/components/Button"
import { APP_VIBRATOR as app } from "@/constants/apps"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import type { MenuItemElement } from "@/components/Menu"
import type { DialogElement } from "@/components/Dialog"

const _infoMenuRef = $(ElementIds.apInf_menu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.apInf_btn) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.apSett_button) as HTMLButtonElement
const _shareButtonRef = $(ElementIds.apInf_shareBtn) as HTMLButtonElement
const _helpBtnRef = $(ElementIds.apInf_help) as MenuItemElement
const _helpDialogRef = $(ElementIds.apInf_helpDialog) as DialogElement

function _initEvents(): void {
	_helpBtnRef.addEventListener('click', () => {
		_helpDialogRef.showModal()
	})

	_shareButtonRef.addEventListener('click', () => {
		_infoMenuRef.hidePopover()
		navigator.share({
			text: app.name,
			url: document.URL
		})
	})

	_infoMenuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_infoButtonRef, {
			ButtonFocused: isOpen
		})
	})

	_settingsMenuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_settingsButtonRef, {
			ButtonFocused: isOpen
		})
	})
}

export default () => {
	_initEvents()
}