import { type JSX, type ParentComponent, Show, splitProps, children } from "solid-js"

import { _indicatorPosition, _selected, _leading, _children, _trailing, _classList, _iconCode, _variant, _disableScale, _tonal, _left, _header, _footer, _position, _right } from "@/data/string"
import { toggleAttribute } from "@/utils/attributes"
import { Position } from "@/enums/position"
import { isVarHasValue } from "@/utils/data"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, type ButtonProps } from "@/components/Button"
import { Modal, type ModalProps, openModal, closeModal, focusModal } from "@/components/Modal"
import './index.scss'

function openDrawer(ev: Event, drawer: HTMLDialogElement, options?: {
    important?: boolean
    inputAutoFocus?: boolean
}): void {
    openModal(ev, drawer, {...options})
}

enum DrawerPosition {
    left, 
    right
}

type DrawerItemProps = ButtonProps & {
    leading?: JSX.Element
    trailing?: JSX.Element
    iconCode?: number
}
const DrawerItem: ParentComponent<DrawerItemProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _indicatorPosition, _selected, _leading, _children, 
        _trailing, _classList, _iconCode, _variant, 
        _disableScale
    ])
    const trailingComponent = children(() => props[_trailing])

    return (<Button 
        variant={props[_variant] ?? (props[_selected]? ButtonVariant[_tonal] : undefined)} 
        selected={props[_selected]} 
        indicatorPosition={props[_indicatorPosition] ?? (isVarHasValue(props[_selected])? (props[_indicatorPosition] ?? Position[_left]) : undefined)} 
        disableScale={props[_disableScale] ?? (trailingComponent()? true : undefined)} 
        data-trailing={toggleAttribute(trailingComponent())}
        classList={{'drawer-item': true, ...props[_classList]}} 
        {...other}>
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

type DrawerProps = ModalProps & {
    header?: JSX.Element
    footer?: JSX.Element
    position?: DrawerPosition
}
const Drawer: ParentComponent<DrawerProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _header, _footer, _children, _position,
        _classList
    ])

    return (<Modal 
        data-right={toggleAttribute(props[_position] == DrawerPosition[_right])}
        classList={{
            drawer: true, 
            ...props[_classList]
        }}
        {...other}>
        <div class="drawer-header">{props[_header]}</div>
        <div class="drawer-content">{props[_children]}</div>
        <div class="drawer-footer">{props[_footer]}</div>
    </Modal>)
}

export {
    Drawer, 
    DrawerItem, 
    openDrawer, 
    DrawerPosition,
    closeModal as closeDrawer, 
    focusModal as focusDrawer
}
export type {
    DrawerProps, 
    DrawerItemProps
}
export default Drawer