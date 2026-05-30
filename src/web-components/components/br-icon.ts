import * as BrTheme from './br-theme.js'

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'br-icon'

export class BiruIconElement extends HTMLElement {
	constructor() {
		super()
		const shadow = this.attachShadow({mode: 'open'})
		shadow.adoptedStyleSheets = [STYLES]
		shadow.append(document.createElement('slot'))
	}
}

function _initDefaultStyle(): void {
	STYLES.replaceSync(`:host {
	line-height: 1;
	font-size: 1.25rem;
	font-family: var(${BrTheme.CSSVars.FontFamilyIcon}) !important;
}`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyle()
	customElements.define(TAGNAME, BiruIconElement)
}

BrTheme.define()
define()