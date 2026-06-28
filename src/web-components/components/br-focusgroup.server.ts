export const Attributes = {
	/**
	 * Direction of focus key. Default `"both"`
	 *
	 * @type {string} `"vertical" | "horizontal" | "both" | "grid"` */
	Direction: 'br:direction',

	/**
	 * Element ids. Separated by space character. If [br:query-for] not
	 * present, then all focusable children.
	 *
	 * @type {string[]}
	 * */
	For: 'br:for',

	/**
	 * CSS Query for multiple elements. Only used when [br:for] not exist
	 */
	QueryFor: 'br:query-for',

	/**
	 * Disables the roving tabindex behavior when present.
	 *
	 * @type {boolean}
	 * */
	DisableAutoTabindex: 'br:disabled-auto-tabindex'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const Direction = {
	Vertical: 'vertical',
	Horizontal: 'horizontal',
	Both: 'both',
	Grid: 'grid',
} as const
export type Direction = typeof Direction[keyof typeof Direction]

export const TAGNAME = 'br-focusgroup'