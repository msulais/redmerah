import { registerZIndex, unregisterZIndex } from "../_flyout"

export const Attributes = {
	Variant: 'br:variant',
	Open: 'br:open',
	HideLabel: 'br:hidelabel'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const Variant = {
	Auto: 'auto',
	Normal: 'normal',
	SemiDrawer: 'semi-drawer',
	Drawer: 'drawer'
} as const

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'br-navigation'

export class BiruNavigationElement extends HTMLElement {
	static observedAttributes = [
		Attributes.Open,
	]

	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})
		shadow.adoptedStyleSheets = [STYLES]
		shadow.append(document.createElement('slot'))
		this.role = 'navigation'
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
		switch (name) {
		case Attributes.Open:
			if (newValue === null) {
				unregisterZIndex(this)
			}
			else {
				this.style.setProperty('z-index', registerZIndex(this) + '')
			}
			break
		}
	}
}

function _initDefaultStyles(): void {
	STYLES.replaceSync(`
:host {
	display: flex;
	flex-direction: column;
	padding: .5rem;
	height: 100%;
	overflow: auto;
	max-height: 100%;
	width: 16rem;
}
`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyles()
	customElements.define(TAGNAME, BiruNavigationElement)
}

define()