import { CButton } from "@/components/Button"
import { ElementIds } from "../shared/ids"
import { $ } from "./utils"
import { APP } from "../shared/constant"

// inf = info
const _ref_inf_menu = $(ElementIds.apInf_menu) as HTMLDivElement
const _ref_inf_button = $(ElementIds.apInf_btn) as CButton.CElement
const _ref_inf_shareButton = $(ElementIds.apInf_shareBtn) as CButton.CElement

// sett = settings
const _ref_sett_menu = $(ElementIds.apSett_menu) as HTMLDivElement
const _ref_sett_button = $(ElementIds.apSett_button) as CButton.CElement

function _initEvents(): void {
	_ref_inf_shareButton.addEventListener('click', () => {
		_ref_inf_menu.hidePopover()
		navigator.share({
			text: APP.name,
			url: document.URL
		})
	})

	_ref_inf_menu.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.CIcon.update(_ref_inf_button, {Button: {focused: isOpen}})
	})

	_ref_sett_menu.addEventListener('beforetoggle', ev => {
		const isOpen = (ev as ToggleEvent).newState === 'open'
		CButton.CIcon.update(_ref_sett_button, {Button: {focused: isOpen}})
	})
}

export default () => {
	_initEvents()
}