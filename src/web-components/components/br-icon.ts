import * as BrTheme from './br-theme.js'

export const TAGNAME = 'br-icon'
const STYLES = new CSSStyleSheet()

export class BiruIconElement extends HTMLElement {
	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})
		shadow.adoptedStyleSheets = [STYLES]
		shadow.append(document.createElement('slot'))
	}
}

function _initDefaultStyles(): void {
	STYLES.replaceSync(`:host {
	line-height: 1;
	font-size: 1.25rem;
	font-family: var(${BrTheme.CSSVars.FontFamilyIcon}) !important;
}

@media (hover:none) {
	:host {
		font-size: 1.5rem;
	}
}`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyles()
	customElements.define(TAGNAME, BiruIconElement)
}

BrTheme.define()
define()