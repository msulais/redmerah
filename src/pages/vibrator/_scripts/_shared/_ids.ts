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
	static readonly bd_list = _createId()
	static readonly bd_vibrate = _createId()
	static readonly bd_edit = _createId()
	static readonly bd_stop = _createId()
	static readonly bd_editDialog = _createId()
	static readonly bd_save = _createId()
	static readonly bd_input = _createId()
}