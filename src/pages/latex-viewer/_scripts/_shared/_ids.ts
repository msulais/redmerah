let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'app-' + _ID_INDEX
}

export class ElementIds {
	static readonly appbar = _createId()

	// apInf = appbar info
	static readonly apInf_button = _createId()
	static readonly apInf_menu = _createId()
	static readonly apInf_menuShareButton = _createId()

	// apSett = appbar settings
	static readonly apSett_button = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()
	static readonly apSett_prefixSuffix = _createId()
	static readonly apSett_preSufDialog = _createId()
	static readonly apSett_prefix = _createId()
	static readonly apSett_suffix = _createId()
	static readonly apSett_textWrap = _createId()

	// apMore = appbar more
	static readonly apMore_button = _createId()
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

	// bdToas = body toast
	static readonly bdToas_copied = _createId()
}