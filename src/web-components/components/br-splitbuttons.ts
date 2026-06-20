import * as BrTheme from './br-theme.js'
import * as Button from './button.js'

export const TAGNAME = 'br-splitbuttons'

const STYLES = new CSSStyleSheet()

export class BiruSplitButtonsElement extends HTMLElement {
	constructor() {
		super()
	}
}

function _initDefaultStyles(): void {
	const ELEMENT_ITEM = `${TAGNAME} > ${Button.TAGNAME}`
	document.adoptedStyleSheets.push(STYLES)
	STYLES.replaceSync(`
${TAGNAME} {
	display: flex;
	align-items: center;
	gap: 1px;
}

${ELEMENT_ITEM}:not(:first-child,:last-child) {
	border-radius: 0px;
}

${ELEMENT_ITEM}:not(:first-child) {
	position: relative;
}

${ELEMENT_ITEM}:not(:first-child)::after {
	content: '';
	width: 1px;
	height: calc(100% + 2px);
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}),.50);
	left: -2px;
	top: -1px;
	position: absolute;
}

${ELEMENT_ITEM}:first-child:not(:last-child) {
	border-top-right-radius: 0px;
	border-bottom-right-radius: 0px;
}

${ELEMENT_ITEM}:last-child:not(:first-child) {
	border-top-left-radius: 0px;
	border-bottom-left-radius: 0px;
}
`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyles()
	customElements.define(TAGNAME, BiruSplitButtonsElement)
}

BrTheme.define()
Button.define()
define()