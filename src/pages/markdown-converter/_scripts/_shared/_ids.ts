let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'app-' + _ID_INDEX
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
	static readonly apMore_open = _createId()
	static readonly apMore_print = _createId()
	static readonly apMore_resetMarkdown = _createId()
	static readonly apMore_resetCSS = _createId()
	static readonly apMore_copyMenu = _createId()
	static readonly apMore_copyMarkdown = _createId()
	static readonly apMore_copyCSS = _createId()
	static readonly apMore_copyHTML = _createId()
	static readonly apMore_downloadMenu = _createId()
	static readonly apMore_downloadMarkdown = _createId()
	static readonly apMore_downloadCSS = _createId()
	static readonly apMore_downloadHTML = _createId()

	// bd = body
	static readonly bd_inputContainer = _createId()
	static readonly bd_markdown = _createId()
	static readonly bd_css = _createId()
	static readonly bd_html = _createId()
	static readonly bd_preview = _createId()
	static readonly bd_slider = _createId()

	// bdTab = body tab
	static readonly bdTab_markdown = _createId()
	static readonly bdTab_css = _createId()
	static readonly bdTab_preview = _createId()
	static readonly bdTab_html = _createId()

	// bdToas = body toast
	static readonly bdToas_copied = _createId()
	static readonly bdToas_noFile = _createId()
	static readonly bdToas_readError = _createId()
}