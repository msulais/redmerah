import { listenRouteChange } from "../router"
import { QueryValidation } from "../utils"

export const Attributes = {

	/** Multiple path separated by space. Example: `"/ /a/b /a/b/e"` */
	Path : 'br:path' ,

	/** Multiple hash target separated by space. Example: `"#id1 #id2 #id3"` */
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
	*/
	Query: 'br:query',

	/**
	 * Complex media query. Equal to how implement media query in CSS.
	 *
	 * Example: `"(not (width > 1000px)) and (color), print and (color)"`
	 * */
	Media: 'br:media',
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const TAGNAME = 'br-view'
const ELEMENTS = new Set<BiruViewElement>()
const STYLES = new CSSStyleSheet()

export class BiruViewElement extends HTMLElement {
	private _shadowRoot: ShadowRoot
	private _container: HTMLDivElement
	private _media: MediaQueryList | undefined

	static observedAttributes = [
		Attributes.Path,
		Attributes.Query,
		Attributes.Hash,
		Attributes.Media
	]

	constructor() {
		super()
		this._shadowRoot = this.attachShadow({mode: 'open'})
		this._shadowRoot.adoptedStyleSheets = [STYLES]
		this._container = document.createElement('div')
		this._container.append(document.createElement('slot'))
		this._shadowRoot.append(this._container)
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
			show() {
				self._container.style.setProperty('display', 'contents')
			},
			hide() {
				self._container.style.setProperty('display', 'none')
			},
			isVisible() {
				const media = this.media
				const path  = this.path
				const query = this.query
				const hash  = this.hash
				if (
					media === undefined
					&& path.length === 0
					&& query.length === 0
					&& hash.length === 0
				) {
					return true
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

function _checkElementsState(element?: BiruViewElement | undefined): void {
	for (const el of (element? [element] : ELEMENTS)) {
		if (el.biru.isVisible()) {
			el.biru.show()
		}
		else {
			el.biru.hide()
		}
	}
}

function _initListeners(): void {
	listenRouteChange(() => _checkElementsState())
}

function _initDefaultStyles(): void {
	STYLES.replaceSync(`
		:host, div {
			display: contents
		}
	`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initListeners()
	_initDefaultStyles()
	customElements.define(TAGNAME, BiruViewElement)
}

define()