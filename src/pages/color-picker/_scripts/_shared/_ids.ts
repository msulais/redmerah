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
	static readonly apSett_button = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()

	// bd = body
	static readonly bd_pickerMode = _createId()
	static readonly bd_preview = _createId()

	// bdPick = body picker
	static readonly bdPick_imageButton = _createId()
	static readonly bdPick_imageCanvas = _createId()
	static readonly bdPick_imageWrapper = _createId()
	static readonly bdPick_rectangleRect = _createId()
	static readonly bdPick_rectangleHue = _createId()
	static readonly bdPick_rectangleHslRect = _createId()
	static readonly bdPick_rectangleHslHue = _createId()
	static readonly bdPick_spectrumRect = _createId()
	static readonly bdPick_spectrumHue = _createId()
	static readonly bdPick_rgbRed = _createId()
	static readonly bdPick_rgbGreen = _createId()
	static readonly bdPick_rgbBlue = _createId()
	static readonly bdPick_hslHue = _createId()
	static readonly bdPick_hslSaturation = _createId()
	static readonly bdPick_hslLightness = _createId()
	static readonly bdPick_cmykCyan = _createId()
	static readonly bdPick_cmykMagenta = _createId()
	static readonly bdPick_cmykYellow = _createId()
	static readonly bdPick_cmykKey = _createId()
	static readonly bdPick_hex = _createId()
	static readonly bdPick_hsvHue = _createId()
	static readonly bdPick_hsvSaturation = _createId()
	static readonly bdPick_hsvValue = _createId()
	static readonly bdPick_hwbHue = _createId()
	static readonly bdPick_hwbWhiteness = _createId()
	static readonly bdPick_hwbBlackness = _createId()

	// bdInp = body input
	static readonly bdInp_hex = _createId()
	static readonly bdInp_rgb = _createId()
	static readonly bdInp_hsl = _createId()
	static readonly bdInp_hsv = _createId()
	static readonly bdInp_hwb = _createId()
	static readonly bdInp_cmyk = _createId()

	// toa = toast
	static readonly toa_copied = _createId()
}