import { hasAttribute, removeAttribute, setAttribute } from "./attributes";
import { BodyAttributes, ModalAttributes } from "@/enums/attributes";
import { querySelector } from "./element";
import { stopImmediatePropagation } from "./event";
import { ElementSelector } from "@/enums/selector";
import { timeout } from "./timeout";
import { _body, _flyoutOpen, _showModal, _open, _close, _flyout } from "@/data/string";
import { getDocumentBody } from "@/data/window";

export async function openModal(ev: Event, modal: HTMLElement): Promise<void> {
    if (isModalOpen(modal)) await closeModal(modal)

    setAttribute(getDocumentBody(), BodyAttributes[_flyoutOpen], '');
    (modal as HTMLDialogElement)[_showModal]()
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