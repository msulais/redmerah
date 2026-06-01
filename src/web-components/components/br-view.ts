export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'br-view'
const EVENT_TYPE_ROUTE_CHANGED = "route-changed"
const ELEMENTS = new Set<BiruViewElement>()

export const Attributes = {
	Path : 'br:path' ,
	Query: 'br:query',
	Hash : 'br:hash' ,
	Media: 'br:media'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

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

	get $path(): string[] {
		return this.getAttribute(Attributes.Path)?.split(/ +/) ?? []
	}

	set $path(values: string[]) {
		if (values.length === 0) {
			this.removeAttribute(Attributes.Path)
			return
		}

		this.setAttribute(Attributes.Path, values.join(' '))
	}

	get $query(): string[] {
		return this.getAttribute(Attributes.Query)?.split(/ +/) ?? []
	}

	set $query(values: string[]) {
		if (values.length === 0) {
			this.removeAttribute(Attributes.Query)
			return
		}

		this.setAttribute(Attributes.Query, values.join(' '))
	}

	get $hash(): string[] {
		return (
			this.getAttribute(Attributes.Hash)
			?.split(/ +/)
			.map(v => v.startsWith('#')? v : `#${v}`)
			?? []
		)
	}

	set $hash(values: string[]) {
		if (values.length === 0) {
			this.removeAttribute(Attributes.Hash)
			return
		}

		this.setAttribute(Attributes.Hash, values.join(' '))
	}

	get $media(): MediaQueryList | undefined {
		return this._media
	}

	set $media(value: string | null) {
		if (value === null) {
			this.removeAttribute(Attributes.Media)
			return
		}

		this.setAttribute(Attributes.Media, value)
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

	$show() {
		this._container.style.setProperty('display', 'contents')
	}

	$hide() {
		this._container.style.setProperty('display', 'none')
	}

	$isVisible(): boolean {
		const media = this.$media
		const path  = this.$path
		const query = this.$query
		const hash  = this.$hash
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
			const currentSearchParams = new URLSearchParams(window.location.search)
			for (const pair of query) {
				const [key, expectedValue] = pair.split('=')
				if (currentSearchParams.get(key) !== expectedValue) {
					isMatch = false
					break
				}
			}
		}

		// 4. Check media query (br:media)
		if (isMatch && media !== undefined && !media.matches) {
			isMatch = false
		}

		return isMatch
	}
}

function _checkElementsState(element?: BiruViewElement | undefined): void {
	for (const el of (element? [element] : ELEMENTS)) {
		if (el.$isVisible()) {
			el.$show()
		}
		else {
			el.$hide()
		}
	}
}

function _initListeners(): void {
	window.addEventListener("hashchange", () => _checkElementsState())
	window.addEventListener("popstate", () => _checkElementsState())
	window.addEventListener(EVENT_TYPE_ROUTE_CHANGED, () => _checkElementsState())

	// handle <a> element
	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement
		const anchor = target.closest("a")

		if (anchor && anchor.origin === window.location.origin) {
			e.preventDefault();
			window.history.pushState({}, "", anchor.href)
			window.dispatchEvent(new Event(EVENT_TYPE_ROUTE_CHANGED))
		}
	})
}

function _initDefaultStyle(): void {
	STYLES.replaceSync(`
		:host, div {
			display: contents;
		}
	`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initListeners()
	_initDefaultStyle()
	customElements.define(TAGNAME, BiruViewElement)
}

define()