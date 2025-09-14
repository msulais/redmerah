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
	static readonly apSett_btn = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()
	static readonly apSett_textWrap = _createId()
	static readonly apSett_module = _createId()
	static readonly apSett_keepFnNames = _createId()
	static readonly apSett_keepClsNames = _createId()
	static readonly apSett_topLevel = _createId()
	static readonly apSett_beautify = _createId()

	// apMore = appbar more
	static readonly apMore_btn = _createId()
	static readonly apMore_menu = _createId()
	static readonly apMore_open = _createId()
	static readonly apMore_reset = _createId()
	static readonly apMore_copy = _createId()
	static readonly apMore_download = _createId()

	// bd = body
	static readonly bd_inputContainer = _createId()
	static readonly bd_input = _createId()
	static readonly bd_output = _createId()
	static readonly bd_slider = _createId()

	// toa = toast
	static readonly toa_copied = _createId()
	static readonly toa_noFile = _createId()
	static readonly toa_readError = _createId()
}