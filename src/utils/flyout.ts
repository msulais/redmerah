import { hasAttribute, removeAttribute, setAttribute } from "./attributes"
import { BodyAttributes, ModalAttributes, PopoverAttributes } from "@/enums/attributes"
import { closePopover, repositionPopover } from "./popover"
import { getBoundingClientRect, querySelector, querySelectorAll } from "./element"
import { addEventListener } from "./event"
import { ElementSelector } from "@/enums/selector"
import { clearTimeDelayed, setTimeDelayed } from "./timeout"
import { closeModal } from "./modal"
import { _flyoutListener, _flyout, _open, _noPointerEvent, _clientX, _touches, _clientY, _focus, _x, _left, _right, _y, _top, _bottom, _modal, _popover, _activeElement, _flyoutOpen, _scrollY, _documentElement, _scrollTop, _scrollTo, _anchorId, _position, _observe, _click, _scroll, _resize, _join, _instant } from "@/data/string"
import { getDocument, getDocumentBody, getWindow } from "@/data/window"

export function initFlyout(): void {
    const data_dismiss_auto = '[data-dismiss="auto"]'

    if (hasAttribute(getDocumentBody(), BodyAttributes[_flyoutListener])) return;
    setAttribute(getDocumentBody(), BodyAttributes[_flyoutListener], '')

    const selector: string = ElementSelector[_flyout] + `:is([${_open}],[${PopoverAttributes[_open]}])`
    let isFlyoutOpen: boolean = false
    let scrollTop: number = 0
    let timeoutId: number | null = null

    // used for clicked outside flyout
    addEventListener(getDocument(), _click, async (ev: Event) => {
        if (hasAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])) 
            return;

        const pointer = {
            x: (ev as MouseEvent)[_clientX] ?? (ev as TouchEvent)[_touches][0][_clientX] ?? 0,
            y: (ev as MouseEvent)[_clientY] ?? (ev as TouchEvent)[_touches][0][_clientY] ?? 0
        }

        let flyout: HTMLElement | HTMLDialogElement | null = querySelector(selector + `${data_dismiss_auto}:${_focus}`)

        while (flyout != null) {

            // if clicked inside, nothing happen
            const flyoutRect = getBoundingClientRect(flyout)
            if (pointer[_x] >= flyoutRect[_left  ] && 
                pointer[_x] <= flyoutRect[_right ] && 
                pointer[_y] >= flyoutRect[_top   ] && 
                pointer[_y] <= flyoutRect[_bottom]
            ) break;

            if (hasAttribute(flyout, ModalAttributes[_modal])) await closeModal(flyout as HTMLDialogElement)
            if (hasAttribute(flyout, PopoverAttributes[_popover])) await closePopover(flyout as HTMLElement)

            for (const d of querySelectorAll(selector + data_dismiss_auto)) {
                (d as HTMLElement)[_focus]()
                if (getDocument()[_activeElement] == d) break
            }

            flyout = querySelector(selector + `${data_dismiss_auto}:${_focus}`)
        }

        if (!querySelector(selector)) {
            removeAttribute(getDocumentBody(), BodyAttributes[_flyoutOpen])
        }
    })

    addEventListener(getDocument(), _scroll, () => {
        if (!isFlyoutOpen) {
            scrollTop = getWindow()[_scrollY] || getDocument()[_documentElement][_scrollTop]
            return
        }
        getWindow()[_scrollTo]({ top: scrollTop, behavior: _instant })
    })

    addEventListener(getWindow(), _resize, () => {
        if (timeoutId) {
            clearTimeDelayed(timeoutId)
            timeoutId = null
        }

        timeoutId = setTimeDelayed(() => {
            for (const popover of querySelectorAll(`[` + [PopoverAttributes[_popover], PopoverAttributes[_position]][_join]('][') + ']')) {
                repositionPopover(popover as HTMLElement)
            }
            timeoutId = null
        }, 50)
    })

    new MutationObserver(() => {
        isFlyoutOpen = hasAttribute(getDocumentBody(), BodyAttributes[_flyoutOpen])
    })[_observe](getDocumentBody(), { subtree: true, attributes: true })
}