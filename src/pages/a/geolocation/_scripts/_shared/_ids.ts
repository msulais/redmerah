import { stringToHash } from "@/utils/string"
import { APP } from "./_constant"

let _ID_INDEX = 0

const idPrefix = 'ID' + stringToHash(APP.link)
function _createId(): string {
	return idPrefix + (++_ID_INDEX)
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
	static readonly bd_startPause = _createId()
	static readonly bd_accuracy = _createId()
	static readonly bd_altitude = _createId()
	static readonly bd_altitudeAccuracy = _createId()
	static readonly bd_heading = _createId()
	static readonly bd_latitude = _createId()
	static readonly bd_longitude = _createId()
	static readonly bd_speed = _createId()

	// toa = toast
	static readonly toa_permission = _createId()
	static readonly toa_location = _createId()
}