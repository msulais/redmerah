import { type JSX, type ParentComponent, Show, mergeProps, onMount, splitProps, createSignal, children } from "solid-js"
import { Portal } from "solid-js/web"

import type { ComponentEvent } from "@/types/event"
import { preventDefault } from "@/utils/event"
import { initFlyout } from "@/utils/flyout"
import { closeModal } from "@/utils/modal"
import { _onCancel, _header, _dismiss, _actions, _children, _showCloseButton, _justifyActions, _ref, _manual, _auto, _closeTooltip } from "@/data/string"
import { toggleAttribute } from "@/utils/attributes"

import './index.scss'

type DialogProps = Omit<JSX.DialogHtmlAttributes<HTMLDialogElement>, 'ref' | 'onCancel'> & {
    header?: JSX.Element
    actions?: JSX.Element
    dismiss?: 'manual' | 'auto'
    ref?: (el: HTMLDialogElement) => void
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => void
}

const Dialog: ParentComponent<DialogProps> = (_props) => {
    const __props = mergeProps({dismiss: _auto}, _props)
    const [props, other] = splitProps(__props, [
        _onCancel, _header, _dismiss,
        _actions, _children, _ref,
    ])
    const actionsComponent = children(() => props[_actions])
    let modalRef: HTMLDialogElement

    onMount(() => initFlyout())

    return (<Portal><dialog
        class="dialog"
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
        data-actions={toggleAttribute(actionsComponent())}
        {...other}>
        <div>
            <div class="dialog-header">{props[_header]}</div>
            <div class="dialog-content">{props[_children]}</div>
            <div class="dialog-actions">{actionsComponent()}</div>
        </div>
    </dialog></Portal>)
}

export default Dialog