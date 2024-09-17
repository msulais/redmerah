import { createSignal, type VoidComponent } from "solid-js"

import { _centerTop, _tonal, _leftTop, _leftCenterToBottom, _leftCenter, _leftCenterToTop, _leftBottom, _rightTop, _rightCenterToBottom, _rightCenter, _rightCenterToTop, _rightBottom, _centerTopToRight, _centerTopToLeft, _centerBottomToRight, _centerBottom, _centerBottomToLeft, _centerCenterLeftTop, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterTop, _centerCenter, _centerCenterBottom, _centerCenterRightTop, _centerCenterRight, _centerCenterRightBottom } from "@/constants/string"

import { RichTooltip, TextTooltip, TooltipPosition } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
    const [useAnchor, setUseAnchor] = createSignal<boolean>(false)
    const [position, setPosition] = createSignal<TooltipPosition>(TooltipPosition[_centerTop])
    const [gap, setGap] = createSignal<number>(40)
    const [startDelayDuration, setStartDelayDuration] = createSignal<number>(500)
    const [endDelayDuration, setEndDelayDuration] = createSignal<number>(500)

    return (<Page
        title="Tooltip"
        description="A tooltip is a small, temporary window that appears when a user hovers over an element. It provides a brief explanation or description of the element's purpose or function. Tooltips are often used to clarify the meaning of icons, buttons, or other UI elements.">
        <Playground>
            <TextTooltip
                text="This is tooltip"
                endDelayDuration={endDelayDuration()}
                gap={gap()}
                position={position()}
                startDelayDuration={startDelayDuration()}
                useAnchor={useAnchor()}>
                <Button>
                    Hover me please
                    <TextTooltip
                        text="This is icon"
                        endDelayDuration={endDelayDuration()}
                        gap={gap()}
                        position={position()}
                        startDelayDuration={startDelayDuration()}
                        useAnchor={useAnchor()}>
                        <Icon code={0xE4B2}/>
                    </TextTooltip>
                </Button>
            </TextTooltip>
            <RichTooltip
                style={{width: '240px'}}
                endDelayDuration={endDelayDuration()}
                gap={gap()}
                position={position()}
                startDelayDuration={startDelayDuration()}
                useAnchor={useAnchor()}
                tooltip={<>
                    <p style={{"margin-bottom": '8px'}}>Ullamco anim in magna ea ut labore velit ex occaecat elit voluptate laboris.</p>
                    <Button style={{color: 'rgb(var(--color-accent))'}} variant={ButtonVariant[_tonal]}>Learn more</Button>
                </>}>
                <Button>Rich tooltip</Button>
            </RichTooltip>
        </Playground>
        <PlaygroundOptions>
            <Dropdown
                items={[
                    [TooltipPosition[_leftTop], 'Left top'],
                    [TooltipPosition[_leftCenterToBottom], 'Left center to bottom'],
                    [TooltipPosition[_leftCenter], 'Left center'],
                    [TooltipPosition[_leftCenterToTop], 'Left center to top'],
                    [TooltipPosition[_leftBottom], 'Left bottom'],
                    [TooltipPosition[_rightTop], 'Right top'],
                    [TooltipPosition[_rightCenterToBottom], 'Right center to bottom'],
                    [TooltipPosition[_rightCenter], 'Right center'],
                    [TooltipPosition[_rightCenterToTop], 'Right center to top'],
                    [TooltipPosition[_rightBottom], 'Right bottom'],
                    [TooltipPosition[_centerTopToRight], 'Center top to right'],
                    [TooltipPosition[_centerTop], 'Center top'],
                    [TooltipPosition[_centerTopToLeft], 'Center top to left'],
                    [TooltipPosition[_centerBottomToRight], 'Center bottom to right'],
                    [TooltipPosition[_centerBottom], 'Center bottom'],
                    [TooltipPosition[_centerBottomToLeft], 'Center bottom to left'],
                    [TooltipPosition[_centerCenterLeftTop], 'Center center left top'],
                    [TooltipPosition[_centerCenterLeft], 'Center center left'],
                    [TooltipPosition[_centerCenterLeftBottom], 'Center center left bottom'],
                    [TooltipPosition[_centerCenterTop], 'Center center top'],
                    [TooltipPosition[_centerCenter], 'Center center'],
                    [TooltipPosition[_centerCenterBottom], 'Center center bottom'],
                    [TooltipPosition[_centerCenterRightTop], 'Center center right top'],
                    [TooltipPosition[_centerCenterRight], 'Center center right'],
                    [TooltipPosition[_centerCenterRightBottom], 'Center center right bottom'],
                ]}
                labelText="Position"
                selectedValues={[position()]}
                onSelectedItemsChanged={(items) => setPosition(items[0][0] as TooltipPosition)}
            />
            <NumberTextField style={{width: '100px'}} value={gap()} min={0} onFinalValueChanged={(v) => setGap(v)} labelText="Gap"/>
            <NumberTextField style={{width: '100px'}} value={startDelayDuration()} min={0} step={100} onFinalValueChanged={(v) => setStartDelayDuration(v)} labelText="Start delay duration"/>
            <NumberTextField style={{width: '100px'}} value={endDelayDuration()} min={0} step={100} onFinalValueChanged={(v) => setEndDelayDuration(v)} labelText="End delay duration"/>
            <CheckBox value={useAnchor()} onValueChanged={v => setUseAnchor(v)}>Use anchor</CheckBox>
        </PlaygroundOptions>
    </Page>)
}

export default _