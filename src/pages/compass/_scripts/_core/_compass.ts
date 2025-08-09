import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"

const _textRef = $(ElementIds.bd_text) as unknown as SVGTextElement
const _compassRef = $(ElementIds.bd_compass) as unknown as SVGGElement

function _initEvents(): void {
	window.addEventListener('deviceorientationabsolute', (ev) => {
		let alpha = ev.alpha
		if (alpha === null) {
			// TODO: show error
			return
		}

		requestAnimationFrame(() => {
			alpha = Math.round(alpha!)
			_textRef.textContent = 360 - alpha + '°'
			_compassRef.setAttribute('transform', `rotate(${alpha},640,788)`)
		})
	})
}

export default () => {
	_initEvents()
}