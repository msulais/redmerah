import { createSignal, Show, type VoidComponent } from "solid-js"

import { Page, Playground, PlaygroundOptions } from "../_Body"
import Button, { ButtonVariant } from "@/components/Button"
import { _centerBottom, _centerBottomToLeft, _centerBottomToRight, _centerCenter, _centerCenterBottom, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterLeftTop, _centerCenterRight, _centerCenterRightBottom, _centerCenterRightTop, _centerCenterTop, _centerTop, _centerTopToLeft, _centerTopToRight, _currentTarget, _includes, _leftBottom, _leftCenter, _leftCenterToBottom, _leftCenterToTop, _leftTop, _rightBottom, _rightCenter, _rightCenterToBottom, _rightCenterToTop, _rightTop, _tonal } from "@/data/string"
import EmojiPicker, { openEmojiPicker } from "@/components/EmojiPicker"
import type { Emoji } from "@/types/emoji"
import Icon from "@/components/Icon"
import EmojiC from "@/components/Emoji"
import { FlyoutPosition } from "@/enums/position"
import CheckBox from "@/components/CheckBox"
import Dropdown from "@/components/Dropdown"
import { NumberTextField } from "@/components/TextField"

const _: VoidComponent = () => {
    const [allowHideAnchor, setAllowHideAnchor] = createSignal<boolean>(true)
    const [dragable, setDragable] = createSignal<boolean>(false)
    const [multiple, setMultiple] = createSignal<boolean>(false)
    const [gap, setGap] = createSignal<number>(12)
    const [important, setImportant] = createSignal<boolean>(false)
    const [padding, setPadding] = createSignal<number>(0)
    const [position, setPosition] = createSignal<FlyoutPosition>(FlyoutPosition[_centerBottom])
    const [anchor, setAnchor] = createSignal<boolean>(true)
    const [showCloseButton, setShowCloseButton] = createSignal<boolean>(false)
    const [emoji, setEmoji] = createSignal<Emoji | null>(null)
    let emojiPicker_ref: HTMLDialogElement
    return (<Page
        title="EmojiPicker"
        description="An EmojiPicker is a UI element that allows users to select and insert emojis into text fields or other input areas. It typically presents a grid of emojis that can be searched, filtered, or categorized for easy selection.">
        <Playground>
            <Button 
                variant={ButtonVariant[_tonal]}
                onClick={ev => openEmojiPicker(ev, emojiPicker_ref, { 
                    anchor: anchor()? ev[_currentTarget] : undefined,
                    allowHideAnchor: allowHideAnchor(),
                    dragable: dragable(),
                    gap: gap(),
                    important: important(),
                    padding: padding(),
                    position: position(),
                })}>
                <Show when={emoji() != null} fallback={<><Icon code={0xE747}/>Pick emoji</>}>
                    <EmojiC emoji={emoji()![0]}/>
                    {emoji()![1]}
                </Show>
            </Button>
            <EmojiPicker 
                ref={r => emojiPicker_ref = r} 
                onSelectEmoji={(emoji, name) => setEmoji([emoji, name])}
                multiple={multiple()}
                showCloseButton={showCloseButton()}
            />
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
            <CheckBox value={important()} onValueChanged={v => setImportant(v)}>Important</CheckBox>
            <CheckBox value={dragable()} onValueChanged={v => setDragable(v)}>Dragable</CheckBox>
            <CheckBox value={allowHideAnchor()} onValueChanged={v => setAllowHideAnchor(v)}>Allow hide anchor</CheckBox>
            <CheckBox value={multiple()} onValueChanged={v => setMultiple(v)}>Multiple</CheckBox>
            <CheckBox value={showCloseButton()} onValueChanged={v => setShowCloseButton(v)}>Show close button</CheckBox>
        </PlaygroundOptions>
    </Page>)
}

export default _