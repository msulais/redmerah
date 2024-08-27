import { createSignal, Show, type VoidComponent } from "solid-js"

import { _centerTop, _tonal, _filled, _centerBottom, _leftBottom, _leftTop, _rightBottom, _rightTop } from "@/data/string"

import Icon from "@/components/Icon"
import Button, { ButtonVariant, IconButton } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown from "@/components/Dropdown"
import Toast, { closeToast, openToast, ToastPosition } from "@/components/Toast"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
    const [header, setHeader] = createSignal<boolean>(false)
    const [actions, setActions] = createSignal<boolean>(false)
    const [leading, setLeading] = createSignal<boolean>(true)
    const [trailing, setTrailing] = createSignal<boolean>(false)
    const [content, setContent] = createSignal<boolean>(true)
    const [autoClose, setAutoClose] = createSignal<boolean>(true)
    const [duration, setDuration] = createSignal<number>(5000)
    const [position, setPosition] = createSignal<ToastPosition>(ToastPosition[_centerTop])
    let toast_ref: HTMLDivElement
    return (<Page
        title="Toast"
        description="A toast is a lightweight notification that appears briefly at the bottom or top of the screen. It provides users with short messages or alerts without interrupting their primary workflow. Toasts are typically used to display success messages, errors, or informational updates.">
        <Playground>
            <Button 
                variant={ButtonVariant[_tonal]}
                onClick={() => openToast(toast_ref, {
                    autoClose: autoClose(),
                    duration: duration(),
                    position: position()
                })}>
                Open toast
            </Button>
            <Toast 
                ref={r => toast_ref = r}
                header={<Show when={header()}>Warning</Show>}
                trailing={<Show when={trailing()}>
                    <IconButton code={0xEED3} onClick={() => closeToast(toast_ref)}/>
                    <IconButton code={0xEE3B} onClick={() => closeToast(toast_ref)}/>
                </Show>}
                actions={<Show when={actions()}>
                    <Button variant={ButtonVariant[_tonal]} onClick={() => closeToast(toast_ref)}>Close</Button>
                    <Button variant={ButtonVariant[_tonal]} onClick={() => closeToast(toast_ref)}>Reject</Button>
                    <Button variant={ButtonVariant[_filled]} onClick={() => closeToast(toast_ref)}>Accept</Button>
                </Show>}
                leading={<Show when={leading()}><Icon code={0xECB6}/></Show>}>
                <Show when={content()}>
                    Labore ipsum pariatur ea aliquip ex laboris dolor ea in occaecat in. Officia cillum cupidatat est dolor sit.
                </Show>
            </Toast>
        </Playground>
        <PlaygroundOptions>
            <Show when={autoClose()}>
                <NumberTextField labelText="Duration" style={{width: '100px'}} value={duration()} step={100} min={100} onFinalValueChanged={v => setDuration(v)} trailing="ms"/>
            </Show>
            <Dropdown 
                labelText="Position"
                items={[
                    [ToastPosition[_centerBottom], 'Center bottom'],
                    [ToastPosition[_centerTop], 'Center top'],
                    [ToastPosition[_leftBottom], 'Left bottom'],
                    [ToastPosition[_leftTop], 'Left top'],
                    [ToastPosition[_rightBottom], 'Right bottom'],
                    [ToastPosition[_rightTop], 'Right top'],
                ]}
                selectedValues={[position()]}
                onSelectedItemsChanged={(items) => setPosition(items[0][0] as ToastPosition)}
            />
            <CheckBox value={header()} onValueChanged={v => setHeader(v)}>Header</CheckBox>
            <CheckBox value={actions()} onValueChanged={v => setActions(v)}>Actions</CheckBox>
            <CheckBox value={leading()} onValueChanged={v => setLeading(v)}>Leading</CheckBox>
            <CheckBox value={trailing()} onValueChanged={v => setTrailing(v)}>Trailing</CheckBox>
            <CheckBox value={content()} onValueChanged={v => setContent(v)}>Content</CheckBox>
            <CheckBox value={autoClose()} onValueChanged={v => setAutoClose(v)}>Auto close</CheckBox>
        </PlaygroundOptions>
    </Page>)
}

export default _