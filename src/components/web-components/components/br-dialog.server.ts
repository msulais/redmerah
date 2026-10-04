export const Parts = {
	Title: 'title',
	Content: 'content',
	Footer: 'footer'
} as const
export type Parts = typeof Parts[keyof typeof Parts]

export const Slots = {
	Title: 'title',
	Header: 'header',
	Footer: 'footer'
} as const
export type Slots = typeof Slots[keyof typeof Slots]

export const EventTypes = {
	Toggle: 'br:toggle'
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export const Attributes = {
	/**
	 * @type {boolean}
	 * */
	Manual: 'br:manual'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const TAGNAME = 'br-dialog'