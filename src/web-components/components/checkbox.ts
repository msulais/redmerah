import * as BrTheme from './br-theme.js'

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'label[br\\:as=checkbox]'
const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
const INPUT = `${ELEMENT} input[type=checkbox]`
let isDefined = false

function _initDefaultStyle(): void {
	document.adoptedStyleSheets.push(STYLES)
	STYLES.replaceSync(`
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

${ELEMENT}:has( input[type=checkbox]:disabled) {
	cursor: not-allowed;
}

${ELEMENT}:has( input[type=checkbox]:focus-visible) {
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
	border-radius: .25rem;
	position: relative;
	background-color: rgb(var(${BrTheme.CSSVars.ColorBackground}));
}

${INPUT}::before {
	-webkit-mask-size: contain;
	-webkit-mask-repeat: no-repeat;
	-webkit-mask-position: center;
	-webkit-mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyMHB4IiBmaWxsPSIjMDAwIj48cGF0aCBkPSJtNDAwLTQxNiAyMzYtMjM2cTExLTExIDI4LTExdDI4IDExcTExIDExIDExIDI4dC0xMSAyOEw0MjgtMzMycS0xMiAxMi0yOCAxMnQtMjgtMTJMMjY4LTQzNnEtMTEtMTEtMTEtMjh0MTEtMjhxMTEtMTEgMjgtMTF0MjggMTFsNzYgNzZaIi8+PC9zdmc+);
	content: "";
	position: absolute;
	left: 50%;
	top: 50%;
	translate: -50% -50%;
	scale: 0;
	width: 1.25rem;
	height: 1.25rem;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjBweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyMHB4IiBmaWxsPSIjMDAwIj48cGF0aCBkPSJtNDAwLTQxNiAyMzYtMjM2cTExLTExIDI4LTExdDI4IDExcTExIDExIDExIDI4dC0xMSAyOEw0MjgtMzMycS0xMiAxMi0yOCAxMnQtMjgtMTJMMjY4LTQzNnEtMTEtMTEtMTEtMjh0MTEtMjhxMTEtMTEgMjgtMTF0MjggMTFsNzYgNzZaIi8+PC9zdmc+);
	mask-size: contain;
	mask-repeat: no-repeat;
	mask-position: center;
	background-color: rgb(var(${BrTheme.CSSVars.ColorOnAccent}));
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
	scale: 1.25;
}

${INPUT}:checked:not(:disabled):active::before {
	scale: .75;
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

BrTheme.define()
define()