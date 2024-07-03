import { createUniqueId } from "solid-js";

import { getAttribute, hasAttribute, removeAttribute, setAttribute } from "./attributes";
import { getBoundingClientRect, getElementById, querySelector, setStyleProperty } from "./element";
import { BodyAttributes, PopoverAttributes } from "@/enums/attributes";
import { stopImmediatePropagation } from "./event";
import { setTimeDelayed, timeout } from "./timeout";
import { PopoverPosition } from "@/enums/position"
import { ElementSelector } from "@/enums/selector";
import { initFlyout } from "./flyout";
import { _anchorId, _position, _gap, _padding, _top, _px, _left, _body, _bottom, _clientX, _clientY, _flyoutOpen, _height, _id, _move, _open, _right, _touches, _transform, _trim, _width, _focus, _showModal, _showPopover, _isNaN, _hidePopover, _close, _flyout, _CENTER_BOTTOM, _CENTER_BOTTOM_TO_LEFT, _CENTER_BOTTOM_TO_RIGHT, _CENTER_CENTER, _CENTER_CENTER_BOTTOM, _CENTER_CENTER_LEFT, _CENTER_CENTER_LEFT_BOTTOM, _CENTER_CENTER_LEFT_TOP, _CENTER_CENTER_RIGHT, _CENTER_CENTER_RIGHT_BOTTOM, _CENTER_CENTER_RIGHT_TOP, _CENTER_CENTER_TOP, _CENTER_TOP, _CENTER_TOP_TO_LEFT, _CENTER_TOP_TO_RIGHT, _LEFT_BOTTOM, _LEFT_CENTER, _LEFT_CENTER_TO_BOTTOM, _LEFT_CENTER_TO_TOP, _LEFT_TOP, _RIGHT_BOTTOM, _RIGHT_CENTER, _RIGHT_CENTER_TO_BOTTOM, _RIGHT_CENTER_TO_TOP, _RIGHT_TOP, _clientWidth, _element, _includes, _innerHeight, _popover, _screen, _x, _y, _observe, _anchor, _notAllowHideAnchor, _hasMaxHeight, _hasMaxWidth, _maxHeight, _maxWidth, _style, _max_height, _max_width } from "@/data/string";
import { numberParse } from "./math";
import { getDocument, getWindow } from "@/data/window";

type GetPopoverPositionParams = {
    popover: { width: number; height: number } | DOMRect
    anchor?: DOMRect
    position?: PopoverPosition
    gap?: number
    padding?: number
    pointer?: { x: number, y: number }
}

type PopoverPositionResult = {
    top: number
    left: number
    bottom: number
    right: number
}

type OpenPopoverParams = {
    event: Event
    anchor?: HTMLElement
    popover: HTMLElement
    position?: PopoverPosition
    gap?: number
    padding?: number
    allowHideAnchor?: boolean

    /**
     * `<input>` will focused by browser by default when dialog open
     **/
    inputAutoFocus?: boolean
}

export function initPopover(popover: HTMLElement): MutationObserver | null {
    initFlyout()

    const observer = new MutationObserver(() => repositionPopover(popover))
    observer[_observe](popover, {subtree: true, childList: true})

    return observer
}

export function repositionPopover(popover: HTMLElement): void {
    const anchorId = getAttribute(popover, PopoverAttributes[_anchorId])
    if (!anchorId) {
        const popoverRect = getBoundingClientRect(popover)
        const screen = {
            width: getDocument()[_body][_clientWidth],
            height: getWindow()[_innerHeight]
        }
        if (popoverRect[_left  ] < 8) setStyleProperty(popover, _left, 8 + _px)
        if (popoverRect[_top   ] < 8) setStyleProperty(popover, _top , 8 + _px)
        if (popoverRect[_right ] > screen[_width ]) setStyleProperty(popover, _left, (screen[_width ] - popoverRect[_width ] - 8) + _px)
        if (popoverRect[_bottom] > screen[_height]) setStyleProperty(popover, _top , (screen[_height] - popoverRect[_height] - 8) + _px)
        return
    }

    const anchor = getElementById(anchorId)
    if (!anchor) return

    let position: PopoverPosition | string | null = getAttribute(popover, PopoverAttributes[_position])
    if (!position) return

    let gap: number | string | null = getAttribute(popover, PopoverAttributes[_gap])
    gap = gap == null? 0 : numberParse(gap)

    let padding: number | string | null = getAttribute(popover, PopoverAttributes[_padding])
    padding = padding == null? 0 : numberParse(padding)

    const hasNotAllowHideAnchorAttr = hasAttribute(popover, PopoverAttributes[_notAllowHideAnchor])

    if (hasNotAllowHideAnchorAttr) {
        setStyleProperty(popover, _max_width, null)
        setStyleProperty(popover, _max_height, null)
    }

    const anchorRect = getBoundingClientRect(anchor)
    const popoverRect = getBoundingClientRect(popover)
    const POPOVER_MARGIN = 8

    // just assume that the attribute can be changed explicitly
    // by user from devtool. 
    try {
        let pos = getPopoverPosition({
            popover: popoverRect,
            anchor: anchorRect,
            gap: gap,
            position: position as PopoverPosition, 
            padding: padding
        })

        if (hasNotAllowHideAnchorAttr) {
            const popoverPosition = {
                ...pos,
                bottom: pos[_top] + popoverRect[_height],
                right: pos[_left] + popoverRect[_width]
            }
    
            const anchorMidPosition = {
                x: anchorRect![_left] + (anchorRect![_width] / 2),
                y: anchorRect![_top] + (anchorRect![_height] / 2),
            }
            const popoverMidPosition = {
                x: popoverPosition[_left] + (popoverRect[_width] / 2),
                y: popoverPosition[_top] + (popoverRect[_height] / 2),
            }
    
            let maxWidth: string = ''
            let maxHeight: string = ''
    
            // left side
            if (popoverMidPosition.x < anchorMidPosition.x && popoverPosition[_right] > anchorRect![_left]) {
                maxWidth = (anchorRect![_left] - POPOVER_MARGIN - gap) + _px
    
                const attrHasMaxWidth = getAttribute(popover, PopoverAttributes[_hasMaxWidth])
                if (attrHasMaxWidth != null) {
                    maxWidth = `min(${maxWidth}, ${attrHasMaxWidth})`
                }
    
                setStyleProperty(popover, _max_width, maxWidth)
            }  
            // right side
            else if (popoverMidPosition.x > anchorMidPosition.x && popoverPosition[_left] < anchorRect![_right]) {
                maxWidth = ((getDocument()[_body][_clientWidth] - anchorRect![_right]) - POPOVER_MARGIN - gap) + _px
    
                const attrHasMaxWidth = getAttribute(popover, PopoverAttributes[_hasMaxWidth])
                if (attrHasMaxWidth != null) {
                    maxWidth = `min(${maxWidth}, ${attrHasMaxWidth})`
                }
    
                setStyleProperty(popover, _max_width, maxWidth)
            }
    
            // top side
            if (popoverMidPosition.y < anchorMidPosition.y && popoverPosition[_bottom] > anchorRect![_top]) {
                maxHeight = (anchorRect![_top] - POPOVER_MARGIN - gap) + _px
    
                const attrHasMaxHeight = getAttribute(popover, PopoverAttributes[_hasMaxHeight])
                if (attrHasMaxHeight != null) {
                    maxHeight = `min(${maxHeight}, ${attrHasMaxHeight})`
                }
    
                setStyleProperty(popover, _max_height, maxHeight)
            }  
            // bottom side
            else if (popoverMidPosition.y > anchorMidPosition.y && popoverPosition[_top] < anchorRect![_bottom]) {
                maxHeight = ((getWindow()[_innerHeight] - anchorRect![_bottom]) - POPOVER_MARGIN - gap) + _px
    
                const attrHasMaxHeight = getAttribute(popover, PopoverAttributes[_hasMaxHeight])
                if (attrHasMaxHeight != null) {
                    maxHeight = `min(${maxHeight}, ${attrHasMaxHeight})`
                }
    
                setStyleProperty(popover, _max_height, maxHeight)
            }
    
            pos = getPopoverPosition({
                popover: getBoundingClientRect(popover),
                anchor: anchorRect,
                gap: gap,
                position: position as PopoverPosition, 
                padding: padding
            })
        }

        setStyleProperty(popover, _top, pos[_top] + _px)
        setStyleProperty(popover, _left, pos[_left] + _px)
    } catch (e) {}
}

export async function openPopover({
        event,
        anchor,
        popover,
        position = PopoverPosition.CENTER_BOTTOM,
        inputAutoFocus = false,
        gap = 4,
        padding = 4,
        allowHideAnchor = true
    }: OpenPopoverParams): Promise<void> {

    if (isPopoverOpen(popover)) return

    const isDialog: boolean = !hasAttribute(popover, _popover)
    const POPOVER_MARGIN = 8

    setAttribute(document[_body], BodyAttributes[_flyoutOpen], '');
    if (!isDialog) {
        popover[_showPopover]()
    } else {
        (popover as HTMLDialogElement)[_showModal]()
    }
    if (!inputAutoFocus) popover[_focus]()

    if (!hasAttribute(popover, PopoverAttributes[_notAllowHideAnchor]) && !allowHideAnchor && anchor){
        removeAttribute(popover, PopoverAttributes[_notAllowHideAnchor])
        if (popover[_style][_maxWidth] != '') {

            setAttribute(popover, PopoverAttributes[_hasMaxWidth], popover[_style][_maxWidth])
        }
        if (popover[_style][_maxHeight] != '') {
            setAttribute(popover, PopoverAttributes[_hasMaxHeight], popover[_style][_maxHeight])
        }
    } else {
        const attrHasMaxWidth = getAttribute(popover, PopoverAttributes[_hasMaxWidth])
        const attrHasMaxHeight = getAttribute(popover, PopoverAttributes[_hasMaxHeight])

        // back to default when menu allowed to hide anchor
        if (attrHasMaxWidth != null) {
            setStyleProperty(popover, _max_width, attrHasMaxWidth)
            removeAttribute(popover, PopoverAttributes[_hasMaxWidth])
        }
        if (attrHasMaxHeight != null) {
            setStyleProperty(popover, _max_height, attrHasMaxHeight)
            removeAttribute(popover, PopoverAttributes[_hasMaxHeight])
        }
    }

    if (!allowHideAnchor && anchor) {
        setStyleProperty(popover, _max_width, null)
        setStyleProperty(popover, _max_height, null)
    }

    const popoverRect: DOMRect = getBoundingClientRect(popover)
    const anchorRect: DOMRect | undefined = anchor? getBoundingClientRect(anchor) : undefined
    const pointer = {
        x: (event as MouseEvent)[_clientX] ?? (event as TouchEvent)[_touches][0][_clientX] ?? 0,
        y: (event as MouseEvent)[_clientY] ?? (event as TouchEvent)[_touches][0][_clientY] ?? 0
    }
    let pos = getPopoverPosition({
        popover: popoverRect,
        anchor: anchorRect,
        gap,
        pointer: anchorRect? undefined : pointer,
        padding,
        position
    })

    removeAttribute(popover, PopoverAttributes[_notAllowHideAnchor])
    if (!allowHideAnchor && anchor) {
        setAttribute(popover, PopoverAttributes[_notAllowHideAnchor])

        const popoverPosition = {
            ...pos,
            bottom: pos[_top] + popoverRect[_height],
            right: pos[_left] + popoverRect[_width]
        }

        const anchorMidPosition = {
            x: anchorRect![_left] + (anchorRect![_width] / 2),
            y: anchorRect![_top] + (anchorRect![_height] / 2),
        }
        const popoverMidPosition = {
            x: popoverPosition[_left] + (popoverRect[_width] / 2),
            y: popoverPosition[_top] + (popoverRect[_height] / 2),
        }

        let maxWidth: string = ''
        let maxHeight: string = ''

        // left side
        if (popoverMidPosition.x < anchorMidPosition.x && popoverPosition[_right] > anchorRect![_left]) {
            maxWidth = (anchorRect![_left] - POPOVER_MARGIN - gap) + _px

            const attrHasMaxWidth = getAttribute(popover, PopoverAttributes[_hasMaxWidth])
            if (attrHasMaxWidth != null) {
                maxWidth = `min(${maxWidth}, ${attrHasMaxWidth})`
            }

            setStyleProperty(popover, _max_width, maxWidth)
        }  
        // right side
        else if (popoverMidPosition.x > anchorMidPosition.x && popoverPosition[_left] < anchorRect![_right]) {
            maxWidth = ((getDocument()[_body][_clientWidth] - anchorRect![_right]) - POPOVER_MARGIN - gap) + _px

            const attrHasMaxWidth = getAttribute(popover, PopoverAttributes[_hasMaxWidth])
            if (attrHasMaxWidth != null) {
                maxWidth = `min(${maxWidth}, ${attrHasMaxWidth})`
            }

            setStyleProperty(popover, _max_width, maxWidth)
        }

        // top side
        if (popoverMidPosition.y < anchorMidPosition.y && popoverPosition[_bottom] > anchorRect![_top]) {
            maxHeight = (anchorRect![_top] - POPOVER_MARGIN - gap) + _px

            const attrHasMaxHeight = getAttribute(popover, PopoverAttributes[_hasMaxHeight])
            if (attrHasMaxHeight != null) {
                maxHeight = `min(${maxHeight}, ${attrHasMaxHeight})`
            }

            setStyleProperty(popover, _max_height, maxHeight)
        }  
        // bottom side
        else if (popoverMidPosition.y > anchorMidPosition.y && popoverPosition[_top] < anchorRect![_bottom]) {
            maxHeight = ((getWindow()[_innerHeight] - anchorRect![_bottom]) - POPOVER_MARGIN - gap) + _px

            const attrHasMaxHeight = getAttribute(popover, PopoverAttributes[_hasMaxHeight])
            if (attrHasMaxHeight != null) {
                maxHeight = `min(${maxHeight}, ${attrHasMaxHeight})`
            }

            setStyleProperty(popover, _max_height, maxHeight)
        }

        pos = getPopoverPosition({
            popover: getBoundingClientRect(popover),
            anchor: anchorRect,
            gap,
            pointer: anchorRect? undefined : pointer,
            padding,
            position
        })
    }

    const popoverPosition = {
        ...pos,
        bottom: pos[_top] + popoverRect[_height],
        right: pos[_left] + popoverRect[_width]
    }
    const translate = {
        left: 0,
        top: 0
    }

    if (anchor) {
        let id = anchor[_id]
        if (anchor[_id][_trim]() == '') {
            id = createUniqueId()
            anchor[_id] = id // it may take some time, just play safe -- idk
        }
        setAttribute(popover, PopoverAttributes[_anchorId], id)
    }
    else removeAttribute(popover, PopoverAttributes[_anchorId])

    setAttribute(popover, PopoverAttributes[_position], `${position}`)
    setAttribute(popover, PopoverAttributes[_gap], `${gap}`)
    setAttribute(popover, PopoverAttributes[_padding], `${padding}`)

    let anchorCenterLeft = pointer.x
    let anchorCenterTop = pointer.y

    if (anchorRect) {
        anchorCenterLeft = anchorRect[_left] + (anchorRect[_width] / 2)
        anchorCenterTop = anchorRect[_top] + (anchorRect[_height] / 2)
    }

    if (popoverPosition[_left]   > anchorCenterLeft) translate[_left] = -12
    if (popoverPosition[_top]    > anchorCenterTop ) translate[_top]  = -12
    if (popoverPosition[_right]  < anchorCenterLeft) translate[_left] = 12
    if (popoverPosition[_bottom] < anchorCenterTop ) translate[_top]  = 12

    setStyleProperty(popover, _top, pos[_top] + _px)
    setStyleProperty(popover, _left, pos[_left] + _px)
    setStyleProperty(popover, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)

    // Why `setTimeout`? Because we don't know how much time it takes to change inline style
    setTimeDelayed(async () => {
        setAttribute(popover, PopoverAttributes[_open], '')
        await timeout(20)
        setAttribute(popover, PopoverAttributes[_move], '')
        setStyleProperty(popover, _transform, 'translate(0, 0)')
    })

    stopImmediatePropagation(event)
}

export async function closePopover(popover: HTMLElement): Promise<void> {
    const isDialog: boolean = !hasAttribute(popover, 'popover')
    const anchorId = getAttribute(popover, PopoverAttributes[_anchorId])

    if (!isPopoverOpen(popover)) return
    if (anchorId != '' && anchorId != null){
        const anchor = getElementById(anchorId)
        
        if (anchor) {
            let gap: number = numberParse(getAttribute(popover, PopoverAttributes[_gap]) ?? '0')
            let padding: number = numberParse(getAttribute(popover, PopoverAttributes[_padding]) ?? '0')
            let position: PopoverPosition = (getAttribute(popover, PopoverAttributes[_position]) ?? `${PopoverPosition[_CENTER_BOTTOM]}`) as PopoverPosition

            if (Number[_isNaN](gap)) gap = 0
            if (Number[_isNaN](padding)) padding = 0
            const popoverRect = getBoundingClientRect(popover)
            const anchorRect = getBoundingClientRect(anchor)
            const pos = getPopoverPosition({
                popover: popoverRect,
                anchor: anchorRect,
                gap,
                padding,
                position
            })      
            const popoverPosition = {
                ...pos,
                bottom: pos[_top] + popoverRect[_height],
                right: pos[_left] + popoverRect[_width]
            }
            const translate = {
                left: 0,
                top: 0
            }

            const anchorCenterLeft = anchorRect[_left] + (anchorRect[_width] / 2)
            const anchorCenterTop = anchorRect[_top] + (anchorRect[_height] / 2)
            
            if (popoverPosition[_left]   > anchorCenterLeft) translate[_left] = -12
            if (popoverPosition[_top]    > anchorCenterTop ) translate[_top]  = -12
            if (popoverPosition[_right]  < anchorCenterLeft) translate[_left] = 12
            if (popoverPosition[_bottom] < anchorCenterTop ) translate[_top]  = 12
            
            setStyleProperty(popover, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)
        }
    }

    removeAttribute(popover, PopoverAttributes[_move])
    await timeout(3E2)
    removeAttribute(popover, PopoverAttributes[_open]);
    if (!isDialog) {
        popover[_hidePopover]()
    } else {
        (popover as HTMLDialogElement)[_close]()
    }
    if (querySelector(`${ElementSelector[_flyout]}[${_open}]`) == null){
        removeAttribute(getDocument()[_body], BodyAttributes[_flyoutOpen])
    }
}

export function isPopoverOpen(popover: HTMLElement): boolean {
    return hasAttribute(popover, PopoverAttributes[_open])
}

export function getPopoverPosition({
    popover,
    anchor,
    position = PopoverPosition[_CENTER_BOTTOM],
    gap = 8,
    padding = 0,
    pointer
}: GetPopoverPositionParams): PopoverPositionResult {
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
        popover: popover
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
    const right: () => number = () => left + rect[_popover][_width]
    const bottom: () => number = () => top + rect[_popover][_height]

    rect[_popover][_width] = rect[_popover][_width] > maxSize[_width]
        ? maxSize[_width]
        : rect[_popover][_width]
    rect[_popover][_height] = rect[_popover][_height] > maxSize[_height]
        ? maxSize[_height]
        : rect[_popover][_height]

    // find x position
    if ([
        PopoverPosition[_LEFT_TOP],
        PopoverPosition[_LEFT_CENTER_TO_BOTTOM],
        PopoverPosition[_LEFT_CENTER],
        PopoverPosition[_LEFT_CENTER_TO_TOP],
        PopoverPosition[_LEFT_BOTTOM],
    ][_includes](position)) {
        left = rect[_element][_left] - rect[_popover][_width] - gap
        if (left < edgePosition[_left]) {
            if (middlePosition[_element][_left] < middlePosition[_screen][_left]) left = rect[_element][_right] + gap
            else left = edgePosition[_left]
        }

    } 
    
    else if ([
        PopoverPosition[_CENTER_TOP_TO_RIGHT],
        PopoverPosition[_CENTER_CENTER_LEFT_TOP],
        PopoverPosition[_CENTER_CENTER_LEFT],
        PopoverPosition[_CENTER_CENTER_LEFT_BOTTOM],
        PopoverPosition[_CENTER_BOTTOM_TO_RIGHT]
    ][_includes](position)) {
        left = rect[_element][_left] - padding

        if (right() > edgePosition[_right]) {
            if (middlePosition[_element][_left] > middlePosition[_screen][_left]) left = rect[_element][_right] - rect[_popover][_width] + padding
            else left = edgePosition[_right] - rect[_popover][_width]
        }
    } 
    
    else if ([
        PopoverPosition[_CENTER_TOP],
        PopoverPosition[_CENTER_CENTER_TOP],
        PopoverPosition[_CENTER_CENTER],
        PopoverPosition[_CENTER_CENTER_BOTTOM],
        PopoverPosition[_CENTER_BOTTOM]
    ][_includes](position)) {
        left = rect[_element][_left] + (rect[_element][_width] / 2) - (rect[_popover][_width] / 2)
    } 
    
    else if ([
        PopoverPosition[_CENTER_TOP_TO_LEFT],
        PopoverPosition[_CENTER_CENTER_RIGHT_TOP],
        PopoverPosition[_CENTER_CENTER_RIGHT],
        PopoverPosition[_CENTER_CENTER_RIGHT_BOTTOM],
        PopoverPosition[_CENTER_BOTTOM_TO_LEFT]
    ][_includes](position)) {
        left = rect[_element][_right] - rect[_popover][_width] + padding

        if (left < edgePosition[_left]) {
            if (middlePosition[_element][_left] < middlePosition[_screen][_left]) left = rect[_element][_left] - padding
            else left = edgePosition[_left]
        }
    } 
    
    else if ([
        PopoverPosition[_RIGHT_TOP],
        PopoverPosition[_RIGHT_CENTER_TO_BOTTOM],
        PopoverPosition[_RIGHT_CENTER],
        PopoverPosition[_RIGHT_CENTER_TO_TOP],
        PopoverPosition[_RIGHT_BOTTOM]
    ][_includes](position)) {
        left = rect[_element][_right] + gap
        if (right() > edgePosition[_right]) {
            if (middlePosition[_element][_left] > middlePosition[_screen][_left]) left = rect[_element][_left] - rect[_popover][_width] - gap
            else left = edgePosition[_right] - rect[_popover][_width]
        }
    }

    // find y position
    if ([
        PopoverPosition[_LEFT_TOP],
        PopoverPosition[_CENTER_TOP_TO_RIGHT],
        PopoverPosition[_CENTER_TOP],
        PopoverPosition[_CENTER_TOP_TO_LEFT],
        PopoverPosition[_RIGHT_TOP]
    ][_includes](position)) {
        top = rect[_element][_top] - rect[_popover][_height] - gap
        if (top < edgePosition[_top]) {
            if (middlePosition[_element][_top] < middlePosition[_screen][_top]) top = rect[_element][_bottom] + gap
            else top = edgePosition[_top]
        }
    } 
    
    else if ([
        PopoverPosition[_LEFT_CENTER_TO_BOTTOM],
        PopoverPosition[_CENTER_CENTER_LEFT_TOP],
        PopoverPosition[_CENTER_CENTER_TOP],
        PopoverPosition[_CENTER_CENTER_RIGHT_TOP],
        PopoverPosition[_RIGHT_CENTER_TO_BOTTOM]
    ][_includes](position)) {
        top = rect[_element][_top] - padding

        if (bottom() > edgePosition[_bottom]) {
            if (middlePosition[_element][_top] > middlePosition[_screen][_top]) top = rect[_element][_bottom] - rect[_popover][_height] + padding
            else top = edgePosition[_bottom] - rect[_popover][_height]
        }
    } 
    
    else if ([
        PopoverPosition[_LEFT_CENTER],
        PopoverPosition[_CENTER_CENTER_LEFT],
        PopoverPosition[_CENTER_CENTER],
        PopoverPosition[_CENTER_CENTER_RIGHT],
        PopoverPosition[_RIGHT_CENTER]
    ][_includes](position)) {
        top = rect[_element][_top] + (rect[_element][_height] / 2) - (rect[_popover][_height] / 2)
    } 
    
    else if ([
        PopoverPosition[_LEFT_CENTER_TO_TOP],
        PopoverPosition[_CENTER_CENTER_LEFT_BOTTOM],
        PopoverPosition[_CENTER_CENTER_BOTTOM],
        PopoverPosition[_CENTER_CENTER_RIGHT_BOTTOM],
        PopoverPosition[_RIGHT_CENTER_TO_TOP]
    ][_includes](position)) {
        top = rect[_element][_bottom] - rect[_popover][_height] + padding

        if (top < edgePosition[_top]) {
            if (middlePosition[_element][_top] < middlePosition[_screen][_top]) top = rect[_element][_top] - padding
            else top = edgePosition[_top]
        }
    } 
    
    else if ([
        PopoverPosition[_LEFT_BOTTOM],
        PopoverPosition[_CENTER_BOTTOM_TO_RIGHT],
        PopoverPosition[_CENTER_BOTTOM],
        PopoverPosition[_CENTER_BOTTOM_TO_LEFT],
        PopoverPosition[_RIGHT_BOTTOM]
    ][_includes](position)) {
        top = rect[_element][_bottom] + gap
        if (bottom() > edgePosition[_bottom]) {
            if (middlePosition[_element][_top] > middlePosition[_screen][_top]) top = rect[_element][_top] - rect[_popover][_height] - gap
            else top = edgePosition[_bottom] - rect[_popover][_height]
        }
    }

    // final fallback
    if (top < edgePosition[_top]) top = edgePosition[_top]
    if (bottom() > edgePosition[_bottom]) top = edgePosition[_bottom] - rect[_popover][_height]
    if (left < edgePosition[_left]) left = edgePosition[_left]
    if (right() > edgePosition[_right]) left = edgePosition[_right] - rect[_popover][_width]

    return {
        top,
        left,
        right: screen[_width] - right(),
        bottom: screen[_height] - bottom()
    }
}