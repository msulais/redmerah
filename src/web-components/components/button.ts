import * as BrTheme from './br-theme.js'

export const Attributes = {
	/** `"colored" | "tonal" | "outlined" | "filled" | "link"` */
	Variant: 'br:variant',
	Focused: 'br:focused',
	Icon   : 'br:icon',

	/** For element that has no `:disabled` state selector */
	Disabled: 'br:disabled'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const Variant = {
	Colored : 'colored',
	Tonal   : 'tonal',
	Outlined: 'outlined',
	Filled  : 'filled',
	Link    : 'link'
} as const
export type Variant = typeof Variant[keyof typeof Variant]

export const STYLES  = new CSSStyleSheet()
export const TAGNAME = ':where(button,[br\\:as~=button])'
const ATTR_VARIANT = CSS.escape(Attributes.Variant)
const ATTR_FOCUSED = CSS.escape(Attributes.Focused)
const ATTR_ICON = CSS.escape(Attributes.Icon)
const STATE_DISABLED = `:where(:disabled,[${CSS.escape(Attributes.Disabled)}])`
const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
let isDefined = false

function _initDefaultStyle(): void {
	document.adoptedStyleSheets.push(STYLES)
	STYLES.replaceSync(`
${ELEMENT} {
	display: flex;
	border-radius: .25rem;
	font-size: .875rem;
	user-select: none;
	min-height: 2rem;
	cursor: pointer;
	background-color: transparent;
	padding: .25rem .75rem;
	line-height: normal;
	border: 1px solid transparent;
	filter: none;
	gap: .5rem;
	color: rgb(var(${BrTheme.CSSVars.ColorOnSurface}));
	text-decoration: none;
	align-items: center;
}

${ELEMENT}:has( :focus-visible) {
	outline: auto;
}

${ELEMENT}[${ATTR_ICON}] {
	padding: 0;
	justify-content: center;
	width: 2.5rem;
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
	border-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .32);
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
	if (isDefined) {
		return
	}

	_initDefaultStyle()
	isDefined = true
}

BrTheme.define()
define()