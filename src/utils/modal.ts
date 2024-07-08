import { getAttribute, hasAttribute, removeAttribute, setAttribute } from "./attributes";
import { BodyAttributes, ModalAttributes } from "@/enums/attributes";
import { querySelector } from "./element";
import { stopImmediatePropagation } from "./event";
import { ElementSelector } from "@/enums/selector";
import { clearTimeDelayed, setTimeDelayed, timeout } from "./timeout";
import { _body, _flyoutOpen, _showModal, _open, _close, _flyout, _focus, _focusTimeoutId } from "@/data/string";
import { getDocumentBody } from "@/data/window";
import { numberParse } from "./math";

export async function openModal(ev: Event, modal: HTMLElement, inputAutoFocus: boolean = false): Promise<void> {
    if (isModalOpen(modal)) await closeModal(modal)

    setAttribute(getDocumentBody(), BodyAttributes[_flyoutOpen], '');
    (modal as HTMLDialogElement)[_showModal]()
    if (!inputAutoFocus) modal[_focus]()
    setAttribute(modal, ModalAttributes[_open], '')
    stopImmediatePropagation(ev)
}

export async function closeModal(modal: HTMLElement): Promise<void> {
    if (!isModalOpen(modal)) return

    removeAttribute(modal, ModalAttributes[_open])
    await timeout(3E2);
    (modal as HTMLDialogElement)[_close]()

    if (querySelector(`${ElementSelector[_flyout]}[${_open}]`) == null){
        removeAttribute(getDocumentBody(), BodyAttributes[_flyoutOpen])
    }
}

export function isModalOpen(modal: HTMLElement): boolean {
    return hasAttribute(modal, _open)
}

export function focusModal(modal: HTMLElement): void {
    if (hasAttribute(modal, ModalAttributes[_focusTimeoutId])) {
        clearTimeDelayed(numberParse(getAttribute(modal, ModalAttributes[_focusTimeoutId])!, true))
        removeAttribute(modal, ModalAttributes[_focus])
    }

    setTimeDelayed(() => {
        setAttribute(modal, ModalAttributes[_focus])
        const t = setTimeDelayed(() => {
            removeAttribute(modal, ModalAttributes[_focus])
            removeAttribute(modal, ModalAttributes[_focusTimeoutId])
        }, 1000)
        setAttribute(modal, ModalAttributes[_focusTimeoutId], `${t}`)
    })
}