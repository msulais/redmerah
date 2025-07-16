import { updateIconButtonRef } from "@/components/Button"
import { APP_CALCULATOR as app } from "@/constants/apps"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { SCREEN_WIDTH_SMALL } from "../_shared/_constant"
import { SideBarAttributes, updateSideBarRef } from "@/components/SideBar"

// inf = info
const _inf_menuRef = $(ElementIds.apInf_menu) as HTMLDivElement
const _inf_btnRef = $(ElementIds.apInf_btn) as HTMLButtonElement

// sett = settings
const _sett_menuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _sett_btnRef = $(ElementIds.apSett_btn) as HTMLButtonElement

const _sideBarBtnRef = $(ElementIds.ap_sideBarBtn) as HTMLButtonElement
const _sideBarRef = $(ElementIds.nav_sideBar) as HTMLDivElement
const _drawerRef = $(ElementIds.nav_drawer) as HTMLDivElement
const _shareBtnRef = $(ElementIds.apInf_shareBtn) as HTMLButtonElement

function _initEvents(): void {
	_inf_menuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_inf_btnRef, {
			ButtonFocused: isOpen
		})
	})

	_sett_menuRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_sett_btnRef, {
			ButtonFocused: isOpen
		})
	})

	_shareBtnRef.addEventListener('click', () => {
		_inf_menuRef.hidePopover()
		navigator.share({
			text: app.name,
			url: document.URL
		})
	})

	_sideBarBtnRef.addEventListener('click', () => {
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