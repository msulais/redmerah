import * as BrTheme from './br-theme.js'
import { listenRouteChange } from "../router.js"
import { QueryValidation } from "../utils.js"

export const Attributes = {
	/**
	 * Multiple path separated by space. Example: `"/ /a/b /a/b/e"`
	 *
	 * @type {string[]}
	 * */
	Path : 'br:path' ,

	/**
	 * Multiple hash target separated by space. Example: `"#id1 #id2 #id3"`
	 *
	 * @type {string[]}
	 * */
	Hash : 'br:hash' ,

	/**
	 * Complex url query. Example: `"(page=home | none) & id=2 & !date=now"`.
	 *
	 * Operator:
	 *
	 * * `&` = AND
	 * * `|` = OR
	 * * `!` = NOT
	 * * `none` = true
	 *
	 * @type {string}
	*/
	Query: 'br:query',

	/**
	 * Complex media query. Equal to how implement media query in CSS.
	 *
	 * Example: `"(not (width > 1000px)) and (color), print and (color)"`
	 *
	 * @type {string}
	 * */
	Media: 'br:media',

	/**
	 * Always move selected element here. Override any conditions.
	 *
	 * @type {boolean}
	 */
	Checked: 'br:moved',

	/**
	 * Element ids
	 *
	 * @type {string[]}
	 */
	For: 'br:for',

	/**
	 * Attribute name
	 *
	 * @type {string}
	 */
	Name: 'br:name',

	/**
	 * Attribute value
	 *
	 * @type {string}
	 */
	Value: 'br:value',

	/**
	 * Attribute value
	 *
	 * @type {string}
	 */
	Fallback: 'br:fallback',
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const EventTypes = {
	Toggle: 'br:toggle'
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export const TAGNAME = 'br-attributeif'
const ELEMENTS = new Set<BiruAttributeIfElement>()
const STYLES = new CSSStyleSheet()

export class BiruAttributeIfElement extends HTMLElement {
	private _media: MediaQueryList | undefined

	static observedAttributes = [
		Attributes.Path,
		Attributes.Query,
		Attributes.Hash,
		Attributes.Checked,
		Attributes.Media,
		Attributes.Fallback,
	]

	constructor() {
		super()
	}

	connectedCallback(): void {
		this._media?.addEventListener('change', this)
		ELEMENTS.add(this)
		_checkElementsState(this)
	}

	disconnectedCallback(): void {
		ELEMENTS.delete(this)
		this._media?.removeEventListener('change', this)
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
		switch (name as Attributes) {
		case Attributes.Path:
		case Attributes.Query:
		case Attributes.Hash:
		case Attributes.Name:
		case Attributes.Checked:
		case Attributes.Fallback:
			_checkElementsState(this)
			break
		case Attributes.Media:
			this._media?.removeEventListener('change', this)
			this._media = undefined
			if (newValue) {
				this._media = window.matchMedia(newValue)
				this._media?.addEventListener('change', this)
			}
		}
	}

	handleEvent(ev: Event) {
		switch (ev.type) {
		case 'change':
			_checkElementsState(this)
		}
	}

	get biru() {
		const self = this

		return {
			get targetElements() {
				const ids = (self.getAttribute(Attributes.For) || '').split(/ +/g)
				const elements: Element[] = []
				for (const id of ids) {
					const element = document.getElementById(id.trim())
					if (element) {
						elements.push(element)
					}
				}

				return elements
			},
			set targetElements(elements: Element[]) {
				const ids = new Set<string>()
				for (const element of elements) {
					let id = element.id
					if (id.trim().length === 0) {
						id = crypto.randomUUID()
						element.id = id
					}

					ids.add(id)
				}

				self.setAttribute(Attributes.For, ids.values().toArray().join(' '))
			},
			get checked(): boolean {
				return self.hasAttribute(Attributes.Checked)
			},
			set checked(value: boolean) {
				self.toggleAttribute(Attributes.Checked, value)
			},
			get name(): string | null {
				return self.getAttribute(Attributes.Name)
			},
			set name(value: string | null) {
				if (!value) {
					self.removeAttribute(Attributes.Name)
					return
				}

				self.setAttribute(Attributes.Name, value)
			},
			get value(): string | null {
				return self.getAttribute(Attributes.Value)
			},
			set value(value: string | null) {
				if (!value) {
					self.removeAttribute(Attributes.Value)
					return
				}

				self.setAttribute(Attributes.Value, value)
			},
			get fallback(): string | null {
				return self.getAttribute(Attributes.Fallback)
			},
			set fallback(value: string | null) {
				if (!value) {
					self.removeAttribute(Attributes.Fallback)
					return
				}

				self.setAttribute(Attributes.Fallback, value)
			},
			get path() {
				return self.getAttribute(Attributes.Path)?.split(/ +/) ?? []
			},
			set path(values: string[]) {
				if (values.length === 0) {
					self.removeAttribute(Attributes.Path)
					return
				}

				self.setAttribute(Attributes.Path, values.join(' '))
			},
			get query(): string {
				return (self.getAttribute(Attributes.Query) ?? '').replaceAll(' ', '')
			},
			set query(value: string | null) {
				if (value === null) {
					self.removeAttribute(Attributes.Query)
					return
				}

				self.setAttribute(Attributes.Query, value)
			},
			get hash() {
				return (
					self.getAttribute(Attributes.Hash)
					?.split(/ +/)
					.map(v => v.startsWith('#')? v : `#${v}`)
					?? []
				)
			},
			set hash(values: string[]) {
				if (values.length === 0) {
					self.removeAttribute(Attributes.Hash)
					return
				}

				self.setAttribute(Attributes.Hash, values.join(' '))
			},
			get media(): MediaQueryList | undefined {
				return self._media
			},
			set media(value: string | null) {
				if (value === null) {
					self.removeAttribute(Attributes.Media)
					return
				}

				self.setAttribute(Attributes.Media, value)
			},
			check() {
				const elements = this.targetElements
				const attrName = this.name
				const attrValue = this.value
				if (!attrName) {
					return
				}

				for (const element of elements) {
					if (!attrValue) {
						element.removeAttribute(attrName)
						continue
					}

					element.setAttribute(attrName, attrValue)
				}
			},
			uncheck() {
				const elements = this.targetElements
				const attrName = this.name
				const attrValue = this.fallback
				if (!attrName) {
					return
				}

				for (const element of elements) {
					if (!attrValue) {
						element.removeAttribute(attrName)
						continue
					}

					element.setAttribute(attrName, attrValue)
				}

			},
			isChecked() {
				const media = this.media
				const path  = this.path
				const query = this.query
				const hash  = this.hash
				if (this.checked) {
					return true
				}

				if (
					media === undefined
					&& path.length === 0
					&& query.length === 0
					&& hash.length === 0
				) {
					return false
				}

				let isMatch = true

				// 1. Check Path (br:path)
				if (path.length > 0 && !path.includes(location.pathname)) {
					isMatch = false
				}

				// 2. Check Hash (br:hash)
				if (isMatch && hash.length > 0 && !hash.includes(location.hash)) {
					isMatch = false
				}

				// 3. Check Queries (br:query)
				if (isMatch && query.length > 0) {
					const parser = new QueryValidation(query, new URLSearchParams(window.location.search))
					if (!parser.evaluate()) {
						isMatch = false
					}
				}

				// 4. Check media query (br:media)
				if (isMatch && media !== undefined && !media.matches) {
					isMatch = false
				}

				return isMatch
			}
		}
	}
}

function _checkElementsState(element?: BiruAttributeIfElement | undefined): void {
	for (const el of (element? [element] : ELEMENTS)) {
		if (el.biru.isChecked()) {
			el.biru.check()
		}
		else {
			el.biru.uncheck()
		}

		el.dispatchEvent(new CustomEvent(EventTypes.Toggle, {bubbles: true}))
	}
}

function _initListeners(): void {
	listenRouteChange(() => _checkElementsState())
}

function _initDefaultStyles(): void {
	document.adoptedStyleSheets.push(STYLES)
	STYLES.replaceSync(`${TAGNAME} {display: contents}`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initListeners()
	_initDefaultStyles()
	customElements.define(TAGNAME, BiruAttributeIfElement)
}

BrTheme.define()
define()