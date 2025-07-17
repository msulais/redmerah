let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'markdown-converter-' + _ID_INDEX
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
	static readonly apSett_minifyCSS = _createId()

	// apMore = appbar more
	static readonly apMore_btn = _createId()
	static readonly apMore_menu = _createId()
	static readonly apMore_open = _createId()
	static readonly apMore_resetSCSS = _createId()
	static readonly apMore_resetSASS = _createId()
	static readonly apMore_copyMenu = _createId()
	static readonly apMore_copySCSS = _createId()
	static readonly apMore_copySASS = _createId()
	static readonly apMore_copyCSS = _createId()
	static readonly apMore_downloadMenu = _createId()
	static readonly apMore_downloadSCSS = _createId()
	static readonly apMore_downloadSASS = _createId()
	static readonly apMore_downloadCSS = _createId()

	// bd = body
	static readonly bd_inputContainer = _createId()
	static readonly bd_scss = _createId()
	static readonly bd_sass = _createId()
	static readonly bd_css = _createId()
	static readonly bd_slider = _createId()

	// bdTab = body tab
	static readonly bdTab_scss = _createId()
	static readonly bdTab_sass = _createId()
	static readonly bdTab_css = _createId()

	// bdToas = body toast
	static readonly bdToas_copied = _createId()
	static readonly bdToas_noFile = _createId()
	static readonly bdToas_readError = _createId()
}