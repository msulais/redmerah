import { updateIconButtonRef } from "@/native-components/Button"
import { APP_CLOCK as app } from "@/constants/apps"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { copyColorPalette } from "./_colors"

const _infoMenuRef = $(ElementIds.appbarInfoMenu) as HTMLDivElement
const _infoButtonRef = $(ElementIds.appbarInfoButton) as HTMLButtonElement
const _settingsMenuRef = $(ElementIds.appbarSettingsMenu) as HTMLDivElement
const _settingsButtonRef = $(ElementIds.appbarSettingsButton) as HTMLButtonElement
const _shareButtonRef = $(ElementIds.appbarInfoMenuShareButton) as HTMLButtonElement
const _copyButtonRef = $(ElementIds.appbarCopyButton) as HTMLButtonElement

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