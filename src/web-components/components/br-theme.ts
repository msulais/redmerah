import { colorContrastRatio, colorToHex, colorToRgb, hexToRgb, hslToRgb, isColorValid, rgbToHsl, type HEXColor, type HSLColor, type RGBColor } from "../colors"

export const CSSVars = {

	// Colors
	ColorBackgroundLight: '--br-theme-color-background-light',
	ColorBackgroundDark : '--br-theme-color-background-dark',
	ColorBackground     : '--br-theme-color-background',
	ColorAccentLight    : '--br-theme-color-accent-light',
	ColorAccentDark     : '--br-theme-color-accent-dark',
	ColorOnAccentLight  : '--br-theme-color-on-accent-light',
	ColorOnAccentDark   : '--br-theme-color-on-accent-dark',
	ColorSurfaceLight   : '--br-theme-color-surface-light',
	ColorSurfaceDark    : '--br-theme-color-surface-dark',
	ColorOnSurfaceLight : '--br-theme-color-on-surface-light',
	ColorOnSurfaceDark  : '--br-theme-color-on-surface-dark',
	ColorAccent         : '--br-theme-color-accent',
	ColorOnAccent       : '--br-theme-color-on-accent',
	ColorSurface        : '--br-theme-color-surface',
	ColorOnSurface      : '--br-theme-color-on-surface',

	// Font Family
	FontFamilyIcon     : '--br-theme-font-family-icon',
	FontFamilySansSerif: '--br-theme-font-family-sans-serif',
	FontFamilyMonospace: '--br-theme-font-family-monospace',

	// Duration
	DurationTransition: '--br-theme-duration-transition'
} as const
export type CSSVars = typeof CSSVars[keyof typeof CSSVars]

export const Attributes = {
	/**
	 * Default to "auto"
	 *
	 * @type {string} Hex color
	 * */
	ColorAccent: 'br:color-accent',

	/**
	 * Default to "auto"
	 *
	 * @type {string} `"light" | "dark" | "auto"`
	 * */
	ThemeMode: 'br:theme-mode',

	/**
	 * @type {string} List of font-family
	 * */
	FontFamilyIcon: 'br:font-family-icon',

	/**
	 * @type {string} List of font-family
	 * */
	FontFamilyMonospace: 'br:font-family-monospace',

	/**
	 * @type {string} List of font-family
	 * */
	FontFamilySansSerif: 'br:font-family-sans-serif',

	/**
	 * @type {string} `"on" | "off" | "auto"`
	 * */
	Animation: 'br:animation'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const Animation = {
	On: 'on',
	Off: 'off',
	Auto: 'auto'
} as const
export type Animation = typeof Animation[keyof typeof Animation]

export const ThemeMode = {
	Light: 'light',
	Dark: 'dark',
	Auto: 'auto'
} as const
export type ThemeMode = typeof ThemeMode[keyof typeof ThemeMode]

export const TAGNAME = 'br-theme'
const DEFAULT_COLOR_ACCENT_LIGHT     = 0x0051DF
const DEFAULT_COLOR_ACCENT_DARK      = 0xB5C4FF
const DEFAULT_COLOR_ON_ACCENT_LIGHT  = 0xFFFFFF
const DEFAULT_COLOR_ON_ACCENT_DARK   = 0x00297A
const DEFAULT_COLOR_SURFACE_LIGHT    = 0xFAFAFA
const DEFAULT_COLOR_SURFACE_DARK     = 0x2E2E2E
const DEFAULT_COLOR_ON_SURFACE_LIGHT = 0x000000
const DEFAULT_COLOR_ON_SURFACE_DARK  = 0xFFFFFF
const DEFAULT_COLOR_BACKGROUND_LIGHT = 0xF2F2F2
const DEFAULT_COLOR_BACKGROUND_DARK  = 0x1F1F1F
const DEFAULT_DURATION_TRANSITION    = 200
const ELEMENTS = new Set<BiruThemeElement>()
const STYLES = new CSSStyleSheet()
let _isSystemAnimationAllowed = true

export class BiruThemeElement extends HTMLElement {
	static observedAttributes = [
		Attributes.ColorAccent,
		Attributes.FontFamilyIcon,
		Attributes.FontFamilyMonospace,
		Attributes.FontFamilySansSerif,
	]

	constructor() {
		super()
	}

	attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
		switch (name) {
		case Attributes.ColorAccent:
			return _updateAccentColor(oldValue, newValue)
		case Attributes.FontFamilyIcon:
			_insertNewStyle(name, oldValue, newValue,
				(value) => [[CSSVars.FontFamilyIcon, value].join(':')].join(';')
			)
			break
		case Attributes.FontFamilyMonospace:
			_insertNewStyle(name, oldValue, newValue,
				(value) => [[CSSVars.FontFamilyMonospace, value].join(':')].join(';')
			)
			break
		case Attributes.FontFamilySansSerif:
			_insertNewStyle(name, oldValue, newValue,
				(value) => [[CSSVars.FontFamilySansSerif, value].join(':')].join(';')
			)
			break
		}
	}

	connectedCallback(): void {
		ELEMENTS.add(this)
		const currentColor = this.getAttribute(Attributes.ColorAccent)
		if (currentColor) {
			_updateAccentColor(null, currentColor)
		}
	}

	disconnectedCallback(): void {
		ELEMENTS.delete(this)
		const currentColor = this.getAttribute(Attributes.ColorAccent)
		if (currentColor) {
			_updateAccentColor(currentColor, null)
		}
	}

	get biru() {
		const self = this
		return {
			get transitionDuration(): number {
				switch (this.animation) {
				case Animation.On: break
				case Animation.Off: return 0
				case Animation.Auto: return (_isSystemAnimationAllowed? DEFAULT_DURATION_TRANSITION : 0)
				}

				return DEFAULT_DURATION_TRANSITION
			},
			get animation(): Animation {
				let animation = (self.getAttribute(Attributes.Animation) || Animation.Auto) as Animation
				switch (animation) {
				case Animation.Auto:
				case Animation.On:
				case Animation.Off:
					break
				default:
					animation = Animation.Auto
				}

				return animation
			},
			set animation(value: Animation) {
				self.setAttribute(Attributes.Animation, value)
			},
			get themeMode(): ThemeMode {
				let mode = (self.getAttribute(Attributes.ThemeMode) || ThemeMode.Light) as ThemeMode
				switch (mode) {
				case ThemeMode.Auto:
				case ThemeMode.Light:
				case ThemeMode.Dark:
					break
				default:
					mode = ThemeMode.Light
				}

				return mode
			},
			set themeMode(value: ThemeMode) {
				self.setAttribute(Attributes.ThemeMode, value)
			},
			get colorAccent(): HEXColor {
				const accent = self.getAttribute(Attributes.ColorAccent)!
				if (accent && isColorValid(accent)) {
					return (accent as HEXColor).toUpperCase() as HEXColor
				}

				return colorToHex(DEFAULT_COLOR_ACCENT_LIGHT)
			},
			set colorAccent(value: HEXColor) {
				self.setAttribute(Attributes.ColorAccent, value)
			}
		}
	}
}

function _rgbParts(rgb: RGBColor): string {
	return [Math.round(rgb.r * 0xff), Math.round(rgb.g * 0xff), Math.round(rgb.b * 0xff)].join(', ')
}

function _generateAccent(seed: RGBColor, background: RGBColor): RGBColor {
	const hsl_seed = rgbToHsl(seed)
	const h = hsl_seed.h
	const size = 250
	const validColors: HSLColor[] = []

	// O(size^2)
	for (let s = 0; s <= size; s++) {
		for (let l = 0; l <= size; l++) {
			const hsl: HSLColor = {h, s: s / size, l: l / size}
			const ratio = colorContrastRatio(hslToRgb(hsl), background)
			if (ratio > 10) {
				validColors.push(hsl)
			}
		}
	}

	if (validColors.length === 0) {
		return seed
	}

	// using Euclidean distance
	const distance = (hsl: HSLColor) => Math.sqrt(
		Math.pow(hsl.s - hsl_seed.s, 2) + Math.pow(hsl.l - hsl_seed.l, 2)
	)

	// find the closest one with the seed
	const hsl = validColors.reduce((a, b) => distance(a) < distance(b)? a : b)
	return hslToRgb(hsl)
}

function _insertNewStyle(
	attrName: string,
	oldValue: string | null,
	newValue: string | null,
	properties: (value: string) => string
): void {
	attrName = CSS.escape(attrName)
	if (oldValue === newValue) {
		return
	}

	if (oldValue !== null) {
		let isStillInUse = false
		for (const el of ELEMENTS) {
			if (el.getAttribute(attrName) === oldValue) {
				isStillInUse = true
				break
			}
		}

		if (!isStillInUse) {
			const selector = `${TAGNAME}[${attrName}="${oldValue}"]`
			const rules = Array.from(STYLES.cssRules) as CSSStyleRule[]
			const indexToRemove = rules.findIndex(rule => rule.selectorText === selector)

			if (indexToRemove !== -1) {
				STYLES.deleteRule(indexToRemove)
			}
		}
	}

	if (newValue === null) {
		return
	}

	const selector = `${TAGNAME}[${attrName}="${newValue.replaceAll('"', '\\"')}"]`
	const rules = Array.from(STYLES.cssRules) as CSSStyleRule[]
	const ruleExists = rules.some(rule => rule.selectorText === selector)
	if (ruleExists) {
		return
	}

	STYLES.insertRule(`${selector}{${properties(newValue)}}`, STYLES.cssRules.length)
}

function _updateAccentColor(oldValue: string | null, newValue: string | null): void {
	_insertNewStyle(Attributes.ColorAccent, oldValue, newValue, (value) => {
		const accentLight   = _generateAccent(hexToRgb(value as HEXColor), colorToRgb(DEFAULT_COLOR_BACKGROUND_LIGHT))
		const accentDark    = _generateAccent(hexToRgb(value as HEXColor), colorToRgb(DEFAULT_COLOR_BACKGROUND_DARK))
		const accentOnLight = _generateAccent(hslToRgb({h: rgbToHsl(accentLight).h, l: .5, s: 1}), accentLight)
		const accentOnDark  = _generateAccent(hslToRgb({h: rgbToHsl(accentDark).h, l: .5, s: 1}), accentDark)
		const properties: string = [
			[CSSVars.ColorAccentLight    , _rgbParts(accentLight  )].join(':'),
			[CSSVars.ColorOnAccentLight  , _rgbParts(accentOnLight)].join(':'),
			[CSSVars.ColorAccentDark     , _rgbParts(accentDark   )].join(':'),
			[CSSVars.ColorOnAccentDark   , _rgbParts(accentOnDark )].join(':'),
		].join(';')
		return properties
	})
}

function _initListeners(): void {
	const prefersReduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')
	_isSystemAnimationAllowed = !prefersReduceMotionMedia.matches
	prefersReduceMotionMedia.addEventListener('change', ev => {
		_isSystemAnimationAllowed = !ev.matches
	})
}

function _initDefaultStyles(): void {
	document.adoptedStyleSheets.push(STYLES)
	const ATTR_THEME_MODE = CSS.escape(Attributes.ThemeMode)
	const ATTR_ANIMATION = CSS.escape(Attributes.Animation)
	STYLES.replaceSync(`
${TAGNAME} {
	${CSSVars.ColorBackgroundLight}: ${_rgbParts(colorToRgb(DEFAULT_COLOR_BACKGROUND_LIGHT))};
	${CSSVars.ColorBackgroundDark }: ${_rgbParts(colorToRgb(DEFAULT_COLOR_BACKGROUND_DARK))};
	${CSSVars.ColorAccentLight    }: ${_rgbParts(colorToRgb(DEFAULT_COLOR_ACCENT_LIGHT))};
	${CSSVars.ColorOnAccentLight  }: ${_rgbParts(colorToRgb(DEFAULT_COLOR_ON_ACCENT_LIGHT))};
	${CSSVars.ColorAccentDark     }: ${_rgbParts(colorToRgb(DEFAULT_COLOR_ACCENT_DARK))};
	${CSSVars.ColorOnAccentDark   }: ${_rgbParts(colorToRgb(DEFAULT_COLOR_ON_ACCENT_DARK))};
	${CSSVars.ColorSurfaceLight   }: ${_rgbParts(colorToRgb(DEFAULT_COLOR_SURFACE_LIGHT))};
	${CSSVars.ColorOnSurfaceLight }: ${_rgbParts(colorToRgb(DEFAULT_COLOR_ON_SURFACE_LIGHT))};
	${CSSVars.ColorSurfaceDark    }: ${_rgbParts(colorToRgb(DEFAULT_COLOR_SURFACE_DARK))};
	${CSSVars.ColorOnSurfaceDark  }: ${_rgbParts(colorToRgb(DEFAULT_COLOR_ON_SURFACE_DARK))};
	${CSSVars.ColorBackground     }: var(${CSSVars.ColorBackgroundLight});
	${CSSVars.ColorAccent         }: var(${CSSVars.ColorAccentLight});
	${CSSVars.ColorOnAccent       }: var(${CSSVars.ColorOnAccentLight});
	${CSSVars.ColorSurface        }: var(${CSSVars.ColorSurfaceLight});
	${CSSVars.ColorOnSurface      }: var(${CSSVars.ColorOnSurfaceLight});
	${CSSVars.DurationTransition  }: ${DEFAULT_DURATION_TRANSITION}ms;
	${CSSVars.FontFamilySansSerif }: ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
	${CSSVars.FontFamilyMonospace }: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
	font-family: var(${CSSVars.FontFamilySansSerif});
	color-scheme: light;
	color: rgb(var(${CSSVars.ColorOnSurface}));
	display: contents;
}

${TAGNAME}[${ATTR_ANIMATION}=${Animation.Off}] {
	${CSSVars.DurationTransition}: 0ms;
}

@media (prefers-reduced-motion: reduce) {
	${TAGNAME}:where([${ATTR_ANIMATION}=${Animation.Auto}],:not([${ATTR_ANIMATION}])) {
		${CSSVars.DurationTransition}: 0ms;
	}
}

${TAGNAME}[${ATTR_THEME_MODE}=${ThemeMode.Dark}] {
	color-scheme: dark;
	${CSSVars.ColorBackground}: var(${CSSVars.ColorBackgroundDark});
	${CSSVars.ColorAccent    }: var(${CSSVars.ColorAccentDark});
	${CSSVars.ColorOnAccent  }: var(${CSSVars.ColorOnAccentDark});
	${CSSVars.ColorSurface   }: var(${CSSVars.ColorSurfaceDark});
	${CSSVars.ColorOnSurface }: var(${CSSVars.ColorOnSurfaceDark});
}

@media (prefers-color-scheme: dark) {
	${TAGNAME}:where([${ATTR_THEME_MODE}=${ThemeMode.Auto}],:not([${ATTR_THEME_MODE}])) {
		color-scheme: dark;
		${CSSVars.ColorBackground}: var(${CSSVars.ColorBackgroundDark});
		${CSSVars.ColorAccent    }: var(${CSSVars.ColorAccentDark});
		${CSSVars.ColorOnAccent  }: var(${CSSVars.ColorOnAccentDark});
		${CSSVars.ColorSurface   }: var(${CSSVars.ColorSurfaceDark});
		${CSSVars.ColorOnSurface }: var(${CSSVars.ColorOnSurfaceDark});
	}
}

${TAGNAME} * {
	box-sizing: border-box;
	color-scheme: inherit;
	font-family: inherit;
	color-accent: var(${CSSVars.ColorAccent});
	transition-timing-function: cubic-bezier(.25, 0, 0, 1);
}

${TAGNAME} code {
	font-family: var(${CSSVars.FontFamilyMonospace});
}

${TAGNAME} :not(br-dialog) {
	margin: 0px;
}`)
}

export function define(): void {
	if (customElements.get(TAGNAME)) {
		return
	}

	_initDefaultStyles()
	_initListeners()
	customElements.define(TAGNAME, BiruThemeElement)
}

define()