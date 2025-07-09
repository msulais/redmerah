let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'calculator-' + _ID_INDEX
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
	static readonly apSett_decMenu = _createId()
	static readonly apSett_groupMenu = _createId()

	// pg = page
	static readonly pg_basic = _createId()
	static readonly pg_converter = _createId()
	static readonly pg_date = _createId()
	static readonly pg_programmer = _createId()
	static readonly pg_scientific = _createId()

	// pgBas = page basic
	static readonly pgBas_input = _createId()
	static readonly pgBas_output = _createId()

	// pgConv = page conveter
	static readonly pgConv_options = _createId()
	static readonly pgConv_input = _createId()
	static readonly pgConv_output = _createId()
	static readonly pgConv_type = _createId()
	static readonly pgConv_swap = _createId()
	static readonly pgConv_inputUnit = _createId()
	static readonly pgConv_outputUnit = _createId()

	// pgDate = pgDate date
	static readonly pgDate_operation = _createId()
	static readonly pgDate_output = _createId()
	static readonly pgDate_diff = _createId()
	static readonly pgDate_addSub = _createId()
	static readonly pgDate_years = _createId()
	static readonly pgDate_months = _createId()
	static readonly pgDate_days = _createId()
	static readonly pgDate_fromBtn = _createId()
	static readonly pgDate_toBtn = _createId()
	static readonly pgDate_fromPicker = _createId()
	static readonly pgDate_toPicker = _createId()

	// pgPro = page programmer
	static readonly pgPro_input = _createId()
	static readonly pgPro_output = _createId()
	static readonly pgPro_outDec = _createId()
	static readonly pgPro_outHex = _createId()
	static readonly pgPro_outOct = _createId()
	static readonly pgPro_outBin = _createId()

	// pgSci = page scientific
	static readonly pgSci_angle = _createId()
	static readonly pgSci_input = _createId()
	static readonly pgSci_output = _createId()
	static readonly pgSci_fnBtn = _createId()
	static readonly pgSci_fnMenu = _createId()
	static readonly pgSci_fnInv = _createId()
	static readonly pgSci_fnHyper = _createId()

	// nav = navigation
	static readonly nav_sideBar = _createId()
	static readonly nav_drawer = _createId()
}