/*
Example:
```html
<any br:as="label">Name</any>
<label>Name</label>
```
 */
export const TAGNAME = ':where(label:not([br\\:as~="!label"]),[br\\:as~=label])'
let _isDefined = false

function _initDefaultStyles(): void {
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${TAGNAME} {
	display: flex;
	align-items: center;
	gap: 1ch;
	font-size: .875rem;
}

@media (hover: none) {
	${TAGNAME} {
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