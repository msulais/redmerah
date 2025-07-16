import { updateIconButtonRef } from "@/components/Button"
import { APP_CLOCK as app } from "@/constants/apps"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"

const _infoMenuRef = $(ElementIds.apInf_menu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.apInf_btn) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.apSett_btn) as HTMLButtonElement
const _shareButtonRef = $(ElementIds.apInf_shareBtn) as HTMLButtonElement
const _moreMenuRef = $(ElementIds.apMore_menu) as HTMLDivElement
const _moreButtonRef = $(ElementIds.apMore_btn) as HTMLButtonElement

function _initEvents(): void {
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

	_moreMenuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_moreButtonRef, {
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