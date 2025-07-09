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
	static readonly apSett_btn = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()
	static readonly apSett_colorSpaceMenu = _createId()

	// bd = body
	static readonly bd_preview = _createId()
	static readonly bd_gradients = _createId()

	// bdSv = body saved (saved gradient menu)
	static readonly bdSv_menu = _createId()
	static readonly bdSv_view = _createId()
	static readonly bdSv_copy = _createId()
	static readonly bdSv_delete = _createId()

	// bdProp = body property
	static readonly bdProp_borderRadius = _createId()
	static readonly bdProp_width = _createId()
	static readonly bdProp_height = _createId()
	static readonly bdProp_clipPath = _createId()

	// bdGrad = body gradient
	static readonly bdGrad_add = _createId()
	static readonly bdGrad_copy = _createId()
	static readonly bdGrad_save = _createId()
	static readonly bdGrad_actionsMenu = _createId()
	static readonly bdGrad_controlPopover = _createId()

	// bdGradAct = body gradient actions menu
	static readonly bdGradAct_copy = _createId()
	static readonly bdGradAct_delete = _createId()
	static readonly bdGradAct_move = _createId()
	static readonly bdGradAct_moveTop = _createId()
	static readonly bdGradAct_moveBottom = _createId()
	static readonly bdGradAct_moveMenu = _createId()
	static readonly bdGradAct_newMenu = _createId()
	static readonly bdGradAct_newTop = _createId()
	static readonly bdGradAct_newBottom = _createId()

	// bdGradCtrl = body gradient control
	static readonly bdGradCtrl_angle = _createId()
	static readonly bdGradCtrl_type = _createId()
	static readonly bdGradCtrl_colorSpace = _createId()
	static readonly bdGradCtrl_colorStops = _createId()
	static readonly bdGradCtrl_hueInterpolation = _createId()
	static readonly bdGradCtrl_radialShape = _createId()
	static readonly bdGradCtrl_positionXY = _createId()
	static readonly bdGradCtrl_positionX = _createId()
	static readonly bdGradCtrl_positionY = _createId()
	static readonly bdGradCtrl_size = _createId()
	static readonly bdGradCtrl_widthHeight = _createId()
	static readonly bdGradCtrl_width = _createId()
	static readonly bdGradCtrl_height = _createId()
	static readonly bdGradCtrl_repeat = _createId()

	// bdGradStop = body gradient stop
	static readonly bdGradStop_colorPicker = _createId()
	static readonly bdGradStop_actions = _createId()
	static readonly bdGradStop_add = _createId()
	static readonly bdGradStop_sort = _createId()

	// bdGradStopAct = body gradient stop action
	static readonly bdGradStopAct_delete = _createId()
	static readonly bdGradStopAct_moveTop = _createId()
	static readonly bdGradStopAct_moveBottom = _createId()
	static readonly bdGradStopAct_moveMenu = _createId()
	static readonly bdGradStopAct_newTop = _createId()
	static readonly bdGradStopAct_newBottom = _createId()
	static readonly bdGradStopAct_newMenu = _createId()

	// toa = toast
	static readonly toa_copied = _createId()
	static readonly toa_saved = _createId()
}