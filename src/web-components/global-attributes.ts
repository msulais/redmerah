export const GlobalAttributes = {
	/**
	 * Element aliasing. For styling native element
	 * to match with the rest of web component.
	 *
	 * If value prefix with `!`, then it's exception.
	 *
	 * @example
	 * ```html
	 * <input br:as="textfield" type="text">
	 * <button br:as="!button">Click</button>
	 * ```
	 */
	As: 'br:as',

	/**
	 * Element ids to command. Each id are separated by space.
	 */
	CommandFor: 'br:command-for',

	/**
	 * Command for `[br:command-for]`. Each command are separated by space.
	 *
	 * This is optional. Every command already have default command. Or use
	 * value `"default"` to explicitly use default command.
	 *
	 * @example
	 * ```html
	 * <button
	 *     br:command-for="p-1 p-2 p-3"
	 *     br:command="default close-popover">
	 *     Do many thing
	 * </button>
	 * <br-popover id="p-1">...</br-popover>
	 * <br-popover id="p-2">...</br-popover>
	 * <br-popover id="p-3">...</br-popover>
	 * ```
	 * */
	Command: 'br:command',

	/**
	 * Show tooltip when hovered by pointer.
	 *
	 * Recommended: Use `<br-tooltip>` as parent.
	 *
	 * @example
	 * ```html
	 * <br-tooltip>
	 * 	<span br:tooltip="This is a number">092</span>
	 * </br-tooltip>
	 * ```
	 */
	Tooltip: 'br:tooltip',

	/**
	 * Prevent default action by web component.
	 */
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

	// for <br-popover>
	OpenPopover     : 'open-popover',
	ClosePopover    : 'close-popover',
	TogglePopover   : 'toggle-popover',

	// for <br-navigation>
	OpenNavigation  : 'open-navigation',
	CloseNavigation : 'close-navigation',
	ToggleNavigation: 'toggle-navigation',

	// for <br-dialog>
	OpenDialog      : 'open-dialog',
	CloseDialog     : 'close-dialog',
	ToggleDialog    : 'toggle-dialog',

	Default         : 'default'
} as const
export type Commands = typeof Commands[keyof typeof Commands]
