export enum RootAttributes {
	theme = 'data-theme',
	corner = 'data-corner',
	platform = 'data-platform'
}

export enum BodyAttributes {
	modal_listener = 'data-c-modal-listener',
	popover_listener = 'data-c-popover-listener',
	tooltip_listener = 'data-c-tooltip-listener',
	emoji_listener = 'data-c-emoji-listener',

	/** Disable all element pointer event. Except element that has `[data-g-keep-pointer-event]` */
	no_pointer_event = 'data-g-no-pointer-event',
	component_count = 'data-g-component-count',
	component_count_max = 'data-g-component-count-max'
}