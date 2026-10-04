export const Slots = {
	Leading: 'leading',
	Headline: 'headline',
	Trailing: 'trailing'
} as const
export type Slots = typeof Slots[keyof typeof Slots]

export const Parts = {
	Header: 'header',
	Leading: 'leading',
	Content: 'content',
	Trailing: 'trailing',
	Headline: 'headline',
	Flex: 'flex'
} as const
export type Parts = typeof Parts[keyof typeof Parts]

export const TAGNAME = 'br-appbar'