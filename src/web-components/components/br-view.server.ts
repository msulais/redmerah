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
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const TAGNAME = 'br-view'