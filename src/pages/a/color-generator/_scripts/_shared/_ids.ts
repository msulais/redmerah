let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'color-generator-' + _ID_INDEX
}

export class ElementIds {
	static readonly appbar = _createId()

	// ap = appbar
	static readonly ap_copyBtn = _createId()

	// apInf = appbar info
	static readonly apInf_btn = _createId()
	static readonly apInf_menu = _createId()
	static readonly apInf_shareBtn = _createId()

	// apSett = appbar settings
	static readonly apSett_btn = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()

	// bd = body
	static readonly bd_saveBtn = _createId()
	static readonly bd_picker = _createId()
	static readonly bd_pickerBtn = _createId()
	static readonly bd_pickerBtnSpan = _createId()
	static readonly bd_accentLight = _createId()
	static readonly bd_onAccentLight = _createId()
	static readonly bd_accentDark = _createId()
	static readonly bd_onAccentDark = _createId()

	// toa = toast
	static readonly toa_copied = _createId()
}