import type { CDialog } from "@/components/Dialog"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"

const _ref_text = $(ElementIds.bd_text) as unknown as SVGTextElement
const _ref_compass = $(ElementIds.bd_compass) as unknown as SVGGElement
const _ref_notSupport = $(ElementIds.dlg_notSupport) as CDialog.CElement
let _errorHasShown = false

function _initEvents(): void {
	window.addEventListener('deviceorientationabsolute', (ev) => {
		let alpha = ev.alpha
		if (alpha === null) {
			if (!_errorHasShown) {
				_ref_notSupport.showModal()
			}

			_errorHasShown = true
			return
		}

		alpha = Math.round(alpha!)
		while (alpha <= 0) {
			alpha += 360
		}

		requestAnimationFrame(() => {
			_ref_text.textContent = 360 - alpha + '°'
			_ref_compass.style.setProperty('rotate', alpha + 'deg')
		})
	})
}

export default () => {
	_initEvents()
}