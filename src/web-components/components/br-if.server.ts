export const Attributes = {
	/**
	 * Multiple path separated by space. Example: `"/ /a/b /a/b/e"`
	 *
	 * @type {string[]}
	 * */
	Path : 'br:path' ,

	/**
	 * Multiple hash target separated by space. Example: `"#id1 #id2 #id3"`
	 *
	 * @type {string[]}
	 * */
	Hash : 'br:hash' ,

	/**
	 * Complex url query. Example: `"(page=home | none) & id=2 & !date=now"`.
	 *
	 * Operator:
	 *
	 * * `&` = AND
	 * * `|` = OR
	 * * `!` = NOT
	 * * `none` = true
	 *
	 * @type {string}
	*/
	Query: 'br:query',

	/**
	 * Complex media query. Equal to how implement media query in CSS.
	 *
	 * Example: `"(not (width > 1000px)) and (color), print and (color)"`
	 *
	 * @type {string}
	 * */
	Media: 'br:media',

	/**
	 * Element ids
	 *
	 * @type {string[]}
	 */
	AnimationFor: 'br:animation-for',

	/** `Keyframe[] | PropertyIndexedKeyframes` */
	AnimationStartKeyframes: 'br:animation-start-keyframes',

	/**
	 * @type {string}
	 */
	AnimationStartEasing: 'br:animation-start-easing',

	/**
	 * @type {number} in milliseconds
	 */
	AnimationStartDuration: 'br:animation-start-duration',

	/**
	 * @type {number} in milliseconds
	 */
	AnimationStartDelayDuration: 'br:animation-start-delay-duration',

	/** `Keyframe[] | PropertyIndexedKeyframes` */
	AnimationEndKeyframes: 'br:animation-end-keyframes',

	/**
	 * @type {string}
	 */
	AnimationEndEasing: 'br:animation-end-easing',

	/**
	 * @type {number} in milliseconds
	 */
	AnimationEndDuration: 'br:animation-end-duration',

	/**
	 * @type {number} in milliseconds
	 */
	AnimationEndDelayDuration: 'br:animation-end-delay-duration',
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const EventTypes = {
	Toggle: 'br:toggle'
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export const TAGNAME = 'br-if'