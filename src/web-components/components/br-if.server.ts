export const Attributes = {

	/** Multiple path separated by space. Example: `"/ /a/b /a/b/e"` */
	Path : 'br:path' ,

	/** Multiple hash target separated by space. Example: `"#id1 #id2 #id3"` */
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
	*/
	Query: 'br:query',

	/**
	 * Complex media query. Equal to how implement media query in CSS.
	 *
	 * Example: `"(not (width > 1000px)) and (color), print and (color)"`
	 * */
	Media: 'br:media',

	AnimationFor               : 'br:animation-for',

	/** `Keyframe[] | PropertyIndexedKeyframes` */
	AnimationStartKeyframes    : 'br:animation-start-keyframes',
	AnimationStartEasing       : 'br:animation-start-easing',
	AnimationStartDuration     : 'br:animation-start-duration',
	AnimationStartDelayDuration: 'br:animation-start-delay-duration',

	/** `Keyframe[] | PropertyIndexedKeyframes` */
	AnimationEndKeyframes      : 'br:animation-end-keyframes',
	AnimationEndEasing         : 'br:animation-end-easing',
	AnimationEndDuration       : 'br:animation-end-duration',
	AnimationEndDelayDuration  : 'br:animation-end-delay-duration',
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const EventTypes = {
	Toggle: 'br:toggle'
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export const TAGNAME = 'br-if'