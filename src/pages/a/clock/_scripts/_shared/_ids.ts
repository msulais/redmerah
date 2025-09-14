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
	static readonly apSett_keepAwake = _createId()

	// bdDlg = body dialog
	static readonly bdDlg_wakeLockError = _createId()

	// pg = page
	static readonly pg_clock = _createId()
	static readonly pg_stopwatch = _createId()
	static readonly pg_timer = _createId()

	// pgClk = page clock
	static readonly pgClk_time = _createId()
	static readonly pgClk_date = _createId()

	// pgSw = page stopwatch
	static readonly pgSw_hhmmss = _createId()
	static readonly pgSw_ms = _createId()
	static readonly pgSw_laps = _createId()
	static readonly pgSw_lapsContent = _createId()
	static readonly pgSw_playPause = _createId()
	static readonly pgSw_resetLap = _createId()
	static readonly pgSw_moreBtn = _createId()
	static readonly pgSw_moreMenu = _createId()
	static readonly pgSw_moreMSMenu = _createId()

	// pgTm = page timer
	static readonly pgTm_audio = _createId()
	static readonly pgTm_time = _createId()
	static readonly pgTm_playPause = _createId()
	static readonly pgTm_editReset = _createId()
	static readonly pgTm_editDialog = _createId()
	static readonly pgTm_hours = _createId()
	static readonly pgTm_minutes = _createId()
	static readonly pgTm_seconds = _createId()
	static readonly pgTm_save = _createId()
	static readonly pgTm_doneDialog = _createId()
	static readonly pgTm_doneTime = _createId()
	static readonly pgTm_doneDate = _createId()

	// nav = navigation
	static readonly nav_sideBar = _createId()
	static readonly nav_drawer = _createId()
	static readonly nav_minimizeBtn = _createId()

	// toa = toast
	static readonly toa_copied = _createId()
}