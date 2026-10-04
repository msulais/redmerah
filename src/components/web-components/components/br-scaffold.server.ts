export const Slots = {
	LeftSideBar: 'left-sidebar',
	RightSideBar: 'right-sidebar',
	AppBar: 'appbar',
	BottomBar: 'bottombar'
} as const
export type Slots = typeof Slots[keyof typeof Slots]

export const Parts = {
	Scaffold: 'scaffold',
	LeftSideBar: 'left-sidebar',
	RightSideBar: 'right-sidebar',
	Container: 'container',
	AppBar: 'appbar',
	Body: 'body',
	BottomBar: 'bottombar',
} as const
export type Parts = typeof Parts[keyof typeof Parts]

export const TAGNAME = 'br-scaffold'