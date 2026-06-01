import * as BrTheme from './br-theme.js'

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'input[type=checkbox][br\\:as=switch]'
const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
let isDefined = false

function _initDefaultStyle(): void {
	document.adoptedStyleSheets.push(STYLES)
	STYLES.replaceSync(`
${ELEMENT} {
	-webkit-appearance: none;
	appearance: none;
	position: relative;
	width: 2.5rem;
	border-radius: 9999px;
	height: 1.25rem;
	cursor: pointer;
}

${ELEMENT}:not(:disabled):hover::after {
	scale: 1.25;
}

${ELEMENT}:not(:disabled):active::after {
	scale: .75;
}

${ELEMENT}:disabled {
	filter: grayscale(1) opacity(0.5);
	cursor: not-allowed;
}

${ELEMENT}::before {
	content: "";
	left: 0;
	top: 0;
	position: absolute;
	outline: 1px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .32);
	width: 2.5rem;
	height: 1.25rem;
	border-radius: 999999px;
	cursor: inherit;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${ELEMENT}:checked::before {
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	outline-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
}

${ELEMENT}::after {
	content: "";
	position: absolute;
	top: .25rem;
	left: .25rem;
	width: .75rem;
	height: .75rem;
	border-radius: 999999px;
	cursor: inherit;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	background-color: rgb(var(${BrTheme.CSSVars.ColorOnSurface}));
}

${ELEMENT}:checked::after {
	translate: 1.25rem 0;
	background-color: rgb(var(${BrTheme.CSSVars.ColorOnAccent}));
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