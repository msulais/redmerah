import { updateIconButtonRef } from "@/components/Button"
import { APP_COLOR_GENERATOR as app } from "@/constants/apps"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { copyColorPalette } from "./_colors"

const _infoMenuRef = $(ElementIds.apInf_menu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.apInf_btn) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.apSett_menu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.apSett_btn) as HTMLButtonElement
const _shareButtonRef = $(ElementIds.apInf_shareBtn) as HTMLButtonElement
const _copyButtonRef = $(ElementIds.ap_copyBtn) as HTMLButtonElement

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

	_copyButtonRef.addEventListener('click', () => {
		copyColorPalette()
	})
}

export default () => {
	_initEvents()
}