let _ID_INDEX = 0

function _createId(): string {
	++_ID_INDEX
	return 'randomizer-' + _ID_INDEX
}

export class ElementIds {
	static readonly appbar = _createId()

	// ap = appbar
	static readonly ap_sideBarBtn = _createId()
	static readonly ap_generator = _createId()
	static readonly ap_copyBtn = _createId()
	static readonly ap_copyColorsDialog = _createId()
	static readonly ap_copyColorsHex = _createId()
	static readonly ap_copyColorsRgb = _createId()
	static readonly ap_copyColorsHsl = _createId()
	static readonly ap_copyColorsBtn = _createId()

	// apInf = appbar info
	static readonly apInf_btn = _createId()
	static readonly apInf_menu = _createId()
	static readonly apInf_shareBtn = _createId()

	// apSett = appbar settings
	static readonly apSett_btn = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()
	static readonly apSett_list = _createId()
	static readonly apSett_listBtn = _createId()
	static readonly apSett_listDialog = _createId()
	static readonly apSett_listNewDialog = _createId()
	static readonly apSett_listNew = _createId()
	static readonly apSett_listNewName = _createId()
	static readonly apSett_listNewItems = _createId()
	static readonly apSett_listSave = _createId()
	static readonly apSett_listDelete = _createId()
	static readonly apSett_listDeleteDialog = _createId()
	static readonly apSett_listDeleteItem = _createId()
	static readonly apSett_instant = _createId()

	// pg = page
	static readonly pg_string = _createId()
	static readonly pg_words = _createId()
	static readonly pg_numbers = _createId()
	static readonly pg_colors = _createId()
	static readonly pg_selection = _createId()
	static readonly pg_teams = _createId()

	// pgStr = page string
	static readonly pgStr_length = _createId()
	static readonly pgStr_custom = _createId()
	static readonly pgStr_upper = _createId()
	static readonly pgStr_lower = _createId()
	static readonly pgStr_number = _createId()
	static readonly pgStr_symbol = _createId()
	static readonly pgStr_output = _createId()

	// pgWrd = page words
	static readonly pgWrd_list = _createId()
	static readonly pgWrd_count = _createId()
	static readonly pgWrd_case = _createId()
	static readonly pgWrd_separator = _createId()
	static readonly pgWrd_prefix = _createId()
	static readonly pgWrd_suffix = _createId()
	static readonly pgWrd_repeat = _createId()
	static readonly pgWrd_output = _createId()

	// pgNum = page numbers
	static readonly pgNum_min = _createId()
	static readonly pgNum_max = _createId()
	static readonly pgNum_count = _createId()
	static readonly pgNum_sort = _createId()
	static readonly pgNum_type = _createId()
	static readonly pgNum_digits = _createId()
	static readonly pgNum_separator = _createId()
	static readonly pgNum_prefix = _createId()
	static readonly pgNum_suffix = _createId()
	static readonly pgNum_repeat = _createId()
	static readonly pgNum_output = _createId()

	// pgCol = page colors
	static readonly pgCol_count = _createId()
	static readonly pgCol_space = _createId()
	static readonly pgCol_hex = _createId()
	static readonly pgCol_hexMin = _createId()
	static readonly pgCol_hexMax = _createId()
	static readonly pgCol_rgb = _createId()
	static readonly pgCol_redMin = _createId()
	static readonly pgCol_redMax = _createId()
	static readonly pgCol_greenMin = _createId()
	static readonly pgCol_greenMax = _createId()
	static readonly pgCol_blueMin = _createId()
	static readonly pgCol_blueMax = _createId()
	static readonly pgCol_hsl = _createId()
	static readonly pgCol_hueMin = _createId()
	static readonly pgCol_hueMax = _createId()
	static readonly pgCol_saturationMin = _createId()
	static readonly pgCol_saturationMax = _createId()
	static readonly pgCol_lightMin = _createId()
	static readonly pgCol_lightMax = _createId()
	static readonly pgCol_output = _createId()

	// pgSel = page selection
	static readonly pgSel_list = _createId()
	static readonly pgSel_count = _createId()
	static readonly pgSel_output = _createId()

	// pgTm = page teams
	static readonly pgTm_names = _createId()
	static readonly pgTm_members = _createId()
	static readonly pgTm_count = _createId()
	static readonly pgTm_output = _createId()

	// nav = navigation
	static readonly nav_sideBar = _createId()
	static readonly nav_drawer = _createId()

	// toa = copied
	static readonly toa_copied = _createId()
}