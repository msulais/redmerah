/*
Example:
```html
<input type="checkbox" br:as="switch">
```
 */

import * as BrTheme from './br-theme.js'

export const TAGNAME = 'input[type=checkbox][br\\:as~=switch]'
let _isDefined = false

function _initDefaultStyles(): void {
	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${ELEMENT} {
	--width: 2.5rem;
	--height: calc(var(--width) / 2);
	-webkit-appearance: none;
	appearance: none;
	position: relative;
	width: var(--width);
	border-radius: 9999px;
	height: var(--height);
	cursor: pointer;
}

@media (hover: none) {
	${ELEMENT} {
		--width: 2.75rem;
	}
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
	width: var(--width);
	height: var(--height);
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
	top: calc(var(--width) * 0.1);
	left: calc(var(--width) * 0.1);
	width: calc(var(--width) * 0.3);
	height: calc(var(--width) * 0.3);
	border-radius: 999999px;
	cursor: inherit;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
	background-color: rgb(var(${BrTheme.CSSVars.ColorOnSurface}));
}

${ELEMENT}:checked::after {
	translate: calc(var(--width) / 2) 0;
	background-color: rgb(var(${BrTheme.CSSVars.ColorOnAccent}));
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