import { stringToHash } from "@/utils/string"
import { APP } from "./_constant"

let _ID_INDEX = 0

const idPrefix = stringToHash(APP.link)
function _createId(): string {
	return idPrefix + (++_ID_INDEX)
}

export class ElementIds {
	static readonly appbar = _createId()

	// apOpen = appbar open
	static readonly apOpen_container = _createId()
	static readonly apOpen_btn = _createId()
	static readonly apOpen_menu = _createId()
	static readonly apOpen_device = _createId()
	static readonly apOpen_link = _createId()
	static readonly apOpen_linkDialog = _createId()
	static readonly apOpen_linkInput = _createId()
	static readonly apOpen_linkInsert = _createId()

	// apInf = appbar info
	static readonly apInf_btn = _createId()
	static readonly apInf_menu = _createId()
	static readonly apInf_shareBtn = _createId()

	// apSett = appbar settings
	static readonly apSett_btn = _createId()
	static readonly apSett_menu = _createId()
	static readonly apSett_animationMenu = _createId()
	static readonly apSett_themeMenu = _createId()

	// bd = body
	static readonly bd_image = _createId()
	static readonly bd_audio = _createId()
	static readonly bd_video = _createId()

	// toa = toast
	static readonly toa_invalid = _createId()
	static readonly toa_noFile = _createId()
	static readonly toa_error = _createId()
	static readonly toa_loading = _createId()
	static readonly toa_loadingAbort = _createId()
}