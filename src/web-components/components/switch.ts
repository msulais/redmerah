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
	width: 3rem;
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
	position: absolute;
	border: 1px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .32);
	width: 2.5rem;
	height: 1.25rem;
	border-radius: 999px;
	cursor: inherit;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${ELEMENT}:checked::before {
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	border-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
}

${ELEMENT}::after {
	content: "";
	position: absolute;
	top: 4.5px;
	left: 4.5px;
	width: 12px;
	height: 12px;
	border-radius: 999px;
	cursor: inherit;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	background-color: rgb(var(${BrTheme.CSSVars.ColorOnSurface}));
}

${ELEMENT}:checked::after {
	translate: 20.5px 0;
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