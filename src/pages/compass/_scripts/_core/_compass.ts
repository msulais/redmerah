import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"

const _textRef = $(ElementIds.bd_text) as unknown as SVGTextElement
const _compassRef = $(ElementIds.bd_compass) as unknown as SVGGElement

function _initEvents(): void {
	window.addEventListener('deviceorientationabsolute', (ev) => {
		const alpha = ev.alpha
		if (alpha === null) {
			// TODO: show error
			return
		}

		requestAnimationFrame(() => {
			_textRef.textContent = alpha + '°'
			_compassRef.setAttribute('transform', `rotate(${360 - alpha},640,788)`)
		})
	})
}

export default () => {
	_initEvents()
}