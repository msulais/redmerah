import * as BrTheme from './br-theme.js'
import * as BrPopover from './br-popover.js'
import { registerZIndex, unregisterZIndex } from "../_flyout"
import { Commands, GlobalAttributes } from "../global-attributes"
import { slotEmptyListeners } from '../_utils.js'

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
	Manual: 'br:manual'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'br-dialog'
const ELEMENT_BY_IDS = new Map<string, BiruDialogElement>()
const DIALOG_MARGIN = 16
let lastOpenedDialog: BiruDialogElement | undefined

export class BiruDialogElement extends HTMLElement {
	static observedAttributes = [
		Attributes.Manual,
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

	get $manual(): boolean {
		return this.hasAttribute(Attributes.Manual)
	}

	set $manual(value: boolean) {
		this.toggleAttribute(Attributes.Manual, value)
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
		this.$close()
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
		case Attributes.Manual:
			if (this._isOpen) {
				registerZIndex(this, !this.hasAttribute(Attributes.Manual))
			}
		}
	}

	$open(): void {
		if (!this.isConnected) {
			return
		}

		backdrop: {
			const backdrop = this._backdropElement = document.createElement('div')
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
				if (this.$manual) {
					return
				}

				const dialog = (ev.target as HTMLElement).closest(TAGNAME)
				if (dialog === this) {
					return
				}

				this.$close()
			})
			this.before(backdrop)
			break backdrop
		}

		if (!this._isOpen) {
			lastOpenedDialog = this
		}

		this.style.setProperty('display', 'flex')
		this.style.setProperty('z-index', registerZIndex(this, !this.$manual) + '')
		this._lastFocusElement = document.activeElement as HTMLElement | null
		this.tabIndex = 0
		this._isOpen = true
		this.focus()
		this.dispatchEvent(new CustomEvent(EventTypes.Toggle))

		const max = Math.max(this.offsetWidth, this.offsetHeight)
		const startScale = (max / (max + 32) * 100) + '%'
		const animationOptions = {
			easing: 'cubic-bezier(.25,0,0,1)',
			duration: this._theme?.$transitionDuration ?? 0
		}
		this.getAnimations().forEach(v => v.cancel())
		this._backdropElement.animate({
			opacity: [0, 1]
		}, animationOptions)
		this.animate({
			opacity: [0, 1],
			scale: [startScale, '1']
		}, animationOptions)
	}

	$close(recursive = true, animation = true): void {
		if (recursive) {
			this.querySelectorAll(TAGNAME).forEach(v => (v as BiruDialogElement).$close(false, false))
			this.querySelectorAll(BrPopover.TAGNAME).forEach(v => (v as BrPopover.BiruPopoverElement).$close(false, false))
		}

		if (this._backdropElement) {
			unregisterZIndex(this._backdropElement)
		}

		const max = Math.max(this.offsetWidth, this.offsetHeight)
		const startScale = (max / (max + 32) * 100) + '%'
		const animationOptions = {
			easing: 'cubic-bezier(.25,0,0,1)',
			duration: !animation? 0 : this._theme?.$transitionDuration ?? 0
		}
		this.getAnimations().forEach(v => v.cancel())
		this._backdropElement?.animate({
			opacity: [1, 0]
		}, animationOptions)
		this.animate({
			opacity: [1, 0],
			scale: ['1', startScale]
		}, animationOptions).finished.then(() => {
			unregisterZIndex(this)
			this._backdropElement?.remove()
			this._backdropElement = undefined
			this._lastFocusElement?.focus()
			this._lastFocusElement = null
			this._isOpen = false
			this.style.removeProperty('display')
			this.style.removeProperty('z-index')
			this.dispatchEvent(new CustomEvent(EventTypes.Toggle))
			if (lastOpenedDialog === this) {
				lastOpenedDialog = undefined
			}
		})
	}
}

function _initListeners(): void {
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
		case Commands.CloseDialog: return popover.$close()
		case Commands.OpenDialog: return popover.$open()
		}
	})

	document.addEventListener('keydown', (ev) => {
		if (!lastOpenedDialog || ev.key !== 'Tab') {
			return
		}

		const current = document.activeElement
		const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
		const focusableElements = Array.from(lastOpenedDialog.querySelectorAll(focusableSelector)) as unknown as HTMLElement[]
		focusableElements.unshift(lastOpenedDialog)
		focusableElements.filter(el =>
			!(el as HTMLButtonElement)?.disabled && el.offsetParent !== null
		)

		if (focusableElements.length === 0) {
			lastOpenedDialog.focus()
			ev.preventDefault()
			return
		}

		const index = focusableElements.findIndex(v => v === current)
		if (index < 0) {
			lastOpenedDialog.focus()
			ev.preventDefault()
			return
		}

		if (ev.shiftKey && index === 0) {
			focusableElements[focusableElements.length-1].focus()
			ev.preventDefault()
		}
		else if (index === focusableElements.length - 1) {
			lastOpenedDialog.focus()
			ev.preventDefault()
		}
	})
}

function _initDefaultStyle(): void {
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

	_initDefaultStyle()
	_initListeners()
	customElements.define(TAGNAME, BiruDialogElement)
}

define()