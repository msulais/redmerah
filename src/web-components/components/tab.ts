/*
Example:
```html
<label br:as="tab">
	<input type="radio" name="group-name">
	Label
</label>
<label br:as="tab">
	<input type="radio" name="group-name">
	Label 2
</label>
```
 */

import * as BrTheme from './br-theme.js'

export const TAGNAME = 'label[br\\:as~=tab]'
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
	line-height: normal;
	cursor: pointer;
	min-height: 2rem;
	padding: .25rem .5rem;
	border-radius: .25rem;
	user-select: none;
	width: fit-content;
	position: relative;
}

${ELEMENT} * {
	user-select: inherit;
	cursor: inherit;
}

@media (hover: none) {
	${ELEMENT} {
		font-size: 1rem;
		min-height: 3rem;
	}
}

${ELEMENT}:has( input[type=radio]:disabled) {
	filter: grayscale(1) opacity(0.5);
	cursor: not-allowed;
}

${ELEMENT}:has( input[type=radio]:focus-visible) {
	outline: auto;
}

${ELEMENT}:has( input[type=radio]:checked) {
	color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
}

${ELEMENT} * {
	cursor: inherit;
	user-select: inherit;
}

${INPUT} {
	outline: none;
	position: absolute;
	-webkit-appearance: none;
	appearance: none;
	width: calc(100% - 1rem);
	height: 0.1875rem;
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .5);
	bottom: 0;
	left: 50%;
	opacity: 0;
	translate: -50% 0;
	border-radius: .125rem;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
}

${INPUT}:checked {
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	opacity: 1;
}

${ELEMENT}:hover input[type=radio] {
	opacity: 1;
	width: 100%;
}

${ELEMENT}:active input[type=radio] {
	opacity: 1;
	width: calc(100% - 1.5rem);
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