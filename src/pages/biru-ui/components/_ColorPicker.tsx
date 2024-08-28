import { Show, type VoidComponent, createSignal } from "solid-js"

import type { HEXColor } from "@/types/color"
import { _tonal, _currentTarget } from "@/data/string"

import Icon from "@/components/Icon"
import Button, { ButtonVariant } from "@/components/Button"
import CheckBox from "@/components/CheckBox"
import ColorPicker, { openColorPicker } from "@/components/ColorPicker"
import { Page, Playground, PlaygroundOptions } from "../_Body"

const _: VoidComponent = () => {
    const [disabledOpacityControl, setDisabledOpacityControl] = createSignal<boolean>(false)
    const [disabledColorControl, setDisabledColorControl] = createSignal<boolean>(false)
    const [color, setColor] = createSignal<HEXColor | null>(null)
    let colorPicker_ref: HTMLDialogElement
    return (<Page
        title="ColorPicker"
        description="A color picker is a UI element that allows users to select a color from a defined color space. It typically provides a visual representation of colors and offers various methods for color selection, such as palettes, sliders, or color wheels.">
        <Playground>
            <Button 
                variant={ButtonVariant[_tonal]}
                onClick={(ev) => openColorPicker(ev, colorPicker_ref, {
                    anchor: ev[_currentTarget],
                    inputAutoFocus: false,
                    gap: 8,
                })}>
                <Icon style={{color: color() ?? '#FF0000'}} code={0xE408} filled/>
                <Show when={color()} fallback="Select color">{color()!}</Show>
            </Button>
            <ColorPicker 
                ref={r => colorPicker_ref = r}
                onSelectColor={(color) => setColor(color)}
                disabledColorControl={disabledColorControl()}
                disabledOpacityControl={disabledOpacityControl()}
            />
        </Playground>
        <PlaygroundOptions>
            <CheckBox value={disabledOpacityControl()} onValueChanged={d => setDisabledOpacityControl(d)}>Disable opacity</CheckBox>
            <CheckBox value={disabledColorControl()} onValueChanged={d => setDisabledColorControl(d)}>Disable color (hue only)</CheckBox>
        </PlaygroundOptions>
    </Page>)
}

export default _