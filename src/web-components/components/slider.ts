import * as BrTheme from './br-theme'

export const STYLES = new CSSStyleSheet()
export const TAGNAME = 'input[type=range][br\\:as~=slider]'
const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
let isDefined = false

function _initDefaultStyle(): void {
	document.adoptedStyleSheets.push(STYLES)
	STYLES.replaceSync(`
${ELEMENT} {
	--slider-gap: .125rem;
	--slider-line-width: .25rem;
	--slider-thumb-width: 1.25rem;
	--slider-mixed-color: color-mix(in srgb, rgb(var(${BrTheme.CSSVars.ColorAccent})), rgb(var(${BrTheme.CSSVars.ColorOnSurface})) var(--slider-hover-effect, 0%));
	-webkit-appearance :none;
	-moz-appearance :none;
	height: calc(var(--slider-thumb-width) + .125rem);
	appearance :none;
	background: none;
	cursor: pointer;
	overflow: hidden;
}

${ELEMENT}:not(:disabled):focus-visible,
${ELEMENT}:not(:disabled):hover {
	--slider-hover-effect: 25%;
	--slider-shadow-width: .1875rem;
}

${ELEMENT}:not(:disabled):active,
${ELEMENT}:not(:disabled):focus-visible {
	--slider-shadow-width: .375rem;
}

${ELEMENT}::-webkit-slider-thumb {
	height: var(--slider-thumb-width);
	aspect-ratio: 1;
	border-radius: 50%;
	box-shadow: 0 0 0 var(--slider-shadow-width, .25rem) inset var(--slider-mixed-color);
	background-color: rgb(var(${BrTheme.CSSVars.ColorBackground}));
	border-image: linear-gradient(90deg, var(--slider-mixed-color) 50%, #ababab 0) 0 1 / calc(50% - var(--slider-line-width) / 2) 100vw / 0 calc(100vw + var(--slider-gap));
	-webkit-appearance: none;
	appearance: none;
	transition: var(${BrTheme.CSSVars.DurationTransition});
}

${ELEMENT}::-moz-range-thumb {
	height: var(--slider-thumb-width);
	width: var(--slider-thumb-width);
	background: none;
	border-radius: 50%;
	box-shadow: 0 0 0 var(--slider-shadow-width, .25rem) inset var(--slider-mixed-color);
	background-color: rgb(var(${BrTheme.CSSVars.ColorBackground}));
	border-image: linear-gradient(90deg, var(--slider-mixed-color) 50%, #ababab 0) 0 1 / calc(50% - var(--slider-line-width) / 2) 100vw / 0 calc(100vw + var(--slider-gap));
	-moz-appearance: none;
	appearance: none;
	transition: var(${BrTheme.CSSVars.DurationTransition});
}

@supports not (color: color-mix(in srgb,red,red)) {
	${ELEMENT} {
		--slider-mixed-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	}
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