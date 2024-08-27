import { createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent, type VoidComponent } from 'solid-js'
import { Portal } from 'solid-js/web'

import type { ComponentEvent } from '@/types/event'
import { FlyoutPosition } from '@/enums/position'
import { getFlyoutPosition } from '@/utils/flyout'
import { _altKey, _body, _bottom, _centerBottom, _centerBottomToLeft, _centerBottomToRight, _centerTop, _centerTopToLeft, _centerTopToRight, _children, _class, _click, _clientWidth, _clientX, _clientY, _close, _closePopover, _ctrlKey, _detail, _disconnect, _dismiss, _dispatchEvent, _documentElement, _dragable, _element, _Escape, _findIndex, _flyout, _flyoutListener, _focus, _height, _hidePopover, _important, _innerHeight, _instant, _isSameNode, _key, _left, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _length, _manual, _max_height, _max_width, _maxHeight, _maxWidth, _metaKey, _mousemove, _mouseup, _move, _newState, _noPointerEvent, _observe, _onCancel, _onClose, _onKeyDown, _onOpen, _onReposition, _onShortFocus, _onToggle, _onToggleOpen, _open, _openPopover, _popoverListener, _popoverOpen, _push, _px, _ref, _resize, _right, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _scroll, _scrollTo, _scrollTop, _scrollY, _shiftKey, _showPopover, _some, _splice, _style, _top, _touchend, _touches, _touchmove, _transform, _usePortal, _width, _x, _y } from '@/data/string'
import { clearTimeDelayed, setTimeDelayed, timeout } from '@/utils/timeout'
import { hasAttribute, removeAttribute, setAttribute, toggleAttribute } from '@/utils/attributes'
import { getDocument, getDocumentBody, getWindow } from '@/data/window'
import { getBoundingClientRect, querySelectorAll, setStyleProperty } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { addEventListener, removeEventListener, stopImmediatePropagation } from "@/utils/event"
import { mathAbs } from '@/utils/math'
import { BodyEvents } from '@/enums/events'

import './index.scss'

type PopoverOpenDetail = {
    event: Event
    anchor?: HTMLElement
    gap?: number
    padding?: number
    position?: FlyoutPosition
    allowHideAnchor?: boolean
    dragable?: boolean
    manualDismiss?: boolean
}

enum PopoverAttributes {
    open = 'data-open', 
    move = 'data-move',
    manual = 'data-manual'
}

enum PopoverEvents {
    onClose = 'on-close-popover', 
    onReposition = 'on-reposition-popover',

    /** @param {PopoverOpenDetail} detail `PopoverOpenDetail` */
    onOpen = 'on-open-popover'
}

function openPopover(event: Event, popover: HTMLDivElement, options?: Omit<PopoverOpenDetail, 'event'>): void {
    popover[_dispatchEvent](new CustomEvent(
        PopoverEvents[_onOpen], 
        {detail: {event: event, ...options} satisfies PopoverOpenDetail}
    ))
    getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_openPopover], {detail: {element: popover}}))
}

function initPopoverListener(): void {
    // make sure to call this listener once 
    if (hasAttribute(getDocumentBody(), BodyAttributes[_popoverListener])) return;
    setAttribute(getDocumentBody(), BodyAttributes[_popoverListener])

    const selector: string = 'div.popover:popover-open'
    const popovers: HTMLDivElement[] = []
    let isNoPointerEvent: boolean = false
    let timeoutId: number | null = null

    function repositionAllPopover(): void {
        if (timeoutId) {
            clearTimeDelayed(timeoutId)
            timeoutId = null
        }

        timeoutId = setTimeDelayed(() => {
            for (const popover of querySelectorAll(selector)) {
                repositionPopover(popover as HTMLDivElement)
            }
            timeoutId = null
        }, 250)
    }

    addEventListener(getDocumentBody(), BodyEvents[_openPopover], ev => {
        const element: HTMLDivElement = (ev as any)[_detail][_element] as HTMLDivElement
        const isExist = popovers[_some](popover => popover[_isSameNode](element as Node))
        if (isExist) return;

        popovers[_push](element)
    })

    addEventListener(getDocumentBody(), BodyEvents[_closePopover], ev => {
        const element: HTMLDivElement = (ev as any)[_detail][_element] as HTMLDivElement
        const index = popovers[_findIndex](popover => popover[_isSameNode](element))
        if (index < 0) return;

        popovers[_splice](index, 1)
    })

    // use for click outside popover
    addEventListener(getDocument(), _click, async (ev: Event) => {

        // Since 'click' still dispatch even when `<body>` has
        // `[data-no-pointer-event]`, we have to disable it. This is useful 
        // if you have popover but `<body>` has `[data-no-pointer-event]`. 
        // Or when you drag something, popover will not automatically closed.
        if (isNoPointerEvent || popovers[_length] == 0) return;
        const pointer = {
            x: (ev as MouseEvent)[_clientX],
            y: (ev as MouseEvent)[_clientY]
        }

        for (const popover of popovers) {
    
            // if clicked inside, nothing happen
            const popoverRect = getBoundingClientRect(popover)
            if (pointer[_x] >= popoverRect[_left  ] && 
                pointer[_x] <= popoverRect[_right ] && 
                pointer[_y] >= popoverRect[_top   ] && 
                pointer[_y] <= popoverRect[_bottom]
            ) continue;
            if (hasAttribute(popover, PopoverAttributes[_manual])) continue;
    
            closePopover(popover as HTMLDivElement)
        }
    })

    addEventListener(getDocument(), _scroll, () => {
        if (popovers[_length] == 0) return;
        repositionAllPopover()
    })

    addEventListener(getWindow(), _resize, () => {
        if (popovers[_length] == 0) return;
        repositionAllPopover()
    })

    new MutationObserver(() => {
        isNoPointerEvent = hasAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
    })[_observe](getDocumentBody(), { attributes: true })
}

function repositionPopover(popover: HTMLDivElement): void {
    popover[_dispatchEvent](new CustomEvent(PopoverEvents[_onReposition]))
}

function closePopover(popover: HTMLDivElement): void {
    popover[_dispatchEvent](new CustomEvent(PopoverEvents[_onClose]))
}

type PopoverProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'ref' | 'onToggle'> & {
    ref?: (el: HTMLDivElement) => unknown
    onToggleOpen?: (isOpen: boolean) => unknown
    onToggle?: (ev: ComponentEvent<ToggleEvent, HTMLDivElement>) => unknown
    usePortal?: boolean
}
const Popover: ParentComponent<PopoverProps> = ($props) => {
    const $$props = mergeProps({usePortal: true, id: createUniqueId()}, $props)
    const [props, other] = splitProps($$props, [
        _ref, _onToggleOpen, _children, _onToggle,
        _class, _usePortal
    ])
    const [isDragging, setIsDragging] = createSignal<boolean>(false)
    const [isDragable, setIsDragable] = createSignal<boolean>(false)
    const [isManualDismiss, setIsManualDismiss] = createSignal<boolean>(false)
    let pointer: {x: number; y: number} = { x: 0, y: 0 }
    let isOpen: boolean = false
    let popover_ref: HTMLDivElement 
    let anchor_ref: HTMLElement | null = null
    let $gap: number = 0
    let $padding: number = 0
    let $position: FlyoutPosition = FlyoutPosition[_centerBottom]
    let notAllowHideAnchor: boolean = false
    let maxWidth: string | null = null
    let maxHeight: string | null = null

    // different of mouse position to top-left of popover position `diffPosition = abs(mousePosition - targetPosition)`
    let diffPositionX: number = 0
    let diffPositionY: number = 0

    function fixPosition(): void {
        const popoverRect = getBoundingClientRect(popover_ref)
        const screen = {
            width: getDocument()[_body][_clientWidth],
            height: getWindow()[_innerHeight]
        }
        if (popoverRect[_left  ] < 8) setStyleProperty(popover_ref, _left, 8 + _px)
        if (popoverRect[_top   ] < 8) setStyleProperty(popover_ref, _top , 8 + _px)
        if (popoverRect[_right ] > screen[_width ]) setStyleProperty(popover_ref, _left, (screen[_width ] - popoverRect[_width ] - 8) + _px)
        if (popoverRect[_bottom] > screen[_height]) setStyleProperty(popover_ref, _top , (screen[_height] - popoverRect[_height] - 8) + _px)
    }

    function changePosition(x: number, y: number) {
        setStyleProperty(popover_ref, _left, (x - diffPositionX) + _px)
        setStyleProperty(popover_ref, _top, (y - diffPositionY) + _px)
    }

    function onTouchMove(ev: TouchEvent): void {
        if (!isDragging()) return;
        changePosition(ev[_touches][0][_clientX], ev[_touches][0][_clientY])
    }

    function onTouchEnd(ev: TouchEvent): void {
        removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
        setIsDragging(false)
        fixPosition()
    }

    function onMouseMove(ev: MouseEvent): void {
        if (!isDragging()) return;

        changePosition((ev as MouseEvent)[_clientX], (ev as MouseEvent)[_clientY])
    }

    function onMouseUp(ev: MouseEvent): void {
        removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
        setIsDragging(false)
        fixPosition()
    }

    function customOnClose(ev: CustomEvent): void {
        closePopover()
    }

    function customOnOpen(ev: CustomEvent): void {
        openPopover(ev[_detail] as PopoverOpenDetail)
    }

    function customOnReposition(ev: CustomEvent): void {
        repositionPopover()
    }

    function addDragListener() {
        addEventListener<TouchEvent>(getDocument(), _touchmove, onTouchMove)
        addEventListener<TouchEvent>(getDocument(), _touchend, onTouchEnd)
        addEventListener<MouseEvent>(getDocument(), _mousemove, onMouseMove)
        addEventListener<MouseEvent>(getDocument(), _mouseup, onMouseUp)
    }

    function removeDragListener(): void {
        removeEventListener<TouchEvent>(getDocument(), _touchmove, onTouchMove)
        removeEventListener<TouchEvent>(getDocument(), _touchend, onTouchEnd)
        removeEventListener<MouseEvent>(getDocument(), _mousemove, onMouseMove)
        removeEventListener<MouseEvent>(getDocument(), _mouseup, onMouseUp)
    }

    function initCustomEvent(): void {
        addEventListener<CustomEvent>(popover_ref, PopoverEvents[_onClose], customOnClose)
        addEventListener<CustomEvent>(popover_ref, PopoverEvents[_onOpen], customOnOpen)
        addEventListener<CustomEvent>(popover_ref, PopoverEvents[_onReposition], customOnReposition)
    }
    
    function removeCustomEvent(): void {
        removeEventListener<CustomEvent>(popover_ref, PopoverEvents[_onClose], customOnClose)
        removeEventListener<CustomEvent>(popover_ref, PopoverEvents[_onOpen], customOnOpen)
        removeEventListener<CustomEvent>(popover_ref, PopoverEvents[_onReposition], customOnReposition)
    }

    async function closePopover(): Promise<void> {
        if (!isOpen) return;
        isOpen = false

        const anchorRect: DOMRect | undefined = anchor_ref? getBoundingClientRect(anchor_ref) : undefined
        const popoverRect = getBoundingClientRect(popover_ref)
        const pos = getFlyoutPosition({
            flyout: popoverRect,
            anchor: anchorRect,
            gap: $gap,
            pointer: anchorRect? undefined : pointer,
            padding: $padding,
            position: $position
        })

        const popoverPos = {
            ...pos,
            bottom: pos[_top] + popoverRect[_height],
            right: pos[_left] + popoverRect[_width]
        }
        const popoverMidPos = {
            x: popoverPos[_left] + (popoverRect[_width] / 2),
            y: popoverPos[_top] + (popoverRect[_height] / 2),
        }
        const translate = {
            left: 0,
            top: 0
        }

        let anchorCenterLeft = pointer.x
        let anchorCenterTop = pointer.y

        if (anchorRect) {
            anchorCenterLeft = anchorRect[_left] + (anchorRect[_width] / 2)
            anchorCenterTop = anchorRect[_top] + (anchorRect[_height] / 2)
        }

        const rangeX = mathAbs(popoverMidPos.x - anchorCenterLeft)
        const rangeY = mathAbs(popoverMidPos.y - anchorCenterTop)

        if (rangeX > rangeY) {
            if ((popoverMidPos.x < anchorCenterTop || popoverMidPos.x > anchorCenterTop) && (
                $position == FlyoutPosition[_centerBottom]
                || $position == FlyoutPosition[_centerBottomToLeft]
                || $position == FlyoutPosition[_centerBottomToRight]
                || $position == FlyoutPosition[_centerTop]
                || $position == FlyoutPosition[_centerTopToLeft]
                || $position == FlyoutPosition[_centerTopToRight]
            )) {
                if (popoverMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (popoverMidPos.y < anchorCenterTop ) translate[_top]  = 12
            } else {
                if (popoverMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (popoverMidPos.x < anchorCenterLeft) translate[_left] = 12
            }
        } else {
            if ((popoverMidPos.y < anchorCenterLeft || popoverMidPos.y > anchorCenterLeft) && (
                $position == FlyoutPosition[_leftCenter]
                || $position == FlyoutPosition[_leftCenterToBottom]
                || $position == FlyoutPosition[_leftCenterToTop]
                || $position == FlyoutPosition[_rightCenter]
                || $position == FlyoutPosition[_rightCenterToBottom]
                || $position == FlyoutPosition[_rightCenterToTop]
            )) {
                if (popoverMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (popoverMidPos.x < anchorCenterLeft) translate[_left] = 12
            } else {
                if (popoverMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (popoverMidPos.y < anchorCenterTop ) translate[_top]  = 12
            }
        }
    
        anchor_ref = null
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closePopover], {detail: {element: popover_ref}}))
        setStyleProperty(popover_ref, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)
        removeAttribute(popover_ref, PopoverAttributes[_move])
        await timeout(3E2)
        removeAttribute(popover_ref, PopoverAttributes[_open])
        popover_ref[_hidePopover]()
    }

    function openPopover(options: PopoverOpenDetail): void {
        if (isOpen) return

        const POPOVER_MARGIN = 8
        const { 
            event, 
            allowHideAnchor = true, 
            anchor = null, 
            dragable = false, 
            gap = 0, 
            padding = 0, 
            position = FlyoutPosition[_centerBottom],
            manualDismiss = false
        } = options;

        setIsManualDismiss(manualDismiss)
        isOpen = true
        anchor_ref = anchor
        $position = position
        $gap = gap
        $padding = padding

        // handle drag
        if (isDragable() && !dragable) {
            removeDragListener()
        } 
        else if (!isDragable() && dragable) {
            addDragListener()
        }
        setIsDragable(dragable)

        popover_ref[_showPopover]()

        if (!notAllowHideAnchor && !allowHideAnchor && anchor){
            if (popover_ref[_style][_maxWidth] != '') maxWidth = popover_ref[_style][_maxWidth]
            if (popover_ref[_style][_maxHeight] != '') maxHeight = popover_ref[_style][_maxHeight]
        } 
        else {
            // back to default when menu allowed to hide anchor
            if (maxWidth != null) setStyleProperty(popover_ref, _max_width, maxWidth)
            if (maxHeight != null) setStyleProperty(popover_ref, _max_height, maxHeight)

            maxWidth = maxHeight = null
        }

        // keep this here. Because `getFlyoutPosition()` will recalculate position
        if (!allowHideAnchor && anchor) {
            setStyleProperty(popover_ref, _max_width, null)
            setStyleProperty(popover_ref, _max_height, null)
        }

        const popoverRect: DOMRect = getBoundingClientRect(popover_ref)
        const anchorRect: DOMRect | undefined = anchor? getBoundingClientRect(anchor) : undefined
        const $event = (event as TouchEvent)[_touches]? (event as TouchEvent)[_touches][0] : (event as MouseEvent)
        pointer = {
            x: $event[_clientX] ?? 0,
            y: $event[_clientY] ?? 0
        }
        let pos = getFlyoutPosition({
            flyout: popoverRect,
            anchor: anchorRect,
            gap,
            pointer: anchorRect? undefined : pointer,
            padding,
            position
        })

        notAllowHideAnchor = false
        if (!allowHideAnchor && anchor != null) {
            notAllowHideAnchor = true

            const popoverPos = {
                ...pos,
                bottom: pos[_top] + popoverRect[_height],
                right: pos[_left] + popoverRect[_width]
            }
            const anchorMidPosition = {
                x: anchorRect![_left] + (anchorRect![_width] / 2),
                y: anchorRect![_top] + (anchorRect![_height] / 2),
            }
            const popoverMidPos = {
                x: popoverPos[_left] + (popoverRect[_width] / 2),
                y: popoverPos[_top] + (popoverRect[_height] / 2),
            }
            const rangeX = mathAbs(popoverMidPos.x - anchorMidPosition.x)
            const rangeY = mathAbs(popoverMidPos.y - anchorMidPosition.y)
            const isLeftSide = popoverMidPos.x < anchorMidPosition.x
            const isRightSide = popoverMidPos.x > anchorMidPosition.x
            const isTopSide = popoverMidPos.y < anchorMidPosition.y
            const isBottomSide = popoverMidPos.y > anchorMidPosition.y

            let $maxWidth: string = ''
            let $maxHeight: string = ''

            if (rangeX > rangeY){
                // left side
                if (isLeftSide && popoverPos[_right] > anchorRect![_left]) {
                    $maxWidth = (anchorRect![_left] - POPOVER_MARGIN - gap) + _px
                    if (maxWidth != null) $maxWidth = `min(${$maxWidth}, ${maxWidth})`

                    setStyleProperty(popover_ref, _max_width, $maxWidth)
                }  

                // right side
                else if (isRightSide && popoverPos[_left] < anchorRect![_right]) {
                    $maxWidth = ((getDocument()[_body][_clientWidth] - anchorRect![_right]) - POPOVER_MARGIN - gap) + _px
                    if (maxWidth != null) $maxWidth = `min(${$maxWidth}, ${maxWidth})`

                    setStyleProperty(popover_ref, _max_width, $maxWidth)
                }
            } 
            else {
                // top side
                if (isTopSide && popoverPos[_bottom] > anchorRect![_top]) {
                    $maxHeight = (anchorRect![_top] - POPOVER_MARGIN - gap) + _px
                    if (maxHeight != null) $maxHeight = `min(${$maxHeight}, ${maxHeight})`

                    setStyleProperty(popover_ref, _max_height, $maxHeight)
                }  

                // bottom side
                else if (isBottomSide && popoverPos[_top] < anchorRect![_bottom]) {
                    $maxHeight = ((getWindow()[_innerHeight] - anchorRect![_bottom]) - POPOVER_MARGIN - gap) + _px
                    if (maxHeight != null) $maxHeight = `min(${$maxHeight}, ${maxHeight})`

                    setStyleProperty(popover_ref, _max_height, $maxHeight)
                }
            }

            pos = getFlyoutPosition({
                flyout: getBoundingClientRect(popover_ref),
                anchor: anchorRect,
                gap,
                pointer: anchorRect? undefined : pointer,
                padding,
                position
            })
        }

        const popoverPos = {
            ...pos,
            bottom: pos[_top] + popoverRect[_height],
            right: pos[_left] + popoverRect[_width]
        }
        const popoverMidPos = {
            x: popoverPos[_left] + (popoverRect[_width] / 2),
            y: popoverPos[_top] + (popoverRect[_height] / 2),
        }
        const translate = {
            left: 0,
            top: 0
        }

        let anchorCenterLeft = pointer.x
        let anchorCenterTop = pointer.y

        if (anchorRect) {
            anchorCenterLeft = anchorRect[_left] + (anchorRect[_width] / 2)
            anchorCenterTop = anchorRect[_top] + (anchorRect[_height] / 2)
        }

        const rangeX = mathAbs(popoverMidPos.x - anchorCenterLeft)
        const rangeY = mathAbs(popoverMidPos.y - anchorCenterTop)

        if (rangeX > rangeY) {
            if ((popoverMidPos.x < anchorCenterTop || popoverMidPos.x > anchorCenterTop) && (
                position == FlyoutPosition[_centerBottom]
                || position == FlyoutPosition[_centerBottomToLeft]
                || position == FlyoutPosition[_centerBottomToRight]
                || position == FlyoutPosition[_centerTop]
                || position == FlyoutPosition[_centerTopToLeft]
                || position == FlyoutPosition[_centerTopToRight]
            )) {
                if (popoverMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (popoverMidPos.y < anchorCenterTop ) translate[_top]  = 12
            } else {
                if (popoverMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (popoverMidPos.x < anchorCenterLeft) translate[_left] = 12
            }
        } else {
            if ((popoverMidPos.y < anchorCenterLeft || popoverMidPos.y > anchorCenterLeft) && (
                position == FlyoutPosition[_leftCenter]
                || position == FlyoutPosition[_leftCenterToBottom]
                || position == FlyoutPosition[_leftCenterToTop]
                || position == FlyoutPosition[_rightCenter]
                || position == FlyoutPosition[_rightCenterToBottom]
                || position == FlyoutPosition[_rightCenterToTop]
            )) {
                if (popoverMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (popoverMidPos.x < anchorCenterLeft) translate[_left] = 12
            } else {
                if (popoverMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (popoverMidPos.y < anchorCenterTop ) translate[_top]  = 12
            }
        }

        setStyleProperty(popover_ref, _top, pos[_top] + _px)
        setStyleProperty(popover_ref, _left, pos[_left] + _px)
        setStyleProperty(popover_ref, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)

        // This should be run after all inline style applied
        setTimeDelayed(async () => {
            setAttribute(popover_ref, PopoverAttributes[_open], '')
            await timeout(20)
            setAttribute(popover_ref, PopoverAttributes[_move], '')
            setStyleProperty(popover_ref, _transform, 'translate(0, 0)')
        })

        // stop reaching to `document.onclick`
        stopImmediatePropagation(event)
    }

    function repositionPopover(): void {
        if (anchor_ref == null) {
            const popoverRect = getBoundingClientRect(popover_ref)
            const screen = {
                width: getDocument()[_body][_clientWidth],
                height: getWindow()[_innerHeight]
            }
            if (popoverRect[_left  ] < 8) setStyleProperty(popover_ref, _left, 8 + _px)
            if (popoverRect[_top   ] < 8) setStyleProperty(popover_ref, _top , 8 + _px)
            if (popoverRect[_right ] > screen[_width ]) setStyleProperty(popover_ref, _left, (screen[_width ] - popoverRect[_width ] - 8) + _px)
            if (popoverRect[_bottom] > screen[_height]) setStyleProperty(popover_ref, _top , (screen[_height] - popoverRect[_height] - 8) + _px)
            return
        }
    
        if (notAllowHideAnchor) {
            setStyleProperty(popover_ref, _max_width, null)
            setStyleProperty(popover_ref, _max_height, null)
        }
    
        const POPOVER_MARGIN = 8
        const anchorRect = getBoundingClientRect(anchor_ref)
        const popoverRect = getBoundingClientRect(popover_ref)
    
        let pos = getFlyoutPosition({
            flyout: popoverRect,
            anchor: anchorRect,
            gap: $gap,
            position: $position, 
            padding: $padding
        })

        if (notAllowHideAnchor) {
            const popoverPos = {
                ...pos,
                bottom: pos[_top] + popoverRect[_height],
                right: pos[_left] + popoverRect[_width]
            }
            const anchorMidPosition = {
                x: anchorRect![_left] + (anchorRect![_width] / 2),
                y: anchorRect![_top] + (anchorRect![_height] / 2),
            }
            const popoverMidPos = {
                x: popoverPos[_left] + (popoverRect[_width] / 2),
                y: popoverPos[_top] + (popoverRect[_height] / 2),
            }
            const rangeX = mathAbs(popoverMidPos.x - anchorMidPosition.x)
            const rangeY = mathAbs(popoverMidPos.y - anchorMidPosition.y)
    
            let $maxWidth: string = ''
            let $maxHeight: string = ''
    
            if (rangeX > rangeY){
                
                // left side
                if (popoverMidPos.x < anchorMidPosition.x && popoverPos[_right] > anchorRect![_left]) {
                    $maxWidth = (anchorRect![_left] - POPOVER_MARGIN - $gap) + _px
                    if (maxWidth != null) $maxWidth = `min(${$maxWidth}, ${maxWidth})`
        
                    setStyleProperty(popover_ref, _max_width, $maxWidth)
                }  

                // right side
                else if (popoverMidPos.x > anchorMidPosition.x && popoverPos[_left] < anchorRect![_right]) {
                    $maxWidth = ((getDocument()[_body][_clientWidth] - anchorRect![_right]) - POPOVER_MARGIN - $gap) + _px
                    if (maxWidth != null) $maxWidth = `min(${$maxWidth}, ${maxWidth})`
        
                    setStyleProperty(popover_ref, _max_width, $maxWidth)
                }
            }
            else {

                // top side
                if (popoverMidPos.y < anchorMidPosition.y && popoverPos[_bottom] > anchorRect![_top]) {
                    $maxHeight = (anchorRect![_top] - POPOVER_MARGIN - $gap) + _px
                    if (maxHeight != null) $maxHeight = `min(${$maxHeight}, ${maxHeight})`
        
                    setStyleProperty(popover_ref, _max_height, $maxHeight)
                }  

                // bottom side
                else if (popoverMidPos.y > anchorMidPosition.y && popoverPos[_top] < anchorRect![_bottom]) {
                    $maxHeight = ((getWindow()[_innerHeight] - anchorRect![_bottom]) - POPOVER_MARGIN - $gap) + _px
                    if (maxHeight != null) $maxHeight = `min(${$maxHeight}, ${maxHeight})`
        
                    setStyleProperty(popover_ref, _max_height, $maxHeight)
                }
            }
    
            pos = getFlyoutPosition({
                flyout: getBoundingClientRect(popover_ref),
                anchor: anchorRect,
                gap: $gap,
                position: $position, 
                padding: $padding
            })
        }

        setStyleProperty(popover_ref, _top, pos[_top] + _px)
        setStyleProperty(popover_ref, _left, pos[_left] + _px)
    }

    function initMutationObserver(): void {
        const childrenObserver = new MutationObserver(() => repositionPopover())
        childrenObserver[_observe](popover_ref, {subtree: true, childList: true})

        onCleanup(() => {
            childrenObserver[_disconnect]()
        })
    }

    onMount(() => {
        initPopoverListener()
        initCustomEvent()
        initMutationObserver()
    })

    onCleanup(() => {
        removeCustomEvent()
        closePopover()
    })

    const C: VoidComponent = () => (<div
        class={"popover" + (props[_class] != undefined? ` ${props[_class]}` : '')}
        ref={r => {
            popover_ref = r
            if (props[_ref] != undefined) props[_ref](r)
        }} 
        popover={_manual}
        onToggle={(ev) => {
            isOpen = ev[_newState] == _open
            if (props[_onToggle]) props[_onToggle](ev)
            if (props[_onToggleOpen]) props[_onToggleOpen](isOpen)
        }}
        data-is-dragging={toggleAttribute(isDragging())}
        data-manual={toggleAttribute(isManualDismiss())}
        {...other}>
        <Show when={isDragable()}>
            <span 
                class="popover-drag-handle"
                data-keep-pointer-event={toggleAttribute(isDragging())}
                onMouseDown={(ev) => {
                    const rect = getBoundingClientRect(popover_ref)
                    setIsDragging(true)
                    setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                    diffPositionX = ev[_clientX] - rect.x
                    diffPositionY = ev[_clientY] - rect.y
                }}
                onTouchStart={ev => {
                    const rect = getBoundingClientRect(popover_ref)
                    setIsDragging(true)
                    setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                    diffPositionX = ev[_touches][0][_clientX] - rect.x
                    diffPositionY = ev[_touches][0][_clientY] - rect.y
                }}
            />
        </Show>
        <div>
            {props[_children]}
        </div>
    </div>)

    return (<Show 
        when={props[_usePortal]}
        fallback={<C/>}>
        <Portal><C/></Portal>
    </Show>)
}

export {
    PopoverAttributes,
    PopoverEvents, 
    openPopover, 
    repositionPopover,
    closePopover, 
    Popover
}
export type { 
    PopoverOpenDetail, 
    PopoverProps
}
export default Popover