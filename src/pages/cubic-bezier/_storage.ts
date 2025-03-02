export type IDBStoreLastInput<T = unknown> = {
	key: string
	value: T
}

export enum IDBStoreNames {
	lastInput = 'last-input',
}

export enum IDBStoreKeysLastInput {
	/** @param value `CubicBezier` */
	cubicBezier = 'cubic-bezier',

	/** @param types `AnimationType[]` */
	animationTypes = 'animation-types',

	/** @param ms `number` */
	animationDuration = 'animation-duration',

	/** @param values `string[]` */
	keyframeColor = 'keyframe-color',

	/** @param values `string[]` */
	keyframeHeight = 'keyframe-height',

	/** @param values `string[][]` */
	keyframeMove = 'keyframe-move',

	/** @param values `string[]` */
	keyframeOpacity = 'keyframe-opacity',

	/** @param values `string[]` */
	keyframeScale = 'keyframe-scale',

	/** @param values `string[]` */
	keyframeRotate = 'keyframe-rotate',

	/** @param values `string[]` */
	keyframeWidth = 'keyframe-width'
}