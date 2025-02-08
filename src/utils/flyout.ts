import { FlyoutPosition } from "@/enums/position"
import { elementClientWidth } from "./element"
import { arrayIncludes } from "./array"
import { rectHeight, rectLeft, rectRight, rectTop, rectWidth } from "./rect"
import { documentBody } from "./document"
import { windowInnerHeight } from "./window"

const FLYOUT_MARGIN = 8
const LEFT_TOP = FlyoutPosition.leftTop
const LEFT_CENTER_TO_BOTTOM = FlyoutPosition.leftCenterToBottom
const LEFT_CENTER = FlyoutPosition.leftCenter
const LEFT_CENTER_TO_TOP = FlyoutPosition.leftCenterToTop
const LEFT_BOTTOM = FlyoutPosition.leftBottom
const CENTER_TOP_TO_RIGHT = FlyoutPosition.centerTopToRight
const CENTER_CENTER_LEFT_TOP = FlyoutPosition.centerCenterLeftTop
const CENTER_CENTER_LEFT = FlyoutPosition.centerCenterLeft
const CENTER_CENTER_LEFT_BOTTOM = FlyoutPosition.centerCenterLeftBottom
const CENTER_BOTTOM_TO_RIGHT = FlyoutPosition.centerBottomToRight
const CENTER_TOP = FlyoutPosition.centerTop
const CENTER_CENTER_TOP = FlyoutPosition.centerCenterTop
const CENTER_CENTER = FlyoutPosition.centerCenter
const CENTER_CENTER_BOTTOM = FlyoutPosition.centerCenterBottom
const CENTER_BOTTOM = FlyoutPosition.centerBottom
const CENTER_TOP_TO_LEFT = FlyoutPosition.centerTopToLeft
const CENTER_CENTER_RIGHT_TOP = FlyoutPosition.centerCenterRightTop
const CENTER_CENTER_RIGHT = FlyoutPosition.centerCenterRight
const CENTER_CENTER_RIGHT_BOTTOM = FlyoutPosition.centerCenterRightBottom
const CENTER_BOTTOM_TO_LEFT = FlyoutPosition.centerBottomToLeft
const RIGHT_TOP = FlyoutPosition.rightTop
const RIGHT_CENTER_TO_BOTTOM = FlyoutPosition.rightCenterToBottom
const RIGHT_CENTER = FlyoutPosition.rightCenter
const RIGHT_CENTER_TO_TOP = FlyoutPosition.rightCenterToTop
const RIGHT_BOTTOM = FlyoutPosition.rightBottom

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
	position = FlyoutPosition.centerBottom,
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

	const screenWidth = elementClientWidth(documentBody())
	const screenHeight = windowInnerHeight()
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
	const midOffsetElementTop = rectTop(elementRect) + (rectHeight(elementRect) / 2)
	const midOffsetElementLeft = rectLeft(elementRect) + (rectWidth(elementRect)  / 2)
	const maxWidth = screenWidth - FLYOUT_MARGIN * 2
	const maxHeight = screenHeight - FLYOUT_MARGIN * 2
	const edgeOffsetTop = FLYOUT_MARGIN
	const edgePsitionLeft = FLYOUT_MARGIN
	const edgePositionBottom = screenHeight - FLYOUT_MARGIN
	const edgePositionRight = screenWidth - FLYOUT_MARGIN
	let top: number = 0
	let left: number = 0
	const right: () => number = () => left + rectWidth(flyoutRect as DOMRect)
	const bottom: () => number = () => top + rectHeight(flyoutRect as DOMRect)

	flyoutRect.width = rectWidth(flyoutRect as DOMRect) > maxWidth
		? maxWidth
		: rectWidth(flyoutRect as DOMRect)
	flyoutRect.height = rectHeight(flyoutRect as DOMRect) > maxHeight
		? maxHeight
		: rectHeight(flyoutRect as DOMRect)

	// find x position
	if (arrayIncludes([
		LEFT_TOP,
		LEFT_CENTER_TO_BOTTOM,
		LEFT_CENTER,
		LEFT_CENTER_TO_TOP,
		LEFT_BOTTOM,
	], position)) {
		left = rectLeft(elementRect) - rectWidth(flyoutRect as DOMRect) - gap
		if (left < edgePsitionLeft) left = midOffsetElementLeft < midOffsetScreenLeft
			? rectRight(elementRect) + gap
			: edgePsitionLeft
	}

	else if (arrayIncludes([
		CENTER_TOP_TO_RIGHT,
		CENTER_CENTER_LEFT_TOP,
		CENTER_CENTER_LEFT,
		CENTER_CENTER_LEFT_BOTTOM,
		CENTER_BOTTOM_TO_RIGHT
	], position)) {
		left = rectLeft(elementRect) - padding
		if (right() > edgePositionRight) left = midOffsetElementLeft > midOffsetScreenLeft
			? rectRight(elementRect) - rectWidth(flyoutRect as DOMRect) + padding
			: edgePositionRight - rectWidth(flyoutRect as DOMRect)
	}

	else if (arrayIncludes([
		CENTER_TOP,
		CENTER_CENTER_TOP,
		CENTER_CENTER,
		CENTER_CENTER_BOTTOM,
		CENTER_BOTTOM
	], position)) {
		left = rectLeft(elementRect)
		left += (rectWidth(elementRect) / 2)
		left -= (rectWidth(flyoutRect as DOMRect) / 2)
	}

	else if (arrayIncludes([
		CENTER_TOP_TO_LEFT,
		CENTER_CENTER_RIGHT_TOP,
		CENTER_CENTER_RIGHT,
		CENTER_CENTER_RIGHT_BOTTOM,
		CENTER_BOTTOM_TO_LEFT
	], position)) {
		left = rectRight(elementRect) - rectWidth(flyoutRect as DOMRect) + padding
		if (left < edgePsitionLeft) left = midOffsetElementLeft < midOffsetScreenLeft
			? rectLeft(elementRect) - padding
			: edgePsitionLeft
	}

	else if (arrayIncludes([
		RIGHT_TOP,
		RIGHT_CENTER_TO_BOTTOM,
		RIGHT_CENTER,
		RIGHT_CENTER_TO_TOP,
		RIGHT_BOTTOM
	], position)) {
		left = rectRight(elementRect) + gap
		if (right() > edgePositionRight) left = midOffsetElementLeft > midOffsetScreenLeft
			? rectLeft(elementRect) - rectWidth(flyoutRect as DOMRect) - gap
			: edgePositionRight - rectWidth(flyoutRect as DOMRect)
	}

	// find y position
	if (arrayIncludes([
		LEFT_TOP,
		CENTER_TOP_TO_RIGHT,
		CENTER_TOP,
		CENTER_TOP_TO_LEFT,
		RIGHT_TOP
	], position)) {
		top = elementRect.top - flyoutRect.height - gap
		if (top < edgeOffsetTop) top = midOffsetElementTop < midOffsetScreenTop
			? elementRect.bottom + gap
			: edgeOffsetTop
	}

	else if (arrayIncludes([
		LEFT_CENTER_TO_BOTTOM,
		CENTER_CENTER_LEFT_TOP,
		CENTER_CENTER_TOP,
		CENTER_CENTER_RIGHT_TOP,
		RIGHT_CENTER_TO_BOTTOM
	], position)) {
		top = elementRect.top - padding
		if (bottom() > edgePositionBottom) top = midOffsetElementTop > midOffsetScreenTop
			? elementRect.bottom - flyoutRect.height + padding
			: edgePositionBottom - flyoutRect.height
	}

	else if (arrayIncludes([
		LEFT_CENTER,
		CENTER_CENTER_LEFT,
		CENTER_CENTER,
		CENTER_CENTER_RIGHT,
		RIGHT_CENTER
	], position)) {
		top = elementRect.top + (elementRect.height / 2) - (flyoutRect.height / 2)
	}

	else if (arrayIncludes([
		LEFT_CENTER_TO_TOP,
		CENTER_CENTER_LEFT_BOTTOM,
		CENTER_CENTER_BOTTOM,
		CENTER_CENTER_RIGHT_BOTTOM,
		RIGHT_CENTER_TO_TOP
	], position)) {
		top = elementRect.bottom - flyoutRect.height + padding
		if (top < edgeOffsetTop) top = midOffsetElementTop < midOffsetScreenTop
			? elementRect.top - padding
			: edgeOffsetTop
	}

	else if (arrayIncludes([
		LEFT_BOTTOM,
		CENTER_BOTTOM_TO_RIGHT,
		CENTER_BOTTOM,
		CENTER_BOTTOM_TO_LEFT,
		RIGHT_BOTTOM
	], position)) {
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