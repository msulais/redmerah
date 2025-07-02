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
	static readonly apInf_shareButton = _createId()

	// apSet = appbar settings
	static readonly apSett_button = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()

	// bd = body
	static readonly bd_levelText = _createId()
	static readonly bd_statusIcon = _createId()
	static readonly bd_statusText = _createId()

	// dlg = dialog
	static readonly dlg_browseNotSupported = _createId()
}