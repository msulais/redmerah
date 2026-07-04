/*
Example:
```html
<details></details>
```
 */

import * as BrTheme from './br-theme.js'

export const TAGNAME = 'details:not([br\\:as~="!details"])'
let _isDefined = false

function _initDefaultStyles(): void {
	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const styles  = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${ELEMENT} {
	border-radius: .25rem;
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
	border: 1px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${ELEMENT}::details-content {
	height: 0rem;
	overflow: clip;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	transition-property: height, content-visibility;
	transition-behavior: allow-discrete;
}

${ELEMENT}[open]::details-content {
	height: 100%;
	height: calc-size(auto, size);
}

@media (hover: none) {
	${ELEMENT} {
		border-radius: 1rem;
	}
}

${ELEMENT} > summary {
	border-radius: .25rem;
	display: flex;
	user-select: none;
	cursor: pointer;
	padding: .25rem .75rem;
	line-height: normal;
	gap: .5rem;
	min-height: 3rem;
	color: rgb(var(${BrTheme.CSSVars.ColorOnSurface}));
	text-decoration: none;
	padding-right: 2.75rem;
	align-items: center;
	position: relative;
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${ELEMENT} > summary::after {
	--image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiBmaWxsPSIjZmZmIj48cGF0aCBkPSJNNDY0LjA4LTM3NC45NnEtNy40Ni0zLjEyLTE0LjctMTAuMzVMMjY5Ljg1LTU2NC44NXEtOS42Mi05LjYxLTEwLTIyLjc3LS4zOS0xMy4xNSAxMC0yMy41MyAxMC4zOC0xMC4zOSAyMy4xNS0xMC4zOSAxMi43NyAwIDIzLjE1IDEwLjM5TDQ4MS00NDYuMzFsMTY0Ljg1LTE2NC44NHE5LjYxLTkuNjIgMjIuNzctMTAgMTMuMTUtLjM5IDIzLjUzIDEwIDEwLjM5IDEwLjM4IDEwLjM5IDIzLjE1IDAgMTIuNzctMTAuMzkgMjMuMTVMNTEyLjYyLTM4NS4zMXEtNy4yNCA3LjIzLTE0LjcgMTAuMzUtNy40NiAzLjExLTE2LjkyIDMuMTF0LTE2LjkyLTMuMTFaIi8+PC9zdmc+);
	-webkit-mask-size: contain;
	-webkit-mask-repeat: no-repeat;
	-webkit-mask-position: center;
	-webkit-mask-image: var(--image);
	mask-image: var(--image);
	mask-size: contain;
	mask-repeat: no-repeat;
	mask-position: center;
	content: '';
	position: absolute;
	right: .75rem;
	top: 50%;
	translate: 0 -50%;
	width: 1.5rem;
	height: 1.5rem;
	background-color: rgb(var(${BrTheme.CSSVars.ColorOnSurface}));
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
}

@media (hover: none) {
	${ELEMENT} > summary {
		padding-right: 3rem;
	}

	${ELEMENT} > summary::after {
		width: 1.75rem;
		height: 1.75rem;
	}
}

${ELEMENT}[open] > summary::after {
	rotate: 180deg;
}

@media (hover: none) {
	${ELEMENT} > summary {
		border-radius: 1rem;
	}
}

${ELEMENT}[open] > summary {
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}

${ELEMENT} > summary > * {
	user-select: inherit;
	cursor: inherit;
	pointer-events: none;
}

${ELEMENT} > summary:hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${ELEMENT} > summary:active {
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

BrTheme.define()
define()