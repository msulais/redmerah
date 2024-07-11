import { type JSX, type ParentComponent, Show, mergeProps, onMount, splitProps, children } from "solid-js"
import { Portal } from "solid-js/web"

import type { ComponentEvent } from "@/types/event"
import { preventDefault } from "@/utils/event"
import { toggleAttribute } from "@/utils/attributes"
import { initFlyout } from "@/utils/flyout"
import { closeModal } from "@/utils/modal"
import { _onCancel, _header, _dismiss, _actions, _children, _showCloseButton, _justifyActions, _ref, _position, _right, _closeTooltip, _auto, _manual, _classList, _filledTonal, _indicatorPosition, _leading, _left, _selected, _trailing, _footer } from "@/data/string"
import { Position } from "@/enums/position"
import { isVarHasValue } from "@/utils/data"

import Button, { ButtonVariant } from "@/components/Button"
import './index.scss'

type DrawerProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'ref' | 'onCancel'> & {
    header?: JSX.Element
    footer?: JSX.Element
    position?: Position.left | Position.right
    dismiss?: 'manual' | 'auto'
    ref?: (el: HTMLDialogElement) => void
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => void
}

type DrawerItemProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    leading?: JSX.Element
    trailing?: JSX.Element
    selected?: boolean
    indicatorPosition?: Position
}

export const DrawerItem: ParentComponent<DrawerItemProps> = ($props) => {
    const [props, other] = splitProps($props, [_indicatorPosition, _selected, _leading, _children, _trailing, _classList])
    const trailingComponent = children(() => props[_trailing])

    return (<Button 
        variant={props[_selected]? ButtonVariant[_filledTonal] : undefined} 
        selected={props[_selected]} 
        indicatorPosition={isVarHasValue(props[_selected])? (props[_indicatorPosition] ?? Position[_left]) : undefined} 
        disableScale={trailingComponent()? true : undefined} 
        data-trailing={toggleAttribute(trailingComponent())}
        classList={{'drawer-item': true, ...props[_classList]}} 
        {...other}>
        { props[_leading] }
        { props[_children] }
        <Show when={trailingComponent()}>
            <div style={{flex: 1}} />
        </Show>
        { trailingComponent() }
    </Button>)
}

const Drawer: ParentComponent<DrawerProps> = (_props) => {
    const __props = mergeProps({ dismiss: _auto}, _props)
    const [props, other] = splitProps(__props, [
        _onCancel, _header, _dismiss,
        _footer, _children,
        _ref, _position
    ])
    let modalRef: HTMLDialogElement

    onMount(() => initFlyout())

    return (<Portal><dialog
        data-right={toggleAttribute(props[_position] == Position[_right])}
        class="drawer"
        ref={r => {
            modalRef = r
            if (props[_ref]) props[_ref](r)
        }}
        data-modal
        data-dismiss={props[_dismiss]}
        onCancel={(ev) => {
            if (props[_onCancel]) props[_onCancel](ev)
            if (props[_dismiss] == _manual) {
                preventDefault(ev)
                return
            }
            closeModal(modalRef)
        }}
        {...other}>
        <div>
            <div class="drawer-header">{props[_header]}</div>
            <div class="drawer-content">{props[_children]}</div>
            <div class="drawer-footer">{props[_footer]}</div>
        </div>
    </dialog></Portal>)
}

export default Drawer