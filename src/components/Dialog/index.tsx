import { type JSX, type ParentComponent, splitProps, children } from "solid-js"

import { _header, _actions, _children, _classList } from "@/data/string"
import { toggleAttribute } from "@/utils/attributes"

import { Modal, type ModalProps, openModal, closeModal, focusModal } from "@/components/Modal"
import './index.scss'

function openDialog(ev: Event, dialog: HTMLDialogElement, options?: {
    inputAutoFocus?: boolean
    important?: boolean
}): void {
    openModal(ev, dialog, {
        inputAutoFocus: options?.inputAutoFocus,
        important: options?.important
    })
}

type DialogProps = ModalProps & {
    header?: JSX.Element
    actions?: JSX.Element
}
const Dialog: ParentComponent<DialogProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _header, _actions, _children, _classList
    ])
    const actionsComponent = children(() => props[_actions])

    return (<Modal
        classList={{
            dialog: true, 
            ...props[_classList]
        }}
        data-actions={toggleAttribute(actionsComponent())}
        {...other}>
        <div class="dialog-header">{props[_header]}</div>
        <div class="dialog-content">{props[_children]}</div>
        <div class="dialog-actions">{actionsComponent()}</div>
    </Modal>)
}

export {
    Dialog, 
    openDialog, 
    closeModal as closeDialog, 
    focusModal as focusDialog,
}
export type {
    DialogProps
}
export default Dialog