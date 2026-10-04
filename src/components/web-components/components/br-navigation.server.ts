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