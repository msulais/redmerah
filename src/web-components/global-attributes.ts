export const GlobalAttributes = {
	As: 'br:as',
	CommandFor: 'br:commandfor',
	Command: 'br:command',
	Tooltip: 'br:tooltip'
} as const
export type GlobalAttributes = typeof GlobalAttributes[keyof typeof GlobalAttributes]

export const As = {
	Button: 'button'
} as const
export type As = typeof As[keyof typeof As]

export const Commands = {
	OpenPopover  : 'open-popover',
	ClosePopover : 'close-popover',
	TogglePopover: 'toggle-popover',
	OpenDialog   : 'open-dialog',
	CloseDialog  : 'close-dialog'
} as const
export type Commands = typeof Commands[keyof typeof Commands]
