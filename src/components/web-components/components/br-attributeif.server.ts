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
	 * Always set attribute to element. Override any conditions.
	 *
	 * @type {boolean}
	 */
	Checked: 'br:checked',

	/**
	 * Element ids
	 *
	 * @type {string[]}
	 */
	For: 'br:for',

	/**
	 * CSS Query for multiple elements. Only used when [br:for] not exist
	 */
	QueryFor: 'br:query-for',

	/**
	 * Attribute name
	 *
	 * @type {string}
	 */
	Name: 'br:name',

	/**
	 * Attribute value
	 *
	 * @type {string}
	 */
	Value: 'br:value',

	/**
	 * Attribute value
	 *
	 * @type {string}
	 */
	Fallback: 'br:fallback',
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const EventTypes = {
	Toggle: 'br:toggle'
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export const TAGNAME = 'br-attributeif'