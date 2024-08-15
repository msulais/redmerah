import { type Component, type JSX, type ParentComponent, Show, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps, type VoidComponent, For, children } from "solid-js"
import { Portal } from "solid-js/web"

import type { ComponentEvent } from "@/types/event"
import { preventDefault, stopImmediatePropagation, stopPropagation } from "@/utils/event"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { closePopover, initPopover, openPopover } from "@/utils/popover"
import { getBoundingClientRect, querySelector, setStyleProperty } from "@/utils/element"
import { BodyAttributes, PopoverAttributes } from "@/enums/attributes"
import { hasAttribute, removeAttribute, setAttribute, toggleAttribute } from "@/utils/attributes"
import { PopoverPosition, Position } from "@/enums/position"
import { _checked, _selected, _leading, _children, _trailing, _subtitle, _indent, _classList, _RIGHT_CENTER_TO_BOTTOM, _disconnect, _dismiss, _id, _item, _level, _manual, _observe, _onCancel, _onClick, _onClose, _onToggle, _open, _ref, _wrapperAttr, _auto, _shortcuts, _currentTarget, _none, _left, _filledTonal, _dragable, _clientX, _clientY, _color, _hue, _initialColor, _isDrag, _mousemove, _mouseup, _noPointerEvent, _opacity, _touchend, _touches, _touchmove, _value, _valuechange, _top, _px, _anchorId, _body, _bottom, _clientWidth, _height, _innerHeight, _right, _width, _focus, _iconCode } from "@/data/string"
import { isVarHasValue } from "@/utils/data"
import { getDocument, getDocumentBody, getWindow } from "@/data/window"
import { addEventListener, removeEventListener } from "@/utils/event"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, LinkButton } from "@/components/Button"
import './index.scss'

export type MenuProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'ref' | 'onToggle' | 'onClose' | 'onCancel'> & {
    dismiss?: 'manual' | 'auto'
    dragable?: boolean
    ref?: (el: HTMLDialogElement) => unknown
    onToggle?: (value: boolean) => unknown
    onClose?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
}

type NestedMenuProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onClick' | 'ref' | 'onToggle'> & {
    level: number
    item: JSX.Element
    onClick?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
    ref?: (el: HTMLDivElement) => unknown
    onToggle?: (value: boolean) => unknown
    wrapperAttr?: JSX.HTMLAttributes<HTMLDivElement>
}

type MenuItemProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    focus?: boolean
    selected?: boolean
    checked?: boolean
    iconCode?: number
}

type MenuItemLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    openInNewTab?: boolean
    checked?: boolean
    selected?: boolean
    iconCode?: number
}

type MenuItemTrailingKeyboardShortcutProps = JSX.HTMLAttributes<HTMLDivElement> & {
    shortcuts: string[]
}

export const MenuItemTrailingKeyboardShortcut: VoidComponent<MenuItemTrailingKeyboardShortcutProps> = ($props) => {
    const [props, other] = splitProps($props, [_shortcuts])
    return (<div class="menu-item-trailing-keyboard-shortcut" {...other}>
        <For each={props[_shortcuts]}>{s => <kbd>{s}</kbd>}</For>
    </div>)
}

export const MenuItem: ParentComponent<MenuItemProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _checked, _selected, _leading, _focus, _children, 
        _trailing, _classList, _iconCode
    ])
    const trailingComponent = children(() => props[_trailing])

    return (<Button 
        variant={props[_selected]? ButtonVariant[_filledTonal] : undefined} 
        selected={props[_selected]} 
        focus={props[_focus]}
        indicatorPosition={isVarHasValue(props[_selected])? Position[_left] : undefined} 
        disableScale={trailingComponent()? true : undefined} 
        compact 
        data-trailing={toggleAttribute(trailingComponent())}
        classList={{'menu-item': true, ...props[_classList]}} 
        {...other}>
        <Show when={isVarHasValue(props[_checked])}>
            <Icon 
                style={{color: 'rgb(var(--color-accent))'}} 
                filled={props[_checked]} 
                code={props[_checked]? 0xE3CC : 0xE3D4}
            />
        </Show>
        <Show when={props[_iconCode] != null}>
            <Icon
                style={{color: props[_selected]? 'rgb(var(--color-accent))' : undefined}} 
                filled={props[_selected]} 
                code={props[_iconCode]!}
            />
        </Show>
        { props[_leading] }
        { props[_children] }
        <Show when={trailingComponent()}>
            <div style={{flex: 1}} />
        </Show>
        { trailingComponent() }
    </Button>)
}

export const MenuItemLink: ParentComponent<MenuItemLinkProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _leading, _checked, _selected, _children, _trailing, 
        _classList, _iconCode
    ])
    const trailingComponent = children(() => props[_trailing])

    return (<LinkButton 
        variant={props[_selected]? ButtonVariant[_filledTonal] : undefined} 
        selected={props[_selected]} 
        indicatorPosition={isVarHasValue(props[_selected])? Position[_left] : undefined} 
        disableScale={trailingComponent()? true : undefined} 
        compact 
        data-trailing={toggleAttribute(trailingComponent())}
        classList={{'menu-item': true, ...props[_classList]}} 
        {...other}>
        <Show when={isVarHasValue(props[_checked])}>
            <Icon 
                style={{color: props[_checked]? 'rgb(var(--color-accent))' : undefined}} 
                filled={props[_checked]} 
                code={props[_checked]? 0xE3CC : 0xE3D4}
            />
        </Show>
        <Show when={props[_iconCode] != null}>
            <Icon
                style={{color: props[_selected]? 'rgb(var(--color-accent))' : undefined}} 
                filled={props[_selected]} 
                code={props[_iconCode]!}
            />
        </Show>
        { props[_leading] }
        { props[_children] }
        <Show when={trailingComponent()}>
            <div style={{flex: 1}} />
        </Show>
        { trailingComponent() }
    </LinkButton>)
}

export const MenuIndent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
    return (<div class="menu-indent" {...props}/>)
}

export const MenuDivider: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
    return (<div class="menu-divider" {...props}/>)
}

export const MenuHeader: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = ($props) => {
    const _children = 'children';

    const [props, other] = splitProps($props, [_children])
    return (<div class="menu-header" {...other}>{props[_children]}</div>)
}

export const NestedMenu: ParentComponent<NestedMenuProps> = ($props) => {
    const $$props = mergeProps({id: createUniqueId()}, $props)
    const [props, other] = splitProps($$props, [
        _level, _item, _children, _onClick,
        _onToggle, _wrapperAttr, _id, _ref
    ])
    const [timeoutId, setTimeoutId] = createSignal<number | null>(null)
    let nestedMenuRef!: HTMLDivElement
    let anchorRef!: HTMLDivElement

    function cancelTimeout(): void {
        if (timeoutId() == null) return
        clearTimeDelayed(timeoutId()!)
        setTimeoutId(null)
    }

    async function openMenu(ev: Event): Promise<void> {

        // close other opened nested menu 
        const popover = querySelector(`.menu[popover][data-level="${props[_level]}"][${PopoverAttributes[_open]}]:not([id="${props[_id]}"])`)
        if (popover) {
            await closePopover(popover)
        }

        openPopover({
            event: ev, 
            popover: nestedMenuRef, 
            anchor: anchorRef,
            position: PopoverPosition[_RIGHT_CENTER_TO_BOTTOM], 
            gap: -8, 
            padding: 4
        })
    }

    onMount(() => {
        let timeout: null | number = null
        const observer = initPopover(nestedMenuRef)
        const isOpenObserver = new MutationObserver(() => {
            if (timeout) clearTimeDelayed(timeout)
            
            // [data-open] is not the only attribute that trigger this callback
            timeout = setTimeDelayed(() => {
                const isOpen = hasAttribute(nestedMenuRef, PopoverAttributes[_open])
                if (props[_onToggle]) props[_onToggle](isOpen)
            }, 50)
        })
        isOpenObserver[_observe](nestedMenuRef, {attributes: true})
        onCleanup(() => {
            if (observer) observer[_disconnect]()
            isOpenObserver[_disconnect]()
        })
    })

    return (<div
        class="menu-nested"
        ref={(r) => anchorRef = r}
        onClick={(ev) => {
            cancelTimeout()
            openMenu(ev)
        }}
        onMouseEnter={(ev) => {
            cancelTimeout()
            setTimeoutId(setTimeDelayed(() => {
                openMenu(ev)
                setTimeoutId(null)
            }, 300))
        }}
        onMouseLeave={() => {
            cancelTimeout()
            setTimeoutId(setTimeDelayed(() => {
                closePopover(nestedMenuRef)
                setTimeoutId(null)
            }, 500))
        }}
        {...props[_wrapperAttr]}>
        { props[_item] }
        <div 
            ref={(r) => {
                nestedMenuRef = r
                if (props[_ref]) props[_ref](r)
            }}
            id={props[_id]}
            onClick={(ev) => {
                stopPropagation(ev)
                stopImmediatePropagation(ev)
                if (props[_onClick]) props[_onClick](ev)
            }}
            class="menu" 
            popover={_manual}
            data-dismiss={_manual}
            data-popover
            data-level={props[_level]}
            {...other}>
            <div>
                { props[_children] }
            </div>
        </div>
    </div>)
}

/**
 * **Important**: 
 * 
 * Don't put this component in closeable `onCleanup()` element
 * unless it needed. Because something strange will happens when 
 * you try open it with `openPopover()`. It will not crash, but
 * the behaviour will make you confuse.
 */
const Menu: ParentComponent<MenuProps> = ($props) => {
    const $$props = mergeProps({dismiss: _auto}, $props)
    const [props, other] = splitProps($$props, [
        _onClose, _onToggle, _onCancel, 
        _dismiss, _children, _ref, 
        _dragable
    ])
    const [isDragging, setIsDragging] = createSignal<boolean>(false)
    let menuRef!: HTMLDialogElement

    // different of mouse position to top-left of menu position
    let diffPositionX: number = 0
    let diffPositionY: number = 0

    function fixPosition(): void {
        const popoverRect = getBoundingClientRect(menuRef)
        const screen = {
            width: getDocument()[_body][_clientWidth],
            height: getWindow()[_innerHeight]
        }
        if (popoverRect[_left  ] < 8) setStyleProperty(menuRef, _left, 8 + _px)
        if (popoverRect[_top   ] < 8) setStyleProperty(menuRef, _top , 8 + _px)
        if (popoverRect[_right ] > screen[_width ]) setStyleProperty(menuRef, _left, (screen[_width ] - popoverRect[_width ] - 8) + _px)
        if (popoverRect[_bottom] > screen[_height]) setStyleProperty(menuRef, _top , (screen[_height] - popoverRect[_height] - 8) + _px)
    }

    function changePosition(x: number, y: number) {
        setStyleProperty(menuRef, _left, (x - diffPositionX) + _px)
        setStyleProperty(menuRef, _top, (y - diffPositionY) + _px)
    }

    function initDragListener() {
        addEventListener(getDocument(), _touchmove, (ev) => {
            if (!isDragging()) return;
            changePosition((ev as TouchEvent)[_touches][0][_clientX], (ev as TouchEvent)[_touches][0][_clientY])
        })

        addEventListener(getDocument(), _touchend, () => {
            removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
            setIsDragging(false)
            fixPosition()
        })

        addEventListener(getDocument(), _mousemove, ev => {
            if (!isDragging()) return;
            changePosition((ev as MouseEvent)[_clientX], (ev as MouseEvent)[_clientY])
        })

        addEventListener(getDocument(), _mouseup, () => {
            removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
            setIsDragging(false)
            fixPosition()
        })
        
        onCleanup(() => {
            removeEventListener(getDocument(), _touchmove, (ev) => {
                if (!isDragging()) return;
                changePosition((ev as TouchEvent)[_touches][0][_clientX], (ev as TouchEvent)[_touches][0][_clientY])
            })

            removeEventListener(getDocument(), _touchend, () => {
                removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                setIsDragging(false)
                fixPosition()
            })

            removeEventListener(getDocument(), _mousemove, ev => {
                if (!isDragging()) return;
                changePosition((ev as MouseEvent)[_clientX], (ev as MouseEvent)[_clientY])
            })

            removeEventListener(getDocument(), _mouseup, () => {
                removeAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                setIsDragging(false)
                fixPosition()
            })
        })
    }

    onMount(() => {
        let timeout: null | number = null
        const observer = initPopover(menuRef)
        const isOpenObserver = new MutationObserver(() => {
            if (timeout) clearTimeDelayed(timeout)
            
            // [data-open] is not the only attribute that trigger this callback
            timeout = setTimeDelayed(() => {
                const isOpen = hasAttribute(menuRef, PopoverAttributes[_open])
                if (props[_onToggle]) props[_onToggle](isOpen)
            }, 50)
        })
        isOpenObserver[_observe](menuRef, {attributes: true})

        if (props[_dragable]) {
            initDragListener()
        }

        onCleanup(() => {
            if (observer) observer[_disconnect]();
            isOpenObserver[_disconnect]();
        })
    })

    return (<Portal><dialog 
        class="menu" 
        // TODO: implement onKeyDown
        ref={(r) => {
            menuRef = r
            if (props[_ref]) props[_ref](r)
        }}
        data-popover
        data-dismiss={props[_dismiss]}
        onClose={(ev) => {
            if (props[_onClose]) props[_onClose](ev)
            if (props[_onToggle]) props[_onToggle](false)
        }}
        data-is-dragging={toggleAttribute(isDragging())}
        onCancel={(ev) => {
            preventDefault(ev)
            if (props[_onCancel]) props[_onCancel](ev)
            if (props[_dismiss] == _manual) return
            if (props[_onToggle]) props[_onToggle](false)
            closePopover(ev[_currentTarget])
        }}
        {...other}>
        <div data-dragable={toggleAttribute(props[_dragable])}>
            <Show when={props[_dragable]}>
                <div 
                    class="menu-drag-handle"
                    onMouseDown={(ev) => {
                        const rect = getBoundingClientRect(menuRef)
                        setIsDragging(true)
                        setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                        diffPositionX = ev[_clientX] - rect.x
                        diffPositionY = ev[_clientY] - rect.y
                    }}
                    onTouchStart={ev => {
                        const rect = getBoundingClientRect(menuRef)
                        setIsDragging(true)
                        setAttribute(getDocumentBody(), BodyAttributes[_noPointerEvent])
                        diffPositionX = ev[_touches][0][_clientX] - rect.x
                        diffPositionY = ev[_touches][0][_clientY] - rect.y
                    }}
                />
            </Show>
            { props[_children] }
        </div>
    </dialog></Portal>)
}

export default Menu