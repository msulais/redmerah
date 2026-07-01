/*
Example:
```html
<progress></progress>
```
*/

import * as BrTheme from './br-theme.js'

export const TAGNAME = 'progress:not([br\\:as~="!progress"])'
let _isDefined = false

function _initDefaultStyles(): void {
	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${ELEMENT} {
	-webkit-appearance: none;
	-moz-appearance: none;
	appearance: none;
	width: 100%;
	display: block;
	height: .25rem;
	border: none;
	border-radius: .125rem;
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16);
}

${ELEMENT}::-webkit-progress-bar {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16);
	border-radius: .125rem;
}

${ELEMENT}::-webkit-progress-value {
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	border-radius: .125rem;
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
}

${ELEMENT}::-moz-progress-bar {
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	border-radius: .125rem;
}

${ELEMENT}:not([value]) {
	background: transparent;
}

${ELEMENT}:not([value])::-webkit-progress-bar {
	background: linear-gradient(
		90deg,
		rgb(var(${BrTheme.CSSVars.ColorAccent})) 0%,   rgb(var(${BrTheme.CSSVars.ColorAccent})) 10%,
		rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16) 10%,  rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16) 50%,
		rgb(var(${BrTheme.CSSVars.ColorAccent})) 50%,  rgb(var(${BrTheme.CSSVars.ColorAccent})) 60%,
		rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16) 60%,  rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16) 100%
	);
	background-size: 200% 100%;
	animation: progress-indeterminate 1s infinite linear;
	border-radius: .125rem;
}

${ELEMENT}:not([value])::-moz-progress-bar {
	background: linear-gradient(
		90deg,
		rgb(var(${BrTheme.CSSVars.ColorAccent})) 0%,   rgb(var(${BrTheme.CSSVars.ColorAccent})) 10%,
		rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16) 10%,  rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16) 50%,
		rgb(var(${BrTheme.CSSVars.ColorAccent})) 50%,  rgb(var(${BrTheme.CSSVars.ColorAccent})) 60%,
		rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16) 60%,  rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .16) 100%
	);
	background-size: 200% 100%;
	animation: progress-indeterminate 1s infinite linear;
	border-radius: .125rem;
}

@keyframes progress-indeterminate {
	0% { background-position: 100% 0; }
	100% { background-position: 0 0; }
}`)
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