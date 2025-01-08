export const enum RootAttributes {
	theme = 'data-theme',
	corner = 'data-corner',
	platform = 'data-platform'
}

export const enum BodyAttributes {
	/** Disable all element pointer event. Except element that has `[data-g-keep-pointer-event]` */
	no_pointer_event = 'data-g-no-pointer-event',
	component_count = 'data-g-component-count',
}