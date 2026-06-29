/*
Example:
```html
<any br:as="button">A</any>
<button>B</button>
```
 */

import * as BrTheme from './br-theme.js'

export const Attributes = {
	/**
	 * @type {string[]} `"colored" | "tonal" | "outlined" | "filled" | "link" | "icon"`
	 * */
	Variant: 'br:variant',
	Focused: 'br:focused',

	/**
	 * Keep focus ring visible
	 *
	 * @type {boolean}
	 * */
	KeepFocusVisible: 'br:keep-focus-visible',

	/**
	 * For element that has no `:disabled` state selector.
	 *
	 * @type {boolean}
	 * */
	Disabled: 'br:disabled'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const Variant = {
	Colored : 'colored',
	Tonal   : 'tonal',
	Outlined: 'outlined',
	Filled  : 'filled',
	Link    : 'link',
	Icon    : 'icon'
} as const
export type Variant = typeof Variant[keyof typeof Variant]

export const TAGNAME = ':where(button:not([br\\:as~="!button"]),[br\\:as~=button])'
let _isDefined = false

function _initDefaultStyles(): void {
	const ATTR_VARIANT = CSS.escape(Attributes.Variant)
	const ATTR_FOCUSED = CSS.escape(Attributes.Focused)
	const ATTR_KEEPFOCUSVISIBLE = CSS.escape(Attributes.KeepFocusVisible)
	const STATE_DISABLED = `:where(:disabled,[${CSS.escape(Attributes.Disabled)}])`
	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const styles  = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${ELEMENT} {
	display: flex;
	border-radius: .25rem;
	font-size: .875rem;
	user-select: none;
	min-height: 2rem;
	cursor: pointer;
	background-color: transparent;
	padding: .25rem .75rem;
	justify-content: center;
	line-height: normal;
	border: 1px solid transparent;
	filter: none;
	gap: .5rem;
	color: rgb(var(${BrTheme.CSSVars.ColorOnSurface}));
	text-decoration: none;
	align-items: center;
}

@media (hover: none) {
	${ELEMENT} {
		font-size: 1rem;
		min-height: 3rem;
		padding: .25rem 1rem;
		border-radius: 1.5rem;
	}
}

${ELEMENT}:has( :focus-visible) {
	outline: auto;
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Icon}] {
	padding: 0;
	justify-content: center;
	min-width: 2.5rem;
}

@media (hover: none) {
	${ELEMENT}[${ATTR_VARIANT}~=${Variant.Icon}] {
		min-width: 3rem;
	}
}

${ELEMENT} * {
	user-select: inherit;
	cursor: inherit;
}

${ELEMENT}${STATE_DISABLED} {
	filter: grayscale(1) opacity(0.5);
	cursor: not-allowed;
}

${ELEMENT}:not(${STATE_DISABLED})[${ATTR_FOCUSED}],
${ELEMENT}:not(${STATE_DISABLED}):hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${ELEMENT}:not(${STATE_DISABLED})[${ATTR_KEEPFOCUSVISIBLE}]:focus {
	outline: auto;
}

${ELEMENT}:not(${STATE_DISABLED}):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Colored}] {
	color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Link}] {
	color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	text-decoration: underline;
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Outlined}] {
	border: 1px solid rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .32);
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Filled}] {
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	color: rgb(var(${BrTheme.CSSVars.ColorOnAccent}));
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Filled}]:not(${STATE_DISABLED}):hover,
${ELEMENT}[${ATTR_VARIANT}~=${Variant.Filled}]:not(${STATE_DISABLED})[${ATTR_FOCUSED}] {
	background-color: rgba(var(${BrTheme.CSSVars.ColorAccent}), .68);
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Filled}]:not(${STATE_DISABLED}):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorAccent}), .52);
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Tonal}] {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Tonal}]:not(${STATE_DISABLED}):hover,
${ELEMENT}[${ATTR_VARIANT}~=${Variant.Tonal}]:not(${STATE_DISABLED})[${ATTR_FOCUSED}] {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${ELEMENT}[${ATTR_VARIANT}~=${Variant.Tonal}]:not(${STATE_DISABLED}):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .02);
}
`)}

export function define(): void {
	if (!document || !window || _isDefined) {
		return
	}

	_initDefaultStyles()
	_isDefined = true
}

BrTheme.define()
define()