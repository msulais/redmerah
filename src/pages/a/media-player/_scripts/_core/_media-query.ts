import { CButton } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { CSS_SMALL_SIZE } from "../_shared/_constant"

const _ref_body = document.body
const _ref_openBtn = $(ElementIds.apOpen_btn) as CButton.CElement
const _ref_openBtnContainer = $(ElementIds.apOpen_container) as HTMLDivElement

function _moveOpenBtnRef(isQueryMatch: boolean): void {
	if (isQueryMatch) {
		_ref_body.append(_ref_openBtn)
	} else {
		_ref_openBtnContainer.append(_ref_openBtn)
	}
}

function _initEvents(): void {
	function openBtn() {
		const media = window.matchMedia(`(max-width:${CSS_SMALL_SIZE}rem)`)

		_moveOpenBtnRef(media.matches)
		media.addEventListener('change', (ev) => _moveOpenBtnRef(ev.matches))
	}

	openBtn()
}

export default () => {
	_initEvents()
}