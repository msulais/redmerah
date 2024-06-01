import { type JSX, type ParentComponent, Show, mergeProps, onMount, splitProps } from "solid-js"
import { Portal } from "solid-js/web"

import { preventDefault } from "@/utils/event"
import { toggleAttribute } from "@/utils/attributes"
import { initFlyout } from "@/utils/flyout"
import { closeModal } from "@/utils/modal"
import type { ComponentEvent } from "@/types/event"
import { _onCancel, _header, _dismiss, _actions, _children, _showCloseButton, _justifyActions, _ref } from "@/data/string"

import Icon from "@/components/Icon"
import Button from "@/components/Button"
import './index.scss'

type DialogProps = JSX.DialogHtmlAttributes<HTMLDialogElement> & {
    header: JSX.Element
    actions?: JSX.Element
    showCloseButton?: boolean
    justifyActions?: boolean
    dismiss?: 'manual' | 'auto'
    ref?: (el: HTMLDialogElement) => void
    onCancel?: (ev: ComponentEvent<Event, HTMLDialogElement>) => void
}

const Dialog: ParentComponent<DialogProps> = (_props) => {
    const __props = mergeProps({justifyActions: true, dismiss: 'auto'}, _props)
    const [props, other] = splitProps(__props, [
        _onCancel, _header, _dismiss, 
        _actions, _children, _showCloseButton, 
        _justifyActions, _ref
    ])
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
            if (props[_dismiss] == 'manual') {
                preventDefault(ev)
                return
            }
            closeModal(modalRef)
        }}
        {...other}>
        <div>
            <div class="dialog-header" data-close-btn={toggleAttribute(props[_showCloseButton])}>
                {props[_header]}
                <Show when={props[_showCloseButton]}>
                    <Button 
                        classList={{'dialog-close-btn': true}} 
                        iconOnly 
                        onClick={() => closeModal(modalRef)}><Icon>&#xE5E9;</Icon></Button>
                </Show>
            </div>
            <div class="dialog-content">{props[_children]}</div>
            <div 
                class="dialog-actions" 
                data-justify={toggleAttribute(props[_justifyActions])}>{props.actions}</div>
        </div>
    </dialog></Portal>)
}

export default Dialog