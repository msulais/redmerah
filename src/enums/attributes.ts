export enum RootAttributes {
	theme = 'data-theme',
	corner = 'data-corner',
	platform = 'data-platform',
	animation = 'data-animation'
}

export enum GlobalAttributes {
	keepPointerEvent = 'data-g-keep-pointer-event',
}

export enum BodyAttributes {
	/** Disable all element pointer event. Except element that has `GlobalAttributes.keepPointerEvent` */
	noPointerEvent = 'data-g-no-pointer-event',
	componentCount = 'data-g-component-count',
}