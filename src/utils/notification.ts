import { PopoverPosition } from "@/enums/position"
import { getAttribute, hasAttribute, removeAttribute, setAttribute } from "./attributes"
import { setStyleProperty } from "./element"
import { clearTimeDelayed, setTimeDelayed, timeout } from "./timeout"
import { _CENTER_CENTER, _CENTER_CENTER_BOTTOM, _CENTER_CENTER_LEFT, _CENTER_CENTER_LEFT_BOTTOM, _CENTER_CENTER_LEFT_TOP, _CENTER_CENTER_RIGHT, _CENTER_CENTER_RIGHT_BOTTOM, _CENTER_CENTER_RIGHT_TOP, _CENTER_CENTER_TOP, _auto, _bottom, _hidePopover, _left, _move, _open, _right, _showPopover, _timeoutId, _top, _transform, _trim } from "@/data/string"
import { numberParse } from "./math"

enum NotificationBarAttributes {
    timeoutId = 'data-timeout-id', 
    open = 'data-open', 
    move = 'data-move',
}

type NotificationOptions = {
    notificationBar: HTMLDivElement
    autoClose?: boolean

    /**
     * `duration` in millisecond
     */
    duration?: number
    position?: 
        PopoverPosition.CENTER_CENTER_LEFT_TOP    |
        PopoverPosition.CENTER_CENTER_LEFT        |
        PopoverPosition.CENTER_CENTER_LEFT_BOTTOM |
        PopoverPosition.CENTER_CENTER_TOP         |
        PopoverPosition.CENTER_CENTER             |
        PopoverPosition.CENTER_CENTER_BOTTOM      |
        PopoverPosition.CENTER_CENTER_RIGHT_TOP   |
        PopoverPosition.CENTER_CENTER_RIGHT       |
        PopoverPosition.CENTER_CENTER_RIGHT_BOTTOM
}

export function isNotificationOpen(notificationBar: HTMLDivElement): boolean {
    return hasAttribute(notificationBar, NotificationBarAttributes[_open])
}

export async function closeNotification(notificationBar: HTMLDivElement): Promise<void> {
    
    // clear timeout
    const timeoutId = getAttribute(notificationBar, NotificationBarAttributes[_timeoutId])
    if (timeoutId != null) clearTimeDelayed(timeoutId[_trim]() == ''? undefined : numberParse(timeoutId, true))
    removeAttribute(notificationBar, NotificationBarAttributes[_timeoutId])

    removeAttribute(notificationBar, NotificationBarAttributes[_move])
    await timeout(3E2)
    removeAttribute(notificationBar, NotificationBarAttributes[_open])
    notificationBar[_hidePopover]()
}

export async function openNotification({
        notificationBar, 
        duration = 3E3, 
        position = PopoverPosition[_CENTER_CENTER_BOTTOM], 
        autoClose = true
    }: NotificationOptions): Promise<void> {
    const
        _12px = '12px',
        _min12px = '-12px',
        _8px = '8px',
        _50persen = '50%', 
        _min50persen = '-50%', 
        _0 = '0'
    ;

    // clear timeout
    const timeoutId = getAttribute(notificationBar, NotificationBarAttributes[_timeoutId])
    if (timeoutId != null) clearTimeDelayed(timeoutId[_trim]() == ''? undefined : numberParse(timeoutId, true))
    removeAttribute(notificationBar, NotificationBarAttributes[_timeoutId])

    if (isNotificationOpen(notificationBar)) {
        await closeNotification(notificationBar)
    }

    notificationBar[_showPopover]()

    let left: string = _auto
    let top: string = _auto
    let right: string = _auto
    let bottom: string = _auto
    let transform: string | null = null
    let transformAfter: string | null = null
    const translate = (left: string, top: string) => `translate(${left}, ${top})`
    if (position == PopoverPosition[_CENTER_CENTER_LEFT_TOP]){
        top = _8px
        left = _8px
        transform = translate(_0, _min12px)
    }
    else if (position == PopoverPosition[_CENTER_CENTER_LEFT]){
        top = _50persen
        left = _8px
        transform = translate(_min12px, _min50persen)
        transformAfter = translate(_0, _min50persen)
    }
    else if (position == PopoverPosition[_CENTER_CENTER_LEFT_BOTTOM]){
        bottom = _8px
        left = _8px
        transform = translate(_0, _12px)
    }
    else if (position == PopoverPosition[_CENTER_CENTER_TOP]){
        top = _8px
        left = _50persen
        transform = translate(_min50persen, _min12px)
        transformAfter = translate(_min50persen, _0)
    }
    else if (position == PopoverPosition[_CENTER_CENTER]){
        top = _50persen
        left = _50persen
        transform = translate(_min50persen, _min50persen) + ' scale(.85)'
        transformAfter = translate(_min50persen, _min50persen)
    }
    else if (position == PopoverPosition[_CENTER_CENTER_BOTTOM]){
        bottom = _8px
        left = _50persen
        transform = translate(_min50persen, _12px)
        transformAfter = translate(_min50persen, _0)
    }
    else if (position == PopoverPosition[_CENTER_CENTER_RIGHT_TOP]){
        right = _8px
        top = _8px
        transform = translate(_0, _min12px)
    }
    else if (position == PopoverPosition[_CENTER_CENTER_RIGHT]){
        top = _50persen
        right = _8px
        transform = translate(_12px, _0)
    }
    else if (position == PopoverPosition[_CENTER_CENTER_RIGHT_BOTTOM]){
        bottom = _8px
        right = _8px
        transform = translate(_0, _12px)
    }

    setStyleProperty(notificationBar, _left, left)
    setStyleProperty(notificationBar, _top, top)
    setStyleProperty(notificationBar, _right, right)
    setStyleProperty(notificationBar, _bottom, bottom)
    setStyleProperty(notificationBar, _transform, transform)

    setTimeDelayed(async () => {
        setAttribute(notificationBar, NotificationBarAttributes[_open], '')
        await timeout(20)
        setAttribute(notificationBar, NotificationBarAttributes[_move], '')
        setStyleProperty(notificationBar, _transform, transformAfter)
    })

    if (!autoClose) return;

    const t = setTimeDelayed(() => {
        closeNotification(notificationBar)
    }, duration)

    setAttribute(notificationBar, NotificationBarAttributes[_timeoutId], `${t}`)
}