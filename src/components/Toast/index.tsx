import { type JSX, type ParentComponent, splitProps, children, onMount, onCleanup } from "solid-js"

import { _dispatchEvent, _onOpen, _onClose, _leading, _trailing, _children, _header, _actions, _classList, _ref, _onToggleOpen, _move, _open, _hidePopover, _centerCenterTop, _showPopover, _auto, _leftTop, _leftBottom, _centerTop, _centerBottom, _rightTop, _rightBottom, _left, _top, _right, _bottom, _transform, _detail, _includes } from "@/data/string"
import { removeAttribute, setAttribute, toggleAttribute } from "@/utils/attributes"
import { addEventListener, removeEventListener } from "@/utils/event"
import { clearTimeDelayed, setTimeDelayed, timeout } from "@/utils/timeout"
import { setStyleProperty } from "@/utils/element"

import List from "@/components/List"
import Popover, { type PopoverProps } from "@/components/Popover"
import './index.scss'

const
    _12px = '12px',
    _min12px = '-12px',
    _8px = '8px',
    _50persen = '50%', 
    _min50persen = '-50%', 
    _0 = '0'
;

enum ToastPosition {
    leftTop, 
    centerTop,
    rightTop, 
    leftBottom, 
    centerBottom, 
    rightBottom
}

type ToastOpenDetail = {
    autoClose?: boolean
    duration?: number
    position?: ToastPosition
}

enum ToastEvents {
    onOpen = 'on-open-toast', 
    onClose = 'on-close-toast'
}

enum ToastAttributes {
    open = 'data-open', 
    move = 'data-move',
}

function openToast(toast: HTMLDivElement, options?: ToastOpenDetail): void {
    toast[_dispatchEvent](new CustomEvent(ToastEvents[_onOpen], {detail: {...options}}))
}

function closeToast(toast: HTMLDivElement): void {
    toast[_dispatchEvent](new CustomEvent(ToastEvents[_onClose]))
}

type ToastProps = PopoverProps & {
    header?: JSX.Element
    actions?: JSX.Element
    leading?: JSX.Element
    trailing?: JSX.Element
}
const Toast: ParentComponent<ToastProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _leading, _trailing, _children,
        _header, _actions, _classList, 
        _ref, _onToggleOpen
    ])
    const actionsComponent = children(() => props[_actions])
    let toast_ref: HTMLDivElement
    let isOpen = false
    let gPosition: ToastPosition = ToastPosition[_centerTop]
    let timeoutId: number | null = null

    async function closeToast(): Promise<void> {
        if (!isOpen) return;
        isOpen = false

        if (timeoutId != null) {
            clearTimeDelayed(timeoutId)
            timeoutId = null
        }

        const isCenter = gPosition == ToastPosition[_centerTop] || gPosition == ToastPosition[_centerBottom]
        const isTop = ([
            ToastPosition[_leftTop], 
            ToastPosition[_centerTop], 
            ToastPosition[_rightTop]
        ][_includes](gPosition))

        setStyleProperty(toast_ref, _transform, `translate(${isCenter? _min50persen : '0'}, ${isTop? _min12px : _12px})`)
        removeAttribute(toast_ref, ToastAttributes[_move])
        await timeout(5E2)
        removeAttribute(toast_ref, ToastAttributes[_open])
        toast_ref[_hidePopover]()
    }

    async function openToast(options: ToastOpenDetail): Promise<void> {
        if (isOpen) {
            await closeToast()
        }
        isOpen = true

        const { 
            position = ToastPosition[_centerTop],
            autoClose = true, 
            duration = 5E3
        } = options;

        gPosition = position
        toast_ref[_showPopover]()

        let left: string = _auto
        let top: string = _auto
        let right: string = _auto
        let bottom: string = _auto
        let transform: string | null = null
        let transformAfter: string | null = null
        const translate = (left: string, top: string) => `translate(${left}, ${top})`
        if (position == ToastPosition[_leftTop]){
            top = _8px
            left = _8px
            transform = translate(_0, _min12px)
        }
        else if (position == ToastPosition[_leftBottom]){
            bottom = _8px
            left = _8px
            transform = translate(_0, _12px)
        }
        else if (position == ToastPosition[_centerTop]){
            top = _8px
            left = _50persen
            transform = translate(_min50persen, _min12px)
            transformAfter = translate(_min50persen, _0)
        }
        else if (position == ToastPosition[_centerBottom]){
            bottom = _8px
            left = _50persen
            transform = translate(_min50persen, _12px)
            transformAfter = translate(_min50persen, _0)
        }
        else if (position == ToastPosition[_rightTop]){
            right = _8px
            top = _8px
            transform = translate(_0, _min12px)
        }
        else if (position == ToastPosition[_rightBottom]){
            bottom = _8px
            right = _8px
            transform = translate(_0, _12px)
        }

        setStyleProperty(toast_ref, _left, left)
        setStyleProperty(toast_ref, _top, top)
        setStyleProperty(toast_ref, _right, right)
        setStyleProperty(toast_ref, _bottom, bottom)
        setStyleProperty(toast_ref, _transform, transform)

        setTimeDelayed(async () => {
            setAttribute(toast_ref, ToastAttributes[_open], '')
            await timeout(20)
            setAttribute(toast_ref, ToastAttributes[_move], '')
            setStyleProperty(toast_ref, _transform, transformAfter)
        })

        if (!autoClose) return;

        timeoutId = setTimeDelayed(() => {
            closeToast()
            timeoutId = null
        }, duration)
    }

    function customOnOpen(ev: CustomEvent): void {
        openToast(ev[_detail] as ToastOpenDetail)
    }

    function customOnClose(_ev: CustomEvent): void {
        closeToast()
    }

    function initCustomEvent(): void {
        addEventListener<CustomEvent>(toast_ref, ToastEvents[_onOpen], customOnOpen)
        addEventListener<CustomEvent>(toast_ref, ToastEvents[_onClose], customOnClose)
        
        onCleanup(() => {
            removeEventListener<CustomEvent>(toast_ref, ToastEvents[_onOpen], customOnOpen)
            removeEventListener<CustomEvent>(toast_ref, ToastEvents[_onClose], customOnClose)
        })
    }

    onMount(() => {
        initCustomEvent()
    })

    return (<Popover
        onToggleOpen={o => {
            isOpen = o
            if (props[_onToggleOpen]) props[_onToggleOpen](o)
        }}
        ref={r => {
            toast_ref = r
            if (props[_ref]) props[_ref](r)
        }}
        classList={{
            toast: true,
            ...props[_classList]
        }}
        data-actions={toggleAttribute(actionsComponent())}
        {...other}>
        <List
            leading={props[_leading]}
            trailing={props[_trailing]}
            subtitle={props[_children]}>
            { props[_header] }
        </List>
        <div class="toast-actions">
            { actionsComponent() }
        </div>
    </Popover>)
}

export {
    Toast,
    openToast, 
    closeToast, 
    ToastPosition
}
export type {
    ToastProps, 
    ToastEvents,
    ToastAttributes
}
export default Toast