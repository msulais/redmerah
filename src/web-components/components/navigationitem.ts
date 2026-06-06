export const Attributes = {
	Path    : 'br:path',
	Query   : 'br:query',
	Hash    : 'br:hash',
	Selected: 'br:selected'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const STYLES = new CSSStyleSheet()
export const TAGNAME = '[br\\:as~=navigationitem]'
let isDefined = false

function _initDefaultStyles(): void {
	// TODO
}

export function define(): void {
	if (isDefined) {
		return
	}

	_initDefaultStyles()
	isDefined = true
}

define()