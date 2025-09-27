import { CButton } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { CDrawer } from "@/components/Drawer"
import { APP } from "../_shared/_constant"

const _ref_infoMenu = $(ElementIds.apInf_menu) as HTMLDivElement
const _ref_infoBtn = $(ElementIds.apInf_btn) as CButton.CElement
const _ref_settingsMenu = $(ElementIds.apSett_menu) as HTMLDivElement
const _ref_settingsBtn = $(ElementIds.apSett_btn) as CButton.CElement
const _ref_sideBarBtn = $(ElementIds.ap_openDrawerBtn) as CButton.CElement
const _ref_shareButton = $(ElementIds.apInf_shareBtn) as CButton.CElement
const _ref_drawerBtn = $(ElementIds.nav_drawer) as CDrawer.CElement

function _initEvents(): void {
	_ref_shareButton.addEventListener('click', () => {
		_ref_infoMenu.hidePopover()
		navigator.share({
			text: APP.name,
			url: document.URL
		})
	})

	_ref_infoMenu.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.CIcon.update(_ref_infoBtn, {
			Button: {focused: isOpen}
		})
	})

	_ref_settingsMenu.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.CIcon.update(_ref_settingsBtn, {
			Button: {focused: isOpen}
		})
	})

	_ref_sideBarBtn.addEventListener('click', () => {
		_ref_drawerBtn.togglePopover()
	})
}

export default () => {
	_initEvents()
}