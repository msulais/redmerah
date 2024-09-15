import { createSignal, createUniqueId, mergeProps, onCleanup, onMount, Show, splitProps, type JSX, type ParentComponent } from 'solid-js'
import { Portal } from 'solid-js/web'

import type { ComponentEvent } from '@/types/event'
import { AnimationEffectTiming } from '@/enums/animation'
import { FlyoutPosition as ModalPosition } from '@/enums/position'
import { getFlyoutPosition } from '@/utils/flyout'
import { _dispatchEvent, _onOpen, _openModal, _modalListener, _detail, _element, _some, _isSameNode, _push, _closeModal, _findIndex, _splice, _length, _click, _at, _clientX, _clientY, _x, _left, _right, _y, _top, _bottom, _scroll, _scrollY, _documentElement, _scrollTop, _scrollTo, _instant, _resize, _noPointerEvent, _observe, _onReposition, _onShortFocus, _onClose, _ref, _onToggleOpen, _onCancel, _children, _onKeyDown, _class, _openAnimation, _closeAnimation, _centerBottom, _body, _clientWidth, _innerHeight, _px, _width, _height, _touches, _touchmove, _touchend, _mousemove, _mouseup, _centerBottomToLeft, _centerBottomToRight, _centerTop, _centerTopToLeft, _centerTopToRight, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _open, _close, _animate, _springBounce, _finished, _then, _focus, _showModal, _style, _maxWidth, _maxHeight, _max_width, _max_height, _none, _disconnect, _key, _Escape, _altKey, _ctrlKey, _metaKey, _shiftKey, _position } from '@/constants/string'
import { clearTimeDelayed, setTimeDelayed } from '@/utils/timeout'
import { hasAttribute, removeAttribute, setAttribute, toggleAttribute } from '@/utils/attributes'
import { getDocument, getDocumentBody, getWindow } from '@/constants/window'
import { getBoundingClientRect, querySelectorAll } from '@/utils/element'
import { BodyAttributes } from '@/enums/attributes'
import { addEventListener, preventDefault, removeEventListener, stopImmediatePropagation } from "@/utils/event"
import { mathAbs } from '@/utils/math'
import { BodyEvents } from '@/enums/events'

import './index.scss'

type ModalOpenDetail = {
    event: Event
    anchor?: HTMLElement

    /** Use this if you want to override the `PopoverOpenDetail.anchor` `DOMRect` */
    anchorRect?: DOMRect
    gap?: number
    padding?: number
    important?: boolean
    position?: ModalPosition
    allowHideAnchor?: boolean
    dragable?: boolean
    inputAutoFocus?: boolean

    /**
     * Custom pointer position. Only works if `PopoverOpenDetail.anchor` and
     * `PopoverOpenDetail.anchorRect` set to `undefined`
     * */
    pointer?: {
        x: number
        y: number
    }
}

type ModalCloseDetail = {
    soft?: boolean
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

type ModalProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'style' | 'ref' | 'onClose' | 'onCancel' | 'onKeyDown'> & {
    ref?: (el: HTMLDialogElement) => unknown
    onToggleOpen?: (isOpen: boolean) => unknown
    onKeyDown?: (ev: ComponentEvent<KeyboardEvent, HTMLDialogElement>) => unknown
    onClose?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
    openAnimation?: (el: HTMLDialogElement, done: () => void) => unknown
    closeAnimation?: (el: HTMLDialogElement, done: () => void) => unknown
    style?: JSX.CSSProperties
}
const Modal: ParentComponent<ModalProps> = ($props) => {
    const $$props = mergeProps({id: createUniqueId()}, $props)
    const [props, other] = splitProps($$props, [
        _ref, _onToggleOpen, _onClose, _onCancel,
        _children, _onKeyDown, _class, _openAnimation,
        _closeAnimation, _style
    ])
    const [isDragging, setIsDragging] = createSignal<boolean>(false)
    const [isDragable, setIsDragable] = createSignal<boolean>(false)
    const [left, setLeft] = createSignal<number>(0)
    const [top, setTop] = createSignal<number>(0)
    const [maxWidth, setMaxWidth] = createSignal<number | undefined>(undefined)
    const [maxHeight, setMaxHeight] = createSignal<number | undefined>(undefined)
    const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
    const [attr_open, setAttr_open] = createSignal<boolean>(false)
    const [attr_openDone, setAttr_openDone] = createSignal<boolean>(false)
    const [attr_focus, setAttr_focus] = createSignal<boolean>(false)
    let $pointer: {x: number; y: number} = { x: 0, y: 0 }
    let isOpen: boolean = false
    let modal_ref: HTMLDialogElement
    let focusTimeoutId: number | null = null
    let anchor_ref: HTMLElement | null = null
    let $important: boolean = false
    let $gap: number = 0
    let $padding: number = 0
    let $position: ModalPosition = ModalPosition[_centerBottom]

    // different of mouse position to top-left of modal position `diffPosition = abs(mousePosition - targetPosition)`
    let diffPositionX: number = 0
    let diffPositionY: number = 0

    function fixPosition(): void {
        const popoverRect = getBoundingClientRect(modal_ref)
        const screen = {
            width: getDocument()[_body][_clientWidth],
            height: getWindow()[_innerHeight]
        }
        if (popoverRect[_left  ] < 8) setLeft(8)
        if (popoverRect[_top   ] < 8) setTop(8)
        if (popoverRect[_right ] > screen[_width ]) setLeft(screen[_width ] - popoverRect[_width ] - 8)
        if (popoverRect[_bottom] > screen[_height]) setTop(screen[_height] - popoverRect[_height] - 8)
    }

    function changePosition(x: number, y: number) {
        setLeft(x - diffPositionX)
        setTop(y - diffPositionY)
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
            pointer: anchorRect? undefined : $pointer,
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

        let anchorCenterLeft = $pointer.x
        let anchorCenterTop = $pointer.y

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

        setAttr_open(false)
        setAttr_openDone(false)
        anchor_ref = null
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeModal], {detail: {element: modal_ref}}))
        if (props[_closeAnimation] != undefined) props[_closeAnimation](modal_ref, () => modal_ref[_close]())
        else modal_ref[_animate](
            { transform: `translate(${translate[_left]}px, ${translate[_top]}px)` },
            { duration: 300, easing: AnimationEffectTiming[_springBounce] }
        )[_finished][_then](() => modal_ref[_close]())
    }

    function shortFocusModal(): void {
        if (focusTimeoutId != null) clearTimeDelayed(focusTimeoutId)
        setAttr_focus(true)

        focusTimeoutId = setTimeDelayed(() => {
            setAttr_focus(false)
            focusTimeoutId = null
        }, 1000)
    }

    function openModal(detail: ModalOpenDetail): void {
        if (isOpen) return;
        if (props[_onToggleOpen]) props[_onToggleOpen](true)

        const MODAL_MARGIN = 8
        const {
            event,
            pointer,
            anchorRect,
            allowHideAnchor = true,
            anchor = null,
            dragable = false,
            gap = 0,
            important = false,
            padding = 0,
            position = ModalPosition[_centerBottom],
            inputAutoFocus = false
        } = detail;

        setAllowHideAnchor(allowHideAnchor)
        isOpen = true
        anchor_ref = anchor
        $position = position
        $gap = gap
        $padding = padding
        $important = important

        // handle drag
        if (isDragable() && !dragable) removeDragListener()
        else if (!isDragable() && dragable) addDragListener()
        setIsDragable(dragable)

        modal_ref[_showModal]()

        // input auto focus
        if (!inputAutoFocus) modal_ref[_focus]()

        const modalRect: DOMRect = getBoundingClientRect(modal_ref)
        const $anchorRect: DOMRect | undefined = anchorRect != undefined? anchorRect : anchor? getBoundingClientRect(anchor) : undefined
        const $event = (event as TouchEvent)[_touches]? (event as TouchEvent)[_touches][0] : (event as MouseEvent)
        $pointer = pointer != undefined? pointer : {
            x: $event[_clientX] ?? 0,
            y: $event[_clientY] ?? 0
        }
        let pos = getFlyoutPosition({
            flyout: modalRect,
            anchor: $anchorRect,
            gap,
            pointer: $anchorRect? undefined : $pointer,
            padding,
            position
        })

        if (!allowHideAnchor && anchor != null) {
            const modalPos = {
                ...pos,
                bottom: pos[_top] + modalRect[_height],
                right: pos[_left] + modalRect[_width]
            }
            const anchorMidPosition = {
                x: $anchorRect![_left] + ($anchorRect![_width] / 2),
                y: $anchorRect![_top] + ($anchorRect![_height] / 2),
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

            if (rangeX > rangeY){
                // left side
                if (isLeftSide && modalPos[_right] > $anchorRect![_left]) {
                    setMaxWidth($anchorRect![_left] - MODAL_MARGIN - gap)
                    setMaxHeight(undefined)
                }

                // right side
                else if (isRightSide && modalPos[_left] < $anchorRect![_right]) {
                    setMaxWidth((getDocument()[_body][_clientWidth] - $anchorRect![_right]) - MODAL_MARGIN - gap)
                    setMaxHeight(undefined)
                }
            }
            else {
                // top side
                if (isTopSide && modalPos[_bottom] > $anchorRect![_top]) {
                    setMaxHeight($anchorRect![_top] - MODAL_MARGIN - gap)
                    setMaxWidth(undefined)
                }

                // bottom side
                else if (isBottomSide && modalPos[_top] < $anchorRect![_bottom]) {
                    setMaxHeight((getWindow()[_innerHeight] - $anchorRect![_bottom]) - MODAL_MARGIN - gap)
                    setMaxWidth(undefined)
                }
            }

            pos = getFlyoutPosition({
                flyout: getBoundingClientRect(modal_ref),
                anchor: $anchorRect,
                gap,
                pointer: $anchorRect? undefined : $pointer,
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

        let anchorCenterLeft = $pointer.x
        let anchorCenterTop = $pointer.y

        if ($anchorRect) {
            anchorCenterLeft = $anchorRect[_left] + ($anchorRect[_width] / 2)
            anchorCenterTop = $anchorRect[_top] + ($anchorRect[_height] / 2)
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

        setTop(pos[_top])
        setLeft(pos[_left])
        setAttr_open(true)
        if (props[_openAnimation] != undefined) props[_openAnimation](modal_ref, () => setAttr_openDone(true))
        else modal_ref[_animate](
            { transform: [`translate(${translate[_left]}px, ${translate[_top]}px)`, _none] },
            { duration: 300, easing: AnimationEffectTiming[_springBounce] }
        )[_finished][_then](() => setAttr_openDone(true))

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
            if (modalRect[_left  ] < 8) setLeft(8)
            if (modalRect[_top   ] < 8) setTop(8)
            if (modalRect[_right ] > screen[_width ]) setLeft(screen[_width ] - modalRect[_width ] - 8)
            if (modalRect[_bottom] > screen[_height]) setTop(screen[_height] - modalRect[_height] - 8)
            return
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

        if (!allowHideAnchor()) {
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

            if (rangeX > rangeY){
                // left side
                if (isLeftSide && modalPos[_right] > anchorRect![_left]) {
                    setMaxWidth(anchorRect![_left] - MODAL_MARGIN - $gap)
                    setMaxHeight(undefined)
                }

                // right side
                else if (isRightSide && modalPos[_left] < anchorRect![_right]) {
                    setMaxWidth((getDocument()[_body][_clientWidth] - anchorRect![_right]) - MODAL_MARGIN - $gap)
                    setMaxHeight(undefined)
                }
            }
            else {
                // top side
                if (isTopSide && modalPos[_bottom] > anchorRect![_top]) {
                    setMaxHeight(anchorRect![_top] - MODAL_MARGIN - $gap)
                    setMaxWidth(undefined)
                }

                // bottom side
                else if (isBottomSide && modalPos[_top] < anchorRect![_bottom]) {
                    setMaxHeight((getWindow()[_innerHeight] - anchorRect![_bottom]) - MODAL_MARGIN - $gap)
                    setMaxWidth(undefined)
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

        setTop(pos[_top])
        setLeft(pos[_left])
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
        style={{
            ...props[_style],
            top: props[_style] && props[_style][_top] != undefined? props[_style][_top] : top() + _px,
            left: props[_style] && props[_style][_left] != undefined? props[_style][_left] : left() + _px,
            "max-width": !allowHideAnchor()
                ? maxWidth() != undefined
                    ? maxWidth() + _px
                    : props[_style]? props[_style][_max_width] : undefined
                : props[_style]? props[_style][_max_width] : undefined,
            "max-height": !allowHideAnchor()
                ? maxHeight() != undefined
                    ? maxHeight() + _px
                    : props[_style]? props[_style][_max_height] : undefined
                : props[_style]? props[_style][_max_height] : undefined,
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
        data-drag={toggleAttribute(isDragging())}
        data-focus={toggleAttribute(attr_focus())}
        data-open={toggleAttribute(attr_open())}
        data-open-done={toggleAttribute(attr_openDone())}
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
    ModalEvents,
    ModalPosition
}
export type {
    ModalProps,
    ModalOpenDetail,
    ModalCloseDetail
}
export default Modal