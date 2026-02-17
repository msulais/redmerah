import { stringToHash } from "@/utils/string"
import { APP } from "./constant"

let _ID_INDEX = 0

const idPrefix = 'ID' + stringToHash(APP.link)
function _createId(): string {
	return idPrefix + (++_ID_INDEX)
}

export const ElementIds = {
	appbar: _createId(),

	// apInf: appbar info
	apInf_btn: _createId(),
	apInf_menu: _createId(),
	apInf_shareBtn: _createId(),

	// apSet: appbar settings
	apSett_button: _createId(),
	apSett_menu: _createId(),
	apSett_animationMenu: _createId(),
	apSett_themeMenu: _createId(),

	// bd: body
	bd_container: _createId(),
	bd_levelText: _createId(),
	bd_statusText: _createId(),

	// dlg: dialog
	dlg_browseNotSupported: _createId(),
}