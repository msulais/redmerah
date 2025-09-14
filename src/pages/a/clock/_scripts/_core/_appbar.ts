import { updateIconButtonRef } from "@/components/Button"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { APP } from "../_shared/_constant"

const _infoMenuRef = $(ElementIds.apInf_menu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.apInf_btn) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.apSett_btn) as HTMLButtonElement
const _sideBarButtonRef = $(ElementIds.ap_openDrawerBtn) as HTMLButtonElement
const _drawerRef = $(ElementIds.nav_drawer) as HTMLDivElement
const _shareButtonRef = $(ElementIds.apInf_shareBtn) as HTMLButtonElement

function _initEvents(): void {
	_shareButtonRef.addEventListener('click', () => {
		_infoMenuRef.hidePopover()
		navigator.share({
			text: APP.name,
			url: document.URL
		})
	})

	_sideBarButtonRef.addEventListener('click', () => {
		_drawerRef.togglePopover()
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