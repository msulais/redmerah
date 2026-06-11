export const Attributes = {
	Manual  : 'br:manual',
	Gap     : 'br:gap',
	Position: 'br:position',
	Padding : 'br:padding',

	/** To override `padding`, `position`, and `gap` */
	SubMenu : 'br:submenu'
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