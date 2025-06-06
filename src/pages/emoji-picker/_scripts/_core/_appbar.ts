import { ButtonVariant, updateIconButtonRef, type IconButtonElement } from "@/native-components/Button"
import { APP_CLOCK as app } from "@/constants/apps"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { SideBarAttributes, updateSideBarRef } from "@/native-components/SideBar"
import { SCREEN_WIDTH_SMALL } from "../_shared/_constant"
import type { PopoverElement } from "@/native-components/Popover"

const _infoMenuRef = $(ElementIds.appbarInfoMenu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.appbarInfoButton) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.appbarSettingsMenu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.appbarSettingsButton) as HTMLButtonElement
const _shareButtonRef = $(ElementIds.appbarInfoMenuShareButton) as HTMLButtonElement
const _sideBarButtonRef = $(ElementIds.appbarSideBarButton) as HTMLButtonElement
const _sideBarRef = $(ElementIds.navigationSideBar) as HTMLDivElement
const _drawerRef = $(ElementIds.navigationDrawer) as HTMLDivElement
const _searchButtonRef = $(ElementIds.appbarSearchButton) as IconButtonElement
const _searchPopoverRef = $(ElementIds.appbarSearchPopover) as PopoverElement

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

	_searchPopoverRef.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		updateIconButtonRef(_searchButtonRef, {
			ButtonVariant: isOpen? ButtonVariant.filled : ButtonVariant.transparent
		})
	})
}

export default () => {
	_initEvents()
}