let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'color-picker-' + _ID_INDEX
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
	static readonly bd_downlink = _createId()
	static readonly bd_downlinkMax = _createId()
	static readonly bd_effectiveType = _createId()
	static readonly bd_type = _createId()
	static readonly bd_rtt = _createId()
	static readonly bd_saveData = _createId()

	// dlg = dialog
	static readonly dlg_browseNotSupported = _createId()
}