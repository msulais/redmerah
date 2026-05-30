import { GlobalAttributes } from '../global-attributes.js'
import * as BrTheme from './br-theme.js'

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'br-tooltip'
const HOVER_MEDIA_MOBILE = window.matchMedia('(hover:none)')
let _isTouchScreen = HOVER_MEDIA_MOBILE.matches

export class BiruTooltipElement extends HTMLElement {
	private _tooltip: HTMLDivElement
	private _anchor: HTMLElement | undefined
	private _isOpen: boolean
	private _timeClose: ReturnType<typeof setTimeout> | undefined
	private _timeOpen: ReturnType<typeof setTimeout> | undefined

	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})
		this._tooltip = document.createElement('div')
		shadow.adoptedStyleSheets = [STYLES]
		shadow.append(this._tooltip, document.createElement('slot'))

		this._isOpen = false
		this.addEventListener('pointerover', this)
		this.addEventListener('pointerout', this)
	}

	handleEvent(ev: Event): void {
		switch (ev.type) {
		case 'pointerover': return this._pointerover(ev)
		case 'pointerout': return this._pointerout(ev)
		}
	}

	private _pointerover(ev: Event): void {
		const ref_target = (ev.target as HTMLElement).closest(`[${CSS.escape(GlobalAttributes.Tooltip)}]`)
		if (!ref_target) {
			clearTimeout(this._timeOpen)
			this._close()
			this._anchor = undefined
			return
		}

		if (ref_target === this._anchor) {
			return
		}

		this._anchor = ref_target as HTMLElement
		clearTimeout(this._timeOpen)
		this._timeOpen = setTimeout(() => {
			if (!this._anchor) {
				return
			}

			const text = this._anchor.getAttribute(GlobalAttributes.Tooltip)
			if (!text) {
				return
			}

			this._open(text)
		}, 500)
	}

	private _pointerout(ev: Event): void {
		if (this._anchor && this._anchor.contains((ev as PointerEvent).relatedTarget as Node)) {
			return
		}

		clearTimeout(this._timeOpen)
		this._close()
		this._anchor = undefined
	}

	private _open(text: string): void {
		if (!this._anchor || text.length <= 0) {
			return
		}

		this._tooltip.textContent = text
		this._tooltip.style.setProperty('left', '0px') // to help calculate better. This will -at least- avoid text wrap
		this._isOpen = true

		const rect_anchor = this._anchor.getBoundingClientRect()
		const rect_tooltip = this._tooltip.getBoundingClientRect()
		const viewportHeight = window.innerHeight
		const viewportWidth = window.innerWidth
		const gap = 10, margin = 8
		let x = 0
		let y = 0

		position_x: {
			const width_anchor = rect_anchor.width
			const width_tooltip = rect_tooltip.width
			x = rect_anchor.x + (width_anchor / 2) - (width_tooltip / 2)
			if (x < margin) {
				x = margin
			}
			else if (x + width_tooltip > viewportWidth - margin) {
				x = viewportWidth - width_tooltip - margin
			}
			break position_x
		}

		position_y: {
			const height_anchor = rect_anchor.height
			const height_tooltip = rect_tooltip.height
			y = rect_anchor.y - height_tooltip - gap
			if (y < margin) {
				y = rect_anchor.y + height_anchor + gap
			}

			if (y < margin) {
				y = margin
			}
			else if (y + height_tooltip > viewportHeight - margin) {
				y = viewportHeight - height_tooltip - margin
			}
			break position_y
		}

		this._tooltip.style.setProperty('left', x + 'px')
		this._tooltip.style.setProperty('top', y + 'px')
		this._tooltip.style.setProperty('opacity', '1')
	}

	private _close(): void {
		if (!this._isOpen) {
			return
		}

		clearTimeout(this._timeClose)
		this._timeClose = setTimeout(() => {
			this._tooltip.style.removeProperty('opacity')
			this._isOpen = false
		}, _isTouchScreen? 1500 : 0)
	}
}

function _initListeners(): void {
	HOVER_MEDIA_MOBILE.addEventListener('change', (ev) => {
		_isTouchScreen = ev.matches
	})
}

function _initDefaultStyle(): void {
	STYLES.replaceSync(`
div {
	top: 0px;
	left: 0px;
	pointer-events: none;
	position: fixed;
	opacity: 0;
	background-color: rgb(var(${BrTheme.CSSVars.ColorOnSurface}));
	color: rgb(var(${BrTheme.CSSVars.ColorSurface}));
	font-size: .75rem;
	font-weight: 500;
	padding: .25rem .5rem;
	white-space: pre-line;
	max-width: calc(100% - 8px);
	max-height: calc(100dvh - 8px);
	overflow: hidden;
	border-radius: .25rem;
	border: 1px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	z-index: 99999999;
}`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyle()
	_initListeners()
	customElements.define(TAGNAME, BiruTooltipElement)
}

define()