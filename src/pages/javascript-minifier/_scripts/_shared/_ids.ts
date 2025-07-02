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
	static readonly apSett_textWrap = _createId()
	static readonly apSett_module = _createId()
	static readonly apSett_keepFnNames = _createId()
	static readonly apSett_keepClsNames = _createId()
	static readonly apSett_topLevel = _createId()
	static readonly apSett_beautify = _createId()

	// apMore = appbar more
	static readonly apMore_button = _createId()
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

	// bdToas = body toast
	static readonly bdToas_copied = _createId()
	static readonly bdToas_noFile = _createId()
	static readonly bdToas_readError = _createId()
}