import { registerZIndex, unregisterZIndex } from "../flyout.js"
import * as NavigationItem from './navigationitem.js'
import * as BrTheme from './br-theme.js'
import { Commands, GlobalAttributes } from "../global-attributes.js"
import { listenDocumentEvent } from "../event-registry.js"

export const Attributes = {
	/**
	 * @type {string} `"auto" | "sidebar" | "drawer"`
	 * */
	Variant: 'br:variant',

	/**
	 * @type {boolean}
	 * */
	Expanded: 'br:expanded',
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const Variant = {
	Auto   : 'auto',
	SideBar: 'sidebar',
	Drawer : 'drawer'
} as const
export type Variant = typeof Variant[keyof typeof Variant]

export const SCREEN_SIZE_MEDIUM_MIN_IN_REM = 37.5
export const SCREEN_SIZE_MEDIUM_MAX_IN_REM = 52.5
export const TAGNAME = 'br-navigation'
let _allowAnimation = false

export class BiruNavigationElement extends HTMLElement {
	static observedAttributes = [
		Attributes.Expanded,
	]

	constructor() {
		super()
		this.role = 'navigation'
	}

	attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
		switch (name) {
		case Attributes.Expanded:
			if (newValue === null) {
				unregisterZIndex(this)
			}
			else {
				this.style.setProperty('z-index', registerZIndex(this) + '')
			}
			break
		}
	}

	// separate transition animation from css to avoid initial animation
	private _animateDrawer(): void {
		if (!_allowAnimation || !this.biru.isDrawerMode) {
			return
		}

		const theme = this.closest(BrTheme.TAGNAME) as BrTheme.BiruThemeElement | null
		this.animate({
			translate: this.biru.expanded? ['-100% 0', '0 0'] : ['0 0', '-100% 0']
		}, {duration: theme?.biru.transitionDuration ?? 0, easing: 'cubic-bezier(.25,0,0,1)'})
	}

	get biru() {
		const self = this
		return {
			get isSideBarMode(): boolean {
				return (this.variant === Variant.SideBar || (
					this.variant === Variant.Auto
					&& window.matchMedia(`(width >= ${SCREEN_SIZE_MEDIUM_MIN_IN_REM}rem)`).matches
				))
			},
			get isDrawerMode(): boolean {
				return (this.variant === Variant.Drawer || (
					this.variant === Variant.Auto
					&& window.matchMedia(`(width < ${SCREEN_SIZE_MEDIUM_MIN_IN_REM}rem)`).matches
				))
			},
			get expanded(): boolean {
				return self.hasAttribute(Attributes.Expanded)
			},
			set expanded(value: boolean) {
				self.toggleAttribute(Attributes.Expanded, value)
				self._animateDrawer()
			},
			get variant(): Variant {
				const v = self.getAttribute(Attributes.Variant)
				if (!v || !Object.values(Variant).includes(v as any)) {
					return Variant.Auto
				}

				return v as Variant
			},
			set variant(value: Variant) {
				self.setAttribute(Attributes.Variant, value)
			},
		}
	}
}

function _initListeners(): void {
	// listen to drawer mode.
	listenDocumentEvent('click', (ev) => {
		const target = ev.target as HTMLElement
		if (!target) {
			return
		}

		// auto close navigation when click outside.
		for (
			const navigation
			of document.querySelectorAll<BiruNavigationElement>(`${TAGNAME}[${CSS.escape(Attributes.Expanded)}]`)
		) {
			if (navigation.biru.isDrawerMode && !navigation.contains(target)) {
				navigation.biru.expanded = false
			}
		}

		// auto close when click [br:as=navigationitem]
		const navigationItem = target.closest(NavigationItem.TAGNAME)
		if (
			navigationItem
			&& !navigationItem.hasAttribute('disabled')
			&& !navigationItem.hasAttribute(NavigationItem.Attributes.Disabled)
			&& !navigationItem.hasAttribute(GlobalAttributes.PreventDefault)
		) {
			const navigation = navigationItem.closest(TAGNAME) as BiruNavigationElement | null
			if (navigation && navigation.biru.isDrawerMode) {
				navigation.biru.expanded = false
			}
		}
	})

	// listen to [commandfor]
	listenDocumentEvent('click', (ev) => {
		const target = (ev.target as HTMLElement).closest<HTMLElement>(`[${CSS.escape(GlobalAttributes.CommandFor)}]`)
		if (!target) {
			return
		}

		const id = target.getAttribute(GlobalAttributes.CommandFor)
		if (!id) {
			return
		}

		const navigation = document.getElementById(id) as BiruNavigationElement | null
		if (!navigation || !(navigation instanceof BiruNavigationElement)) {
			return
		}

		const action = target.getAttribute(GlobalAttributes.Command) || Commands.ToggleNavigation
		switch (action) {
		case Commands.CloseNavigation : return navigation.biru.expanded = false
		case Commands.OpenNavigation  : return navigation.biru.expanded = true
		case Commands.ToggleNavigation: return navigation.biru.expanded = !navigation.biru.expanded
		}
	})
}

function _initMedia(): void {
	const SMALL_MAX  = window.matchMedia(`(width <  ${SCREEN_SIZE_MEDIUM_MIN_IN_REM}rem)`)
	const MEDIUM_MIN = window.matchMedia(`(width >= ${SCREEN_SIZE_MEDIUM_MIN_IN_REM}rem)`)
	const MEDIUM_MAX = window.matchMedia(`(width <  ${SCREEN_SIZE_MEDIUM_MAX_IN_REM}rem)`)
	const WIDE_MIN   = window.matchMedia(`(width >= ${SCREEN_SIZE_MEDIUM_MAX_IN_REM}rem)`)
	let isWide = WIDE_MIN.matches
	let timeoutId: ReturnType<typeof setTimeout> | undefined

	const fn_update = () => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => {
			for (const navigation of document.querySelectorAll<BiruNavigationElement>(TAGNAME)) {
				navigation.biru.expanded = isWide && navigation.biru.variant === Variant.Auto
			}

			_allowAnimation = true
		}, 50)
	}

	fn_update()
	SMALL_MAX.addEventListener('change', () => fn_update())
	MEDIUM_MIN.addEventListener('change', () => fn_update())
	MEDIUM_MAX.addEventListener('change', () => fn_update())
	WIDE_MIN.addEventListener('change', ev => {
		isWide = ev.matches
		fn_update()
	})
}

function _initDefaultStyles(): void {
	const styles = new CSSStyleSheet()
	document.adoptedStyleSheets.push(styles)

	const ELEMENT = `${BrTheme.TAGNAME} ${TAGNAME}`
	const ATTR_VARIANT = CSS.escape(Attributes.Variant)
	const ATTR_EXPANDED = CSS.escape(Attributes.Expanded)
	const VARIANT_AUTO = `:is([${ATTR_VARIANT}=${Variant.Auto}],:not([${ATTR_VARIANT}]))`
	const VARIANT_SIDEBAR = `[${ATTR_VARIANT}=${Variant.SideBar}]`
	const VARIANT_DRAWER = `[${ATTR_VARIANT}=${Variant.Drawer}]`
	styles.replaceSync(`
${ELEMENT} {
	display: flex;
	flex-direction: column;
	padding: .5rem;
	height: 100%;
	overflow: auto;
	min-width: 5rem;
	max-height: 100%;
	gap: .5rem;
	align-items: center;
}

${ELEMENT}${VARIANT_SIDEBAR}[${ATTR_EXPANDED}] {
	width: 16rem;
	gap: .25rem;
	align-items: flex-start;
}

${ELEMENT}${VARIANT_SIDEBAR}[${ATTR_EXPANDED}] ${NavigationItem.TAGNAME} {
	flex-direction: row;
	font-size: .875rem;
	max-width: 100%;
	gap: .5rem;
	min-height: 2rem;
	padding: .25rem .75rem;
}

@media (hover: none) {
	${ELEMENT}${VARIANT_SIDEBAR}[${ATTR_EXPANDED}] ${NavigationItem.TAGNAME} {
		font-size: 1rem;
		min-height: 3rem;
		border-radius: 1.5rem;
	}
}

${ELEMENT}${VARIANT_SIDEBAR}[${ATTR_EXPANDED}] ${NavigationItem.TAGNAME}[${CSS.escape(NavigationItem.Attributes.Selected)}] {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
}

${ELEMENT}${VARIANT_SIDEBAR}[${ATTR_EXPANDED}] ${NavigationItem.TAGNAME} > :first-child {
	padding: 0px;
	background-color: transparent;
}

${ELEMENT}${VARIANT_DRAWER} {
	position: fixed;
	top: 0;
	left: 0;
	height: 100dvh;
	max-height: 100dvh;
	background-color: rgb(var(${BrTheme.CSSVars.ColorSurface}));
	translate: -100% 0;
	box-shadow: 0 0 1rem rgba(0, 0, 0, .25);
	width: 16rem;
	gap: .25rem;
	align-items: flex-start;
}

${ELEMENT}${VARIANT_DRAWER}[${ATTR_EXPANDED}] {
	translate: 0 0;
}

${ELEMENT}${VARIANT_DRAWER} ${NavigationItem.TAGNAME} {
	flex-direction: row;
	font-size: .875rem;
	gap: .5rem;
	min-height: 2rem;
	max-width: 100%;
	padding: .25rem .75rem;
}

@media (hover: none) {
	${ELEMENT}${VARIANT_DRAWER} ${NavigationItem.TAGNAME} {
		min-height: 3rem;
		font-size: 1rem;
		border-radius: 1.5rem;
	}
}

${ELEMENT}${VARIANT_DRAWER} ${NavigationItem.TAGNAME}[${CSS.escape(NavigationItem.Attributes.Selected)}] {
	background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
	color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
}

${ELEMENT}${VARIANT_DRAWER} ${NavigationItem.TAGNAME} > :first-child {
	padding: 0px;
	background-color: transparent;
}

@media (width >= ${SCREEN_SIZE_MEDIUM_MIN_IN_REM}rem){
	${ELEMENT}${VARIANT_AUTO}[${ATTR_EXPANDED}] {
		width: 16rem;
		gap: .25rem;
		align-items: flex-start;
	}

	${ELEMENT}${VARIANT_AUTO}[${ATTR_EXPANDED}] ${NavigationItem.TAGNAME} {
		flex-direction: row;
		font-size: .875rem;
		gap: .5rem;
		max-width: 100%;
		min-height: 2rem;
		padding: .25rem .75rem;
	}

	${ELEMENT}${VARIANT_AUTO}[${ATTR_EXPANDED}] ${NavigationItem.TAGNAME}[${CSS.escape(NavigationItem.Attributes.Selected)}] {
		background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
		color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	}

	${ELEMENT}${VARIANT_AUTO}[${ATTR_EXPANDED}] ${NavigationItem.TAGNAME} > :first-child {
		padding: 0px;
		background-color: transparent;
	}
}

@media (width >= ${SCREEN_SIZE_MEDIUM_MIN_IN_REM}rem) and (hover: none) {
	${ELEMENT}${VARIANT_AUTO}[${ATTR_EXPANDED}] ${NavigationItem.TAGNAME} {
		min-height: 3rem;
		font-size: 1rem;
		border-radius: 1.5rem;
	}
}

@media (width < ${SCREEN_SIZE_MEDIUM_MIN_IN_REM}rem) {
	${ELEMENT}${VARIANT_AUTO} {
		position: fixed;
		top: 0;
		left: 0;
		height: 100dvh;
		max-height: 100dvh;
		background-color: rgb(var(${BrTheme.CSSVars.ColorSurface}));
		translate: -100% 0;
		box-shadow: 0 0 1rem rgba(0, 0, 0, .25);
		width: 16rem;
		gap: .25rem;
		align-items: flex-start;
	}

	${ELEMENT}${VARIANT_AUTO}[${ATTR_EXPANDED}] {
		translate: 0 0;
	}

	${ELEMENT}${VARIANT_AUTO} ${NavigationItem.TAGNAME} {
		flex-direction: row;
		font-size: .875rem;
		gap: .5rem;
		max-width: 100%;
		min-height: 2rem;
		padding: .25rem .75rem;
	}

	${ELEMENT}${VARIANT_AUTO} ${NavigationItem.TAGNAME}[${CSS.escape(NavigationItem.Attributes.Selected)}] {
		background-color: rgba(var(${BrTheme.CSSVars.ColorOnSurface}), .08);
		color: rgb(var(${BrTheme.CSSVars.ColorAccent}));
	}

	${ELEMENT}${VARIANT_AUTO} ${NavigationItem.TAGNAME} > :first-child {
		padding: 0px;
		background-color: transparent;
	}
}

@media (width < ${SCREEN_SIZE_MEDIUM_MIN_IN_REM}rem) and (hover: none) {
	${ELEMENT}${VARIANT_AUTO} ${NavigationItem.TAGNAME} {
		min-height: 3rem;
		font-size: 1rem;
		border-radius: 1.5rem;
	}
}
`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initMedia()
	_initListeners()
	_initDefaultStyles()
	customElements.define(TAGNAME, BiruNavigationElement)
}

BrTheme.define()
NavigationItem.define()
define()