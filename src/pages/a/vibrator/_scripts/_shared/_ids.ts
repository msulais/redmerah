import { stringToHash } from "@/utils/string"
import { APP } from "./_constant"

let _ID_INDEX = 0

const idPrefix = stringToHash(APP.link)
function _createId(): string {
	return idPrefix + (++_ID_INDEX)
}

export class ElementIds {
	static readonly appbar = _createId()

	// apInf = appbar info
	static readonly apInf_btn = _createId()
	static readonly apInf_menu = _createId()
	static readonly apInf_shareBtn = _createId()
	static readonly apInf_help = _createId()
	static readonly apInf_helpDialog = _createId()

	// apSett = appbar settings
	static readonly apSett_button = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()

	// bd = body
	static readonly bd_list = _createId()
	static readonly bd_vibrate = _createId()
	static readonly bd_edit = _createId()
	static readonly bd_stop = _createId()
	static readonly bd_editDialog = _createId()
	static readonly bd_save = _createId()
	static readonly bd_input = _createId()
}