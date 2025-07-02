let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'app-' + _ID_INDEX
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

	// bd = body
	static readonly bd_basic = _createId()
	static readonly bd_converter = _createId()
	static readonly bd_date = _createId()
	static readonly bd_programmer = _createId()
	static readonly bd_scientific = _createId()

	// bdBas = body basic
	static readonly bdBas_input = _createId()
	static readonly bdBas_output = _createId()

	// bdConv = body conveter
	static readonly bdConv_options = _createId()
	static readonly bdConv_input = _createId()
	static readonly bdConv_output = _createId()
	static readonly bdConv_type = _createId()
	static readonly bdConv_swap = _createId()
	static readonly bdConv_inputUnit = _createId()
	static readonly bdConv_outputUnit = _createId()

	// bdDate = body date
	static readonly bdDate_operation = _createId()
	static readonly bdDate_output = _createId()

	// bdDateOp = body date operation
	static readonly bdDateOp_diff = _createId()
	static readonly bdDateOp_addSub = _createId()

	// bdDateInp = body date input
	static readonly bdDateInp_years = _createId()
	static readonly bdDateInp_months = _createId()
	static readonly bdDateInp_days = _createId()
	static readonly bdDateInp_fromBtn = _createId()
	static readonly bdDateInp_toBtn = _createId()
	static readonly bdDateInp_fromDatePicker = _createId()
	static readonly bdDateInp_toDatePicker = _createId()

	// bdProg = body programmer
	static readonly bdProg_input = _createId()
	static readonly bdProg_output = _createId()
	static readonly bdProg_outDec = _createId()
	static readonly bdProg_outHex = _createId()
	static readonly bdProg_outOct = _createId()
	static readonly bdProg_outBin = _createId()

	// bdSci = body scientific
	static readonly bdSci_angle = _createId()
	static readonly bdSci_input = _createId()
	static readonly bdSci_output = _createId()

	// bdSciFn = body scientific function
	static readonly bdSciFn_btn = _createId()
	static readonly bdSciFn_menu = _createId()
	static readonly bdSciFn_inv = _createId()
	static readonly bdSciFn_hyper = _createId()

	// nav = navigation
	static readonly nav_sideBar = _createId()
	static readonly nav_drawer = _createId()
}