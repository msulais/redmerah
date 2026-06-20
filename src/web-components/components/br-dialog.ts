import * as BrTheme from './br-theme.js'
import * as BrPopover from './br-popover.js'
import { registerZIndex, unregisterZIndex } from "../flyout.js"
import { Commands, GlobalAttributes } from "../global-attributes"
import { slotEmptyListeners } from '../utils.js'
import { listenDocumentEvent } from '../event-registry.js'

export const Parts = {
	Title: 'title',
	Content: 'content',
	Footer: 'footer'
} as const
export type Parts = typeof Parts[keyof typeof Parts]

export const Slots = {
	Title: 'title',
	Header: 'header',
	Footer: 'footer'
} as const
export type Slots = typeof Slots[keyof typeof Slots]

export const EventTypes = {
	Toggle: 'br:toggle'
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export const Attributes = {
	/**
	 * @type {boolean} */
	Manual: 'br:manual'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const TAGNAME = 'br-dialog'
const ELEMENT_BY_IDS = new Map<string, BiruDialogElement>()
const STYLES = new CSSStyleSheet()
const DIALOG_MARGIN = 16
let _lastOpenedDialog: BiruDialogElement | undefined

export class BiruDialogElement extends HTMLElement {
	static observedAttributes = [
		'id'
	]

	private _theme: BrTheme.BiruThemeElement | undefined
	private _emptySlotListenerDesctructor: (() => unknown) | undefined
	private _lastFocusElement: HTMLElement | null
	private _backdropElement: HTMLDivElement | undefined
	private _isOpen = false

	constructor() {
		super()

		const shadow = this.attachShadow({ mode: 'open' })
		shadow.adoptedStyleSheets = [STYLES]
		shadow.innerHTML = `
			<h2 part="${Parts.Title}"><slot name="${Slots.Title}"></slot></h2>
			<slot name="${Slots.Header}"></slot>
			<div part="${Parts.Content}"><slot></slot></div>
			<div part="${Parts.Footer}"><slot name="${Slots.Footer}"></slot></div>
		`

		this.tabIndex = 0
		this.role = 'dialog'
		this.ariaModal = 'true'
		this._lastFocusElement = null
	}

	connectedCallback() {
		this._emptySlotListenerDesctructor = slotEmptyListeners(this.shadowRoot!,
			[Slots.Footer, Parts.Footer],
			[Slots.Title, Parts.Title],
		)
		this._theme = this.closest(BrTheme.TAGNAME) ?? undefined
		this.tabIndex = 0
		this.role = 'dialog'
		this.ariaModal = 'true'
		if (this.id) {
			ELEMENT_BY_IDS.set(this.id, this)
		}
	}

	disconnectedCallback(): void {
		this.biru.close()
		this._theme = undefined
		this._emptySlotListenerDesctructor?.()
		ELEMENT_BY_IDS.delete(this.id)
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		switch (name) {
		case 'id':
			if (oldValue) {
				ELEMENT_BY_IDS.delete(oldValue)
			}

			if (newValue) {
				ELEMENT_BY_IDS.set(newValue, this)
			}
			break
		}
	}

	get biru() {
		const self = this
		return {
			get manual(): boolean {
				return self.hasAttribute(Attributes.Manual)
			},
			set manual(value: boolean) {
				self.toggleAttribute(Attributes.Manual, value)
			},
			get isOpen(): boolean {
				return self._isOpen
			},
			toggle() {
				if (this.isOpen) {
					this.close()
				}
				else {
					this.open()
				}
			},
			open() {
				if (!self.isConnected) {
					return
				}

				backdrop: {
					const backdrop = self._backdropElement = document.createElement('div')
					backdrop.style.setProperty('position', 'fixed')
					backdrop.style.setProperty('width', '100%')
					backdrop.style.setProperty('height', '100%')
					backdrop.style.setProperty('top', '0')
					backdrop.style.setProperty('left', '0')
					backdrop.style.setProperty('backdrop-filter', 'blur(4px)')
					backdrop.style.setProperty('background-color', '#00000080')
					backdrop.style.setProperty('z-index', registerZIndex(backdrop) + '')
					backdrop.addEventListener('click', (ev) => {
						ev.stopPropagation()
						if (this.manual) {
							return
						}

						const dialog = (ev.target as HTMLElement).closest(TAGNAME)
						if (dialog === self) {
							return
						}

						this.close()
					})
					self.before(backdrop)
					break backdrop
				}

				if (!self._isOpen) {
					_lastOpenedDialog = self
				}

				self.style.setProperty('display', 'flex')
				self.style.setProperty('z-index', registerZIndex(self, (ref) => {
					if (this.manual) {
						return
					}

					ref.biru.close()
				}) + '')
				self._lastFocusElement = document.activeElement as HTMLElement | null
				self.tabIndex = 0
				self._isOpen = true
				self.focus()
				self.dispatchEvent(new CustomEvent(EventTypes.Toggle))

				const max = Math.max(self.offsetWidth, self.offsetHeight)
				const startScale = (max / (max + 32) * 100) + '%'
				const animationOptions = {
					easing: 'cubic-bezier(.25,0,0,1)',
					duration: self._theme?.biru.transitionDuration ?? 0
				}
				self.getAnimations().forEach(v => v.cancel())
				self._backdropElement.animate({
					opacity: [0, 1]
				}, animationOptions)
				self.animate({
					opacity: [0, 1],
					scale: [startScale, '1']
				}, animationOptions)
			},
			close(recursive = true, animation = true) {
				if (recursive) {
					self.querySelectorAll(TAGNAME).forEach(v => (v as BiruDialogElement).biru.close(false, false))
					self.querySelectorAll(BrPopover.TAGNAME).forEach(v => (v as BrPopover.BiruPopoverElement).biru.close(false, false))
				}

				if (self._backdropElement) {
					unregisterZIndex(self._backdropElement)
				}

				const max = Math.max(self.offsetWidth, self.offsetHeight)
				const startScale = (max / (max + 32) * 100) + '%'
				const animationOptions = {
					easing: 'cubic-bezier(.25,0,0,1)',
					duration: !animation? 0 : self._theme?.biru.transitionDuration ?? 0
				}
				self.getAnimations().forEach(v => v.cancel())
				self._backdropElement?.animate({
					opacity: [1, 0]
				}, animationOptions)
				self.animate({
					opacity: [1, 0],
					scale: ['1', startScale]
				}, animationOptions).finished.then(() => {
					unregisterZIndex(self)
					self._backdropElement?.remove()
					self._backdropElement = undefined
					self._lastFocusElement?.focus()
					self._lastFocusElement = null
					self._isOpen = false
					self.style.removeProperty('display')
					self.style.removeProperty('z-index')
					self.dispatchEvent(new CustomEvent(EventTypes.Toggle))
					if (_lastOpenedDialog === self) {
						_lastOpenedDialog = undefined
					}
				})
			}
		}
	}
}

function _initListeners(): void {
	listenDocumentEvent('click', (ev) => {
		const target = (ev.target as HTMLElement).closest<HTMLElement>(`[${CSS.escape(GlobalAttributes.CommandFor)}]`)
		if (!target) {
			return
		}

		const popoverId = target.getAttribute(GlobalAttributes.CommandFor)
		if (!popoverId || !ELEMENT_BY_IDS.has(popoverId)) {
			return
		}

		const popover = ELEMENT_BY_IDS.get(popoverId)!
		const action = target.getAttribute(GlobalAttributes.Command) || Commands.ToggleDialog
		switch (action) {
		case Commands.CloseDialog: return popover.biru.close()
		case Commands.OpenDialog: return popover.biru.open()
		case Commands.ToggleDialog: return popover.biru.toggle()
		}
	})

	listenDocumentEvent<KeyboardEvent>('keydown', (ev) => {
		if (!_lastOpenedDialog || ev.key !== 'Tab') {
			return
		}

		const current = document.activeElement
		const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
		const focusableElements = Array.from(_lastOpenedDialog.querySelectorAll(focusableSelector)) as unknown as HTMLElement[]
		focusableElements.unshift(_lastOpenedDialog)
		focusableElements.filter(el =>
			!(el as HTMLButtonElement)?.disabled && el.offsetParent !== null
		)

		if (focusableElements.length === 0) {
			_lastOpenedDialog.focus()
			ev.preventDefault()
			return
		}

		const index = focusableElements.findIndex(v => v === current)
		if (index < 0) {
			_lastOpenedDialog.focus()
			ev.preventDefault()
			return
		}

		if (ev.shiftKey && index === 0) {
			focusableElements[focusableElements.length-1].focus()
			ev.preventDefault()
		}
		else if (index === focusableElements.length - 1) {
			_lastOpenedDialog.focus()
			ev.preventDefault()
		}
	})
}

function _initDefaultStyles(): void {
	STYLES.replaceSync(`
:host {
	position: fixed;
	margin: auto;
	inset: 0;
	width: max-content;
  	height: max-content;
	display: none;
	border-radius: .5rem;
	background-color: rgb(var(${BrTheme.CSSVars.ColorBackground}));
	border: 1px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	max-height: calc(100dvh - ${DIALOG_MARGIN*2}px);
	max-width: calc(100% - ${DIALOG_MARGIN*2}px);
	box-shadow: 0 .25rem 1rem rgba(0, 0, 0, .25);
	flex-direction: column;
	align-items: flex-start;
}

[part="${Parts.Content}"] {
	padding: 1.5rem;
	flex: 1;
	max-height: 100%;
	width: 100%;
	box-sizing: border-box;
	overflow: auto;
}

[part="${Parts.Footer}"] {
	display: flex;
	align-items: center;
	width: 100%;
	flex-wrap: wrap;
	box-sizing: border-box;
	gap: 8px;
	justify-content: flex-end;
	padding: .5rem 1.5rem 1.5rem 1.5rem;
}

[part="${Parts.Title}"] {
	width: 100%;
	font-size: 1.25rem;
	font-weight: 500;
	padding: 1.5rem 1.5rem 0rem 1.5rem;
	display: flex;
	box-sizing: border-box;
	margin: 0;
	line-height: 1;
	align-items: center;
	gap: 8px;
}

[part="${Parts.Title}"]:not(.empty) ~ [part="${Parts.Content}"] {
	padding-top: 1rem !important;
}

:is([part="${Parts.Title}"], [part="${Parts.Footer}"]).empty {
	display: none;
}
`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initListeners()
	_initDefaultStyles()
	customElements.define(TAGNAME, BiruDialogElement)
}

define()