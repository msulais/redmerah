/*
Example:
```html
<fieldset>
	<legend>Label</legend>
	<any></any>
</fieldset>
```
 */

import * as BrTheme from './br-theme.js'

export const TAGNAME = 'fieldset:not([br\\:as~="!fieldset"])'
let _isDefined = false

function _initDefaultStyles(): void {
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${TAGNAME} {
	border: 1px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), 0.32);
	border-radius: .25rem;
	padding: 1rem;
}

${TAGNAME} > legend {
	font-size: .875rem;
	padding: 0;
}

@media (hover:none) {
	${TAGNAME} {
		border-radius: .5rem;
	}

	${TAGNAME} > legend {
		font-size: 1rem;
	}
}`)
}

export function define(): void {
	if (_isDefined) {
		return
	}

	_initDefaultStyles()
	_isDefined = true
}

define()