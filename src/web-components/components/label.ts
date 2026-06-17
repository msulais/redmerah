export const TAGNAME = ':where(label:not([br\\:as~="!label"]),[br\\:as~=label])'
let _isDefined = false

function _initDefaultStyles(): void {
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${TAGNAME} {
	font-size: .875rem;
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