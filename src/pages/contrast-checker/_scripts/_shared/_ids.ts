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
	static readonly bd_foreground = _createId()
	static readonly bd_background = _createId()
	static readonly bd_forePicker = _createId()
	static readonly bd_backPicker = _createId()
	static readonly bd_ratio = _createId()
	static readonly bd_percentage = _createId()
}