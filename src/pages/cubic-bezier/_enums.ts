export enum AnimationType {
	scale = 'scale',
	rotate = 'rotate',
	move = 'move',
	color = 'color',
	opacity = 'opacity',
	height = 'height',
	width = 'width'
}

export enum Commands {
	/** @param value `CubicBezier` */
	updateCubicBezier,

	/** @param value `Position` */
	updateStartPoint,

	/** @param value `Position` */
	updateEndPoint,

	/** @param value `Position` */
	updateStartHandlePoint,

	/** @param value `Position` */
	updateEndHandlePoint,

	/** @param types `AnimationType[]` */
	updateAnimationTypes,

	/** @param ms `number` */
	updateDuration,

	/**
	@param key `keyof Keyframes`
	@param values `string[] | string[][]` */
	updateKeyframes
}