import { _flyoutListener, _flyout, _open, _noPointerEvent, _clientX, _touches, _clientY, _focus, _x, _left, _right, _y, _top, _bottom, _modal, _popover, _activeElement, _flyoutOpen, _scrollY, _documentElement, _scrollTop, _scrollTo, _anchorId, _position, _observe, _click, _scroll, _resize, _join, _instant, _manual, _body, _centerBottom, _centerBottomToLeft, _centerBottomToRight, _centerCenter, _centerCenterBottom, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterLeftTop, _centerCenterRight, _centerCenterRightBottom, _centerCenterRightTop, _centerCenterTop, _centerTop, _centerTopToLeft, _centerTopToRight, _clientWidth, _element, _height, _includes, _innerHeight, _leftBottom, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _leftTop, _rightBottom, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _rightTop, _screen, _width } from "@/data/string"
import { getDocument, getWindow } from "@/data/window"
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
    const POPOVER_MARGIN = 8

    if (!anchor && !pointer) return {
        top: 0, 
        right: 0, 
        bottom: 0, 
        left: 0
    }

    const rect = {
        element: pointer ? {
            left: pointer[_x],
            right: pointer[_x],
            top: pointer[_y],
            bottom: pointer[_y],
            height: 0,
            width: 0,
        } : anchor!,
        flyout: flyout
    }
    const screen = {
        width: getDocument()[_body][_clientWidth],
        height: getWindow()[_innerHeight]
    }
    const middlePosition = {
        screen: {
            top: screen[_height] / 2,
            left: screen[_width] / 2
        },
        element: {
            top: rect[_element][_top] + (rect[_element][_height] / 2),
            left: rect[_element][_left] + (rect[_element][_width] / 2),
        }
    }
    const maxSize = {
        width: screen[_width] - POPOVER_MARGIN * 2,
        height: screen[_height] - POPOVER_MARGIN * 2
    }
    const edgePosition = {
        top: POPOVER_MARGIN,
        left: POPOVER_MARGIN,
        bottom: screen[_height] - POPOVER_MARGIN,
        right: screen[_width] - POPOVER_MARGIN,
    }
    let top: number = 0
    let left: number = 0
    const right: () => number = () => left + rect[_flyout][_width]
    const bottom: () => number = () => top + rect[_flyout][_height]

    rect[_flyout][_width] = rect[_flyout][_width] > maxSize[_width]
        ? maxSize[_width]
        : rect[_flyout][_width]
    rect[_flyout][_height] = rect[_flyout][_height] > maxSize[_height]
        ? maxSize[_height]
        : rect[_flyout][_height]

    // find x position
    if ([
        FlyoutPosition[_leftTop],
        FlyoutPosition[_leftCenterToBottom],
        FlyoutPosition[_leftCenter],
        FlyoutPosition[_leftCenterToTop],
        FlyoutPosition[_leftBottom],
    ][_includes](position)) {
        left = rect[_element][_left] - rect[_flyout][_width] - gap
        if (left < edgePosition[_left]) {
            if (middlePosition[_element][_left] < middlePosition[_screen][_left]) left = rect[_element][_right] + gap
            else left = edgePosition[_left]
        }

    } 
    
    else if ([
        FlyoutPosition[_centerTopToRight],
        FlyoutPosition[_centerCenterLeftTop],
        FlyoutPosition[_centerCenterLeft],
        FlyoutPosition[_centerCenterLeftBottom],
        FlyoutPosition[_centerBottomToRight]
    ][_includes](position)) {
        left = rect[_element][_left] - padding

        if (right() > edgePosition[_right]) {
            if (middlePosition[_element][_left] > middlePosition[_screen][_left]) left = rect[_element][_right] - rect[_flyout][_width] + padding
            else left = edgePosition[_right] - rect[_flyout][_width]
        }
    } 
    
    else if ([
        FlyoutPosition[_centerTop],
        FlyoutPosition[_centerCenterTop],
        FlyoutPosition[_centerCenter],
        FlyoutPosition[_centerCenterBottom],
        FlyoutPosition[_centerBottom]
    ][_includes](position)) {
        left = rect[_element][_left] + (rect[_element][_width] / 2) - (rect[_flyout][_width] / 2)
    } 
    
    else if ([
        FlyoutPosition[_centerTopToLeft],
        FlyoutPosition[_centerCenterRightTop],
        FlyoutPosition[_centerCenterRight],
        FlyoutPosition[_centerCenterRightBottom],
        FlyoutPosition[_centerBottomToLeft]
    ][_includes](position)) {
        left = rect[_element][_right] - rect[_flyout][_width] + padding

        if (left < edgePosition[_left]) {
            if (middlePosition[_element][_left] < middlePosition[_screen][_left]) left = rect[_element][_left] - padding
            else left = edgePosition[_left]
        }
    } 
    
    else if ([
        FlyoutPosition[_rightTop],
        FlyoutPosition[_rightCenterToBottom],
        FlyoutPosition[_rightCenter],
        FlyoutPosition[_rightCenterToTop],
        FlyoutPosition[_rightBottom]
    ][_includes](position)) {
        left = rect[_element][_right] + gap
        if (right() > edgePosition[_right]) {
            if (middlePosition[_element][_left] > middlePosition[_screen][_left]) left = rect[_element][_left] - rect[_flyout][_width] - gap
            else left = edgePosition[_right] - rect[_flyout][_width]
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
        top = rect[_element][_top] - rect[_flyout][_height] - gap
        if (top < edgePosition[_top]) {
            if (middlePosition[_element][_top] < middlePosition[_screen][_top]) top = rect[_element][_bottom] + gap
            else top = edgePosition[_top]
        }
    } 
    
    else if ([
        FlyoutPosition[_leftCenterToBottom],
        FlyoutPosition[_centerCenterLeftTop],
        FlyoutPosition[_centerCenterTop],
        FlyoutPosition[_centerCenterRightTop],
        FlyoutPosition[_rightCenterToBottom]
    ][_includes](position)) {
        top = rect[_element][_top] - padding

        if (bottom() > edgePosition[_bottom]) {
            if (middlePosition[_element][_top] > middlePosition[_screen][_top]) top = rect[_element][_bottom] - rect[_flyout][_height] + padding
            else top = edgePosition[_bottom] - rect[_flyout][_height]
        }
    } 
    
    else if ([
        FlyoutPosition[_leftCenter],
        FlyoutPosition[_centerCenterLeft],
        FlyoutPosition[_centerCenter],
        FlyoutPosition[_centerCenterRight],
        FlyoutPosition[_rightCenter]
    ][_includes](position)) {
        top = rect[_element][_top] + (rect[_element][_height] / 2) - (rect[_flyout][_height] / 2)
    } 
    
    else if ([
        FlyoutPosition[_leftCenterToTop],
        FlyoutPosition[_centerCenterLeftBottom],
        FlyoutPosition[_centerCenterBottom],
        FlyoutPosition[_centerCenterRightBottom],
        FlyoutPosition[_rightCenterToTop]
    ][_includes](position)) {
        top = rect[_element][_bottom] - rect[_flyout][_height] + padding

        if (top < edgePosition[_top]) {
            if (middlePosition[_element][_top] < middlePosition[_screen][_top]) top = rect[_element][_top] - padding
            else top = edgePosition[_top]
        }
    } 
    
    else if ([
        FlyoutPosition[_leftBottom],
        FlyoutPosition[_centerBottomToRight],
        FlyoutPosition[_centerBottom],
        FlyoutPosition[_centerBottomToLeft],
        FlyoutPosition[_rightBottom]
    ][_includes](position)) {
        top = rect[_element][_bottom] + gap
        if (bottom() > edgePosition[_bottom]) {
            if (middlePosition[_element][_top] > middlePosition[_screen][_top]) top = rect[_element][_top] - rect[_flyout][_height] - gap
            else top = edgePosition[_bottom] - rect[_flyout][_height]
        }
    }

    // final fallback
    if (top < edgePosition[_top]) top = edgePosition[_top]
    if (bottom() > edgePosition[_bottom]) top = edgePosition[_bottom] - rect[_flyout][_height]
    if (left < edgePosition[_left]) left = edgePosition[_left]
    if (right() > edgePosition[_right]) left = edgePosition[_right] - rect[_flyout][_width]

    return {
        top,
        left,
        right: screen[_width] - right(),
        bottom: screen[_height] - bottom()
    }
}