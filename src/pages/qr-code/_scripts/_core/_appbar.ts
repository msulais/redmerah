import { updateIconButtonRef } from "@/native-components/Button"
import { APP_CLOCK as app } from "@/constants/apps"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { SideBarAttributes, updateSideBarRef, type SideBarElement } from "@/native-components/SideBar"
import type { DrawerElement } from "@/native-components/Drawer"
import { SCREEN_WIDTH_SMALL } from "../_shared/_constant"

const _infoMenuRef = $(ElementIds.apInf_menu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.apInf_btn) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.apSett_btn) as HTMLButtonElement
const _sideBarButtonRef = $(ElementIds.ap_sideBarBtn) as HTMLButtonElement
const _shareButtonRef = $(ElementIds.apInf_shareBtn) as HTMLButtonElement
const _sideBarRef = $(ElementIds.nav_sideBar) as SideBarElement<HTMLDivElement>
const _drawerRef = $(ElementIds.nav_drawer) as DrawerElement

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

	_settingsMenuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_settingsButtonRef, {
			ButtonFocused: isOpen
		})
	})

	_sideBarButtonRef.addEventListener('click', () => {
		if (window.matchMedia(`(max-width: ${SCREEN_WIDTH_SMALL}px)`).matches) {
			_drawerRef.togglePopover()
			return
		}

		updateSideBarRef(_sideBarRef, {
			SideBarMinimized: !_sideBarRef.hasAttribute(SideBarAttributes.minimized)
		})
	})
}

export default () => {
	_initEvents()
}