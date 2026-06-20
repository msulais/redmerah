export const Attributes = {
	/**
	 * @type {boolean}
	 */
	Manual: 'br:manual',

	/**
	 * @type {number}
	 */
	Gap: 'br:gap',

	/**
	 * @type {string} `"left-top" | "left-center-to-bottom" | "left-center" | "left-center-to-top" | "left-bottom" | "right-top" | "right-center-to-bottom" | "right-center" | "right-center-to-top" | "right-bottom" | "center-top-to-right" | "center-top" | "center-top-to-left" | "center-bottom-to-right" | "center-bottom" | "center-bottom-to-left" | "center-center-left-top" | "center-center-left" | "center-center-left-bottom" | "center-center-top" | "center-center" | "center-center-bottom" | "center-center-right-top" | "center-center-right" | "center-center-right-bottom"`
	 */
	Position: 'br:position',

	/**
	 * @type {number}
	 */
	Padding: 'br:padding',

	/**
	 * To override `padding`, `position`, and `gap`
	 *
	 * @type {boolean}
	 * */
	SubMenu: 'br:submenu'
} as const
export type Attributes = typeof Attributes[keyof typeof Attributes]

export const CSSVars = {
	/** Auto update by component. Don't use. If necesarry use `'left'` property instead. */
	X: '--br-popover-x',

	/** Auto update by component. Don't use. If necesarry use `'top'` property instead. */
	Y: '--br-popover-y',

	/** Auto update by component. Don't use. If necesarry use `'padding'` property instead. */
	Padding: '--br-popover-padding',
} as const


/**
 * ```txt
 *        |            |                      |
 *        |      LEFT  |        CENTER        |  RIGHT
 * —————— + —————————— + ———————————————————— + ———————
 *        |
 *        |            ^                      ^
 * TOP    |     [<^  ] | [^>  ] [<^> ] [<^  ] | [^>  ]
 * —————— +    <—————— + ———————————————————— + ——————>
 *        |     [<v  ] | [v>  ] [<v> ] [<v  ] | [v>  ]
 * CENTER |     [<^v ] | [^v> ] [<^v>] [<^v ] | [^v> ]
 *        |     [<^  ] | [^>  ] [<^> ] [<^  ] | [^>  ]
 * —————— +    <—————— + ———————————————————— + ——————>
 * BOTTOM |     [<v  ] | [v>  ] [<v> ] [<v  ] | [v>  ]
 *        |            v                      v
 * ```
 */
export const Position = {
	LeftTop                : 'left-top',
	LeftCenterToBottom     : 'left-center-to-bottom',
	LeftCenter             : 'left-center',
	LeftCenterToTop        : 'left-center-to-top',
	LeftBottom             : 'left-bottom',
	RightTop               : 'right-top',
	RightCenterToBottom    : 'right-center-to-bottom',
	RightCenter            : 'right-center',
	RightCenterToTop       : 'right-center-to-top',
	RightBottom            : 'right-bottom',
	CenterTopToRight       : 'center-top-to-right',
	CenterTop              : 'center-top',
	CenterTopToLeft        : 'center-top-to-left',
	CenterBottomToRight    : 'center-bottom-to-right',
	CenterBottom           : 'center-bottom',
	CenterBottomToLeft     : 'center-bottom-to-left',
	CenterCenterLeftTop    : 'center-center-left-top',
	CenterCenterLeft       : 'center-center-left',
	CenterCenterLeftBottom : 'center-center-left-bottom',
	CenterCenterTop        : 'center-center-top',
	CenterCenter           : 'center-center',
	CenterCenterBottom     : 'center-center-bottom',
	CenterCenterRightTop   : 'center-center-right-top',
	CenterCenterRight      : 'center-center-right',
	CenterCenterRightBottom: 'center-center-right-bottom'
} as const
export type Position = typeof Position[keyof typeof Position]

export const EventTypes = {
	Toggle: 'br:toggle'
} as const
export type EventTypes = typeof EventTypes[keyof typeof EventTypes]

export const TAGNAME = 'br-popover'