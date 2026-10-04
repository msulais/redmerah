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