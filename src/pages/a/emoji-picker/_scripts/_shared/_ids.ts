import { stringToHash } from "@/utils/string"
import { APP } from "./_constant"

let _ID_INDEX = 0

const idPrefix = 'ID' + stringToHash(APP.link)
function _createId(): string {
	return idPrefix + (++_ID_INDEX)
}

export class ElementIds {
	static readonly appbar = _createId()

	// ap = appbar
	static readonly ap_openDrawerBtn = _createId()

	// apInf = appbar info
	static readonly apInf_btn = _createId()
	static readonly apInf_menu = _createId()
	static readonly apInf_shareBtn = _createId()

	// apSett = appbar settings
	static readonly apSett_btn = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()

	// apSrc = appbar search
	static readonly apSrc_btn = _createId()
	static readonly apSrc_popover = _createId()
	static readonly apSrc_input = _createId()

	static readonly body = _createId()

	// bd = body
	static readonly bd_emojiList = _createId()
	static readonly bd_skinTone = _createId()
	static readonly bd_title = _createId()
	static readonly bd_input = _createId()
	static readonly bd_dismissInput = _createId()
	static readonly bd_copyInput = _createId()

	// nav = navigation
	static readonly navigationSideBar = _createId()
	static readonly navigationDrawer = _createId()
	static readonly nav_minimizeBtn = _createId()

	// toa = toast
	static readonly toa_copied = _createId()
}