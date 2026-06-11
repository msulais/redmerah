import * as BrTheme from './br-theme.js'

export const TAGNAME = ':where(input,textarea)[br\\:as~=textfield]'
let _isDefined = false

export function _initDefaultStyles(): void {
	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${ELEMENT} {
	border: 1px solid transparent;
	padding: .25rem .5rem;
	border-radius: .25rem;
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	resize: none;
	font-size: .875rem;
	min-height: 2rem;
	outline: none;
	border-bottom: 2px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .32);
}

${ELEMENT}[type=color] {
	padding: 0;
	border: none;
	background-color: transparent !important;
}

${ELEMENT}:where(textarea) {
	padding: .375rem .5rem;
	field-sizing: content;
}

${ELEMENT}:read-write:focus {
	border-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	border-bottom-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	background-color: rgb(var(${BrTheme.CSSVars.ColorBackground}));
}

${ELEMENT}:read-write:hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${ELEMENT}:read-write:active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .02);
}
`)
}

export function define(): void {
	if (!document || !window || _isDefined) {
		return
	}

	_initDefaultStyles()
	_isDefined = true
}

define()