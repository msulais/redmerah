export const Attributes = {
	/**
	 * Direction of focus key. Default `"both"`
	 *
	 * @type {string} `"vertical" | "horizontal" | "both" | "grid"` */
	Direction: 'br:direction',

	/**
	 * Element ids. Separated by space character. All children if not present.
	 *
	 * @type {string[]}
	 * */
	For: 'br:for',

	/**
	 * Element ids to exclude from auto-detection. Separated by space character.
	 *
	 * @type {string[]}
	 * */
	Except: 'br:except',

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