export enum RootAttributes {
	theme = 'data-theme',
	animation = 'data-animation'
}

export enum GlobalAttributes {
	keepPointerEvent = 'data-g-keep-pointer-event',
}

export enum BodyAttributes {
	/** Disable all element pointer event. Except element that has `GlobalAttributes.keepPointerEvent` */
	noPointerEvent = 'data-g-no-pointer-event',
}