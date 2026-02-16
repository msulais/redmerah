export enum RootAttributes {
	Theme = 'data-theme',
	Animation = 'data-animation'
}

export enum GlobalAttributes {
	KeepPointerEvent = 'data-g-keep-pointer-event',
}

export enum BodyAttributes {
	/** Disable all element pointer event. Except element that has `GlobalAttributes.keepPointerEvent` */
	NoPointerEvent = 'data-g-no-pointer-event',
}