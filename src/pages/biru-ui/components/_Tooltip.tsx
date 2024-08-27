import { createSignal, type VoidComponent } from "solid-js"

import { _centerTop, _tonal, _leftTop, _leftCenterToBottom, _leftCenter, _leftCenterToTop, _leftBottom, _rightTop, _rightCenterToBottom, _rightCenter, _rightCenterToTop, _rightBottom, _centerTopToRight, _centerTopToLeft, _centerBottomToRight, _centerBottom, _centerBottomToLeft, _centerCenterLeftTop, _centerCenterLeft, _centerCenterLeftBottom, _centerCenterTop, _centerCenter, _centerCenterBottom, _centerCenterRightTop, _centerCenterRight, _centerCenterRightBottom } from "@/data/string"
import { FlyoutPosition } from "@/enums/position"

import { RichTooltip, TextTooltip } from "@/components/Tooltip"
import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import { NumberTextField } from "@/components/TextField"
import Dropdown from "@/components/Dropdown"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
    const [useAnchor, setUseAnchor] = createSignal<boolean>(false)
    const [position, setPosition] = createSignal<FlyoutPosition>(FlyoutPosition[_centerTop])
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
                    <Button style={{color: 'rgb(var(--color-accent))'}} variant={ButtonVariant[_tonal]} desktopCompact>Learn more</Button>
                </>}>
                <Button>Rich tooltip</Button>
            </RichTooltip>
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
            <NumberTextField style={{width: '100px'}} value={startDelayDuration()} min={0} step={100} onFinalValueChanged={(v) => setStartDelayDuration(v)} labelText="Start delay duration"/>
            <NumberTextField style={{width: '100px'}} value={endDelayDuration()} min={0} step={100} onFinalValueChanged={(v) => setEndDelayDuration(v)} labelText="End delay duration"/>
            <CheckBox value={useAnchor()} onValueChanged={v => setUseAnchor(v)}>Use anchor</CheckBox>
        </PlaygroundOptions>
    </Page>)
}

export default _