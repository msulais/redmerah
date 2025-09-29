import { stringToHash } from "@/utils/string"
import { APP } from "./_constant"

let _ID_INDEX = 0

const idPrefix = 'ID' + stringToHash(APP.link)
function _createId(): string {
	return idPrefix + (++_ID_INDEX)
}

export class ElementIds {
	static readonly appbar = _createId()

	// ap = appbar
	static readonly ap_openDrawerBtn = _createId()

	// apInf = appbar info
	static readonly apInf_btn = _createId()
	static readonly apInf_menu = _createId()
	static readonly apInf_shareBtn = _createId()

	// apSett = appbar settings
	static readonly apSett_btn = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()
	static readonly apSett_relativeBtn = _createId()
	static readonly apSett_relativeDialog = _createId()
	static readonly apSett_relativeRem = _createId()
	static readonly apSett_relativePercent = _createId()
	static readonly apSett_relativeVw = _createId()
	static readonly apSett_relativeVh = _createId()
	static readonly apSett_relativeViewport = _createId()

	// bd = body
	static readonly bd_angle = _createId()
	static readonly bd_length = _createId()
	static readonly bd_time = _createId()

	// pgAng = page angle
	static readonly pgAng_input = _createId()
	static readonly pgAng_inputUnit = _createId()
	static readonly pgAng_output = _createId()
	static readonly pgAng_outputUnit = _createId()

	// pgLen = page length
	static readonly pgLen_input = _createId()
	static readonly pgLen_inputUnit = _createId()
	static readonly pgLen_output = _createId()
	static readonly pgLen_outputUnit = _createId()

	// pgTm = page Time
	static readonly pgTm_input = _createId()
	static readonly pgTm_inputUnit = _createId()
	static readonly pgTm_output = _createId()
	static readonly pgTm_outputUnit = _createId()

	// nav = navigation
	static readonly nav_drawer = _createId()
	static readonly nav_sideBar = _createId()
	static readonly nav_minimizeBtn = _createId()
}