import { updateIconButtonRef } from "@/native-components/Button"
import { APP_CLOCK as app } from "@/constants/apps"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"

// inf = info
const _inf_menuRef = $(ElementIds.apInf_menu) as HTMLDivElement
const _inf_buttonRef = $(ElementIds.apInf_btn) as HTMLButtonElement
const _inf_shareButtonRef = $(ElementIds.apInf_shareBtn) as HTMLButtonElement

// sett = settings
const _sett_menuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _sett_buttonRef = $(ElementIds.apSett_button) as HTMLButtonElement

function _initEvents(): void {
	_inf_shareButtonRef.addEventListener('click', () => {
		_inf_menuRef.hidePopover()
		navigator.share({
			text: app.name,
			url: document.URL
		})
	})

	_inf_menuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_inf_buttonRef, {
			ButtonFocused: isOpen
		})
	})

	_sett_menuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_sett_buttonRef, {
			ButtonFocused: isOpen
		})
	})
}

export default () => {
	_initEvents()
}