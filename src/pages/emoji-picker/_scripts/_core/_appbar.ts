import { ButtonVariant, updateIconButtonRef, type IconButtonElement } from "@/components/Button"
import { APP_EMOJI_PICKER as app } from "@/constants/apps"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { SideBarAttributes, updateSideBarRef } from "@/components/SideBar"
import { SCREEN_WIDTH_SMALL } from "../_shared/_constant"
import type { PopoverElement } from "@/components/Popover"

const _infoMenuRef = $(ElementIds.apInf_menu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.apInf_btn) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.apSett_btn) as HTMLButtonElement
const _shareButtonRef = $(ElementIds.apInf_shareBtn) as HTMLButtonElement
const _sideBarButtonRef = $(ElementIds.ap_sideBarBtn) as HTMLButtonElement
const _sideBarRef = $(ElementIds.navigationSideBar) as HTMLDivElement
const _drawerRef = $(ElementIds.navigationDrawer) as HTMLDivElement
const _searchButtonRef = $(ElementIds.apSrc_btn) as IconButtonElement
const _searchPopoverRef = $(ElementIds.apSrc_popover) as PopoverElement

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