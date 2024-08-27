import { onCleanup, onMount, splitProps, type FlowComponent, type JSX } from "solid-js"

import type { ComponentEvent } from "@/types/event"
import { _textTooltipListener, _centerTop, _createElement, _div, _id, _popover, _manual, _appendChild, _top, _height, _left, _width, _centerBottom, _centerBottomToLeft, _centerBottomToRight, _centerTopToLeft, _centerTopToRight, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _move, _open, _hidePopover, _openTextTooltip, _detail, _isSameNode, _textContent, _showPopover, _px, _transform, _closeTextTooltip, _updatePointerTextTooltip, _pointer, _dispatchEvent, _useAnchor, _gap, _position, _startDelayDuration, _text, _endDelayDuration, _clientX, _clientY, _children, _tooltip, _classList, _ref, _usePortal, _tooltipListener, _onMouseLeave, _onMouseDown, _onMouseMove, _onTouchCancel, _onTouchEnd, _bottom, _right, _contains } from "@/data/string"
import { hasAttribute, removeAttribute, setAttribute } from "@/utils/attributes"
import { addEventListener, stopPropagation } from "@/utils/event"
import { getBoundingClientRect, setStyleProperty } from "@/utils/element"
import { clearTimeDelayed, setTimeDelayed, timeout } from "@/utils/timeout"
import { getDocument, getDocumentBody } from "@/data/window"
import { FlyoutPosition } from "@/enums/position"
import { getFlyoutPosition } from "@/utils/flyout"
import { mathAbs } from "@/utils/math"
import { BodyAttributes, PopoverAttributes } from "@/enums/attributes"
import { BodyEvents } from "@/enums/events"

import { Popover, type PopoverProps } from "@/components/Popover"
import './index.scss'

enum TooltipAttributes {
    open = 'data-open',
    move = 'data-move',
}

const TEXT_TOOLTIP_ID = 'text-tooltip'

type TooltipOpenDetail = {
    anchor: HTMLDivElement
    tooltip?: HTMLDivElement
    text?: string
    useAnchor?: boolean
    position?: FlyoutPosition
    gap?: number
    startDelayDuration?: number
}

type TooltipCloseDetail = {
    endDelayDuration?: number
    tooltip?: HTMLDivElement
}

function initTooltip(): void {
    if (hasAttribute(getDocumentBody(), BodyAttributes[_tooltipListener])) return;
    setAttribute(getDocumentBody(), BodyAttributes[_tooltipListener])

    let $anchor_ref: HTMLDivElement | null = null
    let $pointer = {x: 0, y: 0}
    let $position: FlyoutPosition = FlyoutPosition[_centerTop]
    let $gap: number = 40
    let $useAnchor: boolean = false
    let textTooltip_ref: HTMLDivElement
    let richTooltip_ref: HTMLDivElement | undefined
    let isOpen = false
    let timeoutId: number | null = null

    function createTextTooltip(): void {
        const div = getDocument()[_createElement](_div)
        div[_id] = TEXT_TOOLTIP_ID
        div[_popover] = _manual
        getDocumentBody()[_appendChild](div)

        textTooltip_ref = div
    }

    async function closeTooltip(tooltip?: HTMLDivElement): Promise<void> {
        let anchorRect: DOMRect | undefined = $useAnchor? getBoundingClientRect($anchor_ref!) : undefined
        if ($useAnchor) {
            let left = 0, top = 0, right = 0, bottom = 0
            let isInitiate = false
            for (const child of $anchor_ref![_children]) {
                if (child[_classList][_contains]('rich-tooltip')) continue;
                
                const rect = getBoundingClientRect(child)
                if (!isInitiate) {
                    left = rect[_left]
                    top = rect[_top]
                    right = rect[_right]
                    bottom = rect[_bottom]
                    isInitiate = true
                }
                
                if (rect[_left] < left) left = rect[_left]
                if (rect[_top] < top) top = rect[_top]
                if (rect[_right] > right) right = rect[_right]
                if (rect[_bottom] > bottom) bottom = rect[_bottom]
            }

            const $anchorRect = { 
                width: right - left, 
                height: bottom - top, 
                bottom, left, right, top, 
                x: left, y: top 
            }

            anchorRect = $anchorRect as DOMRect
        }
        const tooltipRect = getBoundingClientRect(tooltip ?? textTooltip_ref)
        const pos = getFlyoutPosition({
            flyout: tooltipRect,
            anchor: $useAnchor? anchorRect : undefined,
            gap: $gap,
            pointer: $useAnchor? undefined : $pointer,
            position: $position
        })

        const tooltipPos = {
            ...pos,
            bottom: pos[_top] + tooltipRect[_height],
            right: pos[_left] + tooltipRect[_width]
        }
        const tooltipMidPos = {
            x: tooltipPos[_left] + (tooltipRect[_width] / 2),
            y: tooltipPos[_top] + (tooltipRect[_height] / 2),
        }
        const translate = {
            left: 0,
            top: 0
        }

        let anchorCenterLeft = $pointer.x
        let anchorCenterTop = $pointer.y

        if ($useAnchor) {
            anchorCenterLeft = anchorRect![_left] + (anchorRect![_width] / 2)
            anchorCenterTop = anchorRect![_top] + (anchorRect![_height] / 2)
        }

        const rangeX = mathAbs(tooltipMidPos.x - anchorCenterLeft)
        const rangeY = mathAbs(tooltipMidPos.y - anchorCenterTop)

        if (rangeX > rangeY) {
            if ((tooltipMidPos.x < anchorCenterTop || tooltipMidPos.x > anchorCenterTop) && (
                $position == FlyoutPosition[_centerBottom]
                || $position == FlyoutPosition[_centerBottomToLeft]
                || $position == FlyoutPosition[_centerBottomToRight]
                || $position == FlyoutPosition[_centerTop]
                || $position == FlyoutPosition[_centerTopToLeft]
                || $position == FlyoutPosition[_centerTopToRight]
            )) {
                if (tooltipMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (tooltipMidPos.y < anchorCenterTop ) translate[_top]  = 12
            } else {
                if (tooltipMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (tooltipMidPos.x < anchorCenterLeft) translate[_left] = 12
            }
        } else {
            if ((tooltipMidPos.y < anchorCenterLeft || tooltipMidPos.y > anchorCenterLeft) && (
                $position == FlyoutPosition[_leftCenter]
                || $position == FlyoutPosition[_leftCenterToBottom]
                || $position == FlyoutPosition[_leftCenterToTop]
                || $position == FlyoutPosition[_rightCenter]
                || $position == FlyoutPosition[_rightCenterToBottom]
                || $position == FlyoutPosition[_rightCenterToTop]
            )) {
                if (tooltipMidPos.x > anchorCenterLeft) translate[_left] = -12
                if (tooltipMidPos.x < anchorCenterLeft) translate[_left] = 12
            } else {
                if (tooltipMidPos.y > anchorCenterTop ) translate[_top]  = -12
                if (tooltipMidPos.y < anchorCenterTop ) translate[_top]  = 12
            }
        }

        setStyleProperty(tooltip ?? textTooltip_ref, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)
        removeAttribute(tooltip ?? textTooltip_ref, TooltipAttributes[_move])
        await timeout(5E2)
        removeAttribute(tooltip ?? textTooltip_ref, TooltipAttributes[_open]);
        (tooltip ?? textTooltip_ref)[_hidePopover]()
    }

    function initEvents(): void {
        addEventListener(getDocumentBody(), BodyEvents[_openTextTooltip], ev => {
            const { 
                anchor,
                text = '',
                gap = 40,
                position = FlyoutPosition[_centerTop],
                startDelayDuration = 800,
                useAnchor = false,
                tooltip
            } = ((ev as CustomEvent)[_detail] as TooltipOpenDetail)
            
            if (timeoutId != null) clearTimeDelayed(timeoutId)
            timeoutId = setTimeDelayed(async () => {
                if ($anchor_ref != null && anchor[_isSameNode]($anchor_ref) && isOpen) {
                    timeoutId = null
                    return
                }

                if (isOpen) {
                    if (richTooltip_ref != undefined) await closeTooltip(richTooltip_ref)
                    await closeTooltip()
                }

                $anchor_ref = anchor
                $gap = gap
                $position = position
                $useAnchor = useAnchor
                richTooltip_ref = tooltip

                isOpen = true

                if (tooltip == undefined) {
                    textTooltip_ref[_textContent] = text
                }
                (tooltip ?? textTooltip_ref)[_showPopover]()

                const tooltipRect: DOMRect = getBoundingClientRect(tooltip ?? textTooltip_ref)
                let anchorRect: DOMRect | undefined = useAnchor? getBoundingClientRect(anchor) : undefined
                if ($useAnchor) {
                    let left = 0, top = 0, right = 0, bottom = 0
                    let isInitiate = false
                    for (const child of $anchor_ref![_children]) {
                        if (child[_classList][_contains]('rich-tooltip')) continue;
                        
                        const rect = getBoundingClientRect(child)
                        if (!isInitiate) {
                            left = rect[_left]
                            top = rect[_top]
                            right = rect[_right]
                            bottom = rect[_bottom]
                            isInitiate = true
                        }
                        
                        if (rect[_left] < left) left = rect[_left]
                        if (rect[_top] < top) top = rect[_top]
                        if (rect[_right] > right) right = rect[_right]
                        if (rect[_bottom] > bottom) bottom = rect[_bottom]
                    }
        
                    const $anchorRect = { 
                        width: right - left, 
                        height: bottom - top, 
                        bottom, left, right, top, 
                        x: left, y: top 
                    }

                    anchorRect = $anchorRect as DOMRect
                }
                let pos = getFlyoutPosition({
                    flyout: tooltipRect,
                    anchor: useAnchor? anchorRect : undefined,
                    gap,
                    pointer: useAnchor? undefined : $pointer,
                    position
                })

                const tooltipPos = {
                    ...pos,
                    bottom: pos[_top] + tooltipRect[_height],
                    right: pos[_left] + tooltipRect[_width]
                }
                const tooltipMidPos = {
                    x: tooltipPos[_left] + (tooltipRect[_width] / 2),
                    y: tooltipPos[_top] + (tooltipRect[_height] / 2),
                }
                const translate = {
                    left: 0,
                    top: 0
                }
        
                let anchorCenterLeft =  $pointer.x
                let anchorCenterTop =  $pointer.y
        
                if (useAnchor) {
                    anchorCenterLeft = anchorRect![_left] + (anchorRect![_width] / 2)
                    anchorCenterTop = anchorRect![_top] + (anchorRect![_height] / 2)
                }
        
                const rangeX = mathAbs(tooltipMidPos.x - anchorCenterLeft)
                const rangeY = mathAbs(tooltipMidPos.y - anchorCenterTop)
        
                if (rangeX > rangeY) {
                    if ((tooltipMidPos.x < anchorCenterTop || tooltipMidPos.x > anchorCenterTop) && (
                        position == FlyoutPosition[_centerBottom]
                        || position == FlyoutPosition[_centerBottomToLeft]
                        || position == FlyoutPosition[_centerBottomToRight]
                        || position == FlyoutPosition[_centerTop]
                        || position == FlyoutPosition[_centerTopToLeft]
                        || position == FlyoutPosition[_centerTopToRight]
                    )) {
                        if (tooltipMidPos.y > anchorCenterTop ) translate[_top]  = -12
                        if (tooltipMidPos.y < anchorCenterTop ) translate[_top]  = 12
                    } else {
                        if (tooltipMidPos.x > anchorCenterLeft) translate[_left] = -12
                        if (tooltipMidPos.x < anchorCenterLeft) translate[_left] = 12
                    }
                } else {
                    if ((tooltipMidPos.y < anchorCenterLeft || tooltipMidPos.y > anchorCenterLeft) && (
                        position == FlyoutPosition[_leftCenter]
                        || position == FlyoutPosition[_leftCenterToBottom]
                        || position == FlyoutPosition[_leftCenterToTop]
                        || position == FlyoutPosition[_rightCenter]
                        || position == FlyoutPosition[_rightCenterToBottom]
                        || position == FlyoutPosition[_rightCenterToTop]
                    )) {
                        if (tooltipMidPos.x > anchorCenterLeft) translate[_left] = -12
                        if (tooltipMidPos.x < anchorCenterLeft) translate[_left] = 12
                    } else {
                        if (tooltipMidPos.y > anchorCenterTop ) translate[_top]  = -12
                        if (tooltipMidPos.y < anchorCenterTop ) translate[_top]  = 12
                    }
                }
        
                setStyleProperty(tooltip ?? textTooltip_ref, _top, pos[_top] + _px)
                setStyleProperty(tooltip ?? textTooltip_ref, _left, pos[_left] + _px)
                setStyleProperty(tooltip ?? textTooltip_ref, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)
        
                // This should be run after all inline style applied
                setTimeDelayed(async () => {
                    setAttribute(tooltip ?? textTooltip_ref, PopoverAttributes[_open], '')
                    await timeout(20)
                    setAttribute(tooltip ?? textTooltip_ref, PopoverAttributes[_move], '')
                    setStyleProperty(tooltip ?? textTooltip_ref, _transform, 'translate(0, 0)')
                })

                timeoutId = null
            }, startDelayDuration)
        })

        addEventListener(getDocumentBody(), BodyEvents[_closeTextTooltip], ev => {
            const { endDelayDuration = 1000 } = ((ev as CustomEvent)[_detail] as TooltipCloseDetail)
            
            if (timeoutId != null) clearTimeDelayed(timeoutId)
            timeoutId = setTimeDelayed(async () => {
                if (isOpen) {
                    if (richTooltip_ref != undefined) closeTooltip(richTooltip_ref)
                    closeTooltip()
                }
                richTooltip_ref = undefined
                isOpen = false
                timeoutId = null
            }, endDelayDuration)
        })

        addEventListener(getDocumentBody(), BodyEvents[_updatePointerTextTooltip], ev => {
            const pointer = ((ev as CustomEvent)[_detail][_pointer] as {x: number; y: number})
            $pointer = pointer
        })
    }

    createTextTooltip()
    initEvents()
}

type TextTooltipProps = {
    text: string
    position?: FlyoutPosition
    gap?: number
    startDelayDuration?: number
    endDelayDuration?: number
    useAnchor?: boolean
}
const TextTooltip: FlowComponent<TextTooltipProps> = (props) => {
    let div_ref: HTMLDivElement

    function openTextTooltip(ev?: Event): void {
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_openTextTooltip], {detail: {
            anchor: div_ref, 
            useAnchor: props[_useAnchor],
            gap: props[_gap],
            position: props[_position],
            startDelayDuration: props[_startDelayDuration],
            text: props[_text],
        } satisfies TooltipOpenDetail}))
        if (ev) stopPropagation(ev)
        
    }

    function closeTextTooltip(ev: Event): void {
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeTextTooltip], {detail: {
            endDelayDuration: props[_endDelayDuration]
        } satisfies TooltipCloseDetail}))
        stopPropagation(ev)
    }

    function updatePointer(ev: MouseEvent) {
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_updatePointerTextTooltip], {detail: {
            pointer: {x: (ev as MouseEvent)[_clientX], y: (ev as MouseEvent)[_clientY]}
        }}))
    }

    onMount(() => {
        initTooltip()
    })

    onCleanup(() => {
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeTextTooltip], {detail: {
            endDelayDuration: props[_endDelayDuration]
        } satisfies TooltipCloseDetail}))
    })

    return (<div 
        class="tooltip"
        ref={r => div_ref = r}
        onMouseOver={ev => openTextTooltip(ev)}
        onTouchStart={ev => openTextTooltip(ev)}
        onMouseLeave={ev => closeTextTooltip(ev)}
        onMouseDown={ev => closeTextTooltip(ev)}
        onMouseMove={ev => updatePointer(ev)}
        onTouchEnd={ev => closeTextTooltip(ev)}
        onTouchCancel={ev => closeTextTooltip(ev)}>
        {props[_children]}
    </div>)
}

type RichTooltipProps = Omit<PopoverProps, 'onMouseMove' | 'onMouseLeave' | 'onMouseDown' | 'onTouchEnd' | 'onTouchCancel'> & {
    tooltip: JSX.Element
    position?: FlyoutPosition
    gap?: number
    startDelayDuration?: number
    endDelayDuration?: number
    useAnchor?: boolean
    onMouseMove?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
    onMouseLeave?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
    onMouseDown?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
    onTouchEnd?: (ev: ComponentEvent<TouchEvent, HTMLDivElement>) => unknown
    onTouchCancel?: (ev: ComponentEvent<TouchEvent, HTMLDivElement>) => unknown
}
const RichTooltip: FlowComponent<RichTooltipProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _tooltip, _position, _gap, _startDelayDuration,
        _endDelayDuration, _useAnchor, _children,
        _classList, _ref, _usePortal, _onMouseMove, 
        _onMouseLeave, _onMouseDown, _onTouchEnd,
        _onTouchCancel
    ])
    let div_ref: HTMLDivElement
    let tooltip_ref: HTMLDivElement

    function openRichTooltip(ev: Event): void {
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_openTextTooltip], {detail: {
            anchor: div_ref, 
            useAnchor: props[_useAnchor],
            gap: props[_gap],
            position: props[_position],
            startDelayDuration: props[_startDelayDuration],
            tooltip: tooltip_ref
        } satisfies TooltipOpenDetail}))
        stopPropagation(ev)
    }

    function closeRichTooltip(ev: Event): void {
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeTextTooltip], {detail: {
            endDelayDuration: props[_endDelayDuration],
            tooltip: tooltip_ref
        } satisfies TooltipCloseDetail}))
        stopPropagation(ev)
    }

    function updatePointer(ev: MouseEvent) {
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_updatePointerTextTooltip], {detail: {
            pointer: {x: (ev as MouseEvent)[_clientX], y: (ev as MouseEvent)[_clientY]}
        }}))
    }

    onMount(() => {
        initTooltip()
    })

    onCleanup(() => {
        getDocumentBody()[_dispatchEvent](new CustomEvent(BodyEvents[_closeTextTooltip], {detail: {
            endDelayDuration: props[_endDelayDuration],
            tooltip: tooltip_ref
        } satisfies TooltipCloseDetail}))
    })

    return (<div 
        class="tooltip"
        ref={r => div_ref = r}
        onMouseOver={ev => openRichTooltip(ev)}
        onTouchStart={ev => openRichTooltip(ev)}
        onMouseMove={ev => updatePointer(ev)}
        onMouseLeave={ev => closeRichTooltip(ev)}
        onMouseDown={ev => closeRichTooltip(ev)}
        onTouchEnd={ev => closeRichTooltip(ev)}
        onTouchCancel={ev => closeRichTooltip(ev)}>
        {props[_children]}
        <Popover
            usePortal={props[_usePortal] ?? false} 
            onMouseMove={ev => {
                stopPropagation(ev)
                if (props[_onMouseMove]) props[_onMouseMove](ev)
            }}
            onMouseLeave={ev => {
                stopPropagation(ev)
                if (props[_onMouseLeave]) props[_onMouseLeave](ev)
            }}
            onMouseDown={ev => {
                stopPropagation(ev)
                if (props[_onMouseDown]) props[_onMouseDown](ev)
            }}
            onTouchEnd={ev => {
                stopPropagation(ev)
                if (props[_onTouchEnd]) props[_onTouchEnd](ev)
            }}
            onTouchCancel={ev => {
                stopPropagation(ev)
                if (props[_onTouchCancel]) props[_onTouchCancel](ev)
            }}
            ref={r => {
                tooltip_ref = r
                if (props[_ref]) props[_ref](r)
            }}
            classList={{
                'rich-tooltip': true, 
                ...props[_classList]
            }}
            {...other}>
            {props[_tooltip]}
        </Popover>
    </div>)
}

export {
    TooltipAttributes,
    TEXT_TOOLTIP_ID,
    TextTooltip,
    RichTooltip
}
export type {
    TextTooltipProps,
    TooltipOpenDetail,
    TooltipCloseDetail,
    RichTooltipProps
}
export default TextTooltip