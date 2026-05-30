import * as BrTheme from './br-theme.js'

export const Attributes = {
	/** `"colored" | "tonal" | "outlined" | "filled"` */
	Variant: 'br:variant',
	Focused: 'br:focused',
	Icon: 'br:icon'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const Variant = {
	Colored : 'colored',
	Tonal   : 'tonal',
	Outlined: 'outlined',
	Filled  : 'filled'
} as const
export type Variant = typeof Variant[keyof typeof Variant]

export const STYLES  = new CSSStyleSheet()
const ATTR_VARIANT = CSS.escape(Attributes.Variant)
const ATTR_FOCUSED = CSS.escape(Attributes.Focused)
const ATTR_ICON = CSS.escape(Attributes.Icon)
const ELEMENT = ':is(button,[br\\:as=button])'
let isDefined = false

function _initDefaultStyle(): void {
	document.adoptedStyleSheets.push(STYLES)
	STYLES.replaceSync(`
${BrTheme.TAGNAME} ${ELEMENT} {
	display: flex;
	border-radius: .25rem;
	font-size: .875rem;
	user-select: none;
	min-height: 2rem;
	outline-offset: 4px;
	cursor: pointer;
	background-color: transparent;
	padding: .25rem .75rem;
	line-height: normal;
	border: 1px solid transparent;
	filter: none;
	gap: .5rem;
	align-items: center;
	width: fit-content;
}

${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_ICON}] {
	padding: 0;
	justify-content: center;
	width: 2.5rem;
}

${BrTheme.TAGNAME} ${ELEMENT} * {
	user-select: inherit;
}

${BrTheme.TAGNAME} ${ELEMENT}:disabled {
	filter: grayscale(1) opacity(0.5);
	cursor: not-allowed;
}

${BrTheme.TAGNAME} ${ELEMENT}:not(:disabled)[${ATTR_FOCUSED}],
${BrTheme.TAGNAME} ${ELEMENT}:not(:disabled):hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${BrTheme.TAGNAME} ${ELEMENT}:not(:disabled):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Colored}] {
	color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
}

${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Outlined}] {
	border-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .32);
}

${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Filled}] {
	background-color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	color: rgb(var(${BrTheme.CSSVars.ColorOnAccent}));
}

${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Filled}]:not(:disabled):hover,
${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Filled}]:not(:disabled)[${ATTR_FOCUSED}] {
	background-color: rgba(var(${BrTheme.CSSVars.ColorAccent}), .68);
}

${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Filled}]:not(:disabled):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorAccent}), .52);
}

${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Tonal}] {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Tonal}]:not(:disabled):hover,
${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Tonal}]:not(:disabled)[${ATTR_FOCUSED}] {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${BrTheme.TAGNAME} ${ELEMENT}[${ATTR_VARIANT}~=${Variant.Tonal}]:not(:disabled):active {
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