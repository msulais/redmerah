let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'app-' + _ID_INDEX
}

export class ElementIds {
	static readonly appbar = _createId()
	static readonly appbarSideBarButton = _createId()

	// apInf = appbar info
	static readonly apInf_button = _createId()
	static readonly apInf_menu = _createId()
	static readonly apInf_menuShareButton = _createId()

	// apSett = appbar settings
	static readonly apSett_button = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()
	static readonly apSett_correctionMenu = _createId()
	static readonly apSett_encodingMenu = _createId()
	static readonly apSett_versionMenu = _createId()
	static readonly apSett_marginBtn = _createId()
	static readonly apSett_marginInput = _createId()
	static readonly apSett_marginSave = _createId()
	static readonly apSett_marginDialog = _createId()
	static readonly apSett_colorSave = _createId()
	static readonly apSett_colorBtn = _createId()
	static readonly apSett_colorDialog = _createId()
	static readonly apSett_colorForePicker = _createId()
	static readonly apSett_colorBackPicker = _createId()
	static readonly apSett_colorForePickerBtn = _createId()
	static readonly apSett_colorBackPickerBtn2 = _createId()
	static readonly apSett_colorPreviewForeground = _createId()
	static readonly apSett_colorPreviewBackground = _createId()

	// bdPage = body page
	static readonly bdPage_generate = _createId()
	static readonly bdPage_scan = _createId()

	// pgGen = page generate
	static readonly pgGen_input = _createId()
	static readonly pgGen_output = _createId()

	// pgGenDow = page generate download
	static readonly pgGenDow_png = _createId()
	static readonly pgGenDow_jpg = _createId()
	static readonly pgGenDow_svg = _createId()

	// pgScan = page scan
	static readonly pgScan_pickImg = _createId()
	static readonly pgScan_imgPreview = _createId()
	static readonly pgScan_output = _createId()

	// nav = navigation
	static readonly nav_drawer = _createId()
	static readonly nav_sideBar = _createId()

	// toa = toast
	static readonly toa_generateError = _createId()
	static readonly toa_generateErrorMessage = _createId()
}