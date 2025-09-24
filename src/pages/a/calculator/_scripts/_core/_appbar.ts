import { CButton } from "@/components/Button"
import { $ } from "./_dom-utils"
import { ElementIds } from "../_shared/_ids"
import { APP } from "../_shared/_constant"

// inf = info
const _ref_inf_menu = $(ElementIds.apInf_menu) as HTMLDivElement
const _ref_inf_btn = $(ElementIds.apInf_btn) as CButton.CElement

// sett = settings
const _ref_sett_menu = $(ElementIds.apSett_menu) as HTMLDivElement
const _ref_sett_btn = $(ElementIds.apSett_btn) as CButton.CElement

const _ref_sideBarBtn = $(ElementIds.ap_openDrawerBtn) as CButton.CElement
const _ref_drawerBtn = $(ElementIds.nav_drawer) as HTMLDivElement
const _ref_shareBtn = $(ElementIds.apInf_shareBtn) as CButton.CElement

function _initEvents(): void {
	_ref_inf_menu.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.CIcon.update(_ref_inf_btn, {
			Button: {focused: isOpen}
		})
	})

	_ref_sett_menu.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.CIcon.update(_ref_sett_btn, {
			Button: {focused: isOpen}
		})
	})

	_ref_shareBtn.addEventListener('click', () => {
		_ref_inf_menu.hidePopover()
		navigator.share({
			text: APP.name,
			url: document.URL
		})
	})

	_ref_sideBarBtn.addEventListener('click', () => {
		_ref_drawerBtn.togglePopover()
	})
}

export default () => {
	_initEvents()
}