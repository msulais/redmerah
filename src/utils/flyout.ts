import { FlyoutPosition } from "@/enums/position"

const FLYOUT_MARGIN = 8
const LEFT_TOP = FlyoutPosition.LeftTop
const LEFT_CENTER_TO_BOTTOM = FlyoutPosition.LeftCenterToBottom
const LEFT_CENTER = FlyoutPosition.LeftCenter
const LEFT_CENTER_TO_TOP = FlyoutPosition.LeftCenterToTop
const LEFT_BOTTOM = FlyoutPosition.LeftBottom
const CENTER_TOP_TO_RIGHT = FlyoutPosition.CenterTopToRight
const CENTER_CENTER_LEFT_TOP = FlyoutPosition.CenterCenterLeftTop
const CENTER_CENTER_LEFT = FlyoutPosition.CenterCenterLeft
const CENTER_CENTER_LEFT_BOTTOM = FlyoutPosition.CenterCenterLeftBottom
const CENTER_BOTTOM_TO_RIGHT = FlyoutPosition.CenterBottomToRight
const CENTER_TOP = FlyoutPosition.CenterTop
const CENTER_CENTER_TOP = FlyoutPosition.CenterCenterTop
const CENTER_CENTER = FlyoutPosition.CenterCenter
const CENTER_CENTER_BOTTOM = FlyoutPosition.CenterCenterBottom
const CENTER_BOTTOM = FlyoutPosition.CenterBottom
const CENTER_TOP_TO_LEFT = FlyoutPosition.CenterTopToLeft
const CENTER_CENTER_RIGHT_TOP = FlyoutPosition.CenterCenterRightTop
const CENTER_CENTER_RIGHT = FlyoutPosition.CenterCenterRight
const CENTER_CENTER_RIGHT_BOTTOM = FlyoutPosition.CenterCenterRightBottom
const CENTER_BOTTOM_TO_LEFT = FlyoutPosition.CenterBottomToLeft
const RIGHT_TOP = FlyoutPosition.RightTop
const RIGHT_CENTER_TO_BOTTOM = FlyoutPosition.RightCenterToBottom
const RIGHT_CENTER = FlyoutPosition.RightCenter
const RIGHT_CENTER_TO_TOP = FlyoutPosition.RightCenterToTop
const RIGHT_BOTTOM = FlyoutPosition.RightBottom

type GetFlyoutPositionParams = {
	flyout: { width: number; height: number } | DOMRect
	anchor?: DOMRect
	position?: FlyoutPosition
	gap?: number
	padding?: number
	pointer?: { x: number, y: number }
}

type FlyoutPositionResult = {
	top: number
	left: number
	bottom: number
	right: number
}

export function getFlyoutPosition({
	flyout,
	anchor,
	position = FlyoutPosition.CenterBottom,
	gap = 8,
	padding = 0,
	pointer
}: GetFlyoutPositionParams): FlyoutPositionResult {
	if (!anchor && !pointer) return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	}

	const screenWidth = document.body.clientWidth
	const screenHeight = window.innerHeight
	const elementRect = (pointer
		? {
			left: pointer.x,
			right: pointer.x,
			top: pointer.y,
			bottom: pointer.y,
			height: 0,
			width: 0,
		} : anchor!) as DOMRect
	const flyoutRect = flyout
	const midOffsetScreenTop = screenHeight / 2
	const midOffsetScreenLeft = screenWidth / 2
	const midOffsetElementTop = elementRect.top + (elementRect.height / 2)
	const midOffsetElementLeft = elementRect.left + (elementRect.width  / 2)
	const maxWidth = screenWidth - FLYOUT_MARGIN * 2
	const maxHeight = screenHeight - FLYOUT_MARGIN * 2
	const edgeOffsetTop = FLYOUT_MARGIN
	const edgePsitionLeft = FLYOUT_MARGIN
	const edgePositionBottom = screenHeight - FLYOUT_MARGIN
	const edgePositionRight = screenWidth - FLYOUT_MARGIN
	let top: number = 0
	let left: number = 0
	const right: () => number = () => left + flyoutRect.width
	const bottom: () => number = () => top + flyoutRect.height

	flyoutRect.width = flyoutRect.width > maxWidth
		? maxWidth
		: flyoutRect.width
	flyoutRect.height = flyoutRect.height > maxHeight
		? maxHeight
		: flyoutRect.height

	// find x position
	if ([
		LEFT_TOP,
		LEFT_CENTER_TO_BOTTOM,
		LEFT_CENTER,
		LEFT_CENTER_TO_TOP,
		LEFT_BOTTOM,
	].includes(position)) {
		left = elementRect.left - flyoutRect.width - gap
		if (left < edgePsitionLeft) left = midOffsetElementLeft < midOffsetScreenLeft
			? elementRect.right + gap
			: edgePsitionLeft
	}

	else if ([
		CENTER_TOP_TO_RIGHT,
		CENTER_CENTER_LEFT_TOP,
		CENTER_CENTER_LEFT,
		CENTER_CENTER_LEFT_BOTTOM,
		CENTER_BOTTOM_TO_RIGHT
	].includes(position)) {
		left = elementRect.left - padding
		if (right() > edgePositionRight) left = midOffsetElementLeft > midOffsetScreenLeft
			? elementRect.right - flyoutRect.width + padding
			: edgePositionRight - flyoutRect.width
	}

	else if ([
		CENTER_TOP,
		CENTER_CENTER_TOP,
		CENTER_CENTER,
		CENTER_CENTER_BOTTOM,
		CENTER_BOTTOM
	].includes(position)) {
		left = elementRect.left
		left += (elementRect.width / 2)
		left -= (flyoutRect.width / 2)
	}

	else if ([
		CENTER_TOP_TO_LEFT,
		CENTER_CENTER_RIGHT_TOP,
		CENTER_CENTER_RIGHT,
		CENTER_CENTER_RIGHT_BOTTOM,
		CENTER_BOTTOM_TO_LEFT
	].includes(position)) {
		left = elementRect.right - flyoutRect.width + padding
		if (left < edgePsitionLeft) left = midOffsetElementLeft < midOffsetScreenLeft
			? elementRect.left - padding
			: edgePsitionLeft
	}

	else if ([
		RIGHT_TOP,
		RIGHT_CENTER_TO_BOTTOM,
		RIGHT_CENTER,
		RIGHT_CENTER_TO_TOP,
		RIGHT_BOTTOM
	].includes(position)) {
		left = elementRect.right + gap
		if (right() > edgePositionRight) left = midOffsetElementLeft > midOffsetScreenLeft
			? elementRect.left - flyoutRect.width - gap
			: edgePositionRight - flyoutRect.width
	}

	// find y position
	if ([
		LEFT_TOP,
		CENTER_TOP_TO_RIGHT,
		CENTER_TOP,
		CENTER_TOP_TO_LEFT,
		RIGHT_TOP
	].includes(position)) {
		top = elementRect.top - flyoutRect.height - gap
		if (top < edgeOffsetTop) top = midOffsetElementTop < midOffsetScreenTop
			? elementRect.bottom + gap
			: edgeOffsetTop
	}

	else if ([
		LEFT_CENTER_TO_BOTTOM,
		CENTER_CENTER_LEFT_TOP,
		CENTER_CENTER_TOP,
		CENTER_CENTER_RIGHT_TOP,
		RIGHT_CENTER_TO_BOTTOM
	].includes(position)) {
		top = elementRect.top - padding
		if (bottom() > edgePositionBottom) top = midOffsetElementTop > midOffsetScreenTop
			? elementRect.bottom - flyoutRect.height + padding
			: edgePositionBottom - flyoutRect.height
	}

	else if ([
		LEFT_CENTER,
		CENTER_CENTER_LEFT,
		CENTER_CENTER,
		CENTER_CENTER_RIGHT,
		RIGHT_CENTER
	].includes(position)) {
		top = elementRect.top + (elementRect.height / 2) - (flyoutRect.height / 2)
	}

	else if ([
		LEFT_CENTER_TO_TOP,
		CENTER_CENTER_LEFT_BOTTOM,
		CENTER_CENTER_BOTTOM,
		CENTER_CENTER_RIGHT_BOTTOM,
		RIGHT_CENTER_TO_TOP
	].includes(position)) {
		top = elementRect.bottom - flyoutRect.height + padding
		if (top < edgeOffsetTop) top = midOffsetElementTop < midOffsetScreenTop
			? elementRect.top - padding
			: edgeOffsetTop
	}

	else if ([
		LEFT_BOTTOM,
		CENTER_BOTTOM_TO_RIGHT,
		CENTER_BOTTOM,
		CENTER_BOTTOM_TO_LEFT,
		RIGHT_BOTTOM
	].includes(position)) {
		top = elementRect.bottom + gap
		if (bottom() > edgePositionBottom) top = midOffsetElementTop > midOffsetScreenTop
			? elementRect.top - flyoutRect.height - gap
			: edgePositionBottom - flyoutRect.height
	}

	// final fallback
	if (top < edgeOffsetTop) top = edgeOffsetTop
	if (bottom() > edgePositionBottom) top = edgePositionBottom - flyoutRect.height
	if (left < edgePsitionLeft) left = edgePsitionLeft
	if (right() > edgePositionRight) left = edgePositionRight - flyoutRect.width

	return {
		top,
		left,
		right: screenWidth - right(),
		bottom: screenHeight - bottom()
	}
}