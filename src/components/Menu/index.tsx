import { type Component, type JSX, type ParentComponent, Show, mergeProps, splitProps, type VoidComponent, For, children, createUniqueId } from "solid-js"

import type { ComponentEvent } from "@/types/event"
import { getAttribute, toggleAttribute } from "@/utils/attributes"
import { _checked, _selected, _leading, _children, _trailing, _subtitle, _indent, _classList, _rightCenterToBottom, _disconnect, _dismiss, _id, _item, _level, _manual, _observe, _onCancel, _onClick, _onClose, _onToggle, _open, _ref, _wrapperAttr, _auto, _shortcuts, _currentTarget, _none, _left, _tonal, _dragable, _clientX, _clientY, _color, _hue, _initialColor, _isDrag, _mousemove, _mouseup, _noPointerEvent, _opacity, _touchend, _touches, _touchmove, _value, _valuechange, _top, _px, _anchorId, _body, _bottom, _clientWidth, _height, _innerHeight, _right, _width, _focus, _iconCode, _compact, _variant, _indicatorPosition, _onMouseEnter, _onMouseLeave, _class, _disableScale, _desktopCompact, _gap, _position, _padding, _allowHideAnchor } from "@/data/string"
import { isVarHasValue } from "@/utils/data"
import { querySelectorAll } from "@/utils/element"
import { stopImmediatePropagation, stopPropagation } from "@/utils/event"
import { clearTimeDelayed, setTimeDelayed, timeout } from "@/utils/timeout"
import { numberParse } from "@/utils/math"

import Divider, { type DividerProps } from "@/components/Divider"
import Icon from "@/components/Icon"
import Button, { ButtonIndicatorPosition, ButtonVariant, LinkButton, type ButtonProps, type LinkButtonProps } from "@/components/Button"
import Popover, { type PopoverProps, closePopover, openPopover, repositionPopover, PopoverPosition as SubMenuPosition } from "@/components/Popover"
import Modal, { type ModalProps, closeModal, focusModal, openModal, repositionModal, ModalPosition as MenuPosition } from "@/components/Modal"
import './index.scss'

type MenuItemTrailingShortcutProps = JSX.HTMLAttributes<HTMLDivElement> & {
    shortcuts: string[]
}
const MenuItemTrailingShortcut: VoidComponent<MenuItemTrailingShortcutProps> = ($props) => {
    const [props, other] = splitProps($props, [_shortcuts])
    return (<div class="menu-item-trailing-shortcut" {...other}>
        <For each={props[_shortcuts]}>{s => <kbd>{s}</kbd>}</For>
    </div>)
}

type MenuItemProps = ButtonProps & {
    leading?: JSX.Element
    trailing?: JSX.Element
    checked?: boolean
    iconCode?: number
}
const MenuItem: ParentComponent<MenuItemProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _checked, _selected, _leading, _children, 
        _trailing, _classList, _iconCode, _variant, 
        _indicatorPosition, _disableScale, 
        _desktopCompact
    ])
    const trailingComponent = children(() => props[_trailing])

    return (<Button 
        variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : props[_variant])} 
        selected={props[_selected]} 
        indicatorPosition={props[_indicatorPosition] ?? ButtonIndicatorPosition[_left]} 
        disableScale={props[_disableScale] ?? (trailingComponent()? true : undefined)}
        desktopCompact={props[_desktopCompact] ?? true}
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

type LinkMenuItemProps = LinkButtonProps & {
    leading?: JSX.Element
    trailing?: JSX.Element
    checked?: boolean
    iconCode?: number
}
const LinkMenuItem: ParentComponent<LinkMenuItemProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _checked, _selected, _leading, _children, 
        _trailing, _classList, _iconCode, _variant, 
        _indicatorPosition, _disableScale, 
        _desktopCompact
    ])
    const trailingComponent = children(() => props[_trailing])

    return (<LinkButton 
        variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : props[_variant])} 
        selected={props[_selected]} 
        indicatorPosition={props[_indicatorPosition] ?? ButtonIndicatorPosition[_left]} 
        disableScale={props[_disableScale] ?? (trailingComponent()? true : undefined)} 
        desktopCompact={props[_desktopCompact] ?? true}
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

const MenuIndent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
    return (<div class="menu-indent" {...props}/>)
}

const MenuDivider: Component<DividerProps> = (props) => {
    return (<Divider {...props}/>)
}

const MenuHeader: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
    return (<div class="menu-header" {...props}/>)
}

type SubMenuProps = Omit<PopoverProps, 'onClick'> & {
    level: number
    item: JSX.Element
    gap?: number
    position?: SubMenuPosition
    padding?: number
    dragable?: boolean
    allowHideAnchor?: boolean
    onClick?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
    wrapperAttr?: Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children' | 'ref' | 'onClick' | 'onMouseEnter' | 'onMouseLeave'> & {
        ref?: (el: HTMLDivElement) => unknown
        onClick?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
        onMouseEnter?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
        onMouseLeave?: (ev: ComponentEvent<MouseEvent, HTMLDivElement>) => unknown
    }
}
const SubMenu: ParentComponent<SubMenuProps> = ($props) => {
    const $$props = mergeProps({id: createUniqueId()}, $props)
    const [props, other] = splitProps($$props, [
        _classList, _level, _item, _wrapperAttr, 
        _id, _onClick, _ref, _gap, _position,
        _padding, _dragable, _allowHideAnchor
    ])
    let timeoutId: number | null = null
    let div_ref: HTMLDivElement
    let popover_ref: HTMLDivElement

    function cancelTimeout(): void {
        if (timeoutId == null) return;

        clearTimeDelayed(timeoutId)
        timeoutId = null
    }

    async function open(ev: Event): Promise<void> {
        let isAnySubMenuOpen = false
        for (const submenu of querySelectorAll(`.sub-menu>.menu[data-level]:not([id="${props[_id]}"]):popover-open`)) {
            const level: number = numberParse(getAttribute(submenu, 'data-level')!, true)
            if (level < props[_level]) continue;

            isAnySubMenuOpen = true
            closePopover(submenu as HTMLDivElement)
        }
        if (isAnySubMenuOpen) await timeout(300)

        openPopover(ev, popover_ref, {
            anchor: div_ref, 
            position: props[_position] ?? SubMenuPosition[_rightCenterToBottom],
            gap: props[_gap] ?? -8, 
            padding: props[_padding] ?? 5,
            dragable: props[_dragable],
            allowHideAnchor: props[_allowHideAnchor]
        })
    }

    return (<div 
        class={"sub-menu" + (props[_wrapperAttr] && props[_wrapperAttr][_class] != undefined? ` ${props[_wrapperAttr][_class]}` : '')}
        ref={r => {
            div_ref = r
            if (props[_wrapperAttr] && props[_wrapperAttr][_ref]) props[_wrapperAttr][_ref](r)
        }}
        onClick={(ev) => {
            cancelTimeout()
            open(ev)
            if (props[_wrapperAttr] && props[_wrapperAttr][_onClick]) props[_wrapperAttr][_onClick](ev)
        }}
        onMouseEnter={(ev) => {
            cancelTimeout()
            timeoutId = setTimeDelayed(() => {
                open(ev)
                timeoutId = null
            }, 300)
            if (props[_wrapperAttr] && props[_wrapperAttr][_onMouseEnter]) props[_wrapperAttr][_onMouseEnter](ev)
        }}
        onMouseLeave={(ev) => {
            cancelTimeout()
            timeoutId = setTimeDelayed(() => {
                closePopover(popover_ref)
                timeoutId = null
            }, 500)
            if (props[_wrapperAttr] && props[_wrapperAttr][_onMouseLeave]) props[_wrapperAttr][_onMouseLeave](ev)
        }}
        {...props[_wrapperAttr]}>
        {props[_item]}
        <Popover
            data-level={props[_level]}
            usePortal={false}
            id={props[_id]}
            onClick={(ev) => {
                stopPropagation(ev)
                stopImmediatePropagation(ev)
                if (props[_onClick]) props[_onClick](ev)
            }}
            ref={r => {
                popover_ref = r
                if (props[_ref]) props[_ref](r)
            }}
            classList={{
                menu: true, 
                ...props[_classList]
            }}
            {...other}
        />
    </div>)
}

type MenuProps = ModalProps
const Menu: ParentComponent<MenuProps> = ($props) => {
    const [props, other] = splitProps($props, [_classList])
    return (<Modal 
        classList={{
            menu: true, 
            ...props[_classList]
        }}
        {...other}
    />)
}

export {
    SubMenu,
    Menu,
    MenuItem,
    MenuIndent,
    MenuHeader,
    MenuDivider,
    LinkMenuItem,
    MenuItemTrailingShortcut,
    closePopover as closeSubMenu,
    openPopover as openSubMenu, 
    repositionPopover as repositionSubMenu,
    focusModal as focusMenu,
    openModal as openMenu,
    closeModal as closeMenu, 
    repositionModal as repositionMenu,
    SubMenuPosition, 
    MenuPosition
}
export type {
    MenuProps,
    MenuItemProps,
    SubMenuProps,
    MenuItemTrailingShortcutProps,
    LinkMenuItemProps, 
}
export default Menu