import { stringToHash } from "@/utils/string"
import { APP } from "./_constant"

let _ID_INDEX = 0

const idPrefix = stringToHash(APP.link)
function _createId(): string {
	return idPrefix + (++_ID_INDEX)
}

export class ElementIds {
	static readonly appbar = _createId()

	// ap = appbar
	static readonly ap_sideBarBtn = _createId()

	// apInf = appbar info
	static readonly apInf_btn = _createId()
	static readonly apInf_menu = _createId()
	static readonly apInf_shareBtn = _createId()

	// apSett = appbar settings
	static readonly apSett_btn = _createId()
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

	// pg = page
	static readonly pg_generate = _createId()
	static readonly pg_scan = _createId()

	// pgGen = page generate
	static readonly pgGen_input = _createId()
	static readonly pgGen_output = _createId()
	static readonly pgGen_png = _createId()
	static readonly pgGen_jpg = _createId()
	static readonly pgGen_svg = _createId()

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