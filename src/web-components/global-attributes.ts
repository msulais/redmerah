export const GlobalAttributes = {
	As            : 'br:as',
	CommandFor    : 'br:command-for',
	Command       : 'br:command',
	Tooltip       : 'br:tooltip',
	PreventDefault: 'br:prevent-default'
} as const
export type GlobalAttributes = typeof GlobalAttributes[keyof typeof GlobalAttributes]

export const As = {
	Button: 'button',
	Checkbox: 'checkbox',
	Label: 'label',
	Menu: 'menu',
	NavigationItem: 'navigationitem',
	RadioButton: 'radiobutton',
	Select: 'select',
	Slider: 'slider',
	Switch: 'switch',
	TextField: 'textfield'
} as const
export type As = typeof As[keyof typeof As]

export const Commands = {
	OpenPopover     : 'open-popover',
	ClosePopover    : 'close-popover',
	TogglePopover   : 'toggle-popover',
	OpenNavigation  : 'open-navigation',
	CloseNavigation : 'close-navigation',
	ToggleNavigation: 'toggle-navigation',
	OpenDialog      : 'open-dialog',
	CloseDialog     : 'close-dialog',
	ToggleDialog    : 'toggle-dialog',
} as const
export type Commands = typeof Commands[keyof typeof Commands]
