import { updateIconButtonRef } from "@/native-components/Button"
import { APP_CLOCK as app } from "@/constants/apps"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { SCREEN_WIDTH_SMALL } from "../_shared/_constant"
import { SideBarAttributes, updateSideBarRef } from "@/native-components/SideBar"

const _infoMenuRef = $(ElementIds.appbarInfoMenu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.appbarInfoButton) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.appbarSettingsMenu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.appbarSettingsButton) as HTMLButtonElement
const _sideBarButtonRef = $(ElementIds.appbarSideBarButton) as HTMLButtonElement
const _sideBarRef = $(ElementIds.navigationSideBar) as HTMLDivElement
const _drawerRef = $(ElementIds.navigationDrawer) as HTMLDivElement
const _shareButtonRef = $(ElementIds.appbarInfoMenuShareButton) as HTMLButtonElement

function _initMenuEvents(): void {
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

function _initSideBarButtonEvents(): void {
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

function _initShareButtonEvents(): void {
	_shareButtonRef.addEventListener('click', () => {
		_infoMenuRef.hidePopover()
		navigator.share({
			text: app.name,
			url: document.URL
		})
	})
}

export default () => {
	_initMenuEvents()
	_initSideBarButtonEvents()
	_initShareButtonEvents()
}