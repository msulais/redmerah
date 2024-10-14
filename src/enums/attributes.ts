export enum RootAttributes {
	theme = 'data-theme',
	corner = 'data-corner',
	platform = 'data-platform'
}

export enum BodyAttributes {
	modalListener = 'data-c-modal-listener',
	popoverListener = 'data-c-popover-listener',
	tooltipListener = 'data-c-tooltip-listener',
	emojiListener = 'data-c-emoji-listener',

	/**
	 * Disable all element pointer event. Except element that has [data-g-keep-pointer-event].
	 */
	noPointerEvent = 'data-g-no-pointer-event'
}