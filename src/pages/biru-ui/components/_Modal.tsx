import { createSignal, Show, type VoidComponent } from "solid-js"

import { _centerBottom, _tonal, _currentTarget, _filled, _leftTop, _leftCenterToBottom, _leftCenter, _leftCenterToTop, _leftBottom, _rightTop, _rightCenterToBottom, _rightCenter, _rightCenterToTop, _rightBottom, _centerTopToRight, _centerTop, _centerTopToLeft, _centerBottomToRight, _centerBottomToLeft, _centerCenterLeftTop, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterTop, _centerCenter, _centerCenterBottom, _centerCenterRightTop, _centerCenterRight, _centerCenterRightBottom, _includes } from "@/constants/string"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField, { NumberTextField } from "@/components/TextField"
import Dropdown from "@/components/Dropdown"
import Modal, { closeModal, ModalPosition, openModal } from "@/components/Modal"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
    const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
    const [dragable, setDragable] = createSignal<boolean>(false)
    const [gap, setGap] = createSignal<number>(12)
    const [inputAutoFocus, setInputAutoFocus] = createSignal<boolean>(false)
    const [important, setImportant] = createSignal<boolean>(false)
    const [padding, setPadding] = createSignal<number>(0)
    const [position, setPosition] = createSignal<ModalPosition>(ModalPosition[_centerBottom])
    const [anchor, setAnchor] = createSignal<boolean>(true)
    let modal_ref: HTMLDialogElement

    return (<Page
        title="Modal"
        description="A modal is an overlay window that appears on top of the main content, blocking user interaction with the underlying elements until it is dismissed. Modals are often used for critical tasks or to present important information.">
        <Playground>
            <Button variant={ButtonVariant[_tonal]} onClick={(ev) => openModal(ev, modal_ref, {
                anchor: anchor()? ev[_currentTarget] : undefined,
                allowHideAnchor: allowHideAnchor(),
                dragable: dragable(),
                gap: gap(),
                important: important(),
                inputAutoFocus: inputAutoFocus(),
                padding: padding(),
                position: position(),
            })}>Open modal</Button>
            <Modal ref={r => modal_ref = r} style={{width: '300px'}}>
                <div style={{padding: '16px'}}>
                    <TextField placeholder="Feedback"/>
                    <p style={{margin: '8px 0'}}>Consequat commodo sint incididunt nulla duis commodo elit enim aliquip ex occaecat eiusmod.</p>
                    <Button desktopCompact onClick={(_ev) => closeModal(modal_ref)} variant={ButtonVariant[_filled]}>Close modal</Button>
                </div>
            </Modal>
        </Playground>
        <PlaygroundOptions>
            <Dropdown
                items={[
                    [ModalPosition[_leftTop], 'Left top'],
                    [ModalPosition[_leftCenterToBottom], 'Left center to bottom'],
                    [ModalPosition[_leftCenter], 'Left center'],
                    [ModalPosition[_leftCenterToTop], 'Left center to top'],
                    [ModalPosition[_leftBottom], 'Left bottom'],
                    [ModalPosition[_rightTop], 'Right top'],
                    [ModalPosition[_rightCenterToBottom], 'Right center to bottom'],
                    [ModalPosition[_rightCenter], 'Right center'],
                    [ModalPosition[_rightCenterToTop], 'Right center to top'],
                    [ModalPosition[_rightBottom], 'Right bottom'],
                    [ModalPosition[_centerTopToRight], 'Center top to right'],
                    [ModalPosition[_centerTop], 'Center top'],
                    [ModalPosition[_centerTopToLeft], 'Center top to left'],
                    [ModalPosition[_centerBottomToRight], 'Center bottom to right'],
                    [ModalPosition[_centerBottom], 'Center bottom'],
                    [ModalPosition[_centerBottomToLeft], 'Center bottom to left'],
                    [ModalPosition[_centerCenterLeftTop], 'Center center left top'],
                    [ModalPosition[_centerCenterLeft], 'Center center left'],
                    [ModalPosition[_centerCenterLeftBottom], 'Center center left bottom'],
                    [ModalPosition[_centerCenterTop], 'Center center top'],
                    [ModalPosition[_centerCenter], 'Center center'],
                    [ModalPosition[_centerCenterBottom], 'Center center bottom'],
                    [ModalPosition[_centerCenterRightTop], 'Center center right top'],
                    [ModalPosition[_centerCenterRight], 'Center center right'],
                    [ModalPosition[_centerCenterRightBottom], 'Center center right bottom'],
                ]}
                labelText="Position"
                selectedValues={[position()]}
                onSelectedItemsChanged={(items) => setPosition(items[0][0] as ModalPosition)}
            />
            <NumberTextField style={{width: '100px'}} value={gap()} min={0} onFinalValueChanged={(v) => setGap(v)} labelText="Gap"/>
            <Show when={[
                ModalPosition[_centerTopToRight],
                ModalPosition[_centerCenterLeft],
                ModalPosition[_centerBottomToRight],
                ModalPosition[_centerTopToLeft],
                ModalPosition[_centerCenterRight],
                ModalPosition[_centerBottomToLeft],
                ModalPosition[_leftCenterToBottom],
                ModalPosition[_centerCenterLeftTop],
                ModalPosition[_centerCenterTop],
                ModalPosition[_centerCenterRightTop],
                ModalPosition[_rightCenterToBottom],
                ModalPosition[_leftCenterToTop],
                ModalPosition[_centerCenterLeftBottom],
                ModalPosition[_centerCenterBottom],
                ModalPosition[_centerCenterRightBottom],
                ModalPosition[_rightCenterToTop]
            ][_includes](position())}>
                <NumberTextField value={padding()} style={{width: '100px'}} min={0} onFinalValueChanged={(v) => setPadding(v)} labelText="Padding"/>
            </Show>
            <CheckBox value={anchor()} onValueChanged={v => setAnchor(v)}>Anchor</CheckBox>
            <CheckBox value={important()} onValueChanged={v => setImportant(v)}>Important</CheckBox>
            <CheckBox value={inputAutoFocus()} onValueChanged={v => setInputAutoFocus(v)}>Input Autofocus</CheckBox>
            <CheckBox value={dragable()} onValueChanged={v => setDragable(v)}>Dragable</CheckBox>
            <CheckBox value={allowHideAnchor()} onValueChanged={v => setAllowHideAnchor(v)}>Allow hide anchor</CheckBox>
        </PlaygroundOptions>
    </Page>)
}

export default _