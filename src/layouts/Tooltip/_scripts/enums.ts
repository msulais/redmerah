export enum TooltipAttributes {
	Position = 'data-tooltip-position',
	Tooltip = 'data-tooltip',
	Duration = 'data-tooltip-duration',
	Delay = 'data-tooltip-delay',

	/** @param transition JSON string of `PropertyIndexedKeyframes`  */
	Transition = 'data-tooltip-transition'
}

export enum TooltipPosition {
	Top = 'top',
	Right = 'right',
	Bottom = 'bottom',
	Left = 'left'
}