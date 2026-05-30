export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'br-view'
const EVENT_TYPE_ROUTE_CHANGED = "route-changed"
const ELEMENTS = new Set<BiruViewElement>()

export const Attributes = {
	Paths: 'br:paths',
	Query: 'br:query',
	Target: 'br:target'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export class BiruViewElement extends HTMLElement {
	private _shadowRoot: ShadowRoot
	private _container: HTMLDivElement

	static observedAttributes = [
		Attributes.Paths,
		Attributes.Query,
		Attributes.Target,
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
		ELEMENTS.add(this)
		_checkElementsState()
	}

	attributeChangedCallback(): void {
		_checkElementsState()
	}

	disconnectedCallback(): void {
		ELEMENTS.delete(this)
	}

	$show() {
		this._container.style.setProperty('display', 'contents')
	}

	$hide() {
		this._container.style.setProperty('display', 'none')
	}
}

function _checkElementsState(): void {
	for (const el of ELEMENTS) {
		if (
			!el.hasAttribute(Attributes.Paths)
			&& !el.hasAttribute(Attributes.Query)
			&& !el.hasAttribute(Attributes.Target)
		) {
			el.$show()
			continue
		}

		let isMatch = true;

		// 1. Check Paths (br:paths)
		if (el.hasAttribute(Attributes.Paths)) {
			const allowedPaths = el.getAttribute(Attributes.Paths)!.split(' ')
			if (!allowedPaths.includes(window.location.pathname)) {
				isMatch = false
			}
		}

		// 2. Check Target/Hash (br:target)
		if (isMatch && el.hasAttribute(Attributes.Target)) {
			let expectedHash = el.getAttribute(Attributes.Target) || ""
			if (!expectedHash.startsWith('#')) {
				expectedHash = `#${expectedHash}`
			}

			if (window.location.hash !== expectedHash) {
				isMatch = false
			}
		}

		// 3. Check Queries (br:query)
		if (isMatch && el.hasAttribute(Attributes.Query)) {
			const currentSearchParams = new URLSearchParams(window.location.search)
			const queryPairs = el.getAttribute(Attributes.Query)!.split(' ');
			for (const pair of queryPairs) {
				const [key, expectedValue] = pair.split('=')
				if (currentSearchParams.get(key) !== expectedValue) {
					isMatch = false
					break
				}
			}
		}

		// Toggle visibility based on the final results
		if (isMatch) {
			el.$show()
		}
		else {
			el.$hide()
		}
	}
}

function _initListeners(): void {
	window.addEventListener("hashchange", _checkElementsState)
	window.addEventListener("popstate", _checkElementsState)
	window.addEventListener(EVENT_TYPE_ROUTE_CHANGED, _checkElementsState)

	// handle <a> element
	document.body.addEventListener("click", (e) => {
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