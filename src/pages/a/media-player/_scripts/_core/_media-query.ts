import type { ButtonElement } from "@/components/Button"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { CSS_SMALL_SIZE } from "../_shared/_constant"

const _bodyRef = document.body
const _openBtnRef = $(ElementIds.apOpen_btn) as ButtonElement
const _openBtnContainerRef = $(ElementIds.apOpen_container) as HTMLDivElement

function _moveOpenBtnRef(isQueryMatch: boolean): void {
	if (isQueryMatch) {
		_bodyRef.append(_openBtnRef)
	} else {
		_openBtnContainerRef.append(_openBtnRef)
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