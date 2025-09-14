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
	static readonly apSett_prefixSuffix = _createId()
	static readonly apSett_preSufDialog = _createId()
	static readonly apSett_prefix = _createId()
	static readonly apSett_suffix = _createId()
	static readonly apSett_textWrap = _createId()

	// apMore = appbar more
	static readonly apMore_btn = _createId()
	static readonly apMore_menu = _createId()
	static readonly apMore_reset = _createId()
	static readonly apMore_copy = _createId()

	// bd = body
	static readonly bd_add = _createId()
	static readonly bd_list = _createId()
	static readonly bd_dialogMathML = _createId()
	static readonly bd_inputMathML = _createId()
	static readonly bd_mathMLCopy = _createId()

	// bdLat = body latex
	static readonly bdLat_textarea = _createId()

	// toa = toast
	static readonly toa_copied = _createId()
}