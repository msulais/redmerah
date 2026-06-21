import { GlobalAttributes } from '../global-attributes.js'
import * as BrTheme from './br-theme.js'

export const TAGNAME = 'br-tooltip'
const HOVER_MEDIA_MOBILE = window.matchMedia('(hover:none)')
const STYLES = new CSSStyleSheet()
let _isTouchScreen = HOVER_MEDIA_MOBILE.matches

export class BiruTooltipElement extends HTMLElement {
	private _tooltip: HTMLDivElement
	private _anchor: HTMLElement | undefined
	private _isOpen: boolean
	private _timeClose: ReturnType<typeof setTimeout> | undefined
	private _timeOpen: ReturnType<typeof setTimeout> | undefined
	private _pointerX = 0
	private _pointerY = 0
	private _hiddenTooltip: HTMLDivElement

	// To save previous [aria-describedby] value of anchor element
	private _savedAriaDescribedBy: string | undefined

	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})

		// <hidden-tooltip>
		// Since [aria-describedby] cannot access id of ShadowRoot inner element, We
		// have to duplicate the tooltip content to element that visible by [aria-describedby].
		this._hiddenTooltip = document.createElement('div')
		this._hiddenTooltip.role = 'tooltip'
		this._hiddenTooltip.id = crypto.randomUUID()
		this._hiddenTooltip.style.setProperty('position', 'fixed')
		this._hiddenTooltip.style.setProperty('top', '0')
		this._hiddenTooltip.style.setProperty('max-width', '0px')
		this._hiddenTooltip.style.setProperty('max-height', '0px')
		this._hiddenTooltip.style.setProperty('overflow', 'hidden')
		this._hiddenTooltip.style.setProperty('opacity', '0')
		this._hiddenTooltip.style.setProperty('pointer-event', 'none')
		document.body.append(this._hiddenTooltip)
		// </hidden-tooltip>

		this._tooltip = document.createElement('div')
		this._tooltip.role = 'none'
		shadow.adoptedStyleSheets = [STYLES]
		shadow.append(this._tooltip, document.createElement('slot'))

		this._isOpen = false
		this.addEventListener('pointerover', this)
		this.addEventListener('pointerout', this)
		this.addEventListener('pointermove', this)
		this.addEventListener('focusin', this)
		this.addEventListener('focusout', this)
		this.addEventListener('click', this)
	}

	handleEvent(ev: Event): void {
		switch (ev.type) {
		case 'pointerover': return this._pointerover(ev as PointerEvent)
		case 'pointerout' : return this._pointerout (ev as PointerEvent)
		case 'pointermove': return this._pointermove(ev as PointerEvent)
		case 'click'      : return this._click      (ev as PointerEvent)
		case 'focusin'    : return this._focusin    (ev as FocusEvent)
		case 'focusout'   : return this._focusout   (ev as FocusEvent)
		}
	}

	private _click(_ev: PointerEvent): void {
		this._close()
	}

	private _pointermove(ev: PointerEvent): void {
		this._pointerX = ev.clientX
		this._pointerY = ev.clientY
	}

	private _pointerover(ev: PointerEvent): void {
		const ref_target = (ev.target as HTMLElement).closest<HTMLElement>(`[${CSS.escape(GlobalAttributes.Tooltip)}]`)
		this._pointerX = ev.clientX
		this._pointerY = ev.clientY
		this._open(ref_target)
	}

	private _focusin(ev: FocusEvent): void {
		const element = ev.target as HTMLElement | undefined
		if (!element?.matches(`:focus-visible[${CSS.escape(GlobalAttributes.Tooltip)}]`)) {
			return
		}

		this._open(element, false)
	}

	private _pointerout(ev: PointerEvent): void {
		if (this._anchor && this._anchor.contains(ev.relatedTarget as Node)) {
			return
		}

		this._close()
	}

	private _focusout(ev: FocusEvent): void {
		if (this._anchor && this._anchor.contains(ev.relatedTarget as Node)) {
			return
		}

		this._close()
	}

	private _open(target: HTMLElement | undefined | null, byPointer = true): void {
		if (!target) {
			clearTimeout(this._timeOpen)
			this._close()
			this._anchor = undefined
			return
		}

		if (target === this._anchor) {
			return
		}

		this._anchor = target as HTMLElement
		clearTimeout(this._timeOpen)
		this._timeOpen = setTimeout(() => {
			if (!this._anchor) {
				return
			}

			const text = this._anchor.getAttribute(GlobalAttributes.Tooltip) ?? ''
			if (text.length <= 0) {
				return
			}

			if (!this._savedAriaDescribedBy) {
				this._savedAriaDescribedBy = this._anchor.getAttribute('aria-describedby') ?? undefined
			}

			this._anchor.setAttribute('aria-describedby', this._hiddenTooltip.id)
			this._hiddenTooltip.textContent = text
			this._tooltip.textContent = text
			this._tooltip.style.setProperty('left', '0px') // to help calculate better. This will -at least- avoid text wrap
			this._isOpen = true

			const rect_anchor = this._anchor.getBoundingClientRect()
			const rect_tooltip = this._tooltip.getBoundingClientRect()
			const viewportHeight = window.innerHeight
			const viewportWidth = window.innerWidth
			const gap = !byPointer? 16 : _isTouchScreen? 48 : 24, margin = 8
			let x = 0
			let y = 0

			position_x: {
				const width_anchor = rect_anchor.width
				const width_tooltip = rect_tooltip.width
				x = this._pointerX - (width_tooltip / 2)
				if (!byPointer) {
					x = rect_anchor.x + (width_anchor / 2) - (width_tooltip / 2)
				}

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
				y = this._pointerY - height_tooltip - gap
				if (!byPointer) {
					y = rect_anchor.y - height_tooltip - gap
				}

				if (y < margin) {
					y = this._pointerY + gap
					if (!byPointer) {
						y = rect_anchor.y + height_anchor + gap
					}
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
		}, 500)
	}

	private _close(): void {
		clearTimeout(this._timeOpen)
		if (this._savedAriaDescribedBy) {
			this._anchor?.setAttribute('aria-describedby', this._savedAriaDescribedBy)
		}
		else {
			this._anchor?.removeAttribute('aria-describedby')
		}
		this._anchor = undefined
		if (!this._isOpen) {
			return
		}

		clearTimeout(this._timeClose)
		this._timeClose = setTimeout(() => {
			this._savedAriaDescribedBy = undefined
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

function _initDefaultStyles(): void {
	STYLES.replaceSync(`
:host {
	display: contents;
}

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
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	transition-property: opacity;
}`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyles()
	_initListeners()
	customElements.define(TAGNAME, BiruTooltipElement)
}

define()