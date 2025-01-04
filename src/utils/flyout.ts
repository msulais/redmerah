import { FlyoutPosition } from "@/enums/position"
import { element_client_width } from "./element";
import { array_includes } from "./array";
import { rect_height, rect_left, rect_right, rect_top, rect_width } from "./rect";

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

export function get_flyout_position({
	flyout,
	anchor,
	position = FlyoutPosition.center_bottom,
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
	const screen_width = element_client_width(document.body)
	const screen_height = window.innerHeight
	const element_rect = (pointer
		? {
			left: pointer.x,
			right: pointer.x,
			top: pointer.y,
			bottom: pointer.y,
			height: 0,
			width: 0,
		} : anchor!) as DOMRect
	const flyout_rect = flyout
	const mid_offset_screen_top = screen_height / 2
	const mid_offset_screen_left = screen_width / 2
	const mid_offset_element_top = rect_top(element_rect) + (rect_height(element_rect) / 2)
	const mid_offset_element_left = rect_left(element_rect) + (rect_width(element_rect)  / 2)
	const max_width = screen_width - FLYOUT_MARGIN * 2
	const max_height = screen_height - FLYOUT_MARGIN * 2
	const edge_offset_top = FLYOUT_MARGIN
	const edge_position_left = FLYOUT_MARGIN
	const edge_position_bottom = screen_height - FLYOUT_MARGIN
	const edge_position_right = screen_width - FLYOUT_MARGIN
	const LEFT_TOP = FlyoutPosition.left_top
	const LEFT_CENTER_TO_BOTTOM = FlyoutPosition.left_center_to_bottom
	const LEFT_CENTER = FlyoutPosition.left_center
	const LEFT_CENTER_TO_TOP = FlyoutPosition.left_center_to_top
	const LEFT_BOTTOM = FlyoutPosition.left_bottom
	const CENTER_TOP_TO_RIGHT = FlyoutPosition.center_top_to_right
	const CENTER_CENTER_LEFT_TOP = FlyoutPosition.center_center_left_top
	const CENTER_CENTER_LEFT = FlyoutPosition.center_center_left
	const CENTER_CENTER_LEFT_BOTTOM = FlyoutPosition.center_center_left_bottom
	const CENTER_BOTTOM_TO_RIGHT = FlyoutPosition.center_bottom_to_right
	const CENTER_TOP = FlyoutPosition.center_top
	const CENTER_CENTER_TOP = FlyoutPosition.center_center_top
	const CENTER_CENTER = FlyoutPosition.center_center
	const CENTER_CENTER_BOTTOM = FlyoutPosition.center_center_bottom
	const CENTER_BOTTOM = FlyoutPosition.center_bottom
	const CENTER_TOP_TO_LEFT = FlyoutPosition.center_top_to_left
	const CENTER_CENTER_RIGHT_TOP = FlyoutPosition.center_center_right_top
	const CENTER_CENTER_RIGHT = FlyoutPosition.center_center_right
	const CENTER_CENTER_RIGHT_BOTTOM = FlyoutPosition.center_center_right_bottom
	const CENTER_BOTTOM_TO_LEFT = FlyoutPosition.center_bottom_to_left
	const RIGHT_TOP = FlyoutPosition.right_top
	const RIGHT_CENTER_TO_BOTTOM = FlyoutPosition.right_center_to_bottom
	const RIGHT_CENTER = FlyoutPosition.right_center
	const RIGHT_CENTER_TO_TOP = FlyoutPosition.right_center_to_top
	const RIGHT_BOTTOM = FlyoutPosition.right_bottom
	let top: number = 0
	let left: number = 0
	const right: () => number = () => left + rect_width(flyout_rect as DOMRect)
	const bottom: () => number = () => top + rect_height(flyout_rect as DOMRect)

	flyout_rect.width = rect_width(flyout_rect as DOMRect) > max_width
		? max_width
		: rect_width(flyout_rect as DOMRect)
	flyout_rect.height = rect_height(flyout_rect as DOMRect) > max_height
		? max_height
		: rect_height(flyout_rect as DOMRect)

	// find x position
	if (array_includes([
		LEFT_TOP,
		LEFT_CENTER_TO_BOTTOM,
		LEFT_CENTER,
		LEFT_CENTER_TO_TOP,
		LEFT_BOTTOM,
	], position)) {
		left = rect_left(element_rect) - rect_width(flyout_rect as DOMRect) - gap
		if (left < edge_position_left) left = mid_offset_element_left < mid_offset_screen_left
			? rect_right(element_rect) + gap
			: edge_position_left
	}

	else if (array_includes([
		CENTER_TOP_TO_RIGHT,
		CENTER_CENTER_LEFT_TOP,
		CENTER_CENTER_LEFT,
		CENTER_CENTER_LEFT_BOTTOM,
		CENTER_BOTTOM_TO_RIGHT
	], position)) {
		left = rect_left(element_rect) - padding
		if (right() > edge_position_right) left = mid_offset_element_left > mid_offset_screen_left
			? rect_right(element_rect) - rect_width(flyout_rect as DOMRect) + padding
			: edge_position_right - rect_width(flyout_rect as DOMRect)
	}

	else if (array_includes([
		CENTER_TOP,
		CENTER_CENTER_TOP,
		CENTER_CENTER,
		CENTER_CENTER_BOTTOM,
		CENTER_BOTTOM
	], position)) {
		left = rect_left(element_rect) + (rect_width(element_rect) / 2) - (rect_width(flyout_rect as DOMRect) / 2)
	}

	else if (array_includes([
		CENTER_TOP_TO_LEFT,
		CENTER_CENTER_RIGHT_TOP,
		CENTER_CENTER_RIGHT,
		CENTER_CENTER_RIGHT_BOTTOM,
		CENTER_BOTTOM_TO_LEFT
	], position)) {
		left = rect_right(element_rect) - rect_width(flyout_rect as DOMRect) + padding
		if (left < edge_position_left) left = mid_offset_element_left < mid_offset_screen_left
			? rect_left(element_rect) - padding
			: edge_position_left
	}

	else if (array_includes([
		RIGHT_TOP,
		RIGHT_CENTER_TO_BOTTOM,
		RIGHT_CENTER,
		RIGHT_CENTER_TO_TOP,
		RIGHT_BOTTOM
	], position)) {
		left = rect_right(element_rect) + gap
		if (right() > edge_position_right) left = mid_offset_element_left > mid_offset_screen_left
			? rect_left(element_rect) - rect_width(flyout_rect as DOMRect) - gap
			: edge_position_right - rect_width(flyout_rect as DOMRect)
	}

	// find y position
	if (array_includes([
		LEFT_TOP,
		CENTER_TOP_TO_RIGHT,
		CENTER_TOP,
		CENTER_TOP_TO_LEFT,
		RIGHT_TOP
	], position)) {
		top = element_rect.top - flyout_rect.height - gap
		if (top < edge_offset_top) top = mid_offset_element_top < mid_offset_screen_top
			? element_rect.bottom + gap
			: edge_offset_top
	}

	else if (array_includes([
		LEFT_CENTER_TO_BOTTOM,
		CENTER_CENTER_LEFT_TOP,
		CENTER_CENTER_TOP,
		CENTER_CENTER_RIGHT_TOP,
		RIGHT_CENTER_TO_BOTTOM
	], position)) {
		top = element_rect.top - padding
		if (bottom() > edge_position_bottom) top = mid_offset_element_top > mid_offset_screen_top
			? element_rect.bottom - flyout_rect.height + padding
			: edge_position_bottom - flyout_rect.height
	}

	else if (array_includes([
		LEFT_CENTER,
		CENTER_CENTER_LEFT,
		CENTER_CENTER,
		CENTER_CENTER_RIGHT,
		RIGHT_CENTER
	], position)) {
		top = element_rect.top + (element_rect.height / 2) - (flyout_rect.height / 2)
	}

	else if (array_includes([
		LEFT_CENTER_TO_TOP,
		CENTER_CENTER_LEFT_BOTTOM,
		CENTER_CENTER_BOTTOM,
		CENTER_CENTER_RIGHT_BOTTOM,
		RIGHT_CENTER_TO_TOP
	], position)) {
		top = element_rect.bottom - flyout_rect.height + padding
		if (top < edge_offset_top) top = mid_offset_element_top < mid_offset_screen_top
			? element_rect.top - padding
			: edge_offset_top
	}

	else if (array_includes([
		LEFT_BOTTOM,
		CENTER_BOTTOM_TO_RIGHT,
		CENTER_BOTTOM,
		CENTER_BOTTOM_TO_LEFT,
		RIGHT_BOTTOM
	], position)) {
		top = element_rect.bottom + gap
		if (bottom() > edge_position_bottom) top = mid_offset_element_top > mid_offset_screen_top
			? element_rect.top - flyout_rect.height - gap
			: edge_position_bottom - flyout_rect.height
	}

	// final fallback
	if (top < edge_offset_top) top = edge_offset_top
	if (bottom() > edge_position_bottom) top = edge_position_bottom - flyout_rect.height
	if (left < edge_position_left) left = edge_position_left
	if (right() > edge_position_right) left = edge_position_right - flyout_rect.width

	return {
		top,
		left,
		right: screen_width - right(),
		bottom: screen_height - bottom()
	}
}