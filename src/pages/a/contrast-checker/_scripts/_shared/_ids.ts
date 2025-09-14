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

	// apSett = appbar settings
	static readonly apSett_button = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()

	// bd = body
	static readonly bd_foreground = _createId()
	static readonly bd_background = _createId()
	static readonly bd_forePicker = _createId()
	static readonly bd_backPicker = _createId()
	static readonly bd_ratio = _createId()
	static readonly bd_percentage = _createId()
	static readonly bd_preview = _createId()
	static readonly bd_normalAA = _createId()
	static readonly bd_normalAAA = _createId()
	static readonly bd_largeAA = _createId()
	static readonly bd_largeAAA = _createId()
}