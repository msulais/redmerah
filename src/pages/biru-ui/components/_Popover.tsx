import { createSignal, Show, type VoidComponent } from "solid-js"

import { _centerBottom, _tonal, _currentTarget, _filled, _leftTop, _leftCenterToBottom, _leftCenter, _leftCenterToTop, _leftBottom, _rightTop, _rightCenterToBottom, _rightCenter, _rightCenterToTop, _rightBottom, _centerTopToRight, _centerTop, _centerTopToLeft, _centerBottomToRight, _centerBottomToLeft, _centerCenterLeftTop, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterTop, _centerCenter, _centerCenterBottom, _centerCenterRightTop, _centerCenterRight, _centerCenterRightBottom, _includes } from "@/data/string"
import { FlyoutPosition } from "@/enums/position"

import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import TextField, { NumberTextField } from "@/components/TextField"
import Dropdown from "@/components/Dropdown"
import Popover, { closePopover, openPopover } from "@/components/Popover"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
    const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
    const [dragable, setDragable] = createSignal<boolean>(false)
    const [gap, setGap] = createSignal<number>(12)
    const [padding, setPadding] = createSignal<number>(0)
    const [position, setPosition] = createSignal<FlyoutPosition>(FlyoutPosition[_centerBottom])
    const [anchor, setAnchor] = createSignal<boolean>(true)
    const [manualDismiss, setManualDismiss] = createSignal<boolean>(false)
    let popover_ref: HTMLDivElement
    return (<Page
        title="Popover"
        description="A popover is a small, temporary window that appears when a user interacts with an element (e.g., hovers over a button). It provides additional information, options, or tools related to the element. Popover content can be triggered by hover, click, or focus.">
        <Playground>
            <Button variant={ButtonVariant[_tonal]} onClick={(ev) => openPopover(ev, popover_ref, {
                anchor: anchor()? ev[_currentTarget] : undefined,
                allowHideAnchor: allowHideAnchor(),
                dragable: dragable(),
                gap: gap(),
                padding: padding(),
                position: position(),
                manualDismiss: manualDismiss()
            })}>Open popover</Button>
            <Popover ref={r => popover_ref = r} style={{width: '300px'}}>
                <div style={{padding: '16px'}}>
                    <TextField placeholder="Feedback"/>
                    <p style={{margin: '8px 0'}}>Consequat commodo sint incididunt nulla duis commodo elit enim aliquip ex occaecat eiusmod.</p>
                    <Button onClick={(ev) => closePopover(popover_ref)} variant={ButtonVariant[_filled]} desktopCompact>Close popover</Button>
                </div>
            </Popover>
        </Playground>
        <PlaygroundOptions>
            <Dropdown
                items={[
                    [FlyoutPosition[_leftTop], 'Left top'],
                    [FlyoutPosition[_leftCenterToBottom], 'Left center to bottom'],
                    [FlyoutPosition[_leftCenter], 'Left center'],
                    [FlyoutPosition[_leftCenterToTop], 'Left center to top'],
                    [FlyoutPosition[_leftBottom], 'Left bottom'],
                    [FlyoutPosition[_rightTop], 'Right top'],
                    [FlyoutPosition[_rightCenterToBottom], 'Right center to bottom'],
                    [FlyoutPosition[_rightCenter], 'Right center'],
                    [FlyoutPosition[_rightCenterToTop], 'Right center to top'],
                    [FlyoutPosition[_rightBottom], 'Right bottom'],
                    [FlyoutPosition[_centerTopToRight], 'Center top to right'],
                    [FlyoutPosition[_centerTop], 'Center top'],
                    [FlyoutPosition[_centerTopToLeft], 'Center top to left'],
                    [FlyoutPosition[_centerBottomToRight], 'Center bottom to right'],
                    [FlyoutPosition[_centerBottom], 'Center bottom'],
                    [FlyoutPosition[_centerBottomToLeft], 'Center bottom to left'],
                    [FlyoutPosition[_centerCenterLeftTop], 'Center center left top'],
                    [FlyoutPosition[_centerCenterLeft], 'Center center left'],
                    [FlyoutPosition[_centerCenterLeftBottom], 'Center center left bottom'],
                    [FlyoutPosition[_centerCenterTop], 'Center center top'],
                    [FlyoutPosition[_centerCenter], 'Center center'],
                    [FlyoutPosition[_centerCenterBottom], 'Center center bottom'],
                    [FlyoutPosition[_centerCenterRightTop], 'Center center right top'],
                    [FlyoutPosition[_centerCenterRight], 'Center center right'],
                    [FlyoutPosition[_centerCenterRightBottom], 'Center center right bottom'],
                ]}
                labelText="Position"
                selectedValues={[position()]}
                onSelectedItemsChanged={(items) => setPosition(items[0][0] as FlyoutPosition)}
            />
            <NumberTextField style={{width: '100px'}} value={gap()} min={0} onFinalValueChanged={(v) => setGap(v)} labelText="Gap"/>
            <Show when={[
                FlyoutPosition[_centerTopToRight],
                FlyoutPosition[_centerCenterLeft],
                FlyoutPosition[_centerBottomToRight],
                FlyoutPosition[_centerTopToLeft],
                FlyoutPosition[_centerCenterRight],
                FlyoutPosition[_centerBottomToLeft],
                FlyoutPosition[_leftCenterToBottom],
                FlyoutPosition[_centerCenterLeftTop],
                FlyoutPosition[_centerCenterTop],
                FlyoutPosition[_centerCenterRightTop],
                FlyoutPosition[_rightCenterToBottom],
                FlyoutPosition[_leftCenterToTop],
                FlyoutPosition[_centerCenterLeftBottom],
                FlyoutPosition[_centerCenterBottom],
                FlyoutPosition[_centerCenterRightBottom],
                FlyoutPosition[_rightCenterToTop]
            ][_includes](position())}>
                <NumberTextField value={padding()} style={{width: '100px'}} min={0} onFinalValueChanged={(v) => setPadding(v)} labelText="Padding"/>
            </Show>
            <CheckBox value={anchor()} onValueChanged={v => setAnchor(v)}>Anchor</CheckBox>
            <CheckBox value={dragable()} onValueChanged={v => setDragable(v)}>Dragable</CheckBox>
            <CheckBox value={allowHideAnchor()} onValueChanged={v => setAllowHideAnchor(v)}>Allow hide anchor</CheckBox>
            <CheckBox value={manualDismiss()} onValueChanged={v => setManualDismiss(v)}>Manual dismiss</CheckBox>
        </PlaygroundOptions>
    </Page>)
}

export default _