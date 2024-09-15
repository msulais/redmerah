import { type JSX, type ParentComponent, splitProps, children, onMount, onCleanup } from "solid-js"

import { _dispatchEvent, _onOpen, _onClose, _leading, _trailing, _children, _header, _actions, _classList, _ref, _onToggleOpen, _centerTop, _centerCenterTop, _leftTop, _centerCenterLeftTop, _leftBottom, _centerCenterLeftBottom, _centerBottom, _centerCenterBottom, _rightTop, _centerCenterRightTop, _rightBottom, _centerCenterRightBottom, _detail } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"
import { addEventListener, removeEventListener } from "@/utils/event"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { getDocumentBody } from "@/constants/window"

import List from "@/components/List"
import Popover, { type PopoverProps, closePopover, openPopover, PopoverPosition } from "@/components/Popover"
import './index.scss'

enum ToastPosition {
    leftTop,
    centerTop,
    rightTop,
    leftBottom,
    centerBottom,
    rightBottom
}

type ToastOpenDetail = {
    event: Event
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

function openToast(event: Event, toast: HTMLDivElement, options?: Omit<ToastOpenDetail, 'event'>): void {
    toast[_dispatchEvent](new CustomEvent(
        ToastEvents[_onOpen],
        {detail: {event, ...options} satisfies ToastOpenDetail}
    ))
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
    let timeoutId: number | null = null

    async function closeToast(): Promise<void> {
        if (!isOpen) return;
        if (timeoutId != null) {
            clearTimeDelayed(timeoutId)
            timeoutId = null
        }
        closePopover(toast_ref)
    }

    async function openToast(options: ToastOpenDetail): Promise<void> {
        if (isOpen) return

        const {
            event,
            position = ToastPosition[_centerTop],
            autoClose = true,
            duration = 5E3
        } = options;

        let $position = PopoverPosition[_centerCenterTop]
        if (position == ToastPosition[_leftTop]) $position = PopoverPosition[_centerCenterLeftTop]
        else if (position == ToastPosition[_leftBottom]) $position = PopoverPosition[_centerCenterLeftBottom]
        else if (position == ToastPosition[_centerTop]) $position = PopoverPosition[_centerCenterTop]
        else if (position == ToastPosition[_centerBottom]) $position = PopoverPosition[_centerCenterBottom]
        else if (position == ToastPosition[_rightTop]) $position = PopoverPosition[_centerCenterRightTop]
        else if (position == ToastPosition[_rightBottom]) $position = PopoverPosition[_centerCenterRightBottom]

        openPopover(event, toast_ref, {
            anchor: getDocumentBody(),
            manualDismiss: true,
            position: $position
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