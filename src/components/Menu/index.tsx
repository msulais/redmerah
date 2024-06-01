import { type Component, type JSX, Match, type ParentComponent, Show, Switch, createSignal, createUniqueId, mergeProps, onCleanup, onMount, splitProps } from "solid-js"
import { Portal } from "solid-js/web"

import { preventDefault, stopPropagation } from "@/utils/event"
import { clearTimeDelayed, setTimeDelayed } from "@/utils/timeout"
import { closePopover, initPopover, openPopover } from "@/utils/popover"
import { querySelector } from "@/utils/element"
import { PopoverAttributes } from "@/enums/attributes"
import { hasAttribute } from "@/utils/attributes"
import { PopoverPosition } from "@/enums/position"
import type { ComponentEvent } from "@/types/event"
import { _checked, _selected, _leading, _children, _trailing, _subtitle, _indent, _classList, _RIGHT_CENTER_TO_BOTTOM, _disconnect, _dismiss, _id, _item, _level, _manual, _observe, _onCancel, _onClick, _onClose, _onToggle, _open, _ref, _wrapperAttr, _auto } from "@/data/string"

import Button, { LinkButton } from "@/components/Button"
import List from "@/components/List"
import Icon from "@/components/Icon"
import './index.scss'

type MenuProps = JSX.DialogHtmlAttributes<HTMLDialogElement> & {
    dismiss?: 'manual' | 'auto'
    ref?: (el: HTMLDialogElement) => void
    onToggle?: (value: boolean) => unknown
    onClose?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => unknown
}

type NestedMenuProps = JSX.HTMLAttributes<HTMLDivElement> & {
    level: number
    item: JSX.Element
    onClick?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => void
    ref?: (el: HTMLDivElement) => void
    onToggle?: (value: boolean) => unknown
    wrapperAttr?: JSX.HTMLAttributes<HTMLDivElement>
}

type MenuItemProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    leading?: JSX.Element
    subtitle?: JSX.Element
    trailing?: JSX.Element
    indent?: boolean
    selected?: boolean
    checked?: boolean
}

type NestedMenuItemProps = MenuItemProps & {
    selected?: boolean
    checked?: boolean
    focus?: boolean
    onClick?: (ev: ComponentEvent<MouseEvent, HTMLButtonElement>) => unknown
}

type MenuItemLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
    leading?: JSX.Element
    subtitle?: JSX.Element
    trailing?: JSX.Element
    openInNewTab?: boolean
    checked?: boolean
    selected?: boolean
    indent?: boolean
}

export const MenuItem: ParentComponent<MenuItemProps> = ($props) => {
    const [props, other] = splitProps($props, [_checked, _selected, _leading, _children, _trailing, _subtitle, _indent, _classList])
    return (<Button compact disableScale classList={{'menu-item': true, ...props[_classList]}} {...other}>
        <List 
            leading={<>
                <Switch>
                    <Match when={props[_checked] == true}>
                        <Icon style={{color: 'rgb(var(--color-acc))'}} filled>&#xE3CC;</Icon>
                    </Match>
                    <Match when={props[_checked] == false}>
                        <Icon>&#xE3D4;</Icon>
                    </Match>
                </Switch>
                <Switch>
                    <Match when={props[_selected] == true}>
                        <Icon style={{color: 'rgb(var(--color-acc))'}} filled>&#xE41C;</Icon>
                    </Match>
                    <Match when={props[_selected] == false}>
                        <MenuIndent/>
                    </Match>
                </Switch>
                <Show when={props[_indent]} fallback={props[_leading]}>
                    <MenuIndent/>
                </Show>
            </>}
            subtitle={props[_subtitle]}
            trailing={props[_trailing]}>
            { props[_children] }
        </List>
    </Button>)
}

export const MenuItemLink: ParentComponent<MenuItemLinkProps> = ($props) => {
    const [props, other] = splitProps($props, [_leading, _checked, _selected, _children, _trailing, _subtitle, _indent, _classList])
    return (<LinkButton disableScale compact classList={{'menu-item': true, ...props[_classList]}} {...other}>
        <List 
            leading={<>
                <Switch>
                    <Match when={props[_checked] == true}>
                        <Icon style={{color: 'rgb(var(--color-acc))'}} filled>&#xE3CC;</Icon>
                    </Match>
                    <Match when={props[_checked] == false}>
                        <Icon>&#xE3D4;</Icon>
                    </Match>
                </Switch>
                <Switch>
                    <Match when={props[_selected] == true}>
                        <Icon style={{color: 'rgb(var(--color-acc))'}} filled>&#xE41C;</Icon>
                    </Match>
                    <Match when={props[_selected] == false}>
                        <MenuIndent/>
                    </Match>
                </Switch>
                <Show when={props[_indent]} fallback={props[_leading]}>
                    <MenuIndent/>
                </Show>
            </>}
            subtitle={props[_subtitle]}
            trailing={props[_trailing]}>
            { props[_children] }
        </List>
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

export const NestedMenuItem: ParentComponent<NestedMenuItemProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _classList,
        _checked, 
        _checked, 
        _leading,
        _trailing, 
        _indent, 
        _subtitle, 
        _children, 
        _selected
    ])

    return (<Button 
        compact 
        disableScale
        classList={{
            'menu-item': true, 
            ...props[_classList]
        }} 
        {...other}>
        <List 
            leading={<>
                <Switch>
                    <Match when={props[_checked] == true}>
                        <Icon style={{color: 'rgb(var(--color-acc))'}} filled>&#xE3CC;</Icon>
                    </Match>
                    <Match when={props[_checked] == false}>
                        <Icon>&#xE3D4;</Icon>
                    </Match>
                </Switch>
                <Switch>
                    <Match when={props[_selected] == true}>
                        <Icon style={{color: 'rgb(var(--color-acc))'}} filled>&#xE41C;</Icon>
                    </Match>
                    <Match when={props[_selected] == false}>
                        <MenuIndent/>
                    </Match>
                </Switch>
                <Show when={props[_indent]} fallback={props[_leading]}>
                    <MenuIndent/>
                </Show>
            </>}
            subtitle={props[_subtitle]}
            trailing={props[_trailing]}>
            { props[_children] }
        </List>
    </Button>)
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
                if (props[_onClick]) props[_onClick](ev)
            }}
            class="menu" 
            popover={_manual}
            data-dismiss={_manual}
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
        _dismiss, _children, _ref
    ])
    let menuRef!: HTMLDialogElement

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
        onCleanup(() => {
            if (observer) observer[_disconnect]();
            isOpenObserver[_disconnect]();
        })
    })

    return (<Portal><dialog 
        class="menu" 
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
        onCancel={(ev) => {
            preventDefault(ev)
            if (props[_onCancel]) props[_onCancel](ev)
            if (props[_dismiss] == 'manual') return
            if (props[_onToggle]) props[_onToggle](false)
            closePopover(ev.currentTarget)
        }}
        {...other}>
        <div>
            { props[_children] }
        </div>
    </dialog></Portal>)
}

export default Menu