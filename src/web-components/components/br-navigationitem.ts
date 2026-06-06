export const Attributes = {
	Href    : 'href',
	Selected: 'br:selected',
	Hash    : 'br:hash',
	Query   : 'br:query',
	Path    : 'br:path'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const Slots = {
	Label: 'label'
} as const
export type Slots = typeof Slots[keyof typeof Slots]

export const Parts = {
	Anchor: 'anchor',
	Label: 'label'
}
export type Parts = typeof Parts[keyof typeof Parts]

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'br-navigationitem'

export class BiruNavigationItemElement extends HTMLElement {
	private _anchor: HTMLAnchorElement

	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})
		this._anchor = document.createElement('a')
		this._anchor.part = Parts.Anchor
		this._anchor.innerHTML = `
			<slot></slot>
			<span part="${Parts.Label}"><slot name="${Slots.Label}"></slot></span>
		`
		shadow.append(this._anchor)
	}
}

function _initDefaultStyles(): void {
	// TODO:
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyles()
	customElements.define(TAGNAME, BiruNavigationItemElement)
}

define()