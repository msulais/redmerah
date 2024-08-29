import { createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent } from 'solid-js'
import { Portal } from 'solid-js/web'

import type { ComponentEvent } from '@/types/event'
import { FlyoutPosition as ModalPosition } from '@/enums/position'
import { getFlyoutPosition } from '@/utils/flyout'
import { _altKey, _at, _body, _bottom, _centerBottom, _centerBottomToLeft, _centerBottomToRight, _centerTop, _centerTopToLeft, _centerTopToRight, _children, _class, _click, _clientWidth, _clientX, _clientY, _close, _closeModal, _ctrlKey, _detail, _disconnect, _dismiss, _dispatchEvent, _documentElement, _dragable, _element, _Escape, _findIndex, _flyout, _flyoutListener, _focus, _height, _important, _innerHeight, _instant, _isSameNode, _key, _left, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _length, _manual, _max_height, _max_width, _maxHeight, _maxWidth, _metaKey, _modalListener, _modalOpen, _mousemove, _mouseup, _move, _noPointerEvent, _observe, _onCancel, _onClose, _onKeyDown, _onOpen, _onReposition, _onShortFocus, _onToggleOpen, _open, _openModal, _push, _px, _ref, _resize, _right, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _scroll, _scrollTo, _scrollTop, _scrollY, _shiftKey, _showModal, _some, _splice, _style, _top, _touchend, _touches, _touchmove, _transform, _width, _x, _y } from '@/data/string'
import { clearTimeDelayed, setTimeDelayed, timeout } from '@/utils/timeout'
import { hasAttribute, removeAttribute, setAttribute, toggleAttribute } from '@/utils/attributes'
import { getDocument, getDocumentBody, getWindow } from '@/data/window'
import { getBoundingClientRect, querySelectorAll, setStyleProperty } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { addEventListener, preventDefault, removeEventListener, stopImmediatePropagation } from "@/utils/event"
import { mathAbs } from '@/utils/math'
import { BodyEvents } from '@/enums/events'

import './index.scss'

type ModalOpenDetail = {
    event: Event
    anchor?: HTMLElement
    gap?: number
    padding?: number
    important?: boolean
    position?: ModalPosition
    allowHideAnchor?: boolean
    dragable?: boolean
    inputAutoFocus?: boolean
}

type ModalCloseDetail = {
    soft?: boolean
}

enum ModalAttributes {
    open = 'data-open', 
    move = 'data-move',
    important = 'data-important',
    focus = 'data-focus'
}

enum ModalEvents {
    onShortFocus = 'on-short-focus-modal',

    /** @param {ModalCloseDetail} detail `ModalCloseDetail` */
    onClose = 'on-close-modal', 

    onReposition = 'on-reposition-modal',

    /** @param {ModalOpenDetail} detail `ModalOpenDetail` */
    onOpen = 'on-open-modal'
}

function openModal(event: Event, modal: HTMLDialogElement, options?: Omit<ModalOpenDetail, 'event'>): void {
    modal[_dispatchEvent](new CustomEvent(
        ModalEvents[_onOpen], 
        {detail: {event: event, ...options} satisfies ModalOpenDetail}
    ))
    getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_openModal], {detail: {element: modal}}))
}

function initModalListener(): void {
    // make sure to call this listener once 
    if (hasAttribute(getDocumentBody(), BodyAttributes[_modalListener])) return;
    setAttribute(getDocumentBody(), BodyAttributes[_modalListener])

    const selector: string = 'dialog.modal[open]'
    const modals: HTMLDialogElement[] = []
    let isNoPointerEvent: boolean = false
    let scrollTop: number = 0
    let timeoutId: number | null = null

    // make sure not to close other modal after closing some modal
    let removed = false

    addEventListener(getDocumentBody(), BodyEvents[_openModal], ev => {
        const element: HTMLDialogElement = (ev as any)[_detail][_element] as HTMLDialogElement
        const isExist = modals[_some](modal => modal[_isSameNode](element as Node))
        if (isExist) return;

        modals[_push](element)
    })

    addEventListener(getDocumentBody(), BodyEvents[_closeModal], ev => {
        const element: HTMLDialogElement = (ev as any)[_detail][_element] as HTMLDialogElement
        const index = modals[_findIndex](modal => modal[_isSameNode](element))
        if (index < 0) return;

        modals[_splice](index, 1)
        removed = modals[_length] > 0
    })

    // use for click outside modal
    addEventListener(getDocument(), _click, async (ev: Event) => {

        // Since 'click' still dispatch even when `<body>` has
        // `[data-no-pointer-event]`, we have to disable it. This is useful 
        // if you have modal but `<body>` has `[data-no-pointer-event]`. 
        // Or when you drag something, modal will not automatically closed.
        if (isNoPointerEvent || modals[_length] == 0 || removed) {
            removed = false
            return
        }
        const modal: HTMLDialogElement = modals[_at](-1)!
        const pointer = {
            x: (ev as MouseEvent)[_clientX],
            y: (ev as MouseEvent)[_clientY]
        }

        // if clicked inside, nothing happen
        const modalRect = getBoundingClientRect(modal)
        if (pointer[_x] >= modalRect[_left  ] && 
            pointer[_x] <= modalRect[_right ] && 
            pointer[_y] >= modalRect[_top   ] && 
            pointer[_y] <= modalRect[_bottom]
        ) return;

        closeModal(modal as HTMLDialogElement, true)
    })

    addEventListener(getDocument(), _scroll, () => {
        if (modals[_length] == 0) {
            scrollTop = getWindow()[_scrollY] || getDocument()[_documentElement][_scrollTop]
            return
        }
        getWindow()[_scrollTo]({ top: scrollTop, behavior: _instant })
    })

    addEventListener(getWindow(), _resize, () => {
        if (modals[_length] == 0) return;

        if (timeoutId) {
            clearTimeDelayed(timeoutId)
            timeoutId = null
        }

        timeoutId = setTimeDelayed(() => {
            for (const modal of querySelectorAll(selector)) {
                repositionModal(modal as HTMLDialogElement)
            }
            timeoutId = null
        }, 250)
    })

    new MutationObserver(() => {
        isNoPointerEvent = hasAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
    })[_observe](getDocumentBody(), { attributes: true })
}

function repositionModal(modal: HTMLDialogElement): void {
    modal[_dispatchEvent](new CustomEvent(ModalEvents[_onReposition]))
}

function focusModal(modal: HTMLDialogElement): void {
    modal[_dispatchEvent](new CustomEvent(ModalEvents[_onShortFocus]))
}

function closeModal(modal: HTMLDialogElement, soft: boolean = false): void {
    modal[_dispatchEvent](new CustomEvent(ModalEvents[_onClose], {detail: {soft} satisfies ModalCloseDetail}))
}

type ModalProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'ref' | 'onClose' | 'onCancel' | 'onKeyDown'> & {
    ref?: (el: HTMLDialogElement) => unknown
    onToggleOpen?: (isOpen: boolean) => unknown
    onKeyDown?: (ev: ComponentEvent<KeyboardEvent, HTMLDialogElement>) => unknown
    onClose?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
}
const Modal: ParentComponent<ModalProps> = ($props) => {
    const $$props = mergeProps({id: createUniqueId()}, $props)
    const [props, other] = splitProps($$props, [
        _ref, _onToggleOpen, _onClose, _onCancel, 
        _children, _onKeyDown, _class
    ])
    const [isDragging, setIsDragging] = createSignal<boolean>(false)
    const [isDragable, setIsDragable] = createSignal<boolean>(false)
    let pointer: {x: number; y: number} = { x: 0, y: 0 }
    let isOpen: boolean = false
    let modal_ref: HTMLDialogElement 
    let focusTimeoutId: number | null = null
    let anchor_ref: HTMLElement | null = null
    let $important: boolean = false
    let $gap: number = 0
    let $padding: number = 0
    let $position: ModalPosition = ModalPosition[_centerBottom]
    let notAllowHideAnchor: boolean = false
    let maxWidth: string | null = null
    let maxHeight: string | null = null

    // different of mouse position to top-left of modal position `diffPosition = abs(mousePosition - targetPosition)`
    let diffPositionX: number = 0
    let diffPositionY: number = 0

    function fixPosition(): void {
        const popoverRect = getBoundingClientRect(modal_ref)
        const screen = {
            width: getDocument()[_body][_clientWidth],
            height: getWindow()[_innerHeight]
        }
        if (popoverRect[_left  ] < 8) setStyleProperty(modal_ref, _left, 8 + _px)
        if (popoverRect[_top   ] < 8) setStyleProperty(modal_ref, _top , 8 + _px)
        if (popoverRect[_right ] > screen[_width ]) setStyleProperty(modal_ref, _left, (screen[_width ] - popoverRect[_width ] - 8) + _px)
        if (popoverRect[_bottom] > screen[_height]) setStyleProperty(modal_ref, _top , (screen[_height] - popoverRect[_height] - 8) + _px)
    }

    function changePosition(x: number, y: number) {
        setStyleProperty(modal_ref, _left, (x - diffPositionX) + _px)
        setStyleProperty(modal_ref, _top, (y - diffPositionY) + _px)
    }

    function onTouchMove(ev: TouchEvent): void {
        if (!isDragging()) return;
        changePosition(ev[_touches][0][_clientX], ev[_touches][0][_clientY])
    }

    function onTouchEnd(_ev: TouchEvent): void {
        removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
        setIsDragging(false)
        fixPosition()
    }

    function onMouseMove(ev: MouseEvent): void {
        if (!isDragging()) return;

        changePosition((ev as MouseEvent)[_clientX], (ev as MouseEvent)[_clientY])
    }

    function onMouseUp(_ev: MouseEvent): void {
        removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
        setIsDragging(false)
        fixPosition()
    }

    function customOnShortFocus(_ev: CustomEvent): void {
        shortFocusModal()
    }

    function customOnClose(ev: CustomEvent): void {
        closeModal(ev[_detail] as ModalCloseDetail)
    }

    function customOnOpen(ev: CustomEvent): void {
        openModal(ev[_detail] as ModalOpenDetail)
    }

    function customOnReposition(_ev: CustomEvent): void {
        repositionModal()
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
        addEventListener<CustomEvent>(modal_ref, ModalEvents[_onShortFocus], customOnShortFocus)
        addEventListener<CustomEvent>(modal_ref, ModalEvents[_onClose], customOnClose)
        addEventListener<CustomEvent>(modal_ref, ModalEvents[_onOpen], customOnOpen)
        addEventListener<CustomEvent>(modal_ref, ModalEvents[_onReposition], customOnReposition)
    }
    
    function removeCustomEvent(): void {
        removeEventListener<CustomEvent>(modal_ref, ModalEvents[_onShortFocus], customOnShortFocus)
        removeEventListener<CustomEvent>(modal_ref, ModalEvents[_onClose], customOnClose)
        removeEventListener<CustomEvent>(modal_ref, ModalEvents[_onOpen], customOnOpen)
        removeEventListener<CustomEvent>(modal_ref, ModalEvents[_onReposition], customOnReposition)
    }

    async function closeModal(detail: {soft?: boolean}): Promise<void> {
        const { soft = false } = detail;

        if (soft && $important && isOpen) {
            focusModal(modal_ref)
            return
        }
        if (!isOpen) return;
        isOpen = false
        

        const anchorRect: DOMRect | undefined = anchor_ref? getBoundingClientRect(anchor_ref) : undefined
        const modalRect = getBoundingClientRect(modal_ref)
        const pos = getFlyoutPosition({
            flyout: modalRect,
            anchor: anchorRect,
            gap: $gap,
            pointer: anchorRect? undefined : pointer,
            padding: $padding,
            position: $position
        })

        const modalPos = {
            ...pos,
            bottom: pos[_top] + modalRect[_height],
            right: pos[_left] + modalRect[_width]
        }
        const modalMidPos = {
            x: modalPos[_left] + (modalRect[_width] / 2),
            y: modalPos[_top] + (modalRect[_height] / 2),
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

        const rangeX = mathAbs(modalMidPos.x - anchorCenterLeft)
        const rangeY = mathAbs(modalMidPos.y - anchorCenterTop)

        if (rangeX > rangeY) {
            if ((modalMidPos.x < anchorCenterTop || modalMidPos.x > anchorCenterTop) && (
                $position == ModalPosition[_centerBottom]
                || $position == ModalPosition[_centerBottomToLeft]
                || $position == ModalPosition[_centerBottomToRight]
                || $position == ModalPosition[_centerTop]
                || $position == ModalPosition[_centerTopToLeft]
                || $position == ModalPosition[_centerTopToRight]
            )) {
                if (modalMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (modalMidPos.y < anchorCenterTop ) translate[_top]  = 12
            } else {
                if (modalMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (modalMidPos.x < anchorCenterLeft) translate[_left] = 12
            }
        } else {
            if ((modalMidPos.y < anchorCenterLeft || modalMidPos.y > anchorCenterLeft) && (
                $position == ModalPosition[_leftCenter]
                || $position == ModalPosition[_leftCenterToBottom]
                || $position == ModalPosition[_leftCenterToTop]
                || $position == ModalPosition[_rightCenter]
                || $position == ModalPosition[_rightCenterToBottom]
                || $position == ModalPosition[_rightCenterToTop]
            )) {
                if (modalMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (modalMidPos.x < anchorCenterLeft) translate[_left] = 12
            } else {
                if (modalMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (modalMidPos.y < anchorCenterTop ) translate[_top]  = 12
            }
        }
    
        anchor_ref = null
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeModal], {detail: {element: modal_ref}}))
        setStyleProperty(modal_ref, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)
        removeAttribute(modal_ref, ModalAttributes[_move])
        await timeout(3E2)
        removeAttribute(modal_ref, ModalAttributes[_open])
        modal_ref[_close]()
    }

    function shortFocusModal(): void {
        if (focusTimeoutId != null) clearTimeDelayed(focusTimeoutId)
        setAttribute(modal_ref, ModalAttributes[_focus])
    
        focusTimeoutId = setTimeDelayed(() => {
            removeAttribute(modal_ref, ModalAttributes[_focus])
            focusTimeoutId = null
        }, 1000)
    }

    function openModal(detail: ModalOpenDetail): void {
        if (isOpen) return;
        if (props[_onToggleOpen]) props[_onToggleOpen](true)

        const POPOVER_MARGIN = 8
        const { 
            event, 
            allowHideAnchor = true, 
            anchor = null, 
            dragable = false, 
            gap = 0, 
            important = false, 
            padding = 0, 
            position = ModalPosition[_centerBottom],
            inputAutoFocus = false 
        } = detail;

        isOpen = true
        anchor_ref = anchor
        $position = position
        $gap = gap
        $padding = padding
        $important = important

        // handle drag
        if (isDragable() && !dragable) {
            removeDragListener()
        } 
        else if (!isDragable() && dragable) {
            addDragListener()
        }
        setIsDragable(dragable)

        modal_ref[_showModal]()

        // input auto focus
        if (!inputAutoFocus) modal_ref[_focus]()

        if (!notAllowHideAnchor && !allowHideAnchor && anchor){
            if (modal_ref[_style][_maxWidth] != '') maxWidth = modal_ref[_style][_maxWidth]
            if (modal_ref[_style][_maxHeight] != '') maxHeight = modal_ref[_style][_maxHeight]
        } 
        else {
            // back to default when menu allowed to hide anchor
            if (maxWidth != null) setStyleProperty(modal_ref, _max_width, maxWidth)
            if (maxHeight != null) setStyleProperty(modal_ref, _max_height, maxHeight)

            maxWidth = maxHeight = null
        }

        // keep this here. Because `getFlyoutPosition()` will recalculate position
        if (!allowHideAnchor && anchor) {
            setStyleProperty(modal_ref, _max_width, null)
            setStyleProperty(modal_ref, _max_height, null)
        }

        const modalRect: DOMRect = getBoundingClientRect(modal_ref)
        const anchorRect: DOMRect | undefined = anchor? getBoundingClientRect(anchor) : undefined
        const $event = (event as TouchEvent)[_touches]? (event as TouchEvent)[_touches][0] : (event as MouseEvent)
        pointer = {
            x: $event[_clientX] ?? 0,
            y: $event[_clientY] ?? 0
        }
        let pos = getFlyoutPosition({
            flyout: modalRect,
            anchor: anchorRect,
            gap,
            pointer: anchorRect? undefined : pointer,
            padding,
            position
        })

        notAllowHideAnchor = false
        if (!allowHideAnchor && anchor != null) {
            notAllowHideAnchor = true

            const modalPos = {
                ...pos,
                bottom: pos[_top] + modalRect[_height],
                right: pos[_left] + modalRect[_width]
            }
            const anchorMidPosition = {
                x: anchorRect![_left] + (anchorRect![_width] / 2),
                y: anchorRect![_top] + (anchorRect![_height] / 2),
            }
            const modalMidPos = {
                x: modalPos[_left] + (modalRect[_width] / 2),
                y: modalPos[_top] + (modalRect[_height] / 2),
            }
            const rangeX = mathAbs(modalMidPos.x - anchorMidPosition.x)
            const rangeY = mathAbs(modalMidPos.y - anchorMidPosition.y)
            const isLeftSide = modalMidPos.x < anchorMidPosition.x
            const isRightSide = modalMidPos.x > anchorMidPosition.x
            const isTopSide = modalMidPos.y < anchorMidPosition.y
            const isBottomSide = modalMidPos.y > anchorMidPosition.y

            let $maxWidth: string = ''
            let $maxHeight: string = ''

            if (rangeX > rangeY){
                // left side
                if (isLeftSide && modalPos[_right] > anchorRect![_left]) {
                    $maxWidth = (anchorRect![_left] - POPOVER_MARGIN - gap) + _px
                    if (maxWidth != null) $maxWidth = `min(${$maxWidth}, ${maxWidth})`

                    setStyleProperty(modal_ref, _max_width, $maxWidth)
                }  

                // right side
                else if (isRightSide && modalPos[_left] < anchorRect![_right]) {
                    $maxWidth = ((getDocument()[_body][_clientWidth] - anchorRect![_right]) - POPOVER_MARGIN - gap) + _px
                    if (maxWidth != null) $maxWidth = `min(${$maxWidth}, ${maxWidth})`

                    setStyleProperty(modal_ref, _max_width, $maxWidth)
                }
            } 
            else {
                // top side
                if (isTopSide && modalPos[_bottom] > anchorRect![_top]) {
                    $maxHeight = (anchorRect![_top] - POPOVER_MARGIN - gap) + _px
                    if (maxHeight != null) $maxHeight = `min(${$maxHeight}, ${maxHeight})`

                    setStyleProperty(modal_ref, _max_height, $maxHeight)
                }  

                // bottom side
                else if (isBottomSide && modalPos[_top] < anchorRect![_bottom]) {
                    $maxHeight = ((getWindow()[_innerHeight] - anchorRect![_bottom]) - POPOVER_MARGIN - gap) + _px
                    if (maxHeight != null) $maxHeight = `min(${$maxHeight}, ${maxHeight})`

                    setStyleProperty(modal_ref, _max_height, $maxHeight)
                }
            }

            pos = getFlyoutPosition({
                flyout: getBoundingClientRect(modal_ref),
                anchor: anchorRect,
                gap,
                pointer: anchorRect? undefined : pointer,
                padding,
                position
            })
        }

        const modalPos = {
            ...pos,
            bottom: pos[_top] + modalRect[_height],
            right: pos[_left] + modalRect[_width]
        }
        const modalMidPos = {
            x: modalPos[_left] + (modalRect[_width] / 2),
            y: modalPos[_top] + (modalRect[_height] / 2),
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

        const rangeX = mathAbs(modalMidPos.x - anchorCenterLeft)
        const rangeY = mathAbs(modalMidPos.y - anchorCenterTop)

        if (rangeX > rangeY) {
            if ((modalMidPos.x < anchorCenterTop || modalMidPos.x > anchorCenterTop) && (
                position == ModalPosition[_centerBottom]
                || position == ModalPosition[_centerBottomToLeft]
                || position == ModalPosition[_centerBottomToRight]
                || position == ModalPosition[_centerTop]
                || position == ModalPosition[_centerTopToLeft]
                || position == ModalPosition[_centerTopToRight]
            )) {
                if (modalMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (modalMidPos.y < anchorCenterTop ) translate[_top]  = 12
            } else {
                if (modalMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (modalMidPos.x < anchorCenterLeft) translate[_left] = 12
            }
        } else {
            if ((modalMidPos.y < anchorCenterLeft || modalMidPos.y > anchorCenterLeft) && (
                position == ModalPosition[_leftCenter]
                || position == ModalPosition[_leftCenterToBottom]
                || position == ModalPosition[_leftCenterToTop]
                || position == ModalPosition[_rightCenter]
                || position == ModalPosition[_rightCenterToBottom]
                || position == ModalPosition[_rightCenterToTop]
            )) {
                if (modalMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (modalMidPos.x < anchorCenterLeft) translate[_left] = 12
            } else {
                if (modalMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (modalMidPos.y < anchorCenterTop ) translate[_top]  = 12
            }
        }

        setStyleProperty(modal_ref, _top, pos[_top] + _px)
        setStyleProperty(modal_ref, _left, pos[_left] + _px)
        setStyleProperty(modal_ref, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)

        // This should be run after all inline style applied
        setTimeDelayed(async () => {
            setAttribute(modal_ref, ModalAttributes[_open], '')
            await timeout(20)
            setAttribute(modal_ref, ModalAttributes[_move], '')
            setStyleProperty(modal_ref, _transform, 'translate(0, 0)')
        })

        // stop reaching to `document.onclick`
        stopImmediatePropagation(event)
    }

    function repositionModal(): void {
        if (anchor_ref == null) {
            const modalRect = getBoundingClientRect(modal_ref)
            const screen = {
                width: getDocument()[_body][_clientWidth],
                height: getWindow()[_innerHeight]
            }
            if (modalRect[_left  ] < 8) setStyleProperty(modal_ref, _left, 8 + _px)
            if (modalRect[_top   ] < 8) setStyleProperty(modal_ref, _top , 8 + _px)
            if (modalRect[_right ] > screen[_width ]) setStyleProperty(modal_ref, _left, (screen[_width ] - modalRect[_width ] - 8) + _px)
            if (modalRect[_bottom] > screen[_height]) setStyleProperty(modal_ref, _top , (screen[_height] - modalRect[_height] - 8) + _px)
            return
        }
    
        if (notAllowHideAnchor) {
            setStyleProperty(modal_ref, _max_width, null)
            setStyleProperty(modal_ref, _max_height, null)
        }
    
        const MODAL_MARGIN = 8
        const anchorRect = getBoundingClientRect(anchor_ref)
        const modalRect = getBoundingClientRect(modal_ref)
    
        let pos = getFlyoutPosition({
            flyout: modalRect,
            anchor: anchorRect,
            gap: $gap,
            position: $position, 
            padding: $padding
        })

        if (notAllowHideAnchor) {
            const modalPos = {
                ...pos,
                bottom: pos[_top] + modalRect[_height],
                right: pos[_left] + modalRect[_width]
            }
            const anchorMidPosition = {
                x: anchorRect![_left] + (anchorRect![_width] / 2),
                y: anchorRect![_top] + (anchorRect![_height] / 2),
            }
            const modalMidPos = {
                x: modalPos[_left] + (modalRect[_width] / 2),
                y: modalPos[_top] + (modalRect[_height] / 2),
            }
            const rangeX = mathAbs(modalMidPos.x - anchorMidPosition.x)
            const rangeY = mathAbs(modalMidPos.y - anchorMidPosition.y)
    
            let $maxWidth: string = ''
            let $maxHeight: string = ''
    
            if (rangeX > rangeY){
                
                // left side
                if (modalMidPos.x < anchorMidPosition.x && modalPos[_right] > anchorRect![_left]) {
                    $maxWidth = (anchorRect![_left] - MODAL_MARGIN - $gap) + _px
                    if (maxWidth != null) $maxWidth = `min(${$maxWidth}, ${maxWidth})`
        
                    setStyleProperty(modal_ref, _max_width, $maxWidth)
                }  

                // right side
                else if (modalMidPos.x > anchorMidPosition.x && modalPos[_left] < anchorRect![_right]) {
                    $maxWidth = ((getDocument()[_body][_clientWidth] - anchorRect![_right]) - MODAL_MARGIN - $gap) + _px
                    if (maxWidth != null) $maxWidth = `min(${$maxWidth}, ${maxWidth})`
        
                    setStyleProperty(modal_ref, _max_width, $maxWidth)
                }
            }
            else {

                // top side
                if (modalMidPos.y < anchorMidPosition.y && modalPos[_bottom] > anchorRect![_top]) {
                    $maxHeight = (anchorRect![_top] - MODAL_MARGIN - $gap) + _px
                    if (maxHeight != null) $maxHeight = `min(${$maxHeight}, ${maxHeight})`
        
                    setStyleProperty(modal_ref, _max_height, $maxHeight)
                }  

                // bottom side
                else if (modalMidPos.y > anchorMidPosition.y && modalPos[_top] < anchorRect![_bottom]) {
                    $maxHeight = ((getWindow()[_innerHeight] - anchorRect![_bottom]) - MODAL_MARGIN - $gap) + _px
                    if (maxHeight != null) $maxHeight = `min(${$maxHeight}, ${maxHeight})`
        
                    setStyleProperty(modal_ref, _max_height, $maxHeight)
                }
            }
    
            pos = getFlyoutPosition({
                flyout: getBoundingClientRect(modal_ref),
                anchor: anchorRect,
                gap: $gap,
                position: $position, 
                padding: $padding
            })
        }

        setStyleProperty(modal_ref, _top, pos[_top] + _px)
        setStyleProperty(modal_ref, _left, pos[_left] + _px)
    }

    function initMutationObserver(): void {
        const childrenObserver = new MutationObserver(() => repositionModal())
        childrenObserver[_observe](modal_ref, {subtree: true, childList: true})

        onCleanup(() => {
            childrenObserver[_disconnect]()
        })
    }

    onMount(() => {
        initModalListener()
        initCustomEvent()
        initMutationObserver()
    })

    onCleanup(async () => {
        removeCustomEvent()
        await closeModal({})
    })

    return (<Portal><dialog
        class={"modal" + (props[_class] != undefined? ` ${props[_class]}` : '')}
        ref={r => {
            modal_ref = r
            if (props[_ref]) props[_ref](r)
        }} 
        onKeyDown={(ev) => {
            if (props[_onKeyDown]) props[_onKeyDown](ev)
            if (ev[_key] == _Escape 
                && !ev[_altKey] 
                && !ev[_ctrlKey] 
                && !ev[_metaKey] 
                && !ev[_shiftKey]
                && $important
            ){ 
                focusModal(modal_ref)
                preventDefault(ev)
            }
        }}
        onCancel={(ev) => {
            if (props[_onCancel]) props[_onCancel](ev)
            if ($important) {
                preventDefault(ev)
                return
            }
            closeModal({soft: true})
        }}
        onClose={(ev) => {
            if (props[_onToggleOpen]) props[_onToggleOpen](false)
            if (props[_onClose]) props[_onClose](ev)
            isOpen = false
        }}
        data-is-dragging={toggleAttribute(isDragging())}
        {...other}>
        <Show when={isDragable()}>
            <span 
                class="modal-drag-handle"
                data-keep-pointer-event={toggleAttribute(isDragging())}
                onMouseDown={(ev) => {
                    const rect = getBoundingClientRect(modal_ref)
                    setIsDragging(true)
                    setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                    diffPositionX = ev[_clientX] - rect.x
                    diffPositionY = ev[_clientY] - rect.y
                }}
                onTouchStart={ev => {
                    const rect = getBoundingClientRect(modal_ref)
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
    </dialog></Portal>)
}

export {
    Modal, 
    closeModal,
    focusModal,
    repositionModal, 
    openModal,
    ModalAttributes,
    ModalEvents,
    ModalPosition
}
export type {
    ModalProps,
    ModalOpenDetail, 
    ModalCloseDetail
}
export default Modal