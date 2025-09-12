import { updateIconButtonRef } from "@/components/Button"
import { APP_CLOCK as app } from "@/constants/apps"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { SCREEN_WIDTH_SMALL } from "../_shared/_constant"
import { SideBarAttributes, updateSideBarRef } from "@/components/SideBar"

const _infoMenuRef = $(ElementIds.apInf_menu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.apInf_btn) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.apSett_btn) as HTMLButtonElement
const _sideBarButtonRef = $(ElementIds.ap_sideBarBtn) as HTMLButtonElement
const _sideBarRef = $(ElementIds.nav_sideBar) as HTMLDivElement
const _drawerRef = $(ElementIds.nav_drawer) as HTMLDivElement
const _shareButtonRef = $(ElementIds.apInf_shareBtn) as HTMLButtonElement

function _initEvents(): void {
	_shareButtonRef.addEventListener('click', () => {
		_infoMenuRef.hidePopover()
		navigator.share({
			text: app.name,
			url: document.URL
		})
	})

	_sideBarButtonRef.addEventListener('click', () => {
		if (window.matchMedia(`(max-width: ${SCREEN_WIDTH_SMALL}rem)`).matches) {
			_drawerRef.togglePopover()
			return
		}

		updateSideBarRef(_sideBarRef, {
			SideBarMinimized: !_sideBarRef.hasAttribute(SideBarAttributes.minimized)
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