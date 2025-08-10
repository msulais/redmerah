import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"

const _textRef = $(ElementIds.bd_text) as unknown as SVGTextElement
const _compassRef = $(ElementIds.bd_compass) as unknown as SVGGElement
const _notSupportRef = $(ElementIds.dlg_notSupport) as HTMLDialogElement
let _errorHasShown = false

function _initEvents(): void {
	window.addEventListener('deviceorientationabsolute', (ev) => {
		let alpha = ev.alpha
		if (alpha === null) {
			if (!_errorHasShown) {
				_notSupportRef.showModal()
			}

			_errorHasShown = true
			return
		}

		requestAnimationFrame(() => {
			alpha = Math.round(alpha!)
			while (alpha >= 360) {
				alpha -= 360
			}

			_textRef.textContent = 360 - alpha + '°'
			_compassRef.style.setProperty('rotate', alpha + 'deg')
		})
	})
}

export default () => {
	_initEvents()
}