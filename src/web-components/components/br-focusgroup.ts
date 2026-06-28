export const Attributes = {
	/**
	 * Direction of focus key. Default `"both"`
	 *
	 * @type {string} `"vertical" | "horizontal" | "both" | "grid"` */
	Direction: 'br:direction',

	/**
	 * Element ids. Separated by space character. If [br:query-for] not
	 * present, then all focusable children.
	 *
	 * @type {string[]}
	 * */
	For: 'br:for',

	/**
	 * CSS Query for multiple elements. Only used when [br:for] not exist
	 */
	QueryFor: 'br:query-for',

	/**
	 * Disables the roving tabindex behavior when present.
	 *
	 * @type {boolean}
	 * */
	DisableAutoTabindex: 'br:disabled-auto-tabindex'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const Direction = {
	Vertical: 'vertical',
	Horizontal: 'horizontal',
	Both: 'both',
	Grid: 'grid',
} as const
export type Direction = typeof Direction[keyof typeof Direction]

export const TAGNAME = 'br-focusgroup'
const STYLES = new CSSStyleSheet()

export class BiruFocusGroupElement extends HTMLElement {
	static observedAttributes = [
		Attributes.Direction,
		Attributes.DisableAutoTabindex
	]

	private _direction: Direction = Direction.Both
	private _disableAutoTabindex: boolean = false
	private _elementCache: HTMLElement[] = []
	private _cacheTimer: ReturnType<typeof setTimeout> | undefined
	private _backupAttr = `data-br-${crypto.randomUUID().substring(0, 8)}`

	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})
		shadow.adoptedStyleSheets = [STYLES]
		shadow.append(document.createElement('slot'))

		this.addEventListener('keydown', this)
		this.addEventListener('focusin', this)
		this.addEventListener('focusout', this)
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
		switch (name) {
		case Attributes.Direction:
			this._direction = (Object.values(Direction).includes(newValue as Direction)
				? newValue as Direction
				: Direction.Both
			)
			break
		case Attributes.DisableAutoTabindex:
			this._disableAutoTabindex = newValue !== null
			break
		}
	}

	handleEvent(ev: Event): void {
		switch (ev.type) {
		case 'keydown': return this._keydown(ev as KeyboardEvent)
		case 'focusin': return this._focusin(ev as FocusEvent)
		case 'focusout': return this._focusout(ev as FocusEvent)
		}
	}

	private _getElements(): HTMLElement[] {
		const rawFor = this.getAttribute(Attributes.For)
		const elements: HTMLElement[] = []
		if (rawFor) {
			const ids = rawFor.trim().split(/ +/)
			for (const id of ids) {
				if (!id) {
					continue
				}

				const element = document.getElementById(id)
				if (element) {
					elements.push(element)
				}
			}
		}

		if (elements.length > 0) {
			return elements
		}

		if (!this.hasAttribute(Attributes.For)) {
			try {
				for (const element of this.querySelectorAll(this.getAttribute(Attributes.QueryFor) || '')) {
					elements.push(element as HTMLElement)
				}
			} catch {}
		}

		const FOCUSABLE_SELECTOR = `a[href],button,input,textarea,select,details,[tabindex]`
		const allFocusable = Array.from(this.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
		let autoElements = allFocusable.filter(el => el.closest(TAGNAME) === this)

		return autoElements
	}

	private _focusin(ev: FocusEvent): void {
		if (this._disableAutoTabindex) {
			return
		}

		const target = ev.target as HTMLElement
		const elements = this._elementCache.length > 0 ? this._elementCache : this._getElements()
		if (!elements.includes(target)) {
			return
		}

		for (const el of elements) {
			if (!el.hasAttribute(this._backupAttr)) {
				const originalTabindex = el.getAttribute('tabindex')
				el.setAttribute(this._backupAttr, originalTabindex !== null ? originalTabindex : 'null')
			}

			el.setAttribute('tabindex', el === target ? '0' : '-1')
		}
	}

	private _focusout(ev: FocusEvent): void {
		if (this._disableAutoTabindex) {
			return
		}

		const relatedTarget = ev.relatedTarget as HTMLElement | null
		const elements = this._elementCache.length > 0 ? this._elementCache : this._getElements()
		if (relatedTarget && elements.includes(relatedTarget)) {
			return
		}

		for (const el of elements) {
			const backupValue = el.getAttribute(this._backupAttr)
			if (backupValue === 'null') {
				el.removeAttribute('tabindex')
			}
			else if (backupValue !== null) {
				el.setAttribute('tabindex', backupValue)
			}

			el.removeAttribute(this._backupAttr)
		}

		this._backupAttr = `data-br-${crypto.randomUUID().substring(0, 8)}`
	}

	private _keydown(ev: KeyboardEvent) {
		const key = ev.key
		if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
			return
		}

		if (this._direction === Direction.Vertical && !['ArrowUp', 'ArrowDown'].includes(key)) {
			return
		}

		if (this._direction === Direction.Horizontal && !['ArrowLeft', 'ArrowRight'].includes(key)) {
			return
		}

		clearTimeout(this._cacheTimer)
		if (this._elementCache.length === 0) {
			this._elementCache = this._getElements()
		}

		const len = this._elementCache.length
		if (len === 0) {
			return
		}

		const activeEl = document.activeElement as HTMLElement | null
		const currentIndex = activeEl ? this._elementCache.indexOf(activeEl) : -1
		let nextElement: HTMLElement | null = null

		if (this._direction === Direction.Grid && (key === 'ArrowUp' || key === 'ArrowDown')) {
			if (currentIndex === -1) {
				nextElement = this._elementCache.find(el => this._isValidElement(el)) || null
			}
			else {
				const dir = key === 'ArrowUp' ? 'up' : 'down'
				nextElement = this._getSpatialNextElement(activeEl!, dir)
				if (!nextElement) {
					nextElement = this._getSpatialWrapElement(activeEl!, dir)
				}
			}
		}
		else {
			const step = (key === 'ArrowDown' || key === 'ArrowRight') ? 1 : -1
			let nextIndex = currentIndex !== -1 ? currentIndex : (step === 1 ? -1 : 0)
			let attempts = 0

			while (attempts < len) {
				nextIndex = (nextIndex + step + len) % len
				const el = this._elementCache[nextIndex]
				if (this._isValidElement(el)) {
					nextElement = el
					break
				}

				attempts++
			}
		}

		if (nextElement) {
			ev.preventDefault() // element like <select> will open
			ev.stopPropagation()
			nextElement.focus()
		}

		this._cacheTimer = setTimeout(() => {
			this._elementCache = []
		}, 300)
	}

	private _isValidElement(el: HTMLElement): boolean {
		const isDisabled = el.hasAttribute('disabled') || (el as HTMLButtonElement).disabled
		const isHidden = el.offsetWidth === 0 && el.offsetHeight === 0
		return !isDisabled && !isHidden
	}

	private _getSpatialNextElement(current: HTMLElement, direction: 'up' | 'down'): HTMLElement | null {
		const currentRect = current.getBoundingClientRect()
		let closestEl: HTMLElement | null = null
		let minVertDiff = Infinity
		let minHorizDiff = Infinity

		for (const el of this._elementCache) {
			if (el === current || !this._isValidElement(el)) continue

			const rect = el.getBoundingClientRect()
			const isAbove = rect.top < currentRect.top
			const isBelow = rect.top > currentRect.top
			if ((direction === 'up' && !isAbove) || (direction === 'down' && !isBelow)) {
				continue
			}

			const vertDiff = Math.abs(rect.top - currentRect.top)
			const horizDiff = Math.abs(rect.left - currentRect.left)
			if (vertDiff < minVertDiff - 5) {
				minVertDiff = vertDiff
				minHorizDiff = horizDiff
				closestEl = el
			}
			else if (Math.abs(vertDiff - minVertDiff) <= 5 && horizDiff < minHorizDiff) {
				minHorizDiff = horizDiff
				closestEl = el
			}
		}

		return closestEl
	}

	private _getSpatialWrapElement(current: HTMLElement, direction: 'up' | 'down'): HTMLElement | null {
		const currentRect = current.getBoundingClientRect()
		let wrapEl: HTMLElement | null = null
		let targetVert = direction === 'up' ? -Infinity : Infinity
		for (const el of this._elementCache) {
			if (el === current || !this._isValidElement(el)) {
				continue
			}

			const rect = el.getBoundingClientRect()
			const horizDiff = Math.abs(rect.left - currentRect.left)
			if (horizDiff > 5) {
				continue
			}

			if (direction === 'up' && rect.top > targetVert) {
				targetVert = rect.top
				wrapEl = el
			}
			else if (direction === 'down' && rect.top < targetVert) {
				targetVert = rect.top
				wrapEl = el
			}
		}

		return wrapEl
	}
}

function _initDefaultStyles(): void {
	STYLES.replaceSync(':host {display: contents}')
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyles()
	customElements.define(TAGNAME, BiruFocusGroupElement)
}

define()