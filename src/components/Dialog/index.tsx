import { type JSX, type ParentComponent, splitProps, children } from "solid-js"

import { _header, _actions, _children, _classList, _style, _left, _top, _springBounce, _animate, _closeAnimation, _finished, _none, _openAnimation, _then } from "@/constants/string"
import { toggleAttribute } from "@/utils/attributes"

import { Modal, type ModalProps, openModal, closeModal, focusModal } from "@/components/Modal"
import './index.scss'
import { AnimationEffectTiming } from "@/enums/animation"

function openDialog(ev: Event, dialog: HTMLDialogElement, options?: {
    inputAutoFocus?: boolean
    important?: boolean
}): void {
    openModal(ev, dialog, {
        inputAutoFocus: options?.inputAutoFocus,
        important: options?.important
    })
}

type DialogProps = Omit<ModalProps, 'style'> & {
    header?: JSX.Element
    actions?: JSX.Element
    style?: JSX.CSSProperties
}
const Dialog: ParentComponent<DialogProps> = ($props) => {
    const [props, other] = splitProps($props, [
        _header, _actions, _children, _classList,
        _style, _openAnimation, _closeAnimation
    ])
    const actionsComponent = children(() => props[_actions])
    const animationOption = {duration: 300, easing: AnimationEffectTiming[_springBounce]}

    return (<Modal
        classList={{
            dialog: true,
            ...props[_classList]
        }}
        style={{
            ...props[_style],
            top: props[_style] && props[_style][_top] != undefined? props[_style][_top] : '50%',
            left: props[_style] && props[_style][_left] != undefined? props[_style][_left] : '50%',
        }}
        openAnimation={(el, done) => {
            if (props[_openAnimation]) props[_openAnimation](el, done)
            else el[_animate](
                { transform: ['translate(-50%, calc(-50% - 12px))', 'translate(-50%, -50%)'] },
                animationOption
            )[_finished][_then](done)
        }}
        closeAnimation={(el, done) => {
            if (props[_closeAnimation]) props[_closeAnimation](el, done)
            else el[_animate](
                { transform: ['translate(-50%, -50%)', 'translate(-50%, calc(-50% - 12px))'] },
                animationOption
            )[_finished][_then](done)
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