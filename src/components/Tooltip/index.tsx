import { mergeProps, onMount, type ParentComponent, onCleanup, createUniqueId, children, splitProps, createEffect } from "solid-js"

import { getAttribute, hasAttribute, removeAttribute, setAttribute } from "@/utils/attributes"
import { addEventListener, removeEventListener, stopPropagation } from "@/utils/event"
import { getBoundingClientRect, getElementById, setStyleProperty } from "@/utils/element"
import { clearTimeDelayed, setTimeDelayed, timeout } from "@/utils/timeout"
import { getPopoverPosition } from "@/utils/popover"
import { _shortcuts, _text, _class, _join, _map, _CENTER_TOP, _anchor, _anchorId, _appendChild, _body, _bottom, _children, _clientX, _clientY, _createElement, _currentTarget, _delayDuration, _height, _hidePopover, _id, _innerHTML, _isFollowingPointer, _left, _mousedown, _mouseleave, _mouseover, _move, _open, _popover, _position, _px, _right, _showPopover, _timeoutId, _top, _touchcancel, _touchend, _touches, _touchstart, _transform, _trim, _width, _manual, _hasTooltip, _mousemove, _touchmove } from "@/data/string"
import { getDocument, getDocumentBody } from "@/data/window"
import { numberParse } from "@/utils/math"
import { PopoverPosition } from "@/enums/position"

import './index.scss'

type TooltipProps = {
    text: string
    isFollowingPointer?: boolean
    delayDuration?: number
    position?: PopoverPosition
    class?: string
    anchor: HTMLElement | null
}

type KeyboardShortcutTooltipProps = {
    isFollowingPointer?: boolean
    delayDuration?: number
    position?: PopoverPosition
    class?: string
    shortcuts: string[]
    text?: string
    anchor: HTMLElement
}

enum TooltipAttributes {
    timeoutId = 'data-timeout-id',
    open = 'data-open',
    anchorId = 'data-anchor-id',
    move = 'data-move',
    position = 'data-position'
}

enum TooltipAnchorAttributes {
    hasTooltip = 'data-has-tooltip'
}

export const KeyboardShortcutTooltip: ParentComponent<KeyboardShortcutTooltipProps> = ($props) => {
    const [props, other] = splitProps($props, [_shortcuts, _text, _class])
    return (<Tooltip
        class={["tooltip-keyboard-shortcuts" + (props[_text]? '' : '-only'), props[_class]][_join](' ')}
        text={(
            props[_text]? ('<span>' + props[_text] + '</span>') : '') +
            props[_shortcuts][_map](s => '<kbd>' + s + '</kbd>')[_join]('')
        }
        {...other}
    />)
}

const Tooltip: ParentComponent<TooltipProps> = ($props) => {
    const id = 'tooltip'
    const props = mergeProps({
        delayDuration: 5E2,
        position: PopoverPosition[_CENTER_TOP],
        isFollowingPointer: true
    }, $props)
    let pointer: {x: number; y: number} = {x: 0, y: 0}
    let tooltip!: HTMLDivElement
    let anchor: HTMLElement | undefined
    let isEventInitiated: boolean = false

    function clearTimeout(): void {
        const timeoutId = getAttribute(tooltip, TooltipAttributes[_timeoutId])
        if (timeoutId != null) clearTimeDelayed(timeoutId[_trim]() == ''? undefined : numberParse(timeoutId, true))
        removeAttribute(tooltip, TooltipAttributes[_timeoutId])
    }

    function isOpen(): boolean {
        return hasAttribute(tooltip, TooltipAttributes[_open])
    }

    async function hide(immediate?: boolean): Promise<void> {
        clearTimeout()

        const animate = () => {
            if (props[_isFollowingPointer]) return

            const anchorId = getAttribute(tooltip, TooltipAttributes[_anchorId])
            if (!anchorId) return

            const anchor = getElementById(anchorId)
            if (!anchor) return

            const tooltipRect = getBoundingClientRect(tooltip)
            const anchorRect = getBoundingClientRect(anchor)
            const pos = getPopoverPosition({
                popover: tooltipRect,
                anchor: anchorRect,
                gap: 16,
                position: props[_position],
            })
            const tooltipPosition = {
                ...pos,
                bottom: pos[_top] + tooltipRect[_height],
                right: pos[_left] + tooltipRect[_width]
            }
            const translate = {
                left: 0,
                top: 0
            }

            const anchorCenterLeft = anchorRect[_left] + (anchorRect[_width] / 2)
            const anchorCenterTop = anchorRect[_top] + (anchorRect[_height] / 2)

            if (tooltipPosition[_left]   > anchorCenterLeft) translate[_left] = -12
            if (tooltipPosition[_top]    > anchorCenterTop ) translate[_top]  = -12
            if (tooltipPosition[_right]  < anchorCenterLeft) translate[_left] = 12
            if (tooltipPosition[_bottom] < anchorCenterTop ) translate[_top]  = 12

            setStyleProperty(tooltip, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)
        }

        if (immediate == true) {
            animate()
            removeAttribute(tooltip, TooltipAttributes[_move])
            await timeout(5E2)
            removeAttribute(tooltip, TooltipAttributes[_open])
            tooltip[_hidePopover]()
            return
        }

        const t = setTimeDelayed(async () => {
            clearTimeout()
            animate()
            removeAttribute(tooltip, TooltipAttributes[_move])
            await timeout(5E2)
            removeAttribute(tooltip, TooltipAttributes[_open])
            tooltip[_hidePopover]()
        }, 5E2)
        setAttribute(tooltip, TooltipAttributes[_timeoutId], `${t}`)
    }

    async function show(ev: Event): Promise<void> {
        const anchor = ev[_currentTarget] as Element
        pointer = {
            x: (ev as MouseEvent)[_clientX] ?? (ev as TouchEvent)[_touches][0][_clientX] ?? 0,
            y: (ev as MouseEvent)[_clientY] ?? (ev as TouchEvent)[_touches][0][_clientY] ?? 0
        }
        stopPropagation(ev)

        if (isOpen() && getAttribute(tooltip, TooltipAttributes[_anchorId]) == anchor[_id]) return;

        clearTimeout()
        const t = setTimeDelayed(async () => {
            if (isOpen()) await hide(true)
            tooltip[_showPopover]()

            // set to (0, 0) to calculate new text size
            setStyleProperty(tooltip, _top, '0')
            setStyleProperty(tooltip, _left, '0')

            tooltip[_innerHTML] = props[_text]
            setAttribute(tooltip, _class, props[_class])
            if (!props[_isFollowingPointer]) setAttribute(tooltip, TooltipAttributes[_position], `${props[_position]}`)
            else removeAttribute(tooltip, TooltipAttributes[_position])

            const tooltipRect = getBoundingClientRect(tooltip)
            const anchorRect = getBoundingClientRect(anchor)
            const pos = getPopoverPosition({
                popover: tooltipRect,
                anchor: anchorRect,
                gap: 40,
                position: props[_position],
                pointer: props[_isFollowingPointer]? pointer : undefined
            })
            const tooltipPosition = {
                ...pos,
                bottom: pos[_top] + tooltipRect[_height],
                right: pos[_left] + tooltipRect[_width]
            }
            const translate = {
                left: 0,
                top: 0
            }

            setAttribute(tooltip, TooltipAttributes[_anchorId], anchor[_id])

            let anchorCenterLeft = pointer.x
            let anchorCenterTop = pointer.y

            if (!props.isFollowingPointer) {
                anchorCenterLeft = anchorRect[_left] + (anchorRect[_width] / 2)
                anchorCenterTop = anchorRect[_top] + (anchorRect[_height] / 2)
            }

            if (tooltipPosition[_left]   > anchorCenterLeft) translate[_left] = -12
            if (tooltipPosition[_top]    > anchorCenterTop ) translate[_top]  = -12
            if (tooltipPosition[_right]  < anchorCenterLeft) translate[_left] = 12
            if (tooltipPosition[_bottom] < anchorCenterTop ) translate[_top]  = 12

            setStyleProperty(tooltip, _top, pos[_top] + _px)
            setStyleProperty(tooltip, _left, pos[_left] + _px)
            setStyleProperty(tooltip, _transform, `translate(${translate[_left]}px, ${translate[_top]}px)`)

            setTimeDelayed(async () => {
                setAttribute(tooltip, TooltipAttributes[_open], '')
                await timeout(20)
                setAttribute(tooltip, TooltipAttributes[_move], '')
                setStyleProperty(tooltip, _transform, 'translate(0, 0)')
            })
        }, props[_delayDuration])

        setAttribute(tooltip, TooltipAttributes[_timeoutId], `${t}`)
    }

    onMount(async () => {
        if (!getElementById(id)){
            const tooltipEl = getDocument()[_createElement]('div')
            tooltipEl[_id] = id
            tooltipEl[_popover] = _manual
            getDocumentBody()[_appendChild](tooltipEl)
            tooltip = tooltipEl
            return
        }

        tooltip = getElementById(id)! as HTMLDivElement
    })

    createEffect((): unknown => {
        if (props[_anchor] == null || isEventInitiated) return;
        anchor = props[_anchor] as HTMLElement
        isEventInitiated = true

        if (anchor[_id][_trim]() == '') anchor[_id] = createUniqueId()

        if (hasAttribute(anchor, TooltipAnchorAttributes[_hasTooltip])) return;
        setAttribute(anchor, TooltipAnchorAttributes[_hasTooltip])

        addEventListener(anchor, _mouseover, ev => show(ev))
        addEventListener(anchor, _mouseleave, () => hide())
        addEventListener(anchor, _mousedown, () => hide())
        addEventListener(anchor, _mousemove, (ev) => pointer = {x: (ev as MouseEvent)[_clientX], y: (ev as MouseEvent)[_clientY]})
        addEventListener(anchor, _touchstart, ev => show(ev), {passive: true})
        addEventListener(anchor, _touchend, () => hide())
        addEventListener(anchor, _touchcancel, () => hide())
    })

    onCleanup(() => {
        if (!anchor || !(anchor instanceof HTMLElement)) return
        removeEventListener(anchor, _mouseover, ev => show(ev))
        removeEventListener(anchor, _mouseleave, () => hide())
        removeEventListener(anchor, _mousedown, () => hide())
        removeEventListener(anchor, _mousemove, (ev) => pointer = {x: (ev as MouseEvent)[_clientX], y: (ev as MouseEvent)[_clientY]})
        removeEventListener(anchor, _touchstart, ev => show(ev), {passive: true})
        removeEventListener(anchor, _touchend, () => hide())
        removeEventListener(anchor, _touchcancel, () => hide())
    })

    return (<>
        { props[_children] }
    </>)
}

export default Tooltip