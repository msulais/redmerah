import { _flyoutListener, _flyout, _open, _noPointerEvent, _clientX, _touches, _clientY, _focus, _x, _left, _right, _y, _top, _bottom, _modal, _popover, _activeElement, _flyoutOpen, _scrollY, _documentElement, _scrollTop, _scrollTo, _anchorId, _position, _observe, _click, _scroll, _resize, _join, _instant, _manual, _body, _centerBottom, _centerBottomToLeft, _centerBottomToRight, _centerCenter, _centerCenterBottom, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterLeftTop, _centerCenterRight, _centerCenterRightBottom, _centerCenterRightTop, _centerCenterTop, _centerTop, _centerTopToLeft, _centerTopToRight, _clientWidth, _element, _height, _includes, _innerHeight, _leftBottom, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _leftTop, _rightBottom, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _rightTop, _screen, _width } from "@/constants/string"
import { getDocument, getWindow } from "@/constants/window"
import { FlyoutPosition } from "@/enums/position"

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
	position = FlyoutPosition[_centerBottom],
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

	const FLYOUT_MARGIN = 8
	const screenWidth = getDocument()[_body][_clientWidth]
	const screenHeight = getWindow()[_innerHeight]
	const rectElement = pointer
		? {
			left: pointer[_x],
			right: pointer[_x],
			top: pointer[_y],
			bottom: pointer[_y],
			height: 0,
			width: 0,
		} : anchor!
	const rectFlyout = flyout
	const middlePositionScreenTop = screenHeight / 2
	const middlePositionScreenLeft = screenWidth / 2
	const middlePositionElementTop = rectElement[_top] + (rectElement[_height]  / 2)
	const middlePositionElementLeft = rectElement[_left] + (rectElement[_width]  / 2)
	const maxWidth = screenWidth - FLYOUT_MARGIN * 2
	const maxHeight = screenHeight - FLYOUT_MARGIN * 2
	const edgePositionTop = FLYOUT_MARGIN
	const edgePositionLeft = FLYOUT_MARGIN
	const edgePositionBottom = screenHeight - FLYOUT_MARGIN
	const edgePositionRight = screenWidth - FLYOUT_MARGIN
	let top: number = 0
	let left: number = 0
	const right: () => number = () => left + rectFlyout[_width]
	const bottom: () => number = () => top + rectFlyout[_height]

	rectFlyout[_width] = rectFlyout[_width] > maxWidth
		? maxWidth
		: rectFlyout[_width]
	rectFlyout[_height] = rectFlyout[_height] > maxHeight
		? maxHeight
		: rectFlyout[_height]

	// find x position
	if ([
		FlyoutPosition[_leftTop],
		FlyoutPosition[_leftCenterToBottom],
		FlyoutPosition[_leftCenter],
		FlyoutPosition[_leftCenterToTop],
		FlyoutPosition[_leftBottom],
	][_includes](position)) {
		left = rectElement[_left] - rectFlyout[_width] - gap
		if (left < edgePositionLeft) {
			if (middlePositionElementLeft < middlePositionScreenLeft) left = rectElement[_right] + gap
			else left = edgePositionLeft
		}
	}

	else if ([
		FlyoutPosition[_centerTopToRight],
		FlyoutPosition[_centerCenterLeftTop],
		FlyoutPosition[_centerCenterLeft],
		FlyoutPosition[_centerCenterLeftBottom],
		FlyoutPosition[_centerBottomToRight]
	][_includes](position)) {
		left = rectElement[_left] - padding

		if (right() > edgePositionRight) {
			if (middlePositionElementLeft > middlePositionScreenLeft) left = rectElement[_right] - rectFlyout[_width] + padding
			else left = edgePositionRight - rectFlyout[_width]
		}
	}

	else if ([
		FlyoutPosition[_centerTop],
		FlyoutPosition[_centerCenterTop],
		FlyoutPosition[_centerCenter],
		FlyoutPosition[_centerCenterBottom],
		FlyoutPosition[_centerBottom]
	][_includes](position)) {
		left = rectElement[_left] + (rectElement[_width] / 2) - (rectFlyout[_width] / 2)
	}

	else if ([
		FlyoutPosition[_centerTopToLeft],
		FlyoutPosition[_centerCenterRightTop],
		FlyoutPosition[_centerCenterRight],
		FlyoutPosition[_centerCenterRightBottom],
		FlyoutPosition[_centerBottomToLeft]
	][_includes](position)) {
		left = rectElement[_right] - rectFlyout[_width] + padding

		if (left < edgePositionLeft) {
			if (middlePositionElementLeft < middlePositionScreenLeft) left = rectElement[_left] - padding
			else left = edgePositionLeft
		}
	}

	else if ([
		FlyoutPosition[_rightTop],
		FlyoutPosition[_rightCenterToBottom],
		FlyoutPosition[_rightCenter],
		FlyoutPosition[_rightCenterToTop],
		FlyoutPosition[_rightBottom]
	][_includes](position)) {
		left = rectElement[_right] + gap
		if (right() > edgePositionRight) {
			if (middlePositionElementLeft > middlePositionScreenLeft) left = rectElement[_left] - rectFlyout[_width] - gap
			else left = edgePositionRight - rectFlyout[_width]
		}
	}

	// find y position
	if ([
		FlyoutPosition[_leftTop],
		FlyoutPosition[_centerTopToRight],
		FlyoutPosition[_centerTop],
		FlyoutPosition[_centerTopToLeft],
		FlyoutPosition[_rightTop]
	][_includes](position)) {
		top = rectElement[_top] - rectFlyout[_height] - gap
		if (top < edgePositionTop) {
			if (middlePositionElementTop < middlePositionScreenTop) top = rectElement[_bottom] + gap
			else top = edgePositionTop
		}
	}

	else if ([
		FlyoutPosition[_leftCenterToBottom],
		FlyoutPosition[_centerCenterLeftTop],
		FlyoutPosition[_centerCenterTop],
		FlyoutPosition[_centerCenterRightTop],
		FlyoutPosition[_rightCenterToBottom]
	][_includes](position)) {
		top = rectElement[_top] - padding

		if (bottom() > edgePositionBottom) {
			if (middlePositionElementTop > middlePositionScreenTop) top = rectElement[_bottom] - rectFlyout[_height] + padding
			else top = edgePositionBottom - rectFlyout[_height]
		}
	}

	else if ([
		FlyoutPosition[_leftCenter],
		FlyoutPosition[_centerCenterLeft],
		FlyoutPosition[_centerCenter],
		FlyoutPosition[_centerCenterRight],
		FlyoutPosition[_rightCenter]
	][_includes](position)) {
		top = rectElement[_top] + (rectElement[_height] / 2) - (rectFlyout[_height] / 2)
	}

	else if ([
		FlyoutPosition[_leftCenterToTop],
		FlyoutPosition[_centerCenterLeftBottom],
		FlyoutPosition[_centerCenterBottom],
		FlyoutPosition[_centerCenterRightBottom],
		FlyoutPosition[_rightCenterToTop]
	][_includes](position)) {
		top = rectElement[_bottom] - rectFlyout[_height] + padding

		if (top < edgePositionTop) {
			if (middlePositionElementTop < middlePositionScreenTop) top = rectElement[_top] - padding
			else top = edgePositionTop
		}
	}

	else if ([
		FlyoutPosition[_leftBottom],
		FlyoutPosition[_centerBottomToRight],
		FlyoutPosition[_centerBottom],
		FlyoutPosition[_centerBottomToLeft],
		FlyoutPosition[_rightBottom]
	][_includes](position)) {
		top = rectElement[_bottom] + gap
		if (bottom() > edgePositionBottom) {
			if (middlePositionElementTop > middlePositionScreenTop) top = rectElement[_top] - rectFlyout[_height] - gap
			else top = edgePositionBottom - rectFlyout[_height]
		}
	}

	// final fallback
	if (top < edgePositionTop) top = edgePositionTop
	if (bottom() > edgePositionBottom) top = edgePositionBottom - rectFlyout[_height]
	if (left < edgePositionLeft) left = edgePositionLeft
	if (right() > edgePositionRight) left = edgePositionRight - rectFlyout[_width]

	return {
		top,
		left,
		right: screenWidth - right(),
		bottom: screenHeight - bottom()
	}
}