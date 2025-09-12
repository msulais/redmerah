let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'url-encoder-' + _ID_INDEX
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

	// apMore = appbar more
	static readonly apMore_btn = _createId()
	static readonly apMore_menu = _createId()
	static readonly apMore_reset = _createId()
	static readonly apMore_copyDecode = _createId()
	static readonly apMore_copyEncode = _createId()

	// bd = body
	static readonly bd_inputContainer = _createId()
	static readonly bd_decode = _createId()
	static readonly bd_encode = _createId()
	static readonly bd_slider = _createId()

	// toa = toast
	static readonly toa_copied = _createId()
}