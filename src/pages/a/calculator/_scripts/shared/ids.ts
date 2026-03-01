import { stringToHash } from "@/utils/string"
import { APP } from "./constant"

let _ID_INDEX = 0

const idPrefix = 'ID' + stringToHash(APP.link)
function _createId(): string {
	return idPrefix + (++_ID_INDEX)
}

export const ElementIds = {
	appbar: _createId(),

	// ap = appbar
	ap_openDrawerBtn: _createId(),

	// apInf = appbar info
	apInf_btn: _createId(),
	apInf_menu: _createId(),
	apInf_shareBtn: _createId(),

	// apSett = appbar settings
	apSett_btn: _createId(),
	apSett_menu: _createId(),
	apSett_animationMenu: _createId(),
	apSett_themeMenu: _createId(),
	apSett_decMenu: _createId(),
	apSett_groupMenu: _createId(),

	// pg = page
	pg_basic: _createId(),
	pg_converter: _createId(),
	pg_date: _createId(),
	pg_programmer: _createId(),
	pg_scientific: _createId(),

	// pgBas = page basic
	pgBas_input: _createId(),
	pgBas_output: _createId(),

	// pgConv = page conveter
	pgConv_options: _createId(),
	pgConv_input: _createId(),
	pgConv_output: _createId(),
	pgConv_type: _createId(),
	pgConv_swap: _createId(),
	pgConv_inputUnit: _createId(),
	pgConv_outputUnit: _createId(),

	// pgDate = pgDate date
	pgDate_operation: _createId(),
	pgDate_output: _createId(),
	pgDate_diff: _createId(),
	pgDate_addSub: _createId(),
	pgDate_years: _createId(),
	pgDate_months: _createId(),
	pgDate_days: _createId(),
	pgDate_fromBtn: _createId(),
	pgDate_toBtn: _createId(),
	pgDate_fromPicker: _createId(),
	pgDate_toPicker: _createId(),

	// pgPro = page programmer
	pgPro_input: _createId(),
	pgPro_output: _createId(),
	pgPro_outDec: _createId(),
	pgPro_outHex: _createId(),
	pgPro_outOct: _createId(),
	pgPro_outBin: _createId(),

	// pgSci = page scientific
	pgSci_angle: _createId(),
	pgSci_input: _createId(),
	pgSci_output: _createId(),
	pgSci_fnBtn: _createId(),
	pgSci_fnMenu: _createId(),
	pgSci_fnInv: _createId(),
	pgSci_fnHyper: _createId(),

	// nav = navigation
	nav_sideBar: _createId(),
	nav_drawer: _createId(),
	nav_minimizeBtn: _createId(),
}