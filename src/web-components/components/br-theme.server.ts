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
	 * @type {string} Hex color
	 * */
	ColorAccent: 'br:color-accent',

	/**
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