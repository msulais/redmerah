import * as BrTheme from './br-theme.js'

export const TAGNAME = 'label[br\\:as~=radiobutton]'
let _isDefined = false

function _initDefaultStyles(): void {
	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const INPUT = `${ELEMENT} input[type=radio]`
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${ELEMENT} {
	display: flex;
	align-items: center;
	gap: .5rem;
	font-size: .875rem;
	padding: .25rem;
	line-height: normal;
	cursor: pointer;
	min-height: 2rem;
	border-radius: .25rem;
	user-select: none;
	width: fit-content;
}

@media (hover: none) {
	${ELEMENT} {
		font-size: 1rem;
		min-height: 3rem;
	}
}

${ELEMENT}:has( input[type=radio]:disabled) {
	cursor: not-allowed;
}

${ELEMENT}:has( input[type=radio]:focus-visible) {
	outline: auto;
}

${ELEMENT} * {
	cursor: inherit;
	user-select: inherit;
}

${INPUT} {
	outline: none;
	-webkit-appearance: none;
	appearance: none;
	width: 1.25rem;
	height: 1.25rem;
	border: 1px solid;
	border-radius: 99999px;
	position: relative;
	background-color: rgb(var(${BrTheme.CSSVars.ColorBackground}));
}

${INPUT}::before {
	position: absolute;
	content: "";
	left: 50%;
	top: 50%;
	translate: -50% -50%;
	scale: 0;
	width: .75rem;
	height: .75rem;
	border-radius: 999999px;
	background-color: rgb(var(${BrTheme.CSSVars.ColorOnAccent}));
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
}

${INPUT}:disabled {
	filter: grayscale(1) opacity(0.5);
}

${INPUT}:not(:disabled,:checked):hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${INPUT}:not(:disabled,:checked):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${INPUT}:checked {
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	border-color: transparent;
}

${INPUT}:checked::before {
	scale: 1;
}

${INPUT}:checked:not(:disabled):hover::before {
	scale: 1.1;
}

${INPUT}:checked:not(:disabled):active::before {
	scale: .9;
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

BrTheme.define()
define()