/*
Example:
```html
<input type="text" br:as="textfield">
<input type="password" br:as="textfield">
<input type="email" br:as="textfield">
<input type="date" br:as="textfield">
<input type="datetime-local" br:as="textfield">
<input type="file" br:as="textfield">
<input type="month" br:as="textfield">
<input type="number" br:as="textfield">
<input type="search" br:as="textfield">
<input type="tel" br:as="textfield">
<input type="time" br:as="textfield">
<input type="url" br:as="textfield">
<input type="week" br:as="textfield">
<textarea br:as="textfield"></textarea>
```
 */

import * as BrTheme from './br-theme.js'

export const TAGNAME = ':where(input,textarea)[br\\:as~=textfield]'
let _isDefined = false

export function _initDefaultStyles(): void {
	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${ELEMENT} {
	display: block;
	border: 1px solid transparent;
	padding: .25rem .5rem;
	border-radius: .25rem;
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	resize: none;
	width: 100%;
	font-size: .875rem;
	min-height: 2rem;
	outline: none;
	border-bottom: 2px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .32);
}

${ELEMENT}:where(textarea) {
	padding: .375rem .5rem;
}

@media (hover: none) {
	${ELEMENT} {
		font-size: 1rem;
		min-height: 3rem;
		border-radius: .5rem;
		padding: .75rem 1rem;
	}
}

${ELEMENT}[type=color] {
	padding: 0;
	border: none;
	background-color: transparent !important;
}

${ELEMENT}:read-write:focus {
	border-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	border-bottom-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${ELEMENT}:read-write:hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
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