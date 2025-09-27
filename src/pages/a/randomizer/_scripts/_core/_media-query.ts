import { CButton } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { CSS_SMALL_SIZE } from "../_shared/_constant"

const _ref_generatorBtn = $(ElementIds.ap_generator) as CButton.CElement
const _ref_generatorLoc1 = $(ElementIds.ap_generatorLocation) as HTMLDivElement
const _ref_generatorLoc2 = document.body

function _moveOpenBtnRef(isQueryMatch: boolean): void {
	if (isQueryMatch) {
		_ref_generatorLoc2.append(_ref_generatorBtn)
	} else {
		_ref_generatorLoc1.append(_ref_generatorBtn)
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