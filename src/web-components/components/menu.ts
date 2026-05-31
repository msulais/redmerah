import * as BrTheme from './br-theme.js'

export const STYLES = new CSSStyleSheet()
const ELEMENT = `${BrTheme.TAGNAME} :where(menu,[br\\:as=menu])`
let isDefined = false

function _initDefaultStyle(): void {
	document.adoptedStyleSheets.push(STYLES)
	// TODO
	STYLES.replaceSync(`
${ELEMENT} {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	list-style: none;
	padding: 0;
	width: max-content;
}

${ELEMENT} button {
	width: 100%;
	min-height: 1.75rem;
}
`)
}

export function define(): void {
	if (isDefined) {
		return
	}

	_initDefaultStyle()
	isDefined = true
}

define()