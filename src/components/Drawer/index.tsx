import { type JSX, type ParentComponent, Show, mergeProps, onMount, splitProps, createSignal } from "solid-js"
import { Portal } from "solid-js/web"

import type { ComponentEvent } from "@/types/event"
import { preventDefault } from "@/utils/event"
import { toggleAttribute } from "@/utils/attributes"
import { initFlyout } from "@/utils/flyout"
import { closeModal } from "@/utils/modal"
import { _onCancel, _header, _dismiss, _actions, _children, _showCloseButton, _justifyActions, _ref, _position, _right, _closeTooltip, _auto, _manual } from "@/data/string"
import { Position } from "@/enums/position"

import Icon from "@/components/Icon"
import Tooltip from "@/components/Tooltip"
import Button from "@/components/Button"
import './index.scss'

type DrawerProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'ref' | 'onCancel'> & {
    header?: JSX.Element
    actions?: JSX.Element
    position?: Position.left | Position.right
    showCloseButton?: boolean
    closeTooltip?: string
    dismiss?: 'manual' | 'auto'
    ref?: (el: HTMLDialogElement) => void
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => void
}

const Drawer: ParentComponent<DrawerProps> = (_props) => {
    const __props = mergeProps({ dismiss: _auto}, _props)
    const [props, other] = splitProps(__props, [
        _onCancel, _header, _dismiss,
        _actions, _children, _showCloseButton,
        _ref, _position, _closeTooltip
    ])
    const [closeBtnRef, setCloseBtnRef] = createSignal<HTMLButtonElement | null>(null)
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
            <div class="drawer-header" data-close-btn={toggleAttribute(props[_showCloseButton])}>
                <div>{props[_header]}</div>
                <Show when={props[_showCloseButton]}>
                    <Tooltip text={props[_closeTooltip] ?? "Close"} anchor={closeBtnRef()}/>
                    <Button ref={r => setCloseBtnRef(r)} iconOnly onClick={() => closeModal(modalRef)}><Icon code={0xE5E9}/></Button>
                </Show>
            </div>
            <div class="drawer-content">{props[_children]}</div>
            <div class="drawer-actions">{props[_actions]}</div>
        </div>
    </dialog></Portal>)
}

export default Drawer