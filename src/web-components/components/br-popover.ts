import * as BrTheme from './br-theme.js'
import * as BrDialog from './br-dialog.js'
import { registerZIndex, unregisterZIndex } from "../_flyout.js"
import { GlobalAttributes, Commands } from "../global-attributes"
import { shadowElementsListener } from '../_utils.js'

export const Attributes = {
	Manual  : 'br:manual',
	Gap     : 'br:gap',
	Position: 'br:position',
	Padding : 'br:padding',
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const CSSVars = {
	/** Auto update by component. Don't use. If necesarry use `'left'` property instead. */
	X: '--br-popover-x',

	/** Auto update by component. Don't use. If necesarry use `'top'` property instead. */
	Y: '--br-popover-y',

	/** Auto update by component. Don't use. If necesarry use `'padding'` property instead. */
	Padding: '--br-popover-padding',
} as const


/**
 * ```txt
 *        |            |                      |
 *        |      LEFT  |        CENTER        |  RIGHT
 * —————— + —————————— + ———————————————————— + ———————
 *        |
 *        |            ^                      ^
 * TOP    |     [<^  ] | [^>  ] [<^> ] [<^  ] | [^>  ]
 * —————— +    <—————— + ———————————————————— + ——————>
 *        |     [<v  ] | [v>  ] [<v> ] [<v  ] | [v>  ]
 * CENTER |     [<^v ] | [^v> ] [<^v>] [<^v ] | [^v> ]
 *        |     [<^  ] | [^>  ] [<^> ] [<^  ] | [^>  ]
 * —————— +    <—————— + ———————————————————— + ——————>
 * BOTTOM |     [<v  ] | [v>  ] [<v> ] [<v  ] | [v>  ]
 *        |            v                      v
 * ```
 */
export const Position = {
	LeftTop                : 'left-top',
	LeftCenterToBottom     : 'left-center-to-bottom',
	LeftCenter             : 'left-center',
	LeftCenterToTop        : 'left-center-to-top',
	LeftBottom             : 'left-bottom',
	RightTop               : 'right-top',
	RightCenterToBottom    : 'right-center-to-bottom',
	RightCenter            : 'right-center',
	RightCenterToTop       : 'right-center-to-top',
	RightBottom            : 'right-bottom',
	CenterTopToRight       : 'center-top-to-right',
	CenterTop              : 'center-top',
	CenterTopToLeft        : 'center-top-to-left',
	CenterBottomToRight    : 'center-bottom-to-right',
	CenterBottom           : 'center-bottom',
	CenterBottomToLeft     : 'center-bottom-to-left',
	CenterCenterLeftTop    : 'center-center-left-top',
	CenterCenterLeft       : 'center-center-left',
	CenterCenterLeftBottom : 'center-center-left-bottom',
	CenterCenterTop        : 'center-center-top',
	CenterCenter           : 'center-center',
	CenterCenterBottom     : 'center-center-bottom',
	CenterCenterRightTop   : 'center-center-right-top',
	CenterCenterRight      : 'center-center-right',
	CenterCenterRightBottom: 'center-center-right-bottom'
} as const
export type Position = typeof Position[keyof typeof Position]

export const EventTypes = {
	Toggle: 'br:toggle'
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'br-popover'
const VALID_POSITION = new Set(Object.values(Position))
const ELEMENTS = new Set<BiruPopoverElement>()
const ELEMENT_BY_IDS = new Map<string, BiruPopoverElement>()
const POPOVER_MARGIN = 8
const DEFAULT_POPOVER_GAP = 8
const DEFAULT_POPOVER_POSITION = Position.CenterBottom
const OPENED_POPOVER = new Set<BiruPopoverElement>()

export class BiruPopoverElement extends HTMLElement {
	static observedAttributes = [
		Attributes.Gap,
		Attributes.Position,
		Attributes.Padding,
		Attributes.Manual,
		'id'
	]

	private _shadowElementsListenerDesctructor: (() => unknown) | undefined
	private _theme: BrTheme.BiruThemeElement | undefined
	private _lastFocusElement: HTMLElement | null
	private _lastPointer: {x: number, y: number} | undefined
	private _lastAnchorElement: HTMLElement | undefined
	private _isOpen = false
	private _timeReposition: ReturnType<typeof setTimeout> | undefined
	private _slot: HTMLSlotElement

	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})
		const slot = this._slot = document.createElement('slot')
		shadow.adoptedStyleSheets = [STYLES]
		shadow.append(slot)
		this.tabIndex = 0
		this.role = 'dialog'
		this._lastFocusElement = null
	}

	get $isOpen(): boolean {
		return this._isOpen
	}

	get $manual(): boolean {
		return this.hasAttribute(Attributes.Manual)
	}

	set $manual(value: boolean) {
		this.toggleAttribute(Attributes.Manual, value)
	}

	set $padding(value: number) {
		if (Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
			return
		}

		this.setAttribute(Attributes.Padding, value + '')
	}

	get $padding(): number {
		const padding = this.getAttribute(Attributes.Padding)
		let defaultPadding = Number.parseFloat(window.getComputedStyle(this).paddingTop)
		if (Number.isNaN(defaultPadding) || !Number.isFinite(defaultPadding) || defaultPadding < 0) {
			defaultPadding = 16
		}

		if (!padding) {
			return defaultPadding
		}

		const parsedPadding = Number.parseFloat(padding)
		if (Number.isNaN(parsedPadding) || !Number.isFinite(parsedPadding) || parsedPadding < 0) {
			return defaultPadding
		}

		return parsedPadding
	}

	set $gap(value: number) {
		if (Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
			return
		}

		this.setAttribute(Attributes.Gap, value + '')
	}

	get $gap(): number {
		const gap = this.getAttribute(Attributes.Gap)
		if (!gap) {
			return DEFAULT_POPOVER_GAP
		}

		const parsedGap = Number.parseFloat(gap)
		if (Number.isNaN(parsedGap) || !Number.isFinite(parsedGap) || parsedGap < 0) {
			return DEFAULT_POPOVER_GAP
		}

		return parsedGap
	}

	set $position(value: Position) {
		this.setAttribute(Attributes.Position, value)
	}

	get $position(): Position {
		const position = this.getAttribute(Attributes.Position) as Position | undefined
		if (!position || !VALID_POSITION.has(position)) {
			return DEFAULT_POPOVER_POSITION
		}

		return position
	}

	connectedCallback(): void {
		ELEMENTS.add(this)
		ELEMENT_BY_IDS.set(this.id, this)
		this.tabIndex = 0
		this.role = 'dialog'
		this._theme = this.closest(BrTheme.TAGNAME) ?? undefined
		this._shadowElementsListenerDesctructor = shadowElementsListener(
			[this._slot, 'slotchange', () => {
				if (this.firstElementChild?.tagName === 'MENU') {
					this.style.setProperty(CSSVars.Padding, '.25rem')
				}
				else {
					this.style.removeProperty(CSSVars.Padding)
				}
			}]
		)
	}

	disconnectedCallback(): void {
		this.$close()
		this._theme = undefined
		this._lastFocusElement = null
		this._lastAnchorElement = undefined
		this._shadowElementsListenerDesctructor?.()
		ELEMENT_BY_IDS.delete(this.id)
		ELEMENTS.delete(this)
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		switch (name) {
		case Attributes.Gap:
		case Attributes.Position:
		case Attributes.Padding:
			this.$reposition(25)
			break
		case 'id':
			if (oldValue) {
				ELEMENT_BY_IDS.delete(oldValue)
			}

			if (newValue) {
				ELEMENT_BY_IDS.set(newValue, this)
			}
			break
		case Attributes.Manual:
			if (this._isOpen) {
				registerZIndex(this, !this.hasAttribute(Attributes.Manual))
			}
		}
	}

	$toggle(anchorElement?: HTMLElement, pointer?: {x: number, y: number}): void {
		if (this._isOpen) {
			this.$close()
		}
		else {
			this.$open(anchorElement, pointer)
		}
	}

	$open(anchorElement?: HTMLElement, pointer?: {x: number, y: number}): void {
		if (!this.isConnected) {
			return
		}

		const zIndex = registerZIndex(this, !this.$manual)
		this._isOpen = true
		this._lastAnchorElement = anchorElement
		this._lastPointer = pointer
		const originalOpacity = this.style.opacity
		this.style.setProperty('opacity', '0') // To avoid ui jump movement
		this.style.setProperty('display', 'block')
		this.style.setProperty('z-index', zIndex + '')
		this.$reposition()
		OPENED_POPOVER.add(this)
		this.dispatchEvent(new CustomEvent(EventTypes.Toggle))
		this._lastFocusElement = document.activeElement as HTMLElement | null
		this.tabIndex = 0
		this.focus()
		if (originalOpacity) {
			this.style.setProperty('opacity', originalOpacity)
		}
		else {
			this.style.removeProperty('opacity')
		}

		const max = Math.max(this.offsetWidth, this.offsetHeight)
		const startScale = (max / (max + 16) * 100) + '%'
		this.getAnimations().forEach(v => v.cancel())
		this.animate({
			opacity: [0, 1],
			scale: [startScale, '1']
		}, {easing: 'cubic-bezier(.25,0,0,1)', duration: this._theme?.$transitionDuration ?? 0})
	}

	$reposition(delayDurationMS = 0): void {
		if (!this._isOpen || !this.isConnected) {
			return
		}

		clearTimeout(this._timeReposition)
		this._timeReposition = setTimeout(() => {
			const prevPosition = this.getBoundingClientRect()

			// to recalculate. Avoid calculate rect with text wrap
			this.style.setProperty(CSSVars.X, '0px')
			this.style.setProperty(CSSVars.Y, '0px')

			const [x, y] = _calculatePosition(
				this.getBoundingClientRect(),
				this._lastAnchorElement?.getBoundingClientRect(),
				this._lastPointer, {
					padding: this.$padding,
					gap: this.$gap,
					position: this.$position
				}
			)

			this.style.setProperty(CSSVars.X, x + 'px')
			this.style.setProperty(CSSVars.Y, y + 'px')
			if (delayDurationMS !== 0) {
				this.animate({
					translate: [`${prevPosition.x - x}px ${prevPosition.y - y}px`, '0 0'],
				},{easing: 'cubic-bezier(.25,0,0,1)', duration: this._theme?.$transitionDuration ?? 0})
			}
		}, delayDurationMS)
	}

	$close(recursive = true, animation = true) {
		if (recursive) {
			this.querySelectorAll(TAGNAME).forEach(v => (v as BiruPopoverElement).$close(false, false))
			this.querySelectorAll(BrDialog.TAGNAME).forEach(v => (v as BrDialog.BiruDialogElement).$close(false, false))
		}

		const max = Math.max(this.offsetWidth, this.offsetHeight)
		const startScale = (max / (max + 16) * 100) + '%'
		this.getAnimations().forEach(v => v.cancel())
		this.animate({
			opacity: [1, 0],
			scale: ['1', startScale]
		}, {easing: 'cubic-bezier(.25,0,0,1)', duration: !animation? 0 : this._theme?.$transitionDuration ?? 0}).finished.then(() => {
			this.style.removeProperty('z-index')
			this.style.removeProperty('display')
			this._isOpen = false
			this._lastFocusElement?.focus()
			this._lastFocusElement = null
			this._lastAnchorElement = undefined
			this._lastPointer = undefined
			unregisterZIndex(this)
			OPENED_POPOVER.delete(this)
			this.dispatchEvent(new CustomEvent(EventTypes.Toggle))
		})
	}
}

function _calculatePosition(
	popover: DOMRect,
	anchor?: DOMRect,
	pointer?: {x: number, y: number},
	options?: {
		gap?: number,
		padding?: number,
		position?: Position
	}
): [x: number, y: number] {
	if (!anchor && !pointer) {
		return [POPOVER_MARGIN, POPOVER_MARGIN]
	}

	let {
		position = Position.CenterBottom,
		gap = 8,
		padding = 8
	} = options ?? {}
	const screenWidth = window.innerWidth
	const screenHeight = window.innerHeight
	const anchorRect = (pointer
		? {
			left: pointer.x,
			right: pointer.x,
			top: pointer.y,
			bottom: pointer.y,
			height: 0,
			width: 0,
		} : anchor!) as DOMRect
	const midOffsetScreenTop = screenHeight / 2
	const midOffsetScreenLeft = screenWidth / 2
	const midOffsetElementTop = anchorRect.top + (anchorRect.height / 2)
	const midOffsetElementLeft = anchorRect.left + (anchorRect.width  / 2)
	const maxWidth = screenWidth - POPOVER_MARGIN * 2
	const maxHeight = screenHeight - POPOVER_MARGIN * 2
	const edgeOffsetTop = POPOVER_MARGIN
	const edgePositionLeft = POPOVER_MARGIN
	const edgePositionBottom = screenHeight - POPOVER_MARGIN
	const edgePositionRight = screenWidth - POPOVER_MARGIN
	let top: number = 0
	let left: number = 0
	const right: () => number = () => left + popover.width
	const bottom: () => number = () => top + popover.height
	popover.width = popover.width > maxWidth
		? maxWidth
		: popover.width
	popover.height = popover.height > maxHeight
		? maxHeight
		: popover.height

	// fallback position
	if (!VALID_POSITION.has(position)) {
		position = Position.CenterBottom
	}

	// find x position
	switch (position) {
	case Position.LeftTop:
	case Position.LeftCenterToBottom:
	case Position.LeftCenter:
	case Position.LeftCenterToTop:
	case Position.LeftBottom:
		left = anchorRect.left - popover.width - gap
		if (left < edgePositionLeft) {
			left = (midOffsetElementLeft < midOffsetScreenLeft
				? anchorRect.right + gap
				: edgePositionLeft
			)
		}
		break
	case Position.CenterTopToRight:
	case Position.CenterCenterLeftTop:
	case Position.CenterCenterLeft:
	case Position.CenterCenterLeftBottom:
	case Position.CenterBottomToRight:
		left = anchorRect.left - padding
		if (right() > edgePositionRight) {
			left = (midOffsetElementLeft > midOffsetScreenLeft
				? anchorRect.right - popover.width + padding
				: edgePositionRight - popover.width
			)
		}
		break
	case Position.CenterTop:
	case Position.CenterCenterTop:
	case Position.CenterCenter:
	case Position.CenterCenterBottom:
	case Position.CenterBottom:
		left = anchorRect.left
		left += (anchorRect.width / 2)
		left -= (popover.width / 2)
		break
	case Position.CenterTopToLeft:
	case Position.CenterCenterRightTop:
	case Position.CenterCenterRight:
	case Position.CenterCenterRightBottom:
	case Position.CenterBottomToLeft:
		left = anchorRect.right - popover.width + padding
		if (left < edgePositionLeft) {
			left = (midOffsetElementLeft < midOffsetScreenLeft
				? anchorRect.left - padding
				: edgePositionLeft
			)
		}
		break
	case Position.RightTop:
	case Position.RightCenterToBottom:
	case Position.RightCenter:
	case Position.RightCenterToTop:
	case Position.RightBottom:
		left = anchorRect.right + gap
		if (right() > edgePositionRight) {
			left = (midOffsetElementLeft > midOffsetScreenLeft
				? anchorRect.left - popover.width - gap
				: edgePositionRight - popover.width
			)
		}
		break
	}

	// find y position
	switch (position) {
	case Position.LeftTop:
	case Position.CenterTopToRight:
	case Position.CenterTop:
	case Position.CenterTopToLeft:
	case Position.RightTop:
		top = anchorRect.top - popover.height - gap
		if (top < edgeOffsetTop) {
			top = (midOffsetElementTop < midOffsetScreenTop
				? anchorRect.bottom + gap
				: edgeOffsetTop
			)
		}
		break
	case Position.LeftCenterToBottom:
	case Position.CenterCenterLeftTop:
	case Position.CenterCenterTop:
	case Position.CenterCenterRightTop:
	case Position.RightCenterToBottom:
		top = anchorRect.top - padding
		if (bottom() > edgePositionBottom) {
			top = (midOffsetElementTop > midOffsetScreenTop
				? anchorRect.bottom - popover.height + padding
				: edgePositionBottom - popover.height
			)
		}
		break
	case Position.LeftCenter:
	case Position.CenterCenterLeft:
	case Position.CenterCenter:
	case Position.CenterCenterRight:
	case Position.RightCenter:
		top = anchorRect.top + (anchorRect.height / 2) - (popover.height / 2)
		break
	case Position.LeftCenterToTop:
	case Position.CenterCenterLeftBottom:
	case Position.CenterCenterBottom:
	case Position.CenterCenterRightBottom:
	case Position.RightCenterToTop:
		top = anchorRect.bottom - popover.height + padding
		if (top < edgeOffsetTop) {
			top = (midOffsetElementTop < midOffsetScreenTop
				? anchorRect.top - padding
				: edgeOffsetTop
			)
		}
		break
	case Position.LeftBottom:
	case Position.CenterBottomToRight:
	case Position.CenterBottom:
	case Position.CenterBottomToLeft:
	case Position.RightBottom:
		top = anchorRect.bottom + gap
		if (bottom() > edgePositionBottom) {
			top = (midOffsetElementTop > midOffsetScreenTop
				? anchorRect.top - popover.height - gap
				: edgePositionBottom - popover.height
			)
		}
	}

	// final fallback
	if (top < edgeOffsetTop) top = edgeOffsetTop
	if (bottom() > edgePositionBottom) top = edgePositionBottom - popover.height
	if (left < edgePositionLeft) left = edgePositionLeft
	if (right() > edgePositionRight) left = edgePositionRight - popover.width
	return [left, top]
}

function _initListeners(): void {
	let popoverToKeepAlive: BiruPopoverElement | undefined

	window.addEventListener('resize', () => {
		for (const popover of OPENED_POPOVER) {
			popover.$reposition(250)
		}
	})

	document.addEventListener('click', (ev) => {
		const target = (ev.target as HTMLElement).closest<HTMLElement>(`[${CSS.escape(GlobalAttributes.CommandFor)}]`)
		if (!target) {
			return
		}

		const popoverId = target.getAttribute(GlobalAttributes.CommandFor)
		if (!popoverId || !ELEMENT_BY_IDS.has(popoverId)) {
			return
		}

		const popover = ELEMENT_BY_IDS.get(popoverId)!
		const action = target.getAttribute(GlobalAttributes.Command) || Commands.TogglePopover
		switch (action) {
		case Commands.ClosePopover: return popover.$close()
		case Commands.OpenPopover: return popover.$open(target)
		case Commands.TogglePopover: return popover.$toggle(target)
		}
	})

	document.addEventListener('pointerdown', (ev) => {
		const popover = (ev.target as HTMLElement).closest<BiruPopoverElement>(TAGNAME)
		if (!popover) {
			popoverToKeepAlive = undefined
			return
		}

		popoverToKeepAlive = popover
	})

	document.addEventListener('pointerup', (ev) => {
		let popoverToKeepAlive2: BiruPopoverElement | undefined

		// Avoid event order problem.
		// Event starting from "pointerdown" -> "pointerup" -> "click".
		// Without this, popover cannot be toggle by button[popovertargetaction=toggle]
		CLICK_EVENT: {
			const target = (ev.target as HTMLElement).closest<HTMLElement>(`[${CSS.escape(GlobalAttributes.CommandFor)}]`)
			if (!target) {
				break CLICK_EVENT
			}

			const popoverId = target.getAttribute(GlobalAttributes.CommandFor)
			if (!popoverId || !ELEMENT_BY_IDS.has(popoverId)) {
				break CLICK_EVENT
			}

			popoverToKeepAlive2 = ELEMENT_BY_IDS.get(popoverId)!
		}

		for (const p of OPENED_POPOVER) {
			if (popoverToKeepAlive && (
				p === popoverToKeepAlive
				|| p.contains(popoverToKeepAlive)
			)) {
				continue
			}

			if (popoverToKeepAlive2 && (
				p === popoverToKeepAlive2
				|| p.contains(popoverToKeepAlive2)
			)) {
				continue
			}

			if (p.hasAttribute(Attributes.Manual)) {
				continue
			}

			p.$close(true, false)
		}
	})
}

function _initDefaultStyle(): void {
	STYLES.replaceSync(`
:host {
	${CSSVars.X}: 0px;
	${CSSVars.Y}: 0px;
	left: var(${CSSVars.X});
	top: var(${CSSVars.Y});
	display: none;
	position: fixed;
	background-color: rgb(var(${BrTheme.CSSVars.ColorSurface}));
	border: 1px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	max-height: calc(100dvh - ${POPOVER_MARGIN*2}px);
	max-width: calc(100% - ${POPOVER_MARGIN*2}px);
	overflow: auto;
	padding: var(${CSSVars.Padding}, 1rem);
	box-shadow: 0 .25rem .5rem rgba(0, 0, 0, .25);
	border-radius: .5rem;
}
`)}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyle()
	_initListeners()
	customElements.define(TAGNAME, BiruPopoverElement)
}

define()