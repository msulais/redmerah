import { listenRouteChange } from '../router.js'
import { QueryValidation } from '../utils.js'
import * as BrTheme from './br-theme.js'

export const Attributes = {
	Path    : 'br:path',
	Query   : 'br:query',
	Hash    : 'br:hash',
	Label   : 'br:label',
	Selected: 'br:selected',

	/** Keep focus ring visible */
	KeepFocusVisible: 'br:keep-focus-visible',

	/** For element that has no `:disabled` state selector */
	Disabled: 'br:disabled'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const TAGNAME = '[br\\:as~=navigationitem]'
let _isDefined = false

function _initDefaultStyles(): void {
	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const STATE_DISABLED = `:where(:disabled,[${CSS.escape(Attributes.Disabled)}])`
	const STATE_SELECTED = `[${CSS.escape(Attributes.Selected)}]`
	const ATTR_LABEL = CSS.escape(Attributes.Label)
	const ATTR_KEEPFOCUSVISIBLE = CSS.escape(Attributes.KeepFocusVisible)
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)
	styles.replaceSync(`
${ELEMENT} {
	border: 1px solid transparent;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: .75rem;
	gap: .25rem;
	text-decoration: none;
	user-select: none;
	line-height: normal;
	cursor: pointer;
	padding: .5rem;
	width: 100%;
	border-radius: .25rem;
	color: rgb(var(${BrTheme.CSSVars.ColorOnSurface}));
}

@media (hover: none) {
	${ELEMENT} {
		font-size: 1rem;
	}
}

${ELEMENT}:focus-visible {
	outline: auto;
}

${ELEMENT}${STATE_DISABLED} {
	filter: grayscale(1) opacity(0.5);
	cursor: not-allowed;
}

${ELEMENT}:not(${STATE_DISABLED})[${ATTR_KEEPFOCUSVISIBLE}]:focus {
	outline: auto;
}

${ELEMENT}:not(${STATE_DISABLED}):hover {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
}

${ELEMENT}:not(${STATE_DISABLED}):active {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .04);
}

${ELEMENT} * {
	user-select: inherit;
	cursor: inherit;
}

${ELEMENT} > :first-child {
	transition-duration: var(${BrTheme.CSSVars.DurationTransition});
}

${ELEMENT}${STATE_SELECTED} > :first-child {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	border-radius: 999999px;
	color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	padding: .75rem;
}

${ELEMENT}[${ATTR_LABEL}]::after {
	display: block;
	content: attr(${ATTR_LABEL});
}
`)
}

function _checkSelectedNavigationItems(): void {
	const urlSearchParams = new URLSearchParams(window.location.search)
	for (const ref of document.querySelectorAll(TAGNAME)) {
		const path = ref.getAttribute(Attributes.Path)?.split(/ +/) ?? []
		const query = (ref.getAttribute(Attributes.Query) ?? '').replaceAll(' ', '')
		const hash = (ref.getAttribute(Attributes.Hash)?.split(/ +/).map(v => v.startsWith('#')? v : `#${v}`) ?? [])
		if (
			path.length === 0
			&& query.length === 0
			&& hash.length === 0
		) {
			ref.toggleAttribute(Attributes.Selected, false)
			continue
		}

		let isMatch = true

		// 1. Check Path (br:path)
		if (path.length > 0 && !path.includes(location.pathname)) {
			isMatch = false
		}

		// 2. Check Hash (br:hash)
		if (isMatch && hash.length > 0 && !hash.includes(location.hash)) {
			isMatch = false
		}

		// 3. Check Queries (br:query)
		if (isMatch && query.length > 0) {
			const parser = new QueryValidation(query, urlSearchParams)
			if (!parser.evaluate()) {
				isMatch = false
			}
		}

		ref.toggleAttribute(Attributes.Selected, isMatch)
	}
}

function _initListeners(): void {
	listenRouteChange(() => _checkSelectedNavigationItems())
}

export function define(): void {
	if (!document || !window || _isDefined) {
		return
	}

	_checkSelectedNavigationItems()
	_initDefaultStyles()
	_initListeners()
	_isDefined = true
}

BrTheme.define()
define()