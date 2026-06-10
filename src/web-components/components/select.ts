import * as BrTheme from './br-theme.js'

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'select:not([br\\:as~="!select"])'
const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
let isDefined = false

function _initDefaultStyle(): void {
	document.adoptedStyleSheets.push(STYLES)
	STYLES.replaceSync(`
${ELEMENT} {
	appearance: base-select;
	padding: .25rem .5rem .25rem 1rem;
	border: 1px solid transparent;
	display: flex;
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	align-items: center;
	cursor: pointer;
	border-radius: .25rem;
	display: flex;
	gap: .5rem;
	font-size: .875rem;
	line-height: normal;
	justify-content: center;
	min-height: 2rem;
	scrollbar-width: none;
	user-select: none;
	-ms-overflow-style: none;
}

${ELEMENT}[multiple] {
	padding: .25rem 0;
}

${ELEMENT} * {
	user-select: inherit;
	cursor: inherit;
}

${ELEMENT}:disabled {
	filter: grayscale(1) opacity(0.5);
	cursor: not-allowed;
}

${ELEMENT}:not(:disabled):open {
	background-color: rgb(var(${BrTheme.CSSVars.ColorBackground}));
	border-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .32);
}

${ELEMENT}:not(:disabled):hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${ELEMENT}:not(:disabled):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .02);
}

${ELEMENT}::picker-icon {
	width: 1.25rem;
	height: 1.25rem;
	text-align: center;
	translate: 0 5%;
	transition-property: rotate, translate;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
}

${ELEMENT}:open::picker-icon {
	rotate: 180deg;
	translate: 0 -5%;
}

${ELEMENT}::picker(select) {
	appearance: base-select;
	background-color: rgb(var(${BrTheme.CSSVars.ColorSurface}));
	border: 1px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	box-shadow: 0 .25rem .5rem rgba(0, 0, 0, .25);
	border-radius: .5rem;
	padding: .25rem 0;
	opacity: 0;
	translate: 0 .75rem;
	margin: .5rem 0;
	position-try: most-block-size flip-block;
	transition-property: display, overlay, opacity, translate;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
}

${ELEMENT}::picker(select):popover-open {
	opacity: 1;
	translate: 0 0;
}

@starting-style {
	${ELEMENT}::picker(select):popover-open {
		opacity: 0;
		translate: 0 -0.75rem;
	}
}

${ELEMENT} option {
	display: flex;
	border-radius: .25rem;
	font-size: .875rem;
	user-select: none;
	outline-offset: 4px;
	cursor: pointer;
	background-color: transparent;
	line-height: normal;
	border: 1px solid transparent;
	filter: none;
	gap: .5rem;
	align-items: center;
	min-height: 1.75rem;
	padding: 0 .75rem;
	justify-content: flex-start;
	margin: 0 .25rem;
	width: calc(100% - .5rem);
	white-space: nowrap;
	position: relative;
}

${ELEMENT} option::checkmark {
	display: none;
}

${ELEMENT} option::before {
	content: '';
	display: block;
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	position: absolute;
	left: .0625rem;
	width: .1875rem;
	top: 50%;
	opacity: 0;
	transform: translateY(-50%);
	height: .1875rem;
	border-radius: 99999px;
	transition-property: height;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
}

${ELEMENT} option:not(:first-of-type) {
	margin-top: .25rem;
}

${ELEMENT} option * {
	user-select: inherit;
	cursor: inherit;
}

${ELEMENT} option:disabled {
	filter: grayscale(1) opacity(0.5);
	cursor: not-allowed;
}

${ELEMENT} option:not(:disabled):hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${ELEMENT} option:not(:disabled):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${ELEMENT} option:checked {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${ELEMENT} option:checked::before {
	height: max(50%, .1875rem);
	opacity: 1;
}

${ELEMENT} option:checked:not(:disabled):hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${ELEMENT} option:checked:not(:disabled):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .02);
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